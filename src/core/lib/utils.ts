import * as anchor from '@coral-xyz/anchor';
import { Connection, Transaction, SystemProgram, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { burn, getAccount, getAssociatedTokenAddressSync } from '@solana/spl-token'
import { Pixel, IDL } from './pixel_type';
import { SOLANA_PIXEL_PROGRAMID, ADMIN_KEYPAIR, JITO_TIP_LAMPORTS } from './constants'
import { Raydium, TxVersion, AMM_V4, WSOLMint, OPEN_BOOK_PROGRAM, FEE_DESTINATION_ID } from '@raydium-io/raydium-sdk-v2'
import BN from 'bn.js'
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import {sha256 } from '@noble/hashes/sha256'

const endpoints = [
  'https://mainnet.block-engine.jito.wtf/api/v1/bundles',
  'https://amsterdam.mainnet.block-engine.jito.wtf/api/v1/bundles',
  'https://frankfurt.mainnet.block-engine.jito.wtf/api/v1/bundles',
  'https://ny.mainnet.block-engine.jito.wtf/api/v1/bundles',
  'https://tokyo.mainnet.block-engine.jito.wtf/api/v1/bundles',
]

const jitpTipAccounts = [
  "3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT",
  "Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY",
  "ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt",
  "ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49",
  "DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh",
  "DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL",
  "HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe",
  "96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5"
]

const getRandomValidatorKey = (): PublicKey => {
  const randomValidator = jitpTipAccounts[Math.floor(Math.random() * jitpTipAccounts.length)]
  return new PublicKey(randomValidator)
}

export function getEndTime() {
  const now = new Date()
  const currentDay = now.getUTCDay()
  if ((currentDay == 3 && now.getUTCHours() < 14) ||
      (currentDay == 0 && now.getUTCHours() >= 14) ||
      (currentDay == 1 || currentDay == 2)
  ) {
    //endtime: Wed 2PM
    const daysUntilNextWednesday = 3 - currentDay
    now.setUTCDate(now.getUTCDate() + daysUntilNextWednesday)
  } else {
    //endtime: Sun 2PM
    const daysUntilNextSunday = ((7 - currentDay) % 7)
    now.setUTCDate(now.getUTCDate() + daysUntilNextSunday)
  }
  now.setUTCHours(14,0,0,0);
  return now.getTime()
}
export function getConnection() {
  return new Connection(process.env.SOLANA_RPC, 'confirmed');
}

export function getProgram(): anchor.Program<Pixel> {
  const connection = getConnection()
  const wallet = new anchor.Wallet(ADMIN_KEYPAIR)
  const provider = new anchor.AnchorProvider(connection, wallet, {commitment: 'confirmed'})
  const program = new anchor.Program<Pixel>(IDL, SOLANA_PIXEL_PROGRAMID, provider)
  return program;
}

let raydium: Raydium | undefined
const cluster = 'mainnet' // 'mainnet' | 'devnet'
const owner = ADMIN_KEYPAIR;
const txVersion = TxVersion.V0 // or TxVersion.LEGACY

export const initSdk = async (params?: { loadToken?: boolean }) => {
  if (raydium) return raydium;
  const connection = getConnection();
  console.warn('using free rpc node might cause unexpected error, strongly suggest uses paid rpc node')
  console.log(`connect to rpc ${connection.rpcEndpoint} in ${cluster}`)
  raydium = await Raydium.load({
    owner,
    connection,
    cluster,
    disableFeatureCheck: true,
    disableLoadToken: !params?.loadToken,
    blockhashCommitment: 'finalized',
  })
  return raydium;
}
export async function createPool(
  tokenMint: PublicKey,
  aAmount: number,
  bAmount: number
){
  const raydium = await initSdk({ loadToken: true });
  const { transactions } = await raydium.liquidity.createMarketAndPoolV4({
    programId: AMM_V4,
    baseMintInfo: {
      mint: WSOLMint,
      decimals: 9
    },
    quoteMintInfo: {
      mint: tokenMint,
      decimals: 9
    },
    baseAmount: new BN(aAmount),
    quoteAmount: new BN(bAmount),
    startTime: 0,
    lowestFeeMarket: true,
    ownerInfo: {
      useSOLBalance: true
    },
    associatedOnly: false,
    marketProgram: OPEN_BOOK_PROGRAM,
    feeDestinationId: FEE_DESTINATION_ID,
    txVersion: TxVersion.V0,
    assignSeed: 'pixel',
  })

  const transferIns = SystemProgram.transfer({
    fromPubkey: owner.publicKey,
    toPubkey: getRandomValidatorKey(),
    lamports: JITO_TIP_LAMPORTS,
  })
  const transferTx = new Transaction()
  transferTx.add(transferIns)
  transferTx.recentBlockhash = transactions[0].message.recentBlockhash
  transferTx.feePayer = owner.publicKey
  const versionedTransferTx = new VersionedTransaction(transferTx.compileMessage())
  transactions.push(versionedTransferTx)

  transactions.forEach(tx => tx.sign([owner]))
  const jitoTxsignature = bs58.encode(versionedTransferTx.signatures[0])

  //jito
  const encodedSignedTransactions = transactions.map( transaction => bs58.encode(transaction.serialize()))



  try{
    const requests = endpoints.map((url) =>
      fetch( url,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "sendBundle",
            "params": [
              encodedSignedTransactions
            ]
          })
        }
      )
    )
    const results = await Promise.all(requests.map((p) => p.catch((e) => e)))
    const successfulResults = results.filter((result) => !(result instanceof Error))
    if (successfulResults.length > 0) {
      const confirmed = await getConnection().confirmTransaction(jitoTxsignature, 'confirmed')
      return !confirmed.value.err
    }
    return false
  }catch(e){
    console.log(e)
    return false
  }
}

export async function createBurn(connection: Connection, tokenMint: PublicKey): Promise<boolean> {
  //marketId
  const marketId = new PublicKey(sha256(Buffer.concat([
    ADMIN_KEYPAIR.publicKey.toBuffer(),
    Buffer.from(btoa(`${WSOLMint.toBase58().slice(0,7)}-${tokenMint.toBase58().slice(0,7)}-pixel-market`).slice(0,32)),
    OPEN_BOOK_PROGRAM.toBuffer()
  ])))
  const [lpMint] = PublicKey.findProgramAddressSync(
    [
      AMM_V4.toBuffer(),
      marketId.toBuffer(),
      Buffer.from("lp_mint_associated_seed", "utf-8")
    ],
    AMM_V4
  )
  const tokenAccount = getAssociatedTokenAddressSync(lpMint, ADMIN_KEYPAIR.publicKey)
  const tokenAccountInfo = await getAccount(connection, tokenAccount)
  const burnAmount = tokenAccountInfo.amount
  try {
    const hash = await burn(connection, ADMIN_KEYPAIR, tokenAccount, lpMint, ADMIN_KEYPAIR, burnAmount)
    console.log('--------burn-token-hash:', hash)
    return true
  } catch {
    console.log('--------failed to burn:')
    return false
  }
}
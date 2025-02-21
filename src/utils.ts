import { PublicKey, TransactionInstruction, SystemProgram, TransactionMessage, VersionedTransaction, Signer } from '@solana/web3.js'
import { JITO_TIP_LAMPORTS } from './core/lib/constants'
import { Connection } from '@solana/web3.js'
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'

const jitoEndpoints = [
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

export const getJitoTransferJito = (payer: PublicKey):TransactionInstruction => {
  const transferJitoIns = SystemProgram.transfer({
    fromPubkey: payer,
    toPubkey: getRandomValidatorKey(),
    lamports: JITO_TIP_LAMPORTS,
  })
  return transferJitoIns
}

export const sendTransactionWithJito = async (conn: Connection, tx: VersionedTransaction) => {
  const encodedSignedTransaction = bs58.encode(tx.serialize())
  const jitoTxsignature = bs58.encode(tx.signatures[0])
  try{
    const requests = jitoEndpoints.map((url) =>
      fetch( url,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "sendBundle",
            "params": [
              [encodedSignedTransaction]
            ]
          })
        }
      )
    )
    const results = await Promise.all(requests.map((p) => p.catch((e) => e)))
    const successfulResults = results.filter((result) => !(result instanceof Error))
    if (successfulResults.length > 0) {
      const confirmed = await conn.confirmTransaction(jitoTxsignature, 'confirmed')
      return !confirmed.value.err
    }
    return false
  }catch(e){
    console.log(e)
    return false
  }
}

export const transferTxToJito = async (
  ins: TransactionInstruction[],
  latestBlockHash: string,
  payer: Signer,
  connection: Connection,
): Promise<boolean> => {
  const messageV0 = new TransactionMessage({
    payerKey: payer.publicKey,
    recentBlockhash: latestBlockHash,
    instructions: ins
  }).compileToV0Message()
  const versionTx = new VersionedTransaction(messageV0)
  versionTx.sign([payer])
  return await sendTransactionWithJito(connection, versionTx)
}
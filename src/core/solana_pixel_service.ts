import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { RedisService } from './redis.service'
import { Connection, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from '@solana/web3.js'
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAccount, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { SOLANA_PIXEL_PROGRAMID, ADMIN_KEYPAIR } from './lib/constants'
import * as anchor from '@coral-xyz/anchor'
import { IDL } from './lib/pixel_type'
import { getProgram, createPool, createBurn } from './lib/utils'
import { SocketIoService } from './socket.service'
import { TokenService } from './token.service'
import { getJitoTransferJito, transferTxToJito } from 'src/utils'

@Injectable()
export class SolanaPixelService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly socketIoService: SocketIoService,
    private readonly tokenService: TokenService
  ) {}

  async syncCreateLaydiumPool() {
    //
    // get token list not reached SOL and passed 30 days
    const tokens = await this.prisma.token.findMany({
      where: {
        is_launched: false,
        is_withdraw: false,
        is_completed: true,
      },
    })
    const AppProgram = getProgram()
    const connection = new Connection(process.env.SOLANA_RPC, 'confirmed')
    const authority = ADMIN_KEYPAIR.publicKey

    for (let i = 0; i< tokens.length; i++) {
      const token = tokens[i]
      //withdraw token
      //withdraw SOL from bondingCurve
      const tokenMint = new PublicKey(token.mint)
      const [ config ] = PublicKey.findProgramAddressSync(
        [Buffer.from("config")],
        AppProgram.programId
      )
      const [ bondingCurve ] = PublicKey.findProgramAddressSync(
        [Buffer.from("bonding_curve"), tokenMint.toBuffer()],
        AppProgram.programId
      )
      const associtedBondingCurve = getAssociatedTokenAddressSync(tokenMint, bondingCurve, true)
      const associtedAdminTokenAccount = await getAssociatedTokenAddressSync(tokenMint, authority)
      //get BondingCurve Info
      const bondingCurveInfo = await AppProgram.account.bondingCurve.fetch(bondingCurve)
      if (!bondingCurveInfo.complete) continue
      // Withdraw SOL and token.
      // const solAmount = await connection.getBalance(bondingCurve)

      // if (solAmount < 100000000000){ //100SOL
      //   continue;
      // }
      const tokenAmount = Number((await getAccount(connection, associtedBondingCurve)).amount)
      //withdraw
      try {
        // transfer tx to jito
        const withdrawIns = await AppProgram.methods.withdraw().accounts({
          authority,
          tokenMint,
          config,
          bondingCurve,
          associtedBondingCurve,
          associtedAdminTokenAccount: associtedAdminTokenAccount,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        }).instruction()

        let latestBlockhash
        try {
          latestBlockhash = await AppProgram.provider.connection.getLatestBlockhash('confirmed')
        } catch(e) {
          console.log('Failed to get latest blockhash')
          continue
        }
        const jitoTransferIns = getJitoTransferJito(authority)
        //2SOL to creator
        const transferToCreator = SystemProgram.transfer({
          fromPubkey: authority,
          toPubkey: new PublicKey(token.creator),
          lamports: 2000000000, //2SOL
        })

        const isWithdraw = await transferTxToJito([jitoTransferIns, withdrawIns, transferToCreator], latestBlockhash, ADMIN_KEYPAIR, AppProgram.provider.connection)

        if (!isWithdraw) {
          continue
        }
        // updated db
        await this.prisma.token.update({
          where: {
            id: token.id
          },
          data: {
            is_withdraw: true
          }
        })

        const createdPool = await createPool(
          tokenMint,
          80000000000, //80SOL
          tokenAmount
        )
        if (!createdPool) continue

        await this.prisma.token.update({
          where: {
            id: token.id
          },
          data: {
            is_launched: true,
          }
        })
      } catch(e) {
        // failed to withdraw
        continue
      }
      //burn lp token
      //burn tx
      const isBurn = await createBurn(connection, tokenMint)
      if ( isBurn ) {
        await this.prisma.token.update({
          where: {
            id: token.id
          },
          data: {
            is_burn: true,
          }
        })
      } else {
        await this.prisma.token.update({
          where: {
            id: token.id
          },
          data: {
            is_burn: false,
          }
        })
      }
    }
  }

  async syncPixelEvents() {
    const programId = new PublicKey(SOLANA_PIXEL_PROGRAMID);
    let lastSignature = await this.redis.get(
      `last-synced-timestamp-solana-pixel-events-${programId.toString()}`,
    );
    const connection = new Connection(process.env.SOLANA_RPC, 'confirmed');
    const totalTxs = [];
    let tempLastSignature = ''
    const limit = 10
    while (true){
      const txs = await connection.getSignaturesForAddress(
        programId,
        !lastSignature && !tempLastSignature // lastSignature == "" && tempLastSignature == ""
        ? {
            limit,
          }
        : !tempLastSignature // lastSignature !== "" && tempLastSignature == ""
          ? {
              until: lastSignature,
              limit,
            }
          : !lastSignature //lastSignature == "" & tempLastSignature != ""
            ? {
              before: tempLastSignature,
              limit,
            }
            : { //lastSignature !== "" & tempLastSignature != ""
              until: lastSignature,
              before: tempLastSignature,
              limit,
            }
      );
      totalTxs.push(...txs)
      if (txs.length < limit){
        break;
      }else {
        tempLastSignature = txs[txs.length - 1].signature
      }
    }
    if (totalTxs.length < 1) return;
    totalTxs.reverse()

    // let sortedTxs = txs.sort((a, b) => a.blockTime - b.blockTime);
    for (let i = 0; i< totalTxs.length; i ++ ) {
      const tx = totalTxs[i]
      if (tx.err) {
        continue
      }
      const txSig = tx.signature;
      const events = await this.getTransactionLog(
        txSig,
        programId,
        connection,
        IDL as anchor.Idl,
      );
      for (const event of events) {
        if (event.name === 'CreateTokenEvent') {
          await this.createTokenEvent(event, tx.blockTime);
          await this.redis.set(
            `last-synced-timestamp-solana-pixel-events-${programId.toString()}`,
            txSig,
          )
        } else if (event.name === 'BuyEvent') {
          await this.solanaBuyTokenEvent(
            event,
            tx.blockTime,
            tx.signature,
          );
          await this.redis.set(
            `last-synced-timestamp-solana-pixel-events-${programId.toString()}`,
            txSig,
          );
        } else if (event.name === 'SellEvent') {
          await this.solanaSellTokenEvent(
            event,
            tx.blockTime,
            tx.signature,
          );
          await this.redis.set(
            `last-synced-timestamp-solana-pixel-events-${programId.toString()}`,
            txSig,
          );
        } else if (event.name === 'StakeEvent') {
          await this.solanaStakeEvent(
            event,
            tx.blockTime,
            tx.signature,
          );
          await this.redis.set(
            `last-synced-timestamp-solana-pixel-events-${programId.toString()}`,
            txSig,
          );
        } else if (event.name === 'UnstakeEvent') {
          await this.solanaUnstakeEvent(
            event,
            tx.blockTime,
            tx.signature,
          );
          await this.redis.set(
            `last-synced-timestamp-solana-pixel-events-${programId.toString()}`,
            txSig,
          );
        }
      }
    }
  }

  async getTransactionLog(
    txSig: string,
    programId: PublicKey,
    connection: Connection,
    idl: anchor.Idl,
  ) {
    const txDetails = await connection.getTransaction(txSig, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion:0
    });
    const eventParser = new anchor.EventParser(
      programId,
      new anchor.BorshCoder(idl),
    );
    const logs = txDetails.meta.logMessages;
    const events = eventParser.parseLogs(logs);
    return events;
  }

  async createTokenEvent(event: anchor.Event, blockTime: number) {
    const tokenMint = event.data.mint.toString();
    const tokenName = event.data.tokenName.toString();
    const tokenSymbol = event.data.tokenSymbol.toString();
    const tokenUri = event.data.tokenUri.toString();
    const tokenCreator = event.data.creator.toString();

    let token = await this.prisma.token.findUnique({
      where: {
        mint: tokenMint
      },
    });
    if (token) {
      return;
    }
    let resData;
    try{
      const res = await fetch(tokenUri)
      resData = await res.json()
    }catch(e){
      console.log('---failed to parse tokenUri')
    }
    let desc = "";
    let imageUri = "";
    let telegram = "";
    let twitter = "";
    let website = "";
    if (resData) {
      desc = resData.description;
      imageUri = resData.image;
      telegram = resData.telegram;
      twitter = resData.twitter;
      website = resData.website;
    }
    await this.prisma.token.create({
      data: {
        mint: tokenMint,
        name:tokenName,
        symbol: tokenSymbol,
        desc,
        telegram,
        twitter,
        website,
        created_at: new Date(blockTime * 1000), //ms
        image_uri: imageUri,
        uri: tokenUri,
        creator: tokenCreator
      }
    })

    const tokens = await this.tokenService.getTokenList(false) // include isLanched token
    this.socketIoService.broadcast("created_token", tokens)
    this.socketIoService.broadcast("created_token_info", {
      mint: tokenMint,
      name:tokenName,
      symbol: tokenSymbol,
      desc,
      telegram,
      twitter,
      website,
      created_at: new Date(blockTime * 1000), //ms
      image_uri: imageUri,
      uri: tokenUri,
      creator: tokenCreator
    })
  }

  async solanaBuyTokenEvent(
    event: anchor.Event,
    blockTime: number,
    txSig: string,
  ) {
    try {
      const buyer = event.data.buyer.toString()
      const tokenMint = event.data.mint.toString()
      const solAmount = event.data.solInput.toString() // sol amount to swap SOL for mint Token. (buy)
      const tokenOutput = event.data.tokenOutput.toString() //token amount to buy
      const isCompleted = event.data.isCompleted as boolean//boolean
      // check if token is exists
      const token = await this.prisma.token.findUnique({
        where: {
          mint: tokenMint
        },
      });

      if (!token) {
        return;
      }
      if (BigInt(solAmount) == BigInt(0) || BigInt(tokenOutput) == BigInt(0)) {
        return;
      }

      const totalSolAmount = token.sol_amount + BigInt(solAmount);
      const totalSellTokenAmount = token.sell_token_amount + BigInt(tokenOutput)
      await this.prisma.token.update({
        where: {
          mint: tokenMint
        },
        data: {
          sol_amount: totalSolAmount,
          sell_token_amount: totalSellTokenAmount,
          is_completed: isCompleted,
        }
      });

      const res = await this.prisma.purchaseHistory.create({
        data: {
          buyer,
          token_id: token.id,
          is_buy: true,
          sol_amount: BigInt(solAmount),
          token_amount: BigInt(tokenOutput),
          created_at: new Date(blockTime*1000),
          hash: txSig,
          price: Number(solAmount)/Number(tokenOutput),
        },
      });
      const buyerData = await this.prisma.buyer.findUnique({
        where: {
          token_id_buyer: {
            buyer: buyer,
            token_id: token.id
          }
        }
      });
      if (!buyerData) {
        await this.prisma.buyer.create({
          data: {
            buyer: buyer,
            token_amount: BigInt(tokenOutput),
            sol_amount: BigInt(solAmount),
            token_id: token.id
          }
        })
      }else {
        const totalTokenAmount = buyerData.token_amount + BigInt(tokenOutput)
        const totalSolAmount = buyerData.sol_amount + BigInt(solAmount)
        await this.prisma.buyer.update({
          where: {
            token_id_buyer: {
              buyer: buyer,
              token_id: token.id
            }
          },
          data: {
            token_amount: totalTokenAmount,
            sol_amount: totalSolAmount
          }
        });
      }
      this.socketIoService.broadcast("buy_token", {
        mint: token.mint,
        image_url: token.image_uri,
        name: token.name,
        symbol: token.symbol,
        sol_amount: Number(solAmount),
        buyer: buyer
      })

      this.socketIoService.broadcast("chart_data", {
        mint: token.mint,
        price: Number(solAmount)/Number(tokenOutput),
        time: res.created_at.getTime(),
      })
    }catch (e) {
      console.log(e)
    }
  }

  async solanaSellTokenEvent(
    event: anchor.Event,
    blockTime: number,
    txSig: string,
  ) {
    try {
      const seller = event.data.seller.toString()
      const tokenMint = event.data.mint.toString()
      const solOutputAmount = event.data.solOutput.toString() // sol amount to swap SOL for mint Token. (buy)
      const tokenInput = event.data.tokenInput.toString() //token amount to buy
      // check if token is exists
      const token = await this.prisma.token.findUnique({
        where: {
          mint: tokenMint
        },
      })

      if (!token) {
        return
      }
      if (BigInt(solOutputAmount) === BigInt(0) || BigInt(tokenInput) === BigInt(0)) {
        return
      }

      const totalSolAmount = token.sol_amount - BigInt(solOutputAmount);
      const totalSellTokenAmount = token.sell_token_amount - BigInt(tokenInput)
      await this.prisma.token.update({
        where: {
          mint: tokenMint
        },
        data: {
          sol_amount: totalSolAmount,
          sell_token_amount: totalSellTokenAmount,
        }
      });

      const res = await this.prisma.purchaseHistory.create({
        data: {
          buyer: seller,
          token_id: token.id,
          is_buy: false,
          sol_amount: BigInt(solOutputAmount),
          token_amount: BigInt(tokenInput),
          created_at: new Date(blockTime*1000),
          hash: txSig,
          price: Number(solOutputAmount)/Number(tokenInput),
        },
      })
      this.socketIoService.broadcast("chart_data", {
        mint: token.mint,
        price: Number(solOutputAmount)/Number(tokenInput),
        time:res.created_at.getTime(),
      })


    }catch (e) {
      console.log(e)
    }
  }

  async solanaStakeEvent(
    event: anchor.Event,
    blockTime: number,
    txSig: string,
  ) {
    console.log('--------stakeEvent:')
    try {
      const staker = event.data.staker.toString()
      const amount = event.data.amount.toString()
      if (BigInt(amount) === BigInt(0)) {
        return
      }
       // check if staker is exists
      const stakerInfo = await this.prisma.staker.findUnique({
        where: {
          staker
        },
      })
      if (stakerInfo) {
        const newAmount = stakerInfo.amount + BigInt(amount)
        await this.prisma.staker.update({
          where: {
            staker
          },
          data: {
            amount: newAmount,
          }
        })
       } else {
        await this.prisma.staker.create({
          data: {
            staker,
            amount: BigInt(amount)
          }
        })
      }
    }catch (e) {
      console.log(e)
    }
  }

  async solanaUnstakeEvent(
    event: anchor.Event,
    blockTime: number,
    txSig: string,
  ) {
    try {
      const staker = event.data.staker.toString()
      const amount = event.data.amount.toString()
      if (BigInt(amount) === BigInt(0)) {
        return
      }
       // check if staker is exists
      const stakerInfo = await this.prisma.staker.findUnique({
        where: {
          staker
        },
      })
      if (!stakerInfo) {
        return
      }
      let newAmount = BigInt(0)
      if (stakerInfo.amount > BigInt(amount)){
        newAmount = stakerInfo.amount - BigInt(amount)
      }
      await this.prisma.staker.update({
        where: {
          staker
        },
        data: {
          amount: newAmount,
        }
      })
    }catch (e) {
      console.log(e)
    }
  }

  async syncLpToken() {
    // get token list not reached SOL and passed 30 days
    const tokens = await this.prisma.token.findMany({
      where: {
        is_launched: true,
        is_withdraw: true,
        is_burn: false,
      },
    })
    const connection = new Connection(process.env.SOLANA_RPC, 'confirmed')
    for (let i = 0; i< tokens.length; i++) {
      const token = tokens[i]
      const tokenMint = new PublicKey(token.mint)
      const isBurn = await createBurn(connection, tokenMint)
      if (isBurn) {
        await this.prisma.token.update({
          where: {
            id: token.id
          },
          data: {
            is_burn: true,
          }
        })
      }
    }
  }
}
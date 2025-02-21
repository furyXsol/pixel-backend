import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { DataSeed, TokenInfo, TokenInfoWithBuyer, TokenMetadata, ResPostMetadata, TradeHistory } from 'src/modules/token/token.type';
import { formatInTimeZone } from 'date-fns-tz'
import { Prisma } from '@prisma/client';
@Injectable()
export class TokenService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getTokenList(isLaunched: boolean): Promise<TokenInfo[]> {
    const tokens =  await this.prisma.token.findMany({
      where: {
        is_launched: isLaunched
      }
    });
    return tokens.sort((a,b)=>{return Number(b.sol_amount) - Number(a.sol_amount)}).map((token) => ({
      mint: token.mint,
      name: token.name,
      symbol: token.symbol,
      uri: token.uri,
      imageUri: token.image_uri,
      desc: token.desc,
      telegram: token.telegram,
      twitter: token.twitter,
      website: token.website,
      creator: token.creator,
      createdAt: token.created_at.getTime(),
      solAmount: Number(token.sol_amount.toString()),
      soldTokenAmount: Number(token.sell_token_amount.toString()),
    }))
  }

  async getToken(tokenMint: string): Promise<TokenInfo|null> {
    const token =  await this.prisma.token.findUnique({
      where:{
        is_withdraw: false,
        mint: tokenMint
      },
    });

    if (!token) {
      return null
    }

    return {
      mint: token.mint,
      name: token.name,
      symbol: token.symbol,
      uri: token.uri,
      imageUri: token.image_uri,
      desc: token.desc,
      creator: token.creator,
      telegram: token.telegram,
      twitter: token.twitter,
      website: token.website,
      solAmount: Number(token.sol_amount.toString()),
      soldTokenAmount: Number(token.sell_token_amount.toString()),
      createdAt: token.created_at.getTime(),
    }
  }
  async getTradeHistory(tokenMint: string): Promise<TradeHistory[]> {
    const tokenInfo = await this.prisma.token.findUnique({
      where: {
        mint: tokenMint
      }
    })
    if (!tokenInfo){
      return []
    }

    const history = await this.prisma.purchaseHistory.findMany({
      where: {
        token: tokenInfo,
      }
    })
    return history.map(historyItem => ({
      buyer: historyItem.buyer,
      signature: historyItem.hash,
      solAmount: Number(historyItem.sol_in_amount),
      tokenAmount: Number(historyItem.token_output_amount)
    }))
  }

  async getTokensSearch(addr: string, filter: number): Promise<TokenInfoWithBuyer[]> {
    let buyers = [];
    if (filter === 0) { // Active tokens\
      buyers = await this.prisma.buyer.findMany({
        where: {
          buyer: addr,
          token: {
            is_withdraw: false
          }
        },
        include: {
          token: true
        }
      });
    } else { // All tokens
      buyers = await this.prisma.buyer.findMany({
        where: {
          buyer: addr,
          OR:[
            {
              token:{
                is_withdraw: false
              }
            },{
              token: {
                is_launched: true
              }
            }
          ]
        },
        include: {
          token: true
        }
      });
    }

    return buyers.map(buyer => ({
      tokenAmount: buyer.token_amount.toString(),
      solAmount: buyer.sol_amount.toString(),
      tokenInfo: {
        mint: buyer.token.mint,
        name: buyer.token.name,
        symbol: buyer.token.symbol,
        uri: buyer.token.uri,
        imageUri: buyer.token.image_uri,
        desc: buyer.token.desc,
        telegram: buyer.token.telegram,
        twitter: buyer.token.twitter,
        website: buyer.token.website,
        creator: buyer.token.creator,
        solAmount: buyer.token.sol_amount.toString(),
        soldTokenAmount: buyer.token.sell_token_amount.toString(),
        createdAt: buyer.token.created_at.getTime(),
        rank: 1
      }
    }))
  }

  async postMetadata(metadata: TokenMetadata, file: Express.Multer.File): Promise<ResPostMetadata> {
    //upload image to ipfs
    try {
      const data = new FormData()
      data.append('file', new Blob([file.buffer]) , file.originalname)
      const imageUpload = await fetch(
          'https://api.pinata.cloud/pinning/pinFileToIPFS',
          {
              method: 'POST',
              headers: {
                  Authorization: `Bearer ${process.env.PINATA_API_JWT}`,
              },
              body: data,
          },
      )
      const resImage = (await imageUpload.json());
      const imageIpfs = resImage.IpfsHash;
      if (!imageIpfs){
        return {
          ok: false
        };
      }
      //upload metadata to ipfs
      const formData = new FormData();
      const metadataFile = new File([JSON.stringify({
        name: metadata.tokenName,
        symbol: metadata.tokenSymbol,
        description: metadata.tokenDesc,
        telegram: metadata.tokenTelegram,
        twitter: metadata.tokenTwitter,
        website: metadata.tokenWebsite,
        image: `https://ipfs.io/ipfs/${imageIpfs}`
      })], "metadata.txt", { type: "text/plain"});
      formData.append("file", metadataFile);

      const matadataUpload = await fetch(
          'https://api.pinata.cloud/pinning/pinFileToIPFS',
          {
              method: 'POST',
              headers: {
                  Authorization: `Bearer ${process.env.PINATA_API_JWT}`,
              },
              body: formData,
          },
      );
      const resMetadata = await matadataUpload.json();
      const metadataIpfs = resMetadata.IpfsHash;
      if (!metadataIpfs) {
        return {
          ok: false
        };
      }
      return {
        ok: true,
        uri: `https://ipfs.io/ipfs/${metadataIpfs}`
      }
    }catch(e) {
      console.log(e)
      return {
        ok: false
      }
    }
  }

  async getDataSeed(tokenMint: string, resolution: string, from: number, to: number): Promise<DataSeed[]>{
    const result0 = await this.prisma.purchaseHistory.aggregate({
      _min:{
        created_at: true,
      },
      _max:{
        created_at: true
      },
      where: {
        token: {
          mint: tokenMint
        }
      }
    })
    let min_created_at = result0._min.created_at
    let max_created_at = result0._max.created_at
    if (!min_created_at || !max_created_at){
      return []
    }
    if (from * 1000 > max_created_at.getTime() ||
      to * 1000 < min_created_at.getTime()
    ) {
        return []
    }

    if (from * 1000 > min_created_at.getTime()) {
      min_created_at = new Date(from * 1000)
    }

    if (to * 1000 < max_created_at.getTime()){
      max_created_at = new Date( to * 1000)
    }

    const formated_min_created_at = formatInTimeZone(min_created_at, 'GMT', 'yyyy-MM-dd HH:mm:ss')
    const formated_max_created_at = formatInTimeZone(max_created_at, 'GMT', 'yyyy-MM-dd HH:mm:ss')

    // let sInterval = '10'
    // if (resolution === '5') {
    //   sInterval = '5 minute'
    // } else if (resolution === '1D') {
    //   sInterval = '60 minutes'
    // }
    if (resolution === '1') {
      return await this.prisma.$queryRaw(
        Prisma.sql`SELECT extract(epoch from bucket) as timestamp, COALESCE("open", "close") "open", COALESCE("high", "close") "high", COALESCE("low", "close") "low", COALESCE("close", "close") "close" FROM ( SELECT TIME_BUCKET_GAPFILL('1 minute', ph.created_at) as bucket, FIRST(ph.price, ph.created_at) as open, MAX(ph.price) as high, MIN(ph.price) as low, LOCF(LAST(ph.price, ph.created_at)) as close FROM purchase_histories as ph LEFT JOIN tokens as t ON ph.token_id=t.id WHERE t.mint=${tokenMint} AND ph.created_at >=${formated_min_created_at}::timestamptz AND ph.created_at<=${formated_max_created_at}::timestamptz GROUP BY bucket ) As P`
      ) as DataSeed[]
    }else if (resolution === '5') {
      return await this.prisma.$queryRaw(
        Prisma.sql`SELECT extract(epoch from bucket) as timestamp, COALESCE("open", "close") "open", COALESCE("high", "close") "high", COALESCE("low", "close") "low", COALESCE("close", "close") "close" FROM ( SELECT TIME_BUCKET_GAPFILL('5 minute', ph.created_at) as bucket, FIRST(ph.price, ph.created_at) as open, MAX(ph.price) as high, MIN(ph.price) as low, LOCF(LAST(ph.price, ph.created_at)) as close FROM purchase_histories as ph LEFT JOIN tokens as t ON ph.token_id=t.id WHERE t.mint=${tokenMint} AND ph.created_at >=${formated_min_created_at}::timestamptz AND ph.created_at<=${formated_max_created_at}::timestamptz GROUP BY bucket ) As P`
      ) as DataSeed[]
    }else if (resolution === '240') {
      return await this.prisma.$queryRaw(
        Prisma.sql`SELECT extract(epoch from bucket) as timestamp, COALESCE("open", "close") "open", COALESCE("high", "close") "high", COALESCE("low", "close") "low", COALESCE("close", "close") "close" FROM ( SELECT TIME_BUCKET_GAPFILL('4 hour', ph.created_at) as bucket, FIRST(ph.price, ph.created_at) as open, MAX(ph.price) as high, MIN(ph.price) as low, LOCF(LAST(ph.price, ph.created_at)) as close FROM purchase_histories as ph LEFT JOIN tokens as t ON ph.token_id=t.id WHERE t.mint=${tokenMint} AND ph.created_at >=${formated_min_created_at}::timestamptz AND ph.created_at<=${formated_max_created_at}::timestamptz GROUP BY bucket ) As P`
      ) as DataSeed[]
    }else if (resolution === '1D') {
      return await this.prisma.$queryRaw(
        Prisma.sql`SELECT extract(epoch from bucket) as timestamp, COALESCE("open", "close") "open", COALESCE("high", "close") "high", COALESCE("low", "close") "low", COALESCE("close", "close") "close" FROM ( SELECT TIME_BUCKET_GAPFILL('1 day', ph.created_at) as bucket, FIRST(ph.price, ph.created_at) as open, MAX(ph.price) as high, MIN(ph.price) as low, LOCF(LAST(ph.price, ph.created_at)) as close FROM purchase_histories as ph LEFT JOIN tokens as t ON ph.token_id=t.id WHERE t.mint=${tokenMint} AND ph.created_at >=${formated_min_created_at}::timestamptz AND ph.created_at<=${formated_max_created_at}::timestamptz GROUP BY bucket ) As P`
      ) as DataSeed[]
    }else {
      return []
    }
  }
}
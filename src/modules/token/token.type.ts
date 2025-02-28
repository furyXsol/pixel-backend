export interface TokenMetadata {
  tokenName: string;
  tokenSymbol: string;
  tokenDesc: string;
  tokenTelegram: string;
  tokenTwitter: string;
  tokenWebsite: string;
}

export type TokenInfo = {
  mint: string;
  name: string;
  symbol: string;
  uri: string;
  imageUri: string;
  desc: string;
  telegram: string;
  twitter: string;
  website: string;
  creator: string;
  solAmount: number;
  soldTokenAmount: number;
  createdAt: number; // ms
}

export type TradeHistory = {
  buyer: string;
  solAmount: number;
  tokenAmount: number;
  signature: string;
}

export type TokenInfoWithBuyer = {
  tokenInfo: TokenInfo;
  tokenAmount: string;
}
export type ResPostMetadata = {
  ok: boolean;
  uri?: string;
}

export type DataSeed = {
  open: string;
  high: string;
  low: string;
  close: string;
  // volume: string;
  timestamp: number;
}

export type StakerCount = {
  count: number;
}
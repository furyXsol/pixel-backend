import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { Keypair } from "@solana/web3.js";

export const SOLANA_PIXEL_PROGRAMID = '8GTANRAJSDKSWShY8tqf2s98fSeQYqvppAH3eDx7hQ4B'; //devnet

//base58 encoding admin private key
// pubkey: HNNK9CZ9KG6NS2ffxhmaqP33HitfonDyu4utNsF78XTV
export const ADMIN_KEYPAIR = Keypair.fromSecretKey(
  bs58.decode("gN7FHyEQru3KzbPnfhvUUh1G8UDCiVSXzn9vkg8v9Hi2HGozVVBYwoeRYHNdCE8z6V5XnKUojFZNZEGyFtzvXeM")
)
export const JITO_TIP_LAMPORTS=100000 //0.0001 SOL
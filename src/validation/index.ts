import {z} from "zod"

// handle mint earth nft validation

export const mintEarthNFTSchema = z.object({
    wallet_address: z.string().min(1, "Wallet address is required").max(100, "Wallet address is too long"), 
    tokenType: z.number().int().min(0, "Invalid token type").max(5,"No such token type is exist"), // adjust the min/max values as needed
    tokenId: z.number().int().min(0, "Invalid token ID"),
  });

export const mergeNFTSchema = z.object({
    wallet_address: z.string().min(1, "Wallet address is required").max(100, "Wallet address is too long"), 
    currenttokenType: z.number().int().min(0, "Invalid token type").max(5,"No such token type is exist"), 
    tokenId1:z.number().int().min(0, "Invalid token1 ID"),
    tokenId2:z.number().int().min(0, "Invalid token2 ID"),
    tokenId3:z.number().int().min(0, "Invalid token3 ID"),
    newTokenId:z.number().int().min(0, "Invalid token3 ID"),

})

export const transferNFTSchema = z.object({
    wallet_address:z.string().min(1, "Wallet address is required").max(100, "Wallet address is too long"), 
    receiver_address:z.string().min(1, "Wallet address is required").max(100, "Wallet address is too long"), 
    tokenType:z.number().int().min(0, "Invalid token type").max(5,"No such token type is exist"), 
    tokenId:z.number().int().min(0, "Invalid token ID"),
})
  
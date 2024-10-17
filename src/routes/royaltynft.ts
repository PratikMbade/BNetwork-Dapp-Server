import express, { Router } from 'express'
import { createJustNFTHandler, mergeNFTHandler, mintEarthNFTHandler, transferNFTHandler } from '../controllers/royalty-nft/handlebuynfts';
import { getUserNFTs } from '../controllers/royalty-nft/handlegetfnts';

export const nftRouter:Router = express.Router();

nftRouter.post('/purchaseJustNFT',createJustNFTHandler);
nftRouter.post('/mintEarthNFT',mintEarthNFTHandler);
nftRouter.post('/mergeNFTs',mergeNFTHandler);
nftRouter.post('/transferNFTs',transferNFTHandler)


nftRouter.get("/getUserNFTs",getUserNFTs)

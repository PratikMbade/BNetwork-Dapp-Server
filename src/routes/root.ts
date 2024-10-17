import { Router } from "express";
import { userRouter } from "./user";
import { cosmosPlanetRouter } from "./cosmosplanet";
import { nftRouter } from "./royaltynft";

const rootRouter:Router = Router();

rootRouter.use('/user',userRouter)
rootRouter.use('/planet',cosmosPlanetRouter)
rootRouter.use('/nft',nftRouter)


export default rootRouter;
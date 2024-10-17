import { Router } from "express";
import { buyCosmosPlanets } from "../controllers/cosmos-network/buyplanet";
import { getCosmosEarning, getDirectEarning, getLevelEarning } from "../controllers/cosmos-network/get/cosMosGetReq";

export const cosmosPlanetRouter:Router = Router();

cosmosPlanetRouter.post('/planetbuy',buyCosmosPlanets)
cosmosPlanetRouter.get('/directEarnings/:userId',getDirectEarning)
cosmosPlanetRouter.get("/levelEarning/:userId",getLevelEarning)
cosmosPlanetRouter.get("/getAutopool/:publicAddress/:planetName",getCosmosEarning)
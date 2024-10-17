import { Router } from "express";
import { dashboard,  getUser,  registrationHandler,   } from "../controllers/register-user/user";
import { verifyToken } from "../middlewares/verifyUser";
import { getDirectTeam } from "../controllers/cosmos-network/get/cosMosGetReq";

export const userRouter:Router = Router();

// userRouter.post('/signin',signIn)
userRouter.post('/register',registrationHandler)
userRouter.get('/getUser/:wallet_address',getUser)
userRouter.get('/dashboard',verifyToken,dashboard)
userRouter.get("/directTeam",getDirectTeam)
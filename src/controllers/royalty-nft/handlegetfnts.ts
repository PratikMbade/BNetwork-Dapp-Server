import { Request, Response } from "express";
import { prisma } from "../..";


export const getUserNFTs = async (req:Request,res:Response) =>{
    try {
        
        const {wallet_address} = req.body;

        const user = await prisma.user.findFirst({
            where:{wallet_address},
            include:{
                currentNFTs:true
            }
        })

        if(!user){
            return res.status(404).json({message:"User not found",success:false})
        }


        return res.json({data:user.currentNFTs})

    } catch (error) {
        
    }
}
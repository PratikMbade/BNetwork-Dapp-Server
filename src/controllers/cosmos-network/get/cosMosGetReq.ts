import { Request,Response } from "express";
import { prisma } from "../../..";
import { boolean } from "zod";

export const getDirectEarning = async (req: Request, res: Response) => {
  const { userId } = req.params;
   console.log("user id is ",userId)
  try {
    
    const userID = await prisma.user.findFirst({
        where:{
            wallet_address:userId
        }
    });

    if(!userID){
        return res.status(403).json({msg:"user id  not found"})
    }


    // Query the EarningInfo model to get the user's earning list
    const earnings = await prisma.earningInfo.findMany({
      where: {
        userId: userID.id,
        earningType:"DIRECT_EARNING"
      }
    });

    if (!earnings) {
      return res.status(404).json({ message: 'No earnings found for this user.' });
    }

    res.status(200).json(earnings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
}


export const getLevelEarning = async (req:Request,res:Response) =>{
    const { userId } = req.params;
    console.log("user id is ",userId)
   try {
     
     const userID = await prisma.user.findFirst({
         where:{
             wallet_address:userId
         }
     });
 
     if(!userID){
         return res.status(403).json({msg:"user id  not found"})
     }
 
 
     // Query the EarningInfo model to get the user's earning list
     const earnings = await prisma.earningInfo.findMany({
       where: {
         userId: userID.id,
         earningType:"LEVEL_EARNING"
       }
     });
 
     if (!earnings) {
       return res.status(404).json({ message: 'No earnings found for this user.' });
     }
 
     res.status(200).json(earnings);
   } catch (error) {
     console.error(error);
     res.status(500).json({ message: 'Internal server error.' });
   }
}

export const getCosmosEarning = async (req:Request,res:Response) =>{
  try {
    const {publicAddress,planetName} = req.params;

    const user = await prisma.user.findFirst({
      where:{
        wallet_address:publicAddress,
      },
      include:{
        cosmosPlanets:true
      }
    });

    if(!user){
      return ;
    }

    const isPlanetBought = user?.cosmosPlanets.some((planet)=> planet.planetName === planetName)

    if(!isPlanetBought){
      return;
    }

    const cosMosAutoPool = await prisma.cosMosAutoPool.findFirst({
    where:{
      reg_user_address:user.wallet_address,
      planetName:planetName
    },
    include:{
      autoPoolEarningHistory:true
    }
    })

    console.log('user is ',cosMosAutoPool)
    console.log('autoPoolEarningHistory is ',cosMosAutoPool?.autoPoolEarningHistory)


    if(!cosMosAutoPool){
      return;
    }

    return res.json({
      data:cosMosAutoPool.autoPoolEarningHistory
    })


    

    



    
  } catch (error) {
    
  }
}


export const getDirectTeam = async (req:Request,res:Response)=>{
  try {

    const {wallet_address} = req.body;

    const user = await prisma.user.findFirst({
      where:{
        wallet_address
      },
      include:{
        direct_team:true
      }
    })


    if(!user){
      return res.status(404).json({msg:"user not found"})
    }

    return res.json({data:user.direct_team});
    
  } catch (error) {
    
  }
}


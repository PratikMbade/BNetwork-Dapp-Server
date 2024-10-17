import { Request, Response } from "express";
import { prisma } from "../..";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../secret";
import { verifySignature } from "../../lib/verifySignature";
import { User } from "@prisma/client";
import { updateAncestors } from "../../helper/user";

interface JwtPayload extends Partial<User> {
  userId: number;
  registered: boolean;
}

// export const signIn = async (publicAddress:string,sponsorAddress:string) => {
//   try {
    

//     if (!publicAddress) {
//       return ({ msg: "Insufficient data", success: false });
//     }

//     // const isValidSignature = await verifySignature(req);
//     // console.log("Is the signature valid?", isValidSignature);

//     // if (!isValidSignature) {
//     //   return res.status(401).json({ msg: "Invalid signature", success: false });
//     // }

//     let user = await prisma.user.findFirst({ where: { wallet_address:publicAddress } });

//     if (!user) {
//       user = await prisma.user.create({
//         data: {
//           wallet_address:publicAddress
//         },
//       });
//     }

//     const registered = !!(user.sponser_address && user.bn_id);

//     // const token = jwt.sign({ userId: user.id, registered }, JWT_SECRET, {
//     //   expiresIn: "1h",
//     // });

//     return res.json({ token, success: true });
//   } catch (error) {
//     console.error("Error during sign-in:", error);
//     return res
//       .status(500)
//       .json({ msg: "Internal server error", success: false });
//   }
// };



export const registrationHandler = async (req:Request,res:Response) => {
  try {

    const {publicAddress,sponsorAddress} = req.body;

    if (!publicAddress || !sponsorAddress) {
      return res.json({ msg: "Insufficient data", success: false });
    }

    const isSponsorExist = await prisma.user.findFirst({
      where: { wallet_address: sponsorAddress },
      include:{bnCoinEarned:true}
    });

    if (!isSponsorExist) {
      return res.json ({ msg: "Sponsor is not registered", success: false });
    }

    const isUser = await prisma.user.findFirst({
      where: { wallet_address:publicAddress },
    });

    
    if (isUser) {
      return res.json ({ msg: "User already exists", success: false });
    }

    const last8Characters = publicAddress.slice(-8);
    const newBN_ID = "BN" + last8Characters;

    const BNMaxRewardsCoins = await prisma.bNCoinConfig.findUnique({
      where: { key: "BNMaxRewardsCoins" },
    });

    if (!BNMaxRewardsCoins) {
      return res.json({ msg: "Configuration not found", success: false });
    }

    let bnCoinRegistration = 0;

    if (
      BNMaxRewardsCoins.BNCoinDistributed! + 0.5 <
      BNMaxRewardsCoins.BNMaxRewardsCoins
    ) {
      bnCoinRegistration = 0.5;
    }


      // await updateAncestors(isSponserExist.wallet_address, wallet_address);

    const userRegistration = await prisma.$transaction(async (prisma) => {
      
      const newUser = await prisma.user.create({
        data: {
          bn_id: newBN_ID,
          wallet_address:publicAddress,
          sponser_address:sponsorAddress,
          bnCoinEarned: {
            create: {
              bn_id: newBN_ID,
              wallet_address: publicAddress,
              amount: 0.05,
              timeStamp: new Date(),
            },
          },
        },
      });

      let incrementBNCoinAmountSponser = 0;

      //increase direct team count when user register 

      await prisma.user.upsert({
        where:{
          wallet_address:isSponsorExist.wallet_address
        },
        update:{
          directTeam_Count: { increment : 1}
        },
        create:{
          wallet_address: isSponsorExist.wallet_address,
          directTeam_Count: 1,
        }
      })



      const sponserBNCoin = isSponsorExist.bnCoinEarned.find((item)=>{
        const sponserBNCoin = item.amount ?? 0;
        incrementBNCoinAmountSponser = sponserBNCoin + 0.25;
      })

      console.log("amount increased ",incrementBNCoinAmountSponser)


      const bnCoinEarnedSponser = await prisma.bnCoinEarned.upsert({
        where: {
          wallet_address_userId: {
            wallet_address: sponsorAddress,
            userId: isSponsorExist.id, // Ensure you provide the correct userId
          },
        },
        update: {
         amount:incrementBNCoinAmountSponser
        },
        create: {
          bn_id: newBN_ID,
          wallet_address: publicAddress, // Use the sponsor's address here
          amount: 0.025,
          userId: isSponsorExist.id, // Use userId for linking
          timeStamp: new Date(),
        },
      });



      const updatedBNCoinConfig = await prisma.bNCoinConfig.update({
        where: { key: "BNMaxRewardsCoins" },
        data: {
          BNCoinDistributed: {
            increment: bnCoinRegistration + 0.025, // Adjust based on actual increments
          },
        },
      });


      

      return { newUser, bnCoinEarnedSponser, updatedBNCoinConfig };
    });

    await updateAncestors(isSponsorExist.wallet_address, publicAddress);



    return res.json({ msg: "User registered successfully", success: true });
  } catch (error: any) {
    console.log(error);
    if (error.code === "P2002") {
      return res.json ({
          msg: "User with this wallet address already exists",
          success: false,
        });
    }
    return res.json ({ msg: "Internal Server Error", success: false });
  }
};


export const dashboard = async (req: Request, res: Response) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      return res.status(404).json({ msg: "Token is not avalible in headers" });
    }

    const user = jwt.verify(token, JWT_SECRET) as JwtPayload;

    res.json({ msg: "welcome come to dashboardd", user });
  } catch (error) {}
};


export const getUser = async (req: Request, res: Response) => {
  try {
    const { wallet_address } = req.params;

    const isUserExist = await prisma.user.findFirst({
      where: {
        wallet_address: wallet_address,
      },
      include: {
        bnCoinEarned: true,
        ancestors:true,
        earningList:true
      }
      
    });

    if (!isUserExist) {
      return res.status(404).json({ msg: "user not found" });
    }

    return res.json({ isUserExist });
  } catch (error) {}
};



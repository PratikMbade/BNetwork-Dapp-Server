import express, { Express, Request, Response } from "express";

import rootRouter from "./routes/root";
import { PrismaClient, User } from "@prisma/client";
import cors from 'cors'
import { listenOnContractRegistratoin, listenOnContractBuyPlanet, registrationHandler } from "./contract/cosmos_contract/cosmosSCMethod";
import { createFirstOwner } from "./lib/seedBNCoinData";
import { buyCosmosPlanetsEvent } from "./controllers/cosmos-network/buyplanet";
const app: Express = express();

const PORT = process.env.PORT || 4000;



app.use(cors())
app.use(express.json());

app.use('/api',rootRouter)

app.get("/",(req:Request,res:Response)=>{
    res.send("Home")
})

export const prisma = new PrismaClient()


async function seedBNCoinConfig() {
    // Seed BNMaxRewardsCoins
    await prisma.bNCoinConfig.upsert({
      where: { key: 'BNMaxRewardsCoins' },
      update: {},
      create: {
        key: 'BNMaxRewardsCoins',
        value: 5000,
        BNMaxRewardsCoins: 50000,
        BNMaxAirDropCoins: 1000,
        BNCoinDistributed: 0,
        BNAirDropCoinDistributed: 0
      },
    })
  

  }
  
  // seedBNCoinConfig()
  //   .then(() => console.log('Seeding completed'))
  //   .catch(e => {
  //     console.error(e)
  //     process.exit(1)
  //   })
  //   .finally(async () => {
  //     await prisma.$disconnect()
  //   })


  




async function createDummyUser() {
  try {
    const dummyUser = await prisma.cosMosAutoPool.create({
      data: {
        bn_id: "BN22cfD778", // Replace with your desired bn_id
        reg_user_address: "0xF346C0856DF3e220E57293a0CF125C1322cfD778",
        universeSlot: 0,
        planetName: "Pluto", // You can adjust this or leave it null
        currentLevel: 0,           // Example value, adjust as needed
        currentPosition: 0,        // Example value, adjust as needed
        autoPoolEarning: 0,        // Example value, adjust as needed
        isRoot:false,
        canHaveMoreChildren: true,
      },
    });

    console.log("Dummy user created:", dummyUser);
  } catch (error) {
    console.error("Error creating dummy user:", error);
  }
}
// createFirstOwner()     

// createDummyUser()  


listenOnContractRegistratoin()
// listenOnContractBuyPlanet()
// registrationHandler('0xb57616494887F98a509B5446072d2E364c3095E6','0x2C7f4dB6A0B1df04EA8550c219318C7f2FF3D34C')
// buyCosmosPlanetsEvent('0xb57616494887F98a509B5446072d2E364c3095E6')

app.listen(PORT,()=>{
     
    console.log("app is listening on PORT ",PORT)
})

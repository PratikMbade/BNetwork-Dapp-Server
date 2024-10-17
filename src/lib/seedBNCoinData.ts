import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()


export async function createFirstOwner() {
    const wallet_address = "0xF346C0856DF3e220E57293a0CF125C1322cfD778"
  
    try {
      const newUser = await prisma.user.create({
        data: {
          regId:0,
          wallet_address,
          bn_id: "BN" + wallet_address.slice(-8),
          sponser_address: null, // Assuming there's no sponsor for the first user
          directTeam_Count: 0,
          totalTeam_Count: 0,
          registrationTranxhash: null,
          lastestPlanetName: null,
          totalBNCoin: 0,
          isRegistered:true,
        }
      })
  
      console.log('First owner created:', newUser)
    } catch (error) {
      console.error('Error creating first owner:', error)
    } finally {
      await prisma.$disconnect()
    }
  }
  
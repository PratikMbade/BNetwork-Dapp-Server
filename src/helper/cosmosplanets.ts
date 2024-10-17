import { prisma } from "..";

interface AncestorsArrayTypes {
  id: string;
  ancestorsNumber: number;
  wallet_address: string;
  userId: string;
}

function getLevelEarningAmount(
  planetPrice: number,
  levelNumber: number
): number {
  const totalPriceToDist = planetPrice * 0.4;
  const percentAccToLevel = [
    0.1, 0.05, 0.04, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03,
  ];
  const levelIncome = totalPriceToDist * percentAccToLevel[levelNumber - 1];
  console.log(`level income is ${levelIncome} for level number ${levelNumber}`);
  return levelIncome;
}

async function iterateOnEachAncestors(
  senderAddress:string,
  ancestorsArray: AncestorsArrayTypes[],
  planetName: string,
  planetPrice: number
) {
  try {
    const totalLevelEarningTeam: number = ancestorsArray.length;
    let i: number = 1;

    for (const ancestor of ancestorsArray) {
      if (i > totalLevelEarningTeam) {
        return;
      }

      const isAncestor = await prisma.user.findUnique({
        where: {
          wallet_address: ancestor.wallet_address,
        },
        include: {
          cosmosPlanets: true,
        },
      });

      if (!isAncestor) {
        continue;
      }

      const isAncestorHasPlanet = isAncestor.cosmosPlanets.some(
        (planet) => planet.planetName === planetName
      );
      const currentLevelEarning = isAncestor.levelEarning ?? 0;
      const currentLapsAmount = isAncestor.myLaps ?? 0;
      console.log(
        `input address ${isAncestor.wallet_address} and level is ${i}`
      );
      const amountGot = getLevelEarningAmount(planetPrice, i);
      const incrementLevelEarning = currentLevelEarning + amountGot;
      const incrementLapsEarning = currentLapsAmount + amountGot;

      if (isAncestorHasPlanet) {
        console.log("increment level earning ", incrementLevelEarning);

        const amountAdded = await prisma.user.update({
          where: {
            wallet_address: isAncestor.wallet_address,
          },
          data: {
            levelEarning: incrementLevelEarning,
          },
        });

        await prisma.earningInfo.create({
            data:{
              amount:amountGot,
              receiverAddress:isAncestor.wallet_address,
              senderAddress:senderAddress,
              planetName:planetName,
              earningType:"LEVEL_EARNING",
              userId:isAncestor.id
            }
        })

        console.log("amount added ", amountAdded);
      } else {
        await prisma.user.update({
          where: {
            wallet_address: isAncestor.wallet_address,
          },
          data: {
            myLaps: incrementLapsEarning,
          },
        });
      }

      i++;
    }
  } catch (error) {
    console.log("something went wrong in iterateOnEachAncestors", error);
  }
}

async function checkValidAncestor(
  senderAddress:string,
  currentAncestor: string,
  planetNum: number,
  planetPrice: number,
  planetName:string
) {
  try {
    const currentAnce = await prisma.user.findUnique({
      where: {
        wallet_address: currentAncestor,
      },
      include: {
        cosmosPlanets: true,
        ancestors: true,
      },

    });

    if(!currentAnce){
      return
    }

    const totalPrice = planetPrice * 0.3;

    const isAncestorHasPlanet = currentAnce?.cosmosPlanets.some(
      (planet) => planet.planetNum === planetNum
    );

    if (isAncestorHasPlanet) {
      const currentUpgradeEarn = currentAnce?.upgradeEarning ?? 0;
      const incrementUpgradeEarningIs = currentUpgradeEarn + totalPrice;

      await prisma.user.update({
        where: {
          wallet_address: currentAnce?.wallet_address,
        },
        data: {
          upgradeEarning: incrementUpgradeEarningIs,
        },


      });



      await prisma.earningInfo.create({
        data:{
          amount:totalPrice,
          receiverAddress:currentAnce?.wallet_address!,
          senderAddress: senderAddress,
          planetName:planetName,
          earningType:"UPGRADE_EARNING",
          userId:currentAnce?.id
        }
      })
    } else {
      if (currentAnce?.ancestors.length === 0) {
        return;
      }
      checkValidAncestor(senderAddress,currentAnce?.sponser_address!, planetNum, planetPrice,planetName);
    }
  } catch (error) { 
    console.log("something went wrong in checkValidAncestor",error)
  }
}

export const distributeDirectEarning = async (
  currentUser: string,
  planetName: string
) => {
  try {

    const user = await prisma.user.findFirst({
      where:{
        wallet_address:currentUser
      }
    });

    if(!user){
      return
    }

    if(!user.sponser_address){
      return
    }

    const sponser = await prisma.user.findFirst({
      where: { wallet_address: user.sponser_address! },
      include: {
         cosmosPlanets: true ,
         earningList:true
      },
    });

    if(!sponser){
      console.log("no sponser")
      return 
    }

    if (sponser) {
      const isSponsorHasEarthPlanet = sponser.cosmosPlanets.some(
        (planet) => planet.planetName === planetName
      );

      if (isSponsorHasEarthPlanet) {
        const directEarning = sponser.directEarning ?? 0;
        const incrementDirectEarning = directEarning + 1.5;
        await prisma.user.update({
          where: { wallet_address: sponser.wallet_address },
          data: { directEarning: incrementDirectEarning },
        });
      
        await prisma.earningInfo.create({
           data:{
            amount:1.5,
            receiverAddress:sponser.wallet_address,
            senderAddress:currentUser,
            planetName:"Earth",
            earningType:"DIRECT_EARNING",
            userId:sponser.id
           }
        })

  
      } else {
        const lapEarning = sponser.myLaps ?? 0;
        const incrementLapsEarning = lapEarning + 1.5;
        await prisma.user.update({
          where: { wallet_address: sponser.wallet_address },
          data: { myLaps: incrementLapsEarning },
        });
      }


    }
  } catch (error) {
    console.log("something went wrong in distributeDirectEarning", error);
  }
};

export const distributeLevelEarning = async (
  currentUser: string,
  planetName: string,
  planetPrice: number
) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        wallet_address: currentUser,
      },
      include: {
        cosmosPlanets: true,
        ancestors: true,
      },
    });

    if(!user){
      return;
    }

    if (user?.ancestors.length === 0) {
      console.log("user ancestors legnth 0");
      return;
    }

   
    const sortedAncestorsArray = user!.ancestors.sort(
      (a, b) => b.ancestorsNumber - a.ancestorsNumber
    );

    console.log("sortedAncestors in level earning", sortedAncestorsArray);

    await iterateOnEachAncestors(
      user?.wallet_address,
      sortedAncestorsArray!,
      planetName,
      planetPrice
    );
  } catch (error) {
    console.log("something went wrong in the distributeLevelEarning", error);
  }
};

export const distributeUpgradeEaning = async (
  currentUser: string,
  planetNum: number,
  planetPrice: number,
  planetName:string
) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        wallet_address: currentUser,
      },
      include: {
        cosmosPlanets: true,
        ancestors: true,
      },
    });

    if(!user){
      return;
    }

    if (user?.ancestors.length === 0) {
      console.log("user ancestors legnth 0");
      return;
    }

    const sortedAncestorsArray = user!.ancestors.sort(
      (a, b) => b.ancestorsNumber - a.ancestorsNumber
    );


    if (sortedAncestorsArray?.length === 0) {
      return;
    }
    console.log("sortedAncestors ", sortedAncestorsArray);

    const ancestorsArrayLength = sortedAncestorsArray?.length;

    if (ancestorsArrayLength! >= planetNum) {
      const validAncestor = sortedAncestorsArray![planetNum - 1];
      console.log(
        `valid ancestors is first ${validAncestor.wallet_address} and planet number is ${planetNum}`
      );

      const currentAnce = await prisma.user.findUnique({
        where: {
          wallet_address: validAncestor.wallet_address,
        },
        include: {
          cosmosPlanets: true,
          ancestors: true,
        },
      });

      if(!currentAnce){
        return;
      }

      const totalPrice = planetPrice * 0.3;

      const isAncestorHasPlanet = currentAnce?.cosmosPlanets.some(
        (planet) => planet.planetNum === planetNum
      );

      if (isAncestorHasPlanet) {
        const currentUpgradeEarn = currentAnce?.upgradeEarning ?? 0;
        const incrementUpgradeEarningIs = currentUpgradeEarn + totalPrice;

        await prisma.user.update({
          where: {
            wallet_address: currentAnce?.wallet_address,
          },
          data: {
            upgradeEarning: incrementUpgradeEarningIs,
          },
        });


        await prisma.earningInfo.create({
          data:{
            amount:totalPrice,
            receiverAddress:currentAnce.wallet_address,
            senderAddress: user.wallet_address,
            planetName:planetName,
            earningType:"UPGRADE_EARNING",
            userId:currentAnce.id

          }
        })
        console.log("My current sponser has planet yaaa", currentAnce);
      } else {
        const currentLapsEarn = currentAnce?.myLaps ?? 0;
        const incrementLapsEarning = currentLapsEarn + totalPrice;

        await prisma.user.update({
          where: {
            wallet_address: currentAnce?.wallet_address,
          },
          data: {
            myLaps: incrementLapsEarning,
          },
        });

        console.log("Got laps in upgrade earning ");

        if (
          currentAnce?.ancestors.length === 0 ||
          !currentAnce?.sponser_address
        ) {
          console.log("currentAncestor doesn't has ancestor and sponser");
          return;
        }

        await checkValidAncestor(
          user.wallet_address,
          currentAnce?.sponser_address,
          planetNum,
          planetPrice,
          planetName
        );
      }
    }
    else {
      console.log("No level present there ")
      return;
    }


  } catch (error) {
    console.log("something went wrong in distributeUpgradeEaning", error)
  }
};








import { prisma } from "..";


interface referralsArrayType{
  id:string;
  wallet_address:string;
  ancestorsNumber:number
}


export const updateAncestors = async (sponsor: string, currentUser: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { wallet_address: currentUser },
      include: { ancestors: true },
    });

    if (!user) {
      throw new Error("Current user not found");
    }

    const referrer = await prisma.user.findUnique({
      where: { wallet_address: sponsor },
      include: { ancestors: true },
    });

    if (!referrer) {
      throw new Error("Referrer not found");
    }

    let updatedAncestors = [];
    let referralSInArrray: referralsArrayType[] = [];

    if (referrer.ancestors.length === 0) {
      updatedAncestors.push({
        wallet_address: referrer.wallet_address,
        ancestorsNumber: 1,
      });
    } else {
      const pushAddressInArray = referrer.ancestors.forEach((user) => {
        referralSInArrray.push({
          id: user.id,
          wallet_address: user.wallet_address,
          ancestorsNumber: user.ancestorsNumber,
        });
      });

      updatedAncestors = [
        ...referralSInArrray,
        {
          wallet_address: referrer.wallet_address,
          ancestorsNumber: referrer.ancestors.length + 1,
        },
      ];
    }

    if (updatedAncestors.length > 10) {
      updatedAncestors = updatedAncestors.slice(-10);
    }

    console.log("updatedAncestors", updatedAncestors);

    let totalTeam = updatedAncestors.map(async (data) => {
      const updateDirectTeam = await prisma.user.upsert({
        where: {
          wallet_address: data.wallet_address,
        },
        update: {
          totalTeam_Count: { increment: 1 }, // Increment sponsor's direct team count
        },
        create: {
          wallet_address: data.wallet_address,
          totalTeam_Count: 1, // If sponsor doesn't exist, create with count 1
        },
      });
    });

    const newAncestors = updatedAncestors.filter(
      (ancestor) =>
        !user.ancestors.some(
          (existing) => existing.wallet_address === ancestor.wallet_address
        )
    );

    if (newAncestors.length > 0) {
      const createAncestorsPromises = newAncestors.map((ancestor) =>
        prisma.ancestors.create({
          data: {
            wallet_address: ancestor.wallet_address,
            userId: user.id,
            ancestorsNumber: ancestor.ancestorsNumber,
            createdAt: new Date(), // Assign order based on the index
          },
        })
      );

      await Promise.all(createAncestorsPromises);
      console.log("Created ancestors");
    } else {
      console.log("No new ancestors to add");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        ancestors: {
          connect: newAncestors.map((ancestor) => ({
            userId_wallet_address: {
              wallet_address: ancestor.wallet_address,
              userId: user.id,
            },
          })),
        },
      },
      include: { ancestors: true },
    });

    const updateAncestorsNumberPromises = newAncestors.map((ancestor) =>
      prisma.ancestors.updateMany({
        where: {
          userId: user.id,
          wallet_address: ancestor.wallet_address,
        },
        data: {
          ancestorsNumber: ancestor.ancestorsNumber,
        },
      })
    );

    await Promise.all(updateAncestorsNumberPromises);
  } catch (error) {
    console.log("Something went wrong in the updateAncestors function", error);
  }
};




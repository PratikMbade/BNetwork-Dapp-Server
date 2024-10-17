import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { distributeAutopoolEarning } from "../../helper/cosmosAutopool";
import {
  distributeDirectEarning,
  distributeLevelEarning,
  distributeUpgradeEaning,
} from "../../helper/cosmosplanets";


const prisma = new PrismaClient();



const handleEarningsDistribution = async (
  wallet_address: string,
  planetName: string,
  planetNum: number,
  planetPrice: number,
  universalPlanetCount: number, 
  bn_id: string
) => {
  try {
    if (planetName === "Earth") {
      await distributeDirectEarning(wallet_address, planetName);
    }

    await distributeLevelEarning(wallet_address, planetName, planetPrice);

    if (planetName !== "Earth") {
      await distributeUpgradeEaning(
        wallet_address,
        planetNum,
        planetPrice,
        planetName
      );
    }

    // Autopool earnings - Placeholder for autopool logic
    await distributeAutopoolEarning(
      wallet_address,
      planetName,
      planetNum,
      planetPrice,
      universalPlanetCount,
      bn_id!
    );
  } catch (error) {
    console.error("Error in earnings distribution:", error);
    throw error; // This will cause the transaction to roll back if something goes wrong
  }
};

type PlanetDetails = {
  planetNum: number;
  planetName: string;
  planetPrice: number;
};

const PlanetDetailsMap: Record<number, PlanetDetails> = {
  1: { planetNum: 1, planetName: "Earth", planetPrice: 5 },
  2: { planetNum: 2, planetName: "Moon", planetPrice: 10 },
  3: { planetNum: 3, planetName: "Mars", planetPrice: 25 },
  4: { planetNum: 4, planetName: "Mercury", planetPrice: 50 },
  5: { planetNum: 5, planetName: "Venus", planetPrice: 100 },
  6: { planetNum: 6, planetName: "Jupiter", planetPrice: 250 },
  7: { planetNum: 1, planetName: "Saturn", planetPrice: 500 },
  8: { planetNum: 2, planetName: "Uranus", planetPrice: 1000 },
  9: { planetNum: 3, planetName: "Neptune", planetPrice: 2500 },
  10: { planetNum: 4, planetName: "Pluto", planetPrice: 5000 },
};

const getPlanetDetailsById = (planetId: number): PlanetDetails  => {
  return PlanetDetailsMap[planetId] || null;
};

export const buyCosmosPlanets = async (req: Request, res: Response) => {
  const { wallet_address, planetNum,  } = req.body;

  Number(planetNum)

  const {planetName,planetPrice} = getPlanetDetailsById(planetNum);
  console.log(planetName,planetPrice)

  try {
    const user = await prisma.user.findFirst({
      where: { wallet_address },
      include: { cosmosPlanets: true },
    });

    if (!user) {
      return res.status(403).json({ msg: "User is not registered" });
    }

    const isAlreadyBought = user.cosmosPlanets.some(
      (planet) => planet.planetNum === planetNum
    );

    if (isAlreadyBought) {
      return res.status(403).json({ msg: "User already bought this planet" });
    }

    // Using $transaction to ensure atomicity
    const planet = await prisma.$transaction(
      async (prisma) => {
        const newPlanet = await prisma.cosmosPlanet.create({
          data: {
            planetName,
            planetNum,
            planetPrice,
            user: { connect: { id: user.id } },
            planet: {
              connectOrCreate: {
                where: { planetNum }, // Assuming planetNum is unique in the `planet` model
                create: {
                  planetName,
                  planetNum,
                  planetPrice,
                },
              },
            },
          },
        });

        const updatedPlanet = await prisma.planet.update({
          where: { planetNum },
          data: {
            universalCount: { increment: 1 },
          },
          select: { universalCount: true },
        });

        //Distribute earnings
        await handleEarningsDistribution(
          user.wallet_address,
          planetName,
          planetNum,
          planetPrice,
          updatedPlanet.universalCount,
          user.bn_id!
        );

        return newPlanet;
      },
      { timeout: 10000 }
    );

    return res.json({ msg: "Planet bought successfully", planet });
  } catch (error) {
    console.error("Error in buyCosmosPlanets:", error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const buyCosmosPlanetsEvent = async (
  wallet_address: string,
  planetId: number
) => {
  const {  planetNum, planetName, planetPrice } = getPlanetDetailsById(planetId);

  try {
    const user = await prisma.user.findFirst({
      where: { wallet_address },
      include: { cosmosPlanets: true },
    });

    if (!user) {
      return ({ msg: "User is not registered" });
    }

    const isAlreadyBought = user.cosmosPlanets.some(
      (planet) => planet.planetNum === planetNum
    );

    if (isAlreadyBought) {
      return ({ msg: "User already bought this planet" });
    }

    // Using $transaction to ensure atomicity
    const planet = await prisma.$transaction(
      async (prisma) => {
        const newPlanet = await prisma.cosmosPlanet.create({
          data: {
            planetName,
            planetNum,
            planetPrice,
            user: { connect: { id: user.id } },
            planet: {
              connectOrCreate: {
                where: { planetNum }, // Assuming planetNum is unique in the `planet` model
                create: {
                  planetName,
                  planetNum,
                  planetPrice,
                },
              },
            },
          },
        });

        const updatedPlanet = await prisma.planet.update({
          where: { planetNum },
          data: {
            universalCount: { increment: 1 },
          },
          select: { universalCount: true },
        });

        //Distribute earnings
        await handleEarningsDistribution(
          user.wallet_address,
          planetName,
          planetNum,
          planetPrice,
          updatedPlanet.universalCount,
          user.bn_id!
        );

        return newPlanet;
      },
      { timeout: 10000 }
    );

    return ({ msg: "Planet bought successfully", planet });
  } catch (error) {
    console.error("Error in buyCosmosPlanets:", error);
    return ({ msg: "Internal Server Error" });
  }
};

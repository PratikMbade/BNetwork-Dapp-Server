import { Request, Response } from "express";
import { prisma } from "../..";
import {
  mergeNFTSchema,
  mintEarthNFTSchema,
  transferNFTSchema,
} from "../../validation";
import { z } from "zod";

export const createJustNFTHandler = async (req: Request, res: Response) => {
  try {
    const { wallet_address, tokenType } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        wallet_address: wallet_address,
      },
      include: {
        currentNFTs: true,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    const existingRoyaltyNFT = await prisma.royaltyNFTs.findFirst({
      where: { tokenType },
    });

    let royaltyNFTId;

    if (existingRoyaltyNFT) {
      royaltyNFTId = existingRoyaltyNFT.id;
    } else {
      const newRoyaltyNFT = await prisma.royaltyNFTs.create({
        data: {
          tokenId: 0,
          tokenType,
        },
      });
      royaltyNFTId = newRoyaltyNFT.id;
    }

    const createJustNFTToken = await prisma.userNFTs.create({
      data: {
        tokenType: 0,
        mintDate: new Date(),
        tokenId: 0,
        user: { connect: { id: user.id } },
        royaltNFTS: {
          connect: { id: royaltyNFTId },
        },
      },
    });

    return res
      .status(201)
      .json({
        message: "NFT created successfully",
        success: true,
        nft: createJustNFTToken,
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const mintEarthNFTHandler = async (req: Request, res: Response) => {
  try {
    const validatedData = mintEarthNFTSchema.parse(req.body);
    const { wallet_address, tokenType, tokenId } = validatedData;

    const user = await prisma.user.findFirst({
      where: { wallet_address },
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    const isTokenIdExist = await prisma.userNFTs.findFirst({
      where: {
        userId: user.id,
        tokenId,
        tokenType
      },
    });

    if (isTokenIdExist) {
      return res
        .status(400)
        .json({ message: "Token ID already present", success: false });
    }

    const result = await prisma.$transaction(async (prisma) => {
      const existingRoyaltyNFT = await prisma.royaltyNFTs.findFirst({
        where: { tokenType },
      });

      let royaltyNFTId;

      if (existingRoyaltyNFT) {
        royaltyNFTId = existingRoyaltyNFT.id;
      } else {
        const newRoyaltyNFT = await prisma.royaltyNFTs.create({
          data: {
            tokenType,
            tokenId, // Use a dynamically managed tokenId if needed
          },
        });
        royaltyNFTId = newRoyaltyNFT.id;
      }

      return await prisma.userNFTs.create({
        data: {
          tokenId,
          tokenType,
          mintDate: new Date(),
          user: { connect: { id: user.id } },
          royaltNFTS: {
            connect: { id: royaltyNFTId },
          },
        },
      });
    });

    return res
      .status(201)
      .json({
        message: "Earth NFT minted successfully",
        success: true,
        nft: result,
      });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: error.errors });
    }

    console.error("Error minting NFT:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const mergeNFTHandler = async (req: Request, res: Response) => {
  try {
    // Validate request body using Zod schema
    const validatedData = mergeNFTSchema.parse(req.body);
    const {
      wallet_address,
      currenttokenType,
      tokenId1,
      tokenId2,
      tokenId3,
      newTokenId,
    } = validatedData;

    // Fetch the user by wallet_address
    const user = await prisma.user.findFirst({
      where: {
        wallet_address,
      },
      include:{
        currentNFTs:true
      }
    });

    // Return an error if user is not found
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    const isNewTokendExist = user.currentNFTs.find((nft)=>nft.tokenId === newTokenId);
    
    if(!isNewTokendExist){
      return;
    }

    // Check if the provided NFTs exist for the current token type
    const nfts = await prisma.userNFTs.findMany({
      where: {
        userId: user.id,
        tokenId: { in: [tokenId1, tokenId2, tokenId3] },
        tokenType: currenttokenType,
      },
    });

    // Return an error if all three NFTs are not found
    if (nfts.length !== 3) {
      return res
        .status(400)
        .json({ message: "Invalid NFTs provided for merge", success: false });
    }

    // Calculate the new token type for the merged NFT
    const newTokenType = currenttokenType + 1;

    // Check if the RoyaltyNFTs entry exists or create it
    const existingRoyaltyNFT = await prisma.royaltyNFTs.findFirst({
      where: { tokenType: newTokenType },
    });

    let royaltyNFTId;

    if (existingRoyaltyNFT) {
      royaltyNFTId = existingRoyaltyNFT.id; // Use the existing royaltyNFT id
    } else {
      // Create a new RoyaltyNFT if it doesn't exist
      const newRoyaltyNFT = await prisma.royaltyNFTs.create({
        data: {
          tokenId: newTokenId,
          tokenType: newTokenType,
        },
      });
      royaltyNFTId = newRoyaltyNFT.id;
    }

    // Create the new merged NFT for the user
    const newNFT = await prisma.userNFTs.create({
      data: {
        user: { connect: { id: user.id } },
        tokenType: newTokenType, // New tokenType after merging
        tokenId: newTokenId,
        mintDate: new Date(),
        royaltNFTS: {
          connect: { id: royaltyNFTId }, // Connect to RoyaltyNFTs using the unique ID
        },
      },
    });

    // Delete the original NFTs that were merged
    await prisma.userNFTs.deleteMany({
      where: {
        tokenType: currenttokenType,
        tokenId: { in: [tokenId1, tokenId2, tokenId3] },
        userId: user.id,
      },
    });

    // Return a success response
    return res
      .status(200)
      .json({ message: "NFTs merged successfully", newNFT, success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Handle validation errors from Zod
      return res
        .status(400)
        .json({ message: "Validation failed", errors: error.errors });
    }

    // Handle any other errors
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const transferNFTHandler = async (req: Request, res: Response) => {
  try {
    const validatedData = transferNFTSchema.parse(req.body);

    const { wallet_address, receiver_address, tokenType, tokenId } =
      validatedData;

    const user = await prisma.user.findFirst({
      where: {
        wallet_address,
      },
      include: {
        currentNFTs: true,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "user not found", success: false });
    }

    //check wheather user has that token id and token type
    const isUserHasNFT = user.currentNFTs.find(
      (nft) => nft.tokenId === tokenId && nft.tokenType === tokenType
    );

    if (!isUserHasNFT) {
      return res
        .status(404)
        .json({ message: "User does not own the NFT", success: false });
    }

    const receiver = await prisma.user.findFirst({
      where: {
        wallet_address: receiver_address,
      },
    });

    if (!receiver) {
      return res
        .status(404)
        .json({ message: "receiver not found", success: false });
    }

    //check receiver has 5 planets in cosmos
    //check receiver has 5 planet in universe

    const updateNFTtoReceiver = await prisma.userNFTs.updateMany({
      where: {
        userId: user.id,
        tokenId: tokenId,
        tokenType: tokenType,
      },
      data: {
        userId: receiver.id,
      },
    });

    if (updateNFTtoReceiver.count === 0) {
      return res
        .status(404)
        .json({ message: "NFT transfer failed", success: false });
    }

    return res
      .status(200)
      .json({ message: "NFT transferred successfully", success: true });
  } catch (error) {
    console.error("something went wrong in the transferNFTHandler ", error);
  }
};

import { error } from "console";
import { prisma } from "..";
import { isAwaitKeyword, isTaggedTemplateExpression } from "typescript";
import { OWNER_ADDRESS } from "../secret";



type PrismaCurrentRoot = {
  id: string;
  bn_id: string;
  planetName: string | null;
  reg_user_address: string;
  universeSlot: number | null;
  parentId: string | null;
  currentLevel: number | null;
  currentPosition: number | null;
  autoPoolEarning: number | null;
  isRoot: boolean;
  canHaveMoreChildren: boolean;
  children?: { id: string }[]; // Simplified for relation connect operations
  recycle?: {
    id: string;
    recycleCount: number;
    autoPoolId: string;
    indexMappings?: {
      id: string;
      userLevel: number;
      userPosition: number;
      recycleMappingId: string;
    }[];
  }[];
};




async function distributeEarnings(userId:string,planetName:string,universalCount:number,planetPrice:number){
  try {

    let currentUser = await prisma.cosMosAutoPool.findFirst({
      where:{
        id:userId,
        planetName:planetName
      },
      include:{
        autoPoolEarningHistory:true
      }
    })

    if(!currentUser){
      console.log("we don't currentUser ");
      return;
    }

    const earningsDistribution:{[key:number]:number} = { 1: 0.05, 2: 0.1, 3: 0.1, 4: 0.25, 5: 0.5 };

    const amount = planetPrice;
    console.log("amout is ",amount);

    let remainingLevel = 5;
    let currentParentId = currentUser.parentId;

    let distributedLevels = new Set();
    console.log("distributedlevel ",distributedLevels);

    while(currentParentId && remainingLevel > 0){
      

      console.log(`current user ${currentUser.id} currentParentid is ${currentParentId}  and remaining level is ${remainingLevel}`)

      const parentUser = await prisma.cosMosAutoPool.findFirst({
        where:{
          id:currentParentId,
          planetName:planetName
        }
      });

      console.log("parent user is ",parentUser)

      if(!parentUser  || distributedLevels.has(parentUser.currentLevel)){
        break;
      }

      if(parentUser.id === currentUser.id){
        console.log("cycle detected in this distribution tree");
        break;
      }

      if(parentUser.reg_user_address === OWNER_ADDRESS){
        let totalAmt = 0;

        for(let level = 5;level >=6 - remainingLevel;level--){
          totalAmt += amount * earningsDistribution[level];
        }

        const updateAutoPoolEarning = await prisma.cosMosAutoPool.update({
          where:{
            id:parentUser.id,
            planetName:planetName
          },
          data:{
            autoPoolEarning :{increment:totalAmt}
          }
        });

        console.log("updatedAutopool earning history ",updateAutoPoolEarning);

        break;

      }

      let levelDifference = Math.max(currentUser.currentLevel! - parentUser.currentLevel!);
      console.log(`currentuser level ${currentUser.currentLevel} and parentuser currentLevel ${parentUser.currentLevel} and level dif ${levelDifference}`);
      const distributionPercentage = earningsDistribution[levelDifference] || 0;

      console.log('distribute percentage ',distributionPercentage);
      let distributeAmount = amount * distributionPercentage;
      console.log("distributeAmount",distributeAmount);

      if(typeof parentUser.autoPoolEarning !== 'number'){
        parentUser.autoPoolEarning = 0;
      }

      distributeAmount = typeof distributeAmount === 'number'? distributeAmount : 0;
      console.log("dist amount is ",distributeAmount);

      const addDistributionAmt = await prisma.cosMosAutoPool.update({
        where:{
          id:parentUser.id,
          planetName:planetName
        },
        data:{
          autoPoolEarning:{increment:distributeAmount}
        }
      })

      console.log("addDistributionAmt",addDistributionAmt);

      //now its time push the earning history in the earning array;

      console.log("current parent id where its going to store ",currentParentId)

     const newEariningHistoryEntry = await prisma.earningHistory.create({
      data:{
        recycleNumber:currentUser.currentRecycle || 0,
        reg_user_address:currentUser.reg_user_address,
        bn_id:currentUser.bn_id,
        planetName:planetName,
        amount:distributeAmount,
        currentPosition:currentUser.currentPosition!,
        currentLevel:currentUser.currentLevel!,
        autoPool:{
          connect:{id:currentParentId}
        }
      }
     })

     console.log("newEariningHistoryEntry",newEariningHistoryEntry)
     

     if(newEariningHistoryEntry){
      distributedLevels.add(parentUser.currentLevel)
     }
     remainingLevel --;
     console.log('before currentnode is ',currentParentId)
     currentParentId = parentUser.parentId;
     console.log("after currentNode is ",currentParentId)
      

    }



    
  } catch (error) {
    console.log("something went wrong in the distibuteEarnings ",error)
  }
}

function calculateLevelFromPosition(position: number) {
  if (position < 1) {
    return undefined;
  }

  const adjustedPosition = position - 1;

  let level = Math.floor(Math.log2(adjustedPosition + 1));

  return level;
}

function calculateParentDetails(position: number, level: number) {
  let parentPosition, parentLevel;

  parentPosition = Math.floor(position / 2);

  parentLevel = level - 1;

  return { parentPosition, parentLevel };
}

async function findSuitableParent(planetName: string,currentUserId:string) {
  try {
    let queue = [];

    const rootNode = await prisma.cosMosAutoPool.findFirst({
      where: {
        planetName: planetName,
        isRoot: true,
      },
      select: {
        id: true,
        children: { select: { id: true }, take: 62 }, // Fetch only necessary data
      },
    });

    if(rootNode?.id === currentUserId){
      return null;
    }



    console.log('root node is  ',rootNode)

    if (!rootNode) {
      throw new Error("Root node not found.");
    }

    
    queue.push(rootNode);

    while (queue.length > 0) {
      const currentNode:any = queue.shift();
      console.log("current Node ",currentNode.id)

      console.log("queue has ",queue)

      if (currentNode?.children && currentNode.children.length < 62) {
        console.log('currentNode ',currentNode)
        return currentNode;
      }

      if (currentNode?.children && currentNode.children.length > 0) {
        const childNodes = await prisma.cosMosAutoPool.findMany({
          where: {
            parentId: currentNode.id || 2,
          },
          select: {
            id: true,
            children: { select: { id: true }, take: 62 },
          },
        });

        console.log("helo")
        console.log("child nodes are ",childNodes)

        queue.push(...childNodes);
      }
    }

    return null;
  } catch (error) {
    console.error("Error finding suitable parent:", error);
    return null;
  }
}

async function addChildToPlanetTreeTemporarily(
  currentRootId: string,
  currentRootAddress:string,
  userId: string,
  userAddress:string,
  level: number,
  position: number,
  planetName: string,
  
) {
  try {

  console.log(`current root id ${currentRootId} and root address ${currentRootAddress} and user id ${userId} and ${userAddress}`)

    
   
    
    const tempNode = await prisma.temporaryChildrenSchema.upsert({
      where: {
        id:currentRootId , 
        planetName:planetName// Replace `uniqueId` with the actual id
      },
      update: {},
      create: {
        panrentAddress: currentRootAddress,
        planetName: planetName,
      },
      select: {
        id: true,
        TempChild: { select: { childId: true } },
      },
      
    });
    

    const istempNodeAlreadyExist = tempNode.TempChild.some(
      (child) => child.childId === userId
    );

    if (istempNodeAlreadyExist) {
      return;
    }

    await prisma.temporaryChildrenSchema.update({
      where: { id: tempNode.id },
      data: {
        TempChild: {
          create: {
            childId: userId,
            childAddress:userAddress,
            level: level,
            position: position,
          },
        },
      },
    });

    console.log("everything is fine")
  } catch (error) {
    console.error("Error updating temporary children:", error);
  }
}

async function assignChildrenToNodesIteratively(
  planetName: string,
  initialNode: PrismaCurrentRoot,
  newUserLevel: number,
  newUserPosition: number,
  maxLevels = 5
) {
  try {
    let currentNode = initialNode;
    console.log("current Node id ",currentNode.id)
    console.log("parent id is ",currentNode.parentId)
    let currentLevel = 1;

    while (currentLevel <= maxLevels && currentNode) {
      console.log("current level is ",currentLevel)
      let parent 


      if(currentNode.parentId){
        parent = currentNode.parentId;
      }
      else{
        console.log('no parent')
        parent =await findSuitableParent(planetName,currentNode.id);


        if (!parent && !currentNode.isRoot) {
          await prisma.cosMosAutoPool.update({
            where: { id: currentNode.id },
            data: { isRoot: true },
          });
          break;
        } else if (parent) {
          console.log("hello parent ji",parent.id)


          currentNode.parentId = parent.id;
          console.log("currentNode.parentId ",currentNode.parentId)
          await prisma.cosMosAutoPool.update({
            where: { id: currentNode.id },
            data: { parentId: parent.id},
          });
        }

      }
      

      console.log("parent id is ",parent)
      let parentsDetails = await prisma.cosMosAutoPool.findFirst({
        where:{
          id:parent.id,
          planetName:planetName
        }
      })


     



       if(parentsDetails){
        if (parent) {
          console.log("parentDetails is" ,parentsDetails)


          console.log('parent vairable has ',parent)
          const parentChildrenCount = await prisma.children.count({
            where: {
              parentId: parent,
              planetName:planetName
            },
          });
          console.log('parentChildrencount ',parentChildrenCount)
  
          if (parentChildrenCount < 62) {
           
            const existingChild = await prisma.children.findFirst({
              where: {
                wallet_address:initialNode.reg_user_address,
                parentId: parent, 
                planetName: planetName
              }
            });
        
            // If no existing child found, create a new one
            if (!existingChild) {
              const newChild = await prisma.children.create({
                data: {
                  planetName:planetName,
                  wallet_address: initialNode.reg_user_address,
                  parentId: parent, // Assuming parent.id is the foreign key for the autoPool
                }
              });
          
            console.log(`parent address ${parentsDetails.reg_user_address} and currentNode adddress ${currentNode.reg_user_address}`)
  
            await addChildToPlanetTreeTemporarily(
              parentsDetails.id,
              parentsDetails.reg_user_address,
              initialNode.id,
              initialNode.reg_user_address,
              newUserLevel,
              newUserPosition,
              planetName
            );
             console.log("before current node is ass",currentNode);
            currentNode = parentsDetails; // Move to the parent node for the next iteration
            console.log('after current node is ass ',currentNode)
          } else {
            console.error("Parent already has 62 children. Skipping.");
            break;
          }
        } else {
          console.error("No parent found or assigned for node:", currentNode);
          break;
        }
       }
      }

      currentLevel++;
    }
  } catch (error) {
    console.error("An error occurred during assignment:", error);
  }
}

function getCurrentRootParentPosition(position: number) {
  let parentPosition = Math.floor(position / 2);

  return parentPosition;
}

async function updateChildrenParent(
  planetName: string,
  currentUser: string,
  newParentForCurrentRootChildren: string
) {
  try {
    const childs = await prisma.cosMosAutoPool.findMany({
      where: {
        planetName: planetName,
        reg_user_address: currentUser,
      },
    });

    if (!childs) {
      console.log("no childrens updateChildrenParent");
      return;
    }
    console.log(
      `childrens find from ${planetName}  and childrens are ${childs}`
    );

    for (const child of childs) {
      console.log("childs is ", child.reg_user_address);
      child.parentId = newParentForCurrentRootChildren;
    }
  } catch (error) {
    console.log("something went wrong in updateChildrenParent", error);
  }
}

async function transitionRootUserIfNeeded(
  userAddress: string,
  planetName: string,
  universalPlanetCount: number,
  planetPrice :number
) {
  try {
    let currentRoot = await prisma.cosMosAutoPool.findFirst({
      where: {
        isRoot: true,
        planetName: planetName,
      },
      include: {
        recycle: {
          include: {
            indexMappings: true,
          },
        },
        children: true,
      },
    });

    console.log("current root in transition ", currentRoot);

    if (!currentRoot) {
      return;
    }

     
    console.log('current root children length is  ',currentRoot.children.length);

    if(currentRoot.children.length === 62){
      const childrenData = await prisma.temporaryChildrenSchema.findFirst({
        where: {
          panrentAddress: currentRoot.reg_user_address,
          planetName: planetName,
        },
        include: {
          TempChild: true,
        },
      });
  
      console.log("children data ", childrenData);
  
      const childrenToMove = childrenData ? childrenData.TempChild : [];
      console.log("children to move", childrenToMove);
  
      let shouldIncrementRecycleCount;
      let maxRecycleCount;
      let newRecycleCount;
  
      console.log("currentRoot.recycle.length",currentRoot.recycle.length)
  
      if (currentRoot.recycle.length >= 1) {
        shouldIncrementRecycleCount = currentRoot.recycle.some(
          (recycleEntry) => recycleEntry.indexMappings.length > 0
        );
  
        console.log("shouldIncrementRecycleCount",shouldIncrementRecycleCount)
  
        maxRecycleCount = currentRoot.recycle.reduce(
          (max, curr) => Math.max(max, curr.recycleCount),
          -1
        );
        console.log('maxRecyclecount ',maxRecycleCount)
  
  
        newRecycleCount = shouldIncrementRecycleCount
          ? maxRecycleCount + 1
          : maxRecycleCount;
  
          console.log("newRecycleCount",newRecycleCount)
      } else {
        const pool = await prisma.cosMosAutoPool.findFirst({
          where: {
            reg_user_address: currentRoot.reg_user_address,
            planetName: planetName,
          },
          include: {
            recycle: true,
          },
        });
  
        console.log("pool ",pool)
  
        if (!pool) {
          console.log("no pool is there");
          return;
        }
  
        // For example, get the recycleCount from the first RecycleMapping record.
        const firstRecycleEntry = pool.recycle[0];
        newRecycleCount = firstRecycleEntry ? firstRecycleEntry.recycleCount : 0;
        console.log("newRecycleCount ", newRecycleCount);
      }
  
      const getRcycleEntry = currentRoot.recycle[0];
      console.log("get recycle entry ", getRcycleEntry);
      console.log("current root recycle ", currentRoot.recycle);
  
      // Update recycleCount for each related RecycleMapping record
      await Promise.all(
        currentRoot.recycle.map(async (recycleEntry) => {
          await prisma.recycleMapping.update({
            where: {
              id: recycleEntry.id,
            },
            data: {
              recycleCount: newRecycleCount,
            },
          });
        })
      );
  
      const pool = await prisma.cosMosAutoPool.findFirst({
        where: {
          reg_user_address: currentRoot.reg_user_address,
          planetName: planetName,
        },
        include: {
          recycle: {
            include: {
              indexMappings: {
                include: {
                  userIds: true, // Ensure userIds are included
                },
              },
            },
          },
        },
      });
  
      console.log("'another pool ",pool)
  
      if (!pool) {
        console.log(
          "No pool found with the specified reg_user_address and planetName."
        );
        return;
      }
  
      // Check if there's an existing RecycleMapping record to update or create a new one
      const existingRecycle = await prisma.recycleMapping.findFirst({
        where: {
          autoPoolId: pool.id,
        },
        include: {
          indexMappings: {
            include: {
              userIds: true,
            },
          },
        },
      });
  
      console.log('existingRecycle',existingRecycle)
  
      if (existingRecycle) {
        // Update the existing RecycleMapping record
        await prisma.recycleMapping.update({
          where: {
            id: existingRecycle.id,
          },
          data: {
            recycleCount: newRecycleCount,
          },
        });
  
        // Update existing IndexMappings and create new ones
        for (const child of childrenToMove) {
          const existingIndexMapping = existingRecycle.indexMappings.find((im) =>
            im.userIds.some((user) => user.id === child.childId)
          );
  
          console.log("child of each loop",child.childAddress)
  
          if (existingIndexMapping) {
            const  updateIndexmapping =   await prisma.indexMapping.update({
              where: {
                id: existingIndexMapping.id,
              },
              data: {
                userLevel: child.level,
                userPosition: child.position,
                userIds: {
                  set: [{ id: child.childId }],
                },
              },
            });
  
           console.log("updateIndexmapping",updateIndexmapping)
          } else {
            const updateIndexmapping1 =  await prisma.indexMapping.create({
              data: {
                userLevel: child.level,
                userPosition: child.position,
                userIds: {
                  connect: [{ id: child.childId }],
                },
                recycleMappingId: existingRecycle.id,
              },
            });
  
            console.log('updateIndexmapping1',updateIndexmapping1)
          }
  
  
        }
      } else {
        // Create a new RecycleMapping record
  
       const createRecycleMapping =   await prisma.recycleMapping.create({
          data: {
            recycleCount: newRecycleCount,
            autoPoolId: pool.id,
            indexMappings: {
              create: childrenToMove.map((child) => ({
                userLevel: child.level,
                userPosition: child.position,
                userIds: {
                  connect: [{ id: child.childId }],
                },
              })),
            },
          },
        });
  
        console.log('createRecycleMapping',createRecycleMapping)
      }
  
      // now transfer the Root user
      await prisma.cosMosAutoPool.update({
        where: {
          id:currentRoot.id,
          reg_user_address: currentRoot.reg_user_address,
          planetName: planetName,
        },
        data: {
          isRoot: false,
        },
      });
  
      await prisma.children.updateMany({
        where: {
          parentId: currentRoot.id,
        },
        data: {
          parentId: undefined,
        },
      });
  
      const newParentForCurrentRootChildren = currentRoot.parentId;
      console.log(
        "newParentForCurrentRootChildren: -->  ",
        newParentForCurrentRootChildren
      );
  
      await updateChildrenParent(
        planetName,
        currentRoot.reg_user_address,
        newParentForCurrentRootChildren!
      );

      await distributeEarnings(currentRoot.id,planetName,universalPlanetCount,planetPrice)

  
      const nextRootposition = currentRoot.currentPosition! + 1;
  
      console.log("next root position ", nextRootposition);
  
      const nextRootUser = await prisma.cosMosAutoPool.findFirst({
        where: {
          currentPosition: nextRootposition,
          planetName: planetName,
        },
      });
  
      if (!nextRootUser) {
        console.log("No next  root user not found");
      }
  
      const newParentForNextRoot = currentRoot.parentId;
      console.log("new parent id for next root is  ", newParentForNextRoot);
  
      if (nextRootUser) {
        await prisma.cosMosAutoPool.update({
          where: {
            id:nextRootUser.id,
            planetName: planetName,
            reg_user_address: nextRootUser!.reg_user_address,
          },
          data: {
            parentId: newParentForNextRoot,
          },
        });
      }
  
      let currentRootLevel = currentRoot.currentLevel;
      let currentRootPosition = currentRoot.currentPosition;
      const lastUserPositionRecord = await prisma.cosMosAutoPool.findFirst({
        where: {
          planetName: planetName,
        },
        orderBy: {
          currentPosition: "desc",
        },
        take: 1,
      });
  
      const lastUserPosition = lastUserPositionRecord?.currentPosition || 1;
      console.log("last user positon ", lastUserPosition);
  
      currentRoot.currentPosition = lastUserPosition + 1;
      console.log("new position for root user ", lastUserPosition + 1);
  
      currentRoot.currentLevel = Math.floor(
        Math.log2(currentRoot.currentPosition)
      );
  
      console.log("new level for root user ", currentRoot.currentLevel);
  
      const currentRootParentPosition = getCurrentRootParentPosition(
        currentRoot.currentPosition
      );
  
      console.log("currentRootParentPosition ", currentRootParentPosition);
  
      //update current root new positon,universalPlanetCount and parent;
  
      const currentRootParent = await prisma.cosMosAutoPool.findFirst({
        where: {
          planetName: planetName,
          currentPosition: currentRootParentPosition,
        },
      });
  
      if (!currentRootParent) {
        console.log("currentRootParent is not found ");
      }
  
      ///update the universalPlanetCount and parent  currentRoot
  
      const updateUniversalCountandParent = await prisma.cosMosAutoPool.update({
        where: {
          id:currentRoot.id,
          planetName: planetName,
          reg_user_address: currentRoot.reg_user_address,
        },
        data: {
          universeSlot: universalPlanetCount,
          parentId: currentRootParent!.id,
        },
      });
  
      console.log(
        "updateUniversalCountandParent ",
        updateUniversalCountandParent
      );
  
      const updatePlanetUnivseralCount = await prisma.planet.update({
        where: {
          planetName: planetName,
        },
        data: {
          universalCount: {
            increment: 1,
          },
        },
      });
  
      console.log("updatePlanetUnivseralCount", updatePlanetUnivseralCount);
  
      await assignChildrenToNodesIteratively(
        planetName,
        currentRoot,
        currentRoot.currentLevel,
        currentRoot.currentPosition
      );
  
      if (nextRootUser) {
        await prisma.cosMosAutoPool.update({
          where: {
            id:nextRootUser.id,
            reg_user_address: nextRootUser.reg_user_address,
            planetName: planetName,
          },
          data: {
            isRoot: true,
          },
        });
  
        await addChildToPlanetTreeTemporarily(
          nextRootUser.id,
          nextRootUser.reg_user_address,
          currentRoot.id,
          currentRoot.reg_user_address,
          currentRootLevel!,
          currentRootPosition!,
          planetName
        );
  
        console.log("Transitioned to new root user:", nextRootUser);
        return nextRootUser;
      }
    }

    return currentRoot;

    //  currentRoot.recycle.find()
  } catch (error) {
    console.log("something went wrong in transitionRootUserIfNeeded", error);
  }
}

export const distributeAutopoolEarning = async (
  userAddress: string,
  planetName: string,
  planetNum: number,
  planetPrice: number,
  universalPlanetCount: number,
  bn_id: string
) => {
  try {
    console.log(
      `user address: ${userAddress} and universalCount is ${universalPlanetCount}`
    );
    if (universalPlanetCount === 1) {
      const firstUserparent = await prisma.cosMosAutoPool.findFirst({
        where: { isRoot: false, planetName: planetName },
      });

      if (!firstUserparent) {
        throw new Error("Parent not found");
      }

      const firstUser = await prisma.cosMosAutoPool.create({
        data: {
          bn_id,
          reg_user_address: userAddress,
          isRoot: true,
          universeSlot: universalPlanetCount,
          currentLevel: 0,
          currentPosition: 1,
          planetName: planetName,
          parent: {
            connect: { id: firstUserparent.id },
          },
          
        },
      });

      console.log("Updating parent record with id:", firstUserparent.id);
      console.log("Connecting child record with id:", firstUser.id);

      console.log("first user is ", firstUser);

      // Update the parent record to add the new child
      await prisma.cosMosAutoPool.update({
        where: { id: firstUserparent.id },
        data: {
          children: {
            connect: {
              id: firstUser.id,
            },
          },
        },
      });

      return;
    }

    let currentRoot = await transitionRootUserIfNeeded(
      userAddress,
      planetName,
      universalPlanetCount,
      planetPrice
    );

    console.log("current root is ---> ", currentRoot);

    const lastUserPosition = await prisma.cosMosAutoPool.findFirst({
      orderBy: {
        currentPosition: "desc",
      },
      select: {
        currentPosition: true,
      },
    });

    const lastPositionValue = lastUserPosition?.currentPosition ?? 1;

    const newPosition = lastPositionValue + 1;
    const newLevel = calculateLevelFromPosition(newPosition);

    let newParent;

    const { parentPosition, parentLevel } = calculateParentDetails(
      newPosition,
      newLevel!
    );

    const potentialParent = await prisma.cosMosAutoPool.findFirst({
      where: {
        planetName: planetName,
        currentPosition: parentPosition,
        currentLevel: parentLevel,
      },
    });

    if (potentialParent) {
      newParent = potentialParent;
      console.log("found potential parent ", newParent);
    } else {
      console.error(
        "No potential parent found for position",
        parentPosition,
        "and level",
        parentLevel
      );
    }

    const planetCount = await prisma.planet.findFirst({
      where: {
        planetName: planetName,
      },
    });

    let currentUniversalCount = planetCount?.universalCount;
    console.log("current universal planet count ", currentUniversalCount);
    console.log("universalCount ", universalPlanetCount);

    if (!newParent) {
      throw error("something went wrong in create newParet");
    }

    const newUser: PrismaCurrentRoot = await prisma.cosMosAutoPool.create({
      data: {
        bn_id: bn_id,
        reg_user_address: userAddress,
        planetName: planetName,
        universeSlot: universalPlanetCount,
        currentLevel: newLevel,
        currentPosition: newPosition,
        isRoot: false,
        parentId: newParent.id,
      },
    });

    if (!newUser) {
      throw error("something went wrong in creating new user");
    }

    await assignChildrenToNodesIteratively(
      planetName,
      newUser,
      newUser.currentLevel!,
      newUser.currentPosition!
    );

    await distributeEarnings(newUser.id,planetName,universalPlanetCount,planetPrice);
  } catch (error) {
    console.log("something went wrong in distributeAutopoolEarning", error);
  }
};

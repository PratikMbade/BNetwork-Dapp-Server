import Web3, { BlockNumberOrTag } from 'web3';
import { PrismaClient } from '@prisma/client';
import { updateAncestors } from '../../helper/user';
import CosMos_ABI from '../cosmos_contract/cosmos_abi.json'
import { error, log } from 'console';
import { buyCosmosPlanetsEvent } from '../../controllers/cosmos-network/buyplanet';
import { string } from 'zod';

const prisma = new PrismaClient();



const web3 = new Web3(new Web3.providers.WebsocketProvider(process.env.EVENT_URL!));
const contractAddress = '0x5ea64Ab084722Fa8092969ED45642706978631BD';
const contract = new web3.eth.Contract(CosMos_ABI, contractAddress);

export const registrationHandler = async (publicAddress: string, sponsorAddress: string,regId:number) => {
  try {
    console.log("public got", publicAddress);
    console.log("sponsor got", sponsorAddress);

    if (!publicAddress || !sponsorAddress) {

      return { msg: "Insufficient data", success: false };
    }

    const isUser = await prisma.user.findFirst({
      where: { wallet_address: publicAddress },
    });



    const isSponsorExist = await prisma.user.findFirst({
      where: { wallet_address: sponsorAddress },
      include: { bnCoinEarned: true , direct_team:true }
    });


    if (!isSponsorExist) {
      return { msg: "Sponsor is not registered", success: false };
    }

    const last8Characters = publicAddress.slice(-8);
    const newBNId = "BN" + last8Characters;

    const BNMaxRewardsCoins = await prisma.bNCoinConfig.findUnique({
      where: { key: "BNMaxRewardsCoins" },
    });
    


    if (!BNMaxRewardsCoins) {
      return { msg: "Configuration not found", success: false };
    }


 

    let bnCoinRegistration:number = 0;
    let bnCoinSponserReward:number = 0;

    if (BNMaxRewardsCoins.BNCoinDistributed! + 0.075 < BNMaxRewardsCoins.BNMaxRewardsCoins) {
      bnCoinRegistration = 0.05;
      bnCoinSponserReward = 0.025
    }

    const newUser = await prisma.user.create({
      data: {
        regId: regId,
        wallet_address: publicAddress,
        sponser_address: sponsorAddress,
        bn_id: newBNId,
        isRegistered: true,
        bnCoinEarned: {
          create: {
            bn_id: newBNId,
            wallet_address: publicAddress,
            amount: bnCoinRegistration,
            timeStamp: new Date(),
          },
        },
      },
    });

    await prisma.user.upsert({
      where: {
        wallet_address: isSponsorExist.wallet_address,
      },
      update: {
        directTeam_Count: { increment: 1 },
      },
      create: {
        wallet_address: isSponsorExist.wallet_address,
        directTeam_Count: 1,
      },
    });

    

    let incrementBNCoinAmountSponser = 0;
    isSponsorExist.bnCoinEarned.find((item) => {
      const sponserBNCoin = item.amount ?? 0;
      incrementBNCoinAmountSponser = sponserBNCoin + bnCoinSponserReward;
    });


    await prisma.user.update({
      where: { id: isSponsorExist.id },
      data: {
        direct_team: {
          create: {
            wallet_address: newUser.wallet_address,
            id: newUser.id,
          },
        },
        bnCoinEarned:{
          create:{
            bn_id:newUser.bn_id!,
            wallet_address:newUser.wallet_address,
            amount:bnCoinSponserReward,
            timeStamp:new Date()
          },
        }
      },
      include: { direct_team: true ,bnCoinEarned:true},
    });
   


      await prisma.bNCoinConfig.update({
      where: { key: "BNMaxRewardsCoins" },
      data: {
        BNCoinDistributed: {
          increment: bnCoinRegistration + bnCoinSponserReward, 
        },
        BNMaxAirDropCoins:{
          decrement:bnCoinRegistration + bnCoinSponserReward
        }
      },
     });


    await updateAncestors(isSponsorExist.wallet_address, publicAddress);

    return { msg: "User registered successfully", success: true };
  } catch (error: any) {
    console.log(error);
    if (error.code === "P2002") {
      return {
        msg: "User with this wallet address already exists",
        success: false,
      };
    }
    return { msg: "Internal Server Error", success: false };
  }
};

 const fetchEventDataFromTransaction = async (transactionHash: any) => {
    try {
        const receipt = await web3.eth.getTransactionReceipt(transactionHash);

        if (!receipt || !receipt.logs) {
            console.error(`Receipt or logs not found for transaction ${transactionHash}.`);
            return;
        }

        receipt.logs.forEach((log) => {
            try {
                if (!log) {
                    console.error('Log is undefined.');
                    return;
                }
            
                if (!log.topics || !Array.isArray(log.topics) || !log.data) {
                    console.error('Log topics or data are undefined or incorrectly formatted.', log);
                    return;
                }
             

                const decodedLog = web3.eth.abi.decodeLog(
                    [{ type: 'address', name: 'user' }, { type: 'address', name: 'referral' },{type:'uint256',name:'id'}],
                    //@ts-ignore
                    log.data,
                    log.topics.slice(1) 
                );

                const { user, referral,id } = decodedLog ;

                console.log(`New registration detected: user=${user}, referral=${referral} regId = ${id}`);

                // if(!user || !referral){
                //     return
                // }

                registrationHandler(String(user),String(referral),Number(id))

         } catch (error) {
                console.error('Error decoding log:', error);
            }
        });

    } catch (error) {
        console.error('Error fetching event data from transaction:', error);
    }
};
const eventABI = {
  anonymous: false,
  inputs: [
    {
      indexed: false,
      internalType: 'address',
      name: 'user',
      type: 'address'
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'plannetId',
      type: 'uint256'
    }
  ],
  name: 'plannetBuy',
  type: 'event'
};



const fetchEventDataFromTransactionBuyPlanet = async (transactionHash:string) => {
  try {
    // Fetch the transaction receipt
    const receipt = await web3.eth.getTransactionReceipt(transactionHash);
    
    if (!receipt || !receipt.logs) {
      console.error(`Receipt or logs not found for transaction ${transactionHash}.`);
      return;
    }

    // Loop through the logs to find and decode the event
    for (const log of receipt.logs) {
      try {
        // Filter only logs that match the event signature hash
        const eventSignature = web3.eth.abi.encodeEventSignature(eventABI);
        console.log("even signature",eventSignature)
        
        //@ts-ignore
        if (log.topics[0] === eventSignature) {
          // Decode the event data
          //@ts-ignore
          const decodedLog = web3.eth.abi.decodeLog(eventABI.inputs, log.data, log.topics.slice(1));
          
          if (decodedLog) {
            const user = decodedLog.user;
            const plannetId = decodedLog.plannetId;

            console.log(`plannetBuy Event Detected: user=${user}, plannetId=${plannetId}`);
            buyCosmosPlanetsEvent(String(user),Number(plannetId))
            return { user, plannetId };
          }
        }
      } catch (error:any) {
        console.error('Error decoding log:', error.message);
      }
    }
  } catch (error) {
    console.error('Error fetching event data from transaction:', error);
  }
};





    

export const listenOnContractRegistratoin = async () => {
    try {
        console.log('Starting to listen on contract events...');

        const eventSignature = web3.utils.sha3('regUserEv(address,address,uint256)');
        if(!eventSignature){
            return;
        }

        const subscription = await web3.eth.subscribe('logs', {
            address: contractAddress,
            topics: [eventSignature]
        });
       subscription.on('data', async (log: any) => {
            const { transactionHash } = log;
            console.log(`New registration detected in transaction: ${transactionHash}`);

            await fetchEventDataFromTransaction(transactionHash);
        });

        subscription.on('error', (error: any) => {
            console.error('Error in event subscription:', error);
        });

    } catch (error) {
        console.error('Error in listenOnContract:', error);
    }
};

export const listenOnContractBuyPlanet = async () =>{
  try {
    console.log('starting to listen on contract events.. buy planet');

    const eventSignature = web3.utils.sha3('plannetBuy(address,uint256)');
  
    if(!eventSignature) return;
  
   
    const subscription = await web3.eth.subscribe('logs', {
      address: contractAddress,
      //@ts-ignore
      topics: [eventSignature] // Use 'undefined' instead of 'null'
    });
    
    subscription.on('data',async(log:any)=>{
      const {transactionHash} = log;
      console.log(`New registration detected in transaction: ${transactionHash}`);
      console.log("logs are",log)
      await fetchEventDataFromTransactionBuyPlanet(transactionHash)
  
    });
  
    subscription.on('error',(error:any)=>{
      console.error('error in event subscription',error)
    })
  } catch (error) {
    console.error('Error in listenOnContractBuyPlanet:', error);

  }
}




  
import { keccak256, ecsign, ecrecover, fromRpcSig, hashPersonalMessage } from 'ethereumjs-util';



export async function verifySignature(req: any) {
    const { signatureHex, wallet_address, sponser_address } = req.body;
  
    const signature = signatureHex.startsWith('0x') ? signatureHex.slice(2) : signatureHex;
  
    const sigBuffer = Buffer.from(signature, 'hex');
  
    const signedString = 'Sign into mechanical turks';
    const message = Buffer.from(
      '\x19Ethereum Signed Message:\n' + signedString.length + signedString,
      'utf8'
    );
  
    const messageHash = keccak256(message);
  
    const { v, r, s } = fromRpcSig(signatureHex);
    const publicKey = ecrecover(messageHash, v, r, s);
  
    const recoveredAddress = '0x' + keccak256(publicKey).slice(-20).toString('hex');
  
    const isValidSignature = recoveredAddress.toLowerCase() === wallet_address.toLowerCase();
  
    console.log("Is the signature valid?", isValidSignature);
    return isValidSignature;
  }
//HD wallets are type of wallets that can generate a tree of key pairs from a single seed 

import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";

export interface AccountDetails {
    path: string;
    publicKey: string;
    privateKey: string;
}

// Generate a new mnemonic (seed phrase)
export function createWallet() {
    const mnemonic = generateMnemonic();
    return { mnemonic, seed: mnemonicToSeedSync(mnemonic) };
}

// Get account details from derivation path and seed
export function getAccountFromPath(path: string, seed: Buffer): AccountDetails {
    const derivedSeed = derivePath(path, seed.toString("hex")).key;
    const keypair = Keypair.fromSeed(derivedSeed);
    
    return {
        path,
        publicKey: keypair.publicKey.toBase58(),
        privateKey: Buffer.from(keypair.secretKey).toString('hex')
    };
}

// Derive Solana accounts from seed
export function deriveAccounts(seed: Buffer, numAccounts: number = 4): AccountDetails[] {
    const accounts: AccountDetails[] = [];
    
    for (let i = 0; i < numAccounts; i++) {
        try {
            const path = `m/44'/501'/${i}'/0'`;  // Solana derivation path
            const account = getAccountFromPath(path, seed);
            accounts.push(account);
        } catch (err) {
            const error = err as Error;
            console.error(`Error deriving account ${i}:`, error.message || 'Unknown error');
        }
    }

    return accounts;
}

// Function to get a specific account by index
export function getAccount(mnemonic: string, index: number): AccountDetails {
    const seed = mnemonicToSeedSync(mnemonic);
    const path = `m/44'/501'/${index}'/0'`;
    return getAccountFromPath(path, seed);
}

// Function to recover wallet from mnemonic
export function recoverWallet(mnemonic: string, numAccounts: number = 4): AccountDetails[] {
    const seed = mnemonicToSeedSync(mnemonic);
    return deriveAccounts(seed, numAccounts);
}

/* Derivation Path Components:
m/44'/501'/account'/0'
- m: Master node
- 44': BIP44 standard
- 501': Solana's coin type
- account': Account index
- 0': External chain
*/ 


// const mnemonic = generateMnemonic();
// const seed = mnemonicToSeedSync(mnemonic);
// for (let i = 0; i < 4; i++) {
//   const path = `m/44'/501'/${i}'/0'`; // This is the derivation path
//   const derivedSeed = derivePath(path, seed.toString("hex")).key;
//   const keypair = Keypair.fromSeed(derivedSeed);
//   console.log(keypair.publicKey.toBase58());
//   console.log(Buffer.from(keypair.secretKey).toString("hex"));
// }  //both the thing are same 

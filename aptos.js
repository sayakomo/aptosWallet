import bip39 from "bip39";
import fs from "fs";
import path from "path";
import prompt from "prompt-sync";
import { AptosWallet } from "@okxweb3/coin-aptos";

class Wallet {
    constructor() {
        this.wallet = new AptosWallet();
    }

    generateMnemonic() {
        return bip39.generateMnemonic();
    }

    async getPrivateKey(mnemonic) {
        const param = {
            mnemonic: mnemonic,
            hdPath: "m/44'/637'/0'/0'/0'"
        };
        try {
            return await this.wallet.getDerivedPrivateKey(param);
        } catch (error) {
            console.error("Error getting private key:", error);
            throw error;
        }
    }

    async generateAddress(privateKey) {
        const param = {
            privateKey,
            addressType: "short"
        };
        try {
            const { address, publicKey } = await this.wallet.getNewAddress(param);
            return this.isValidAddress(address) ? { address, publicKey } : null;
        } catch (error) {
            console.error("Error generating address:", error);
            throw error;
        }
    }

    isValidAddress(address) {
        const param = {
            address
        };
        return this.wallet.validAddress(param);
    }

    async generate() {
        const mnemonic = this.generateMnemonic();
        try {
            const privateKey = await this.getPrivateKey(mnemonic);
            const walletInfo = await this.generateAddress(privateKey);
            return walletInfo ? { ...walletInfo, mnemonic } : null;
        } catch (error) {
            console.error("Error generating wallet:", error);
            return null;
        }
    }

    async createWallets(count) {
        const wallets = [];
        for (let i = 0; i < count; i++) {
            const wallet = await this.generate();
            if (wallet) {
                wallets.push(wallet);
            }
        }

        const filePath = path.join(process.cwd(), 'wallets.json');
        fs.writeFileSync(filePath, JSON.stringify(wallets, null, 2));
        console.log(`${wallets.length} wallets created and saved to ${filePath}`);
        return wallets;
    }
}
//komo
const wallet = new Wallet();
const promptSync = prompt();
const number = parseInt(promptSync("Enter number of wallets to generate: "), 10);
if (isNaN(number) || number <= 0) {
    console.error("Please enter a valid number greater than 0.");
} else {
    wallet.createWallets(number).catch(error => {
        console.error("Error creating wallets:", error);
    });
}

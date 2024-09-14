const bip39 = require("bip39");
const fs = require('fs');
const path = require('path');
const prompt = require('prompt-sync')({sigint: true});
const { AptosWallet } = require("@okxweb3/coin-aptos");

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
        return await this.wallet.getDerivedPrivateKey(param);
    }

    async generateAddress(privateKey) {
        const param = {
            privateKey,
            addressType: "short"
        };
        const {address, publicKey} = await this.wallet.getNewAddress(param);
        return this.isValidAddress(address) ? {
            address,
            publicKey
        } : null;
    }

    isValidAddress(address) {
        const param = {
            address
        };
        return this.wallet.validAddress(param);
    }

    async generate() {
        const mnemonic = this.generateMnemonic();
        const privateKey = await this.getPrivateKey(mnemonic);
        const walletInfo = await this.generateAddress(privateKey);
        return walletInfo ? {
            ... walletInfo,
            mnemonic
        } : null;
    }

    async createWallets(count) {
        const wallets = [];
        for (let i = 0; i < count; i++) {
            const wallet = await this.generate();
            if (wallet) {
                wallets.push(wallet);
            }
        }

        const filePath = path.join(__dirname, 'wallets.json');
        fs.writeFileSync(filePath, JSON.stringify(wallets, null, 2));
        console.log(`${wallets.length} wallets created and saved to ${filePath}`);
        return wallets;
    }
}
// komo
const wallet = new Wallet();
const number = parseInt(prompt("Enter number of wallets to generate: "), 10);
if (isNaN(number) || number <= 0) {
    console.error("Please enter a valid number greater than 0.");
} else {
    wallet.createWallets(number);
}
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import { HttpNetworkConfig } from "hardhat/types";
import "@nomicfoundation/hardhat-ethers";
import "@vechain/sdk-hardhat-plugin";


dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const RPC_URL = process.env.RPC_URL || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

const config: HardhatUserConfig = {
solidity: {
  version: "0.8.20",
  settings: {
    optimizer: { enabled: true, runs: 200 },
    evmVersion: "paris", // or "shanghai" if needed
  }
},

  networks: {
  vechain_testnet: {
    url: "https://testnet.vechain.org",
    accounts: {
      mnemonic: "dish leisure miracle sign track logic patient burst cute lucky favorite mention",
      path: "m/44'/818'/0'/0",
      count: 3,
      initialIndex: 0,
      passphrase: "vechainthor"
    },
    gas: "auto",
    gasPrice: "auto"
  }
},

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;

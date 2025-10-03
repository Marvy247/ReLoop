# ReLoop Project

## Overview
ReLoop is a blockchain-based project that integrates smart contracts with a modern frontend built using Next.js. The project leverages the VeChain blockchain ecosystem and provides a user interface for interacting with deployed contracts.

## Project Structure
- `contracts/`: Contains Solidity smart contracts for the project.
- `frontend/`: Next.js frontend application with React components and pages.
- `scripts/`: Deployment and utility scripts for smart contracts.
- `ignition/`: Deployment artifacts and modules related to Hardhat Ignition.
- `hardhat.config.ts`: Hardhat configuration file for compiling, testing, and deploying contracts.

## Frontend
The frontend is a Next.js application located in the `frontend` directory. It uses React 18 and integrates with VeChain SDKs and other blockchain tools. The frontend includes pages for minting, recycling, product details, and user rewards.

### Running Frontend Locally
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open your browser at `http://localhost:3000`.

## Smart Contracts
Smart contracts are written in Solidity and located in the `contracts` directory. The project uses Hardhat for compilation, testing, and deployment.

### Deploying Contracts
1. Install dependencies in the root directory:
   ```bash
   npm install
   ```
2. Compile contracts:
   ```bash
   npx hardhat compile
   ```
3. Deploy contracts using the provided scripts:
   ```bash
   npx hardhat run scripts/deploy.ts --network <network-name>
   ```

## Vercel Deployment
The frontend is deployed on Vercel. The root directory contains a `vercel.json` configuration file that instructs Vercel to build and deploy the frontend from the `frontend` subdirectory.

## Dependencies
- Hardhat and related plugins for smart contract development.
- Next.js, React, and Tailwind CSS for frontend development.
- VeChain SDKs for blockchain interaction.

## Notes
- Ensure your `.env` file contains the necessary environment variables for deployment and local development.
- Use the `README.md` in the `frontend` directory for frontend-specific documentation.

## License
This project is licensed under the MIT License.

B3TR deployed to: 0xf1360185d7fd81071c5eabe44abc904b20fe9b44
DigitalTwin deployed to: 0xa4212fec0882313c86f25325972218b5ad909f6b
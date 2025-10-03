import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy B3TR token first
  const B3TR = await ethers.getContractFactory("B3TR");
  const b3tr = await B3TR.deploy(deployer.address);
  await b3tr.waitForDeployment();
  const b3trAddress = await b3tr.getAddress();
  console.log("B3TR deployed to:", b3trAddress);

  // Deploy DigitalTwin with B3TR address
  const DigitalTwin = await ethers.getContractFactory("DigitalTwin");
  const digitalTwin = await DigitalTwin.deploy(b3trAddress);
  await digitalTwin.waitForDeployment();
  const digitalTwinAddress = await digitalTwin.getAddress();
  console.log("DigitalTwin deployed to:", digitalTwinAddress);

  // Transfer some B3TR to DigitalTwin contract for rewards
  const rewardAmount = await digitalTwin.rewardAmount();
  const transferAmount = rewardAmount * 1000n; // Transfer enough for 1000 retires
  await b3tr.transfer(digitalTwinAddress, transferAmount);
  console.log("Transferred", transferAmount.toString(), "B3TR to DigitalTwin contract");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

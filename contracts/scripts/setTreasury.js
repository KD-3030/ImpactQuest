const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const treasuryAddress = process.env.TREASURY_ADDRESS;
  if (!contractAddress || !treasuryAddress) {
    console.error("Missing CONTRACT_ADDRESS or TREASURY_ADDRESS in env");
    process.exit(1);
  }

  const ImpactQuest = await hre.ethers.getContractAt("ImpactQuest", contractAddress);
  const tx = await ImpactQuest.setTreasury(treasuryAddress);
  await tx.wait();
  console.log("✅ Treasury address set to:", treasuryAddress);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

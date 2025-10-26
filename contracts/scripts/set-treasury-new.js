const hre = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = "0x5a1d5441D6abe5E4FaAd49756f5d8f3Cd8Ab88Fe";
  const TREASURY_ADDRESS = "0x459841F0675b084Ec3929e3D4425652ec165F6af";
  
  console.log("🏦 Setting treasury address on NEW contract...\n");
  console.log("Contract:", CONTRACT_ADDRESS);
  console.log("Treasury:", TREASURY_ADDRESS);
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Caller:", deployer.address);
  
  const ImpactQuest = await hre.ethers.getContractFactory("ImpactQuest");
  const contract = ImpactQuest.attach(CONTRACT_ADDRESS);
  
  console.log("\n📤 Setting treasury...");
  const tx = await contract.setTreasury(TREASURY_ADDRESS);
  console.log("Transaction hash:", tx.hash);
  
  await tx.wait();
  console.log("✅ Treasury set successfully!");
  
  // Verify
  const treasuryAddr = await contract.treasury();
  console.log("🔍 Verified treasury:", treasuryAddr);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

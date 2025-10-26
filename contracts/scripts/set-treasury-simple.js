const hre = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = "0xd5C8c2d9F22F681D67ec16b2B8e8706b718B9158";
  const TREASURY_ADDRESS = "0x459841F0675b084Ec3929e3D4425652ec165F6af";
  
  console.log("🏦 Setting treasury address...\n");
  console.log("Contract:", CONTRACT_ADDRESS);
  console.log("Treasury:", TREASURY_ADDRESS);
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Caller:", deployer.address);
  
  const ImpactQuest = await hre.ethers.getContractFactory("ImpactQuest");
  const contract = ImpactQuest.attach(CONTRACT_ADDRESS);
  
  try {
    console.log("\n📤 Sending transaction...");
    const tx = await contract.setTreasury(TREASURY_ADDRESS);
    console.log("Transaction hash:", tx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed!");
    console.log("Gas used:", receipt.gasUsed.toString());
    
    console.log("\n🎉 Treasury address set successfully!");
    console.log("\n🔗 View on Explorer:");
    console.log(`https://alfajores.celoscan.io/tx/${tx.hash}`);
    
  } catch (error) {
    console.error("\n❌ ERROR:", error.message);
    
    if (error.message.includes("Ownable")) {
      console.error("\n⚠️  The caller is not the contract owner!");
      console.error("   Owner wallet needed to set treasury");
    }
    
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

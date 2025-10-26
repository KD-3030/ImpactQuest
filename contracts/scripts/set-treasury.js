const hre = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = "0xd5C8c2d9F22F681D67ec16b2B8e8706b718B9158";
  
  // Treasury address - using oracle wallet for now
  // In production, this should be a dedicated treasury/multisig wallet
  const TREASURY_ADDRESS = "0x459841F0675b084Ec3929e3D4425652ec165F6af";
  
  console.log("🏦 Setting treasury address for ImpactQuest contract...\n");
  console.log("Contract Address:", CONTRACT_ADDRESS);
  console.log("Treasury Address:", TREASURY_ADDRESS);
  console.log("Network:", hre.network.name);
  
  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("\n📝 Caller:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(balance), "CELO\n");

  try {
    // Get contract instance
    const ImpactQuest = await hre.ethers.getContractFactory("ImpactQuest");
    const contract = ImpactQuest.attach(CONTRACT_ADDRESS);
    
    // Check current treasury
    console.log("🔍 Checking current treasury address...");
    const currentTreasury = await contract.treasury();
    console.log("Current treasury:", currentTreasury);
    
    if (currentTreasury === TREASURY_ADDRESS) {
      console.log("\n✅ Treasury is already set to the correct address!");
      return;
    }
    
    if (currentTreasury !== hre.ethers.ZeroAddress) {
      console.log("\n⚠️  Warning: Treasury is already set to a different address!");
      console.log("   Continuing will update it to:", TREASURY_ADDRESS);
    }
    
    // Set treasury
    console.log("\n📤 Sending transaction to set treasury...");
    const tx = await contract.setTreasury(TREASURY_ADDRESS);
    console.log("Transaction hash:", tx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    await tx.wait();
    console.log("✅ Transaction confirmed!\n");
    
    // Verify the change
    console.log("🔍 Verifying treasury was set correctly...");
    const newTreasury = await contract.treasury();
    console.log("New treasury:", newTreasury);
    
    if (newTreasury.toLowerCase() === TREASURY_ADDRESS.toLowerCase()) {
      console.log("\n🎉 SUCCESS! Treasury address set successfully!\n");
      console.log("📋 Summary:");
      console.log("   - Contract:", CONTRACT_ADDRESS);
      console.log("   - Treasury:", TREASURY_ADDRESS);
      console.log("   - Transaction:", tx.hash);
      
      if (hre.network.name === "alfajores") {
        console.log("\n🔗 View on Explorer:");
        console.log(`   https://alfajores.celoscan.io/tx/${tx.hash}`);
      }
    } else {
      console.log("\n❌ ERROR: Treasury verification failed!");
      console.log("   Expected:", TREASURY_ADDRESS);
      console.log("   Got:", newTreasury);
    }
    
  } catch (error) {
    console.error("\n❌ ERROR setting treasury:", error.message);
    
    if (error.message.includes("Ownable: caller is not the owner")) {
      console.error("\n🔧 Fix: Make sure you're using the owner's wallet to call this function");
      console.error("   The owner is the address that deployed the contract");
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

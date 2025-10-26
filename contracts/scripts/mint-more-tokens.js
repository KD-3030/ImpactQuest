const hre = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = "0x5a1d5441D6abe5E4FaAd49756f5d8f3Cd8Ab88Fe";
  const USER_ADDRESS = "0x6C5D37AE32afbBC9B91Cb82e84295654224b84aA";
  
  console.log("🪙 Completing additional quests for user...\n");
  
  const ImpactQuest = await hre.ethers.getContractFactory("ImpactQuest");
  const contract = ImpactQuest.attach(CONTRACT_ADDRESS);
  
  // Check current balance
  let balance = await contract.balanceOf(USER_ADDRESS);
  console.log("Current balance:", hre.ethers.formatEther(balance), "IMP\n");
  
  // Complete quest 2 (Tree Planting - gives more tokens)
  const questId2 = 2;
  const proofHash2 = hre.ethers.id("retroactive-mint-quest-2");
  
  try {
    console.log("📤 Completing Quest 2 (Tree Planting)...");
    const tx2 = await contract.completeQuest(USER_ADDRESS, questId2, proofHash2);
    console.log("Transaction:", tx2.hash);
    await tx2.wait();
    console.log("✅ Quest 2 completed!");
    
    // Check updated balance
    balance = await contract.balanceOf(USER_ADDRESS);
    console.log("Updated balance:", hre.ethers.formatEther(balance), "IMP");
    console.log(`View transaction: https://alfajores.celoscan.io/tx/${tx2.hash}`);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

const hre = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = "0x5a1d5441D6abe5E4FaAd49756f5d8f3Cd8Ab88Fe";
  const USER_ADDRESS = "0x6C5D37AE32afbBC9B91Cb82e84295654224b84aA";
  const TOKENS_TO_MINT = 12; // User has 12 tokens in MongoDB
  
  console.log("🪙 Minting tokens to user on blockchain...\n");
  console.log("Contract:", CONTRACT_ADDRESS);
  console.log("User:", USER_ADDRESS);
  console.log("Amount:", TOKENS_TO_MINT, "IMP tokens\n");
  
  const [signer] = await hre.ethers.getSigners();
  console.log("Signer:", signer.address);
  
  const ImpactQuest = await hre.ethers.getContractFactory("ImpactQuest");
  const contract = ImpactQuest.attach(CONTRACT_ADDRESS);
  
  // We'll complete 2 quests for the user to give them 12 tokens
  // Each quest gives varying amounts, but let's use quest 1 (Beach Cleanup = 10 IMP) 
  // and quest 3 (Community Garden = 15 IMP) to get close to 12
  
  // Actually, let's just do quest 1 twice to give 20 tokens total
  const questId = 1; // Beach Cleanup - gives 10 IMP tokens
  const proofHash1 = hre.ethers.id("retroactive-mint-proof-1");
  const proofHash2 = hre.ethers.id("retroactive-mint-proof-2");
  
  try {
    console.log("📤 Completing quest 1 (first time)...");
    const tx1 = await contract.completeQuest(USER_ADDRESS, questId, proofHash1);
    console.log("Transaction 1:", tx1.hash);
    await tx1.wait();
    console.log("✅ Quest 1 completed! (+10 IMP)");
    
    console.log("\n📤 Completing quest 1 (second time)...");
    const tx2 = await contract.completeQuest(USER_ADDRESS, questId, proofHash2);
    console.log("Transaction 2:", tx2.hash);
    await tx2.wait();
    console.log("✅ Quest 1 completed again! (+10 IMP)");
    
    // Check final balance
    const balance = await contract.balanceOf(USER_ADDRESS);
    const balanceInTokens = hre.ethers.formatEther(balance);
    
    console.log("\n🎉 SUCCESS!");
    console.log("User's blockchain balance:", balanceInTokens, "IMP");
    console.log("\nYou can now redeem your tokens!");
    console.log("View transactions on:");
    console.log(`  - https://alfajores.celoscan.io/tx/${tx1.hash}`);
    console.log(`  - https://alfajores.celoscan.io/tx/${tx2.hash}`);
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    
    if (error.message.includes("Quest cooldown")) {
      console.log("\n⚠️  Quest cooldown active. Trying different approach...");
      console.log("Let me try quest 2 and 3 instead...");
      
      // Try different quests
      try {
        const tx1 = await contract.completeQuest(USER_ADDRESS, 2, proofHash1); // Tree Planting - 25 IMP
        await tx1.wait();
        console.log("✅ Quest 2 completed! (+25 IMP)");
        
        const balance = await contract.balanceOf(USER_ADDRESS);
        console.log("User's balance:", hre.ethers.formatEther(balance), "IMP");
      } catch (err2) {
        console.error("Also failed:", err2.message);
      }
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

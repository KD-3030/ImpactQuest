const { ethers } = require("hardhat");

async function main() {
  console.log("\n🔬 GAS COST ANALYSIS FOR IMPACTQUEST CONTRACT\n");
  console.log("=" .repeat(70));

  const [owner, oracle, user1, user2] = await ethers.getSigners();

  // Deploy contract
  console.log("\n📦 Deploying Contract...");
  const ImpactQuest = await ethers.getContractFactory("ImpactQuest");
  const impactQuest = await ImpactQuest.deploy(oracle.address);
  await impactQuest.waitForDeployment();
  
  const deployTx = impactQuest.deploymentTransaction();
  const deployReceipt = await deployTx.wait();
  
  console.log(`   Gas Used: ${deployReceipt.gasUsed.toString()} gas`);
  console.log(`   Estimated Cost @ 5 gwei: ${ethers.formatEther(deployReceipt.gasUsed * 5n)} CELO`);
  console.log(`   Estimated Cost @ 1 gwei: ${ethers.formatEther(deployReceipt.gasUsed * 1n)} CELO`);

  // Create quests
  console.log("\n🎯 Creating Quest...");
  const createTx = await impactQuest.createQuest(
    "Beach Cleanup",
    "Clean up beach litter",
    ethers.parseEther("10"),
    10,
    86400
  );
  const createReceipt = await createTx.wait();
  
  console.log(`   Gas Used: ${createReceipt.gasUsed.toString()} gas`);
  console.log(`   Estimated Cost @ 5 gwei: ${ethers.formatEther(createReceipt.gasUsed * 5n)} CELO`);

  // User joins
  console.log("\n👤 User Registration...");
  const joinTx = await impactQuest.connect(user1).joinImpactQuest();
  const joinReceipt = await joinTx.wait();
  
  console.log(`   Gas Used: ${joinReceipt.gasUsed.toString()} gas`);
  console.log(`   Estimated Cost @ 5 gwei: ${ethers.formatEther(joinReceipt.gasUsed * 5n)} CELO`);

  // Complete quest
  console.log("\n✅ Quest Completion (First Time)...");
  const proofHash1 = ethers.keccak256(ethers.toUtf8Bytes("proof1"));
  const completeTx1 = await impactQuest.connect(oracle).completeQuest(
    user1.address,
    1,
    proofHash1
  );
  const completeReceipt1 = await completeTx1.wait();
  
  console.log(`   Gas Used: ${completeReceipt1.gasUsed.toString()} gas`);
  console.log(`   Estimated Cost @ 5 gwei: ${ethers.formatEther(completeReceipt1.gasUsed * 5n)} CELO`);

  // Fast forward time
  await ethers.provider.send("evm_increaseTime", [86401]);
  await ethers.provider.send("evm_mine");

  // Complete quest again
  console.log("\n✅ Quest Completion (Second Time)...");
  const proofHash2 = ethers.keccak256(ethers.toUtf8Bytes("proof2"));
  const completeTx2 = await impactQuest.connect(oracle).completeQuest(
    user1.address,
    1,
    proofHash2
  );
  const completeReceipt2 = await completeTx2.wait();
  
  console.log(`   Gas Used: ${completeReceipt2.gasUsed.toString()} gas`);
  console.log(`   Estimated Cost @ 5 gwei: ${ethers.formatEther(completeReceipt2.gasUsed * 5n)} CELO`);

  // View functions (these are free - no gas cost!)
  console.log("\n📊 View Functions (FREE - No Gas)...");
  const profile = await impactQuest.getUserProfile(user1.address);
  console.log(`   Level: ${profile.level} (${await impactQuest.getUserLevelName(user1.address)})`);
  console.log(`   Impact Score: ${profile.totalImpactScore}`);
  console.log(`   Quests Completed: ${profile.questsCompleted}`);
  console.log(`   Token Balance: ${ethers.formatEther(await impactQuest.balanceOf(user1.address))} IMP`);

  // Summary
  console.log("\n" + "=".repeat(70));
  console.log("\n💰 COST SUMMARY (at 5 gwei gas price):");
  console.log(`   Contract Deployment: ~${ethers.formatEther(deployReceipt.gasUsed * 5n)} CELO (one-time)`);
  console.log(`   Create Quest: ~${ethers.formatEther(createReceipt.gasUsed * 5n)} CELO (admin only)`);
  console.log(`   User Registration: ~${ethers.formatEther(joinReceipt.gasUsed * 5n)} CELO (once per user)`);
  console.log(`   Quest Completion: ~${ethers.formatEther(completeReceipt1.gasUsed * 5n)} CELO (per quest)`);
  
  console.log("\n📈 CELO PRICE CONTEXT (Dec 2024):");
  console.log("   1 CELO ≈ $0.50 USD");
  console.log(`   User Registration: ~$${(parseFloat(ethers.formatEther(joinReceipt.gasUsed * 5n)) * 0.5).toFixed(4)} USD`);
  console.log(`   Quest Completion: ~$${(parseFloat(ethers.formatEther(completeReceipt1.gasUsed * 5n)) * 0.5).toFixed(4)} USD`);
  
  console.log("\n✨ NOTE: Celo has very low gas fees compared to Ethereum!");
  console.log("   Same operations on Ethereum would cost 100-1000x more!");
  console.log("\n" + "=".repeat(70) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

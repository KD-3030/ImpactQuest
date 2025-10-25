const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying ImpactQuest to Celo...\n");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  
  // Check if deployer exists
  if (!deployer) {
    console.error("❌ ERROR: No deployer account found!");
    console.error("\n🔧 Fix this by:");
    console.error("   1. Make sure you have a PRIVATE_KEY in contracts/.env.local");
    console.error("   2. Your PRIVATE_KEY should be 64 hex characters (without 0x prefix)");
    console.error("   3. Get your private key from MetaMask: Account Details > Export Private Key");
    console.error("   4. Example format: PRIVATE_KEY=abc123def456...");
    console.error("\n⚠️  NEVER commit your private key to git!");
    process.exit(1);
  }
  
  console.log("📝 Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "CELO\n");

  // Deploy the contract
  console.log("🔨 Deploying ImpactQuest contract...");
  
  // Oracle address - for demo, use deployer address
  // In production, this would be your backend service address
  const oracleAddress = deployer.address;
  
  const ImpactQuest = await hre.ethers.getContractFactory("ImpactQuest");
  const impactQuest = await ImpactQuest.deploy(oracleAddress);
  
  await impactQuest.waitForDeployment();
  const contractAddress = await impactQuest.getAddress();

  console.log("✅ ImpactQuest deployed to:", contractAddress);
  console.log("🔮 Oracle address set to:", oracleAddress);
  console.log("\n📋 Contract Details:");
  console.log("   - Token Name: ImpactQuest Token");
  console.log("   - Token Symbol: IMP");
  console.log("   - Network:", hre.network.name);
  console.log("   - Chain ID:", (await hre.ethers.provider.getNetwork()).chainId);

  // Create initial quests
  console.log("\n🎯 Creating initial quests...");
  
  const quests = [
    {
      name: "Beach Cleanup",
      description: "Clean up trash at the beach and take a photo with your full trash bag",
      rewardAmount: hre.ethers.parseEther("10"), // 10 IMP tokens
      impactScore: 10,
      cooldownPeriod: 3600, // 1 hour
      category: 0 // Environmental
    },
    {
      name: "Tree Planting",
      description: "Plant a tree and document it with a photo",
      rewardAmount: hre.ethers.parseEther("25"), // 25 IMP tokens
      impactScore: 25,
      cooldownPeriod: 86400, // 24 hours
      category: 0 // Environmental
    },
    {
      name: "Community Garden",
      description: "Work in a community garden for 2 hours",
      rewardAmount: hre.ethers.parseEther("15"), // 15 IMP tokens
      impactScore: 15,
      cooldownPeriod: 3600, // 1 hour
      category: 1 // CommunityService
    },
    {
      name: "Teach Recycling",
      description: "Teach others about recycling and share educational content",
      rewardAmount: hre.ethers.parseEther("20"), // 20 IMP tokens
      impactScore: 20,
      cooldownPeriod: 86400, // 24 hours
      category: 2 // Education
    },
    {
      name: "Organize Recycling Drive",
      description: "Organize a recycling drive in your neighborhood",
      rewardAmount: hre.ethers.parseEther("30"), // 30 IMP tokens
      impactScore: 30,
      cooldownPeriod: 172800, // 48 hours
      category: 3 // WasteReduction
    },
    {
      name: "Home Energy Audit",
      description: "Conduct and document an energy audit of your home",
      rewardAmount: hre.ethers.parseEther("25"), // 25 IMP tokens
      impactScore: 25,
      cooldownPeriod: 604800, // 7 days
      category: 4 // Sustainability
    }
  ];

  for (const quest of quests) {
    const tx = await impactQuest.createQuest(
      quest.name,
      quest.description,
      quest.rewardAmount,
      quest.impactScore,
      quest.cooldownPeriod,
      quest.category
    );
    await tx.wait();
    const categoryNames = ["Environmental", "Community Service", "Education", "Waste Reduction", "Sustainability"];
    console.log(`   ✓ Created quest: ${quest.name} (${categoryNames[quest.category]})`);
  }

  console.log("\n🎉 Deployment Complete!");
  console.log("\n📖 Next Steps:");
  console.log("   1. Save this contract address:", contractAddress);
  console.log("   2. Verify contract on CeloScan:");
  console.log(`      npx hardhat verify --network ${hre.network.name} ${contractAddress} ${oracleAddress}`);
  console.log("   3. Update your frontend .env with:");
  console.log(`      NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
  console.log("\n💡 Explorer URL:");
  
  if (hre.network.name === "alfajores") {
    console.log(`   https://alfajores.celoscan.io/address/${contractAddress}`);
  } else if (hre.network.name === "celo") {
    console.log(`   https://celoscan.io/address/${contractAddress}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

const hre = require("hardhat");
const ImpactQuestABI = require("../artifacts/contracts/ImpactQuest.sol/ImpactQuest.json");

async function main() {
  console.log("🔍 Testing Alfajores Contract Interaction\n");
  
  const CONTRACT_ADDRESS = "0xCF50E27681E1197eE64eE81184609Ec2D2B29ceC";
  const ORACLE_ADDRESS = "0x459841F0675b084Ec3929e3D4425652ec165F6af";
  
  // Connect to Alfajores
  const provider = new hre.ethers.JsonRpcProvider("https://alfajores-forno.celo-testnet.org");
  const [signer] = await hre.ethers.getSigners();
  
  console.log("📍 Network:", (await provider.getNetwork()).name);
  console.log("🔗 Chain ID:", (await provider.getNetwork()).chainId);
  console.log("📝 Contract:", CONTRACT_ADDRESS);
  console.log("🔮 Oracle:", ORACLE_ADDRESS);
  console.log("💰 Oracle Balance:", hre.ethers.formatEther(await provider.getBalance(ORACLE_ADDRESS)), "CELO\n");
  
  // Create contract instance
  const contract = new hre.ethers.Contract(CONTRACT_ADDRESS, ImpactQuestABI.abi, provider);
  
  console.log("📖 Reading Contract Data:\n");
  
  try {
    // Test 1: Get next quest ID
    const nextQuestId = await contract.nextQuestId();
    console.log("✅ Next Quest ID:", nextQuestId.toString());
    
    // Test 2: Get oracle address
    const oracleAddr = await contract.oracleAddress();
    console.log("✅ Oracle Address:", oracleAddr);
    console.log("   Match:", oracleAddr.toLowerCase() === ORACLE_ADDRESS.toLowerCase() ? "✅" : "❌");
    
    // Test 3: Get token name
    const name = await contract.name();
    console.log("✅ Token Name:", name);
    
    // Test 4: Get token symbol
    const symbol = await contract.symbol();
    console.log("✅ Token Symbol:", symbol);
    
    // Test 5: Check if user is registered
    const isRegistered = await contract.userProfiles(ORACLE_ADDRESS);
    console.log("✅ Oracle User Profile:");
    console.log("   Level:", isRegistered.level.toString());
    console.log("   Total Impact:", isRegistered.totalImpactScore.toString());
    console.log("   Quests Completed:", isRegistered.questsCompleted.toString());
    console.log("   Is Active:", isRegistered.isActive);
    
    // Test 6: Get token balance
    const balance = await contract.balanceOf(ORACLE_ADDRESS);
    console.log("✅ Oracle Token Balance:", hre.ethers.formatEther(balance), "IMP");
    
    // Test 7: Total transactions
    try {
      const totalTx = await contract.getTotalTransactions();
      console.log("✅ Total Transactions:", totalTx.toString());
    } catch (e) {
      console.log("⚠️  getTotalTransactions() error:", e.message);
    }
    
    console.log("\n✅ Contract Read Operations: WORKING");
    
  } catch (error) {
    console.error("\n❌ Contract Read Error:", error.message);
    return;
  }
  
  console.log("\n🧪 Testing Write Operations:\n");
  
  // Create contract instance with signer for writes
  const contractWithSigner = new hre.ethers.Contract(CONTRACT_ADDRESS, ImpactQuestABI.abi, signer);
  
  try {
    // Check if already registered
    const profile = await contractWithSigner.userProfiles(signer.address);
    
    if (!profile.isActive) {
      console.log("📝 User not registered. Attempting to join...");
      const tx = await contractWithSigner.joinImpactQuest();
      console.log("⏳ Transaction sent:", tx.hash);
      await tx.wait();
      console.log("✅ Successfully joined ImpactQuest!");
    } else {
      console.log("✅ User already registered");
    }
    
    console.log("\n✅ Contract Write Operations: WORKING");
    
  } catch (error) {
    console.error("\n❌ Contract Write Error:", error.message);
    console.error("Full error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

const hre = require("hardhat");

async function main() {
  console.log("💰 Checking Wallet Balance...\n");

  try {
    const [deployer] = await hre.ethers.getSigners();
    
    if (!deployer) {
      console.error("❌ ERROR: No wallet configured!");
      console.error("\n🔧 Please check:");
      console.error("   - PRIVATE_KEY is set in contracts/.env.local");
      console.error("   - Private key is 64 hex characters");
      console.error("   - See DEPLOYMENT_FIX.md for detailed instructions");
      process.exit(1);
    }

    console.log("📍 Wallet Address:", deployer.address);
    console.log("🌐 Network:", hre.network.name);
    console.log("🔗 Chain ID:", (await hre.ethers.provider.getNetwork()).chainId.toString());
    
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    const balanceInCelo = hre.ethers.formatEther(balance);
    
    console.log("\n💎 Balance:", balanceInCelo, "CELO");
    
    if (balance === 0n) {
      console.log("\n❌ No testnet tokens found!");
      console.log("\n🚰 Get free testnet tokens:");
      console.log("   1. Visit: https://faucet.celo.org");
      console.log("   2. Paste your address:", deployer.address);
      console.log("   3. Select 'Alfajores Testnet'");
      console.log("   4. Click 'Get Tokens'");
      console.log("   5. Wait 10-30 seconds");
      console.log("\n💡 You need at least 0.1 CELO to deploy the contract");
    } else if (parseFloat(balanceInCelo) < 0.1) {
      console.log("\n⚠️  Balance is low (need at least 0.1 CELO for deployment)");
      console.log("   Get more tokens from: https://faucet.celo.org");
    } else {
      console.log("\n✅ You have enough tokens to deploy!");
      console.log("   Ready to run: npx hardhat run scripts/deploy.js --network alfajores");
    }
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error("\n🔧 Common fixes:");
    console.error("   - Make sure contracts/.env.local exists");
    console.error("   - Check that PRIVATE_KEY is set correctly");
    console.error("   - Ensure you're in the contracts/ folder");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

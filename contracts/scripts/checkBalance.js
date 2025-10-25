const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(signer.address);
  
  console.log('\n💰 Wallet Address:', signer.address);
  console.log('💵 Current Balance:', hre.ethers.formatEther(balance), 'CELO\n');
  
  if (balance > 0n) {
    console.log('✅ You have tokens! Ready to deploy.\n');
  } else {
    console.log('❌ No tokens found.');
    console.log('📍 Get test tokens from: https://faucet.celo.org/alfajores');
    console.log('💰 Paste this address:', signer.address, '\n');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

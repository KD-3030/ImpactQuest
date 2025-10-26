// Quick script to verify oracle wallet address
import { privateKeyToAccount } from 'viem/accounts';

const privateKey = '0x2f2ed52d4cc889354171b7ec9d28b099ac2cf6c1eb455e78ffd8584800a7f438';
const account = privateKeyToAccount(privateKey);

console.log('Oracle Wallet Address:', account.address);
console.log('');
console.log('Check balance at:');
console.log(`https://alfajores.celoscan.io/address/${account.address}`);
console.log('');
console.log('If balance is 0, get free CELO at:');
console.log('https://faucet.celo.org/alfajores');

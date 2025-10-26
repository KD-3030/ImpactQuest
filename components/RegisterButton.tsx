"use client";

import { useState, useEffect } from "react";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export default function RegisterButton() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      checkRegistration();
    }
  }, [isConnected, address]);

  const checkRegistration = async () => {
    if (!address || !publicClient) return;

    try {
      setIsChecking(true);
      
      // Use userProfiles mapping directly (more reliable)
      const profile = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: [
          {
            inputs: [{ name: "", type: "address" }],
            name: "userProfiles",
            outputs: [
              { name: "level", type: "uint8" },
              { name: "totalImpactScore", type: "uint256" },
              { name: "questsCompleted", type: "uint256" },
              { name: "lastQuestTimestamp", type: "uint256" },
              { name: "joinedTimestamp", type: "uint256" },
              { name: "isActive", type: "bool" },
            ],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "userProfiles",
        args: [address],
      });

      // isActive is the 6th element (index 5)
      const isActive = profile[5] as boolean;
      setIsRegistered(isActive);
      console.log("✅ Registration Status:", isActive ? "Registered ✅" : "Not Registered ❌");
      
      if (isActive) {
        console.log("📊 User Profile:", {
          level: Number(profile[0]),
          totalImpactScore: profile[1].toString(),
          questsCompleted: Number(profile[2]),
          joinedTimestamp: Number(profile[4])
        });
      }
    } catch (error) {
      console.error("❌ Error checking registration:", error);
      // If check fails, assume not registered
      setIsRegistered(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleRegister = async () => {
    if (!walletClient || !address || !publicClient) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      setIsRegistering(true);
      
      // Check network
      const chainId = await publicClient.getChainId();
      console.log("🔗 Current Chain ID:", chainId);
      console.log("🔗 Expected: 44787 (Alfajores) or 11142220 (Sepolia)");
      console.log("📱 Your wallet address:", address);
      console.log("📝 Contract address:", CONTRACT_ADDRESS);

      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: [
          {
            inputs: [],
            name: "joinImpactQuest",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        functionName: "joinImpactQuest",
      });

      console.log("📤 Transaction sent:", hash);
      console.log("🔍 View on explorer:");
      if (chainId === 44787) {
        console.log(`https://alfajores.celoscan.io/tx/${hash}`);
      } else if (chainId === 11142220) {
        console.log(`https://celo-sepolia.blockscout.com/tx/${hash}`);
      }

      // Wait for confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("✅ Transaction confirmed:", receipt);
      console.log("📊 Status:", receipt.status);

      if (receipt.status === "success") {
        alert("✅ Successfully registered on blockchain! You can now redeem tokens.");
        setIsRegistered(true);
        // Refresh the page to update UI
        window.location.reload();
      } else {
        console.error("❌ Transaction status:", receipt.status);
        alert("❌ Transaction failed. Please check console for details.");
      }
    } catch (error: any) {
      console.error("❌ Registration failed:", error);
      console.error("❌ Error details:", error.message);
      console.error("❌ Error code:", error.code);
      
      let errorMsg = "Registration failed. ";
      if (error.message?.includes("User denied") || error.message?.includes("rejected")) {
        errorMsg += "Transaction was rejected.";
      } else if (error.message?.includes("insufficient funds")) {
        errorMsg += "Insufficient CELO for gas fees. Get test CELO from the faucet.";
      } else if (error.message?.includes("already registered")) {
        errorMsg += "You may already be registered.";
      } else {
        errorMsg += error.message || "Unknown error. Check console for details.";
      }
      
      alert(errorMsg);
    } finally {
      setIsRegistering(false);
    }
  };

  if (!isConnected) {
    return null;
  }

  if (isChecking) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-blue-700">🔍 Checking blockchain registration...</p>
      </div>
    );
  }

  if (isRegistered === null) {
    return null;
  }

  if (isRegistered) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <p className="text-green-700 font-semibold">✅ You are registered on the blockchain!</p>
        <p className="text-sm text-green-600 mt-1">You can now redeem tokens</p>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-bold text-red-900 mb-2">
        ⚠️ Blockchain Registration Required
      </h3>
      <p className="text-red-700 mb-4">
        You need to register on the blockchain before you can redeem tokens.
      </p>
      <button
        onClick={handleRegister}
        disabled={isRegistering}
        className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isRegistering ? "⏳ Registering..." : "🔗 Register on Blockchain"}
      </button>
    </div>
  );
}

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
      const profile = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: [
          {
            inputs: [{ name: "user", type: "address" }],
            name: "getUserProfile",
            outputs: [
              { name: "isActive", type: "bool" },
              { name: "joinedAt", type: "uint256" },
              { name: "totalPointsEarned", type: "uint256" },
              { name: "level", type: "uint256" },
              { name: "completedQuests", type: "uint256" },
            ],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "getUserProfile",
        args: [address],
      });

      const isActive = profile[0];
      setIsRegistered(isActive);
      console.log("✅ Registration Status:", isActive ? "Registered" : "Not Registered");
    } catch (error) {
      console.error("Error checking registration:", error);
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
      console.log("🔗 Calling joinImpactQuest()...");

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

      // Wait for confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("✅ Transaction confirmed:", receipt);

      if (receipt.status === "success") {
        alert("✅ Successfully registered on blockchain! You can now redeem tokens.");
        setIsRegistered(true);
        // Refresh the page to update UI
        window.location.reload();
      } else {
        alert("❌ Transaction failed. Please try again.");
      }
    } catch (error: any) {
      console.error("❌ Registration failed:", error);
      alert(`Registration failed: ${error.message || "Unknown error"}`);
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

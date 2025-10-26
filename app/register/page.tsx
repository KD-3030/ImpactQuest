"use client";

import { useState } from "react";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { useRouter } from "next/navigation";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export default function RegisterPage() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [isChecking, setIsChecking] = useState(false);
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);

  const checkRegistration = async () => {
    if (!address || !publicClient) {
      setStatus("Please connect your wallet first");
      return;
    }

    try {
      setIsChecking(true);
      setStatus("🔍 Checking blockchain registration...");

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

      if (isActive) {
        setStatus("✅ You are already registered on the blockchain!");
      } else {
        setStatus("❌ You are NOT registered. Click the button below to register.");
      }
    } catch (error: any) {
      console.error("Error checking registration:", error);
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsChecking(false);
    }
  };

  const handleRegister = async () => {
    if (!walletClient || !address || !publicClient) {
      setStatus("❌ Please connect your wallet first");
      return;
    }

    try {
      setIsRegistering(true);
      setStatus("📝 Preparing transaction...");

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

      setStatus(`📤 Transaction sent: ${hash.substring(0, 10)}...`);
      console.log("Transaction hash:", hash);

      setStatus("⏳ Waiting for confirmation...");
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === "success") {
        setStatus("✅ SUCCESS! You are now registered on the blockchain!");
        setIsRegistered(true);
        
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      } else {
        setStatus("❌ Transaction failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Registration failed:", error);
      setStatus(`❌ Registration failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#31087B] via-[#FA2FB5] to-[#FFC23C] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-[#FA2FB5] to-[#31087B] bg-clip-text text-transparent">
          🔗 Blockchain Registration
        </h1>

        {!isConnected ? (
          <div className="text-center">
            <p className="text-xl text-gray-700 mb-6">
              Please connect your wallet to continue
            </p>
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
              <p className="text-yellow-800">
                👆 Click "Connect Wallet" in the top right corner
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">Connected Wallet:</p>
              <p className="text-lg font-mono text-blue-700">{address}</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={checkRegistration}
                disabled={isChecking}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {isChecking ? "🔍 Checking..." : "🔍 Check Registration Status"}
              </button>

              {isRegistered === false && (
                <button
                  onClick={handleRegister}
                  disabled={isRegistering}
                  className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  {isRegistering ? "⏳ Registering..." : "✅ Register on Blockchain"}
                </button>
              )}

              {isRegistered === true && (
                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full bg-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-purple-700 transition-colors"
                >
                  🎉 Go to Dashboard
                </button>
              )}
            </div>

            {status && (
              <div className={`mt-6 p-4 rounded-lg ${
                status.includes("✅") ? "bg-green-50 border-2 border-green-200" :
                status.includes("❌") ? "bg-red-50 border-2 border-red-200" :
                "bg-gray-50 border-2 border-gray-200"
              }`}>
                <p className={`text-center font-semibold ${
                  status.includes("✅") ? "text-green-700" :
                  status.includes("❌") ? "text-red-700" :
                  "text-gray-700"
                }`}>
                  {status}
                </p>
              </div>
            )}

            <div className="mt-8 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
              <h3 className="font-bold text-lg text-yellow-900 mb-2">
                ℹ️ What happens when you register?
              </h3>
              <ul className="list-disc list-inside space-y-2 text-yellow-800">
                <li>Your wallet gets registered on the smart contract</li>
                <li>You can earn IMP tokens from completing quests</li>
                <li>You can redeem tokens at partner shops</li>
                <li>All transactions will happen on Celo Alfajores blockchain</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

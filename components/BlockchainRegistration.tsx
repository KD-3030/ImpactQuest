'use client';

import { useEffect, useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { isUserRegistered, joinPlatform } from '@/lib/blockchain';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Check, X, Loader } from 'lucide-react';

/**
 * Component that checks if user is registered on blockchain
 * and prompts them to register if not
 */
export default function BlockchainRegistration() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [isChecking, setIsChecking] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  // Check registration status when wallet connects
  useEffect(() => {
    if (address && isConnected) {
      checkRegistration();
    }
  }, [address, isConnected]);

  const checkRegistration = async () => {
    if (!address) return;

    try {
      setIsChecking(true);
      const registered = await isUserRegistered(address);
      setIsRegistered(registered);
      
      // Show prompt if not registered
      if (!registered) {
        setShowPrompt(true);
      }
    } catch (err) {
      console.error('Error checking registration:', err);
    } finally {
      setIsChecking(false);
    }
  };

  const handleRegister = async () => {
    if (!walletClient) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setIsRegistering(true);
      setError('');
      
      console.log('🔗 Registering user on blockchain...');
      
      const result = await joinPlatform(walletClient);
      
      if (result.success) {
        console.log('✅ User registered on blockchain:', result.transactionHash);
        setIsRegistered(true);
        setShowPrompt(false);
        
        // Show success message
        alert('Successfully registered on blockchain! You can now earn and redeem tokens.');
      } else if (result.alreadyRegistered) {
        console.log('ℹ️ User already registered on blockchain');
        setIsRegistered(true);
        setShowPrompt(false);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err: any) {
      console.error('❌ Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  // Don't show anything if checking or already registered
  if (isChecking || isRegistered || !showPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-[#100720] to-[#31087B] rounded-2xl p-8 max-w-md w-full border border-purple-500/30"
        >
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#FA2FB5] to-[#FFC23C] flex items-center justify-center">
            <Shield className="w-10 h-10 text-white" />
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-white text-center mb-3">
            Register on Blockchain
          </h2>

          {/* Description */}
          <p className="text-gray-300 text-center mb-6">
            To earn and redeem IMP tokens, you need to register your wallet on the Celo blockchain. 
            This is a one-time transaction.
          </p>

          {/* Benefits */}
          <div className="space-y-3 mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-300 text-sm">
                Earn IMP tokens by completing quests
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-300 text-sm">
                Redeem tokens for discounts at local shops
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-300 text-sm">
                Track your impact on the blockchain
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 flex items-start gap-2">
              <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowPrompt(false)}
              className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
              disabled={isRegistering}
            >
              Skip for Now
            </button>
            <button
              onClick={handleRegister}
              disabled={isRegistering}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#FA2FB5] to-[#FFC23C] text-white font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isRegistering ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Register Now
                </>
              )}
            </button>
          </div>

          {/* Gas Fee Notice */}
          <p className="text-gray-400 text-xs text-center mt-4">
            ⛽ Small gas fee required (paid in CELO from your wallet)
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

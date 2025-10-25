'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Camera, ArrowLeft, CheckCircle, XCircle, Upload, Image as ImageIcon } from 'lucide-react';

interface Quest {
  _id: string;
  title: string;
  description: string;
  location: {
    coordinates: [number, number];
    address: string;
  };
  category: string;
  impactPoints: number;
  verificationPrompt: string;
}

export default function QuestDetail({ params }: { params: { id: string } }) {
  const { address } = useAccount();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [quest, setQuest] = useState<Quest | null>(null);
  const [loading, setLoading] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showUploadOption, setShowUploadOption] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    verified: boolean;
    pointsEarned: number;
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchQuest();
    return () => {
      stopCamera();
    };
  }, [params.id]);

  const fetchQuest = async () => {
    try {
      const response = await fetch(`/api/quests/${params.id}`);
      if (!response.ok) {
        throw new Error('Quest not found');
      }
      const data = await response.json();
      setQuest(data.quest);
    } catch (error) {
      console.error('Error fetching quest:', error);
      setQuest(null);
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitProof = async () => {
    if (!capturedImage || !quest) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/submit-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          questId: quest._id,
          imageData: capturedImage,
        }),
      });

      const data = await response.json();
      
      if (data.success && data.verified) {
        setResult({
          success: true,
          verified: true,
          pointsEarned: data.pointsEarned,
          message: `Amazing! You earned ${data.pointsEarned} impact points! 🎉`,
        });
      } else {
        setResult({
          success: false,
          verified: false,
          pointsEarned: 0,
          message: data.error || 'Verification failed. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error submitting proof:', error);
      setResult({
        success: false,
        verified: false,
        pointsEarned: 0,
        message: 'An error occurred. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#100720] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FA2FB5] mx-auto mb-4"></div>
          <p className="text-gray-300">Loading quest...</p>
        </div>
      </div>
    );
  }

  if (!quest) {
    return (
      <div className="min-h-screen bg-[#100720] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300 mb-4">Quest not found</p>
          <button
            onClick={() => router.push('/quest-hub')}
            className="bg-[#FA2FB5] text-white px-6 py-2 rounded-lg hover:bg-[#31087B] transition-colors"
          >
            Back to Quest Hub
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#100720] via-[#31087B] to-[#100720] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8 text-center border-4 border-[#FA2FB5]">
          {result.verified ? (
            <>
              <CheckCircle className="w-20 h-20 text-[#FA2FB5] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#100720] mb-2">Impact Verified! ✨</h2>
              <p className="text-gray-600 mb-6">{result.message}</p>
              {capturedImage && (
                <img
                  src={capturedImage}
                  alt="Submitted proof"
                  className="w-full rounded-lg mb-6 border-2 border-[#FFC23C]"
                />
              )}
            </>
          ) : (
            <>
              <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#100720] mb-2">Verification Failed</h2>
              <p className="text-gray-600 mb-6">{result.message}</p>
            </>
          )}
          <button
            onClick={() => router.push('/quest-hub')}
            className="bg-gradient-to-r from-[#FA2FB5] to-[#31087B] hover:from-[#31087B] hover:to-[#FA2FB5] text-white font-bold py-3 px-6 rounded-lg w-full transition-all shadow-lg"
          >
            Return to Quest Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#100720] via-[#31087B] to-[#100720]">
      {/* Header */}
      <header className="bg-[#100720] shadow-lg sticky top-0 z-50 border-b-2 border-[#FA2FB5]">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push('/quest-hub')}
            className="p-2 hover:bg-[#31087B] rounded-lg transition-colors text-[#FA2FB5]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-[#FA2FB5]">Quest Details</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Quest Info */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6 border-2 border-[#FFC23C]">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-[#100720]">{quest.title}</h2>
            <span className="bg-gradient-to-r from-[#FA2FB5] to-[#FFC23C] text-white px-4 py-2 rounded-full font-bold shadow-lg">
              +{quest.impactPoints} pts
            </span>
          </div>
          
          <p className="text-gray-700 mb-4">{quest.description}</p>
          
          <div className="bg-gradient-to-r from-[#31087B] to-[#FA2FB5] border-l-4 border-[#FFC23C] p-4 mb-4 rounded">
            <p className="font-medium text-white mb-1">📸 What to capture:</p>
            <p className="text-gray-100 text-sm">{quest.verificationPrompt}</p>
          </div>

          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
            📍 {quest.location.address}
          </div>
        </div>

        {/* Camera Section */}
        <div className="bg-white rounded-lg shadow-xl p-6 border-2 border-[#FA2FB5]">
          <h3 className="text-xl font-bold text-[#100720] mb-4">Submit Your Proof</h3>

          {!cameraActive && !capturedImage && (
            <div className="text-center py-12">
              <Camera className="w-16 h-16 text-[#FA2FB5] mx-auto mb-4" />
              <p className="text-gray-700 mb-6 font-medium">
                Take a photo to prove you completed this quest
              </p>
              
              {/* Primary Camera Button */}
              <button
                onClick={startCamera}
                className="bg-gradient-to-r from-[#FA2FB5] to-[#31087B] hover:from-[#31087B] hover:to-[#FA2FB5] text-white font-bold py-3 px-8 rounded-lg inline-flex items-center gap-2 mb-4 shadow-lg transition-all transform hover:scale-105"
              >
                <Camera className="w-5 h-5" />
                Open Camera (Secure)
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">For Testing & Demo Only</span>
                </div>
              </div>

              {/* Upload Option for Testing */}
              <div className="bg-gradient-to-r from-[#FFC23C]/10 to-[#FA2FB5]/10 p-4 rounded-lg border-2 border-dashed border-[#FFC23C]">
                <ImageIcon className="w-12 h-12 text-[#FFC23C] mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-3">
                  ⚠️ Upload an image for testing purposes only
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#FFC23C] hover:bg-[#31087B] text-[#100720] hover:text-white font-bold py-2 px-6 rounded-lg inline-flex items-center gap-2 transition-all"
                >
                  <Upload className="w-4 h-4" />
                  Upload Image (Demo)
                </button>
              </div>
            </div>
          )}

          {cameraActive && (
            <div className="space-y-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg bg-black border-4 border-[#FA2FB5]"
              />
              <div className="flex gap-4">
                <button
                  onClick={capturePhoto}
                  className="flex-1 bg-gradient-to-r from-[#FA2FB5] to-[#FFC23C] hover:from-[#FFC23C] hover:to-[#FA2FB5] text-white font-bold py-3 rounded-lg transition-all shadow-lg"
                >
                  📸 Capture Photo
                </button>
                <button
                  onClick={stopCamera}
                  className="px-6 bg-[#100720] hover:bg-[#31087B] text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {capturedImage && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={capturedImage}
                  alt="Captured proof"
                  className="w-full rounded-lg border-4 border-[#FFC23C] shadow-xl"
                />
                <div className="absolute top-2 right-2 bg-[#FA2FB5] text-white px-3 py-1 rounded-full text-sm font-bold">
                  ✓ Ready to Submit
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={submitProof}
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-[#FA2FB5] to-[#31087B] hover:from-[#31087B] hover:to-[#FA2FB5] text-white font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 transition-all shadow-lg transform hover:scale-105"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Submit Proof
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setCapturedImage(null);
                    startCamera();
                  }}
                  disabled={submitting}
                  className="px-6 bg-[#FFC23C] hover:bg-[#31087B] text-[#100720] hover:text-white font-bold py-3 rounded-lg disabled:opacity-50 transition-all"
                >
                  Retake
                </button>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      </div>
    </main>
  );
}

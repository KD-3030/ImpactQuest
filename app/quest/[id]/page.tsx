'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Camera, ArrowLeft, CheckCircle, XCircle, Upload } from 'lucide-react';

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
  
  const [quest, setQuest] = useState<Quest | null>(null);
  const [loading, setLoading] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
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
      const response = await fetch(`/api/quests`);
      const data = await response.json();
      const foundQuest = data.quests.find((q: Quest) => q._id === params.id);
      setQuest(foundQuest || null);
    } catch (error) {
      console.error('Error fetching quest:', error);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quest...</p>
        </div>
      </div>
    );
  }

  if (!quest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Quest not found</p>
          <button
            onClick={() => router.push('/quest-hub')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg"
          >
            Back to Quest Hub
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          {result.verified ? (
            <>
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Impact Verified! ✨</h2>
              <p className="text-gray-600 mb-6">{result.message}</p>
              {capturedImage && (
                <img
                  src={capturedImage}
                  alt="Submitted proof"
                  className="w-full rounded-lg mb-6"
                />
              )}
            </>
          ) : (
            <>
              <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
              <p className="text-gray-600 mb-6">{result.message}</p>
            </>
          )}
          <button
            onClick={() => router.push('/quest-hub')}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg w-full"
          >
            Return to Quest Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push('/quest-hub')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-green-600">Quest Details</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Quest Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{quest.title}</h2>
            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold">
              +{quest.impactPoints} pts
            </span>
          </div>
          
          <p className="text-gray-600 mb-4">{quest.description}</p>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <p className="font-medium text-blue-900 mb-1">📸 What to capture:</p>
            <p className="text-blue-800 text-sm">{quest.verificationPrompt}</p>
          </div>

          <div className="text-sm text-gray-500">
            📍 {quest.location.address}
          </div>
        </div>

        {/* Camera Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Submit Your Proof</h3>

          {!cameraActive && !capturedImage && (
            <div className="text-center py-12">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-6">
                Take a photo to prove you completed this quest
              </p>
              <button
                onClick={startCamera}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg inline-flex items-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Open Camera
              </button>
            </div>
          )}

          {cameraActive && (
            <div className="space-y-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg bg-black"
              />
              <div className="flex gap-4">
                <button
                  onClick={capturePhoto}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg"
                >
                  📸 Capture Photo
                </button>
                <button
                  onClick={stopCamera}
                  className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {capturedImage && (
            <div className="space-y-4">
              <img
                src={capturedImage}
                alt="Captured proof"
                className="w-full rounded-lg"
              />
              <div className="flex gap-4">
                <button
                  onClick={submitProof}
                  disabled={submitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
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
                  className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-lg disabled:opacity-50"
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

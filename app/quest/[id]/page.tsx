'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Camera, ArrowLeft, CheckCircle, XCircle, Upload, ImageIcon, MapPin, Award, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Container,
  Card,
  CardBody,
  Button,
  Badge,
  LoadingSpinner,
} from '@/components/ui';

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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, 'primary' | 'success' | 'secondary' | 'warning'> = {
      cleanup: 'primary',
      planting: 'success',
      recycling: 'secondary',
      education: 'warning',
      other: 'primary',
    };
    return colors[category] || 'primary';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#100720] flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardBody className="py-12 text-center">
            <LoadingSpinner size="lg" color="primary" label="Loading quest..." />
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!quest) {
    return (
      <div className="min-h-screen bg-[#100720] flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardBody className="py-12 text-center">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-4">Quest Not Found</h2>
            <p className="text-gray-400 mb-6">This quest doesn't exist or has been removed.</p>
            <Button
              variant="primary"
              onClick={() => router.push('/dashboard/quests')}
            >
              Browse Quests
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-[#100720] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <Card className={`border-2 ${result.verified ? 'border-[#FA2FB5]' : 'border-red-500'}`}>
            <CardBody className="text-center py-12">
              {result.verified ? (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  >
                    <CheckCircle className="w-24 h-24 text-[#FA2FB5] mx-auto mb-6" />
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h2 className="text-3xl font-bold text-white mb-3 flex items-center justify-center gap-2">
                      Impact Verified! <Sparkles className="w-6 h-6 text-[#FFC23C]" />
                    </h2>
                    <p className="text-gray-300 mb-6">{result.message}</p>
                    
                    <div className="bg-gradient-to-r from-[#FA2FB5]/20 to-[#FFC23C]/20 border-2 border-[#FFC23C] rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-center gap-2 text-[#FFC23C]">
                        <Award className="w-8 h-8" />
                        <span className="text-3xl font-bold">+{result.pointsEarned}</span>
                      </div>
                      <p className="text-sm text-gray-300 mt-2">Points Added to Your Garden</p>
                    </div>

                    {capturedImage && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mb-6"
                      >
                        <img
                          src={capturedImage}
                          alt="Submitted proof"
                          className="w-full rounded-lg border-2 border-[#FFC23C]"
                        />
                      </motion.div>
                    )}
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <XCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
                  </motion.div>
                  
                  <h2 className="text-2xl font-bold text-white mb-3">Verification Failed</h2>
                  <p className="text-gray-300 mb-6">{result.message}</p>
                  
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-300">
                      💡 Make sure your photo clearly shows the completed quest activity.
                    </p>
                  </div>
                </>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3">
                {!result.verified && (
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => {
                      setResult(null);
                      setCapturedImage(null);
                    }}
                  >
                    Try Again
                  </Button>
                )}
                <Button
                  variant={result.verified ? 'primary' : 'outline'}
                  fullWidth
                  onClick={() => router.push('/dashboard/quests')}
                >
                  {result.verified ? 'Browse More Quests' : 'Back to Quests'}
                </Button>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#100720]">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-[#31087B]/50 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b-2 border-[#FA2FB5]/30"
      >
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            icon={ArrowLeft}
            onClick={() => router.push('/dashboard/quests')}
          >
            Back
          </Button>
          <h1 className="text-xl font-bold text-white">Quest Details</h1>
        </div>
      </motion.header>

      <Container className="py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Quest Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardBody>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">{quest.title}</h2>
                    <Badge variant={getCategoryColor(quest.category)} className="capitalize">
                      {quest.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 bg-gradient-to-r from-[#FA2FB5] to-[#FFC23C] text-white px-4 py-2 rounded-full font-bold shadow-lg">
                    <Award className="w-5 h-5" />
                    {quest.impactPoints}
                  </div>
                </div>
                
                <p className="text-gray-300 mb-4">{quest.description}</p>
                
                <div className="bg-[#31087B]/30 border-l-4 border-[#FFC23C] p-4 rounded-lg mb-4">
                  <p className="font-semibold text-[#FFC23C] mb-2 flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    What to capture:
                  </p>
                  <p className="text-gray-300 text-sm">{quest.verificationPrompt}</p>
                </div>

                <div className="flex items-center gap-2 text-gray-400 text-sm bg-[#100720]/50 p-3 rounded-lg">
                  <MapPin className="w-4 h-4 text-[#FFC23C] flex-shrink-0" />
                  <span>{quest.location.address}</span>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Camera Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardBody>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Camera className="w-6 h-6 text-[#FA2FB5]" />
                  Submit Your Proof
                </h3>

                <AnimatePresence mode="wait">
                  {!cameraActive && !capturedImage && (
                    <motion.div
                      key="initial"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-8"
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      >
                        <Camera className="w-20 h-20 text-[#FA2FB5] mx-auto mb-6" />
                      </motion.div>
                      
                      <p className="text-gray-300 mb-6 font-medium">
                        Take a photo to prove you completed this quest
                      </p>
                      
                      <Button
                        variant="primary"
                        size="lg"
                        icon={Camera}
                        onClick={startCamera}
                        className="mb-6"
                      >
                        Open Camera (Secure)
                      </Button>

                      {/* Divider */}
                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-[#31087B]"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-4 bg-[#100720] text-gray-400 font-medium">
                            For Testing & Demo Only
                          </span>
                        </div>
                      </div>

                      {/* Upload Option */}
                      <div className="bg-[#FFC23C]/10 p-6 rounded-lg border-2 border-dashed border-[#FFC23C]/50">
                        <ImageIcon className="w-12 h-12 text-[#FFC23C] mx-auto mb-3" />
                        <p className="text-sm text-gray-400 mb-4">
                          ⚠️ Upload an image for testing purposes only
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Button
                          variant="secondary"
                          icon={Upload}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Upload Image (Demo)
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {cameraActive && (
                    <motion.div
                      key="camera"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-4"
                    >
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full rounded-lg bg-black border-4 border-[#FA2FB5]"
                      />
                      <div className="flex gap-3">
                        <Button
                          variant="primary"
                          fullWidth
                          icon={Camera}
                          onClick={capturePhoto}
                        >
                          Capture Photo
                        </Button>
                        <Button
                          variant="outline"
                          onClick={stopCamera}
                        >
                          Cancel
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {capturedImage && (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-4"
                    >
                      <div className="relative">
                        <img
                          src={capturedImage}
                          alt="Captured proof"
                          className="w-full rounded-lg border-4 border-[#FFC23C] shadow-xl"
                        />
                        <Badge
                          variant="success"
                          className="absolute top-4 right-4 text-base px-3 py-1"
                        >
                          ✓ Ready
                        </Badge>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          variant="primary"
                          fullWidth
                          icon={Upload}
                          onClick={submitProof}
                          loading={submitting}
                          disabled={submitting}
                        >
                          {submitting ? 'Verifying...' : 'Submit Proof'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setCapturedImage(null);
                            startCamera();
                          }}
                          disabled={submitting}
                        >
                          Retake
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </CardBody>
            </Card>
          </motion.div>
        </div>
      </Container>
    </div>
  );
}

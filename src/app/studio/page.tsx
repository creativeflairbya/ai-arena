'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Image, Video, ImageIcon, Loader2, Download, Clock, CheckCircle, XCircle } from 'lucide-react';

interface User {
  id: string;
  email: string;
  credits: number;
  subscriptionTier: string | null;
  role: string;
}

interface Generation {
  id: string;
  type: string;
  prompt: string;
  status: string;
  resultUrl: string | null;
  thumbnailUrl: string | null;
  error: string | null;
  creditsUsed: number;
  createdAt: string;
}

export default function StudioPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<'image' | 'video' | 'text-to-video' | 'image-to-video'>('image');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchGenerations();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      
      if (!data.user) {
        window.location.href = '/login';
        return;
      }
      
      setUser(data.user);
      setLoading(false);
    } catch (error) {
      console.error('Auth check failed:', error);
      window.location.href = '/login';
    }
  };

  const fetchGenerations = async () => {
    try {
      const response = await fetch('/api/generations');
      const data = await response.json();
      
      if (data.generations) {
        setGenerations(data.generations);
      }
    } catch (error) {
      console.error('Failed to fetch generations:', error);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt');
      return;
    }

    if (selectedType === 'image-to-video' && !imageUrl.trim()) {
      alert('Please enter an image URL for image-to-video generation');
      return;
    }

    setGenerating(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: selectedType,
          prompt,
          negativePrompt: negativePrompt || undefined,
          settings: selectedType === 'image-to-video' ? { imageUrl } : {},
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Generation failed');
        setGenerating(false);
        return;
      }

      // Refresh user credits
      await checkAuth();
      
      // Start polling for completion
      pollGeneration(data.generation.id);
      
      // Refresh generations list
      setTimeout(fetchGenerations, 1000);
      
      // Clear form
      setPrompt('');
      setNegativePrompt('');
      setImageUrl('');
    } catch (error) {
      console.error('Generation error:', error);
      alert('An error occurred. Please try again.');
      setGenerating(false);
    }
  };

  const pollGeneration = async (id: string) => {
    const maxAttempts = 60;
    let attempts = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setGenerating(false);
        return;
      }

      try {
        const response = await fetch(`/api/generations/${id}`);
        const data = await response.json();

        if (data.generation.status === 'completed' || data.generation.status === 'failed') {
          setGenerating(false);
          fetchGenerations();
          await checkAuth(); // Refresh credits
          return;
        }

        attempts++;
        setTimeout(poll, 2000);
      } catch (error) {
        console.error('Polling error:', error);
        setGenerating(false);
      }
    };

    poll();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-5 h-5" />;
      case 'video':
      case 'text-to-video':
      case 'image-to-video':
        return <Video className="w-5 h-5" />;
      default:
        return <Image className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
      case 'pending':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Studio</h1>
          <p className="text-gray-600 mt-2">Create amazing images and videos with AI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Generator Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Generation</h2>

              {/* Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Generation Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => setSelectedType('image')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedType === 'image'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <ImageIcon className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <div className="text-sm font-medium">Text to Image</div>
                    <div className="text-xs text-gray-500 mt-1">1 credit</div>
                  </button>
                  <button
                    onClick={() => setSelectedType('text-to-video')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedType === 'text-to-video'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Video className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                    <div className="text-sm font-medium">Text to Video</div>
                    <div className="text-xs text-gray-500 mt-1">10 credits</div>
                  </button>
                  <button
                    onClick={() => setSelectedType('image-to-video')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedType === 'image-to-video'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image className="w-6 h-6 mx-auto mb-2 text-pink-600" />
                    <div className="text-sm font-medium">Image to Video</div>
                    <div className="text-xs text-gray-500 mt-1">15 credits</div>
                  </button>
                  <button
                    onClick={() => setSelectedType('video')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedType === 'video'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Video className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                    <div className="text-sm font-medium">Video</div>
                    <div className="text-xs text-gray-500 mt-1">10 credits</div>
                  </button>
                </div>
              </div>

              {/* Prompt */}
              <div className="mb-6">
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                  Prompt
                </label>
                <Textarea
                  id="prompt"
                  placeholder="Describe what you want to create in detail... (supports longer prompts for better results)"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px]"
                  disabled={generating}
                />
              </div>

              {/* Negative Prompt */}
              <div className="mb-6">
                <label htmlFor="negative-prompt" className="block text-sm font-medium text-gray-700 mb-2">
                  Negative Prompt (Optional)
                </label>
                <Textarea
                  id="negative-prompt"
                  placeholder="What you don't want in the generation..."
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  className="min-h-[80px]"
                  disabled={generating}
                />
              </div>

              {/* Image URL for Image-to-Video */}
              {selectedType === 'image-to-video' && (
                <div className="mb-6">
                  <label htmlFor="image-url" className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <Input
                    id="image-url"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    disabled={generating}
                  />
                </div>
              )}

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={generating || !prompt.trim()}
                className="w-full"
                size="lg"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Image className="w-5 h-5 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Generations History */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Generations</h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {generations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No generations yet</p>
                  </div>
                ) : (
                  generations.map((gen) => (
                    <div
                      key={gen.id}
                      className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(gen.type)}
                          <span className="text-xs font-medium text-gray-600 capitalize">
                            {gen.type.replace('-', ' ')}
                          </span>
                        </div>
                        {getStatusIcon(gen.status)}
                      </div>
                      <p className="text-sm text-gray-700 mb-2 line-clamp-2">{gen.prompt}</p>
                      {gen.status === 'completed' && gen.resultUrl && (
                        <div className="mt-2">
                          {gen.type === 'image' ? (
                            <img
                              src={gen.resultUrl}
                              alt={gen.prompt}
                              className="w-full rounded-lg"
                            />
                          ) : (
                            <video
                              src={gen.resultUrl}
                              controls
                              className="w-full rounded-lg"
                            />
                          )}
                          <a
                            href={gen.resultUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center text-sm text-blue-600 hover:underline"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </a>
                        </div>
                      )}
                      {gen.status === 'failed' && (
                        <p className="text-xs text-red-500 mt-2">{gen.error}</p>
                      )}
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>{gen.creditsUsed} credits</span>
                        <span>{new Date(gen.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

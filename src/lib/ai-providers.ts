// AI Provider configurations and helpers

export interface GenerationRequest {
  type: 'image' | 'video' | 'text-to-video' | 'image-to-video';
  prompt: string;
  negativePrompt?: string;
  settings?: {
    aspectRatio?: string;
    duration?: number;
    width?: number;
    height?: number;
    imageUrl?: string;
    model?: string;
  };
}

export interface GenerationResult {
  success: boolean;
  resultUrl?: string;
  thumbnailUrl?: string;
  error?: string;
  processingTime?: number;
}

// Replicate API wrapper (free tier available)
export async function generateWithReplicate(
  request: GenerationRequest
): Promise<GenerationResult> {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  
  if (!apiToken) {
    return {
      success: false,
      error: 'Replicate API token not configured',
    };
  }

  try {
    const startTime = Date.now();
    let model = '';
    let input: any = {};

    // Select model based on type
    if (request.type === 'image') {
      model = 'black-forest-labs/flux-schnell';
      input = {
        prompt: request.prompt,
        num_outputs: 1,
        aspect_ratio: request.settings?.aspectRatio || '16:9',
        output_format: 'png',
        output_quality: 90,
      };
    } else if (request.type === 'video' || request.type === 'text-to-video') {
      // Using a text-to-video model
      model = 'anotherjesse/zeroscope-v2-xl';
      input = {
        prompt: request.prompt,
        num_frames: request.settings?.duration ? request.settings.duration * 8 : 24,
        fps: 8,
      };
    } else if (request.type === 'image-to-video') {
      model = 'stability-ai/stable-video-diffusion';
      input = {
        input_image: request.settings?.imageUrl,
        frames_per_second: 6,
        motion_bucket_id: 127,
      };
    }

    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: await getModelVersion(model),
        input,
      }),
    });

    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.statusText}`);
    }

    const prediction = await response.json();
    
    // Poll for completion
    const result = await pollPrediction(prediction.id, apiToken);
    const processingTime = Math.floor((Date.now() - startTime) / 1000);

    if (result.status === 'succeeded') {
      return {
        success: true,
        resultUrl: Array.isArray(result.output) ? result.output[0] : result.output,
        processingTime,
      };
    } else {
      return {
        success: false,
        error: result.error || 'Generation failed',
        processingTime,
      };
    }
  } catch (error: any) {
    console.error('Replicate generation error:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
    };
  }
}

async function getModelVersion(model: string): Promise<string> {
  // Model versions - these should be updated periodically
  const versions: Record<string, string> = {
    'black-forest-labs/flux-schnell': 'f2ab8a5569279d9b84c764cd8c6abc7e4dba21e0b369a7e9a9e822c0f9df8df4',
    'anotherjesse/zeroscope-v2-xl': '9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351',
    'stability-ai/stable-video-diffusion': '3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
  };
  
  return versions[model] || '';
}

async function pollPrediction(id: string, apiToken: string, maxAttempts = 60): Promise<any> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    
    const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: {
        'Authorization': `Token ${apiToken}`,
      },
    });
    
    const prediction = await response.json();
    
    if (prediction.status === 'succeeded' || prediction.status === 'failed') {
      return prediction;
    }
  }
  
  return { status: 'failed', error: 'Timeout waiting for generation' };
}

// Mock provider for free tier without API keys
export async function generateWithFallback(
  request: GenerationRequest
): Promise<GenerationResult> {
  // This is a fallback that generates placeholder content
  // In production, you would implement actual free AI generation
  
  await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate processing
  
  if (request.type === 'image') {
    return {
      success: true,
      resultUrl: `https://picsum.photos/seed/${Date.now()}/1024/576`,
      processingTime: 3,
    };
  } else {
    // For video, return a placeholder
    return {
      success: true,
      resultUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnailUrl: 'https://picsum.photos/seed/video/1024/576',
      processingTime: 3,
    };
  }
}

export function getCreditsRequired(type: string, tier: string): number {
  if (tier === 'unlimited') return 0;
  
  const costs: Record<string, number> = {
    'image': 1,
    'video': 10,
    'text-to-video': 10,
    'image-to-video': 15,
  };
  
  return costs[type] || 5;
}

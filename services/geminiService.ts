import { GoogleGenAI } from "@google/genai";
import { AspectRatio } from "../types";

// Helper to convert File to Base64
const fileToParams = async (file: File): Promise<{ mimeType: string; data: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve({
        mimeType: file.type,
        data: base64Data,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generateMemoryVideo = async (
  imageFile: File,
  prompt: string,
  aspectRatio: AspectRatio
): Promise<string> => {
  try {
    // 1. Initialize API with the environment key (injected after user selection)
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // 2. Prepare Image Data
    const imageParams = await fileToParams(imageFile);

    // 3. Initiate Video Generation
    // Using veo-3.1-fast-generate-preview as requested
    console.log("Starting generation with prompt:", prompt);
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      image: {
        imageBytes: imageParams.data,
        mimeType: imageParams.mimeType,
      },
      config: {
        numberOfVideos: 1,
        // Veo fast supports 720p or 1080p usually, but sticking to defaults or explicitly setting standard
        resolution: '720p', 
        aspectRatio: aspectRatio,
      }
    });

    console.log("Operation initiated:", operation);

    // 4. Poll for completion
    // Video generation takes time. We poll every 5 seconds.
    while (!operation.done) {
      await new Promise(resolve => setTimeout(() => resolve(undefined), 5000)); // 5s polling interval
      console.log("Polling status...");
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    if (operation.error) {
      throw new Error(operation.error.message || "Unknown error during video generation");
    }

    // 5. Retrieve Video URI
    const generatedVideo = operation.response?.generatedVideos?.[0];
    if (!generatedVideo?.video?.uri) {
      throw new Error("No video URI returned from the API.");
    }

    const downloadLink = generatedVideo.video.uri;

    // 6. Fetch the actual video bytes
    // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!response.ok) {
        throw new Error(`Failed to download video: ${response.statusText}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);

  } catch (error: any) {
    console.error("Video generation service error:", error);
    throw new Error(error.message || "Failed to generate video");
  }
};
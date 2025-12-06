export interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

export type AspectRatio = '16:9' | '9:16';

export interface VideoGenerationState {
  status: 'idle' | 'uploading' | 'generating' | 'completed' | 'error';
  progressMessage?: string;
  videoUrl?: string;
  error?: string;
}

export const LOADING_MESSAGES = [
  "Analyzing the scene structure...",
  "Understanding the depth and layers...",
  "Simulating motion in static elements...",
  "Applying temporal consistency...",
  "Rendering the memory frames...",
  "Polishing the final video output...",
  "Almost there, finalizing the memory..."
];
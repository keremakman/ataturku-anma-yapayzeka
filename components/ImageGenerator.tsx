
import React, { useState } from 'react';
import { generateImageWithImagen } from '../services/geminiService';
import Spinner from './Spinner';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!prompt) {
      setError('Please provide a prompt to generate an image.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const result = await generateImageWithImagen(prompt);
      setGeneratedImage(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold text-indigo-400 mb-2">AI Image Generator</h2>
        <p className="text-gray-400">Describe the image you want to create, and our AI will generate it for you using Imagen 4.</p>
      </div>

      <div className="relative w-full max-w-lg mx-auto aspect-square bg-gray-900 rounded-lg flex items-center justify-center border-2 border-gray-700">
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center rounded-lg z-10">
            <Spinner size="h-12 w-12" />
            <p className="mt-4 text-lg">Generating your image...</p>
          </div>
        )}
        {generatedImage ? (
          <img src={generatedImage} alt="Generated result" className="object-contain h-full w-full rounded-lg" />
        ) : (
          <p className="text-gray-500 text-center p-4">Your generated image will appear here</p>
        )}
      </div>

      {error && <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A photo of a Shiba Inu dog wearing a beret and black turtleneck..."
          className="w-full bg-gray-700/50 border border-gray-600 rounded-md py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition h-24 sm:h-auto"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !prompt}
          className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-md hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center shrink-0"
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </form>

      {generatedImage && (
        <a 
          href={generatedImage} 
          download="generated-image.png"
          className="bg-green-600 text-white font-bold py-3 px-6 rounded-md hover:bg-green-700 transition-colors text-center w-full sm:w-auto self-center"
        >
          Download Image
        </a>
      )}
    </div>
  );
};

export default ImageGenerator;

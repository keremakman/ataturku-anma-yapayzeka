
import React, { useState, useRef } from 'react';
import { editImageWithGemini } from '../services/geminiService';
import Spinner from './Spinner';

const fileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const mimeType = result.split(';')[0].split(':')[1];
      const base64 = result.split(',')[1];
      resolve({ base64, mimeType });
    };
    reader.onerror = (error) => reject(error);
  });
};

const ImageEditor: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if(selectedFile.size > 4 * 1024 * 1024) {
          setError("File is too large. Please upload an image under 4MB.");
          return;
      }
      setFile(selectedFile);
      setGeneratedImage(null);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file || !prompt) {
      setError('Please upload an image and provide an editing prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const { base64, mimeType } = await fileToBase64(file);
      const result = await editImageWithGemini(base64, mimeType, prompt);
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
        <h2 className="text-2xl font-bold text-indigo-400 mb-2">AI Image Editor</h2>
        <p className="text-gray-400">Upload an image, describe your desired changes, and let AI bring your vision to life.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div 
            className="relative w-full aspect-square bg-gray-700/50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600 hover:border-indigo-500 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
        >
          <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
          {originalImage ? (
            <img src={originalImage} alt="Original upload" className="object-contain h-full w-full rounded-lg" />
          ) : (
            <div className="text-center text-gray-400 p-4">
              <p>Click to upload an image</p>
              <p className="text-xs mt-1">(Max 4MB)</p>
            </div>
          )}
        </div>
        <div className="relative w-full aspect-square bg-gray-900 rounded-lg flex items-center justify-center border-2 border-gray-700">
           {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center rounded-lg z-10">
                  <Spinner size="h-12 w-12"/>
                  <p className="mt-4 text-lg">Editing your image...</p>
              </div>
          )}
          {generatedImage ? (
            <img src={generatedImage} alt="Generated result" className="object-contain h-full w-full rounded-lg" />
          ) : (
             <p className="text-gray-500">Your edited image will appear here</p>
          )}
        </div>
      </div>
      
      {error && <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Add a retro filter, make it black and white..."
          className="w-full bg-gray-700/50 border border-gray-600 rounded-md py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
          disabled={isLoading || !originalImage}
        />
        <button
          type="submit"
          disabled={isLoading || !file || !prompt}
          className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-md hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center shrink-0"
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </form>

      {generatedImage && (
        <a 
          href={generatedImage} 
          download="edited-image.png"
          className="bg-green-600 text-white font-bold py-3 px-6 rounded-md hover:bg-green-700 transition-colors text-center w-full sm:w-auto self-center"
        >
          Download Image
        </a>
      )}

    </div>
  );
};

export default ImageEditor;

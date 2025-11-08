
import { GoogleGenAI, Modality } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Fix: Add the missing generateImageWithImagen function.
export const generateImageWithImagen = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const image = response.generatedImages[0].image;
      const base64ImageBytes: string = image.imageBytes;
      const mimeType = image.mimeType || 'image/jpeg';
      return `data:${mimeType};base64,${base64ImageBytes}`;
    }
    
    throw new Error('API response did not contain image data.');
  } catch (error) {
    console.error('Error generating image:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`Image could not be generated: ${message}`);
  }
};

export const editImageWithGemini = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }
    throw new Error('API yanıtında resim verisi bulunamadı.');
  } catch (error) {
    console.error('Resim düzenlenirken hata oluştu:', error);
    const message = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu.';
    throw new Error(`Resim düzenlenemedi: ${message}`);
  }
};

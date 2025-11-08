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

const AtaturkMemorial: React.FC = () => {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if(selectedFile.size > 4 * 1024 * 1024) {
          setError("Dosya boyutu çok büyük. Lütfen 4MB'den küçük bir resim yükleyin.");
          return;
      }
      setFile(selectedFile);
      setGeneratedImage(null);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserImage(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleGenerate = async () => {
    if (!file) {
      setError('Lütfen önce fotoğrafınızı yükleyin.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    const memorialPrompt = "A cinematic 4K vertical photograph of a table with two photo frames. On the left frame, a black-and-white portrait of Mustafa Kemal Atatürk; on the right frame, the uploaded portrait photo. Both frames are elegant and placed symmetrically on the table. In the center front, a single red rose lies on the table — the only element in color. The entire scene, except the rose, is in deep black and white tones. The lighting is soft, dramatic, and moody with a shallow depth of field. The composition evokes respect and emotion, in a high-quality, film-like style. Realistic texture, 4K ultra-detailed, cinematic lighting, volumetric shadows, artistic photography style.";

    try {
      const { base64, mimeType } = await fileToBase64(file);
      const result = await editImageWithGemini(base64, mimeType, memorialPrompt);
      setGeneratedImage(result);
    } catch (err) {
      console.error(err);
      setError('Anma fotoğrafı oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-300 mb-2">Atatürk'ü Anmak İçin</h2>
        <p className="text-gray-400">Fotoğrafınızı yükleyerek Ulu Önder Mustafa Kemal Atatürk ile yan yana özel bir anma fotoğrafı oluşturun.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div 
            className="relative w-full aspect-square bg-zinc-700/50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600 hover:border-gray-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            role="button"
            aria-label="Fotoğraf yükle"
        >
          <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
          {userImage ? (
            <img src={userImage} alt="Yüklenen fotoğraf" className="object-contain h-full w-full rounded-lg" />
          ) : (
            <div className="text-center text-gray-400 p-4">
              <p>Fotoğrafınızı yüklemek için tıklayın</p>
              <p className="text-xs mt-1">(En fazla 4MB)</p>
            </div>
          )}
        </div>
        <div className="relative w-full aspect-square bg-black/20 rounded-lg flex items-center justify-center border-2 border-gray-700">
           {isLoading && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-lg z-10">
                  <Spinner size="h-12 w-12"/>
                  <p className="mt-4 text-lg">Anma fotoğrafınız oluşturuluyor...</p>
              </div>
          )}
          {generatedImage ? (
            <img src={generatedImage} alt="Oluşturulan anma fotoğrafı" className="object-contain h-full w-full rounded-lg" />
          ) : (
             <p className="text-gray-500">Anma fotoğrafınız burada görünecek</p>
          )}
        </div>
      </div>
      
      {error && <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md text-sm" role="alert">{error}</div>}

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={handleGenerate}
          disabled={isLoading || !file}
          className="bg-gray-600 text-white font-bold py-3 px-8 rounded-md hover:bg-gray-500 disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
        >
          {isLoading ? 'Oluşturuluyor...' : 'Anma Fotoğrafı Oluştur'}
        </button>

        {generatedImage && (
          <a 
            href={generatedImage} 
            download="ataturk-anma.png"
            className="bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-md hover:bg-gray-300 transition-colors text-center w-full sm:w-auto"
          >
            Fotoğrafı İndir
          </a>
        )}
      </div>

    </div>
  );
};

export default AtaturkMemorial;
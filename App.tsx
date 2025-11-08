
import React from 'react';
import Header from './components/Header';
import AtaturkMemorial from './components/AtaturkMemorial';

const App: React.FC = () => {
  return (
    <div className="bg-zinc-900 text-gray-200 min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-4xl">
          <div className="bg-zinc-800/50 rounded-lg shadow-xl p-6 md:p-8">
            <AtaturkMemorial />
          </div>
        </div>
      </main>
      <footer className="text-center p-4 text-gray-500 text-xs">
        <p>Gemini AI ile güçlendirilmiştir.</p>
      </footer>
    </div>
  );
};

export default App;

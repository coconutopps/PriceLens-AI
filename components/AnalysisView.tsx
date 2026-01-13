import React from 'react';
import { Loader2 } from 'lucide-react';

export const AnalysisView: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 bg-primary/95 backdrop-blur-xl flex flex-col items-center justify-center text-center p-6">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full animate-pulse"></div>
        <Loader2 className="w-16 h-16 text-accent animate-spin relative z-10" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Analyzing Product</h2>
      <p className="text-gray-400">Identifying item and extracting price details with Gemini Vision...</p>
    </div>
  );
};
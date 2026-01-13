import React from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';
import { AnalysisResult } from '../types';

interface ResultModalProps {
  image: string;
  result: AnalysisResult;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({ image, result, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-secondary w-full max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        <div className="relative h-48 w-full">
          <img src={image} alt="Scanned" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary to-transparent"></div>
          <div className="absolute bottom-4 left-4">
             <span className="inline-block px-2 py-1 bg-accent/20 text-accent text-xs rounded-md border border-accent/20 font-medium backdrop-blur-md">
                {result.category}
             </span>
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-white">{result.productName}</h3>
              <p className="text-gray-400 text-sm">Confidence: {(result.confidenceScore * 100).toFixed(0)}%</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-success">{result.currency}{result.price.toFixed(2)}</p>
            </div>
          </div>

          {result.confidenceScore < 0.6 && (
            <div className="mb-6 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-yellow-200 text-sm">
                Confidence is low. Please verify the price matches the tag.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={onCancel}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
            >
              <X className="w-5 h-5" />
              Discard
            </button>
            <button 
              onClick={onConfirm}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-accent hover:bg-accent/90 text-primary font-bold transition-colors"
            >
              <Check className="w-5 h-5" />
              Save Item
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
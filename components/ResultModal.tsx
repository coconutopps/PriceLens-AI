import React, { useState } from 'react';
import { Check, X, AlertTriangle, Edit2 } from 'lucide-react';
import { AnalysisResult } from '../types';
import { CURRENCIES } from '../data/currencies';

interface ResultModalProps {
  image: string;
  result: AnalysisResult;
  onConfirm: (finalResult: AnalysisResult) => void;
  onCancel: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({ image, result, onConfirm, onCancel }) => {
  const [editedPrice, setEditedPrice] = useState<string>(result.price.toString());
  // Try to find matching symbol in our list, otherwise default to the raw value or $
  const [editedCurrencySymbol, setEditedCurrencySymbol] = useState<string>(result.currency);
  const [editedName, setEditedName] = useState<string>(result.productName);

  const handleConfirm = () => {
    onConfirm({
      ...result,
      price: parseFloat(editedPrice) || 0,
      currency: editedCurrencySymbol,
      productName: editedName
    });
  };

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
          <div className="mb-6 space-y-4">
            
            {/* Name Input */}
            <div className="space-y-1">
              <label className="text-xs text-gray-500 uppercase font-semibold">Product Name</label>
              <input 
                type="text" 
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-semibold focus:outline-none focus:border-accent/50"
              />
            </div>

            {/* Price & Currency Input */}
            <div className="flex gap-4">
              <div className="flex-1 space-y-1">
                 <label className="text-xs text-gray-500 uppercase font-semibold">Price</label>
                 <input 
                    type="number" 
                    step="0.01"
                    value={editedPrice}
                    onChange={(e) => setEditedPrice(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-success font-bold text-xl focus:outline-none focus:border-accent/50"
                  />
              </div>
              <div className="w-28 space-y-1">
                 <label className="text-xs text-gray-500 uppercase font-semibold">Currency</label>
                 <select 
                   value={editedCurrencySymbol}
                   onChange={(e) => setEditedCurrencySymbol(e.target.value)}
                   className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white font-medium focus:outline-none focus:border-accent/50"
                 >
                    {/* Add the current raw value as an option if it's not in the list, to prevent hidden state */}
                    {!CURRENCIES.some(c => c.symbol === editedCurrencySymbol) && (
                        <option value={editedCurrencySymbol}>{editedCurrencySymbol}</option>
                    )}
                    {CURRENCIES.map(c => (
                        <option key={c.code} value={c.symbol}>
                             {c.code} ({c.symbol})
                        </option>
                    ))}
                 </select>
              </div>
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
              onClick={handleConfirm}
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
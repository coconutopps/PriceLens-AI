import React, { useMemo } from 'react';
import { TrackedProduct } from '../types';
import { Camera, TrendingUp, DollarSign, Calendar, Trash2, Settings } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CURRENCIES, getCurrencyByCode } from '../data/currencies';
import { formatPrice } from '../utils/formatters';

interface DashboardProps {
  items: TrackedProduct[];
  onOpenCamera: () => void;
  onDeleteItem: (id: string) => void;
  preferredCurrency: string;
  onCurrencyChange: (currencyCode: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  items, 
  onOpenCamera, 
  onDeleteItem,
  preferredCurrency,
  onCurrencyChange
}) => {
  
  const currentCurrency = getCurrencyByCode(preferredCurrency);

  const totalValue = useMemo(() => {
    return items.reduce((acc, item) => acc + item.price, 0);
  }, [items]);

  const chartData = useMemo(() => {
    // Group items by date for the chart
    const data = [...items].reverse().map((item, index) => ({
      name: index, // Simplified X axis
      price: item.price,
      date: new Date(item.scannedAt).toLocaleDateString(),
      product: item.name
    }));
    return data;
  }, [items]);

  return (
    <div className="min-h-screen bg-primary pb-24">
      {/* Header */}
      <header className="px-6 pt-8 pb-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              PriceLens
            </h1>
            <p className="text-gray-400 text-sm">Track your findings</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative group max-w-[140px]">
                <select 
                  value={preferredCurrency}
                  onChange={(e) => onCurrencyChange(e.target.value)}
                  className="w-full appearance-none bg-secondary border border-white/10 text-white text-sm rounded-full py-2 pl-4 pr-8 focus:outline-none focus:ring-2 focus:ring-accent/50 cursor-pointer truncate"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <Settings className="w-3 h-3" />
                </div>
             </div>
             <div className="h-10 w-10 rounded-full bg-secondary border border-white/10 flex items-center justify-center shrink-0">
                <span className="font-bold text-accent">AI</span>
             </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-gradient-to-br from-secondary to-slate-900 rounded-2xl p-6 border border-white/5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Total Tracked Value</p>
              <h2 className="text-4xl font-bold text-white">
                {currentCurrency.symbol}{formatPrice(totalValue)}
              </h2>
            </div>
            <div className="p-3 bg-accent/10 rounded-xl">
              <TrendingUp className="text-accent w-6 h-6" />
            </div>
          </div>
          
          <div className="mt-6 h-16 w-full relative z-10">
             {items.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="price" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                  </AreaChart>
                </ResponsiveContainer>
             ) : (
                <div className="flex items-center justify-center h-full text-xs text-gray-500 italic">
                   Add more items to see trends
                </div>
             )}
          </div>
        </div>
      </header>

      {/* Action Button - Sticky */}
      <div className="fixed bottom-6 right-6 z-40">
        <button 
          onClick={onOpenCamera}
          className="bg-accent hover:bg-accent/90 text-primary rounded-full p-4 shadow-lg shadow-accent/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 font-bold pr-6"
        >
          <Camera className="w-6 h-6" />
          <span>Scan Item</span>
        </button>
      </div>

      {/* Recent Items List */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
           <h3 className="text-lg font-semibold text-white">Recent Scans</h3>
           <span className="text-xs text-gray-500 bg-secondary px-2 py-1 rounded-full">{items.length} items</span>
        </div>

        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl">
              <div className="bg-secondary/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-400 font-medium">No items tracked yet</p>
              <p className="text-gray-600 text-sm mt-1">Tap the button to start scanning</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="bg-secondary/40 border border-white/5 rounded-xl p-4 flex gap-4 hover:bg-secondary/60 transition-colors group">
                <div className="w-16 h-16 bg-black/50 rounded-lg overflow-hidden shrink-0">
                  {item.imageBase64 ? (
                    <img src={item.imageBase64} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <DollarSign className="text-gray-600 w-6 h-6" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-white truncate pr-2">{item.name}</h4>
                    <span className="text-success font-bold whitespace-nowrap">
                      {item.currency}{formatPrice(item.price)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-white/5 text-gray-400 px-2 py-0.5 rounded text-nowrap">
                      {item.category}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.scannedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => onDeleteItem(item.id)}
                  className="self-center p-2 text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
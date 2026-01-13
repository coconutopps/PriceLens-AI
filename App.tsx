import React, { useState, useEffect } from 'react';
import { CameraScanner } from './components/CameraScanner';
import { Dashboard } from './components/Dashboard';
import { AnalysisView } from './components/AnalysisView';
import { ResultModal } from './components/ResultModal';
import { analyzeImage } from './services/geminiService';
import { TrackedProduct, ViewState, AnalysisResult } from './types';
import { CURRENCIES, getCurrencyByCode } from './data/currencies';

const STORAGE_KEY = 'pricelens_items_v1';
const PREFS_KEY = 'pricelens_prefs_v1';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>(ViewState.DASHBOARD);
  const [items, setItems] = useState<TrackedProduct[]>([]);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  // Store the preferred Currency CODE (e.g. 'USD'), not symbol
  const [preferredCurrency, setPreferredCurrency] = useState<string>('USD');

  // Load items and prefs from local storage on mount
  useEffect(() => {
    const savedItems = localStorage.getItem(STORAGE_KEY);
    const savedPrefs = localStorage.getItem(PREFS_KEY);
    
    if (savedItems) {
      try {
        setItems(JSON.parse(savedItems));
      } catch (e) {
        console.error("Failed to parse saved items", e);
      }
    }

    if (savedPrefs) {
      try {
        const prefs = JSON.parse(savedPrefs);
        // Basic migration: if old pref was a symbol like '$', default to USD, otherwise use the code
        if (prefs.currency) {
            if (prefs.currency.length === 1) {
                // simple heuristic for migration
                if(prefs.currency === '$') setPreferredCurrency('USD');
                else if(prefs.currency === '€') setPreferredCurrency('EUR');
                else if(prefs.currency === '£') setPreferredCurrency('GBP');
                else setPreferredCurrency('USD');
            } else {
                setPreferredCurrency(prefs.currency);
            }
        }
      } catch (e) {
        console.error("Failed to parse saved prefs", e);
      }
    }
  }, []);

  // Save items to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Save prefs to local storage
  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ currency: preferredCurrency }));
  }, [preferredCurrency]);

  const handleCapture = async (imageData: string) => {
    setCurrentImage(imageData);
    setViewState(ViewState.ANALYZING);

    try {
      // Resolve the actual symbol from the preferred code
      const currencyObj = getCurrencyByCode(preferredCurrency);
      const hint = currencyObj ? currencyObj.symbol : '$';
      
      const result = await analyzeImage(imageData, hint);
      setAnalysisResult(result);
      setViewState(ViewState.RESULT);
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Failed to analyze image. Please try again.");
      setViewState(ViewState.DASHBOARD);
    }
  };

  const handleConfirmSave = (finalResult: AnalysisResult) => {
    if (currentImage) {
      const newItem: TrackedProduct = {
        id: crypto.randomUUID(),
        name: finalResult.productName,
        price: finalResult.price,
        currency: finalResult.currency,
        category: finalResult.category,
        confidence: finalResult.confidenceScore,
        scannedAt: new Date().toISOString(),
        imageBase64: currentImage
      };

      setItems(prev => [newItem, ...prev]);
      setViewState(ViewState.DASHBOARD);
      setCurrentImage(null);
      setAnalysisResult(null);
    }
  };

  const handleDeleteItem = (id: string) => {
    if(window.confirm("Are you sure you want to delete this scan?")) {
        setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleCancelCapture = () => {
    setViewState(ViewState.DASHBOARD);
    setCurrentImage(null);
    setAnalysisResult(null);
  };

  return (
    <div className="min-h-screen bg-primary text-white font-sans selection:bg-accent/30">
      
      {viewState === ViewState.DASHBOARD && (
        <Dashboard 
          items={items} 
          onOpenCamera={() => setViewState(ViewState.CAMERA)} 
          onDeleteItem={handleDeleteItem}
          preferredCurrency={preferredCurrency}
          onCurrencyChange={setPreferredCurrency}
        />
      )}

      {viewState === ViewState.CAMERA && (
        <CameraScanner 
          onCapture={handleCapture} 
          onClose={() => setViewState(ViewState.DASHBOARD)} 
        />
      )}

      {viewState === ViewState.ANALYZING && (
        <AnalysisView />
      )}

      {viewState === ViewState.RESULT && analysisResult && currentImage && (
        <ResultModal 
          image={currentImage} 
          result={analysisResult} 
          onConfirm={handleConfirmSave} 
          onCancel={handleCancelCapture}
        />
      )}
    </div>
  );
};

export default App;
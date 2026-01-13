import React, { useState, useEffect } from 'react';
import { CameraScanner } from './components/CameraScanner';
import { Dashboard } from './components/Dashboard';
import { AnalysisView } from './components/AnalysisView';
import { ResultModal } from './components/ResultModal';
import { analyzeImage } from './services/geminiService';
import { TrackedProduct, ViewState, AnalysisResult } from './types';

const STORAGE_KEY = 'pricelens_items_v1';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>(ViewState.DASHBOARD);
  const [items, setItems] = useState<TrackedProduct[]>([]);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Load items from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved items", e);
      }
    }
  }, []);

  // Save items to local storage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const handleCapture = async (imageData: string) => {
    setCurrentImage(imageData);
    setViewState(ViewState.ANALYZING);

    try {
      const result = await analyzeImage(imageData);
      setAnalysisResult(result);
      setViewState(ViewState.RESULT);
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Failed to analyze image. Please try again.");
      setViewState(ViewState.DASHBOARD);
    }
  };

  const handleConfirmSave = () => {
    if (analysisResult && currentImage) {
      const newItem: TrackedProduct = {
        id: crypto.randomUUID(),
        name: analysisResult.productName,
        price: analysisResult.price,
        currency: analysisResult.currency,
        category: analysisResult.category,
        confidence: analysisResult.confidenceScore,
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
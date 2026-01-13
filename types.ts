export interface TrackedProduct {
  id: string;
  name: string;
  price: number;
  currency: string;
  category: string;
  scannedAt: string; // ISO Date string
  imageBase64?: string; // Optional thumbnail
  confidence: number;
}

export interface AnalysisResult {
  productName: string;
  price: number;
  currency: string;
  category: string;
  confidenceScore: number;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  CAMERA = 'CAMERA',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT'
}
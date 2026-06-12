export interface User {
  id: number;
  email: string;
  full_name: string;
  profile_picture?: string;
  created_at: string;
}

export interface Prediction {
  id: number;
  user_id: number;
  image_type: 'ECG' | 'MRI' | 'CT' | 'X-RAY';
  image_path: string;
  disease: string;
  confidence: number;
  probability: number;
  risk_level: 'Low' | 'Medium' | 'High';
  explanation: string;
  created_at: string;
  report_path?: string;
  report_id?: number;
}

export interface Report {
  id: number;
  user_id: number;
  prediction_id: number;
  report_path: string;
  created_at: string;
}

export interface ChatMessage {
  id: number;
  user_id: number;
  message: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

export interface Settings {
  id: number;
  user_id: number;
  dark_mode: boolean;
  email_notifications: boolean;
  weekly_reports: boolean;
}

export interface DiseaseDistribution {
  name: string;
  value: number;
}

export interface PredictionTrend {
  date: string;
  count: number;
}

export interface DashboardStats {
  total_predictions: number;
  reports_generated: number;
  chat_sessions: number;
  accuracy_score: number;
  recent_predictions: Prediction[];
  disease_distribution: DiseaseDistribution[];
  prediction_trends: PredictionTrend[];
}

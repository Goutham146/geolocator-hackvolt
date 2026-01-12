export interface Coordinates {
  lat: number;
  lng: number;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export interface LocationHistoryItem extends Coordinates {
  id: string;
  timestamp: number;
}
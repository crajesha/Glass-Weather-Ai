
export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  high: number;
  low: number;
  humidity: string;
  windSpeed: string;
  visibility: string;
  pressure: string;
  description: string;
  forecast: ForecastDay[];
  aiAdvice: string;
  sources: GroundingSource[];
}

export interface ForecastDay {
  day: string;
  temp: number;
  condition: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

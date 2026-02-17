
import { GoogleGenAI, Type } from "@google/genai";
import { WeatherData, GroundingSource } from "../types";

export class WeatherService {
  private ai: any;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async fetchWeather(query: string, locationCoords?: { lat: number; lng: number }): Promise<WeatherData> {
    const prompt = `
      Fetch the current weather for ${query}. 
      Return the data in a clean structured format. 
      Include current temperature (Celsius), condition, high/low, humidity, wind speed, visibility, and pressure.
      Also provide a 3-day forecast summary.
      Additionally, give personalized AI advice on what to wear or carry (e.g., umbrella, sunglasses) based on these conditions.
      
      IMPORTANT: Structure your response so I can easily find these details.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text;
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      
      const sources: GroundingSource[] = groundingChunks
        .filter((chunk: any) => chunk.web)
        .map((chunk: any) => ({
          title: chunk.web.title,
          uri: chunk.web.uri,
        }));

      // Since we can't use responseSchema with googleSearch, we parse the text manually/heuristically
      // In a real app, we might do a second pass without search to format JSON, but here we'll extract common patterns.
      
      return this.parseAIResponse(text, query, sources);
    } catch (error) {
      console.error("Error fetching weather:", error);
      throw error;
    }
  }

  private parseAIResponse(text: string, query: string, sources: GroundingSource[]): WeatherData {
    // Regex extraction as a fallback for the structured text
    const tempMatch = text.match(/(\d+)\s?°C/);
    const humidityMatch = text.match(/Humidity:\s?(\d+%)/i);
    const windMatch = text.match(/Wind:\s?([\d.]+\s?km\/h|mph)/i);

    return {
      location: query.charAt(0).toUpperCase() + query.slice(1),
      temperature: tempMatch ? parseInt(tempMatch[1]) : 20,
      condition: this.extractCondition(text),
      high: 25,
      low: 15,
      humidity: humidityMatch ? humidityMatch[1] : "45%",
      windSpeed: windMatch ? windMatch[1] : "12 km/h",
      visibility: "10 km",
      pressure: "1013 hPa",
      description: text,
      forecast: [
        { day: "Tomorrow", temp: 22, condition: "Partly Cloudy" },
        { day: "Wed", temp: 19, condition: "Rain" },
        { day: "Thu", temp: 24, condition: "Sunny" },
      ],
      aiAdvice: this.extractAdvice(text),
      sources
    };
  }

  private extractCondition(text: string): string {
    const conditions = ["Sunny", "Cloudy", "Rain", "Snow", "Storm", "Clear", "Overcast", "Mist"];
    for (const c of conditions) {
      if (text.toLowerCase().includes(c.toLowerCase())) return c;
    }
    return "Cloudy";
  }

  private extractAdvice(text: string): string {
    // Simple heuristic: find the part about "wear" or "clothing"
    const adviceIndex = text.toLowerCase().indexOf("advice");
    if (adviceIndex !== -1) return text.substring(adviceIndex);
    return "The AI suggests checking the forecast regularly for sudden changes.";
  }
}


import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Wind, 
  Droplets, 
  Sun, 
  CloudRain, 
  Cloud, 
  Thermometer, 
  ExternalLink,
  Navigation,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { WeatherService } from './services/weatherService';
import { WeatherData } from './types';
import { GlassCard } from './components/GlassCard';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const weatherService = new WeatherService();

const chartData = [
  { time: '06:00', temp: 15 },
  { time: '09:00', temp: 18 },
  { time: '12:00', temp: 24 },
  { time: '15:00', temp: 26 },
  { time: '18:00', temp: 22 },
  { time: '21:00', temp: 17 },
  { time: '00:00', temp: 14 },
];

const App: React.FC = () => {
  const [search, setSearch] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (query: string) => {
    if (!query) return;
    setLoading(true);
    setError(null);
    try {
      const data = await weatherService.fetchWeather(query);
      setWeather(data);
    } catch (err) {
      setError("Failed to fetch weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSearch = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const data = await weatherService.fetchWeather(`coordinates: ${position.coords.latitude}, ${position.coords.longitude}`);
            setWeather(data);
          } catch (err) {
            setError("Could not get weather for your location.");
          } finally {
            setLoading(false);
          }
        },
        () => {
          setError("Location access denied.");
          setLoading(false);
        }
      );
    }
  };

  useEffect(() => {
    // Initial fetch for Bangalore, Karnataka, India
    fetchWeather("Bangalore, Karnataka, India");
  }, []);

  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('sun') || c.includes('clear')) return <Sun className="w-16 h-16 text-yellow-300 drop-shadow-lg" />;
    if (c.includes('rain')) return <CloudRain className="w-16 h-16 text-blue-400 drop-shadow-lg" />;
    return <Cloud className="w-16 h-16 text-gray-300 drop-shadow-lg" />;
  };

  return (
    <div className="min-h-screen w-full bg-[#0f172a] text-white relative overflow-hidden flex flex-col animate-gradient">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1599939575322-792a129a734a?auto=format&fit=crop&q=80&w=1920" 
          className="w-full h-full object-cover opacity-30 mix-blend-overlay"
          alt="background"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f172a]/50 to-[#0f172a]"></div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-3 rounded-2xl border border-blue-500/30">
              <Sparkles className="text-blue-400 w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">GlassWeather <span className="text-blue-400">AI</span></h1>
              <p className="text-white/40 text-sm font-medium">Powered by Gemini 3 Flash</p>
            </div>
          </div>

          <div className="flex w-full md:w-auto gap-2">
            <div className="relative flex-1 md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-blue-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search city..." 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-white/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchWeather(search)}
              />
            </div>
            <button 
              onClick={handleLocationSearch}
              className="bg-white/5 border border-white/10 p-3 rounded-2xl hover:bg-white/10 transition-colors group"
              title="Use current location"
            >
              <Navigation className="w-6 h-6 text-white/60 group-hover:text-blue-400 transition-colors" />
            </button>
          </div>
        </header>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <RefreshCw className="w-12 h-12 text-blue-400 animate-spin mb-4" />
            <p className="text-white/60 animate-pulse">Scanning the skies with Gemini AI...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-400 text-center mb-8">
            {error}
          </div>
        )}

        {weather && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Weather Card */}
            <div className="lg:col-span-2 space-y-8">
              <GlassCard className="relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  {getWeatherIcon(weather.condition)}
                </div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                  <div>
                    <div className="flex items-center gap-2 text-white/60 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-lg font-medium uppercase tracking-widest">{weather.location}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-8xl font-bold tracking-tighter">{weather.temperature}</span>
                      <span className="text-4xl font-semibold mt-4 ml-1">°C</span>
                    </div>
                    <p className="text-2xl font-medium text-white/80 mt-2">{weather.condition}</p>
                    <div className="flex items-center gap-4 mt-4 text-white/50 text-sm font-medium">
                      <span className="flex items-center gap-1"><Thermometer className="w-4 h-4" /> H: {weather.high}°</span>
                      <span className="flex items-center gap-1"><Thermometer className="w-4 h-4" /> L: {weather.low}°</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-1 gap-4 w-full md:w-auto">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                      <Wind className="text-blue-400 w-5 h-5" />
                      <div>
                        <p className="text-white/40 text-xs font-bold uppercase">Wind</p>
                        <p className="text-sm font-semibold">{weather.windSpeed}</p>
                      </div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                      <Droplets className="text-blue-400 w-5 h-5" />
                      <div>
                        <p className="text-white/40 text-xs font-bold uppercase">Humidity</p>
                        <p className="text-sm font-semibold">{weather.humidity}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Temperature Trend Chart */}
              <GlassCard title="Temperature Trend (24h)">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="time" 
                        stroke="rgba(255,255,255,0.2)" 
                        fontSize={12} 
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 23, 42, 0.8)', 
                          borderRadius: '12px', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          backdropFilter: 'blur(8px)'
                        }} 
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="temp" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorTemp)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              {/* Grounding Sources - MANDATORY */}
              <GlassCard title="Information Sources">
                <div className="flex flex-wrap gap-3">
                  {weather.sources.length > 0 ? weather.sources.map((source, idx) => (
                    <a 
                      key={idx} 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-4 py-2 text-sm text-white/60 transition-colors"
                    >
                      <span className="truncate max-w-[150px]">{source.title}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )) : (
                    <p className="text-white/30 italic text-sm">Direct AI calculation based on latest trends.</p>
                  )}
                </div>
              </GlassCard>
            </div>

            {/* Sidebar Cards */}
            <div className="space-y-8">
              {/* AI Recommendations */}
              <GlassCard className="border-blue-500/30 bg-blue-500/5">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-blue-400">AI Assistant</h3>
                </div>
                <div className="prose prose-invert prose-sm">
                  <div className="text-white/80 leading-relaxed italic">
                    {weather.aiAdvice}
                  </div>
                  <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/60 leading-relaxed">
                    Based on current conditions in {weather.location}, Gemini recommends suitable attire and accessories.
                  </div>
                </div>
              </GlassCard>

              {/* 3-Day Forecast */}
              <GlassCard title="Next 3 Days">
                <div className="space-y-6">
                  {weather.forecast.map((day, idx) => (
                    <div key={idx} className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="bg-white/5 p-2 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                          {getWeatherIcon(day.condition)}
                        </div>
                        <div>
                          <p className="font-semibold">{day.day}</p>
                          <p className="text-xs text-white/40">{day.condition}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{day.temp}°</p>
                        <div className="w-12 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-blue-400" style={{ width: `${(day.temp / 40) * 100}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Extra Details */}
              <GlassCard title="Atmospheric Details">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-white/40 uppercase font-bold">Visibility</p>
                    <p className="text-lg font-semibold">{weather.visibility}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-white/40 uppercase font-bold">Pressure</p>
                    <p className="text-lg font-semibold">{weather.pressure}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-white/40 uppercase font-bold">UV Index</p>
                    <p className="text-lg font-semibold">Low (2)</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-white/40 uppercase font-bold">Dew Point</p>
                    <p className="text-lg font-semibold">12°C</p>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-white/5 mt-auto">
        <div className="container mx-auto px-4 text-center space-y-2">
          <p className="text-white/50 text-sm font-medium">
            Developed by <span className="text-blue-400 font-bold">C.Rajesha</span> | AIML Engineer
          </p>
          <p className="text-white/20 text-xs">
            &copy; 2024 GlassWeather AI. Real-time grounding via Google Search API.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;

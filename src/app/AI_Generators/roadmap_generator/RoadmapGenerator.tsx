'use client';

import { useState } from 'react';
import { Loader2, MapPin, BookOpen, Target, Sparkles, Download, Copy, CheckCircle } from 'lucide-react';
import Breadcrumb from "@/components/Auth/Breadcrumbs/Breadcrumb";

type DifficultyLevel = 'Basic' | 'Intermediate' | 'Advanced';

interface RoadmapResponse {
  roadmap: string;
  status: string;
}

export default function RoadmapGenerator() {
  const [domain, setDomain] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Basic');
  const [roadmap, setRoadmap] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;

    setLoading(true);
    setError('');
    setRoadmap('');

    try {
      const response = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, difficulty }),
      });

      if (!response.ok) throw new Error('Failed to generate roadmap');

      const data: RoadmapResponse = await response.json();
      setRoadmap(data.roadmap);
    } catch (error) {
      setError('Failed to generate roadmap. Please try again.');
      console.error('Roadmap generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roadmap);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy roadmap:', error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([roadmap], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${domain.replace(/\s+/g, '_')}_${difficulty}_Roadmap.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getDifficultyColor = (level: DifficultyLevel) => {
    switch (level) {
      case 'Basic':
        return 'from-amber-400 to-orange-500';
      case 'Intermediate':
        return 'from-orange-500 to-red-500';
      case 'Advanced':
        return 'from-red-500 to-pink-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getDifficultyIcon = (level: DifficultyLevel) => {
    switch (level) {
      case 'Basic':
        return <BookOpen className="w-4 h-4" />;
      case 'Intermediate':
        return <Target className="w-4 h-4" />;
      case 'Advanced':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header Section */}
        <div className="mb-10 text-center">
          <div className="mb-6 inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-600 rounded-3xl shadow-2xl shadow-orange-500/25">
            <MapPin className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-500 bg-clip-text text-transparent mb-4">
            AI Roadmap Generator
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Generate personalized, structured learning paths for any domain with AI-powered insights
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-orange-500/20 overflow-hidden">
          {/* Form Section */}
          <div className="p-8 border-b border-orange-500/20 bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-gray-900/80">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Domain Input */}
              <div className="space-y-3">
                <label className="flex items-center text-base font-semibold text-orange-300">
                  <BookOpen className="w-5 h-5 mr-3 text-amber-400" />
                  Domain Name
                </label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="e.g., Machine Learning, Web Development, Data Science"
                  className="w-full p-5 text-white bg-gray-900/80 border border-orange-500/30 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 placeholder-gray-400 text-lg backdrop-blur-sm shadow-inner"
                />
              </div>

              {/* Difficulty Selection */}
              <div className="space-y-4">
                <label className="flex items-center text-base font-semibold text-orange-300">
                  <Target className="w-5 h-5 mr-3 text-amber-400" />
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {(['Basic', 'Intermediate', 'Advanced'] as DifficultyLevel[]).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDifficulty(level)}
                      className={`p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center space-y-3 transform hover:scale-105 ${
                        difficulty === level
                          ? `border-transparent bg-gradient-to-br ${getDifficultyColor(level)} text-white shadow-2xl shadow-orange-500/30 scale-105`
                          : 'border-orange-500/30 bg-gray-900/60 text-gray-300 hover:border-amber-400/50 hover:bg-gray-800/80 hover:text-orange-200'
                      }`}
                    >
                      <div className={`p-2 rounded-xl ${difficulty === level ? 'bg-white/20' : 'bg-orange-500/20'}`}>
                        {getDifficultyIcon(level)}
                      </div>
                      <span className="font-semibold text-lg">{level}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                type="submit"
                disabled={loading || !domain.trim()}
                className="w-full p-6 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-600 text-white rounded-2xl font-bold text-lg hover:from-amber-600 hover:via-orange-600 hover:to-yellow-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-4 shadow-2xl hover:shadow-orange-500/25 transform hover:scale-[1.02] disabled:transform-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Generating Your Roadmap...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    <span>Generate AI Roadmap</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-6 bg-red-900/30 border-l-4 border-red-500 backdrop-blur-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-800/50 rounded-2xl flex items-center justify-center">
                    <span className="text-red-400 text-2xl">⚠️</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-red-200 font-semibold text-lg">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Roadmap Results */}
          {roadmap && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${getDifficultyColor(difficulty)} shadow-lg`}>
                    <div className="text-white">
                      {getDifficultyIcon(difficulty)}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                      {domain} Learning Roadmap
                    </h2>
                    <p className="text-orange-300 font-medium mt-1">
                      {difficulty} Level • AI Generated
                    </p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleCopy}
                    className="p-3 text-gray-400 hover:text-amber-400 hover:bg-orange-500/20 rounded-2xl transition-all duration-300 backdrop-blur-sm border border-orange-500/20 hover:border-amber-400/30"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : (
                      <Copy className="w-6 h-6" />
                    )}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-3 text-gray-400 hover:text-amber-400 hover:bg-orange-500/20 rounded-2xl transition-all duration-300 backdrop-blur-sm border border-orange-500/20 hover:border-amber-400/30"
                    title="Download as text file"
                  >
                    <Download className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Roadmap Content */}
              <div className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 rounded-2xl border border-orange-500/20 p-8 shadow-2xl backdrop-blur-sm">
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-gray-200 leading-relaxed text-lg font-light">
                    {roadmap}
                  </div>
                </div>
              </div>

              {/* Success Message */}
              {copied && (
                <div className="mt-6 p-4 bg-green-800/30 text-green-300 rounded-2xl text-center font-semibold border border-green-500/30 backdrop-blur-sm">
                  ✅ Roadmap copied to clipboard!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-10 text-center text-gray-400">
          <p className="text-lg">Powered by <span className="text-amber-400 font-semibold">Google Gemini AI</span> • Generate unlimited learning roadmaps</p>
        </div>
      </div>
    </div>
  );
}
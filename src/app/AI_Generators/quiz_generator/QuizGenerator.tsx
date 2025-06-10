'use client'
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import { Upload, Link2, MessageSquare, Loader2, CheckCircle, XCircle, Trophy, RotateCcw } from 'lucide-react';

const QuizGenerator = () => {
  const genAIRef = useRef<GoogleGenerativeAI | null>(null);

  interface Question {
    question: string;
    options: string[];
    answer: string;
  }

  interface IncorrectAnswer {
    question: string;
    correctAnswer: string;
    userAnswer: string;
  }

  interface QuizResult {
    question: string;
    isCorrect: boolean;
    userAnswer: string;
    correctAnswer: string;
  }

  const extractAnswerLetter = (answer: string): string => {
    if (!answer) return '';
    const match = answer.match(/^([A-D])/);
    return match ? match[1] : answer;
  };

  const [inputType, setInputType] = useState<'pdf' | 'topic' | 'url'>('pdf');
  const [topic, setTopic] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');
  const [score, setScore] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState<IncorrectAnswer[]>([]);
  const [apiKeyError, setApiKeyError] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    console.log('API Key exists:', !!apiKey); // Debug log
    
    if (!apiKey) {
      setApiKeyError(true);
      setError('Google API Key is missing. Please add NEXT_PUBLIC_GOOGLE_API_KEY to your environment variables.');
    } else {
      try {
        genAIRef.current = new GoogleGenerativeAI(apiKey);
        setApiKeyError(false);
        console.log('Google AI initialized successfully'); // Debug log
      } catch (error) {
        console.error('Failed to initialize Google AI:', error);
        setApiKeyError(true);
        setError('Failed to initialize Google AI. Please check your API key.');
      }
    }
  }, []);

  const generateQuestions = async (text: string) => {
    if (!genAIRef.current) {
      console.error('Google AI not initialized. Current state:', { 
        apiKeyExists: !!process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
        genAIRef: !!genAIRef.current
      });
      throw new Error('Google AI not initialized. Please check your API key.');
    }

    const model = genAIRef.current.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Generate ${numQuestions} quiz questions based on the following content:
      ${text}
      
      Provide questions with four answer options (A, B, C, D). Also, include the correct answer.
      Format each question as follows:
      Question 1: [Your question here]
      A. [Option A]
      B. [Option B]
      C. [Option C]
      D. [Option D]
      **Answer:** [Correct Option]`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return parseQuestions(response.text());
    } catch (error: any) {
      console.error('Error generating questions:', error);
      if (error.message?.includes('API Key')) {
        throw new Error('Invalid API Key. Please check your Google API Key configuration.');
      }
      throw new Error('Failed to generate questions. Please try again.');
    }
  };

  const parseQuestions = (rawText: string): Question[] => {
    const questions: Question[] = [];
    const lines = rawText.split('\n');
    let currentQuestion: Partial<Question> = {};

    lines.forEach(line => {
      line = line.trim();
      if (line.startsWith('Question')) {
        if (Object.keys(currentQuestion).length > 0 && currentQuestion.question && currentQuestion.options && currentQuestion.answer) {
          questions.push(currentQuestion as Question);
        }
        currentQuestion = { question: line, options: [] };
      } else if (line.match(/^[A-D]\./)) {
        currentQuestion.options = [...(currentQuestion.options || []), line];
      } else if (line.startsWith('**Answer:**')) {
        currentQuestion.answer = line.replace('**Answer:**', '').trim();
      }
    });

    if (Object.keys(currentQuestion).length > 0 && currentQuestion.question && currentQuestion.options && currentQuestion.answer) {
      questions.push(currentQuestion as Question);
    }

    return questions.filter(q => q.question && q.options && q.options.length === 4 && q.answer);
  };

  const handleSubmit = async () => {
    if (apiKeyError) {
      setError('Cannot generate quiz: Google API Key is missing or invalid.');
      return;
    }

    setLoading(true);
    setError('');
    setQuestions([]);
    setUserAnswers({});
    setShowResults(false);
    
    try {
      let text = '';
      
      if (inputType === 'pdf' && file) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post('/api/quiz/pdf', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        });
        text = response.data.text;
      } else if (inputType === 'url' && url) {
        const response = await axios.post('/api/extract-url', { url });
        text = response.data.text;
      } else if (inputType === 'topic' && topic) {
        text = topic;
      }

      if (text && text.trim()) {
        const generatedQuestions = await generateQuestions(text);
        if (generatedQuestions.length > 0) {
          setQuestions(generatedQuestions);
        } else {
          setError('Failed to generate valid questions. Please try again with different content.');
        }
      } else {
        setError('No content found to generate questions from.');
      }
    } catch (error: any) {
      console.error('Quiz generation error:', error);
      setError(
        error.response?.data?.error || 
        'Failed to process PDF. Please make sure the file is valid and try again.'
      );
      setLoading(false);
      return;
    }
    setLoading(false);
  };

  const handleSubmitQuiz = () => {
    if (Object.keys(userAnswers).length !== questions.length) {
      setError('Please answer all questions');
      return;
    }
    
    const results = questions.map((q, i) => {
      const userAnswerLetter = extractAnswerLetter(userAnswers[i]);
      const correctAnswerLetter = extractAnswerLetter(q.answer);
      
      return {
        question: q.question,
        isCorrect: userAnswerLetter === correctAnswerLetter,
        userAnswer: userAnswers[i],
        correctAnswer: q.answer
      };
    });

    setQuizResults(results);
    setShowResults(true);
  };

  const resetQuiz = () => {
    setQuestions([]);
    setUserAnswers({});
    setShowResults(false);
    setScore(0);
    setIncorrectAnswers([]);
    setError('');
    setFile(null);
    setTopic('');
    setUrl('');
  };

  const getInputIcon = () => {
    switch (inputType) {
      case 'pdf': return <Upload className="w-5 h-5" />;
      case 'url': return <Link2 className="w-5 h-5" />;
      case 'topic': return <MessageSquare className="w-5 h-5" />;
      default: return <Upload className="w-5 h-5" />;
    }
  };

  const isFormValid = () => {
    if (inputType === 'pdf') return file;
    if (inputType === 'url') return url.trim();
    if (inputType === 'topic') return topic.trim();
    return false;
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty value for backspace
    if (value === '') {
      setNumQuestions(1);
      return;
    }
    
    const parsedValue = parseInt(value);
    if (!isNaN(parsedValue)) {
      setNumQuestions(Math.min(Math.max(parsedValue, 1), 50));
    }
  };

  const handleRegenerateWithNewCount = async () => {
    if (inputType === 'topic' && topic) {
      await handleSubmit();
    } else {
      setError('Can only change number of questions for topic-based quizzes');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            Quiz Generator 🎓
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Generate intelligent quiz questions from PDFs, topics, or web content using AI
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {!showResults && questions.length === 0 && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 mb-8">
              {/* Input Type Selection */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-300 mb-4">Select Input Type</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'pdf', label: 'Upload PDF', icon: Upload },
                    { value: 'topic', label: 'Enter Topic', icon: MessageSquare },
                    { value: 'url', label: 'Enter URL', icon: Link2 }
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setInputType(value as 'pdf' | 'topic' | 'url')}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center space-x-3 ${
                        inputType === value
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                          : 'border-gray-600 hover:border-gray-500 text-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of Questions */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-300 mb-3">Number of Questions</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={numQuestions.toString()}
                  onChange={handleNumberChange}
                  className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="Enter number of questions (1-50)"
                />
              </div>

              {/* Input Fields */}
              <div className="mb-8">
                {inputType === 'pdf' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3">Upload PDF File</label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="pdf-upload"
                      />
                      <label
                        htmlFor="pdf-upload"
                        className="w-full p-6 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-emerald-500 transition-colors flex flex-col items-center justify-center text-gray-400 hover:text-emerald-400"
                      >
                        <Upload className="w-8 h-8 mb-2" />
                        <span className="text-sm font-medium">
                          {file ? file.name : 'Click to upload PDF file'}
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {inputType === 'topic' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3">Enter Topic</label>
                    <textarea
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                      rows={6}
                      placeholder="Enter your topic or subject matter here..."
                    />
                  </div>
                )}

                {inputType === 'url' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3">Enter URL</label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="https://example.com"
                    />
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <button
                onClick={handleSubmit}
                disabled={loading || !isFormValid() || apiKeyError}
                className="w-full p-4 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating Quiz...</span>
                  </>
                ) : apiKeyError ? (
                  <>
                    <XCircle className="w-5 h-5" />
                    <span>API Key Required</span>
                  </>
                ) : (
                  <>
                    {getInputIcon()}
                    <span>Generate Quiz</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-xl p-4 mb-8 flex items-center space-x-3">
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span className="text-red-300">{error}</span>
            </div>
          )}

          {/* Quiz Questions */}
          {questions.length > 0 && !showResults && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-emerald-400">Quiz Questions</h2>
                <div className="flex items-center space-x-4">
                  {inputType === 'topic' && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={numQuestions.toString()}
                        onChange={handleNumberChange}
                        className="w-20 p-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                      />
                      <button
                        onClick={handleRegenerateWithNewCount}
                        className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        title="Regenerate with new count"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={resetQuiz}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>
              
              {questions.map((q, i) => (
                <div key={i} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <p className="font-semibold text-lg mb-4 text-gray-100">{q.question}</p>
                  <div className="space-y-3">
                    {q.options.map((option, j) => (
                      <label key={j} className="flex items-center space-x-3 cursor-pointer group">
                        <input
                          type="radio"
                          name={`question-${i}`}
                          value={option}
                          checked={userAnswers[i] === option}
                          onChange={(e) => setUserAnswers({...userAnswers, [i]: e.target.value})}
                          className="w-4 h-4 text-emerald-500 bg-gray-700 border-gray-600 focus:ring-emerald-500"
                        />
                        <span className="text-gray-300 group-hover:text-white transition-colors">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              
              <button
                onClick={handleSubmitQuiz}
                className="w-full p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Submit Quiz</span>
              </button>
            </div>
          )}

          {/* Results */}
          {showResults && (
            <div className="space-y-6">
              {/* Score Display */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Trophy className="w-8 h-8 text-emerald-400" />
                  <div>
                    <h3 className="text-xl font-bold text-emerald-400">Your Score</h3>
                    <p className="text-2xl font-bold text-white">
                      {quizResults.filter(r => r.isCorrect).length} / {questions.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Review Section */}
              {quizResults.some(r => !r.isCorrect) && (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <h3 className="text-xl font-bold text-red-400 mb-4">Review Your Mistakes ❌</h3>
                  <div className="space-y-4">
                    {quizResults.filter(r => !r.isCorrect).map((result, idx) => (
                      <div key={idx} className="p-4 bg-gray-700/50 rounded-lg">
                        <p className="font-medium text-gray-200 mb-2">{result.question}</p>
                        <p className="text-red-400">❌ Your Answer: {result.userAnswer}</p>
                        <p className="text-emerald-400">✅ Correct Answer: {result.correctAnswer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Areas to Improve */}
              {quizResults.some(r => !r.isCorrect) && (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <h3 className="text-xl font-bold text-blue-400 mb-4">📌 Areas to Improve</h3>
                  <div className="space-y-2">
                    {Array.from(new Set(quizResults.filter(r => !r.isCorrect)
                      .map(r => r.question.split(':')[1]?.trim() || r.question)))
                      .map((topic, idx) => (
                        <p key={idx} className="text-gray-300">
                          🔹 Revise: {topic}
                        </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Reset Button */}
              <button
                onClick={resetQuiz}
                className="w-full p-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Try Again</span>
              </button>
            </div>
          )}
        </div>
        <div className="mt-10 text-center text-gray-400">
          <p className="text-lg">Powered by <span className="text-lime-400 font-semibold">Google Gemini AI</span> • Generate unlimited quizes for diverse domains</p>
        </div>
      </div>
    </div>
  );
};

export default QuizGenerator;
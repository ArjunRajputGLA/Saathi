"use client";

import { useState, useRef, useCallback } from "react";
import Breadcrumb from "@/components/Auth/Breadcrumbs/Breadcrumb";
import { Alert } from "@/components/ui-elements/alert";
import ProgressBar from "@ramonak/react-progress-bar";
import { FiUploadCloud, FiFile, FiDownload, FiTrash2, FiFileText, FiBarChart, FiEye, FiClock } from "react-icons/fi";
import DocumentChatbot from '@/components/DocumentChatbot';

interface AnalysisData {
  basicStats: {
    wordCount: number;
    charCount: number;
    lineCount: number;
    paragraphCount: number;
    pageCount?: number;
  };
  contentAnalysis: {
    topKeywords: string[];
    averageWordLength: number;
    readingTime: string;
    languageDetected: string;
    sentiment: string;
    complexity: string;
  };
  keyInsights: string[];
  summary: string;
  preview: string;
}

export default function Page() {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setAnalysis(null);
    setProgress(0);

    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError(`File "${file.name}" exceeds 10MB limit`);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];

    if (!allowedTypes.includes(file.type) && !file.name.endsWith(".txt")) {
      setError(
        `File "${file.name}" is not supported. Please upload a PDF, Word, text, or .pptx file.`
      );
      return;
    }

    setIsLoading(true);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 300);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/analyze-document", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const text = await response.text();
        console.error(
          `Non-OK response for "${file.name}": ${response.status} ${response.statusText}`,
          text
        );
        try {
          const data = JSON.parse(text);
          setError(data.error || `Server error: ${response.status}`);
        } catch (jsonError) {
          setError(
            `Server error for "${file.name}": ${response.status} - ${text.slice(
              0,
              100
            )}...`
          );
        }
        return;
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err) {
      clearInterval(progressInterval);
      setProgress(0);
      console.error(`Fetch error for "${file.name}":`, err);
      setError(
        err instanceof Error
          ? `Error analyzing "${file.name}": ${err.message}`
          : `An error occurred while analyzing "${file.name}"`
      );
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        const fakeInput = document.createElement("input");
        fakeInput.type = "file";
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fakeInput.files = dataTransfer.files;

        handleFileUpload({
          target: fakeInput,
          currentTarget: fakeInput,
          preventDefault: () => {},
          stopPropagation: () => {},
          nativeEvent: new Event("change"),
          bubbles: true,
          cancelable: true,
          defaultPrevented: false,
          isDefaultPrevented: () => false,
          isPropagationStopped: () => false,
          isTrusted: true,
          persist: () => {},
          timeStamp: Date.now(),
          type: "change",
        } as React.ChangeEvent<HTMLInputElement>);
      }
    },
    [handleFileUpload]
  );

  const clearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setAnalysis(null);
    setError(null);
    setProgress(0);
    setFileName("");
  };

  const downloadAnalysis = () => {
    if (analysis) {
      const reportContent = `
DOCUMENT ANALYSIS REPORT
========================

File: ${fileName}
Analysis Date: ${new Date().toLocaleDateString()}

BASIC STATISTICS
----------------
Words: ${analysis.basicStats.wordCount}
Characters: ${analysis.basicStats.charCount}
Lines: ${analysis.basicStats.lineCount}
Paragraphs: ${analysis.basicStats.paragraphCount}
${analysis.basicStats.pageCount ? `Pages: ${analysis.basicStats.pageCount}` : ''}

CONTENT ANALYSIS
----------------
Reading Time: ${analysis.contentAnalysis.readingTime}
Average Word Length: ${analysis.contentAnalysis.averageWordLength.toFixed(1)} characters
Language: ${analysis.contentAnalysis.languageDetected}
Sentiment: ${analysis.contentAnalysis.sentiment}
Complexity: ${analysis.contentAnalysis.complexity}

TOP KEYWORDS
------------
${analysis.contentAnalysis.topKeywords.join(', ')}

KEY INSIGHTS
------------
${analysis.keyInsights.map(insight => `• ${insight}`).join('\n')}

SUMMARY
-------
${analysis.summary}

CONTENT PREVIEW
---------------
${analysis.preview}
      `;
      
      const blob = new Blob([reportContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName.split('.')[0]}_analysis.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle }: { 
    icon: any; 
    title: string; 
    value: string | number; 
    subtitle?: string; 
  }) => (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <Icon className="w-8 h-8 text-blue-500" />
      </div>
    </div>
  );

  return (
    <>
      <Breadcrumb pageName="Document Analysis" />

      <div className="space-y-8 rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card md:p-8 xl:p-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI Document Analyzer
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload your document to get comprehensive insights and analysis
          </p>
        </div>

        {/* Upload Section */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-12 transition-all duration-300 ${
            isDragging
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".pdf,.docx,.txt,.pptx"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            disabled={isLoading}
          />

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <FiUploadCloud className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Upload Document
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Drag and drop your file here, or click to browse
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 shadow-lg hover:shadow-xl"
              disabled={isLoading}
            >
              <FiFile className="mr-2" />
              {isLoading ? "Analyzing..." : "Select File"}
            </button>
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              <p>Supported formats: PDF, DOCX, TXT, PPTX</p>
              <p>Maximum file size: 10MB</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {isLoading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Analyzing document...</span>
              <span className="text-blue-600 font-medium">{Math.round(progress)}%</span>
            </div>
            <ProgressBar
              completed={progress}
              bgColor="#3b82f6"
              height="8px"
              labelColor="transparent"
              baseBgColor="#e5e7eb"
              className="rounded-full overflow-hidden"
            />
          </div>
        )}

        {/* Action Buttons */}
        {(analysis || error) && (
          <div className="flex flex-wrap gap-4 justify-center">
            {analysis && (
              <button
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={downloadAnalysis}
              >
                <FiDownload className="mr-2" />
                Download Report
              </button>
            )}
            <button
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
              onClick={clearFile}
            >
              <FiTrash2 className="mr-2" />
              Clear & Start Over
            </button>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-8">
            {/* File Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-3">
                <FiFileText className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Analysis Complete: {fileName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Processed on {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={FiFileText}
                title="Word Count"
                value={analysis.basicStats.wordCount.toLocaleString()}
                subtitle={`${analysis.basicStats.charCount.toLocaleString()} characters`}
              />
              <StatCard
                icon={FiBarChart}
                title="Structure"
                value={analysis.basicStats.paragraphCount}
                subtitle={`${analysis.basicStats.lineCount} lines`}
              />
              <StatCard
                icon={FiClock}
                title="Reading Time"
                value={analysis.contentAnalysis.readingTime}
                subtitle={`${analysis.contentAnalysis.averageWordLength.toFixed(1)} avg word length`}
              />
              <StatCard
                icon={FiEye}
                title="Language"
                value={analysis.contentAnalysis.languageDetected}
                subtitle={analysis.contentAnalysis.complexity}
              />
            </div>

            {/* Content Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Summary */}
              <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FiFileText className="w-5 h-5 mr-2 text-blue-500" />
                  Document Summary
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {analysis.summary}
                </p>
              </div>

              {/* Key Insights */}
              <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FiBarChart className="w-5 h-5 mr-2 text-green-500" />
                  Key Insights
                </h3>
                <ul className="space-y-3">
                  {analysis.keyInsights.map((insight, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700 dark:text-gray-300">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Keywords and Sentiment */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Keywords */}
              <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Top Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.contentAnalysis.topKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sentiment Analysis */}
              <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Content Analysis
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Sentiment:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {analysis.contentAnalysis.sentiment}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Complexity:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {analysis.contentAnalysis.complexity}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Preview */}
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FiEye className="w-5 h-5 mr-2 text-purple-500" />
                Content Preview
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg border-l-4 border-purple-500">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {analysis.preview}
                </p>
              </div>
            </div>

            {/* Document Chatbot */}
            <DocumentChatbot documentText={analysis.preview} />
          </div>
        )}

        <div className="mt-10 text-center text-gray-400">
          <p className="text-lg">Powered by <span className="text-indigo-400 font-semibold">Google Gemini AI</span> • Perform unlimited analysis with real time interaction</p>
        </div>

        {/* Error Display */}
        {error && (
          <Alert
            variant="error"
            title="Analysis Error"
            description={error}
          />
        )}
      </div>
    </>
  );
}
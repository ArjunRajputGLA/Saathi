'use client'
import React, { useState } from 'react';
import { FileText, Globe, MessageSquare, Download, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

const NotesGenerator = () => {
    const [inputType, setInputType] = useState<'pdf' | 'topic' | 'url'>('pdf');
    const [topic, setTopic] = useState('');
    const [url, setUrl] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Mock functions for demo purposes
    const getTextFromPDF = async (file: File) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        return "Sample PDF content extracted successfully.";
    };

    const getTextFromUrl = async (url: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        return "Sample web content extracted successfully.";
    };

    const generateNotes = async (text: string) => {
        // Simulate AI processing
        await new Promise(resolve => setTimeout(resolve, 3000));
        return `# Generated Notes

## Key Points
• Main concept explanation with detailed breakdown
• Supporting evidence and examples
• Important relationships and connections
• Critical insights and takeaways

## Summary
This section provides a comprehensive overview of the main topics covered, highlighting the most important aspects for understanding and retention.

## Additional Resources
• Recommended further reading
• Related topics for exploration
• Practice exercises or applications`;
    };

    const generateNotesFromTopic = async (topic: string) => {
        // Simulate AI processing
        await new Promise(resolve => setTimeout(resolve, 2500));
        return `# Notes on ${topic}

## Overview
Comprehensive introduction to ${topic} with foundational concepts and principles.

## Key Concepts
• Primary definitions and terminology
• Core principles and theories
• Historical context and development
• Current applications and relevance

## Detailed Analysis
In-depth examination of the subject matter, including:
• Technical specifications or methodologies
• Case studies and real-world examples
• Best practices and recommendations
• Common challenges and solutions

## Conclusion
Summary of essential points and practical applications for ${topic}.`;
    };

    const saveNotesAsPDF = (notes: string, title: string) => {
        // Mock PDF generation
        alert('PDF generation would happen here in the actual implementation');
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        setNotes('');
        
        try {
            let text = '';
            
            if (inputType === 'pdf' && file) {
                if (!file.type.includes('pdf')) {
                    throw new Error('Please select a valid PDF file');
                }
                text = await getTextFromPDF(file);
            } else if (inputType === 'url' && url.trim()) {
                if (!url.match(/^https?:\/\/.+/)) {
                    throw new Error('Please enter a valid URL starting with http:// or https://');
                }
                text = await getTextFromUrl(url.trim());
            } else if (inputType === 'topic' && topic.trim()) {
                const generatedNotes = await generateNotesFromTopic(topic.trim());
                setNotes(generatedNotes);
                setLoading(false);
                return;
            } else {
                throw new Error('Please provide valid input');
            }

            if (text.trim()) {
                const generatedNotes = await generateNotes(text);
                setNotes(generatedNotes);
            } else {
                throw new Error('No content found to generate notes from');
            }
        } catch (error: any) {
            console.error('Error generating notes:', error);
            setError(error.message || 'An error occurred while generating notes');
        }
        setLoading(false);
    };

    const resetForm = () => {
        setNotes('');
        setError('');
        setTopic('');
        setUrl('');
        setFile(null);
    };

    const inputOptions = [
        { 
            value: 'pdf', 
            icon: FileText, 
            title: 'PDF Document', 
            desc: 'Upload and extract content from PDF files' 
        },
        { 
            value: 'topic', 
            icon: MessageSquare, 
            title: 'Topic Research', 
            desc: 'Generate comprehensive notes on any subject' 
        },
        { 
            value: 'url', 
            icon: Globe, 
            title: 'Web Content', 
            desc: 'Extract and summarize web articles' 
        }
    ];

    return (
        <div className="min-h-screen bg-gray-900 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-6 shadow-lg">
                        <FileText className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4">
                        AI Notes Generator
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Transform your content into structured, comprehensive notes with AI-powered analysis
                    </p>
                </div>

                <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
                    {/* Input Method Selection */}
                    <div className="p-8 border-b border-gray-700">
                        <h2 className="text-lg font-semibold text-white mb-6">
                            Select Input Method
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {inputOptions.map((option) => {
                                const IconComponent = option.icon;
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            setInputType(option.value as 'pdf' | 'topic' | 'url');
                                            resetForm();
                                        }}
                                        className={`p-6 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-lg ${
                                            inputType === option.value
                                                ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                                                : 'border-gray-600 hover:border-gray-500 bg-gray-700/50'
                                        }`}
                                    >
                                        <IconComponent className={`w-8 h-8 mb-4 ${
                                            inputType === option.value ? 'text-blue-400' : 'text-gray-400'
                                        }`} />
                                        <h3 className="font-semibold text-white mb-2">
                                            {option.title}
                                        </h3>
                                        <p className="text-sm text-gray-400">
                                            {option.desc}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Input Fields */}
                    <div className="p-8 border-b border-gray-700">
                        {inputType === 'pdf' && (
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Upload PDF Document
                                </label>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-xl cursor-pointer bg-gray-700/50 hover:bg-gray-700 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 mb-2 text-gray-400" />
                                            <p className="mb-2 text-sm text-gray-400">
                                                <span className="font-semibold text-blue-400">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500">PDF files only</p>
                                        </div>
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                {file && (
                                    <div className="mt-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
                                        <div className="flex items-center space-x-3">
                                            <FileText className="w-8 h-8 text-red-400" />
                                            <div>
                                                <p className="font-medium text-white">{file.name}</p>
                                                <p className="text-sm text-gray-400">
                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {inputType === 'topic' && (
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Enter Topic or Subject
                                </label>
                                <textarea
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    className="w-full p-4 border border-gray-600 bg-gray-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all placeholder-gray-400"
                                    placeholder="e.g., Machine Learning Fundamentals, Ancient Roman History, Quantum Computing..."
                                    rows={4}
                                />
                            </div>
                        )}

                        {inputType === 'url' && (
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Website URL
                                </label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="url"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-600 bg-gray-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400"
                                        placeholder="https://example.com/article"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Generate Button */}
                    <div className="p-8">
                        <button
                            onClick={handleSubmit}
                            disabled={loading || (!file && !topic.trim() && !url.trim())}
                            className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                    Generating Notes...
                                </>
                            ) : (
                                <>
                                    <FileText className="w-5 h-5 mr-2" />
                                    Generate Notes
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mt-6 p-4 bg-red-900/50 border border-red-700 rounded-xl backdrop-blur-sm">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-red-300">Error</p>
                                <p className="text-sm text-red-400 mt-1">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Generated Notes Display */}
                {notes && (
                    <div className="mt-6 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
                        <div className="p-6 border-b border-gray-700">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-white flex items-center">
                                    <CheckCircle2 className="w-6 h-6 text-green-400 mr-3" />
                                    Generated Notes
                                </h3>
                                <button
                                    onClick={() => saveNotesAsPDF(notes, inputType === 'topic' ? topic : 'Generated Notes')}
                                    className="inline-flex items-center px-4 py-2 bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors border border-gray-600"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download PDF
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <div className="bg-gray-900 border border-gray-600 rounded-xl p-6 max-h-96 overflow-y-auto">
                                <pre className="whitespace-pre-wrap text-gray-300 leading-relaxed text-sm font-mono">
                                    {notes}
                                </pre>
                            </div>
                        </div>
                    </div>
                )}
                <div className="mt-10 text-center text-gray-400">
          <p className="text-lg">Powered by <span className="text-cyan-400 font-semibold">Google Gemini AI</span> • Generate unlimited notes</p>
        </div>
            </div>
        </div>
    );
};

export default NotesGenerator;
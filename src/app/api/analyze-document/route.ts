import { NextResponse } from "next/server";
import * as mammoth from "mammoth";
import PDFParser from "pdf2json";
import { extractTextFromPPTX } from "./pptxHelper";

interface DocumentAnalysis {
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

// Helper function to reconstruct words from character-separated text
function reconstructWords(text: string): string {
  // Split into potential characters/tokens
  const tokens = text.split(/\s+/);
  
  if (tokens.length === 0) return text;
  
  const reconstructed: string[] = [];
  let currentWord = '';
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    
    // If token is a single character (letter/number)
    if (token.length === 1 && /[a-zA-Z0-9]/.test(token)) {
      currentWord += token;
    }
    // If token is punctuation
    else if (token.length === 1 && /[.,;:!?]/.test(token)) {
      if (currentWord) {
        reconstructed.push(currentWord);
        currentWord = '';
      }
      reconstructed.push(token);
    }
    // If token is already a word or multiple characters
    else {
      if (currentWord) {
        reconstructed.push(currentWord);
        currentWord = '';
      }
      reconstructed.push(token);
    }
    
    // Check if we should end the current word
    const nextToken = tokens[i + 1];
    if (currentWord && nextToken) {
      // End word if next token is punctuation or looks like start of new word
      if (/[.,;:!?]/.test(nextToken) || 
          (nextToken.length === 1 && /[A-Z]/.test(nextToken))) {
        reconstructed.push(currentWord);
        currentWord = '';
      }
    }
  }
  
  // Add any remaining word
  if (currentWord) {
    reconstructed.push(currentWord);
  }
  
  // Join with appropriate spacing
  let result = '';
  for (let i = 0; i < reconstructed.length; i++) {
    const current = reconstructed[i];
    const next = reconstructed[i + 1];
    
    result += current;
    
    // Add space if needed
    if (next && !(/[.,;:!?]/.test(next))) {
      result += ' ';
    }
  }
  
  return result;
}

// Enhanced text analysis functions
function analyzeText(text: string): DocumentAnalysis {
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const lines = text.split("\n").filter((line) => line.trim().length > 0);
  const paragraphs = text.split(/\n\s*\n/).filter((para) => para.trim().length > 0);

  // Basic statistics
  const basicStats = {
    wordCount: words.length,
    charCount: text.length,
    lineCount: lines.length,
    paragraphCount: paragraphs.length,
  };

  // Content analysis
  const contentAnalysis = analyzeContent(text, words, sentences);
  
  // Generate insights
  const keyInsights = generateKeyInsights(text, words, sentences, basicStats);
  
  // Generate summary
  const summary = generateSummary(text, sentences);
  
  // Content preview
  const preview = text.slice(0, 500) + (text.length > 500 ? "..." : "");

  return {
    basicStats,
    contentAnalysis,
    keyInsights,
    summary,
    preview,
  };
}

function analyzeContent(text: string, words: string[], sentences: string[]) {
  // Word frequency analysis
  const wordFrequency = words
    .map((word) => word.toLowerCase().replace(/[^\w]/g, ''))
    .filter((word) => word.length > 3 && !isStopWord(word))
    .reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topKeywords = Object.entries(wordFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([word]) => word);

  // Calculate reading metrics
  const averageWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
  const readingTime = `${Math.ceil(words.length / 200)} minute(s)`;

  // Analyze sentiment
  const sentiment = analyzeSentiment(text);
  
  // Analyze complexity
  const complexity = analyzeComplexity(words, sentences);

  return {
    topKeywords,
    averageWordLength,
    readingTime,
    languageDetected: "English", // Could be enhanced with actual language detection
    sentiment,
    complexity,
  };
}

function analyzeSentiment(text: string): string {
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'positive', 'successful', 'achievement', 'growth', 'improvement', 'benefit', 'advantage', 'opportunity', 'solution', 'effective', 'efficient', 'valuable', 'important', 'significant'];
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'negative', 'problem', 'issue', 'challenge', 'difficulty', 'failure', 'decline', 'decrease', 'loss', 'risk', 'threat', 'concern', 'weakness', 'limitation', 'obstacle', 'barrier'];
  
  const lowerText = text.toLowerCase();
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  
  if (positiveCount > negativeCount * 1.5) return "Positive";
  if (negativeCount > positiveCount * 1.5) return "Negative";
  return "Neutral";
}

function analyzeComplexity(words: string[], sentences: string[]): string {
  const avgWordsPerSentence = words.length / sentences.length;
  const longWords = words.filter(word => word.length > 6).length;
  const complexityRatio = longWords / words.length;
  
  if (avgWordsPerSentence > 20 || complexityRatio > 0.3) return "High";
  if (avgWordsPerSentence > 15 || complexityRatio > 0.2) return "Medium";
  return "Low";
}

function generateKeyInsights(text: string, words: string[], sentences: string[], basicStats: any): string[] {
  const insights: string[] = [];
  
  // Document length insight
  if (basicStats.wordCount > 5000) {
    insights.push("This is a comprehensive document with substantial content");
  } else if (basicStats.wordCount > 1000) {
    insights.push("This document contains moderate-length content");
  } else {
    insights.push("This is a concise document with focused content");
  }
  
  // Reading time insight
  const readingMinutes = Math.ceil(basicStats.wordCount / 200);
  if (readingMinutes > 30) {
    insights.push("Estimated reading time suggests this is an in-depth material");
  } else if (readingMinutes > 10) {
    insights.push("This document requires moderate time investment to read thoroughly");
  } else {
    insights.push("This is a quick read that can be consumed in a short time");
  }
  
  // Structure insight
  const avgWordsPerParagraph = basicStats.wordCount / basicStats.paragraphCount;
  if (avgWordsPerParagraph > 100) {
    insights.push("Document contains detailed paragraphs with comprehensive explanations");
  } else if (avgWordsPerParagraph > 50) {
    insights.push("Well-structured content with balanced paragraph lengths");
  } else {
    insights.push("Content is organized in concise, digestible sections");
  }
  
  // Vocabulary insight
  const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
  const vocabularyDiversity = uniqueWords / words.length;
  if (vocabularyDiversity > 0.6) {
    insights.push("Document demonstrates rich vocabulary and varied language use");
  } else if (vocabularyDiversity > 0.4) {
    insights.push("Moderate vocabulary diversity with some repetition of key terms");
  } else {
    insights.push("Content uses focused terminology with consistent key concepts");
  }
  
  return insights.slice(0, 4); // Return top 4 insights
}

function generateSummary(text: string, sentences: string[]): string {
  // Simple extractive summarization - take first and most important sentences
  const firstSentence = sentences[0]?.trim() || "";
  const middleSentence = sentences[Math.floor(sentences.length / 2)]?.trim() || "";
  const lastSentence = sentences[sentences.length - 1]?.trim() || "";
  
  // Score sentences based on word frequency and position
  const words = text.toLowerCase().split(/\s+/);
  const wordFreq = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const scoredSentences = sentences.map((sentence, index) => {
    const sentenceWords = sentence.toLowerCase().split(/\s+/);
    const score = sentenceWords.reduce((sum, word) => sum + (wordFreq[word] || 0), 0) / sentenceWords.length;
    const positionScore = index < 3 || index > sentences.length - 3 ? 1.2 : 1; // Boost first and last sentences
    return { sentence: sentence.trim(), score: score * positionScore, index };
  });
  
  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .sort((a, b) => a.index - b.index)
    .map(s => s.sentence);
  
  return topSentences.join(' ');
}

function isStopWord(word: string): boolean {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
    'my', 'your', 'his', 'her', 'its', 'our', 'their', 'from', 'up', 'about', 'into',
    'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among',
    'since', 'until', 'while', 'although', 'though', 'because', 'if', 'when', 'where',
    'how', 'what', 'which', 'who', 'whom', 'whose', 'why', 'can', 'may', 'might',
    'must', 'shall', 'very', 'too', 'so', 'just', 'now', 'then', 'here', 'there'
  ]);
  return stopWords.has(word.toLowerCase());
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    let text = "";
    let pageCount: number | undefined;

    // Process different file types
    if (file.name.endsWith(".pdf")) {
      try {
        const result = await new Promise<{ text: string; pageCount: number }>((resolve, reject) => {
          const pdfParser = new PDFParser();

          pdfParser.on("pdfParser_dataReady", (pdfData) => {
            const extractedText = pdfData.Pages.map((page, pageIndex) => {
              // Sort text items by Y position (top to bottom) then X position (left to right)
              const sortedTexts = page.Texts.sort((a, b) => {
                const yDiff = (b.y || 0) - (a.y || 0); // Note: PDF coordinates are inverted
                if (Math.abs(yDiff) > 0.5) return yDiff; // Different lines
                return (a.x || 0) - (b.x || 0); // Same line, sort left to right
              });

              let currentY = null;
              let pageText = "";
              
              sortedTexts.forEach((textItem, index) => {
                // Check if we're on a new line
                const isNewLine = currentY === null || Math.abs((textItem.y || 0) - currentY) > 0.5;
                
                if (isNewLine && pageText.length > 0) {
                  pageText += "\n";
                }
                
                currentY = textItem.y || 0;
                
                // Extract and clean text from all runs in this text item
                const textRuns = textItem.R.map((run) => {
                  let text = run.T || "";
                  try {
                    // Decode URI components
                    text = decodeURIComponent(text);
                  } catch (e) {
                    // If decoding fails, use original text
                  }
                  return text;
                }).join("");
                
                // Add appropriate spacing
                if (pageText.length > 0 && !isNewLine) {
                  // Check if we need a space (if previous doesn't end with space/punctuation)
                  const lastChar = pageText.slice(-1);
                  const firstChar = textRuns.charAt(0);
                  
                  if (lastChar.match(/[a-zA-Z0-9]/) && firstChar.match(/[a-zA-Z0-9]/)) {
                    pageText += " ";
                  }
                }
                
                pageText += textRuns;
              });
              
              return pageText;
            }).join("\n\n"); // Separate pages with double newline
            
            // Clean up the extracted text
            let cleanedText = extractedText
              // Remove excessive whitespace but preserve single spaces
              .replace(/[ \t]+/g, ' ')
              // Fix multiple newlines
              .replace(/\n{3,}/g, '\n\n')
              // Remove spaces before punctuation
              .replace(/\s+([.,;:!?])/g, '$1')
              // Ensure space after punctuation (except at end of line)
              .replace(/([.,;:!?])([a-zA-Z])/g, '$1 $2')
              // Fix common word boundary issues from PDF extraction
              .replace(/([a-z])([A-Z])/g, (match, p1, p2) => {
                // Only add space if it looks like separate words
                // Don't split obvious abbreviations or camelCase
                const context = extractedText.substring(
                  Math.max(0, extractedText.indexOf(match) - 10),
                  extractedText.indexOf(match) + match.length + 10
                );
                
                // Check if this looks like a word boundary
                if (p2.length === 1 && /[A-Z][a-z]/.test(context.substring(context.indexOf(match) + 1, context.indexOf(match) + 3))) {
                  return p1 + ' ' + p2;
                }
                return match;
              })
              // Remove leading/trailing spaces from lines
              .split('\n')
              .map(line => line.trim())
              .join('\n')
              .trim();
            
            // Additional check for character-separated text
            if (cleanedText.length > 0) {
              const words = cleanedText.split(/\s+/);
              const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
              
              // If average word length is very short, text might be character-separated
              if (avgWordLength < 2 && words.length > 10) {
                // Try to reconstruct words by looking for patterns
                cleanedText = reconstructWords(cleanedText);
              }
            }
            
            resolve({
              text: cleanedText || "No text content found in PDF",
              pageCount: pdfData.Pages.length
            });
          });

          pdfParser.on("pdfParser_dataError", (err) => reject(err));
          pdfParser.parseBuffer(buffer);
        });

        text = result.text;
        pageCount = result.pageCount;
      } catch (pdfError) {
        console.error("PDF parsing error:", pdfError);
        return NextResponse.json(
          { error: "Could not parse PDF file. Please try a different PDF." },
          { status: 400 }
        );
      }
    } else if (file.name.endsWith(".docx")) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
      } catch (docxError) {
        console.error("DOCX parsing error:", docxError);
        return NextResponse.json(
          { error: "Could not parse DOCX file." },
          { status: 400 }
        );
      }
    } else if (file.name.endsWith(".txt")) {
      text = buffer.toString("utf-8");
    } else if (file.name.endsWith(".pptx")) {
      try {
        text = await extractTextFromPPTX(buffer);
        if (!text) {
          return NextResponse.json(
            { error: "No text content found in PPTX file." },
            { status: 400 }
          );
        }
      } catch (pptxError) {
        console.error("PPTX parsing error:", pptxError);
        return NextResponse.json(
          { error: "Could not parse PPTX file." },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Unsupported file type." },
        { status: 400 }
      );
    }

    // Validate extracted text
    if (!text || text.trim().length < 10) {
      return NextResponse.json(
        { error: "No meaningful text content found in the document." },
        { status: 400 }
      );
    }

    try {
      // Perform enhanced analysis
      const analysis = analyzeText(text);
      
      // Add page count if available
      if (pageCount) {
        analysis.basicStats.pageCount = pageCount;
      }

      return NextResponse.json({ analysis });
    } catch (analysisError) {
      console.error("Document analysis error:", analysisError);
      return NextResponse.json(
        { error: "Failed to analyze document content" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Document processing error:", error);
    return NextResponse.json(
      { error: "Failed to process document" },
      { status: 500 }
    );
  }
}
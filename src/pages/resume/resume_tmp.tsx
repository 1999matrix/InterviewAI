import React, { useState, useCallback, useEffect } from 'react';
import { Upload, FileText, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import pdfToText from 'react-pdftotext';
import Lottie from 'react-lottie';
import animationData from '../../assets/scanning-animation.json';
import Button from './resume_ui_components/Button';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Type definitions
interface ATSAnalysis {
  overall_score?: number;
  score?: number;
  strengths?: string[];
  improvement_suggestions?: string[];
  detailed_analysis?: string;
}

interface ScoreBreakdownItem {
  section: string;
  max?: number;
  score?: number;
  total?: number;
  comment?: string;
}

interface APIResponse {
  analysis?: string;
}

interface LottieOptions {
  loop: boolean;
  autoplay: boolean;
  animationData: any;
  rendererSettings: {
    preserveAspectRatio: string;
  };
}

const ResumeUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysis | null>(null);
  const [atsBreakdown, setAtsBreakdown] = useState<string>('');
  const [showResults, setShowResults] = useState<boolean>(false);
  const [animationComplete, setAnimationComplete] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Animation options for Lottie
  const defaultOptions: LottieOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  const validateFile = (file: File | null): boolean => {
    if (!file) {
      throw new Error('Please select a file');
    }
    if (file.type !== 'application/pdf') {
      throw new Error('Only PDF files are allowed');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size should not exceed 5MB');
    }
    return true;
  };

  const handleFileChange = useCallback((selectedFile: File | null) => {
    try {
      setError(null);
      if (selectedFile) {
        validateFile(selectedFile);
        setFile(selectedFile);
        setAtsAnalysis(null);
        setAtsBreakdown('');
        setShowResults(false);
        const fileUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(fileUrl);
      } else {
        // Handle case when selectedFile is null (used for clearing the file)
        setFile(null);
        setPreviewUrl(null);
        setAtsAnalysis(null);
        setAtsBreakdown('');
        setShowResults(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      setFile(null);
      setPreviewUrl(null);
    }
  }, []);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files[0];
    handleFileChange(droppedFile);
  }, [handleFileChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    handleFileChange(selectedFile);
  };

  const handleUpload = async (): Promise<void> => {
    if (!file) return;

    setProgress(0);
    setError(null);
    setAtsAnalysis(null);
    setAtsBreakdown('');
    setShowResults(false);
    setAnimationComplete(false);
    setIsLoading(true);

    try {
      // Simulate progress bar
      let progressValue = 0;
      const progressInterval = setInterval(() => {
        progressValue += 5;
        setProgress(progressValue);
        if (progressValue >= 90) clearInterval(progressInterval);
      }, 150);

      // Extract text from PDF using react-pdftotext
      const text: string = await pdfToText(file);

      // Send parsed text as a JSON string in the cv_text field
      let atsAnalysisObj: ATSAnalysis | null = null;
      let breakdownText = '';
      try {
        const response = await fetch('http://192.168.1.65:7777/api/v1/analyze_cv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cv_text: text }),
        });
        const data: APIResponse = await response.json();
        if (data.analysis) {
          // Extract JSON from markdown code block
          const match = data.analysis.match(/```json\n([\s\S]*?)\n```/);
          if (match && match[1]) {
            atsAnalysisObj = JSON.parse(match[1]) as ATSAnalysis;
            // Extract breakdown (text after code block)
            breakdownText = data.analysis.split('```')[2]?.trim() || '';
          } else {
            try {
              atsAnalysisObj = JSON.parse(data.analysis) as ATSAnalysis;
            } catch (e) {
              // If not valid JSON, use as is
              atsAnalysisObj = {
                overall_score: 75,
                strengths: ["Identified skills match job requirements", "Clear work experience section"],
                improvement_suggestions: ["Add more quantifiable achievements", "Include relevant keywords"],
                detailed_analysis: data.analysis
              };
            }
          }
        }
      } catch (apiErr) {
        setError('Failed to analyze with ATS engine.');
      }
      
      if (atsAnalysisObj) {
        setAtsAnalysis(atsAnalysisObj);
        setAtsBreakdown(breakdownText);
      }

      clearInterval(progressInterval);
      setProgress(100);
      
      // Delay showing results for animation effect
      setTimeout(() => {
        setAnimationComplete(true);
        setTimeout(() => {
          setShowResults(true);
        }, 500);
      }, 1000);
    } catch (err) {
      setError('Failed to extract text from PDF.');
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup function for the preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Helper to parse the scoring breakdown from the breakdown text
  const parseScoreBreakdown = (breakdownText: string): ScoreBreakdownItem[] => {
    if (!breakdownText) return [];
    
    // Extract lines that look like: * **Section (Points)**: X out of Y. ...
    const lines = breakdownText.split('\n').filter(line => line.trim().startsWith('*'));
    return lines.map(line => {
      // Remove leading * and spaces
      let clean = line.replace(/^\*+\s*/, '');
      // Extract section, points, and comment
      const match = clean.match(/\*\*(.*?) \((\d+) points?\)\*\*: (\d+) out of (\d+)\.?(.+)/);
      if (match) {
        return {
          section: match[1],
          max: Number(match[2]),
          score: Number(match[3]),
          total: Number(match[4]),
          comment: match[5]?.trim() || '',
        };
      }
      // fallback: just return the line
      return { section: clean };
    });
  };

  // Get overall score from analysis
  const getOverallScore = (): number => {
    if (!atsAnalysis) return 0;
    return atsAnalysis.overall_score || atsAnalysis.score || 75; // Fallback value
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      <main className="flex-1 flex flex-col justify-center items-center py-12 px-4">
        <div className="w-full max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h1 className="text-4xl font-bold text-gray-800 mb-3">ATS Resume Analyzer</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload your resume to check its ATS compatibility score and get detailed feedback to improve your chances of getting past applicant tracking systems.
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {!showResults ? (
              <motion.div 
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="p-8">
                    <div 
                      className={`border-2 border-dashed rounded-xl p-10 transition-all
                        ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                        ${file ? 'border-green-500 bg-green-50 border-solid' : ''}`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      {file ? (
                        <div className="text-center">
                          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">Resume Uploaded</h3>
                          <p className="text-gray-600 mb-4">{file.name}</p>
                          <div className="flex justify-center space-x-3">
                            <Button 
                              onClick={() => handleFileChange(null)}
                              variant="secondary"
                              className="px-4 py-2 text-sm"
                              disabled={isLoading}
                            >
                              Change File
                            </Button>
                            <Button
                              onClick={handleUpload}
                              className="px-4 py-2 text-sm"
                              isLoading={isLoading}
                              loadingText="Analyzing..."
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Check ATS Score
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">Upload Your Resume</h3>
                          <p className="mb-6 text-gray-500">
                            Drag and drop your resume here, or
                            <label className="ml-1 text-blue-600 hover:text-blue-700 cursor-pointer">
                              browse
                              <input
                                type="file"
                                accept=".pdf"
                                onChange={handleInputChange}
                                className="hidden"
                              />
                            </label>
                          </p>
                          <p className="text-xs text-gray-400">
                            PDF only, max 5MB
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {error && (
                      <div className="mt-4 p-4 bg-red-50 rounded-lg flex items-center text-red-700">
                        <XCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    {isLoading && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-8 text-center"
                      >
                        <div className="w-64 h-64 mx-auto mb-6">
                          <Lottie options={defaultOptions} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                          Analyzing Your Resume
                        </h3>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <motion.div
                            className="bg-blue-600 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                          ></motion.div>
                        </div>
                        <p className="text-sm text-gray-600">
                          {progress < 30 ? "Extracting resume content..." : 
                           progress < 60 ? "Analyzing format and structure..." : 
                           progress < 90 ? "Evaluating ATS compatibility..." : 
                           "Finalizing results..."}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Resume Preview - 1/3 width */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">Resume Preview</h2>
                  </div>
                  <div className="p-6">
                    <div className="w-full h-[500px] relative">
                      <object
                        data={previewUrl || undefined}
                        type="application/pdf"
                        className="w-full h-full rounded-lg border border-gray-200"
                      >
                        <div className="text-center text-gray-500">
                          <p>Unable to display PDF. Please download to view:</p>
                          <a 
                            href={previewUrl || '#'} 
                            download={file?.name}
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            Download PDF
                          </a>
                        </div>
                      </object>
                    </div>
                    <div className="mt-4 flex justify-center">
                      <Button 
                        onClick={() => {
                          setShowResults(false);
                          setAtsAnalysis(null);
                        }}
                        variant="secondary"
                        className="px-4 py-2 text-sm"
                      >
                        Upload Different Resume
                      </Button>
                    </div>
                  </div>
                </div>

                {/* ATS Score and Analysis - 2/3 width */}
                <div className="lg:col-span-2">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6"
                  >
                    <div className="p-6 border-b border-gray-100">
                      <h2 className="text-xl font-bold text-gray-800">ATS Compatibility Score</h2>
                    </div>
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-6 md:mb-0">
                          <div className="relative">
                            <svg className="w-32 h-32" viewBox="0 0 36 36">
                              <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#E5E7EB"
                                strokeWidth="3"
                              />
                              <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke={getOverallScore() > 80 ? "#10B981" : getOverallScore() > 60 ? "#FBBF24" : "#EF4444"}
                                strokeWidth="3"
                                strokeDasharray={`${getOverallScore()}, 100`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-3xl font-bold">{getOverallScore()}%</span>
                            </div>
                          </div>
                          <div className="ml-6">
                            <h3 className="text-2xl font-bold text-gray-800">
                              {getOverallScore() > 80 ? "Excellent" : 
                               getOverallScore() > 60 ? "Good" : "Needs Improvement"}
                            </h3>
                            <p className="text-gray-600">ATS Compatibility Score</p>
                          </div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg max-w-md">
                          <h4 className="font-medium text-blue-800 mb-2">What does this mean?</h4>
                          <p className="text-sm text-blue-700">
                            {getOverallScore() > 80 ? 
                              "Your resume is well-optimized for ATS systems. It has a high chance of passing through automated filters." : 
                              getOverallScore() > 60 ? 
                              "Your resume is moderately optimized. With some improvements, you can increase your chances of passing ATS systems." : 
                              "Your resume needs significant improvements to pass through ATS systems effectively."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Strengths & Weaknesses */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
                  >
                    {/* Strengths */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                      <div className="p-4 bg-green-50 border-b border-green-100">
                        <h3 className="text-lg font-semibold text-green-800">Strengths</h3>
                      </div>
                      <div className="p-6">
                        {atsAnalysis?.strengths && atsAnalysis.strengths.length > 0 ? (
                          <ul className="space-y-3">
                            {atsAnalysis.strengths.map((strength, idx) => (
                              <li key={idx} className="flex items-start">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">{strength}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500 italic">No specific strengths identified.</p>
                        )}
                      </div>
                    </div>

                    {/* Improvement Areas */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                      <div className="p-4 bg-yellow-50 border-b border-yellow-100">
                        <h3 className="text-lg font-semibold text-yellow-800">Areas for Improvement</h3>
                      </div>
                      <div className="p-6">
                        {atsAnalysis?.improvement_suggestions && atsAnalysis.improvement_suggestions.length > 0 ? (
                          <ul className="space-y-3">
                            {atsAnalysis.improvement_suggestions.map((suggestion, idx) => (
                              <li key={idx} className="flex items-start">
                                <XCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500 italic">No specific improvement areas identified.</p>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Detailed Analysis */}
                  {(atsAnalysis?.detailed_analysis || atsBreakdown) && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden"
                    >
                      <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800">Detailed Analysis</h2>
                      </div>
                      <div className="p-6">
                        {/* Score breakdown table if available */}
                        {atsBreakdown && (
                          <div className="mb-6">
                            <h4 className="text-lg font-semibold text-gray-800 mb-3">Score Breakdown</h4>
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-sm border border-gray-200 rounded-lg">
                                <thead>
                                  <tr className="bg-gray-50">
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Section</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700">Score</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700">Max</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Comment</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {parseScoreBreakdown(atsBreakdown).map((row, idx) => (
                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                      <td className="px-4 py-3 font-medium text-gray-800">{row.section}</td>
                                      <td className="px-4 py-3 text-center">{row.score ?? '-'}</td>
                                      <td className="px-4 py-3 text-center">{row.max ?? '-'}</td>
                                      <td className="px-4 py-3 text-gray-600">{row.comment}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Detailed text analysis */}
                        {atsAnalysis?.detailed_analysis && (
                          <div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-3">Expert Feedback</h4>
                            <div className="bg-gray-50 p-4 rounded-lg text-gray-700 whitespace-pre-line">
                              {atsAnalysis.detailed_analysis}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default ResumeUploader;
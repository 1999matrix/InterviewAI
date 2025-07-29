// import React, { useState } from 'react';
// import { Upload, FileText, XCircle, CheckCircle, AlertTriangle, ArrowRight, Download } from 'lucide-react';
// import Button from '../../components/ui/Button';

// interface AnalysisResult {
//   score: number;
//   format: {
//     score: number;
//     issues: string[];
//   };
//   keywords: {
//     score: number;
//     found: string[];
//     missing: string[];
//   };
//   sections: {
//     score: number;
//     present: string[];
//     missing: string[];
//   };
//   readability: {
//     score: number;
//     issues: string[];
//   };
// }

// const ResumeAnalyzerPage: React.FC = () => {
//   const [file, setFile] = useState<File | null>(null);
//   const [fileName, setFileName] = useState('');
//   const [fileError, setFileError] = useState('');
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const selectedFile = e.target.files?.[0];
//     setFileError('');
    
//     if (selectedFile) {
//       if (selectedFile.type !== 'application/pdf') {
//         setFileError('Please upload a PDF file');
//         return;
//       }
      
//       if (selectedFile.size > 5 * 1024 * 1024) {
//         setFileError('File size should be less than 5MB');
//         return;
//       }
      
//       setFile(selectedFile);
//       setFileName(selectedFile.name);
//     }
//   };
  
//   const removeFile = () => {
//     setFile(null);
//     setFileName('');
//     setAnalysisResult(null);
//   };
  
//   const analyzeResume = async () => {
//     if (!file) return;
    
//     setIsAnalyzing(true);
    
//     // Simulate API call with timeout
//     await new Promise(resolve => setTimeout(resolve, 2000));
    
//     // Mock analysis result
//     const mockResult: AnalysisResult = {
//       score: 78,
//       format: {
//         score: 85,
//         issues: [
//           'Consider using a single-column layout for better ATS compatibility',
//           'Remove any images or graphics',
//         ],
//       },
//       keywords: {
//         score: 75,
//         found: ['React', 'JavaScript', 'TypeScript', 'Node.js', 'API'],
//         missing: ['Docker', 'AWS', 'CI/CD', 'Agile'],
//       },
//       sections: {
//         score: 90,
//         present: ['Contact Information', 'Work Experience', 'Education', 'Skills'],
//         missing: ['Professional Summary', 'Certifications'],
//       },
//       readability: {
//         score: 82,
//         issues: [
//           'Use more action verbs at the beginning of bullet points',
//           'Consider shorter paragraphs for better readability',
//         ],
//       },
//     };
    
//     setAnalysisResult(mockResult);
//     setIsAnalyzing(false);
//   };
  
//   const getScoreColor = (score: number) => {
//     if (score >= 90) return 'text-green-600';
//     if (score >= 75) return 'text-blue-600';
//     if (score >= 60) return 'text-yellow-600';
//     return 'text-red-600';
//   };
  
//   const getScoreBackground = (score: number) => {
//     if (score >= 90) return 'bg-green-100';
//     if (score >= 75) return 'bg-blue-100';
//     if (score >= 60) return 'bg-yellow-100';
//     return 'bg-red-100';
//   };
  
//   return (
//     <div className="max-w-4xl mx-auto px-4 py-8">
//       <div className="mb-8">
//         <h1 className="text-2xl font-bold text-gray-900">ATS Resume Analyzer</h1>
//         <p className="text-gray-600">Upload your resume to get detailed analysis and optimization suggestions.</p>
//       </div>
      
//       {!analysisResult ? (
//         <div className="bg-white rounded-xl shadow-sm p-8">
//           {!file ? (
//             <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
//               <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//               <h3 className="text-lg font-medium mb-2">Upload your resume</h3>
//               <p className="text-gray-500 text-sm mb-4">PDF format only, max 5MB</p>
              
//               <input
//                 type="file"
//                 id="resume"
//                 accept=".pdf"
//                 className="hidden"
//                 onChange={handleFileChange}
//               />
//               <label htmlFor="resume">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   className="mx-auto"
//                 >
//                   Browse Files
//                 </Button>
//               </label>
              
//               {fileError && (
//                 <p className="text-red-500 text-sm mt-3">{fileError}</p>
//               )}
//             </div>
//           ) : (
//             <div>
//               <div className="border border-gray-200 rounded-lg p-6 mb-6">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center">
//                     <div className="p-2 bg-blue-100 rounded-md">
//                       <FileText className="w-8 h-8 text-blue-600" />
//                     </div>
//                     <div className="ml-3">
//                       <p className="font-medium">{fileName}</p>
//                       <p className="text-sm text-gray-500">PDF Document</p>
//                     </div>
//                   </div>
                  
//                   <button
//                     type="button"
//                     onClick={removeFile}
//                     className="text-gray-500 hover:text-red-500"
//                   >
//                     <XCircle className="w-5 h-5" />
//                   </button>
//                 </div>
//               </div>
              
//               <Button
//                 onClick={analyzeResume}
//                 disabled={isAnalyzing}
//                 fullWidth
//                 className="py-3"
//               >
//                 {isAnalyzing ? (
//                   <>
//                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
//                     Analyzing Resume...
//                   </>
//                 ) : (
//                   <>
//                     Analyze Resume
//                     <ArrowRight className="w-4 h-4 ml-2" />
//                   </>
//                 )}
//               </Button>
//             </div>
//           )}
//         </div>
//       ) : (
//         <div className="space-y-6">
//           {/* Overall Score */}
//           <div className="bg-white rounded-xl shadow-sm p-8 text-center">
//             <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center ${getScoreBackground(analysisResult.score)}`}>
//               <div className={`text-4xl font-bold ${getScoreColor(analysisResult.score)}`}>
//                 {analysisResult.score}%
//               </div>
//             </div>
//             <h2 className="text-2xl font-semibold mt-4 mb-2">Resume Score</h2>
//             <p className="text-gray-600">
//               Your resume is {analysisResult.score >= 75 ? 'well-optimized' : 'needs improvement'} for ATS systems.
//             </p>
//           </div>
          
//           {/* Detailed Analysis */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Format Analysis */}
//             <div className="bg-white rounded-xl shadow-sm p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-semibold">Format</h3>
//                 <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBackground(analysisResult.format.score)} ${getScoreColor(analysisResult.format.score)}`}>
//                   {analysisResult.format.score}%
//                 </div>
//               </div>
//               <ul className="space-y-2">
//                 {analysisResult.format.issues.map((issue, index) => (
//                   <li key={index} className="flex items-start text-sm">
//                     <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
//                     <span>{issue}</span>
//                   </li>
//                 ))}
//               </ul>
//             </div>
            
//             {/* Keywords Analysis */}
//             <div className="bg-white rounded-xl shadow-sm p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-semibold">Keywords</h3>
//                 <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBackground(analysisResult.keywords.score)} ${getScoreColor(analysisResult.keywords.score)}`}>
//                   {analysisResult.keywords.score}%
//                 </div>
//               </div>
//               <div className="space-y-4">
//                 <div>
//                   <p className="text-sm font-medium text-gray-700 mb-2">Found Keywords:</p>
//                   <div className="flex flex-wrap gap-2">
//                     {analysisResult.keywords.found.map((keyword, index) => (
//                       <span
//                         key={index}
//                         className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm"
//                       >
//                         {keyword}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-gray-700 mb-2">Missing Keywords:</p>
//                   <div className="flex flex-wrap gap-2">
//                     {analysisResult.keywords.missing.map((keyword, index) => (
//                       <span
//                         key={index}
//                         className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
//                       >
//                         {keyword}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>
            
//             {/* Sections Analysis */}
//             <div className="bg-white rounded-xl shadow-sm p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-semibold">Sections</h3>
//                 <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBackground(analysisResult.sections.score)} ${getScoreColor(analysisResult.sections.score)}`}>
//                   {analysisResult.sections.score}%
//                 </div>
//               </div>
//               <div className="space-y-4">
//                 <div>
//                   <p className="text-sm font-medium text-gray-700 mb-2">Present Sections:</p>
//                   <ul className="space-y-1">
//                     {analysisResult.sections.present.map((section, index) => (
//                       <li key={index} className="flex items-center text-sm text-gray-600">
//                         <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
//                         {section}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-gray-700 mb-2">Missing Sections:</p>
//                   <ul className="space-y-1">
//                     {analysisResult.sections.missing.map((section, index) => (
//                       <li key={index} className="flex items-center text-sm text-gray-600">
//                         <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
//                         {section}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               </div>
//             </div>
            
//             {/* Readability Analysis */}
//             <div className="bg-white rounded-xl shadow-sm p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-semibold">Readability</h3>
//                 <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBackground(analysisResult.readability.score)} ${getScoreColor(analysisResult.readability.score)}`}>
//                   {analysisResult.readability.score}%
//                 </div>
//               </div>
//               <ul className="space-y-2">
//                 {analysisResult.readability.issues.map((issue, index) => (
//                   <li key={index} className="flex items-start text-sm">
//                     <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
//                     <span>{issue}</span>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>
          
//           {/* Actions */}
//           <div className="flex justify-between items-center bg-white rounded-xl shadow-sm p-6">
//             <div>
//               <h3 className="font-semibold mb-1">Want to improve your score?</h3>
//               <p className="text-gray-600 text-sm">Download our resume optimization guide for tips and templates.</p>
//             </div>
//             <Button variant="outline" className="flex items-center">
//               <Download className="w-4 h-4 mr-2" />
//               Download Guide
//             </Button>
//           </div>
          
//           {/* Try Again Button */}
//           <div className="text-center">
//             <Button
//               variant="outline"
//               onClick={removeFile}
//               className="mx-auto"
//             >
//               Analyze Another Resume
//             </Button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ResumeAnalyzerPage;


// // import React, { useState, useCallback, useEffect } from 'react';
// // import { CloudArrowUpIcon, DocumentTextIcon, ArrowPathIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
// // import { motion, AnimatePresence } from 'framer-motion';
// // import pdfToText from 'react-pdftotext';
// // import Navbar from '../component/feature/user/Navbar';
// // import Footer from '../component/feature/user/Footer';
// // import Lottie from 'react-lottie';
// // import animationData from '../assets/scanning-animation.json'; // You'll need to add this file
// // import { useGlobalLoading } from '../context/loadingContext';
// // import Button from '../component/common/Button';

// // const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// // const ResumeAnalyzerPage = () => {
// //   const [file, setFile] = useState(null);
// //   const [error, setError] = useState(null);
// //   const [progress, setProgress] = useState(0);
// //   const [previewUrl, setPreviewUrl] = useState(null);
// //   const [dragActive, setDragActive] = useState(false);
// //   const [atsAnalysis, setAtsAnalysis] = useState(null);
// //   const [atsBreakdown, setAtsBreakdown] = useState('');
// //   const [showResults, setShowResults] = useState(false);
// //   const [animationComplete, setAnimationComplete] = useState(false);
  
// //   // Using global loading context instead of local state
// //   const { isLoading, withGlobalLoading } = useGlobalLoading();

// //   // Animation options for Lottie
// //   const defaultOptions = {
// //     loop: true,
// //     autoplay: true,
// //     animationData: animationData,
// //     rendererSettings: {
// //       preserveAspectRatio: 'xMidYMid slice'
// //     }
// //   };

// //   const validateFile = (file) => {
// //     if (!file) {
// //       throw new Error('Please select a file');
// //     }
// //     if (file.type !== 'application/pdf') {
// //       throw new Error('Only PDF files are allowed');
// //     }
// //     if (file.size > MAX_FILE_SIZE) {
// //       throw new Error('File size should not exceed 5MB');
// //     }
// //     return true;
// //   };

// //   const handleFileChange = useCallback((selectedFile) => {
// //     try {
// //       setError(null);
// //       validateFile(selectedFile);
// //       setFile(selectedFile);
// //       setAtsAnalysis(null);
// //       setAtsBreakdown('');
// //       setShowResults(false);
// //       const fileUrl = URL.createObjectURL(selectedFile);
// //       setPreviewUrl(fileUrl);
// //     } catch (err) {
// //       setError(err.message);
// //       setFile(null);
// //       setPreviewUrl(null);
// //     }
// //   }, []);

// //   const handleDrag = useCallback((e) => {
// //     e.preventDefault();
// //     e.stopPropagation();
// //     if (e.type === 'dragenter' || e.type === 'dragover') {
// //       setDragActive(true);
// //     } else if (e.type === 'dragleave') {
// //       setDragActive(false);
// //     }
// //   }, []);

// //   const handleDrop = useCallback((e) => {
// //     e.preventDefault();
// //     e.stopPropagation();
// //     setDragActive(false);
    
// //     const droppedFile = e.dataTransfer.files[0];
// //     handleFileChange(droppedFile);
// //   }, [handleFileChange]);

// //   const handleInputChange = (e) => {
// //     const selectedFile = e.target.files[0];
// //     handleFileChange(selectedFile);
// //   };

// //   const handleUpload = async () => {
// //     if (!file) return;

// //     setProgress(0);
// //     setError(null);
// //     setAtsAnalysis(null);
// //     setAtsBreakdown('');
// //     setShowResults(false);
// //     setAnimationComplete(false);

// //     // Using the global loading context for loading state
// //     await withGlobalLoading(async () => {
// //       try {
// //         // Simulate progress bar
// //         let progressValue = 0;
// //         const progressInterval = setInterval(() => {
// //           progressValue += 5;
// //           setProgress(progressValue);
// //           if (progressValue >= 90) clearInterval(progressInterval);
// //         }, 150);

// //         // Extract text from PDF using react-pdftotext
// //         const text = await pdfToText(file);

// //         // Send parsed text as a JSON string in the cv_text field   
// //         let atsAnalysisObj = null;
// //         let breakdownText = '';
// //         try {
// //           const response = await fetch('http://192.168.1.65:7777/api/v1/analyze_cv', {
// //             method: 'POST',
// //             headers: { 'Content-Type': 'application/json' },
// //             body: JSON.stringify({ cv_text: text }),
// //           });
// //           const data = await response.json();
// //           if (data.analysis) {
// //             // Extract JSON from markdown code block
// //             const match = data.analysis.match(/```json\n([\s\S]*?)\n```/);
// //             if (match && match[1]) {
// //               atsAnalysisObj = JSON.parse(match[1]);
// //               // Extract breakdown (text after code block)
// //               breakdownText = data.analysis.split('```')[2]?.trim() || '';
// //             } else {
// //               try {
// //                 atsAnalysisObj = JSON.parse(data.analysis);
// //               } catch (e) {
// //                 // If not valid JSON, use as is
// //                 atsAnalysisObj = {
// //                   overall_score: 75,
// //                   strengths: ["Identified skills match job requirements", "Clear work experience section"],
// //                   improvement_suggestions: ["Add more quantifiable achievements", "Include relevant keywords"],
// //                   detailed_analysis: data.analysis
// //                 };
// //               }
// //             }
// //           }
// //         } catch (apiErr) {
// //           setError('Failed to analyze with ATS engine.');
// //         }
        
// //         if (atsAnalysisObj) {
// //           setAtsAnalysis(atsAnalysisObj);
// //           setAtsBreakdown(breakdownText);
// //         }

// //         clearInterval(progressInterval);
// //         setProgress(100);
        
// //         // Delay showing results for animation effect
// //         setTimeout(() => {
// //           setAnimationComplete(true);
// //           setTimeout(() => {
// //             setShowResults(true);
// //           }, 500);
// //         }, 1000);
// //       } catch (err) {
// //         setError('Failed to extract text from PDF.');
// //       }
// //     }, { text: "Analyzing your resume..." });
// //   };

// //   // Cleanup function for the preview URL
// //   useEffect(() => {
// //     return () => {
// //       if (previewUrl) {
// //         URL.revokeObjectURL(previewUrl);
// //       }
// //     };
// //   }, [previewUrl]);

// //   // Helper to parse the scoring breakdown from the breakdown text
// //   const parseScoreBreakdown = (breakdownText) => {
// //     if (!breakdownText) return [];
    
// //     // Extract lines that look like: * **Section (Points)**: X out of Y. ...
// //     const lines = breakdownText.split('\n').filter(line => line.trim().startsWith('*'));
// //     return lines.map(line => {
// //       // Remove leading * and spaces
// //       let clean = line.replace(/^\*+\s*/, '');
// //       // Extract section, points, and comment
// //       const match = clean.match(/\*\*(.*?) \((\d+) points?\)\*\*: (\d+) out of (\d+)\.?(.+)/);
// //       if (match) {
// //         return {
// //           section: match[1],
// //           max: Number(match[2]),
// //           score: Number(match[3]),
// //           total: Number(match[4]),
// //           comment: match[5]?.trim() || '',
// //         };
// //       }
// //       // fallback: just return the line
// //       return { section: clean };
// //     });
// //   };

// //   // Get overall score from analysis
// //   const getOverallScore = () => {
// //     if (!atsAnalysis) return null;
// //     return atsAnalysis.overall_score || atsAnalysis.score || 75; // Fallback value
// //   };

// //   return (
// //     <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
// //       <Navbar />
// //       <main className="flex-1 flex flex-col justify-center items-center py-12 px-4">
// //         <div className="w-full max-w-7xl mx-auto">
// //           <motion.div 
// //             initial={{ opacity: 0, y: 20 }}
// //             animate={{ opacity: 1, y: 0 }}
// //             transition={{ duration: 0.5 }}
// //             className="text-center mb-10"
// //           >
// //             <h1 className="text-4xl font-bold text-gray-800 mb-3">ATS Resume Analyzer</h1>
// //             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
// //               Upload your resume to check its ATS compatibility score and get detailed feedback to improve your chances of getting past applicant tracking systems.
// //             </p>
// //           </motion.div>

// //           <AnimatePresence mode="wait">
// //             {!showResults ? (
// //               <motion.div 
// //                 key="upload"
// //                 initial={{ opacity: 0 }}
// //                 animate={{ opacity: 1 }}
// //                 exit={{ opacity: 0 }}
// //                 className="max-w-2xl mx-auto"
// //               >
// //                 <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
// //                   <div className="p-8">
// //                     <div 
// //                       className={`border-2 border-dashed rounded-xl p-10 transition-all
// //                         ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
// //                         ${file ? 'border-green-500 bg-green-50 border-solid' : ''}`}
// //                       onDragEnter={handleDrag}
// //                       onDragLeave={handleDrag}
// //                       onDragOver={handleDrag}
// //                       onDrop={handleDrop}
// //                     >
// //                       {file ? (
// //                         <div className="text-center">
// //                           <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
// //                           <h3 className="text-xl font-semibold text-gray-800 mb-2">Resume Uploaded</h3>
// //                           <p className="text-gray-600 mb-4">{file.name}</p>
// //                           <div className="flex justify-center space-x-3">
// //                             <Button 
// //                               onClick={() => handleFileChange(null)}
// //                               variant="secondary"
// //                               className="px-4 py-2 text-sm"
// //                               disabled={isLoading}
// //                             >
// //                               Change File
// //                             </Button>
// //                             <Button
// //                               onClick={handleUpload}
// //                               className="px-4 py-2 text-sm"
// //                               isLoading={isLoading}
// //                               loadingText="Analyzing..."
// //                             >
// //                               <CloudArrowUpIcon className="w-4 h-4 mr-2" />
// //                               Check ATS Score
// //                             </Button>
// //                           </div>
// //                         </div>
// //                       ) : (
// //                         <div className="text-center">
// //                           <DocumentTextIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
// //                           <h3 className="text-xl font-semibold text-gray-800 mb-2">Upload Your Resume</h3>
// //                           <p className="mb-6 text-gray-500">
// //                             Drag and drop your resume here, or
// //                             <label className="ml-1 text-blue-600 hover:text-blue-700 cursor-pointer">
// //                               browse
// //                               <input
// //                                 type="file"
// //                                 accept=".pdf"
// //                                 onChange={handleInputChange}
// //                                 className="hidden"
// //                               />
// //                             </label>
// //                           </p>
// //                           <p className="text-xs text-gray-400">
// //                             PDF only, max 5MB
// //                           </p>
// //                         </div>
// //                       )}
// //                     </div>
                    
// //                     {error && (
// //                       <div className="mt-4 p-4 bg-red-50 rounded-lg flex items-center text-red-700">
// //                         <XCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
// //                         <span>{error}</span>
// //                       </div>
// //                     )}

// //                     {isLoading && (
// //                       <motion.div 
// //                         initial={{ opacity: 0 }}
// //                         animate={{ opacity: 1 }}
// //                         className="mt-8 text-center"
// //                       >
// //                         <div className="w-64 h-64 mx-auto mb-6">
// //                           <Lottie options={defaultOptions} />
// //                         </div>
// //                         <h3 className="text-xl font-semibold text-gray-800 mb-4">
// //                           Analyzing Your Resume
// //                         </h3>
// //                         <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
// //                           <motion.div
// //                             className="bg-blue-600 h-2 rounded-full"
// //                             initial={{ width: 0 }}
// //                             animate={{ width: `${progress}%` }}
// //                             transition={{ duration: 0.3 }}
// //                           ></motion.div>
// //                         </div>
// //                         <p className="text-sm text-gray-600">
// //                           {progress < 30 ? "Extracting resume content..." : 
// //                            progress < 60 ? "Analyzing format and structure..." : 
// //                            progress < 90 ? "Evaluating ATS compatibility..." : 
// //                            "Finalizing results..."}
// //                         </p>
// //                       </motion.div>
// //                     )}
// //                   </div>
// //                 </div>
// //               </motion.div>
// //             ) : (
// //               <motion.div 
// //                 key="results"
// //                 initial={{ opacity: 0 }}
// //                 animate={{ opacity: 1 }}
// //                 className="grid grid-cols-1 lg:grid-cols-3 gap-8"
// //               >
// //                 {/* Resume Preview - 1/3 width */}
// //                 <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
// //                   <div className="p-6 border-b border-gray-100">
// //                     <h2 className="text-xl font-bold text-gray-800">Resume Preview</h2>
// //                   </div>
// //                   <div className="p-6">
// //                     <div className="w-full h-[500px] relative">
// //                       <object
// //                         data={previewUrl}
// //                         type="application/pdf"
// //                         className="w-full h-full rounded-lg border border-gray-200"
// //                       >
// //                         <div className="text-center text-gray-500">
// //                           <p>Unable to display PDF. Please download to view:</p>
// //                           <a 
// //                             href={previewUrl} 
// //                             download={file.name}
// //                             className="text-blue-600 hover:text-blue-800 underline"
// //                           >
// //                             Download PDF
// //                           </a>
// //                         </div>
// //                       </object>
// //                     </div>
// //                     <div className="mt-4 flex justify-center">
// //                       <Button 
// //                         onClick={() => {
// //                           setShowResults(false);
// //                           setAtsAnalysis(null);
// //                         }}
// //                         variant="secondary"
// //                         className="px-4 py-2 text-sm"
// //                       >
// //                         Upload Different Resume
// //                       </Button>
// //                     </div>
// //                   </div>
// //                 </div>

// //                 {/* ATS Score and Analysis - 2/3 width */}
// //                 <div className="lg:col-span-2">
// //                   <motion.div 
// //                     initial={{ opacity: 0, y: 20 }}
// //                     animate={{ opacity: 1, y: 0 }}
// //                     transition={{ delay: 0.2 }}
// //                     className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6"
// //                   >
// //                     <div className="p-6 border-b border-gray-100">
// //                       <h2 className="text-xl font-bold text-gray-800">ATS Compatibility Score</h2>
// //                     </div>
// //                     <div className="p-6">
// //                       <div className="flex flex-col md:flex-row items-center justify-between">
// //                         <div className="flex items-center mb-6 md:mb-0">
// //                           <div className="relative">
// //                             <svg className="w-32 h-32" viewBox="0 0 36 36">
// //                               <path
// //                                 d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
// //                                 fill="none"
// //                                 stroke="#E5E7EB"
// //                                 strokeWidth="3"
// //                               />
// //                               <path
// //                                 d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
// //                                 fill="none"
// //                                 stroke={getOverallScore() > 80 ? "#10B981" : getOverallScore() > 60 ? "#FBBF24" : "#EF4444"}
// //                                 strokeWidth="3"
// //                                 strokeDasharray={`${getOverallScore()}, 100`}
// //                                 strokeLinecap="round"
// //                               />
// //                             </svg>
// //                             <div className="absolute inset-0 flex items-center justify-center">
// //                               <span className="text-3xl font-bold">{getOverallScore()}%</span>
// //                             </div>
// //                           </div>
// //                           <div className="ml-6">
// //                             <h3 className="text-2xl font-bold text-gray-800">
// //                               {getOverallScore() > 80 ? "Excellent" : 
// //                                getOverallScore() > 60 ? "Good" : "Needs Improvement"}
// //                             </h3>
// //                             <p className="text-gray-600">ATS Compatibility Score</p>
// //                           </div>
// //                         </div>
// //                         <div className="bg-blue-50 p-4 rounded-lg max-w-md">
// //                           <h4 className="font-medium text-blue-800 mb-2">What does this mean?</h4>
// //                           <p className="text-sm text-blue-700">
// //                             {getOverallScore() > 80 ? 
// //                               "Your resume is well-optimized for ATS systems. It has a high chance of passing through automated filters." : 
// //                               getOverallScore() > 60 ? 
// //                               "Your resume is moderately optimized. With some improvements, you can increase your chances of passing ATS systems." : 
// //                               "Your resume needs significant improvements to pass through ATS systems effectively."}
// //                           </p>
// //                         </div>
// //                       </div>
// //                     </div>
// //                   </motion.div>

// //                   {/* Strengths & Weaknesses */}
// //                   <motion.div 
// //                     initial={{ opacity: 0, y: 20 }}
// //                     animate={{ opacity: 1, y: 0 }}
// //                     transition={{ delay: 0.3 }}
// //                     className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
// //                   >
// //                     {/* Strengths */}
// //                     <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
// //                       <div className="p-4 bg-green-50 border-b border-green-100">
// //                         <h3 className="text-lg font-semibold text-green-800">Strengths</h3>
// //                       </div>
// //                       <div className="p-6">
// //                         {atsAnalysis?.strengths && atsAnalysis.strengths.length > 0 ? (
// //                           <ul className="space-y-3">
// //                             {atsAnalysis.strengths.map((strength, idx) => (
// //                               <li key={idx} className="flex items-start">
// //                                 <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
// //                                 <span className="text-gray-700">{strength}</span>
// //                               </li>
// //                             ))}
// //                           </ul>
// //                         ) : (
// //                           <p className="text-gray-500 italic">No specific strengths identified.</p>
// //                         )}
// //                       </div>
// //                     </div>

// //                     {/* Improvement Areas */}
// //                     <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
// //                       <div className="p-4 bg-yellow-50 border-b border-yellow-100">
// //                         <h3 className="text-lg font-semibold text-yellow-800">Areas for Improvement</h3>
// //                       </div>
// //                       <div className="p-6">
// //                         {atsAnalysis?.improvement_suggestions && atsAnalysis.improvement_suggestions.length > 0 ? (
// //                           <ul className="space-y-3">
// //                             {atsAnalysis.improvement_suggestions.map((suggestion, idx) => (
// //                               <li key={idx} className="flex items-start">
// //                                 <XCircleIcon className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
// //                                 <span className="text-gray-700">{suggestion}</span>
// //                               </li>
// //                             ))}
// //                           </ul>
// //                         ) : (
// //                           <p className="text-gray-500 italic">No specific improvement areas identified.</p>
// //                         )}
// //                       </div>
// //                     </div>
// //                   </motion.div>

// //                   {/* Detailed Analysis */}
// //                   {(atsAnalysis?.detailed_analysis || atsBreakdown) && (
// //                     <motion.div 
// //                       initial={{ opacity: 0, y: 20 }}
// //                       animate={{ opacity: 1, y: 0 }}
// //                       transition={{ delay: 0.4 }}
// //                       className="bg-white rounded-2xl shadow-lg overflow-hidden"
// //                     >
// //                       <div className="p-6 border-b border-gray-100">
// //                         <h2 className="text-xl font-bold text-gray-800">Detailed Analysis</h2>
// //                       </div>
// //                       <div className="p-6">
// //                         {/* Score breakdown table if available */}
// //                         {atsBreakdown && (
// //                           <div className="mb-6">
// //                             <h4 className="text-lg font-semibold text-gray-800 mb-3">Score Breakdown</h4>
// //                             <div className="overflow-x-auto">
// //                               <table className="min-w-full text-sm border border-gray-200 rounded-lg">
// //                                 <thead>
// //                                   <tr className="bg-gray-50">
// //                                     <th className="px-4 py-3 text-left font-semibold text-gray-700">Section</th>
// //                                     <th className="px-4 py-3 text-center font-semibold text-gray-700">Score</th>
// //                                     <th className="px-4 py-3 text-center font-semibold text-gray-700">Max</th>
// //                                     <th className="px-4 py-3 text-left font-semibold text-gray-700">Comment</th>
// //                                   </tr>
// //                                 </thead>
// //                                 <tbody>
// //                                   {parseScoreBreakdown(atsBreakdown).map((row, idx) => (
// //                                     <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
// //                                       <td className="px-4 py-3 font-medium text-gray-800">{row.section}</td>
// //                                       <td className="px-4 py-3 text-center">{row.score ?? '-'}</td>
// //                                       <td className="px-4 py-3 text-center">{row.max ?? '-'}</td>
// //                                       <td className="px-4 py-3 text-gray-600">{row.comment}</td>
// //                                     </tr>
// //                                   ))}
// //                                 </tbody>
// //                               </table>
// //                             </div>
// //                           </div>
// //                         )}

// //                         {/* Detailed text analysis */}
// //                         {atsAnalysis?.detailed_analysis && (
// //                           <div>
// //                             <h4 className="text-lg font-semibold text-gray-800 mb-3">Expert Feedback</h4>
// //                             <div className="bg-gray-50 p-4 rounded-lg text-gray-700 whitespace-pre-line">
// //                               {atsAnalysis.detailed_analysis}
// //                             </div>
// //                           </div>
// //                         )}
// //                       </div>
// //                     </motion.div>
// //                   )}
// //                 </div>
// //               </motion.div>
// //             )}
// //           </AnimatePresence>
// //         </div>
// //       </main>
// //       <Footer />
// //     </div>
// //   );
// // };

// // export default ResumeAnalyzerPage;


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

const ResumeAnalyzerPage: React.FC = () => {
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
        const response = await fetch(`${import.meta.env.VITE_APP_API_BASE}/analyze_cv`, {
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

export default ResumeAnalyzerPage;
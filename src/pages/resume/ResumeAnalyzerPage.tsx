import React, { useState } from 'react';
import { Upload, FileText, XCircle, CheckCircle, AlertTriangle, ArrowRight, Download } from 'lucide-react';
import Button from '../../components/ui/Button';

interface AnalysisResult {
  score: number;
  format: {
    score: number;
    issues: string[];
  };
  keywords: {
    score: number;
    found: string[];
    missing: string[];
  };
  sections: {
    score: number;
    present: string[];
    missing: string[];
  };
  readability: {
    score: number;
    issues: string[];
  };
}

const ResumeAnalyzerPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileError, setFileError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFileError('');
    
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setFileError('Please upload a PDF file');
        return;
      }
      
      if (selectedFile.size > 5 * 1024 * 1024) {
        setFileError('File size should be less than 5MB');
        return;
      }
      
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };
  
  const removeFile = () => {
    setFile(null);
    setFileName('');
    setAnalysisResult(null);
  };
  
  const analyzeResume = async () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    
    // Simulate API call with timeout
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock analysis result
    const mockResult: AnalysisResult = {
      score: 78,
      format: {
        score: 85,
        issues: [
          'Consider using a single-column layout for better ATS compatibility',
          'Remove any images or graphics',
        ],
      },
      keywords: {
        score: 75,
        found: ['React', 'JavaScript', 'TypeScript', 'Node.js', 'API'],
        missing: ['Docker', 'AWS', 'CI/CD', 'Agile'],
      },
      sections: {
        score: 90,
        present: ['Contact Information', 'Work Experience', 'Education', 'Skills'],
        missing: ['Professional Summary', 'Certifications'],
      },
      readability: {
        score: 82,
        issues: [
          'Use more action verbs at the beginning of bullet points',
          'Consider shorter paragraphs for better readability',
        ],
      },
    };
    
    setAnalysisResult(mockResult);
    setIsAnalyzing(false);
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getScoreBackground = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 75) return 'bg-blue-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ATS Resume Analyzer</h1>
        <p className="text-gray-600">Upload your resume to get detailed analysis and optimization suggestions.</p>
      </div>
      
      {!analysisResult ? (
        <div className="bg-white rounded-xl shadow-sm p-8">
          {!file ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Upload your resume</h3>
              <p className="text-gray-500 text-sm mb-4">PDF format only, max 5MB</p>
              
              <input
                type="file"
                id="resume"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <label htmlFor="resume">
                <Button
                  type="button"
                  variant="outline"
                  className="mx-auto"
                >
                  Browse Files
                </Button>
              </label>
              
              {fileError && (
                <p className="text-red-500 text-sm mt-3">{fileError}</p>
              )}
            </div>
          ) : (
            <div>
              <div className="border border-gray-200 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-md">
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">{fileName}</p>
                      <p className="text-sm text-gray-500">PDF Document</p>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={removeFile}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <Button
                onClick={analyzeResume}
                disabled={isAnalyzing}
                fullWidth
                className="py-3"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Analyzing Resume...
                  </>
                ) : (
                  <>
                    Analyze Resume
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center ${getScoreBackground(analysisResult.score)}`}>
              <div className={`text-4xl font-bold ${getScoreColor(analysisResult.score)}`}>
                {analysisResult.score}%
              </div>
            </div>
            <h2 className="text-2xl font-semibold mt-4 mb-2">Resume Score</h2>
            <p className="text-gray-600">
              Your resume is {analysisResult.score >= 75 ? 'well-optimized' : 'needs improvement'} for ATS systems.
            </p>
          </div>
          
          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Format Analysis */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Format</h3>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBackground(analysisResult.format.score)} ${getScoreColor(analysisResult.format.score)}`}>
                  {analysisResult.format.score}%
                </div>
              </div>
              <ul className="space-y-2">
                {analysisResult.format.issues.map((issue, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Keywords Analysis */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Keywords</h3>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBackground(analysisResult.keywords.score)} ${getScoreColor(analysisResult.keywords.score)}`}>
                  {analysisResult.keywords.score}%
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Found Keywords:</p>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.keywords.found.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Missing Keywords:</p>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.keywords.missing.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sections Analysis */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Sections</h3>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBackground(analysisResult.sections.score)} ${getScoreColor(analysisResult.sections.score)}`}>
                  {analysisResult.sections.score}%
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Present Sections:</p>
                  <ul className="space-y-1">
                    {analysisResult.sections.present.map((section, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        {section}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Missing Sections:</p>
                  <ul className="space-y-1">
                    {analysisResult.sections.missing.map((section, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
                        {section}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Readability Analysis */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Readability</h3>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBackground(analysisResult.readability.score)} ${getScoreColor(analysisResult.readability.score)}`}>
                  {analysisResult.readability.score}%
                </div>
              </div>
              <ul className="space-y-2">
                {analysisResult.readability.issues.map((issue, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex justify-between items-center bg-white rounded-xl shadow-sm p-6">
            <div>
              <h3 className="font-semibold mb-1">Want to improve your score?</h3>
              <p className="text-gray-600 text-sm">Download our resume optimization guide for tips and templates.</p>
            </div>
            <Button variant="outline" className="flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Download Guide
            </Button>
          </div>
          
          {/* Try Again Button */}
          <div className="text-center">
            <Button
              variant="outline"
              onClick={removeFile}
              className="mx-auto"
            >
              Analyze Another Resume
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzerPage;
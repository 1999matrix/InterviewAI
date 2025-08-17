import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Code, 
  BarChart3,
  ArrowLeft,
  Download,
  Share2
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { FinalResults } from '../../services/testService';

const CodingTestResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState<FinalResults | null>(null);

  useEffect(() => {
    const resultData = location.state?.results;
    if (resultData) {
      setResults(resultData);
    } else {
      // Redirect back if no results found
      navigate('/interview/create-session');
    }
  }, [location.state, navigate]);

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPerformanceText = (percentage: number) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 80) return 'Good';
    if (percentage >= 60) return 'Average';
    if (percentage >= 40) return 'Below Average';
    return 'Needs Improvement';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Coding Test Results</h1>
                <p className="text-gray-600">
                  Test completed on {new Date(results.endTime).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" className="flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
              <Button variant="outline" className="flex items-center">
                <Share2 className="w-4 h-4 mr-2" />
                Share Results
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Overall Score Card */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8 border">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getPerformanceColor(results.percentage)} mb-4`}>
              <Trophy className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {results.percentage.toFixed(1)}%
            </h2>
            <p className="text-xl text-gray-600 mb-4">
              Overall Score - {getPerformanceText(results.percentage)}
            </p>
            <div className="flex justify-center items-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Time: {results.timeTaken} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                <span>Questions: {results.attemptedQuestions}/{results.totalQuestions}</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>Score: {results.totalMarks} marks</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Breakdown */}
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Breakdown</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-green-900">Fully Correct</p>
                    <p className="text-sm text-green-700">All test cases passed</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {results.fullyCorrect}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-yellow-900">Partially Correct</p>
                    <p className="text-sm text-yellow-700">Some test cases passed</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-yellow-600">
                  {results.partiallyCorrect}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-red-900">Incorrect</p>
                    <p className="text-sm text-red-700">No test cases passed</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-red-600">
                  {results.incorrect}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Unattempted</p>
                    <p className="text-sm text-gray-700">Questions not attempted</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-gray-600">
                  {results.unattempted}
                </span>
              </div>
            </div>
          </div>

          {/* Language-wise Results */}
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Language-wise Performance</h3>
            
            {Object.keys(results.languageWiseResults).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(results.languageWiseResults).map(([language, data]: [string, any]) => (
                  <div key={language} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-blue-900 capitalize">{language}</h4>
                      <span className="text-sm text-blue-700">
                        {data.questionsAttempted} question{data.questionsAttempted !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Total Marks</p>
                        <p className="font-semibold text-blue-900">{data.totalMarks}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Avg. Test Cases</p>
                        <p className="font-semibold text-blue-900">
                          {data.averageTestCasesPassed.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No language-specific data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Test Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6 border mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Test Summary</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {results.totalQuestions}
              </div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {results.attemptedQuestions}
              </div>
              <div className="text-sm text-gray-600">Attempted</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {results.totalMarks}
              </div>
              <div className="text-sm text-gray-600">Total Marks</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {results.timeTaken}m
              </div>
              <div className="text-sm text-gray-600">Time Taken</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 mt-8">
          <Button 
            onClick={() => navigate('/interview/create-session')}
            className="px-8"
          >
            Take Another Test
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="px-8"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CodingTestResultsPage;

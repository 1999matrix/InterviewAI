import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  Calculator, 
  Edit3, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Circle, 
  Square, 
  CheckSquare,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Save,
  FileText,
  Home,
  Lock,
  Maximize
} from 'lucide-react';
import Button from '../../components/ui/Button';
import testService, { AptitudeQuestion } from '../../services/testService';
import { useErrorHandler, ErrorToast } from '../../utils/errorHandler';

// Question state interface
interface QuestionState {
  status: 'not-visited' | 'answered' | 'not-answered' | 'marked-for-review' | 'answered-and-marked';
  answer: string | string[] | number | null;
  timeSpent: number;
}

const AptitudeTestPage: React.FC = () => {
  const navigate = useNavigate();
  const { error, handleError, clearError } = useErrorHandler();
  
  // Core state
  const [questions, setQuestions] = useState<AptitudeQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState<Record<number, QuestionState>>({});
  const [sessionToken, setSessionToken] = useState<string>('');
  
  // Test state
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(60 * 60); // 60 minutes in seconds
  const [testStartTime, setTestStartTime] = useState<number | null>(null);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  
  // UI state
  const [showCalculator, setShowCalculator] = useState(false);
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [scratchpadContent, setScratchpadContent] = useState('');
  const [calculatorDisplay, setCalculatorDisplay] = useState('0');
  const [showQuestionPalette, setShowQuestionPalette] = useState(true);
  const [showSubmissionDialog, setShowSubmissionDialog] = useState(false);
  
  // Loading states
  const [isStartingTest, setIsStartingTest] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [isEndingTest, setIsEndingTest] = useState(false);
  
  // Security monitoring
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [suspiciousActivity, setSuspiciousActivity] = useState<string[]>([]);
  
  // Refs
  const questionStartTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<number | null>(null);
  
  // Initialize question states when questions are loaded
  useEffect(() => {
    if (questions.length > 0) {
    const initialStates: Record<number, QuestionState> = {};
    questions.forEach((q) => {
      initialStates[q.id] = {
        status: 'not-visited',
        answer: null,
        timeSpent: 0
      };
    });
    setQuestionStates(initialStates);
    }
  }, [questions]);
  
  // Timer management
  useEffect(() => {
    if (testStarted && !testCompleted && timeRemaining > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          if (prev === 300) { // 5 minutes warning
            setShowTimeWarning(true);
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [testStarted, testCompleted, timeRemaining]);
  
  // Fullscreen and tab switch monitoring
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && testStarted && !testCompleted) {
        setTabSwitchCount(prev => prev + 1);
        setSuspiciousActivity(prev => [...prev, `Tab switched at ${new Date().toLocaleTimeString()}`]);
      }
    };
    
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

      document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [testStarted, testCompleted]);

  // Start test function
  const startTest = async () => {
    try {
      setIsStartingTest(true);
      clearError();

      const response = await testService.startAptitudeTest({
        userId: 1, // Replace with actual user ID from auth context
        subjects: ['Mathematics', 'Logical Reasoning', 'English'], // Can be made configurable
        difficulty: 'Medium',
        duration: 60,
        questionCount: 20
      });

      if (response.success) {
        setQuestions(response.data.questions);
        setSessionToken(response.data.sessionToken);
        setTimeRemaining(response.data.duration * 60);
        setTestStartTime(Date.now());
        setTestStarted(true);
        setShowInstructions(false);
        questionStartTimeRef.current = Date.now();
      }
    } catch (error) {
      handleError(error, 'Starting aptitude test');
    } finally {
      setIsStartingTest(false);
    }
  };

  // Get current question
  const getCurrentQuestion = () => questions[currentQuestionIndex];
  const getCurrentQuestionState = () => questionStates[getCurrentQuestion()?.id] || {
      status: 'not-visited',
      answer: null,
      timeSpent: 0
  };

  // Answer handling
  const handleAnswerChange = async (answer: string | string[] | number) => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    try {
      setIsSubmittingAnswer(true);
      
      // Calculate time spent on this question
      const timeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
      
      // Submit answer to backend
      await testService.submitAptitudeAnswer({
        sessionToken,
        questionId: currentQuestion.id,
        answer,
        timeSpent,
        isReviewed: false
      });

      // Update local state
      setQuestionStates(prev => ({
        ...prev,
        [currentQuestion.id]: {
          ...prev[currentQuestion.id],
          answer,
          status: 'answered',
          timeSpent: prev[currentQuestion.id]?.timeSpent + timeSpent || timeSpent
        }
      }));

    } catch (error) {
      handleError(error, 'Submitting answer');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  // Mark for review
  const markForReview = async () => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    try {
    const currentState = getCurrentQuestionState();
      const newStatus = currentState.status === 'marked-for-review' ? 'not-answered' : 
                       currentState.status === 'answered-and-marked' ? 'answered' :
                       currentState.answer ? 'answered-and-marked' : 'marked-for-review';

      await testService.markAptitudeQuestionForReview(
        sessionToken, 
        currentQuestion.id, 
        newStatus.includes('marked')
      );

      setQuestionStates(prev => ({
        ...prev,
        [currentQuestion.id]: {
          ...prev[currentQuestion.id],
      status: newStatus
        }
      }));
    } catch (error) {
      handleError(error, 'Marking question for review');
    }
  };

  // Navigation functions
  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      // Update time spent on current question
    const currentQuestion = getCurrentQuestion();
      if (currentQuestion) {
        const timeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
        setQuestionStates(prev => ({
          ...prev,
          [currentQuestion.id]: {
            ...prev[currentQuestion.id],
            timeSpent: prev[currentQuestion.id]?.timeSpent + timeSpent || timeSpent
          }
        }));
      }

      setCurrentQuestionIndex(index);
      questionStartTimeRef.current = Date.now();
      
      // Mark as visited if not already
      const newQuestion = questions[index];
      if (newQuestion && questionStates[newQuestion.id]?.status === 'not-visited') {
        setQuestionStates(prev => ({
          ...prev,
          [newQuestion.id]: {
            ...prev[newQuestion.id],
            status: 'not-answered'
          }
        }));
      }
    }
  };

  const goToNextQuestion = () => goToQuestion(currentQuestionIndex + 1);
  const goToPreviousQuestion = () => goToQuestion(currentQuestionIndex - 1);

  const clearAnswer = () => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    setQuestionStates(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
      answer: null,
        status: 'not-answered'
      }
    }));
  };
  
  const saveAndNext = async () => {
    const currentQuestion = getCurrentQuestion();
    const currentState = getCurrentQuestionState();
    
    if (currentQuestion && currentState.answer) {
      await handleAnswerChange(currentState.answer);
    }
    goToNextQuestion();
  };
  
  // Auto-submit when time expires
  const handleAutoSubmit = async () => {
    try {
      setTestCompleted(true);
      await testService.endAptitudeTest(sessionToken);
      // Navigate to results page
      navigate('/test-results');
    } catch (error) {
      handleError(error, 'Auto-submitting test');
    }
  };

  // Final submission
  const handleFinalSubmit = async () => {
    try {
      setIsEndingTest(true);
      clearError();

      const response = await testService.endAptitudeTest(sessionToken);
      
      if (response.success) {
        setTestCompleted(true);
        // Navigate to results page with results data
        navigate('/test-results', { 
      state: {
            results: response.data,
            testType: 'aptitude'
          } 
        });
      }
    } catch (error) {
      handleError(error, 'Submitting test');
    } finally {
      setIsEndingTest(false);
      setShowSubmissionDialog(false);
    }
  };

  // Fullscreen toggle
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get status color for question palette
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered': return 'bg-green-500 text-white';
      case 'not-answered': return 'bg-red-500 text-white';
      case 'marked-for-review': return 'bg-purple-500 text-white';
      case 'answered-and-marked': return 'bg-blue-500 text-white';
      default: return 'bg-gray-300 text-black';
    }
  };

  // Calculate status summary
  const statusSummary = {
    answered: Object.values(questionStates).filter(s => s.status === 'answered' || s.status === 'answered-and-marked').length,
    notAnswered: Object.values(questionStates).filter(s => s.status === 'not-answered').length,
    markedForReview: Object.values(questionStates).filter(s => s.status === 'marked-for-review' || s.status === 'answered-and-marked').length,
    notVisited: Object.values(questionStates).filter(s => s.status === 'not-visited').length
  };

  // Render instructions
  if (showInstructions && !testStarted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Aptitude Test Instructions</h1>
              <p className="text-lg text-gray-600">Please read the following instructions carefully before starting the test.</p>
            </div>
            
            <div className="space-y-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
                  <Clock className="w-6 h-6 mr-2" />
                  Test Duration & Format
                </h2>
                <ul className="list-disc list-inside text-blue-800 space-y-2">
                  <li>Total duration: <strong>60 minutes</strong></li>
                  <li>Total questions: <strong>20 questions</strong></li>
                  <li>Question types: Multiple Choice (MCQ), Multiple Select (MSQ), Numerical Answer Type (NAT), True/False</li>
                  <li>Positive marks: <strong>+1</strong> for correct answers</li>
                  <li>Negative marks: <strong>-0.25</strong> for incorrect answers</li>
                </ul>
              </div>
              
              <div className="bg-green-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-green-900 mb-4 flex items-center">
                  <CheckCircle className="w-6 h-6 mr-2" />
                  Test Features
                </h2>
                <ul className="list-disc list-inside text-green-800 space-y-2">
                  <li>Calculator and scratchpad available</li>
                  <li>Question palette to navigate between questions</li>
                  <li>Mark questions for review</li>
                  <li>Auto-save answers</li>
                  <li>Time warnings at 5 minutes remaining</li>
                </ul>
              </div>
              
              <div className="bg-red-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-red-900 mb-4 flex items-center">
                  <AlertTriangle className="w-6 h-6 mr-2" />
                  Important Rules
                </h2>
                <ul className="list-disc list-inside text-red-800 space-y-2">
                  <li>Do not switch tabs or leave the test window</li>
                  <li>Use fullscreen mode for better experience</li>
                  <li>Test will auto-submit when time expires</li>
                  <li>No external help or materials allowed</li>
                  <li>Ensure stable internet connection</li>
                </ul>
              </div>
              </div>
              
            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="px-8"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={startTest}
                disabled={isStartingTest}
                className="px-8"
              >
                {isStartingTest ? 'Starting...' : 'Start Test'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render test interface
  if (testStarted && !testCompleted) {
    const currentQuestion = getCurrentQuestion();
    const currentState = getCurrentQuestionState();

  return (
      <div className="min-h-screen bg-gray-100">
        {/* Error Toast */}
        {error && (
          <ErrorToast 
            error={error} 
            onClose={clearError}
            duration={5000}
          />
        )}

        {/* Time Warning Modal */}
        {showTimeWarning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md">
              <div className="flex items-center text-orange-600 mb-4">
                <AlertTriangle className="w-8 h-8 mr-3" />
                <h3 className="text-lg font-semibold">Time Warning</h3>
            </div>
              <p className="text-gray-700 mb-4">
                Only 5 minutes remaining! Please review your answers and submit soon.
              </p>
              <Button onClick={() => setShowTimeWarning(false)} className="w-full">
                Continue Test
            </Button>
          </div>
        </div>
        )}
      
        {/* Submission Confirmation Modal */}
        {showSubmissionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Submit Test?
              </h3>
              <div className="mb-4 space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Answered:</strong> {statusSummary.answered}/{questions.length}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Marked for Review:</strong> {statusSummary.markedForReview}
                </p>
                <p className="text-sm text-red-600">
                  <strong>Not Attempted:</strong> {statusSummary.notVisited + statusSummary.notAnswered}
                </p>
            </div>
            <p className="text-gray-700 mb-4">
                Are you sure you want to submit your test? This action cannot be undone.
            </p>
              <div className="flex space-x-3">
            <Button 
                  onClick={() => setShowSubmissionDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleFinalSubmit}
                  disabled={isEndingTest}
                  className="flex-1"
                >
                  {isEndingTest ? 'Submitting...' : 'Submit Test'}
            </Button>
              </div>
          </div>
        </div>
      )}
      
        {/* Main Test Interface */}
        <div className="flex h-screen">
          {/* Question Palette Sidebar */}
        {showQuestionPalette && (
            <div className="w-80 bg-white shadow-lg overflow-y-auto">
              <div className="p-4 border-b bg-gray-50">
                <h2 className="font-semibold text-gray-900 mb-2">Question Palette</h2>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((question, index) => (
                  <button
                    key={question.id}
                    onClick={() => goToQuestion(index)}
                      className={`w-10 h-10 rounded text-sm font-medium border-2 transition-all ${
                        index === currentQuestionIndex 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-300'
                      } ${getStatusColor(questionStates[question.id]?.status || 'not-visited')}`}
                  >
                    {index + 1}
                  </button>
                  ))}
                </div>
                
                {/* Legend */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                    <span>Not Answered</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
                    <span>Marked for Review</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                    <span>Answered & Marked</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
                    <span>Not Visited</span>
                  </div>
                </div>

                {/* Summary */}
                <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>Answered: {statusSummary.answered}</div>
                    <div>Not Answered: {statusSummary.notAnswered}</div>
                    <div>Marked: {statusSummary.markedForReview}</div>
                    <div>Not Visited: {statusSummary.notVisited}</div>
                  </div>
                </div>
            </div>
            
            {/* Tools */}
              <div className="p-4 space-y-3">
              <Button
                  onClick={() => setShowCalculator(!showCalculator)}
                variant="outline"
                size="sm"
                  className="w-full"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Calculator
              </Button>
              <Button
                  onClick={() => setShowScratchpad(!showScratchpad)}
                variant="outline"
                size="sm"
                  className="w-full"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Scratchpad
              </Button>
                <Button
                  onClick={toggleFullScreen}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Maximize className="w-4 h-4 mr-2" />
                  {isFullScreen ? 'Exit' : 'Enter'} Fullscreen
                </Button>
            </div>
          </div>
        )}
        
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="bg-white shadow-sm border-b px-6 py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <h1 className="text-xl font-semibold text-gray-900">
                    Aptitude Test
                  </h1>
                  <div className="text-sm text-gray-600">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Tab switch warning */}
                  {tabSwitchCount > 0 && (
                    <div className="flex items-center text-red-600 text-sm">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Tab switches: {tabSwitchCount}
                    </div>
                  )}
                  
                  {/* Timer */}
                  <div className={`flex items-center font-mono text-lg font-semibold ${
                    timeRemaining <= 300 ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    <Clock className="w-5 h-5 mr-2" />
                    {formatTime(timeRemaining)}
                  </div>
                  
                  <Button
                    onClick={() => setShowQuestionPalette(!showQuestionPalette)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  </div>
                </div>
              </div>
              
            {/* Question Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto p-6">
                {currentQuestion && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    {/* Question Header */}
              <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {currentQuestion.type}
                          </span>
                          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                            {currentQuestion.subject}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            currentQuestion.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                            currentQuestion.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {currentQuestion.difficulty}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Marks: +{currentQuestion.marks} | -{currentQuestion.negativeMarks}
                        </div>
              </div>
              
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Q{currentQuestionIndex + 1}. {currentQuestion.question}
                      </h2>
                    </div>

                    {/* Question Options */}
                    <div className="mb-6">
                      {currentQuestion.options && currentQuestion.options.length > 0 ? (
                        <div className="space-y-3">
                          {currentQuestion.options.map((option) => (
                    <label
                              key={option.key}
                              className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                              {currentQuestion.type === 'MCQ' || currentQuestion.type === 'TRUE_FALSE' ? (
                      <input
                        type="radio"
                                  name={`question-${currentQuestion.id}`}
                                  value={option.key}
                                  checked={currentState.answer === option.key}
                                  onChange={(e) => handleAnswerChange(e.target.value)}
                                  className="mr-3"
                                  disabled={isSubmittingAnswer}
                                />
                              ) : (
                      <input
                        type="checkbox"
                                  value={option.key}
                                  checked={Array.isArray(currentState.answer) && currentState.answer.includes(option.key)}
                        onChange={(e) => {
                                    const currentAnswers = Array.isArray(currentState.answer) ? currentState.answer : [];
                                    if (e.target.checked) {
                                      handleAnswerChange([...currentAnswers, option.key]);
                                    } else {
                                      handleAnswerChange(currentAnswers.filter(a => a !== option.key));
                                    }
                                  }}
                                  className="mr-3"
                                  disabled={isSubmittingAnswer}
                                />
                              )}
                              <span className="font-medium mr-3">{option.key}.</span>
                              <span>{option.text}</span>
                    </label>
                          ))}
                        </div>
                      ) : (
                        // Numerical Answer Type
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter your numerical answer:
                    </label>
                    <input
                      type="number"
                      step="any"
                            value={currentState.answer || ''}
                      onChange={(e) => handleAnswerChange(parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter numerical answer"
                            disabled={isSubmittingAnswer}
                    />
                  </div>
                )}
            </div>
            
                    {/* Action Buttons */}
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-3">
                  <Button
                          onClick={clearAnswer}
                    variant="outline"
                          size="sm"
                          disabled={!currentState.answer}
                  >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Clear
                  </Button>
                  <Button
                          onClick={markForReview}
                    variant="outline"
                          size="sm"
                          className={currentState.status.includes('marked') ? 'bg-purple-100 border-purple-300' : ''}
                  >
                          {currentState.status.includes('marked') ? 'Unmark' : 'Mark for Review'}
                  </Button>
                      </div>
                  
                      <div className="flex space-x-3">
                  <Button
                          onClick={goToPreviousQuestion}
                    variant="outline"
                          disabled={currentQuestionIndex === 0}
                  >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Previous
                  </Button>
                        
                        {currentQuestionIndex === questions.length - 1 ? (
                          <Button
                            onClick={() => setShowSubmissionDialog(true)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Submit Test
                            <CheckCircle className="w-4 h-4 ml-2" />
                          </Button>
                        ) : (
                          <>
                  <Button
                    onClick={saveAndNext}
                              disabled={!currentState.answer || isSubmittingAnswer}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save & Next
                  </Button>
                  <Button
                    onClick={goToNextQuestion}
                              variant="outline"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                          </>
                        )}
                </div>
              </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
      
        {/* Calculator Modal */}
      {showCalculator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-80">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Calculator</h3>
                <button
              onClick={() => setShowCalculator(false)}
                  className="text-gray-500 hover:text-gray-700"
            >
              ×
                </button>
          </div>
              <div className="bg-gray-100 p-3 rounded mb-4">
                <div className="text-right font-mono text-xl">{calculatorDisplay}</div>
            </div>
              {/* Calculator buttons would go here */}
              <div className="text-sm text-gray-600">
                Basic calculator functionality available
            </div>
          </div>
        </div>
      )}
      
        {/* Scratchpad Modal */}
      {showScratchpad && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 h-96">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Scratchpad</h3>
                <button
              onClick={() => setShowScratchpad(false)}
                  className="text-gray-500 hover:text-gray-700"
            >
              ×
                </button>
          </div>
          <textarea
            value={scratchpadContent}
            onChange={(e) => setScratchpadContent(e.target.value)}
                className="w-full h-64 p-3 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Use this space for rough work..."
          />
            </div>
        </div>
      )}
              </div>
    );
  }

  // Loading state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading test...</p>
            </div>
    </div>
  );
};

export default AptitudeTestPage; 
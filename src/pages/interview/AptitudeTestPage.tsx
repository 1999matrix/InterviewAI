import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  Calculator, 
  Edit3, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  CheckSquare,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Save,
  Maximize
} from 'lucide-react';
import Button from '../../components/ui/Button';
import testService, { AptitudeQuestion, AptitudeQuestionOption } from '../../services/testService';
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
        subjects: ['Mathematics', 'Logical Reasoning'], // Can be made configurable
        difficulty: 'Medium',
        duration: 60,
        questionCount: 20
      });

      if (response.success) {
        setQuestions(response.data.questions);
        setSessionToken(response.data.sessionToken);
        setTimeRemaining(response.data.duration * 60);
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
          timeSpent: (prev[currentQuestion.id]?.timeSpent || 0) + timeSpent
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
            timeSpent: (prev[currentQuestion.id]?.timeSpent || 0) + timeSpent
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
      <div className="min-h-screen bg-slate-300 p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm">
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-stone-900 mb-2">Aptitude Test Instructions</h1>
              <p className="text-stone-600">Please read all instructions carefully before starting the exam</p>
            </div>
            
            <div className="space-y-6 text-sm">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-lg mb-2 text-stone-700">General Instructions</h3>
                <ul className="space-y-2 text-stone-700">
                  <li>• Total Duration: 60 minutes</li>
                  <li>• Total Questions: {questions.length}</li>
                  <li>• This is a computer-based test</li>
                  <li>• The exam will auto-submit when time expires</li>
                  <li>• Ensure stable internet connection throughout the exam</li>
                </ul>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-lg mb-2 text-stone-700">Marking Scheme</h3>
                <ul className="space-y-2 text-stone-700">
                  <li>• Each correct answer carries positive marks as specified</li>
                  <li>• Incorrect answers may have negative marking</li>
                  <li>• No marks for unanswered questions</li>
                </ul>
              </div>
              
              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="font-semibold text-lg mb-2 text-stone-700">Navigation</h3>
                <ul className="space-y-2 text-stone-700">
                  <li>• Use question palette to navigate between questions</li>
                  <li>• Questions are color-coded based on status</li>
                  <li>• You can mark questions for review</li>
                  <li>• Save your answers before moving to next question</li>
                </ul>
              </div>
              
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-lg mb-2 text-stone-700">Security Guidelines</h3>
                <ul className="space-y-2 text-stone-700">
                  <li>• Do not switch tabs or minimize the browser</li>
                  <li>• Right-click and copy-paste are disabled</li>
                  <li>• Calculator and scratchpad tools are provided</li>
                  <li>• Any suspicious activity will be monitored</li>
                </ul>
              </div>
              
              <div className="bg-gray-200 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-stone-700">Question Status Legend</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs text-stone-800">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-400 rounded"></div>
                    <span>Not Visited</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-200 border border-red-500 rounded"></div>
                    <span>Not Answered</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-200 border border-green-500 rounded"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-purple-200 border border-purple-500 rounded"></div>
                    <span>Marked for Review</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-200 border border-blue-500 rounded"></div>
                    <span>Answered & Marked</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-8 space-x-4">
              <Button
                onClick={() => navigate('/interview/home')}
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
              <p className="text-stone-700 mb-4">
                {timeRemaining <= 300 ? 'Only 5 minutes remaining!' :
                 timeRemaining <= 900 ? 'Only 15 minutes remaining!' :
                 '30 minutes remaining!'}
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
            <div className="w-80 bg-white shadow-sm border-r p-4">
              <div className="mb-4">
                <h3 className="font-semibold text-stone-900 mb-2">Question Palette</h3>
                <div className="text-xs text-gray-stone space-y-1">
                  <div>Total: {questions.length}</div>
                  <div className="grid grid-cols-2 gap-2 text-stone-700 font-bold">
                    <div>Answered: {statusSummary.answered}</div>
                    <div>Not Answered: {statusSummary.notAnswered}</div>
                    <div>Marked: {statusSummary.markedForReview}</div>
                    <div>Not Visited: {statusSummary.notVisited}</div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-5 gap-2 mb-4">
                {questions.map((question, index) => {
                  const state = questionStates[question.id];
                  const status = state?.status || 'not-visited';
                  const isCurrentQuestion = index === currentQuestionIndex;
                  
                  return (
                    <button
                      key={question.id}
                      onClick={() => goToQuestion(index)}
                      className={`w-10 h-10 rounded text-sm font-medium border-2 transition-all ${
                        isCurrentQuestion 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-300'
                      } ${getStatusColor(status)}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
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
                  <span className="text-sm font-medium text-stone-700">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <span className="text-sm text-stone-700">
                    {currentQuestion?.subject} | {currentQuestion?.difficulty}
                  </span>
                  <span className="text-sm text-green-600 font-medium">
                    +{currentQuestion?.marks} marks
                  </span>
                  {currentQuestion?.negativeMarks && (
                    <span className="text-sm text-red-600">
                      -{currentQuestion?.negativeMarks} for wrong answer
                    </span>
                  )}
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
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Q{currentQuestionIndex + 1}. {currentQuestion.question}
                      </h2>
                    </div>

                    {/* Question Options */}
                    <div className="mb-6">
                      {currentQuestion.type === 'MCQ' && currentQuestion.options ? (
                        <div className="space-y-3">
                          {currentQuestion.options.map((option: AptitudeQuestionOption, index: number) => {
                            const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
                            const isSelected = currentState.answer === option.key;
                            
                            return (
                              <label
                                key={option.key}
                                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                  isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                }`}
                              >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                }`}>
                                  {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                </div>
                                <span className="font-medium text-stone-700 min-w-[20px]">{optionLabel}.</span>
                                <span className="text-stone-900">{option.text}</span>
                                <input
                                  type="radio"
                                  name={`question-${currentQuestion.id}`}
                                  value={option.key}
                                  checked={isSelected}
                                  onChange={() => handleAnswerChange(option.key)}
                                  className="sr-only"
                                  disabled={isSubmittingAnswer}
                                />
                              </label>
                            );
                          })}
                        </div>
                      ) : currentQuestion.type === 'MSQ' && currentQuestion.options ? (
                        <div className="space-y-3">
                          {currentQuestion.options.map((option: AptitudeQuestionOption, index: number) => {
                            const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
                            const currentAnswers = Array.isArray(currentState.answer) ? currentState.answer : [];
                            const isSelected = currentAnswers.includes(option.key);
                            
                            return (
                              <label
                                key={option.key}
                                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                  isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                }`}
                              >
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                }`}>
                                  {isSelected && <CheckSquare className="w-3 h-3 text-white" />}
                                </div>
                                <span className="font-medium text-stone-700 min-w-[20px]">{optionLabel}.</span>
                                <span className="text-stone-900">{option.text}</span>
                                <input
                                  type="checkbox"
                                  value={option.key}
                                  checked={isSelected}
                                  onChange={(e) => {
                                    const currentAnswers = Array.isArray(currentState.answer) ? currentState.answer : [];
                                    if (e.target.checked) {
                                      handleAnswerChange([...currentAnswers, option.key]);
                                    } else {
                                      handleAnswerChange(currentAnswers.filter(a => a !== option.key));
                                    }
                                  }}
                                  className="sr-only"
                                  disabled={isSubmittingAnswer}
                                />
                              </label>
                            );
                          })}
                        </div>
                      ) : currentQuestion.type === 'NAT' ? (
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-stone-700">
                            Enter your numerical answer:
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={typeof currentState.answer === 'number' ? currentState.answer : ''}
                            onChange={(e) => handleAnswerChange(parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter numerical answer"
                            disabled={isSubmittingAnswer}
                          />
                        </div>
                      ) : null}
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
          <div className="fixed bottom-4 right-4 bg-gradient-to-r from-rose-300 to-blue-400 rounded-lg shadow-lg border p-4 w-64 z-40">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-stone-700">Calculator</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCalculator(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="bg-gray-100 p-2 rounded text-right font-mono text-stone-700 font-bold">
                {calculatorDisplay}
              </div>
              
              <div className="grid grid-cols-4 gap-2 bg-slate-600 p-1">
                {['C', '÷', '×', '⌫', '7', '8', '9', '-', '4', '5', '6', '+', '1', '2', '3', '0', '.', '00', '='].map((btn, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      // Handle calculator input
                      if (btn === 'C') {
                        setCalculatorDisplay('0');
                      } else if (btn === '⌫') {
                        setCalculatorDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
                      } else if (btn === '=') {
                        try {
                          // Replace ÷ and × with / and * for eval
                          const expression = calculatorDisplay.replace(/÷/g, '/').replace(/×/g, '*');
                          setCalculatorDisplay(eval(expression).toString());
                        } catch {
                          setCalculatorDisplay('Error');
                        }
                      } else {
                        setCalculatorDisplay(prev => prev === '0' ? btn : prev + btn);
                      }
                    }}
                    className={`h-10 ${btn === '=' ? 'col-span-2 bg-gray-500 text-white' : 'bg-slate-500'} rounded-md`}
                  >
                    {btn}
                  </button>
                ))}
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
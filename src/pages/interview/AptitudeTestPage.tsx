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

// Question types
interface Question {
  id: number;
  type: 'MCQ' | 'MSQ' | 'NAT' | 'TRUE_FALSE';
  question: string;
  options?: string[];
  correctAnswer?: string | string[] | number;
  subject: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  marks: number;
  negativeMarks?: number;
}

// Question status types
type QuestionStatus = 'not-visited' | 'not-answered' | 'answered' | 'marked-for-review' | 'answered-and-marked';

interface QuestionState {
  status: QuestionStatus;
  answer: string | string[] | number | null;
  timeSpent: number;
  visitedAt?: number;
}

// Sample questions data
const sampleQuestions: Question[] = [
  {
    id: 1,
    type: 'MCQ',
    question: 'What is the value of 15% of 240?',
    options: ['36', '32', '40', '42'],
    correctAnswer: '36',
    subject: 'Mathematics',
    difficulty: 'Easy',
    marks: 1,
    negativeMarks: 0.25
  },
  {
    id: 2,
    type: 'MCQ',
    question: 'If a train travels 60 km in 45 minutes, what is its speed in km/hr?',
    options: ['75', '80', '85', '90'],
    correctAnswer: '80',
    subject: 'Mathematics',
    difficulty: 'Medium',
    marks: 2,
    negativeMarks: 0.5
  },
  {
    id: 3,
    type: 'MSQ',
    question: 'Which of the following are prime numbers?',
    options: ['17', '21', '23', '27'],
    correctAnswer: ['17', '23'],
    subject: 'Mathematics',
    difficulty: 'Medium',
    marks: 2,
    negativeMarks: 0.5
  },
  {
    id: 4,
    type: 'NAT',
    question: 'Find the square root of 144.',
    subject: 'Mathematics',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 5,
    type: 'TRUE_FALSE',
    question: 'The sum of angles in a triangle is always 180 degrees.',
    options: ['True', 'False'],
    correctAnswer: 'True',
    subject: 'Mathematics',
    difficulty: 'Easy',
    marks: 1,
    negativeMarks: 0.25
  }
];

const AptitudeTestPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Core state
  const [questions] = useState<Question[]>(sampleQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState<Record<number, QuestionState>>({});
  const [examStarted, setExamStarted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(60 * 60); // 60 minutes in seconds
  const [examStartTime, setExamStartTime] = useState<number | null>(null);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  
  // UI state
  const [showCalculator, setShowCalculator] = useState(false);
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [scratchpadContent, setScratchpadContent] = useState('');
  const [calculatorDisplay, setCalculatorDisplay] = useState('0');
  const [showQuestionPalette, setShowQuestionPalette] = useState(true);
  const [showSubmissionDialog, setShowSubmissionDialog] = useState(false);
  
  // Security monitoring
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [suspiciousActivity, setSuspiciousActivity] = useState<string[]>([]);
  
  // Refs
  const questionStartTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<number | null>(null);
  
  // Initialize question states
  useEffect(() => {
    const initialStates: Record<number, QuestionState> = {};
    questions.forEach((q) => {
      initialStates[q.id] = {
        status: 'not-visited',
        answer: null,
        timeSpent: 0
      };
    });
    setQuestionStates(initialStates);
  }, [questions]);
  
  // Timer effect
  useEffect(() => {
    if (examStarted && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1;
          
          // Show warnings at specific intervals
          if (newTime === 30 * 60) { // 30 minutes
            setShowTimeWarning(true);
            setTimeout(() => setShowTimeWarning(false), 5000);
          } else if (newTime === 15 * 60) { // 15 minutes
            setShowTimeWarning(true);
            setTimeout(() => setShowTimeWarning(false), 5000);
          } else if (newTime === 5 * 60) { // 5 minutes
            setShowTimeWarning(true);
            setTimeout(() => setShowTimeWarning(false), 10000);
          }
          
          return newTime;
        });
      }, 1000);
    } else if (timeRemaining <= 0) {
      // Auto-submit when time is up
      handleFinalSubmit();
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [examStarted, timeRemaining]);
  
  // Security measures
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && examStarted) {
        setTabSwitchCount(prev => prev + 1);
        setSuspiciousActivity(prev => [...prev, `Tab switched at ${new Date().toLocaleTimeString()}`]);
      }
    };
    
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
    };
    
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent common shortcuts
      if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'a' || e.key === 's')) {
        e.preventDefault();
      }
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
      }
    };
    
    if (examStarted) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('copy', handleCopy);
      document.addEventListener('paste', handlePaste);
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [examStarted]);
  
  // Utility functions
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const updateQuestionState = (questionId: number, updates: Partial<QuestionState>) => {
    setQuestionStates(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        ...updates
      }
    }));
  };
  
  const getCurrentQuestion = () => questions[currentQuestionIndex];
  
  const getCurrentQuestionState = () => {
    const currentQuestion = getCurrentQuestion();
    return questionStates[currentQuestion?.id] || {
      status: 'not-visited',
      answer: null,
      timeSpent: 0
    };
  };
  
  // Navigation functions
  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
      const question = questions[index];
      updateQuestionState(question.id, {
        status: questionStates[question.id]?.status === 'not-visited' ? 'not-answered' : questionStates[question.id]?.status,
        visitedAt: Date.now()
      });
    }
  };
  
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      goToQuestion(currentQuestionIndex + 1);
    }
  };
  
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      goToQuestion(currentQuestionIndex - 1);
    }
  };
  
  // Answer handling
  const handleAnswerChange = (answer: string | string[] | number) => {
    const currentQuestion = getCurrentQuestion();
    const currentState = getCurrentQuestionState();
    
    let newStatus: QuestionStatus;
    if (currentState.status === 'marked-for-review') {
      newStatus = 'answered-and-marked';
    } else {
      newStatus = 'answered';
    }
    
    updateQuestionState(currentQuestion.id, {
      answer,
      status: newStatus
    });
  };
  
  const clearAnswer = () => {
    const currentQuestion = getCurrentQuestion();
    const currentState = getCurrentQuestionState();
    
    let newStatus: QuestionStatus;
    if (currentState.status === 'answered-and-marked') {
      newStatus = 'marked-for-review';
    } else {
      newStatus = 'not-answered';
    }
    
    updateQuestionState(currentQuestion.id, {
      answer: null,
      status: newStatus
    });
  };
  
  const markForReview = () => {
    const currentQuestion = getCurrentQuestion();
    const currentState = getCurrentQuestionState();
    
    let newStatus: QuestionStatus;
    if (currentState.answer) {
      newStatus = 'answered-and-marked';
    } else {
      newStatus = 'marked-for-review';
    }
    
    updateQuestionState(currentQuestion.id, {
      status: newStatus
    });
  };
  
  const saveAndNext = () => {
    goToNextQuestion();
  };
  
  // Calculator functions
  const handleCalculatorInput = (value: string) => {
    if (value === 'C') {
      setCalculatorDisplay('0');
    } else if (value === '=') {
      try {
        const result = eval(calculatorDisplay.replace(/×/g, '*').replace(/÷/g, '/'));
        setCalculatorDisplay(result.toString());
      } catch {
        setCalculatorDisplay('Error');
      }
    } else {
      setCalculatorDisplay(prev => prev === '0' ? value : prev + value);
    }
  };
  
  // Full screen handling
  const toggleFullScreen = () => {
    if (!isFullScreen) {
      document.documentElement.requestFullscreen?.();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullScreen(false);
    }
  };
  
  // Exam control functions
  const startExam = () => {
    setShowInstructions(false);
    setExamStarted(true);
    setExamStartTime(Date.now());
    updateQuestionState(questions[0].id, {
      status: 'not-answered',
      visitedAt: Date.now()
    });
  };
  
  const handleFinalSubmit = () => {
    setExamStarted(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    const answers = Object.entries(questionStates).reduce((acc, [questionId, state]) => {
      acc[questionId] = state.answer;
      return acc;
    }, {} as Record<string, any>);
    
    console.log('Exam submitted with answers:', answers);
    console.log('Suspicious activities:', suspiciousActivity);
    console.log('Tab switches:', tabSwitchCount);
    
    navigate('/interview/results', {
      state: {
        examType: 'aptitude',
        answers,
        questions,
        suspiciousActivity,
        tabSwitchCount
      }
    });
  };
  
  // Status summary
  const getStatusSummary = () => {
    const summary = {
      'not-visited': 0,
      'not-answered': 0,
      'answered': 0,
      'marked-for-review': 0,
      'answered-and-marked': 0
    };
    
    Object.values(questionStates).forEach(state => {
      summary[state.status]++;
    });
    
    return summary;
  };
  
  const statusSummary = getStatusSummary();
  
  // Question status color mapping
  const getStatusColor = (status: QuestionStatus) => {
    switch (status) {
      case 'not-visited': return 'bg-gray-200 text-gray-700';
      case 'not-answered': return 'bg-red-100 text-red-700 border-red-300';
      case 'answered': return 'bg-green-100 text-green-700 border-green-300';
      case 'marked-for-review': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'answered-and-marked': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-gray-200 text-gray-700';
    }
  };
  
  // Instructions page
  if (showInstructions) {
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
                  <div className="flex items-center space-x-2 ">
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
                variant="outline"
                onClick={() => navigate('/interview/create')}
                className="flex items-center"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <Button
                onClick={startExam}
                className="flex items-center px-8"
              >
                <Lock className="w-4 h-4 mr-2" />
                Start Exam
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Main exam interface
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">Aptitude Test</h1>
            {tabSwitchCount > 0 && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Tab switches: {tabSwitchCount}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Timer */}
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
              timeRemaining <= 300 ? 'bg-red-100 text-red-700' : 
              timeRemaining <= 900 ? 'bg-yellow-100 text-yellow-700' : 
              'bg-blue-100 text-blue-700'
            }`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
            </div>
            
            {/* Full screen toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullScreen}
              className="flex items-center"
            >
              <Maximize className="w-4 h-4" />
            </Button>
            
            {/* Submit button */}
            <Button
              variant="outline"
              onClick={() => setShowSubmissionDialog(true)}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Submit Exam
            </Button>
          </div>
        </div>
      </div>
      
      {/* Time warning overlay */}
      {showTimeWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center space-x-3 text-yellow-600 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Time Warning</h3>
            </div>
            <p className="text-stone-700 mb-4">
              {timeRemaining <= 300 ? 'Only 5 minutes remaining!' :
               timeRemaining <= 900 ? 'Only 15 minutes remaining!' :
               '30 minutes remaining!'}
            </p>
            <Button 
              onClick={() => setShowTimeWarning(false)}
              className="w-full"
            >
              Continue Exam
            </Button>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex-1 flex">
        {/* Question palette */}
        {showQuestionPalette && (
          <div className="w-80 bg-white shadow-sm border-r p-4">
            <div className="mb-4">
              <h3 className="font-semibold text-stone-900 mb-2">Question Palette</h3>
              <div className="text-xs text-gray-stone space-y-1">
                <div>Total: {questions.length}</div>
                <div className="grid grid-cols-2 gap-2 text-stone-700 font-bold">
                  <div>Answered: {statusSummary.answered + statusSummary['answered-and-marked']}</div>
                  <div>Not Answered: {statusSummary['not-answered']}</div>
                  <div>Marked: {statusSummary['marked-for-review'] + statusSummary['answered-and-marked']}</div>
                  <div>Not Visited: {statusSummary['not-visited']}</div>
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
                    className={`
                      w-10 h-10 rounded text-sm font-medium border-2 transition-all
                      ${getStatusColor(status)}
                      ${isCurrentQuestion ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                      hover:scale-105
                    `}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            
            {/* Tools */}
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCalculator(!showCalculator)}
                className="w-full flex items-center justify-center"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Calculator
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowScratchpad(!showScratchpad)}
                className="w-full flex items-center justify-center"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Scratchpad
              </Button>
            </div>
          </div>
        )}
        
        {/* Question area */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Question header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-stone-700">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <span className="text-sm text-stone-700">
                    {getCurrentQuestion()?.subject} | {getCurrentQuestion()?.difficulty}
                  </span>
                  <span className="text-sm text-green-600 font-medium">
                    +{getCurrentQuestion()?.marks} marks
                  </span>
                  {getCurrentQuestion()?.negativeMarks && (
                    <span className="text-sm text-red-600">
                      -{getCurrentQuestion()?.negativeMarks} for wrong answer
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    getStatusColor(getCurrentQuestionState().status)
                  }`}>
                    {getCurrentQuestionState().status.replace('-', ' ').toUpperCase()}
                  </div>
                </div>
              </div>
              
              {/* Question content */}
              <div className="mb-6">
                <p className="text-lg text-stone-900 leading-relaxed">
                  {getCurrentQuestion()?.question}
                </p>
              </div>
              
              {/* Answer options */}
              <div className="space-y-3">
                {getCurrentQuestion()?.type === 'MCQ' && getCurrentQuestion()?.options?.map((option: string, index: number) => {
                  const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
                  const isSelected = getCurrentQuestionState().answer === option;
                  
                  return (
                    <label
                      key={index}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-400 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-400'
                      }`}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      <span className="font-medium text-stone-700 min-w-[20px]">{optionLabel}.</span>
                      <span className="text-stone-900">{option}</span>
                      <input
                        type="radio"
                        name={`question-${getCurrentQuestion()?.id}`}
                        value={option}
                        checked={isSelected}
                        onChange={() => handleAnswerChange(option)}
                        className="sr-only"
                      />
                    </label>
                  );
                })}
                
                {getCurrentQuestion()?.type === 'MSQ' && getCurrentQuestion()?.options?.map((option: string, index: number) => {
                  const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
                  const currentAnswers = (getCurrentQuestionState().answer as string[]) || [];
                  const isSelected = currentAnswers.includes(option);
                  
                  return (
                    <label
                      key={index}
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
                      <span className="text-stone-900">{option}</span>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const newAnswers = e.target.checked
                            ? [...currentAnswers, option]
                            : currentAnswers.filter(a => a !== option);
                          handleAnswerChange(newAnswers);
                        }}
                        className="sr-only"
                      />
                    </label>
                  );
                })}
                
                {getCurrentQuestion()?.type === 'NAT' && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-stone-700">
                      Enter your numerical answer:
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={getCurrentQuestionState().answer as number || ''}
                      onChange={(e) => handleAnswerChange(parseFloat(e.target.value) || 0)}
                      className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter numerical answer"
                    />
                  </div>
                )}
                
                {getCurrentQuestion()?.type === 'TRUE_FALSE' && getCurrentQuestion()?.options?.map((option: string, index: number) => {
                  const isSelected = getCurrentQuestionState().answer === option;
                  
                  return (
                    <label
                      key={index}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      <span className="text-gray-900">{option}</span>
                      <input
                        type="radio"
                        name={`question-${getCurrentQuestion()?.id}`}
                        value={option}
                        checked={isSelected}
                        onChange={() => handleAnswerChange(option)}
                        className="sr-only"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
            
            {/* Navigation buttons */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={goToPreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={clearAnswer}
                    className="flex items-center text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={markForReview}
                    className="flex items-center text-purple-600 border-purple-300 hover:bg-purple-50"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Mark for Review
                  </Button>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={saveAndNext}
                    disabled={currentQuestionIndex === questions.length - 1}
                    className="flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save & Next
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={goToNextQuestion}
                    disabled={currentQuestionIndex === questions.length - 1}
                    className="flex items-center"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Calculator modal */}
      {showCalculator && (
        <div className="fixed bottom-4 right-4 bg-gradient-to-r from-rose-300 to-blue-400 rounded-lg shadow-lg border p-4 w-64 z-40">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-stone-700">Calculator</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCalculator(false)}
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
                  onClick={() => handleCalculatorInput(btn)}
                  className={`h-10 ${btn === '=' ? 'col-span-2 bg-gray-500 text-white' : ''}, bg-slate-500 rounded-md`}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Scratchpad modal */}
      {showScratchpad && (
        <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-lg border p-4 w-80 h-64 z-40">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Scratchpad</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowScratchpad(false)}
            >
              ×
            </Button>
          </div>
          
          <textarea
            value={scratchpadContent}
            onChange={(e) => setScratchpadContent(e.target.value)}
            placeholder="Use this space for rough work..."
            className="w-full h-full resize-none border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
      
      {/* Submission dialog */}
      {showSubmissionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 text-stone-800">Submit Exam</h3>
            <p className="text-stone-700 mb-4">
              Are you sure you want to submit your exam? This action cannot be undone.
            </p>
            
            <div className="bg-gray-200 p-3 rounded mb-4 text-sm text-stone-700">
              <div className="grid grid-cols-2 gap-2">
                <div>Total Questions: {questions.length}</div>
                <div>Answered: {statusSummary.answered + statusSummary['answered-and-marked']}</div>
                <div>Not Answered: {statusSummary['not-answered'] + statusSummary['not-visited']}</div>
                <div>Marked for Review: {statusSummary['marked-for-review'] + statusSummary['answered-and-marked']}</div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowSubmissionDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleFinalSubmit}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Submit Exam
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AptitudeTestPage; 
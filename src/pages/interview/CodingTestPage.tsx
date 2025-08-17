import React, { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle, AlertCircle, Play, Settings, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { codingTestService, CodingQuestion, TestResult } from '../../services/testService';

// Define available programming languages
const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', icon: 'js' },
  { id: 'python', name: 'Python', icon: 'py' },
  { id: 'java', name: 'Java', icon: 'java' },
  { id: 'cpp', name: 'C++', icon: 'cpp' }
] as const;

// Define a type for language IDs
type LanguageId = typeof LANGUAGES[number]['id'];

// Sample test problems
const SAMPLE_PROBLEMS = [
  {
    id: 1,
    title: 'Two Sum',
    difficulty: 'Easy',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
    
You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    testCases: [
      { input: '[2,7,11,15], 9', expected: '[0,1]' },
      { input: '[3,2,4], 6', expected: '[1,2]' },
      { input: '[3,3], 6', expected: '[0,1]' }
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Your code here
    
}`,
      python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Your code here
        pass`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
        
    }
}`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your code here
        
    }
};`
    }
  },
  {
    id: 2,
    title: 'Valid Palindrome',
    difficulty: 'Easy',
    description: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Alphanumeric characters include letters and numbers.

Given a string s, return true if it is a palindrome, or false otherwise.`,
    examples: [
      {
        input: 's = "A man, a plan, a canal: Panama"',
        output: 'true',
        explanation: '"amanaplanacanalpanama" is a palindrome.'
      },
      {
        input: 's = "race a car"',
        output: 'false',
        explanation: '"raceacar" is not a palindrome.'
      }
    ],
    constraints: [
      '1 <= s.length <= 2 * 10^5',
      's consists only of printable ASCII characters.'
    ],
    testCases: [
      { input: '"A man, a plan, a canal: Panama"', expected: 'true' },
      { input: '"race a car"', expected: 'false' },
      { input: '" "', expected: 'true' }
    ],
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isPalindrome(s) {
    // Your code here
    
}`,
      python: `class Solution:
    def isPalindrome(self, s: str) -> bool:
        # Your code here
        pass`,
      java: `class Solution {
    public boolean isPalindrome(String s) {
        // Your code here
        
    }
}`,
      cpp: `class Solution {
public:
    bool isPalindrome(string s) {
        // Your code here
        
    }
};`
    }
  },
  {
    id: 3,
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    description: `Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.

A subarray is a contiguous part of an array.`,
    examples: [
      {
        input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
        output: '6',
        explanation: '[4,-1,2,1] has the largest sum = 6.'
      },
      {
        input: 'nums = [1]',
        output: '1',
        explanation: 'The subarray [1] has the largest sum 1.'
      }
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4'
    ],
    testCases: [
      { input: '[-2,1,-3,4,-1,2,1,-5,4]', expected: '6' },
      { input: '[1]', expected: '1' },
      { input: '[5,4,-1,7,8]', expected: '23' }
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
    // Your code here
    
}`,
      python: `class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        # Your code here
        pass`,
      java: `class Solution {
    public int maxSubArray(int[] nums) {
        // Your code here
        
    }
}`,
      cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        // Your code here
        
    }
};`
    }
  }
];

// Button Component
type ButtonProps = {
  children: React.ReactNode;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  className?: string;
  [key: string]: any;
};

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const baseClasses = "px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center justify-center";
  const variants: Record<string, string> = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300",
    secondary: "bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:bg-gray-100"
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${className} ${disabled ? 'cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Toast Component
type ToastProps = {
  message: string;
  type: 'info' | 'success' | 'error' | 'loading';
  onClose: () => void;
};

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const bgColors = {
    info: 'bg-blue-600',
    success: 'bg-green-600', 
    error: 'bg-red-600',
    loading: 'bg-purple-600'
  };

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className={`flex items-center ${bgColors[type]} text-white px-6 py-3 rounded-lg shadow-lg animate-fadeIn`}>
        {type === 'loading' && (
          <svg className="w-5 h-5 mr-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        )}
        <span className="font-medium">{message}</span>
        <button 
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// CodeEditor Component
type CodeEditorProps = {
  language: string;
  code: string;
  onChange: (code: string) => void;
};

const CodeEditor: React.FC<CodeEditorProps> = ({ language, code, onChange }) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Handle tab key for indentation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      
      const newValue = code.substring(0, start) + '    ' + code.substring(end);
      onChange(newValue);
      
      // Move cursor position after the inserted tab
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.selectionStart = start + 4;
          editorRef.current.selectionEnd = start + 4;
        }
      }, 0);
    }
  };

  return (
    <div className="relative h-full border border-gray-300 rounded-md bg-gray-900 text-white overflow-hidden flex flex-col">
      <div className="bg-gray-800 text-gray-300 py-2 px-4 border-b border-gray-700 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-sm font-mono">{language.toUpperCase()}</span>
        </div>
        <div className="flex space-x-2">
          <button className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded">Format</button>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Line numbers */}
        <div className="bg-gray-800 text-gray-500 text-right py-2 px-2 select-none font-mono text-sm w-12 overflow-y-hidden">
          {code.split('\n').map((_, i) => (
            <div key={i} className="leading-6">{i + 1}</div>
          ))}
        </div>
        
        {/* Code textarea */}
        <textarea
          ref={editorRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-gray-900 text-gray-200 p-2 font-mono text-sm outline-none resize-none leading-6"
          spellCheck="false"
        />
      </div>
    </div>
  );
};

// Test Cases Component
type TestCasesProps = {
  testCases: Array<{
    input: string;
    expected: string;
  }>;
  results: Array<{
    passed: boolean;
    output: string;
    runtime?: string;
    memory?: string;
  }> | null;
  onRunCode: () => void;
  onSubmit: () => void;
  isRunning: boolean;
};

const TestCases: React.FC<TestCasesProps> = ({ 
  testCases, 
  results, 
  onRunCode, 
  onSubmit,
  isRunning 
}) => {
  const [activeTab, setActiveTab] = useState<'testcases' | 'results'>('testcases');
  
  return (
    <div className="border border-gray-300 rounded-md overflow-hidden bg-white">
      <div className="flex border-b border-gray-300">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'testcases' 
              ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab('testcases')}
        >
          Test Cases
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'results' 
              ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab('results')}
          disabled={!results}
        >
          Results
        </button>
        <div className="ml-auto flex items-center px-2">
          <Button 
            onClick={onRunCode} 
            className="mr-2 text-sm py-1 px-3"
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                Running...
              </>
            ) : (
              <>
                <Play className="w-3 h-3 mr-1" />
                Run
              </>
            )}
          </Button>
          <Button 
            onClick={onSubmit} 
            variant="secondary"
            className="text-sm py-1 px-3"
            disabled={isRunning}
          >
            Submit
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        {activeTab === 'testcases' ? (
          <div className="space-y-3">
            {testCases.map((testCase, index) => (
              <div key={index} className="border border-gray-200 rounded-md p-3">
                <div className="mb-2">
                  <span className="font-medium text-sm text-gray-700">Test Case {index + 1}</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-gray-500">Input:</div>
                    <div className="font-mono text-sm bg-gray-50 p-2 rounded">
                      {testCase.input}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Expected Output:</div>
                    <div className="font-mono text-sm bg-gray-50 p-2 rounded">
                      {testCase.expected}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {results && results.map((result, index) => (
              <div key={index} className={`border rounded-md p-3 ${
                result.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex items-center mb-2">
                  <span className="font-medium text-sm">Test Case {index + 1}</span>
                  {result.passed ? (
                    <span className="ml-2 text-green-600 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Passed
                    </span>
                  ) : (
                    <span className="ml-2 text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Failed
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-gray-500">Your Output:</div>
                    <div className="font-mono text-sm bg-white p-2 rounded border border-gray-200">
                      {result.output}
                    </div>
                  </div>
                  
                  {result.runtime && (
                    <div className="flex space-x-4 text-xs text-gray-600">
                      <div>Runtime: {result.runtime}</div>
                      {result.memory && <div>Memory: {result.memory}</div>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Main CodingTestPage Component
const CodingTestPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Get params from location state or use defaults
  const testParams = location.state || {};
  
  // State management
  const [sessionToken, setSessionToken] = useState<string>('');
  const [questions, setQuestions] = useState<CodingQuestion[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageId>('javascript');
  const [code, setCode] = useState('');
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(60 * 60); // 60 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'error' | 'loading' } | null>(null);
  const [testStarted, setTestStarted] = useState(false);
  
  const currentProblem = questions[currentProblemIndex];
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize coding test session
  useEffect(() => {
    const initializeTest = async () => {
      try {
        setIsInitializing(true);
        setToast({ message: 'Initializing coding test...', type: 'loading' });

        // Start the coding test session
        const testSession = await codingTestService.startTest({
          username: user?.name || user?.email,
          email: user?.email,
          difficulty: testParams.difficulty || 'Easy',
          language: testParams.language || 'javascript',
          duration: testParams.duration || 90,
          questionCount: testParams.questionCount || 3
        });

        setSessionToken(testSession.sessionToken);
        setQuestions(testSession.questions);
        setTimeRemaining(testSession.duration * 60); // Convert minutes to seconds
        setSelectedLanguage((testParams.language || 'javascript') as LanguageId);
        setTestStarted(true);
        
        // Load first question if available
        if (testSession.questions.length > 0) {
          await loadQuestion(testSession.sessionToken, testSession.questions[0].id, 0);
        }

        setToast({ message: 'Coding test started successfully!', type: 'success' });
        setTimeout(() => setToast(null), 3000);

      } catch (error: any) {
        console.error('Failed to initialize test:', error);
        setToast({ message: error.message || 'Failed to start coding test', type: 'error' });
        setTimeout(() => navigate('/interview/create-session'), 3000);
      } finally {
        setIsInitializing(false);
      }
    };

    if (!testStarted) {
      initializeTest();
    }
  }, [user, testParams, testStarted, navigate]);

  // Load question and any saved code
  const loadQuestion = async (token: string, questionId: number, index: number) => {
    try {
      const questionData = await codingTestService.getCurrentQuestion(token, questionId);
      
      // Update current question index
      setCurrentProblemIndex(index);
      
      // Load saved code if exists
      if (questionData.question.savedCode && questionData.question.savedLanguage) {
        setCode(questionData.question.savedCode);
        setSelectedLanguage(questionData.question.savedLanguage as LanguageId);
      } else {
        // Set starter code or empty code
        setCode(getStarterCode(selectedLanguage, questionData.question));
      }
      
      // Update session info
      setTimeRemaining(questionData.sessionInfo.timeRemaining);
      
    } catch (error) {
      console.error('Failed to load question:', error);
      setToast({ message: 'Failed to load question', type: 'error' });
    }
  };

  // Get starter code for a language (placeholder for now)
  const getStarterCode = (language: LanguageId, question: CodingQuestion): string => {
    const starterTemplates = {
      javascript: `// ${question.question}\nfunction solution() {\n    // Your code here\n    \n}`,
      python: `# ${question.question}\ndef solution():\n    # Your code here\n    pass`,
      java: `// ${question.question}\npublic class Solution {\n    public void solution() {\n        // Your code here\n        \n    }\n}`,
      cpp: `// ${question.question}\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    \n    return 0;\n}`
    };
    
    return starterTemplates[language] || '';
  };

  // Auto-save functionality
  useEffect(() => {
    if (sessionToken && currentProblem && code.trim() && !isAutoSaving) {
      // Clear previous timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      
      // Set new timer for auto-save
      autoSaveTimerRef.current = setTimeout(async () => {
        try {
          setIsAutoSaving(true);
          await codingTestService.autoSave({
            sessionToken,
            questionId: currentProblem.id,
            language: selectedLanguage,
            code
          });
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setIsAutoSaving(false);
        }
      }, 2000); // Auto-save after 2 seconds of inactivity
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [code, sessionToken, currentProblem, selectedLanguage, isAutoSaving]);
  
  // Timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitCode(); // Auto-submit when time expires
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Format time for display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Real execution of code
  const handleRunCode = async () => {
    if (!sessionToken || !currentProblem) {
      setToast({ message: 'No active session or question found', type: 'error' });
      return;
    }

    setIsRunning(true);
    setToast({ message: 'Running your code...', type: 'loading' });
    
    try {
      const runResult = await codingTestService.runCode({
        sessionToken,
        questionId: currentProblem.id,
        language: selectedLanguage,
        code
      });

      if (runResult.success && runResult.data) {
        setResults(runResult.data.results);
        setToast({ 
          message: `Code executed! ${runResult.data.summary.passed}/${runResult.data.summary.total} test cases passed`, 
          type: runResult.data.summary.passed === runResult.data.summary.total ? 'success' : 'info'
        });
      } else {
        setToast({ message: runResult.message || 'Code execution failed', type: 'error' });
      }
      
      setTimeout(() => setToast(null), 3000);
    } catch (error: any) {
      console.error('Code execution error:', error);
      setToast({ message: error.message || 'Code execution failed', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setIsRunning(false);
    }
  };
  
  // Handle submission
  const handleSubmitCode = async () => {
    if (!sessionToken || !currentProblem) {
      setToast({ message: 'No active session or question found', type: 'error' });
      return;
    }

    setIsRunning(true);
    setToast({ message: 'Submitting your solution...', type: 'loading' });
    
    try {
      const submitResult = await codingTestService.submitCode({
        sessionToken,
        questionId: currentProblem.id,
        language: selectedLanguage,
        code,
        timeSpent: Math.floor((Date.now() - timeRemaining * 1000) / 1000) // Calculate time spent
      });

      if (submitResult.success && submitResult.data) {
        const { testCasesPassed, totalTestCases, marksObtained, compilationStatus } = submitResult.data;
        
        if (compilationStatus === 'success' && testCasesPassed === totalTestCases) {
          setToast({ message: `All tests passed! Score: ${marksObtained} marks`, type: 'success' });
          
          // Move to next problem if available
          setTimeout(async () => {
            if (currentProblemIndex < questions.length - 1) {
              const nextQuestionIndex = currentProblemIndex + 1;
              const nextQuestion = questions[nextQuestionIndex];
              await loadQuestion(sessionToken, nextQuestion.id, nextQuestionIndex);
              setResults(null);
            } else {
              // End test if all questions completed
              try {
                const finalResults = await codingTestService.endTest(sessionToken);
                setToast({ message: 'Congratulations! Test completed!', type: 'success' });
                
                // Navigate to results page
                setTimeout(() => {
                  navigate('/interview/results', { state: { results: finalResults } });
                }, 2000);
              } catch (error) {
                console.error('Failed to end test:', error);
              }
            }
          }, 2000);
        } else {
          setToast({ 
            message: `${testCasesPassed}/${totalTestCases} test cases passed. Score: ${marksObtained} marks`, 
            type: 'error' 
          });
          
          // Run code to show test results
          handleRunCode();
        }
      } else {
        setToast({ message: submitResult.message || 'Submission failed', type: 'error' });
      }
      
      setTimeout(() => setToast(null), 5000);
    } catch (error: any) {
      console.error('Submission error:', error);
      setToast({ message: error.message || 'Submission failed', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setIsRunning(false);
    }
  };

  // Handle language change
  const handleLanguageChange = async (newLanguage: LanguageId) => {
    setSelectedLanguage(newLanguage);
    
    // Load saved code for this language if exists
    if (sessionToken && currentProblem) {
      try {
        const questionData = await codingTestService.getCurrentQuestion(sessionToken, currentProblem.id);
        if (questionData.question.savedCode && questionData.question.savedLanguage === newLanguage) {
          setCode(questionData.question.savedCode);
        } else {
          setCode(getStarterCode(newLanguage, currentProblem));
        }
      } catch (error) {
        console.error('Failed to load saved code:', error);
        setCode(getStarterCode(newLanguage, currentProblem));
      }
    }
  };

  // Navigation functions
  const goToPreviousQuestion = async () => {
    if (currentProblemIndex > 0 && sessionToken) {
      const prevIndex = currentProblemIndex - 1;
      const prevQuestion = questions[prevIndex];
      await loadQuestion(sessionToken, prevQuestion.id, prevIndex);
      setResults(null);
    }
  };

  const goToNextQuestion = async () => {
    if (currentProblemIndex < questions.length - 1 && sessionToken) {
      const nextIndex = currentProblemIndex + 1;
      const nextQuestion = questions[nextIndex];
      await loadQuestion(sessionToken, nextQuestion.id, nextIndex);
      setResults(null);
    }
  };

  // Early return for loading state
  if (isInitializing || !currentProblem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{isInitializing ? 'Initializing coding test...' : 'Loading question...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-stone-900">Coding Interview Assessment</h1>
              <p className="text-stone-700 text-sm">
                Problem {currentProblemIndex + 1}/{questions.length} - {currentProblem.question}
              </p>
              {isAutoSaving && (
                <p className="text-xs text-blue-600">Auto-saving...</p>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`
                ${timeRemaining < 300 ? 'bg-red-50 text-red-700 animate-pulse' : 
                  timeRemaining < 600 ? 'bg-yellow-50 text-yellow-700' : 
                  'bg-blue-50 text-blue-700'}
                py-1 px-3 rounded-full text-sm font-medium flex items-center
              `}>
                <Clock className="w-4 h-4 mr-1.5" />
                {formatTime(timeRemaining)}
              </div>
              
              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value as LanguageId)}
                className="bg-gray-200 border border-gray-500 text-stone-900 rounded-md py-1 px-3 text-sm"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.id} value={lang.id}>{lang.name}</option>
                ))}
              </select>
              
              <Button
                variant="outline"
                onClick={() => {}}
                className="text-sm py-1 bg-red-500"
              >
                <Settings className="w-4 h-4 mr-1.5 text-stone-950" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-6 py-8 text-stone-700">
        <div className="grid grid-cols-12 gap-6">
          {/* Problem description */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold">{currentProblem.question}</h2>
                  <span className={`
                    text-sm font-medium px-2 py-1 rounded-full
                    ${currentProblem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                      currentProblem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'}
                  `}>
                    {currentProblem.difficulty}
                  </span>
                </div>
                
                {/* Navigation buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={goToPreviousQuestion}
                    disabled={currentProblemIndex === 0}
                    className="text-sm py-1 px-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-500">
                    {currentProblemIndex + 1} / {questions.length}
                  </span>
                  <Button
                    variant="outline"
                    onClick={goToNextQuestion}
                    disabled={currentProblemIndex === questions.length - 1}
                    className="text-sm py-1 px-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="prose max-w-none">
                <p className="whitespace-pre-line text-gray-700">
                  {currentProblem.description}
                </p>
                
                {/* We'll show test cases as examples since the structure is different */}
                <h3 className="text-lg font-semibold mt-6 mb-3">Sample Test Cases:</h3>
                {currentProblem.testCases.slice(0, 2).map((testCase, index) => (
                  <div key={index} className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                    <div className="mb-2">
                      <span className="font-bold text-sm">Test Case {index + 1}:</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs text-gray-500">Input:</div>
                        <div className="font-mono text-sm bg-white p-2 rounded border">
                          {testCase.input}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Expected Output:</div>
                        <div className="font-mono text-sm bg-white p-2 rounded border">
                          {testCase.expectedOutput}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Code editor and test cases */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden h-[500px]">
              <CodeEditor 
                language={selectedLanguage}
                code={code}
                onChange={setCode}
              />
            </div>
            
            <TestCases 
              testCases={currentProblem.testCases}
              results={results}
              onRunCode={handleRunCode}
              onSubmit={handleSubmitCode}
              isRunning={isRunning}
            />
          </div>
        </div>
      </div>

      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default CodingTestPage; 
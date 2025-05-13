import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Play, Square, Clock, ArrowRight, CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button';

// Mock interview questions
const mockQuestions = [
  "Tell me about your experience with React and how you've used it in previous projects.",
  "How do you handle state management in large-scale applications?",
  "Describe a challenging technical problem you solved recently.",
  "How do you approach testing in your frontend applications?",
  "What's your experience with TypeScript and how has it improved your development workflow?",
  "How do you stay updated with the latest web development trends and technologies?",
  "Describe your workflow when implementing a new feature from design to deployment.",
  "How do you optimize the performance of web applications?",
  "Tell me about a time when you had to refactor a significant portion of code. How did you approach it?",
  "How do you handle errors and debugging in your applications?",
];

const InterviewPage: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes per question
  const [completedQuestions, setCompletedQuestions] = useState<number[]>([]);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  
  const timerRef = useRef<number | null>(null);
  
  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);
  
  const startAnswering = () => {
    setIsAnswering(true);
    setIsRecording(true);
    
    // Start the timer
    timerRef.current = window.setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up, stop recording and move to next question
          stopAnswering();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const stopAnswering = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }
    
    setIsRecording(false);
    setIsAnswering(false);
    setCompletedQuestions([...completedQuestions, currentQuestionIndex]);
    
    // If this was the last question, end the session
    if (currentQuestionIndex === mockQuestions.length - 1) {
      setIsSessionComplete(true);
    }
  };
  
  const nextQuestion = () => {
    if (currentQuestionIndex < mockQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeRemaining(120); // Reset timer for new question
    } else {
      setIsSessionComplete(true);
    }
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Interview Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold">Frontend Developer Interview</h1>
              <p className="text-gray-600 text-sm">Mid-Level (4-7 years)</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-blue-50 text-blue-700 py-1 px-3 rounded-full text-sm font-medium flex items-center">
                <Clock className="w-4 h-4 mr-1.5" />
                <span>Question {currentQuestionIndex + 1} of {mockQuestions.length}</span>
              </div>
              
              {isAnswering && (
                <div className="bg-red-50 text-red-700 py-1 px-3 rounded-full text-sm font-medium flex items-center">
                  <div className="w-2 h-2 bg-red-600 rounded-full mr-1.5 animate-pulse"></div>
                  <span>Recording</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 container mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">
        {/* Question Panel */}
        <div className="md:w-3/4 space-y-6">
          {isSessionComplete ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="bg-green-100 text-green-700 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={36} />
              </div>
              <h2 className="text-2xl font-bold mb-4">Interview Complete!</h2>
              <p className="text-gray-600 mb-8">
                Congratulations on completing your interview session. 
                Your responses are being analyzed and feedback will be available shortly.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button variant="outline">
                  Review Answers
                </Button>
                <Button>
                  View Feedback
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Question {currentQuestionIndex + 1}</h2>
                <p className="text-xl">{mockQuestions[currentQuestionIndex]}</p>
              </div>
              
              {/* Timer */}
              <div className={`${
                timeRemaining < 30 ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
              } py-2 px-4 rounded-lg inline-flex items-center mb-6`}>
                <Clock className={`w-5 h-5 mr-2 ${timeRemaining < 30 ? 'animate-pulse' : ''}`} />
                <span className="font-medium">{formatTime(timeRemaining)}</span>
              </div>
              
              <div className="flex space-x-4">
                {!isAnswering ? (
                  <Button
                    onClick={startAnswering}
                    className="flex items-center"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Recording
                  </Button>
                ) : (
                  <Button
                    variant="danger"
                    onClick={stopAnswering}
                    className="flex items-center"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop Recording
                  </Button>
                )}
                
                {completedQuestions.includes(currentQuestionIndex) && (
                  <Button
                    variant="outline"
                    onClick={nextQuestion}
                    className="flex items-center"
                  >
                    Next Question
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {!isSessionComplete && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Tips</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">1</span>
                  <span>Speak clearly and at a moderate pace.</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">2</span>
                  <span>Structure your answer with an introduction, key points, and a conclusion.</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">3</span>
                  <span>Use specific examples from your experience to support your answers.</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">4</span>
                  <span>Focus on demonstrating problem-solving and communication skills.</span>
                </li>
              </ul>
            </div>
          )}
        </div>
        
        {/* Question List */}
        <div className="md:w-1/4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Question Progress</h3>
            <div className="space-y-2">
              {mockQuestions.map((question, index) => (
                <button
                  key={index}
                  className={`w-full text-left py-2 px-3 rounded-md transition-colors ${
                    currentQuestionIndex === index
                      ? 'bg-blue-100 text-blue-700'
                      : completedQuestions.includes(index)
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-50 text-gray-700'
                  }`}
                  onClick={() => {
                    if (!isAnswering) {
                      setCurrentQuestionIndex(index);
                      setTimeRemaining(120);
                    }
                  }}
                  disabled={isAnswering}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full mr-2 flex items-center justify-center text-xs ${
                      currentQuestionIndex === index
                        ? 'bg-blue-600 text-white'
                        : completedQuestions.includes(index)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {completedQuestions.includes(index) ? (
                        <CheckCircle size={12} />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className="truncate text-sm">
                      {question.length > 40 ? `${question.substring(0, 40)}...` : question}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;
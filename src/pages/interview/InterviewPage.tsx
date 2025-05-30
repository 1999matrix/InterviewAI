import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Clock, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

// API Configuration
const API_BASE = 'http://192.168.1.73:7777/api/v1';

// Mock questions fallback
const MOCK_QUESTIONS = [
  "Tell me about your experience with React and how you've used it in previous projects.",
  "How do you handle state management in large-scale applications?",
  "Describe a challenging technical problem you solved recently.",
  "How do you approach testing in your frontend applications?",
];

// Button Component
type ButtonProps = {
  children: React.ReactNode;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  variant?: 'primary' | 'danger' | 'outline';
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

// Recording Animation Component
type RecordingAnimationProps = {
  isRecording: boolean;
  size?: 'small' | 'large';
};
const RecordingAnimation: React.FC<RecordingAnimationProps> = ({ isRecording, size = 'large' }) => {
  const sizeClasses: Record<'small' | 'large', string> = {
    small: 'w-3 h-3',
    large: 'w-24 h-24'
  };

  if (!isRecording) return null;

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} relative`}>
        {/* Pulsing circles */}
        <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
        <div className="absolute inset-2 bg-red-500 rounded-full animate-ping opacity-40 animation-delay-75"></div>
        <div className="absolute inset-4 bg-red-600 rounded-full animate-pulse"></div>
        
        {/* Center microphone icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Mic className="w-6 h-6 text-white" />
        </div>
      </div>
      
      {size === 'large' && (
        <div className="ml-4">
          <div className="text-red-600 font-semibold animate-pulse">Recording...</div>
          <div className="text-sm text-gray-500">Speak clearly into your microphone</div>
        </div>
      )}
    </div>
  );
};

// Live Speech Indicator
type LiveSpeechIndicatorProps = {
  transcript: string;
  isListening: boolean;
};
const LiveSpeechIndicator: React.FC<LiveSpeechIndicatorProps> = ({ transcript, isListening }) => {
  if (!isListening || !transcript) return null;

  return (
    <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg animate-fadeIn">
      <div className="flex items-center mb-2">
        <div className="flex space-x-1 mr-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce animation-delay-100"></div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce animation-delay-200"></div>
        </div>
        <span className="font-medium text-green-800">Live Speech Recognition</span>
      </div>
      <p className="text-green-700 italic">"{transcript}"</p>
    </div>
  );
};

// Custom Hook for API calls
const useInterviewAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callAPI = useCallback(async (endpoint: string, params: any, method: 'GET' | 'POST' = 'GET') => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      if (method === 'GET') {
        response = await axios.get(`${API_BASE}/${endpoint}`, { params });
      } else {
        response = await axios.post(`${API_BASE}/${endpoint}`, params);
      }
      return response.data;
    } catch (err: unknown) {
      let errorMessage = 'An unexpected error occurred';
      if (typeof err === 'object' && err !== null) {
        if ('response' in err && (err as any).response?.data) {
          errorMessage = (err as any).response.data.error || (err as any).response.data.message || errorMessage;
        } else if ('message' in err) {
          errorMessage = (err as any).message;
        }
      }
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { callAPI, loading, error, setError };
};

// Custom Hook for Speech Recognition
const useSpeechRecorder = () => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition();

  const [isRecording, setIsRecording] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');

  const startRecording = useCallback(() => {
    if (!browserSupportsSpeechRecognition || !isMicrophoneAvailable) {
      throw new Error('Speech recognition not available');
    }

    resetTranscript();
    setFinalTranscript('');
    setIsRecording(true);
    
    SpeechRecognition.startListening({ 
      continuous: true,
      language: 'en-US'
    });
  }, [browserSupportsSpeechRecognition, isMicrophoneAvailable, resetTranscript]);

  const stopRecording = useCallback(() => {
    SpeechRecognition.stopListening();
    setIsRecording(false);
    setFinalTranscript(transcript);
  }, [transcript]);

  return {
    transcript,
    listening,
    isRecording,
    finalTranscript,
    startRecording,
    stopRecording,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  };
};

// Main Interview Component
const InterviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};
  
  // State management
  const [questions, setQuestions] = useState(() => {
    if (state.question) {
      try {
        return Array.isArray(state.question) ? state.question : 
               typeof state.question === 'string' ? JSON.parse(state.question) : 
               [state.question];
      } catch {
        return [state.question];
      }
    }
    return MOCK_QUESTIONS;
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [completedQuestions, setCompletedQuestions] = useState<number[]>([]);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [answerText, setAnswerText] = useState('');

  const interviewMode = state.interviewMode || 'comp2';
  const username = state.user || 'guest';
  const interviewType = state.interviewType || 'technical';

  // Custom hooks
  const { callAPI, loading, error, setError } = useInterviewAPI();
  const {
    transcript,
    listening,
    isRecording,
    finalTranscript,
    startRecording,
    stopRecording,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecorder();

  // Timer management
  const timerRef = useRef<number | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Next question handling (move this up so it can be referenced in startTimer)
  const handleNextQuestion = useCallback(async () => {
    const responseText = answerText;
    if (!responseText.trim()) {
      setError('Please provide an answer before proceeding.');
      return;
    }
    try {
      let result: any;
      if (interviewMode === 'comp2') {
        result = await callAPI('get_next_question_comp2', {
          username,
          text: responseText
        });
        if (result.next_question_id) {
          setQuestions((prev: string[]) => [...prev, result.next_question_id]);
          setCurrentQuestionIndex((prev: number) => prev + 1);
        } else if (result.message?.includes('No more questions')) {
          setIsSessionComplete(true);
          return;
        }
      } else if (interviewMode === 'comp3') {
        result = await callAPI('get_next_question_comp3', {
          username,
          response: responseText
        }, 'POST');
        if (result.status === 'completed') {
          setIsSessionComplete(true);
          return;
        } else if (result.status === 'success' && result.next_question) {
          setQuestions((prev: string[]) => [...prev, result.next_question]);
          setCurrentQuestionIndex((prev: number) => prev + 1);
        }
      }
      // Reset state for next question
      setTimeRemaining(120);
      setAnswerText('');
      resetTranscript();
    } catch (err: unknown) {
      // Error is handled by the hook
      if (err instanceof Error) {
        console.error('Next question error:', err.message);
      } else {
        console.error('Next question error:', err);
      }
    }
  }, [answerText, interviewMode, username, callAPI, resetTranscript]);

  const startTimer = useCallback(() => {
    timerRef.current = window.setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleStopAnswering();
          // Auto-submit and move to next question or finish
          setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
              handleNextQuestion();
            } else {
              setIsSessionComplete(true);
            }
          }, 500); // slight delay to ensure transcript is finalized
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [currentQuestionIndex, questions.length, handleNextQuestion]);

  // Answer handling
  const handleStartAnswering = useCallback(async () => {
    try {
      setIsAnswering(true);
      setError(null);
      await startRecording();
      startTimer();
    } catch (err: unknown) {
      setError((err as Error).message);
      setIsAnswering(false);
    }
  }, [startRecording, startTimer, setError]);
  const handleStopAnswering = useCallback(() => {
    stopTimer();
    stopRecording();
    setIsAnswering(false);
    setCompletedQuestions((prev: number[]) =>
      prev.includes(currentQuestionIndex) ? prev : [...prev, currentQuestionIndex]
    );
    console.log('Transcript (should update soon):', transcript);
  }, [stopTimer, stopRecording, currentQuestionIndex, transcript]);

  // Set answerText when transcript updates and not answering
  useEffect(() => {
    if (!isAnswering && transcript.trim()) {
      setAnswerText(transcript);
    }
  }, [isAnswering, transcript]);

  // View feedback
  const handleViewFeedback = useCallback(async () => {
    try {
      const endpoint = interviewMode === 'comp2' ? 'get_user_result_comp2' : 'get_feedback';
      const result: any = await callAPI(endpoint, { username });
      console.log('Feedback:', result);
      // navigate('/feedback', { state: { feedback: result } });
    } catch (err: unknown) {
      // Error handled by hook
    }
  }, [interviewMode, username, callAPI]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer();
      if (isRecording) {
        stopRecording();
      }
    };
  }, [stopTimer, isRecording, stopRecording]);

  // Format time
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Toast for transcribing
  const TranscribingToast = () => (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fadeIn">
        <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        Transcribing...
      </div>
    </div>
  );

  // Browser support check
  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Speech Recognition Not Supported</h2>
          <p className="text-gray-600 mb-6">
            Please use Chrome, Edge, or Safari for the best experience.
          </p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Transcribing Toast */}
      {listening && <TranscribingToast />}

      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold">
                {interviewType === 'coding' ? 'Coding & Technical' : 'Theory & Behavioral'} Interview
              </h1>
              <p className="text-gray-600 text-sm">{username} - {interviewMode.toUpperCase()}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-blue-50 text-blue-700 py-1 px-3 rounded-full text-sm font-medium flex items-center">
                <Clock className="w-4 h-4 mr-1.5" />
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              
              {isRecording && (
                <div className="bg-red-50 text-red-700 py-1 px-3 rounded-full text-sm font-medium flex items-center">
                  <RecordingAnimation isRecording={true} size="small" />
                  <span className="ml-2">Recording</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 flex gap-8">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {isSessionComplete ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">Interview Complete!</h2>
              <p className="text-gray-600 mb-8">
                Your responses are being analyzed and feedback will be available shortly.
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => {}}>Review Answers</Button>
                <Button onClick={handleViewFeedback} disabled={loading}>
                  {loading ? 'Loading...' : 'View Feedback'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">
                  Question {currentQuestionIndex + 1}
                </h2>
                <p className="text-xl">{questions[currentQuestionIndex]}</p>
              </div>
              
              {/* Timer */}
              <div className={`${
                timeRemaining < 30 ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
              } py-2 px-4 rounded-lg inline-flex items-center mb-6`}>
                <Clock className={`w-5 h-5 mr-2 ${timeRemaining < 30 ? 'animate-pulse' : ''}`} />
                <span className="font-medium">{formatTime(timeRemaining)}</span>
              </div>
              
              {/* Recording Animation */}
              {isRecording && (
                <div className="mb-6 text-center">
                  <RecordingAnimation isRecording={isRecording} size="large" />
                </div>
              )}
              
              {/* Live Speech */}
              <LiveSpeechIndicator transcript={transcript} isListening={listening} />
              
              {/* Always show current transcript (live or after stop) */}
              {(transcript || answerText) && (
                <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Current Transcript:</h4>
                  <p className="text-blue-700">"{listening ? transcript : answerText}"</p>
                </div>
              )}
              
              {/* Final Transcript Display */}
              {finalTranscript && !listening && (
                <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Final Speech Transcript:</h4>
                  <p className="text-blue-700">"{finalTranscript}"</p>
                </div>
              )}
              
              {/* Controls */}
              <div className="flex space-x-4">
                {!isAnswering ? (
                  <Button
                    onClick={handleStartAnswering}
                    disabled={!isMicrophoneAvailable}
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Start Recording
                  </Button>
                ) : (
                  <Button
                    variant="danger"
                    onClick={handleStopAnswering}
                  >
                    <MicOff className="w-4 h-4 mr-2" />
                    Stop Recording
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={handleNextQuestion}
                  disabled={
                    loading || 
                    isAnswering || 
                    !answerText.trim()
                  }
                >
                  {loading ? 'Loading...' : 'Next Question'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                {/* Finish Button */}
                <Button
                  variant="danger"
                  onClick={async () => {
                    setIsSessionComplete(true);
                    // Call result API
                    try {
                      const endpoint = interviewMode === 'comp2' ? 'get_user_result_comp2' : 'get_feedback';
                      const result: any = await callAPI(endpoint, { username });
                      alert('Test finished! Result: ' + JSON.stringify(result));
                    } catch (err) {
                      alert('Test finished! (Could not fetch result)');
                    }
                  }}
                  disabled={isSessionComplete}
                >
                  Finish
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Question Progress</h3>
            <div className="space-y-2">
              {questions.map((question: string, index: number) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg transition-all ${
                    currentQuestionIndex === index
                      ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                      : completedQuestions.includes(index)
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center text-xs ${
                      currentQuestionIndex === index
                        ? 'bg-blue-600 text-white'
                        : completedQuestions.includes(index)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {completedQuestions.includes(index) ? (
                        <CheckCircle size={12} />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className="text-sm truncate">
                      {question.length > 35 ? `${question.substring(0, 35)}...` : question}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Recording Tips */}
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Recording Tips</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 text-xs">1</span>
                <span>Ensure quiet environment</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 text-xs">2</span>
                <span>Speak clearly and at moderate pace</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 text-xs">3</span>
                <span>Watch live transcript for accuracy</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg shadow-lg max-w-md">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <style>{`
        .animation-delay-75 {
          animation-delay: 75ms;
        }
        .animation-delay-100 {
          animation-delay: 100ms;
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
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

export default InterviewPage;
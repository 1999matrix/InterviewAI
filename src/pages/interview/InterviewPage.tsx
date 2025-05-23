import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Play, Square, Clock, ArrowRight, CheckCircle, Send } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useLocation, useNavigate } from 'react-router-dom';
import { getNextQuestionComp2, getNextQuestionComp3, getUserResultComp2, getFeedback } from '../../services/Sharedservice';
import axios from 'axios';

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

interface LocationState {
  question?: string[] | string;
  interviewType?: string;
  user?: string;
  interviewMode?: string;
}

const InterviewPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  // Process questions from API or use mock questions
  const processQuestions = () => {
    if (state?.question) {
      if (Array.isArray(state.question)) {
        return state.question;
      } else if (typeof state.question === 'string') {
        try {
          // If the API returns a JSON string, attempt to parse it
          const parsedQuestions = JSON.parse(state.question);
          return Array.isArray(parsedQuestions) ? parsedQuestions : [state.question];
        } catch (e) {
          // If parsing fails, treat it as a single question
          return [state.question];
        }
      }
    }
    return mockQuestions;
  };
  
  const [questions, setQuestions] = useState(processQuestions());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes per question
  const [completedQuestions, setCompletedQuestions] = useState<number[]>([]);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [interviewMode, setInterviewMode] = useState(state?.interviewMode || 'comp2');
  
  const timerRef = useRef<number | null>(null);
  
  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  // Initialize media recorder
  useEffect(() => {
    const initMediaRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            setAudioChunks((chunks) => [...chunks, e.data]);
          }
        };

        recorder.onstop = () => {
          // Speech recognition or sending to API could be done here
          console.log("Recording stopped, processing audio...");
        };

        setMediaRecorder(recorder);
      } catch (err) {
        console.error("Error accessing microphone:", err);
        setApiError("Could not access microphone. Please check your device settings.");
      }
    };

    initMediaRecorder();
  }, []);
  
  const startAnswering = () => {
    setIsAnswering(true);
    setIsRecording(true);
    setCurrentAnswer('');
    setAudioChunks([]);
    setAudioUrl(null);
    if (mediaRecorder && mediaRecorder.state !== 'recording') {
      mediaRecorder.start();
    }
    timerRef.current = window.setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
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
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
    setIsRecording(false);
    setIsAnswering(false);
    setCompletedQuestions((prev) => prev.includes(currentQuestionIndex) ? prev : [...prev, currentQuestionIndex]);
    // Do NOT end session here; let nextQuestion handle it
  };
  
  // Handle audio blob and create URL for playback
  useEffect(() => {
    if (audioChunks.length > 0) {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      setAudioUrl(URL.createObjectURL(audioBlob));
    }
  }, [audioChunks]);
  
  // Utility to convert Blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result?.toString().split(',')[1];
        resolve(base64data || '');
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };
  
  const nextQuestion = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      let result;
      let audioBlob = audioChunks.length > 0 ? new Blob(audioChunks, { type: 'audio/webm' }) : null;
      let payload: any = { username: state?.user || 'guest' };
      if (audioBlob) {
        const base64Audio = await blobToBase64(audioBlob);
        payload.audio = base64Audio;
      }
      if (currentAnswer) {
        payload.text = currentAnswer;
      }
      if (interviewMode === 'comp2') {
        result = await axios.post('http://192.168.1.62:7777/api/v1/get_next_question_comp2', payload, {
          headers: { 'Content-Type': 'application/json' }
        });
        if (result.status === 200 && result.data.next_question_id) {
          setQuestions([...questions, result.data.next_question_id]);
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setTimeRemaining(120);
          setCurrentAnswer('');
          setAudioChunks([]);
          setAudioUrl(null);
          return;
        } else if (result.data.message && result.data.message.includes('No more questions')) {
          setIsSessionComplete(true);
        }
      } else if (interviewMode === 'comp3') {
        result = await axios.post('http://192.168.1.62:7777/api/v1/get_next_question_comp3', payload, {
          headers: { 'Content-Type': 'application/json' }
        });
        if (result.status === 200 && result.data.next_question) {
          setQuestions([...questions, result.data.next_question]);
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setTimeRemaining(120);
          setCurrentAnswer('');
          setAudioChunks([]);
          setAudioUrl(null);
          return;
        } else if (result.data.status === 'completed') {
          setIsSessionComplete(true);
        }
      }
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setTimeRemaining(120);
        setCurrentAnswer('');
        setAudioChunks([]);
        setAudioUrl(null);
      } else {
        setIsSessionComplete(true);
      }
    } catch (error: any) {
      setApiError(error.response?.data?.message || error.message || 'Failed to retrieve the next question.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // View feedback after completing the session
  const viewFeedback = async () => {
    setIsLoading(true);
    try {
      let result;
      if (interviewMode === 'comp2') {
        result = await getUserResultComp2('get_user_result_comp2', state?.user || 'guest');
      } else {
        result = await getFeedback('get_feedback', state?.user || 'guest');
      }
      if (result.status === 200) {
        // In a real app, you would navigate to a feedback page with the results
        console.log('Feedback received:', result.data);
        // navigate('/feedback', { state: { feedback: result.data } });
      }
    } catch (error) {
      setApiError('Failed to retrieve feedback. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle text answer input
  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentAnswer(e.target.value);
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Interview Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold">{state?.interviewType === 'coding' ? 'Coding & Technical' : 'Theory & Behavioral'} Interview</h1>
              <p className="text-gray-600 text-sm">{state?.user || 'Guest'}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-blue-50 text-blue-700 py-1 px-3 rounded-full text-sm font-medium flex items-center">
                <Clock className="w-4 h-4 mr-1.5" />
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
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
                <Button onClick={viewFeedback} disabled={isLoading}>
                  View Feedback
                </Button>
              </div>
              {apiError && (
                <p className="text-red-500 text-sm mt-3">{apiError}</p>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Question {currentQuestionIndex + 1}</h2>
                <p className="text-xl">{questions[currentQuestionIndex]}</p>
              </div>
              
              {/* Timer */}
              <div className={`${
                timeRemaining < 30 ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
              } py-2 px-4 rounded-lg inline-flex items-center mb-6`}>
                <Clock className={`w-5 h-5 mr-2 ${timeRemaining < 30 ? 'animate-pulse' : ''}`} />
                <span className="font-medium">{formatTime(timeRemaining)}</span>
              </div>
              
              {/* Text Answer Area - visible when answering */}
              {isAnswering && (
                <div className="mb-4">
                  <textarea
                    value={currentAnswer}
                    onChange={handleAnswerChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your answer here (optional - you can also just speak)..."
                    rows={4}
                    disabled={!isAnswering}
                  />
                </div>
              )}
              
              {audioUrl && (
                <div className="mb-4">
                  <audio controls src={audioUrl} />
                </div>
              )}
              
              <div className="flex space-x-4">
                {!isAnswering ? (
                  <Button
                    onClick={startAnswering}
                    className="flex items-center"
                    disabled={isSessionComplete || isLoading}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Recording
                  </Button>
                ) : (
                  <Button
                    variant="danger"
                    onClick={stopAnswering}
                    className="flex items-center"
                    disabled={isSessionComplete || isLoading}
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop Recording
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={nextQuestion}
                  className="flex items-center"
                  disabled={isLoading || isAnswering || isSessionComplete || completedQuestions.includes(currentQuestionIndex) === false}
                >
                  {isLoading ? 'Loading...' : 'Next Question'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              
              {apiError && (
                <p className="text-red-500 text-sm mt-3">{apiError}</p>
              )}
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
              {questions.map((question, index) => (
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
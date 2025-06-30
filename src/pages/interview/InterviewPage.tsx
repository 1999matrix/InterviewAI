import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Volume2, 
  VolumeX,
  Phone,
  PhoneOff,
  Settings,
  MoreHorizontal,
  User,
  Clock,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  FileText,
  Brain,
  Play,
  Pause,
  SkipForward,
  Square,
  RotateCcw
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { 
  startTestComp2, 
  startTestComp3, 
  getNextQuestionComp2,
  getNextQuestionComp3,
  getUserResultComp2,
  submitAudioResponseComp2,
  submitAudioResponseComp3,
  handleServerAudioResponse,
  playAudioFromServer,
  convertSpeechToText,
  sendTextResponse,
  serverUrl
} from '../../services/Sharedservice';

 interface InterviewState {
  question?: string;
  audioUrl?: string;
  interviewType: string;
  user: string;
  interviewMode: 'comp2' | 'comp3';
  role?: string;
  jobDescription?: string;
  experience?: number;
  uploadResume?: boolean;
}

interface AudioRecorderHook {
  isRecording: boolean;
  audioBlob: Blob | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  resetRecording: () => void;
  recordingTime: number;
  error: string | null;
} 

// Professional Audio Recorder Hook with high-quality recording
const useAudioRecorder = (): AudioRecorderHook => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      
      // Request high-quality audio stream with proper browser support detection
      let stream: MediaStream;
      
      const audioConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 44100,
        channelCount: 1,
      };
      
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Modern browsers
        stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
      } else {
        // Legacy browser support
        const legacyGetUserMedia = (navigator as any).webkitGetUserMedia 
                                 || (navigator as any).mozGetUserMedia 
                                 || (navigator as any).getUserMedia;
        
        if (!legacyGetUserMedia) {
          throw new Error('Your browser does not support audio recording. Please use a modern browser like Chrome, Firefox, or Safari.');
        }
        
        // Wrap legacy getUserMedia in a Promise
        stream = await new Promise<MediaStream>((resolve, reject) => {
          legacyGetUserMedia.call(navigator, 
            { audio: audioConstraints }, 
            resolve, 
            reject
          );
        });
      }

      streamRef.current = stream;
      chunksRef.current = [];

      // Check MediaRecorder support and choose best format
      if (!window.MediaRecorder) {
        throw new Error('Your browser does not support audio recording. Please use a modern browser.');
      }
      
      let options: MediaRecorderOptions = {};
      
      // Try different formats in order of preference
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options = { mimeType: 'audio/webm;codecs=opus', audioBitsPerSecond: 128000 };
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm', audioBitsPerSecond: 128000 };
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4', audioBitsPerSecond: 128000 };
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        options = { mimeType: 'audio/ogg', audioBitsPerSecond: 128000 };
      } else {
        // Fallback without specifying format
        options = { audioBitsPerSecond: 128000 };
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: options.mimeType || 'audio/webm' });
        setAudioBlob(audioBlob);
        
        // Cleanup
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.onerror = (event) => {
        setError('Recording failed. Please try again.');
        console.error('MediaRecorder error:', event);
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      setError(err.message || 'Failed to access microphone. Please check your browser permissions.');
      console.error('Recording error:', err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const resetRecording = useCallback(() => {
    setAudioBlob(null);
    setRecordingTime(0);
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    isRecording,
    audioBlob,
    startRecording,
    stopRecording,
    resetRecording,
    recordingTime,
    error
  };
};

// Professional Loading Component
const LoadingState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center space-y-4 p-8">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
    <p className="text-gray-600 text-sm font-medium">{message}</p>
  </div>
);

// Professional Audio Visualizer
const AudioVisualizer: React.FC<{ isActive: boolean; recordingTime: number }> = ({ 
  isActive, 
  recordingTime 
}) => {
  const [levels, setLevels] = useState(Array(20).fill(0));

  useEffect(() => {
    if (!isActive) {
      setLevels(Array(20).fill(0));
      return;
    }

    const interval = setInterval(() => {
      setLevels(prev => prev.map(() => Math.random() * 100));
    }, 100);

    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex items-end space-x-1 h-16">
        {levels.map((level, i) => (
          <div
            key={i}
            className={`w-1.5 bg-gradient-to-t from-blue-500 to-blue-400 rounded-full transition-all duration-100 ${
              isActive ? 'opacity-100' : 'opacity-30'
            }`}
            style={{ 
              height: isActive ? `${Math.max(8, (level / 100) * 64)}px` : '8px' 
            }}
          />
        ))}
      </div>
      {isActive && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="font-mono">{formatTime(recordingTime)}</span>
        </div>
      )}
    </div>
  );
};

// Professional Video Panel Component
const VideoPanel: React.FC<{ 
  isInterviewer?: boolean;
  isAudioEnabled: boolean; 
  isVideoEnabled: boolean;
  name: string;
  className?: string;
}> = ({ isInterviewer = false, isAudioEnabled, isVideoEnabled, name, className = "" }) => (
  <div className={`relative bg-gray-900 rounded-xl overflow-hidden ${className}`}>
    {isVideoEnabled ? (
      <div className="w-full h-full bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center">
        {isInterviewer ? (
          <div className="text-center">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Brain className="w-12 h-12 text-white" />
            </div>
            <div className="text-white text-sm font-medium">AI Interviewer</div>
          </div>
        ) : (
          <User className="w-20 h-20 text-white opacity-60" />
        )}
      </div>
    ) : (
      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
        <VideoOff className="w-16 h-16 text-gray-400" />
      </div>
    )}
    
    {/* Name Tag */}
    <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white px-3 py-1 rounded-md text-sm font-medium">
      {name}
    </div>
    
    {/* Audio Status */}
    <div className="absolute bottom-3 right-3">
      {isAudioEnabled ? (
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
          <Mic className="w-4 h-4 text-white" />
        </div>
      ) : (
        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
          <MicOff className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  </div>
);

// Question Display Component
const QuestionDisplay: React.FC<{
  question: string;
  questionNumber: number;
  totalQuestions?: number;
  onReplay: () => void;
  isPlaying: boolean;
}> = ({ question, questionNumber, totalQuestions, onReplay, isPlaying }) => (
  <div className="bg-white rounded-xl shadow-sm border p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Question {questionNumber}{totalQuestions && ` of ${totalQuestions}`}
        </h3>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onReplay}
        disabled={isPlaying}
        className="flex items-center space-x-2"
      >
        {isPlaying ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Playing...</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            <span>Replay</span>
          </>
        )}
      </Button>
    </div>
    
    <div className="prose prose-gray max-w-none">
      <p className="text-gray-800 text-lg leading-relaxed">{question}</p>
    </div>
  </div>
);

// Function to send audio data to backend
const sendAudioToBackend = async (username: string, audioBlob: Blob, interviewMode: 'comp2' | 'comp3'): Promise<any> => {
  try {
    if (interviewMode === 'comp2') {
      return await submitAudioResponseComp2(username, audioBlob);
    } else {
      return await submitAudioResponseComp3(username, audioBlob);
    }
  } catch (error) {
    throw new Error(`Failed to process audio response: ${error}`);
  }
};

// Main Interview Page Component
const InterviewPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as InterviewState || {};
  
  // Core State
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [questionNumber, setQuestionNumber] = useState(1);
  const [sessionActive, setSessionActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  
  // UI State
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isInterviewerAudioEnabled, setIsInterviewerAudioEnabled] = useState(true);
  
  // Loading States
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [isPlayingQuestion, setIsPlayingQuestion] = useState(false);
  
  // Error State
  const [error, setError] = useState<string | null>(null);

  // Interview Data
  const interviewMode = state.interviewMode || 'comp2';
  const username = state.user || 'guest';
  const interviewType = state.interviewType || 'Technical Interview';

  // Audio Recording Hook
  const {
    isRecording,
    audioBlob,
    startRecording,
    stopRecording,
    resetRecording,
    recordingTime,
    error: recordingError
  } = useAudioRecorder();

  // Initialize interview session
  useEffect(() => {
    const initializeInterview = async () => {
      if (!state.user) {
        navigate('/interview/create');
        return;
      }

      setIsInitializing(true);
      setError(null);

      try {
        // If we already have question and audioUrl from CreateSessionPage, use them
        if (state.question) {
          setCurrentQuestion(state.question);
          setCurrentAudioUrl(state.audioUrl || null);
          setSessionActive(true);
          
          // Auto-play the first question
          if (state.audioUrl && isInterviewerAudioEnabled) {
            setTimeout(() => {
              playQuestionAudio(state.audioUrl);
            }, 1000);
          }
        } else {
          // Fallback: Start a new session if no question was passed
          let result;
          if (interviewMode === 'comp2') {
            result = await startTestComp2(
              username,
              state.role || 'Software Developer',
              state.jobDescription || '',
              state.experience || 2,
              state.uploadResume || false
            );
          } else {
            result = await startTestComp3(
              username,
              state.role || 'Software Developer', 
              state.jobDescription || '',
              state.experience || 2,
              state.uploadResume || false
            );
          }

          if (result && result.status === 200) {
            // Handle server audio response
            const { questionText, audioUrl } = await handleServerAudioResponse(result);
            
            if (questionText) {
              setCurrentQuestion(questionText);
              setCurrentAudioUrl(audioUrl || null);
              setSessionActive(true);
              
              // Auto-play the first question
              if (audioUrl && isInterviewerAudioEnabled) {
                setTimeout(() => {
                  playQuestionAudio(audioUrl);
                }, 1000);
              }
            } else {
              throw new Error('No question received from server');
            }
          } else {
            throw new Error('Failed to start interview session');
          }
        }
      } catch (error: any) {
        console.error('Failed to initialize interview:', error);
        setError(error.message || 'Failed to start interview. Please try again.');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeInterview();
  }, []);

  // Timer Effect
  useEffect(() => {
    if (!sessionActive) return;
    
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionActive]);

  // Format time helper
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Play question audio
  const playQuestionAudio = useCallback(async (audioUrl?: string) => {
    if (!isInterviewerAudioEnabled) return;
    
    const urlToPlay = audioUrl || currentAudioUrl;
    if (!urlToPlay) return;
    
    setIsPlayingQuestion(true);
    
    try {
      await playAudioFromServer(urlToPlay);
    } catch (error) {
      console.warn('Failed to play audio:', error);
    } finally {
      setIsPlayingQuestion(false);
    }
  }, [isInterviewerAudioEnabled, currentAudioUrl]);

  // Submit answer and get next question
  const handleSubmitAnswer = async (skipAnswer: boolean = false) => {
    setIsSubmittingAnswer(true);
    setError(null);

    try {
      let textResponse = '';
      
      if (skipAnswer) {
        textResponse = "User skipped this question.";
      } else if (audioBlob) {
        // Convert audio to text first
        textResponse = await convertSpeechToText(audioBlob);
        console.log('Converted speech to text:', textResponse);
      } else {
        textResponse = "No response provided.";
      }
      
      const result = await sendTextResponse(username, textResponse, interviewMode);

      if (result && result.status === 200) {
        // Check if it's a completion response (JSON)
        if (result.headers['content-type']?.includes('application/json')) {
          // Parse JSON response for completion
          const jsonResponse = JSON.parse(await result.data.text());
          if (jsonResponse.status === 'completed') {
            setSessionActive(false);
            return;
          }
        }
        
        // Handle server audio response
        const { questionText, audioUrl } = await handleServerAudioResponse(result);
        
        if (questionText) {
          setCurrentQuestion(questionText);
          setCurrentAudioUrl(audioUrl || null);
          setQuestionNumber(prev => prev + 1);
          resetRecording();
          
          // Auto-play the next question
          if (audioUrl && isInterviewerAudioEnabled) {
            setTimeout(() => {
              playQuestionAudio(audioUrl);
            }, 500);
          }
        } else {
          // Interview completed
          setSessionActive(false);
        }
      } else {
        throw new Error('Failed to get next question');
      }
    } catch (error: any) {
      console.error('Error in handleSubmitAnswer:', error);
      if (error.message?.includes('completed') || error.message?.includes('No more questions')) {
        setSessionActive(false);
      } else {
        setError(error.message || 'Failed to submit answer. Please try again.');
      }
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  // Skip current question
  const handleSkipQuestion = () => {
    handleSubmitAnswer(true);
  };

  // Submit with audio response
  const handleSubmitWithAudio = () => {
    handleSubmitAnswer(false);
  };

  // End interview
  const handleEndInterview = async () => {
    if (!confirm('Are you sure you want to end the interview? Your progress will be saved.')) {
      return;
    }

    setIsSubmittingAnswer(true);
    try {
      await getUserResultComp2('get_user_result_comp2', username);
      setSessionActive(false);
      navigate('/dashboard', { 
        state: { message: 'Interview completed successfully!' }
      });
    } catch (error: any) {
      setError('Failed to end interview. Please try again.');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  // Recording handlers
  const handleStartRecording = async () => {
    setError(null);
    resetRecording();
    await startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  // Show loading screen during initialization
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <LoadingState message="Initializing your interview session..." />
        </div>
      </div>
    );
  }

  // Show error screen if initialization failed
  if (error && !sessionActive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Interview Setup Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button onClick={() => window.location.reload()} className="w-full">
              Try Again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/interview/create')} 
              className="w-full"
            >
              Back to Setup
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show completion screen
  if (!sessionActive && !isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Interview Completed!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for completing the interview. Your responses have been analyzed.
          </p>
          <Button onClick={() => navigate('/dashboard')} className="w-full">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Brain className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">AI Interview</h1>
                <p className="text-sm text-gray-500">{interviewType}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="font-mono">{formatTime(timeElapsed)}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEndInterview}
                disabled={isSubmittingAnswer}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <PhoneOff className="w-4 h-4 mr-2" />
                End Interview
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Interview Interface */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
            
            {/* Video Section */}
            <div className="xl:col-span-2 space-y-4">
              {/* Interviewer (AI) Video */}
              <VideoPanel
                isInterviewer={true}
                isAudioEnabled={isInterviewerAudioEnabled}
                isVideoEnabled={true}
                name="AI Interviewer"
                className="h-64"
              />
              
              {/* Candidate Video */}
              <VideoPanel
                isAudioEnabled={isAudioEnabled}
                isVideoEnabled={isVideoEnabled}
                name={username}
                className="h-64"
              />
              
              {/* Media Controls */}
              <div className="flex items-center justify-center space-x-4 py-4">
                <Button
                  variant={isAudioEnabled ? "primary" : "outline"}
                  size="lg"
                  onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                  className={`w-12 h-12 rounded-full ${!isAudioEnabled ? 'bg-red-500 hover:bg-red-600' : ''}`}
                >
                  {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5 text-white" />}
                </Button>
                
                <Button
                  variant={isVideoEnabled ? "primary" : "outline"}
                  size="lg"
                  onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                  className={`w-12 h-12 rounded-full ${!isVideoEnabled ? 'bg-red-500 hover:bg-red-600' : ''}`}
                >
                  {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5 text-white" />}
                </Button>
                
                <Button
                  variant={isInterviewerAudioEnabled ? "primary" : "outline"}
                  size="lg"
                  onClick={() => setIsInterviewerAudioEnabled(!isInterviewerAudioEnabled)}
                  className="w-12 h-12 rounded-full"
                  title="Interviewer Audio"
                >
                  {isInterviewerAudioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </Button>
              </div>
            </div>
            
            {/* Question & Recording Panel */}
            <div className="space-y-6">
              {/* Current Question */}
              <QuestionDisplay
                question={currentQuestion}
                questionNumber={questionNumber}
                onReplay={() => playQuestionAudio()}
                isPlaying={isPlayingQuestion}
              />
              
              {/* Recording Interface */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Response</h3>
                
                {/* Audio Visualizer */}
                <div className="mb-6">
                  <AudioVisualizer isActive={isRecording} recordingTime={recordingTime} />
                </div>
                
                {/* Recording Controls */}
                <div className="space-y-4">
                  {!isRecording && !audioBlob && (
                    <div className="space-y-3">
                      <Button
                        onClick={handleStartRecording}
                        disabled={isSubmittingAnswer || isPlayingQuestion}
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                      >
                        <Mic className="w-5 h-5 mr-2" />
                        Start Recording
                      </Button>
                      
                      {/* Skip Button - Always available */}
                      <Button
                        onClick={handleSkipQuestion}
                        disabled={isSubmittingAnswer}
                        variant="outline"
                        className="w-full h-12 border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        <SkipForward className="w-5 h-5 mr-2" />
                        Skip Question
                      </Button>
                    </div>
                  )}
                  
                  {isRecording && (
                    <Button
                      onClick={handleStopRecording}
                      className="w-full h-12 bg-red-600 hover:bg-red-700"
                    >
                      <Square className="w-5 h-5 mr-2" />
                      Stop Recording
                    </Button>
                  )}
                  
                  {audioBlob && !isRecording && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium text-green-800">
                            Recording Complete ({formatTime(recordingTime)})
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetRecording}
                          className="text-gray-600"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          onClick={handleSubmitWithAudio}
                          disabled={isSubmittingAnswer}
                          className="h-12 bg-green-600 hover:bg-green-700"
                        >
                          {isSubmittingAnswer ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Send className="w-5 h-5 mr-2" />
                              Submit Answer
                            </>
                          )}
                        </Button>
                        
                        <Button
                          onClick={handleSkipQuestion}
                          disabled={isSubmittingAnswer}
                          variant="outline"
                          className="h-12 border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          <SkipForward className="w-5 h-5 mr-2" />
                          Skip Question
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Error Display */}
                {(error || recordingError) && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="text-sm text-red-800">{error || recordingError}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Interview Progress */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview Progress</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Current Question</span>
                    <span className="font-medium">{questionNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Time Elapsed</span>
                    <span className="font-medium">{formatTime(timeElapsed)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Interview Mode</span>
                    <span className="font-medium">
                      {interviewMode === 'comp2' ? 'Standard' : 'Cross-Questioning'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InterviewPage;
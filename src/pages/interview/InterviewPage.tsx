import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Play, 
  Pause, 
  SkipForward, 
  Square, 
  Volume2, 
  VolumeX,
  PhoneOff,
  RotateCcw,
  Send,
  Loader,
  Wifi,
  WifiOff,
  User,
  Bot,
  Circle
} from 'lucide-react';
import { 
  WebSocketInterviewManager,
  getNextQuestionComp2, 
  getUserResultComp2,
  handleServerAudioResponse,
  speakText,
  stopSpeaking
} from '../../services/Sharedservice';
import Button from '../../components/ui/Button';

interface InterviewState {
  interviewType: string;
  user: string;
  interviewMode: 'comp2' | 'comp3';
  role: string;
  jobDescription: string;
  experience: number;
  uploadResume: boolean;
  question?: string;
  audioUrl?: string;
}

interface Question {
  text: string;
  audioUrl?: string;
  questionNumber: number;
}

const InterviewPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get interview state from navigation
  const interviewState = location.state as InterviewState;
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const wsManagerRef = useRef<WebSocketInterviewManager | null>(null);
  
  // State management
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [userResponse, setUserResponse] = useState('');
  const [questionCount, setQuestionCount] = useState(0);
  const [totalQuestions] = useState(10); // Default total questions
  const [error, setError] = useState<string | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  // Initialize media devices
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        setMediaStream(stream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing media devices:', error);
        setError('Unable to access camera or microphone. Please check permissions.');
      }
    };
    
    initializeMedia();
    
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Initialize interview based on mode
  useEffect(() => {
    if (!interviewState) {
      navigate('/interview/create-session');
      return;
    }

    if (interviewState.interviewMode === 'comp3') {
      initializeWebSocketInterview();
    } else {
      initializeHttpInterview();
    }

    return () => {
      // Cleanup
      if (wsManagerRef.current) {
        wsManagerRef.current.disconnect();
      }
      stopSpeaking();
    };
  }, [interviewState]);

  // WebSocket Interview Initialization (comp3)
  const initializeWebSocketInterview = useCallback(async () => {
    try {
      setIsLoading(true);
      setConnectionStatus('connecting');
      
      const wsManager = new WebSocketInterviewManager();
      wsManagerRef.current = wsManager;
      
      // Set up message handlers
      wsManager.onMessage((data) => {
        handleWebSocketMessage(data);
      });
      
      wsManager.onClose(() => {
        setConnectionStatus('disconnected');
        setError('Connection lost. Please try reconnecting.');
      });
      
      wsManager.onError((error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('disconnected');
        setError('Connection error occurred.');
      });
      
      // Connect to WebSocket
      await wsManager.connect(interviewState.user);
      setConnectionStatus('connected');
      
      // Start the interview
      wsManager.startInterview({
        role: interviewState.role,
        job_description: interviewState.jobDescription,
        experience: interviewState.experience,
        cv_flag: interviewState.uploadResume
      });
      
    } catch (error) {
      console.error('Failed to initialize WebSocket interview:', error);
      setError('Failed to start interview. Please try again.');
      setConnectionStatus('disconnected');
    } finally {
      setIsLoading(false);
    }
  }, [interviewState]);

  // HTTP Interview Initialization (comp2)
  const initializeHttpInterview = useCallback(async () => {
    try {
      setIsLoading(true);
      setConnectionStatus('connected');
      
      // Use the first question from CreateSessionPage if available
      if (interviewState.question && interviewState.audioUrl) {
        const question: Question = {
          text: interviewState.question,
          audioUrl: interviewState.audioUrl,
          questionNumber: 1
        };
        
        setCurrentQuestion(question);
        setQuestionCount(1);
        
        // Auto-play the question audio
        setTimeout(() => {
          playQuestionAudio(question);
        }, 1000);
      }
      
    } catch (error) {
      console.error('Failed to initialize HTTP interview:', error);
      setError('Failed to start interview. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [interviewState]);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((data: any) => {
    console.log('WebSocket message received:', data);
    
    switch (data.type) {
      case 'question':
        const question: Question = {
          text: data.text,
          audioUrl: data.audio ? createAudioUrl(data.audio) : undefined,
          questionNumber: data.question_number || questionCount + 1
        };
        
        setCurrentQuestion(question);
        setQuestionCount(data.question_number || questionCount + 1);
        setIsLoading(false);
        
        // Auto-play question audio
        if (question.audioUrl) {
          setTimeout(() => {
            playQuestionAudio(question);
          }, 500);
        }
        break;
        
      case 'typing':
        setIsLoading(data.is_typing);
        break;
        
      case 'completed':
        setInterviewCompleted(true);
        setFinalScore(data.final_score);
        setIsLoading(false);
        break;
        
      case 'error':
        setError(data.message || 'An error occurred during the interview.');
        setIsLoading(false);
        break;
        
      default:
        console.log('Unknown message type:', data.type);
    }
  }, [questionCount]);

  // Create audio URL from base64 data
  const createAudioUrl = (audioData: string): string => {
    try {
      const byteCharacters = atob(audioData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/mpeg' });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error creating audio URL:', error);
      return '';
    }
  };

  // Play question audio
  const playQuestionAudio = useCallback(async (question: Question) => {
    try {
      if (question.audioUrl && !isAudioMuted) {
        setIsAudioPlaying(true);
        setIsAISpeaking(true);
        
        if (audioRef.current) {
          audioRef.current.src = question.audioUrl;
          await audioRef.current.play();
        }
      } else if (question.text && !isAudioMuted) {
        // Fallback to text-to-speech
        setIsAISpeaking(true);
        await speakText(question.text);
        setIsAISpeaking(false);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsAISpeaking(false);
    }
  }, [isAudioMuted]);
  
  // Handle audio ended
  const handleAudioEnded = useCallback(() => {
    setIsAudioPlaying(false);
    setIsAISpeaking(false);
  }, []);

  // Toggle audio playback
  const toggleAudioPlayback = useCallback(() => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
        setIsAudioPlaying(false);
        setIsAISpeaking(false);
      } else {
        audioRef.current.play();
        setIsAudioPlaying(true);
        setIsAISpeaking(true);
      }
    }
  }, [isAudioPlaying]);

  // Replay current question
  const replayQuestion = useCallback(() => {
    if (currentQuestion) {
      playQuestionAudio(currentQuestion);
    }
  }, [currentQuestion, playQuestionAudio]);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      if (!mediaStream) return;
      
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(mediaStream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Failed to start recording. Please check microphone permissions.');
    }
  }, [mediaStream]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // Handle next question (comp2)
  const getNextQuestionHttp = useCallback(async (responseText?: string) => {
    try {
      setIsLoading(true);
      
      const response = await getNextQuestionComp2(
        interviewState.user,
        responseText || ''
      );
      
      if (response.data.status === 'completed') {
        setInterviewCompleted(true);
        return;
      }
      
      const { questionText, audioUrl } = await handleServerAudioResponse(response);
      
      const question: Question = {
        text: questionText,
        audioUrl: audioUrl,
        questionNumber: questionCount + 1
      };
      
      setCurrentQuestion(question);
      setQuestionCount(prev => prev + 1);
      
      // Auto-play the new question
      setTimeout(() => {
        playQuestionAudio(question);
      }, 500);
      
    } catch (error: any) {
      console.error('Error getting next question:', error);
      if (error.message.includes('completed')) {
        setInterviewCompleted(true);
      } else {
        setError('Failed to get next question. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [interviewState.user, questionCount, playQuestionAudio]);

  // Submit response (comp3)
  const submitResponseWebSocket = useCallback((responseText: string) => {
    if (wsManagerRef.current && responseText.trim()) {
      setIsLoading(true);
      wsManagerRef.current.sendResponse(responseText);
      setUserResponse('');
    }
  }, []);

  // Skip question (comp2)
  const skipQuestion = useCallback(() => {
    getNextQuestionHttp('User skipped this question');
  }, [getNextQuestionHttp]);

  // End interview
  const endInterview = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (interviewState.interviewMode === 'comp3' && wsManagerRef.current) {
        wsManagerRef.current.endInterview();
      } else if (interviewState.interviewMode === 'comp2') {
        // Get final results for comp2
        const results = await getUserResultComp2('get_user_result_comp2', interviewState.user);
        console.log('Interview results:', results.data);
      }
      
      setInterviewCompleted(true);
    } catch (error) {
      console.error('Error ending interview:', error);
      setError('Failed to end interview properly.');
    } finally {
      setIsLoading(false);
    }
  }, [interviewState]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (mediaStream) {
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, [mediaStream]);

  // Toggle microphone
  const toggleMicrophone = useCallback(() => {
    if (mediaStream) {
      const audioTrack = mediaStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicEnabled(audioTrack.enabled);
      }
    }
  }, [mediaStream]);

  // Toggle audio mute
  const toggleAudioMute = useCallback(() => {
    setIsAudioMuted(prev => !prev);
    if (isAudioPlaying) {
      stopSpeaking();
      setIsAudioPlaying(false);
      setIsAISpeaking(false);
    }
  }, [isAudioPlaying]);

  if (!interviewState) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">
            No interview session found
          </h2>
          <Button onClick={() => navigate('/interview/create-session')}>
            Start New Interview
          </Button>
        </div>
      </div>
    );
  }

  if (interviewCompleted) {
    return (
      <div className="max-w-2xl mx-auto mt-16 p-8 bg-white rounded-xl shadow-sm">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Circle className="w-8 h-8 text-green-600" fill="currentColor" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Interview Completed!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for completing the interview. Your responses have been recorded.
          </p>
          {finalScore && (
            <div className="mb-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {finalScore.toFixed(1)}%
              </div>
              <p className="text-gray-600">Your Interview Score</p>
            </div>
          )}
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/dashboard')}
              className="w-full"
            >
              View Results Dashboard
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/interview/create-session')}
              className="w-full"
            >
              Start New Interview
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-white">
              AI Mock Interview - {interviewState.role}
            </h1>
            <div className="flex items-center space-x-2">
              {connectionStatus === 'connected' ? (
                <Wifi className="w-4 h-4 text-green-400" />
              ) : connectionStatus === 'connecting' ? (
                <Loader className="w-4 h-4 text-yellow-400 animate-spin" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-400" />
              )}
              <span className="text-sm text-gray-300 capitalize">
                {connectionStatus}
              </span>
            </div>
          </div>
          
          {/* Progress Indicator (comp2 only) */}
          {interviewState.interviewMode === 'comp2' && questionCount > 0 && (
            <div className="text-sm text-gray-300">
              Question {questionCount} of {totalQuestions}
            </div>
          )}
        </div>
      </div>

      {/* Main Interview Interface */}
      <div className="flex-1 flex">
        {/* AI Interviewer Panel */}
        <div className="flex-1 bg-gray-900 flex flex-col">
          {/* AI Avatar/Status */}
          <div className="flex-1 flex items-center justify-center relative">
            <div className="text-center">
              {/* AI Avatar */}
              <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 transition-all duration-300 ${
                isAISpeaking 
                  ? 'bg-blue-500 shadow-lg shadow-blue-500/50' 
                  : 'bg-gray-700'
              }`}>
                <Bot className="w-16 h-16 text-white" />
              </div>
              
              {/* AI Status */}
              <div className="text-white mb-4">
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                ) : isAISpeaking ? (
                  <span className="text-blue-400">Speaking...</span>
                ) : (
                  <span className="text-gray-400">Listening...</span>
                )}
              </div>
            </div>
            
            {/* Audio Element */}
            <audio
              ref={audioRef}
              onEnded={handleAudioEnded}
              className="hidden"
            />
          </div>
          
          {/* Question Display */}
          {currentQuestion && (
            <div className="p-6 bg-gray-800 border-t border-gray-700">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-lg font-medium text-white mb-3">
                  Current Question:
                </h3>
                <p className="text-gray-200 text-lg leading-relaxed mb-4">
                  {currentQuestion.text}
                </p>
                
                {/* Audio Controls */}
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleAudioPlayback}
                    disabled={!currentQuestion.audioUrl}
                    className="flex items-center space-x-2"
                  >
                    {isAudioPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    <span>{isAudioPlaying ? 'Pause' : 'Play'}</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={replayQuestion}
                    className="flex items-center space-x-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Replay</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleAudioMute}
                    className="flex items-center space-x-2"
                  >
                    {isAudioMuted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                    <span>{isAudioMuted ? 'Unmute' : 'Mute'}</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Panel */}
        <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Video Feed */}
          <div className="relative bg-black h-64">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            {!isVideoEnabled && (
              <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                <User className="w-16 h-16 text-gray-400" />
              </div>
            )}
            
            {/* Recording Indicator */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-600 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-white text-sm">Recording</span>
              </div>
            )}
          </div>

          {/* Controls Panel */}
          <div className="flex-1 p-4">
            {interviewState.interviewMode === 'comp3' ? (
              /* WebSocket Controls (comp3) */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Your Response:
                  </label>
                  <textarea
                    value={userResponse}
                    onChange={(e) => setUserResponse(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full h-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
                
                <Button
                  onClick={() => submitResponseWebSocket(userResponse)}
                  disabled={!userResponse.trim() || isLoading}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Response</span>
                </Button>
              </div>
            ) : (
              /* HTTP Controls (comp2) */
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => getNextQuestionHttp()}
                    disabled={isLoading}
                    size="sm"
                    className="flex items-center justify-center space-x-2"
                  >
                    <SkipForward className="w-4 h-4" />
                    <span>Next</span>
                  </Button>
                  
                  <Button
                    onClick={skipQuestion}
                    disabled={isLoading}
                    variant="outline"
                    size="sm"
                    className="flex items-center justify-center space-x-2"
                  >
                    <SkipForward className="w-4 h-4" />
                    <span>Skip</span>
                  </Button>
                </div>
                
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  variant={isRecording ? "danger" : "primary"}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  {isRecording ? (
                    <>
                      <Square className="w-4 h-4" />
                      <span>Stop Recording</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      <span>Record Answer</span>
                    </>
                  )}
                </Button>
              </div>
            )}
            
            {/* Common Controls */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="grid grid-cols-3 gap-3 mb-4">
                <Button
                  onClick={toggleMicrophone}
                  variant={isMicEnabled ? "primary" : "danger"}
                  size="sm"
                  className="flex items-center justify-center"
                >
                  {isMicEnabled ? (
                    <Mic className="w-4 h-4" />
                  ) : (
                    <MicOff className="w-4 h-4" />
                  )}
                </Button>
                
                <Button
                  onClick={toggleVideo}
                  variant={isVideoEnabled ? "primary" : "danger"}
                  size="sm"
                  className="flex items-center justify-center"
                >
                  {isVideoEnabled ? (
                    <Video className="w-4 h-4" />
                  ) : (
                    <VideoOff className="w-4 h-4" />
                  )}
                </Button>
                
                <Button
                  onClick={endInterview}
                  variant="danger"
                  size="sm"
                  className="flex items-center justify-center"
                >
                  <PhoneOff className="w-4 h-4" />
                </Button>
              </div>
              
              <Button
                onClick={endInterview}
                variant="danger"
                className="w-full"
                disabled={isLoading}
              >
                End Interview
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-3 rounded-md shadow-lg">
          <p>{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default InterviewPage;

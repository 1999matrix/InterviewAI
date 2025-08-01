import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Volume2, 
  VolumeX,
  Phone,
  PhoneOff,
  User,
  Clock,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Brain,
  RotateCcw,
  Square,
  Wifi,
  WifiOff,
  RefreshCw,
  StopCircle
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { WebSocketInterviewManager, speakText, stopSpeaking } from '../../services/Sharedservice';

interface InterviewState {
  interviewType: string;
  user: string;
  interviewMode: 'comp3';
  role: string;
  jobDescription: string;
  experience: number;
  uploadResume: boolean;
}

interface ChatMessage {
  id: string;
  type: 'interviewer' | 'interviewee';
  content: string;
  timestamp: Date;
  audio?: string; // base64 audio data
  questionNumber?: number;
}

interface ConnectionStatus {
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  message: string;
}

// Professional Loading Component
const LoadingState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center space-y-4 p-8">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
    <p className="text-gray-600 text-sm font-medium">{message}</p>
  </div>
);

// Professional Speech Visualizer
const SpeechVisualizer: React.FC<{ 
  isListening: boolean; 
  transcript: string;
  interimTranscript: string;
}> = ({ isListening, transcript, interimTranscript }) => {
  const [levels, setLevels] = useState(Array(12).fill(0));

  useEffect(() => {
    if (!isListening) {
      setLevels(Array(12).fill(0));
      return;
    }

    const interval = setInterval(() => {
      setLevels(prev => prev.map(() => Math.random() * 100));
    }, 150);

    return () => clearInterval(interval);
  }, [isListening]);

  return (
    <div className="flex flex-col items-center space-y-3 p-4 bg-gray-50 rounded-lg border">
      {/* Audio Visualizer */}
      <div className="flex items-end space-x-1 h-12">
        {levels.map((level, i) => (
          <div
            key={i}
            className={`w-1.5 bg-gradient-to-t rounded-full transition-all duration-150 ${
              isListening 
                ? 'from-blue-500 to-blue-400 opacity-100' 
                : 'from-gray-300 to-gray-200 opacity-50'
            }`}
            style={{ 
              height: isListening ? `${Math.max(6, (level / 100) * 48)}px` : '6px' 
            }}
          />
        ))}
      </div>
      
      {/* Status and Transcript */}
      <div className="w-full text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          {isListening ? (
            <>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-gray-700">Listening...</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="text-xs text-gray-500">Ready</span>
            </>
          )}
        </div>

        {(transcript || interimTranscript) && (
          <div className="bg-white rounded p-2 border shadow-sm min-h-[40px]">
            <div className="text-xs text-gray-600 mb-1">Your response:</div>
            <div className="text-sm text-gray-900">
              {transcript && <span className="text-gray-900">{transcript}</span>}
              {interimTranscript && <span className="text-gray-500 italic"> {interimTranscript}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Chat Message Component
const ChatMessage: React.FC<{ 
  message: ChatMessage; 
  onPlayAudio?: (audio: string) => void;
  onSpeakText?: (text: string) => void;
  isPlaying?: boolean;
  isSpeaking?: boolean;
}> = ({ message, onPlayAudio, onSpeakText, isPlaying, isSpeaking }) => {
  const isInterviewer = message.type === 'interviewer';
  
  return (
    <div className={`flex ${isInterviewer ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`flex items-start space-x-3 max-w-[80%] ${isInterviewer ? 'flex-row' : 'flex-row-reverse space-x-reverse'}`}>
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          isInterviewer ? 'bg-blue-100' : 'bg-green-100'
        }`}>
          {isInterviewer ? (
            <Brain className="w-5 h-5 text-blue-600" />
          ) : (
            <User className="w-5 h-5 text-green-600" />
          )}
        </div>
        
        {/* Message Bubble */}
        <div className={`rounded-2xl px-4 py-3 shadow-sm ${
          isInterviewer 
            ? 'bg-white border border-gray-200' 
            : 'bg-blue-600 text-white'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-medium ${
              isInterviewer ? 'text-gray-600' : 'text-blue-200'
            }`}>
              {isInterviewer ? 'AI Interviewer' : 'You'}
              {message.questionNumber && ` • Q${message.questionNumber}`}
            </span>
            <span className={`text-xs ${
              isInterviewer ? 'text-gray-400' : 'text-blue-200'
            }`}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          
          <div className={`text-sm leading-relaxed ${
            isInterviewer ? 'text-gray-900' : 'text-white'
          }`}>
            {message.content}
          </div>
          
          {/* Audio Controls for Interviewer Messages */}
          {isInterviewer && (message.audio || onSpeakText) && (
            <div className="flex items-center space-x-2 mt-3 pt-2 border-t border-gray-100">
              {message.audio && onPlayAudio && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPlayAudio(message.audio!)}
                  disabled={isPlaying}
                  className="text-xs px-2 py-1 h-auto"
                >
                  {isPlaying ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Playing
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3 h-3 mr-1" />
                      Play Audio
                    </>
                  )}
                </Button>
              )}
              
              {onSpeakText && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSpeakText(message.content)}
                  disabled={isSpeaking}
                  className="text-xs px-2 py-1 h-auto"
                >
                  {isSpeaking ? (
                    <>
                      <StopCircle className="w-3 h-3 mr-1" />
                      Speaking
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Read Aloud
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Connection Status Component
const ConnectionStatus: React.FC<{ status: ConnectionStatus; onReconnect: () => void }> = ({ 
  status, 
  onReconnect 
}) => (
  <div className={`flex items-center justify-between px-4 py-2 rounded-lg border ${
    status.status === 'connected' 
      ? 'bg-green-50 border-green-200' 
      : status.status === 'connecting'
      ? 'bg-yellow-50 border-yellow-200'
      : 'bg-red-50 border-red-200'
  }`}>
    <div className="flex items-center space-x-2">
      {status.status === 'connected' ? (
        <Wifi className="w-4 h-4 text-green-600" />
      ) : status.status === 'connecting' ? (
        <RefreshCw className="w-4 h-4 text-yellow-600 animate-spin" />
      ) : (
        <WifiOff className="w-4 h-4 text-red-600" />
      )}
      <span className={`text-sm font-medium ${
        status.status === 'connected' 
          ? 'text-green-800' 
          : status.status === 'connecting'
          ? 'text-yellow-800'
          : 'text-red-800'
      }`}>
        {status.message}
      </span>
    </div>
    
    {status.status === 'disconnected' && (
      <Button
        variant="outline"
        size="sm"
        onClick={onReconnect}
        className="text-xs px-2 py-1 h-auto"
      >
        <RefreshCw className="w-3 h-3 mr-1" />
        Reconnect
      </Button>
    )}
  </div>
);

// Main WebSocket Interview Page Component
const WebSocketInterviewPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as InterviewState;
  
  // Speech Recognition Hook
  const {
    transcript,
    interimTranscript,
    finalTranscript,
    resetTranscript,
    listening,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();
  
  // Core State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'connecting',
    message: 'Connecting to interview session...'
  });
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);
  
  // UI State
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSpeakingText, setIsSpeakingText] = useState(false);
  const [isInterviewerTyping, setIsInterviewerTyping] = useState(false);
  
  // Error State
  const [error, setError] = useState<string | null>(null);
  
  // Response State
  const [savedResponse, setSavedResponse] = useState<string>('');
  
  // Refs
  const wsManagerRef = useRef<WebSocketInterviewManager | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  
  // Interview Data
  const username = state?.user || 'guest';
  const interviewType = state?.interviewType || 'Technical Interview';

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check browser support
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      setError('Your browser does not support speech recognition. Please use Chrome, Edge, or Safari.');
    }
  }, [browserSupportsSpeechRecognition]);

  // Initialize WebSocket connection
  useEffect(() => {
    const initializeConnection = async () => {
      if (!state?.user) {
        navigate('/interview/create');
        return;
      }

      try {
        wsManagerRef.current = new WebSocketInterviewManager();
        
        // Set up event handlers
        wsManagerRef.current.onMessage((data) => {
          console.log('Received message:', data);
          handleWebSocketMessage(data);
        });
        
        wsManagerRef.current.onClose(() => {
          setConnectionStatus({
            status: 'disconnected',
            message: 'Connection lost'
          });
        });
        
        wsManagerRef.current.onError((error) => {
          console.error('WebSocket error:', error);
          setConnectionStatus({
            status: 'error',
            message: 'Connection error occurred'
          });
        });
        
        // Connect to WebSocket
        await wsManagerRef.current.connect(username);
        
        setConnectionStatus({
          status: 'connected',
          message: 'Connected to interview session'
        });
        
        // Start the interview
        setTimeout(() => {
          startInterview();
        }, 1000);
        
      } catch (error: any) {
        console.error('Failed to initialize WebSocket:', error);
        setConnectionStatus({
          status: 'error',
          message: 'Failed to connect to interview session'
        });
        setError('Failed to connect to the interview server. Please try again.');
      }
    };

    initializeConnection();

    return () => {
      if (wsManagerRef.current) {
        wsManagerRef.current.disconnect();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Timer Effect
  useEffect(() => {
    if (!interviewStarted || interviewCompleted) return;
    
    timerRef.current = window.setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [interviewStarted, interviewCompleted]);

  // Handle final transcript changes
  useEffect(() => {
    if (finalTranscript && finalTranscript.trim() !== '') {
      setSavedResponse(finalTranscript);
    }
  }, [finalTranscript]);

  // Handle WebSocket messages
  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'question':
        setIsInterviewerTyping(false);
        setCurrentQuestionNumber(data.question_number || currentQuestionNumber + 1);
        
        const questionMessage: ChatMessage = {
          id: `q-${Date.now()}`,
          type: 'interviewer',
          content: data.text,
          timestamp: new Date(),
          audio: data.audio,
          questionNumber: data.question_number || currentQuestionNumber + 1
        };
        
        setMessages(prev => [...prev, questionMessage]);
        
        // Auto-play audio if available
        if (data.audio && isAudioEnabled && !isMuted) {
          setTimeout(() => playAudioFromBase64(data.audio), 500);
        }
        break;
        
      case 'typing':
        setIsInterviewerTyping(data.is_typing);
        break;
        
      case 'completed':
        setInterviewCompleted(true);
        setIsInterviewerTyping(false);
        
        const completionMessage: ChatMessage = {
          id: `completion-${Date.now()}`,
          type: 'interviewer',
          content: data.message || 'Thank you for completing the interview! Your responses have been analyzed.',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, completionMessage]);
        break;
        
      case 'error':
        setError(data.message || 'An error occurred during the interview');
        break;
        
      default:
        console.log('Unknown message type:', data.type);
    }
  };

  // Start interview
  const startInterview = () => {
    if (wsManagerRef.current && wsManagerRef.current.isConnected()) {
      try {
        wsManagerRef.current.startInterview({
          role: state.role,
          job_description: state.jobDescription || '',
          experience: state.experience,
          cv_flag: state.uploadResume
        });
        
        setInterviewStarted(true);
        
        // Add welcome message
        const welcomeMessage: ChatMessage = {
          id: `welcome-${Date.now()}`,
          type: 'interviewer',
          content: `Welcome to your ${interviewType}! I'm your AI interviewer. Let's begin with some questions about your background and experience.`,
          timestamp: new Date()
        };
        
        setMessages([welcomeMessage]);
        
      } catch (error: any) {
        setError('Failed to start interview: ' + error.message);
      }
    }
  };

  // Send response via WebSocket
  const sendResponse = (text: string) => {
    if (wsManagerRef.current && wsManagerRef.current.isConnected() && text.trim()) {
      try {
        wsManagerRef.current.sendResponse(text.trim());
        
        // Add user message to chat
        const userMessage: ChatMessage = {
          id: `user-${Date.now()}`,
          type: 'interviewee',
          content: text.trim(),
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, userMessage]);
        setIsInterviewerTyping(true);
        
      } catch (error: any) {
        setError('Failed to send response: ' + error.message);
      }
    }
  };

  // Audio playback from base64
  const playAudioFromBase64 = async (audioBase64: string) => {
    try {
      setIsPlayingAudio(true);
      
      const audioData = atob(audioBase64);
      const audioArray = new Uint8Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        audioArray[i] = audioData.charCodeAt(i);
      }
      
      const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        setIsPlayingAudio(false);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setIsPlayingAudio(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
      
    } catch (error) {
      console.error('Failed to play audio:', error);
      setIsPlayingAudio(false);
    }
  };

  // Text-to-speech
  const handleSpeakText = async (text: string) => {
    try {
      setIsSpeakingText(true);
      await speakText(text);
    } catch (error) {
      console.error('Failed to speak text:', error);
    } finally {
      setIsSpeakingText(false);
    }
  };

  // Speech recognition controls
  const startListening = () => {
    if (!browserSupportsSpeechRecognition) {
      setError('Speech recognition is not supported in your browser');
      return;
    }
    
    setError(null);
    resetTranscript();
    setSavedResponse('');
    
    SpeechRecognition.startListening({
      continuous: true,
      language: 'en-US',
      interimResults: true
    });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

  const resetResponse = () => {
    if (listening) {
      stopListening();
    }
    resetTranscript();
    setSavedResponse('');
  };

  const submitResponse = () => {
    const responseText = savedResponse || transcript;
    if (responseText.trim()) {
      if (listening) {
        stopListening();
      }
      sendResponse(responseText);
      resetResponse();
    }
  };

  // End interview
  const endInterview = () => {
    if (!confirm('Are you sure you want to end the interview?')) {
      return;
    }

    if (listening) {
      stopListening();
    }

    if (wsManagerRef.current && wsManagerRef.current.isConnected()) {
      wsManagerRef.current.endInterview();
    }
    
    setInterviewCompleted(true);
  };

  // Reconnect
  const reconnect = async () => {
    setConnectionStatus({
      status: 'connecting',
      message: 'Reconnecting...'
    });
    
    try {
      if (wsManagerRef.current) {
        await wsManagerRef.current.connect(username);
        setConnectionStatus({
          status: 'connected',
          message: 'Reconnected successfully'
        });
      }
    } catch (error) {
      setConnectionStatus({
        status: 'error',
        message: 'Failed to reconnect'
      });
    }
  };

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

  // Show error screen for browser compatibility
  if (error && !browserSupportsSpeechRecognition) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Browser Not Supported</h2>
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
  if (interviewCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Interview Completed!</h2>
          <p className="text-gray-600 mb-4">
            Thank you for completing the AI interview. Your responses have been analyzed.
          </p>
          <div className="text-sm text-gray-500 mb-6">
            Duration: {formatTime(timeElapsed)} | Questions: {currentQuestionNumber}
          </div>
          <Button onClick={() => navigate('/dashboard')} className="w-full">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Brain className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">WebSocket AI Interview</h1>
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
                onClick={endInterview}
                disabled={!interviewStarted || interviewCompleted}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <PhoneOff className="w-4 h-4 mr-2" />
                End Interview
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Connection Status */}
          <div className="mb-6">
            <ConnectionStatus status={connectionStatus} onReconnect={reconnect} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            
            {/* Chat Area */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Interview Conversation</h3>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <span>Question {currentQuestionNumber}</span>
                  {isInterviewerTyping && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <span className="text-blue-600">AI is typing...</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {messages.length === 0 && !isInterviewerTyping && (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p>Waiting for interview to start...</p>
                    </div>
                  </div>
                )}
                
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onPlayAudio={playAudioFromBase64}
                    onSpeakText={handleSpeakText}
                    isPlaying={isPlayingAudio}
                    isSpeaking={isSpeakingText}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            {/* Controls Panel */}
            <div className="space-y-6">
              {/* Speech Recognition Panel */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Voice Response</h3>
                
                {/* Speech Visualizer */}
                <SpeechVisualizer 
                  isListening={listening}
                  transcript={savedResponse || transcript}
                  interimTranscript={interimTranscript}
                />
                
                {/* Controls */}
                <div className="space-y-3 mt-4">
                  {!listening && !savedResponse && !transcript && (
                    <Button
                      onClick={startListening}
                      disabled={!interviewStarted || interviewCompleted || !isAudioEnabled || isMuted}
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                    >
                      <Mic className="w-5 h-5 mr-2" />
                      Start Speaking
                    </Button>
                  )}
                  
                  {listening && (
                    <div className="space-y-2">
                      <Button
                        onClick={stopListening}
                        className="w-full h-12 bg-red-600 hover:bg-red-700"
                      >
                        <Square className="w-5 h-5 mr-2" />
                        Stop Speaking
                      </Button>
                      
                      <Button
                        onClick={resetResponse}
                        variant="outline"
                        className="w-full"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                    </div>
                  )}
                  
                  {(savedResponse || transcript) && !listening && (
                    <div className="space-y-2">
                      <Button
                        onClick={submitResponse}
                        disabled={!interviewStarted || interviewCompleted}
                        className="w-full h-12 bg-green-600 hover:bg-green-700"
                      >
                        <Send className="w-5 h-5 mr-2" />
                        Send Response
                      </Button>
                      
                      <Button
                        onClick={resetResponse}
                        variant="outline"
                        className="w-full"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Audio Controls */}
                <div className="flex items-center justify-center space-x-4 mt-6 pt-4 border-t border-gray-200">
                  <Button
                    variant={isAudioEnabled ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                    className={`${!isAudioEnabled ? 'bg-red-500 hover:bg-red-600' : ''}`}
                  >
                    {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4 text-white" />}
                  </Button>
                  
                  <Button
                    variant={!isMuted ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setIsMuted(!isMuted)}
                    className={`${isMuted ? 'bg-red-500 hover:bg-red-600' : ''}`}
                  >
                    {!isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-white" />}
                  </Button>
                  
                  <Button
                    variant={isVideoEnabled ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                    className={`${!isVideoEnabled ? 'bg-red-500 hover:bg-red-600' : ''}`}
                  >
                    {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4 text-white" />}
                  </Button>
                </div>
                
                {/* Error Display */}
                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="text-sm text-red-800">{error}</span>
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
                    <span className="font-medium">{currentQuestionNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Time Elapsed</span>
                    <span className="font-medium">{formatTime(timeElapsed)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Connection</span>
                    <span className={`font-medium ${
                      connectionStatus.status === 'connected' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {connectionStatus.status === 'connected' ? 'Active' : 'Disconnected'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Speech Recognition</span>
                    <span className={`font-medium ${browserSupportsSpeechRecognition ? 'text-green-600' : 'text-red-600'}`}>
                      {browserSupportsSpeechRecognition ? 'Supported' : 'Not Supported'}
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

export default WebSocketInterviewPage; 
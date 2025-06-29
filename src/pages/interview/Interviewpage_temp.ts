// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { 
//   Mic, 
//   MicOff, 
//   Video, 
//   VideoOff, 
//   Volume2, 
//   VolumeX,
//   Phone,
//   PhoneOff,
//   Settings,
//   MoreHorizontal,
//   User,
//   Clock,
//   Send,
//   Loader2,
//   CheckCircle2,
//   AlertCircle,
//   MessageSquare,
//   FileText,
//   Brain
// } from 'lucide-react';
// import Button from '../../components/ui/Button';
// import axios from 'axios';

// // TypeScript declarations for Web Speech API
// declare global {
//   interface Window {
//     SpeechRecognition: typeof SpeechRecognition;
//     webkitSpeechRecognition: typeof SpeechRecognition;
//   }
// }

// interface SpeechRecognition extends EventTarget {
//   continuous: boolean;
//   interimResults: boolean;
//   lang: string;
//   maxAlternatives: number;
//   onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
//   onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
//   onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
//   onend: ((this: SpeechRecognition, ev: Event) => any) | null;
//   start(): void;
//   stop(): void;
// }

// interface SpeechRecognitionEvent extends Event {
//   resultIndex: number;
//   results: SpeechRecognitionResultList;
// }

// interface SpeechRecognitionErrorEvent extends Event {
//   error: string;
//   message: string;
// }

// declare var SpeechRecognition: {
//   prototype: SpeechRecognition;
//   new(): SpeechRecognition;
// };

// // React Speech Kit types
// interface SpeechSynthesisOptions {
//   text: string;
//   rate?: number;
//   pitch?: number;
//   voice?: SpeechSynthesisVoice;
// }

// interface UseSpeechSynthesisReturn {
//   speak: (options: SpeechSynthesisOptions) => void;
//   cancel: () => void;
//   speaking: boolean;
//   voices: SpeechSynthesisVoice[];
// }

// // Mock implementation of useSpeechSynthesis
// const useSpeechSynthesis = (): UseSpeechSynthesisReturn => {
//   const [speaking, setSpeaking] = useState(false);
//   const [voices] = useState<SpeechSynthesisVoice[]>([]);

//   const speak = useCallback((options: SpeechSynthesisOptions) => {
//     if ('speechSynthesis' in window) {
//       const utterance = new SpeechSynthesisUtterance(options.text);
//       utterance.rate = options.rate || 1;
//       utterance.pitch = options.pitch || 1;
//       if (options.voice) utterance.voice = options.voice;
      
//       utterance.onstart = () => setSpeaking(true);
//       utterance.onend = () => setSpeaking(false);
//       utterance.onerror = () => setSpeaking(false);
      
//       window.speechSynthesis.speak(utterance);
//     }
//   }, []);

//   const cancel = useCallback(() => {
//     if ('speechSynthesis' in window) {
//       window.speechSynthesis.cancel();
//       setSpeaking(false);
//     }
//   }, []);

//   return { speak, cancel, speaking, voices };
// };

// // API Configuration
// const API_BASE = import.meta.env.VITE_APP_API_BASE;

// // Types
// interface InterviewState {
//   question: string;
//   interviewType: string;
//   user: string;
//   interviewMode: 'comp2' | 'comp3';
// }

// interface TranscriptEntry {
//   id: string;
//   speaker: 'interviewer' | 'candidate';
//   text: string;
//   timestamp: Date;
// }

// // Custom Speech Recognition Hook
// const useSpeechRecognition = () => {
//   const [transcript, setTranscript] = useState('');
//   const [isListening, setIsListening] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const recognitionRef = useRef<SpeechRecognition | null>(null);
//   const [browserSupported, setBrowserSupported] = useState(false);
//   const finalTranscriptRef = useRef('');

//   useEffect(() => {
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     setBrowserSupported(!!SpeechRecognition);

//     if (SpeechRecognition) {
//       const recognition = new SpeechRecognition();
      
//       recognition.continuous = true;
//       recognition.interimResults = true;
//       recognition.lang = 'en-US';
//       recognition.maxAlternatives = 1;

//       recognition.onstart = () => {
//         setIsListening(true);
//         setError(null);
//         finalTranscriptRef.current = '';
//       };

//       recognition.onresult = (event: SpeechRecognitionEvent) => {
//         let interimTranscript = '';
        
//         for (let i = event.resultIndex; i < event.results.length; i++) {
//           const result = event.results[i];
//           if (result.isFinal) {
//             finalTranscriptRef.current += result[0].transcript + ' ';
//           } else {
//             interimTranscript += result[0].transcript;
//           }
//         }
        
//         const fullTranscript = finalTranscriptRef.current + interimTranscript;
//         setTranscript(fullTranscript.trim());
//       };

//       recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
//         console.error('Speech recognition error:', event.error);
//         setError(`Speech recognition error: ${event.error}`);
//         setIsListening(false);
//       };

//       recognition.onend = () => {
//         setIsListening(false);
//       };

//       recognitionRef.current = recognition;
//     }

//     return () => {
//       if (recognitionRef.current) {
//         recognitionRef.current.stop();
//       }
//     };
//   }, []);

//   const startListening = useCallback(() => {
//     if (recognitionRef.current && !isListening) {
//       try {
//         setTranscript('');
//         setError(null);
//         finalTranscriptRef.current = '';
//         recognitionRef.current.start();
//       } catch (err) {
//         setError('Failed to start speech recognition. Please try again.');
//       }
//     }
//   }, [isListening]);

//   const stopListening = useCallback(() => {
//     if (recognitionRef.current && isListening) {
//       recognitionRef.current.stop();
//     }
//   }, [isListening]);

//   const resetTranscript = useCallback(() => {
//     setTranscript('');
//     setError(null);
//     finalTranscriptRef.current = '';
//   }, []);

//   return {
//     transcript,
//     isListening,
//     error,
//     startListening,
//     stopListening,
//     resetTranscript,
//     browserSupported
//   };
// };

// // Loading Animation Component
// const LoadingSpinner: React.FC<{ message?: string }> = ({ message }) => (
//   <div className="flex items-center space-x-3">
//     <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
//     <span className="text-sm text-gray-600">{message || 'Processing...'}</span>
//   </div>
// );

// // Audio Visualizer Component
// const AudioVisualizer: React.FC<{ isActive: boolean }> = ({ isActive }) => {
//   const [levels, setLevels] = useState(Array(12).fill(0));

//   useEffect(() => {
//     if (!isActive) {
//       setLevels(Array(12).fill(0));
//       return;
//     }

//     const interval = setInterval(() => {
//       setLevels(prev => prev.map(() => Math.random() * 100));
//     }, 150);

//     return () => clearInterval(interval);
//   }, [isActive]);

//   return (
//     <div className="flex items-end space-x-1 h-8">
//       {levels.map((level, i) => (
//         <div
//           key={i}
//           className={`w-1 bg-blue-500 rounded-t transition-all duration-150 ${
//             isActive ? 'opacity-100' : 'opacity-30'
//           }`}
//           style={{ 
//             height: isActive ? `${Math.max(8, (level / 100) * 32)}px` : '8px' 
//           }}
//         />
//       ))}
//     </div>
//   );
// };

// // Interview Video Panel Component
// const VideoPanel: React.FC<{ 
//   isCandidate?: boolean; 
//   isAudioEnabled: boolean; 
//   isVideoEnabled: boolean;
//   name: string;
// }> = ({ isCandidate = false, isAudioEnabled, isVideoEnabled, name }) => (
//   <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
//     {isVideoEnabled ? (
//       <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
//         <User className="w-16 h-16 text-white opacity-50" />
//       </div>
//     ) : (
//       <div className="w-full h-full bg-gray-800 flex items-center justify-center">
//         <VideoOff className="w-12 h-12 text-gray-400" />
//       </div>
//     )}
    
//     {/* Name Tag */}
//     <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-sm">
//       {name}
//     </div>
    
//     {/* Audio Status */}
//     <div className="absolute bottom-2 right-2">
//       {isAudioEnabled ? (
//         <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
//           <Mic className="w-3 h-3 text-white" />
//         </div>
//       ) : (
//         <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
//           <MicOff className="w-3 h-3 text-white" />
//         </div>
//       )}
//     </div>
//   </div>
// );

// // Main Interview Page Component
// const InterviewPage: React.FC = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const state = location.state as InterviewState || {};
  
//   // Core State
//   const [currentQuestion, setCurrentQuestion] = useState(
//     state.question || "Welcome to your interview. Please introduce yourself and tell me about your background."
//   );
//   const [questionNumber, setQuestionNumber] = useState(1);
//   const [sessionActive, setSessionActive] = useState(true);
//   const [timeElapsed, setTimeElapsed] = useState(0);
  
//   // UI State
//   const [isAudioEnabled, setIsAudioEnabled] = useState(true);
//   const [isVideoEnabled, setIsVideoEnabled] = useState(false);
//   const [showTranscript, setShowTranscript] = useState(false);
//   const [currentAnswer, setCurrentAnswer] = useState('');
//   const [typedAnswer, setTypedAnswer] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
  
//   // Loading States
//   const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
//   const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
//   const [isPlayingQuestion, setIsPlayingQuestion] = useState(false);
  
//   // Transcript History
//   const [transcriptHistory, setTranscriptHistory] = useState<TranscriptEntry[]>([
//     {
//       id: '1',
//       speaker: 'interviewer',
//       text: currentQuestion,
//       timestamp: new Date()
//     }
//   ]);

//   // Interview Data
//   const interviewMode = state.interviewMode || 'comp2';
//   const username = state.user || 'guest';
//   const interviewType = state.interviewType || 'Technical Interview';

//   // Hooks
//   const { transcript, isListening, startListening, stopListening, resetTranscript, browserSupported } = useSpeechRecognition();
//   const { speak, cancel, speaking } = useSpeechSynthesis();

//   // Timer Effect
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setTimeElapsed(prev => prev + 1);
//     }, 1000);

//     return () => clearInterval(timer);
//   }, []);

//   // Format time helper
//   const formatTime = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };

//   // Speak question when it changes
//   useEffect(() => {
//     if (currentQuestion && isAudioEnabled) {
//       setIsPlayingQuestion(true);
//       speak({ 
//         text: currentQuestion,
//         rate: 0.9,
//         pitch: 1,
//         voice: speechSynthesis.getVoices().find(voice => voice.name.includes('Microsoft')) || undefined
//       });
//     }
//   }, [currentQuestion, isAudioEnabled, speak]);

//   // Handle speech synthesis events
//   useEffect(() => {
//     if (!speaking && isPlayingQuestion) {
//       setIsPlayingQuestion(false);
//     }
//   }, [speaking, isPlayingQuestion]);

//   // API call helper
//   const callAPI = async (endpoint: string, data: any, method: 'GET' | 'POST' = 'GET') => {
//     try {
//       let response;
//       if (method === 'GET') {
//         response = await axios.get(`${API_BASE}/${endpoint}`, { params: data });
//       } else {
//         response = await axios.post(`${API_BASE}/${endpoint}`, data);
//       }
//       return response.data;
//     } catch (error: any) {
//       console.error('API Error:', error);
//       throw new Error(error.response?.data?.message || error.message || 'API call failed');
//     }
//   };

//   // Start recording
//   const handleStartRecording = async () => {
//     if (!browserSupported) {
//       alert('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.');
//       return;
//     }

//     try {
//       await navigator.mediaDevices.getUserMedia({ audio: true });
//       resetTranscript();
//       setCurrentAnswer('');
//       startListening();
//     } catch (err) {
//       alert('Microphone access denied. Please allow microphone access and try again.');
//     }
//   };

//   // Stop recording
//   const handleStopRecording = () => {
//     stopListening();
//     if (transcript.trim()) {
//       setCurrentAnswer(transcript.trim());
//       // Add to transcript history
//       setTranscriptHistory(prev => [...prev, {
//         id: Date.now().toString(),
//         speaker: 'candidate',
//         text: transcript.trim(),
//         timestamp: new Date()
//       }]);
//     }
//   };

//   // Submit answer and get next question
//   const handleSubmitAnswer = async () => {
//     const answerToSubmit = currentAnswer || typedAnswer;
//     if (!answerToSubmit.trim()) {
//       alert('Please provide an answer before proceeding.');
//       return;
//     }

//     setIsProcessingAnswer(true);

//     try {
//       let result;
//       if (interviewMode === 'comp2') {
//         result = await callAPI('get_next_question_comp2', {
//           username,
//           text: answerToSubmit
//         });
//       } else if (interviewMode === 'comp3') {
//         result = await callAPI('get_next_question_comp3', {
//           username,
//           response: answerToSubmit
//         }, 'POST');
//       }

//       if (result?.question) {
//         setCurrentQuestion(result.question);
//         setQuestionNumber(prev => prev + 1);
//         setCurrentAnswer('');
//         setTypedAnswer('');
//         setIsTyping(false);
//         resetTranscript();

//         // Add new question to transcript history
//         setTranscriptHistory(prev => [...prev, {
//           id: Date.now().toString(),
//           speaker: 'interviewer',
//           text: result.question,
//           timestamp: new Date()
//         }]);
//       } else if (result?.message && result.message.includes('completed')) {
//         // Interview completed
//         setSessionActive(false);
//         alert('Interview completed! Thank you for your participation.');
//       }
//     } catch (error: any) {
//       if (error.message.includes('completed') || error.message.includes('No more questions')) {
//         setSessionActive(false);
//         alert('Interview completed! Thank you for your participation.');
//       } else {
//         alert(`Error: ${error.message}`);
//       }
//     } finally {
//       setIsProcessingAnswer(false);
//     }
//   };

//   // End interview
//   const handleEndInterview = async () => {
//     if (confirm('Are you sure you want to end the interview?')) {
//       setIsProcessingAnswer(true);
//       try {
//         const endpoint = interviewMode === 'comp2' ? 'get_user_result_comp2' : 'get_user_result_comp2';
//         await callAPI(endpoint, { username });
//         setSessionActive(false);
//         alert('Interview ended successfully! Your responses have been analyzed.');
//       } catch (error) {
//         console.error('Error ending interview:', error);
//         setSessionActive(false);
//       } finally {
//         setIsProcessingAnswer(false);
//       }
//     }
//   };

//   if (!sessionActive) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
//           <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">Interview Complete!</h2>
//           <p className="text-gray-600 mb-6">
//             Thank you for completing the {interviewType}. Your responses have been analyzed.
//           </p>
//           <div className="space-y-3">
//             <Button onClick={() => navigate('/dashboard')} fullWidth>
//               Return to Dashboard
//             </Button>
//             <Button variant="outline" onClick={() => navigate('/interview/create')} fullWidth>
//               Start New Interview
//             </Button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-900 flex flex-col">
//       {/* Header */}
//       <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-4">
//             <div className="flex items-center space-x-2">
//               <Brain className="w-6 h-6 text-blue-400" />
//               <h1 className="text-white font-semibold">{interviewType}</h1>
//             </div>
//             <div className="text-gray-400 text-sm">
//               {interviewMode.toUpperCase()} • Question {questionNumber}
//             </div>
//           </div>
          
//           <div className="flex items-center space-x-4">
//             <div className="flex items-center space-x-2 text-gray-400 text-sm">
//               <Clock className="w-4 h-4" />
//               <span>{formatTime(timeElapsed)}</span>
//             </div>
//             <Button 
//               variant="danger" 
//               size="sm"
//               onClick={handleEndInterview}
//               disabled={isProcessingAnswer}
//             >
//               <PhoneOff className="w-4 h-4 mr-2" />
//               End Interview
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 flex">
//         {/* Video Section */}
//         <div className="flex-1 p-6">
//           <div className="grid grid-cols-2 gap-4 mb-6">
//             {/* Interviewer Video */}
//             <VideoPanel 
//               name="AI Interviewer"
//               isAudioEnabled={isPlayingQuestion}
//               isVideoEnabled={false}
//             />
            
//             {/* Candidate Video */}
//             <VideoPanel 
//               name={username}
//               isCandidate
//               isAudioEnabled={isAudioEnabled && isListening}
//               isVideoEnabled={isVideoEnabled}
//             />
//           </div>

//           {/* Question Display */}
//           <div className="bg-white rounded-lg p-6 mb-6 shadow-lg">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-gray-900">
//                 Question {questionNumber}
//               </h3>
//               <div className="flex items-center space-x-2">
//                 {isPlayingQuestion && (
//                   <div className="flex items-center space-x-2 text-blue-600">
//                     <Volume2 className="w-4 h-4" />
//                     <span className="text-sm">Speaking...</span>
//                   </div>
//                 )}
//                 {isLoadingQuestion && <LoadingSpinner message="Loading question..." />}
//               </div>
//             </div>
            
//             <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
//               <p className="text-gray-800 text-lg leading-relaxed">
//                 {currentQuestion}
//               </p>
//             </div>

//             {/* Audio Visualization */}
//             {(isPlayingQuestion || isListening) && (
//               <div className="mt-4 flex items-center space-x-3">
//                 <span className="text-sm text-gray-600">
//                   {isPlayingQuestion ? 'Question Audio:' : 'Your Audio:'}
//                 </span>
//                 <AudioVisualizer isActive={isPlayingQuestion || isListening} />
//               </div>
//             )}
//           </div>

//           {/* Response Section */}
//           <div className="bg-white rounded-lg p-6 shadow-lg">
//             <div className="flex items-center justify-between mb-4">
//               <h4 className="font-semibold text-gray-900">Your Response</h4>
//               <div className="flex items-center space-x-2">
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   onClick={() => setIsTyping(!isTyping)}
//                 >
//                   {isTyping ? <Mic className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
//                   {isTyping ? 'Voice' : 'Type'}
//                 </Button>
//               </div>
//             </div>

//             {isTyping ? (
//               /* Type Response */
//               <div className="space-y-4">
//                 <textarea
//                   value={typedAnswer}
//                   onChange={(e) => setTypedAnswer(e.target.value)}
//                   placeholder="Type your answer here..."
//                   className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 />
//                 <div className="flex justify-end space-x-3">
//                   <Button
//                     variant="outline"
//                     onClick={() => setTypedAnswer('')}
//                     disabled={!typedAnswer.trim()}
//                   >
//                     Clear
//                   </Button>
//                   <Button
//                     onClick={handleSubmitAnswer}
//                     disabled={!typedAnswer.trim() || isProcessingAnswer}
//                   >
//                     {isProcessingAnswer ? (
//                       <LoadingSpinner message="Processing..." />
//                     ) : (
//                       <>
//                         <Send className="w-4 h-4 mr-2" />
//                         Submit Answer
//                       </>
//                     )}
//                   </Button>
//                 </div>
//               </div>
//             ) : (
//               /* Voice Response */
//               <div className="space-y-4">
//                 {/* Live Transcript */}
//                 {isListening && transcript && (
//                   <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                     <div className="flex items-center space-x-2 mb-2">
//                       <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
//                       <span className="text-sm font-medium text-blue-800">Live Transcript</span>
//                     </div>
//                     <p className="text-blue-900 italic">"{transcript}"</p>
//                   </div>
//                 )}

//                 {/* Captured Answer */}
//                 {currentAnswer && (
//                   <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//                     <div className="flex items-center space-x-2 mb-2">
//                       <CheckCircle2 className="w-4 h-4 text-green-600" />
//                       <span className="text-sm font-medium text-green-800">Captured Response</span>
//                     </div>
//                     <p className="text-green-900">"{currentAnswer}"</p>
//                   </div>
//                 )}

//                 {/* Recording Controls */}
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center space-x-3">
//                     {!isListening ? (
//                       <Button
//                         onClick={handleStartRecording}
//                         disabled={!browserSupported || isProcessingAnswer}
//                         className="bg-green-600 hover:bg-green-700"
//                       >
//                         <Mic className="w-4 h-4 mr-2" />
//                         Start Recording
//                       </Button>
//                     ) : (
//                       <Button
//                         variant="danger"
//                         onClick={handleStopRecording}
//                       >
//                         <MicOff className="w-4 h-4 mr-2" />
//                         Stop Recording
//                       </Button>
//                     )}
                    
//                     {currentAnswer && (
//                       <Button
//                         onClick={handleSubmitAnswer}
//                         disabled={isProcessingAnswer}
//                       >
//                         {isProcessingAnswer ? (
//                           <LoadingSpinner message="Processing..." />
//                         ) : (
//                           <>
//                             <Send className="w-4 h-4 mr-2" />
//                             Submit Answer
//                           </>
//                         )}
//                       </Button>
//                     )}
//                   </div>

//                   {!browserSupported && (
//                     <div className="flex items-center space-x-2 text-amber-600 text-sm">
//                       <AlertCircle className="w-4 h-4" />
//                       <span>Speech recognition not supported</span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Sidebar */}
//         <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
//           {/* Controls */}
//           <div className="p-4 border-b border-gray-700">
//             <div className="flex items-center justify-center space-x-4">
//               <button
//                 onClick={() => setIsAudioEnabled(!isAudioEnabled)}
//                 className={`p-3 rounded-full ${
//                   isAudioEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
//                 } text-white transition-colors`}
//               >
//                 {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
//               </button>
              
//               <button
//                 onClick={() => setIsVideoEnabled(!isVideoEnabled)}
//                 className={`p-3 rounded-full ${
//                   isVideoEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
//                 } text-white transition-colors`}
//               >
//                 {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
//               </button>
              
//               <button
//                 onClick={() => cancel()}
//                 className="p-3 rounded-full bg-gray-600 hover:bg-gray-700 text-white transition-colors"
//               >
//                 <VolumeX className="w-5 h-5" />
//               </button>
              
//               <button
//                 onClick={() => setShowTranscript(!showTranscript)}
//                 className="p-3 rounded-full bg-gray-600 hover:bg-gray-700 text-white transition-colors"
//               >
//                 <FileText className="w-5 h-5" />
//               </button>
//             </div>
//           </div>

//           {/* Transcript */}
//           {showTranscript && (
//             <div className="flex-1 p-4 overflow-y-auto">
//               <h4 className="text-white font-semibold mb-4 flex items-center">
//                 <FileText className="w-4 h-4 mr-2" />
//                 Interview Transcript
//               </h4>
//               <div className="space-y-3">
//                 {transcriptHistory.map((entry) => (
//                   <div
//                     key={entry.id}
//                     className={`p-3 rounded-lg ${
//                       entry.speaker === 'interviewer'
//                         ? 'bg-blue-900 text-blue-100'
//                         : 'bg-green-900 text-green-100'
//                     }`}
//                   >
//                     <div className="text-xs opacity-75 mb-1">
//                       {entry.speaker === 'interviewer' ? 'AI Interviewer' : username} • {entry.timestamp.toLocaleTimeString()}
//                     </div>
//                     <div className="text-sm">{entry.text}</div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Session Info */}
//           <div className="p-4 border-t border-gray-700 bg-gray-750">
//             <div className="text-gray-300 text-sm space-y-2">
//               <div className="flex justify-between">
//                 <span>Mode:</span>
//                 <span className="font-medium">{interviewMode.toUpperCase()}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Questions:</span>
//                 <span className="font-medium">{questionNumber}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Duration:</span>
//                 <span className="font-medium">{formatTime(timeElapsed)}</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InterviewPage;
import React, { useState, useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { useNavigate, useLocation } from "react-router-dom";
import { getNextQuestion, getFeedback, getUserResults } from '../../../services/Sharedservice';

function TheorySession(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState("bhups");
  // const [user, setUser] = useState("prajpoot");
  const [islastQuestion, setLastQuestion] = useState(false);
  const [question, setQuestion] = useState("");
  const [textToCopy, setTextToCopy] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isCvOrJD, setIsCvJd] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    setQuestion(location.state?.question || "");
    setIsCvJd(location.state?.isCvJd || false);
    setUser(location.state?.usr || "prajpoot");
  }, [location.state]);

  let userName = "Prashant Rajpoot";
  let userAbr = "PR";

  const startListening = () => {
    setIsRecording(true);
    SpeechRecognition.startListening({ continuous: true, language: "en-IN" });
  };
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  if (!browserSupportsSpeechRecognition) {
    return null;
  }

  const stopSpeak = () => {
    setIsRecording(false);
    SpeechRecognition.stopListening();
    setTextToCopy(transcript);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const nextQuestion = async () => {
    console.log(isCvOrJD);
    if(isCvOrJD){
      const url = 'get_next_question_comp2';
    try {
      const res = await getNextQuestion(url, user, textToCopy);
      setQuestion(res.data.next_question_id);
      resetTranscript();
      if (res.data.message === "No more questions left for this user") {
        setQuestion("I am done from my end and have no more questions to ask. You can click on Finish Test to mark it complete.");
        setLastQuestion(true);
      }
    } catch (e) {
      console.error(e);
    }
    } else {
    const url = 'get_next_question_id_comp1';
    try {
      const res = await getNextQuestion(url, user, textToCopy);
      setQuestion(res.data.next_question_id);
      resetTranscript();
      if (res.data.message === "No more questions left for this user") {
        setQuestion("I am done from my end and have no more questions to ask. You can click on Finish Test to mark it complete.");
        setLastQuestion(true);
      }
    } catch (e) {
      console.error(e);
    }
  }
    setTextToCopy("");
  };

  const getFeedbackForTest = async () => {
    const url = "get_user_result_comp1";
    try {
      const res = await getFeedback(url, user);
      console.log(res.data.response_result[3]?.result);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFinishClick = async () => {
    try {
      const response = await getUserResults('get_user_result_comp2', user);
      if (response.status === 200) {
        navigate('/user');
      } else {
        console.error('Error fetching user results:', response);
      }
    } catch (error) {
      console.error('Failed to fetch user results:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
      {/* Modern Navigation Bar */}
      <nav className="flex justify-between items-center py-4 px-6 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center">
            <span className="text-white font-semibold">{userAbr}</span>
          </div>
          <span className="text-gray-200 font-medium">Welcome, {userName}</span>
        </div>
        
        <div className="flex items-center space-x-4">
          {isRecording ? (
            <button
              onClick={stopSpeak}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 relative group"
            >
              <span className="absolute -left-1 -right-1 -top-1 -bottom-1 bg-red-500/20 rounded-lg animate-pulse"></span>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="w-3 h-3 bg-white rounded-full animate-ping absolute"></div>
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <span>Recording...</span>
              </div>
            </button>
          ) : (
            <button
              onClick={startListening}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 group"
            >
              <svg 
                className="w-5 h-5 transition-transform group-hover:scale-110" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" 
                />
              </svg>
              <span>Start Recording</span>
            </button>
          )}

          <button
            onClick={copyToClipboard}
            className={`px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 ${
              isCopied ? 'bg-green-500' : ''
            }`}
          >
            {isCopied ? (
              <>
                <svg 
                  className="w-5 h-5 animate-bounce" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" 
                  />
                </svg>
                <span>Copy Text</span>
              </>
            )}
          </button>

          <button
            onClick={() => navigate("/user")}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 group"
          >
            <svg 
              className="w-5 h-5 transition-transform group-hover:-translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7" 
              />
            </svg>
            <span>Exit</span>
          </button>
        </div>
      </nav>

      {/* Question Section */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-gray-800/30 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
          <h2 className="text-red-400 text-lg font-semibold mb-2">Question:</h2>
          <p className="text-gray-200 text-lg">{question}</p>
        </div>
      </div>

      {/* Interaction Area */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-gray-800/30 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
          <div className="min-h-[200px]">
            <p className="text-gray-300">{textToCopy}</p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800/50 backdrop-blur-sm border-t border-gray-700">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-end">
          {islastQuestion ? (
            <button
              onClick={handleFinishClick}
              className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200"
            >
              Finish Test
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200"
            >
              Next Question
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TheorySession;
import axios from "axios";

// TypeScript declarations for Web Speech API (keeping for backward compatibility)
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

//const serverUrl = "http://192.168.143.219:7777/api/v1";
const serverUrl = import.meta.env.VITE_APP_API_BASE;

// WebSocket URL for comp3 interviews - connect to bhopu backend
const getWebSocketUrl = () => {
  // For WebSocket interviews, connect to bhopu backend on port 7777
  // For regular API calls, use the compiler backend on port 8081
  return import.meta.env.VITE_WEBSOCKET_URL || "ws://localhost:7777";
};

// WebSocket Interview Manager for comp3
export class WebSocketInterviewManager {
  private ws: WebSocket | null = null;
  private username: string = '';
  private onMessageCallback: ((data: any) => void) | null = null;
  private onCloseCallback: (() => void) | null = null;
  private onErrorCallback: ((error: Event) => void) | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectTimeout: number | null = null;

  constructor() {
    // Bind methods to preserve 'this' context
    this.handleMessage = this.handleMessage.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  connect(username: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.username = username;
        const wsUrl = `${getWebSocketUrl()}/ws/interview_comp3/${encodeURIComponent(username)}`;
        console.log('Connecting to WebSocket:', wsUrl);
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };
        
        this.ws.onmessage = this.handleMessage;
        this.ws.onclose = this.handleClose;
        this.ws.onerror = this.handleError;
        
        // Timeout for connection
        setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000);
        
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      console.log('WebSocket message received:', data);
      if (this.onMessageCallback) {
        this.onMessageCallback(data);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  private handleClose(event: CloseEvent) {
    console.log('WebSocket connection closed:', event.code, event.reason);
    
    // Attempt to reconnect if it wasn't a normal closure
    if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      this.reconnectTimeout = window.setTimeout(() => {
        this.connect(this.username).catch(console.error);
      }, 2000 * this.reconnectAttempts);
    } else if (this.onCloseCallback) {
      this.onCloseCallback();
    }
  }

  private handleError(event: Event) {
    console.error('WebSocket error:', event);
    if (this.onErrorCallback) {
      this.onErrorCallback(event);
    }
  }

  startInterview(interviewData: {
    role: string;
    job_description: string;
    experience: number;
    cv_flag: boolean;
  }) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message = {
        type: 'start_interview',
        ...interviewData
      };
      this.ws.send(JSON.stringify(message));
    } else {
      throw new Error('WebSocket is not connected');
    }
  }

  sendResponse(text: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message = {
        type: 'user_response',
        text: text
      };
      this.ws.send(JSON.stringify(message));
    } else {
      throw new Error('WebSocket is not connected');
    }
  }

  endInterview() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message = {
        type: 'end_interview'
      };
      this.ws.send(JSON.stringify(message));
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.ws) {
      this.ws.close(1000, 'Normal closure');
      this.ws = null;
    }
  }

  onMessage(callback: (data: any) => void) {
    this.onMessageCallback = callback;
  }

  onClose(callback: () => void) {
    this.onCloseCallback = callback;
  }

  onError(callback: (error: Event) => void) {
    this.onErrorCallback = callback;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionState(): string {
    if (!this.ws) return 'DISCONNECTED';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING';
      case WebSocket.OPEN: return 'OPEN';
      case WebSocket.CLOSING: return 'CLOSING';
      case WebSocket.CLOSED: return 'CLOSED';
      default: return 'UNKNOWN';
    }
  }
}

const saveResume = (url: string, body: FormData) => {
    console.log("Making request to:", `${serverUrl}/${url}`);
    console.log("Request body:", Array.from(body.entries()));
    
    const headers = {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    };
    return axios.post(`${serverUrl}/${url}`, body, headers);
}

const getQuestionDropdown = (url: string, userName: string, role: string, level: number) => {
    let headers = {'Content-Type': 'application/json'}
    return axios.get(`${serverUrl}/${url}`, { 
        params: {
            username: userName,
            topic: role,
            level: level,
        } 
    });
}

const getQuestion = (url: string, user: string, role: string, jobdesc: string, experience: number, resume: boolean) => {
    let body = {
        username: user,
        role: role,
        job_description: jobdesc,
        experience: experience,
        cv: resume,
    };
    return axios.post(`${serverUrl}/${url}`, body);
}

const getNextQuestion = (url: string, user: string, text: string) => {
    let headers = {'Content-Type': 'application/json'}
    return axios.get(`${serverUrl}/${url}`, { 
        params: {
            username: user,
            text: text,
        }
    });
}

const getFeedback = (url: string, user: string) => {
    let headers = {'Content-Type': 'application/json'}
    return axios.get(`${serverUrl}/${url}`, { 
        params: {
            username: user,
        } 
    });
}

const getUserResults = (url: string, username: string) => {
    let headers = {'Content-Type': 'application/json'}
    return axios.get(`${serverUrl}/${url}`, { 
        params: {
            username: username
        }
    });
}

const getUserResultComp2 = (url: string, username: string) => {
    return axios.get(`${serverUrl}/${url}`, {
        params: {
            username: username
        }
    });
};

const startTestComp2 = (user: string, role: string, jobdesc: string, experience: number, resume: boolean) => {
    let body = {
        username: user,
        role: role,
        job_description: jobdesc,
        experience: experience,
        cv: resume,
    };
    return axios.post(`${serverUrl}/start_test_comp2`, body, {
        responseType: 'json',
        headers: {
            'Accept': 'application/json'
        }
    });
};

const startTestComp3 = (user: string, role: string, jobdesc: string, experience: number, resume: boolean) => {
    let body = {
        username: user,
        role: role,
        job_description: jobdesc,
        experience: experience,
        cv: resume,
    };
    return axios.post(`${serverUrl}/start_test_comp3`, body, {
        responseType: 'json',
        headers: {
            'Accept': 'application/json'
        }
    });
};

const getNextQuestionComp2 = (user: string, text: string) => {
    return axios.get(`${serverUrl}/get_next_question_comp2`, {
        params: {
            username: user,
            text: text,
        },
        responseType: 'json',
        headers: {
            'Accept': 'application/json'
        }
    }); 
};

const getNextQuestionComp3 = (user: string, response: string) => {
    return axios.post(`${serverUrl}/get_next_question_comp3`, {
        username: user,
        response: response,
    }, {
        responseType: 'json',
        headers: {
            'Accept': 'application/json'
        }
    });
};

// Function to send text response for next question
const sendTextResponse = async (username: string, response: string, interviewMode: 'comp2' | 'comp3'): Promise<any> => {
    try {
        if (interviewMode === 'comp2') {
            return await getNextQuestionComp2(username, response);
        } else {
            return await getNextQuestionComp3(username, response);
        }
    } catch (error) {
        throw new Error(`Failed to send text response: ${error}`);
    }
};

// Function to play audio from server response (handles the mp3 audio files from backend)
const playAudioFromServer = (audioUrl: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const audio = new Audio(audioUrl);
        
        audio.onended = () => resolve();
        audio.onerror = () => reject(new Error('Failed to play audio'));
        
        audio.play().catch(reject);
    });
};

// Function to handle server audio responses for questions
const handleServerAudioResponse = async (response: any): Promise<{ questionText: string; audioUrl?: string }> => {
    try {
        let questionText = '';
        let audioUrl = '';

        const contentType = response.headers['content-type'];

        if (contentType?.includes('application/json')) {
            const jsonResponse = response.data;

            if (jsonResponse.status === 'completed') {
                throw new Error('Interview completed');
            }

            questionText = jsonResponse.question_text || jsonResponse.question;
            if (jsonResponse.audio_data) {
                const audioData = jsonResponse.audio_data;
                const audioType = jsonResponse.audio_type || 'audio/mpeg';
                const byteCharacters = atob(audioData);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: audioType });
                audioUrl = URL.createObjectURL(blob);
            }

            if (!questionText) {
                throw new Error('No question text received from server.');
            }

            return { questionText, audioUrl };

        } else if (contentType?.includes('audio/mpeg')) {
            // Legacy handling for audio stream with headers
            const headers = response.headers;
            questionText = headers['x-question-text'] || headers['X-Question-Text'] || '';

            if (response.data instanceof Blob && response.data.size > 0) {
                audioUrl = URL.createObjectURL(response.data);
            }

            if (!questionText) {
                throw new Error('No question text received from server in headers.');
            }

            return { questionText, audioUrl };
        } else if (response.data instanceof Blob) {
             try {
                const textContent = await response.data.text();
                const jsonResponse = JSON.parse(textContent);
                
                if (jsonResponse.status === 'completed') {
                    throw new Error('Interview completed');
                }
            } catch (error) {
                // ignore
            }
        }

        throw new Error('Unknown or unsupported response format from server');

    } catch (error) {
        console.error('Error processing server audio response:', error);
        if (error instanceof Error && error.message.includes('completed')) {
            throw error;
        }
        throw new Error(`Failed to process server audio response: ${error}`);
    }
};

// Text-to-Speech functionality for reading questions aloud
const speakText = (text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!('speechSynthesis' in window)) {
            reject(new Error('Text-to-speech not supported in this browser'));
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        utterance.onend = () => resolve();
        utterance.onerror = (event) => reject(new Error('Speech synthesis failed'));
        
        speechSynthesis.speak(utterance);
    });
};

// Stop current speech synthesis
const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
    }
};

//login and Signup
const userLogin = (userName: string, password: string) => {
    return axios.get(`${serverUrl}/sign-up`, { params: {
      userName: userName,
      password: password
    }})
}

const userRegistration = (userName: string, email: string, password: string ) => {
  let body = {
    user: userName,
    email: email,
    password: password
  }
  return axios.post(`${serverUrl}/sign-up`, body, {headers: {'Content-Type': 'application/json'}})
}

//User Details
const getUderData = (url: string, userName: string) => {
    return axios.get(`${serverUrl}/${url}`, {
        params: {
            username: userName
        }
    });
}

const updatUserData = (url: string, data: any) => {
    return 
}

export {
    serverUrl, 
    // payments
    
    saveResume, 
    getQuestion, 
    getQuestionDropdown, 
    getNextQuestion, 
    getFeedback, 
    getUserResults, 
    startTestComp2, 
    startTestComp3, 
    getNextQuestionComp2, 
    getNextQuestionComp3, 
    getUserResultComp2,
    sendTextResponse,
    playAudioFromServer,
    handleServerAudioResponse,
    speakText,
    stopSpeaking,
    getWebSocketUrl,
    userLogin,
    userRegistration
};
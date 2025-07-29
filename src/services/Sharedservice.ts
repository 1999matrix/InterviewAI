import axios from "axios";

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// const serverUrl = "http://192.168.143.219:7777/api/v1";
const serverUrl = import.meta.env.VITE_APP_API_BASE;


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

const startTestComp2 = (user: string, role: string, jobdesc: string, experience: number, resume: boolean) => {
    let body = {
        username: user,
        role: role,
        job_description: jobdesc,
        experience: experience,
        cv: resume,
    };
    return axios.post(`${serverUrl}/start_test_comp2`, body, {
        responseType: 'json', // Important: Handle audio response
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
        responseType: 'json', // Important: Handle audio response
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
        responseType: 'json', // Important: Handle audio response
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
        responseType: 'blob', // Important: Handle audio response
        headers: {
            'Accept': 'audio/mpeg, application/json',
            'Content-Type': 'application/json'
        }
    });
};

const getUserResultComp2 = (url: string, username: string) => {
    return axios.get(`${serverUrl}/${url}`, {
        params: {
            username: username
        }
    });
};

// Add speech-to-text functionality for audio recordings
const convertSpeechToText = async (audioBlob: Blob): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('Converting audio blob to text, size:', audioBlob.size);
  
        const formData = new FormData();
        formData.append("file", audioBlob, "audio.webm"); // or audio.wav/mp3 based on your blob
        formData.append("model", "whisper-1");
  
        const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_APP_OPENAI_API_KEY}`
          },
          body: formData
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          return reject(new Error(`API error: ${response.status} ${errorText}`));
        }
  
        const data = await response.json();
        resolve(data.text);
      } catch (error) {
        reject(new Error(`Speech-to-text conversion failed: ${error}`));
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

// Enhanced function to handle audio responses for comp2
const submitAudioResponseComp2 = async (username: string, audioBlob: Blob): Promise<any> => {
    try {
        // Convert audio to text (in production, use a proper STT service)
        const textResponse = await convertSpeechToText(audioBlob);
        
        // Send text response to the API
        return await getNextQuestionComp2(username, textResponse);
    } catch (error) {
        throw new Error(`Failed to process audio response: ${error}`);
    }
};

// Enhanced function to handle audio responses for comp3
const submitAudioResponseComp3 = async (username: string, audioBlob: Blob): Promise<any> => {
    try {
        // Convert audio to text (in production, use a proper STT service)
        const textResponse = await convertSpeechToText(audioBlob);
        
        // Send text response to the API
        return await getNextQuestionComp3(username, textResponse);
    } catch (error) {
        throw new Error(`Failed to process audio response: ${error}`);
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

            questionText = jsonResponse.question_text;
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

export {
    serverUrl, 
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
    convertSpeechToText,
    sendTextResponse,
    submitAudioResponseComp2,
    submitAudioResponseComp3,
    playAudioFromServer,
    handleServerAudioResponse
};
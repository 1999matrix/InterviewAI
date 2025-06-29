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
        responseType: 'blob', // Important: Handle audio response
        headers: {
            'Accept': 'audio/mpeg, application/json'
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
        responseType: 'blob', // Important: Handle audio response
        headers: {
            'Accept': 'audio/mpeg, application/json'
        }
    });
};

const getNextQuestionComp2 = (user: string, text: string) => {
    return axios.get(`${serverUrl}/get_next_question_comp2`, {
        params: {
            username: user,
            text: text,
        },
        responseType: 'blob', // Important: Handle audio response
        headers: {
            'Accept': 'audio/mpeg, application/json'
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
            'Accept': 'audio/mpeg, application/json'
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
    return new Promise((resolve, reject) => {
        try {
            // For now, we'll return a placeholder response
            // In production, you would send the audio blob to a speech-to-text service
            // or use the Web Speech API with real-time recording
            
            console.log('Converting audio blob to text, size:', audioBlob.size);
            
            // Simulate processing time
            setTimeout(() => {
                resolve("User provided an audio response to the interview question.");
            }, 500);
            
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
        
        console.log('Full response:', response);
        console.log('Response headers:', response.headers);
        console.log('Response data type:', typeof response.data);
        console.log('Response data instanceof Blob:', response.data instanceof Blob);
        console.log('Response data size:', response.data?.size);
        
        // Extract question text from headers (case-insensitive)
        const headers = response.headers;
        questionText = headers['x-question-text'] || 
                     headers['X-Question-Text'] || 
                     headers['X-QUESTION-TEXT'] ||
                     headers['x-question-text'.toLowerCase()] || 
                     '';
        
        console.log('Extracted question text:', questionText);
        
        // Check if response contains audio (blob)
        if (response.data instanceof Blob && response.data.size > 0) {
            // Create object URL for audio playback
            audioUrl = URL.createObjectURL(response.data);
            console.log('Created audio URL:', audioUrl);
        }
        
        // If no question text found, this is an error
        if (!questionText) {
            console.error('No question text found in headers. Available headers:', Object.keys(headers));
            throw new Error('No question text received from server. Check API response headers.');
        }
        
        return { questionText, audioUrl };
    } catch (error) {
        console.error('Error processing server audio response:', error);
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
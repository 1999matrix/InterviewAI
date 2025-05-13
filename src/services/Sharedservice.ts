import axios from "axios";
const serverUrl = "http://192.168.1.54:7777/api/v1";

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
    let headers = {'Content-Type': 'application/json'}
    let body = {
        username: user,
        role: role,
        job_description: jobdesc,
        experience: experience,
        cv: resume,
    }
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

export {serverUrl, saveResume, getQuestion, getQuestionDropdown, getNextQuestion, getFeedback, getUserResults}; 
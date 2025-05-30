import axios from "axios";
const serverUrl = "http://192.168.1.73:7777/api/v1";

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
    return axios.post(`${serverUrl}/start_test_comp2`, body);
};

const startTestComp3 = (user: string, role: string, jobdesc: string, experience: number, resume: boolean) => {
    let body = {
        username: user,
        role: role,
        job_description: jobdesc,
        experience: experience,
        cv: resume,
    };
    return axios.post(`${serverUrl}/start_test_comp3`, body);
};

const getNextQuestionComp2 = (user: string, text: string) => {
    return axios.get(`${serverUrl}/get_next_question_comp2`, {
        params: {
            username: user,
            text: text,
        }
    });
};

const getNextQuestionComp3 = (user: string, response: string) => {
    return axios.post(`${serverUrl}/get_next_question_comp3`, {
        username: user,
        response: response,
    });
};

const getUserResultComp2 = (url: string, username: string) => {
    return axios.get(`${serverUrl}/${url}`, {
        params: {
            username: username
        }
    });
};

export {serverUrl, saveResume, getQuestion, getQuestionDropdown, getNextQuestion, getFeedback, getUserResults, startTestComp2, startTestComp3, getNextQuestionComp2, getNextQuestionComp3, getUserResultComp2}; 
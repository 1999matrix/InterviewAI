import axios from 'axios';

// Base URL for the backend API
const API_BASE_URL = import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:8081/v1';

// Types for API requests and responses
export interface StartAptitudeTestRequest {
    userId: number;
    subjects?: string[];
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    duration?: number;
    questionCount?: number;
}

export interface StartCodingTestRequest {
    userId: number;
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    language?: 'javascript' | 'python' | 'java' | 'cpp';
    duration?: number;
    questionCount?: number;
}

export interface SubmitAptitudeAnswerRequest {
    sessionToken: string;
    questionId: number;
    answer: string | number | string[];
    timeSpent?: number;
    isReviewed?: boolean;
}

export interface SubmitCodeRequest {
    sessionToken: string;
    questionId: number;
    language: 'javascript' | 'python' | 'java' | 'cpp';
    code: string;
    timeSpent?: number;
}

export interface RunCodeRequest {
    sessionToken: string;
    questionId: number;
    language: 'javascript' | 'python' | 'java' | 'cpp';
    code: string;
    testCaseIndex?: number;
}

export interface AptitudeQuestion {
    id: number;
    questionNumber: number;
    question: string;
    type: 'MCQ' | 'MSQ' | 'NAT' | 'TRUE_FALSE';
    subject: string;
    topic?: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    marks: number;
    negativeMarks: number;
    options?: {
        key: string;
        text: string;
    }[];
}

export interface CodingQuestion {
    id: number;
    questionNumber: number;
    question: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    testCases: {
        id: number;
        input: string;
        expectedOutput: string;
        isHidden: boolean;
    }[];
}

export interface TestSession {
    sessionToken: string;
    sessionId: number;
    duration: number;
    totalQuestions: number;
    startTime: string;
}

export interface SessionStatus {
    sessionToken: string;
    status: string;
    timeRemaining: number;
    totalQuestions: number;
    answeredQuestions?: number;
    submittedQuestions?: number;
    reviewedQuestions?: number;
    currentScore: number;
    startTime: string;
    endTime?: string;
}

class TestService {
    private apiClient = axios.create({
        baseURL: API_BASE_URL,
        timeout: 30000,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    constructor() {
        // Add request interceptor for error handling
        this.apiClient.interceptors.request.use(
            (config) => {
                console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
                return config;
            },
            (error) => {
                console.error('Request error:', error);
                return Promise.reject(error);
            }
        );

        // Add response interceptor for error handling
        this.apiClient.interceptors.response.use(
            (response) => {
                return response;
            },
            (error) => {
                console.error('Response error:', error);
                if (error.response?.status === 401) {
                    // Handle unauthorized access
                    console.error('Unauthorized access - redirecting to login');
                }
                return Promise.reject(error);
            }
        );
    }

    // Aptitude Test Methods
    async startAptitudeTest(request: StartAptitudeTestRequest): Promise<{ 
        success: boolean; 
        data: TestSession & { questions: AptitudeQuestion[] }; 
        message: string 
    }> {
        try {
            const response = await this.apiClient.post('/aptitude/start', request);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to start aptitude test');
        }
    }

    async submitAptitudeAnswer(request: SubmitAptitudeAnswerRequest): Promise<{
        success: boolean;
        data: {
            isCorrect: boolean;
            marksObtained: number;
            questionId: number;
            submitted: boolean;
        };
        message: string;
    }> {
        try {
            const response = await this.apiClient.post('/aptitude/submit-answer', request);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to submit answer');
        }
    }

    async markAptitudeQuestionForReview(sessionToken: string, questionId: number, isReviewed: boolean = true): Promise<{
        success: boolean;
        data: { questionId: number; isReviewed: boolean };
        message: string;
    }> {
        try {
            const response = await this.apiClient.post('/aptitude/mark-review', {
                sessionToken,
                questionId,
                isReviewed
            });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to mark question for review');
        }
    }

    async getAptitudeSessionStatus(sessionToken: string): Promise<{
        success: boolean;
        data: SessionStatus;
    }> {
        try {
            const response = await this.apiClient.get(`/aptitude/session/${sessionToken}`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to get session status');
        }
    }

    async endAptitudeTest(sessionToken: string): Promise<{
        success: boolean;
        data: {
            sessionId: number;
            totalQuestions: number;
            attemptedQuestions: number;
            correctAnswers: number;
            incorrectAnswers: number;
            unattempted: number;
            totalMarks: number;
            percentage: number;
            timeTaken: number;
            subjectWiseResults: Record<string, any>;
            startTime: string;
            endTime: string;
        };
        message: string;
    }> {
        try {
            const response = await this.apiClient.post('/aptitude/end', { sessionToken });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to end aptitude test');
        }
    }

    async getAptitudeSubjects(): Promise<{
        success: boolean;
        data: { subject: string; questionCount: number }[];
    }> {
        try {
            const response = await this.apiClient.get('/aptitude/subjects');
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to get subjects');
        }
    }

    // Coding Test Methods
    async startCodingTest(request: StartCodingTestRequest): Promise<{
        success: boolean;
        data: TestSession & { 
            questions: CodingQuestion[];
            supportedLanguages: string[];
        };
        message: string;
    }> {
        try {
            const response = await this.apiClient.post('/coding/start', request);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to start coding test');
        }
    }

    async runCode(request: RunCodeRequest): Promise<{
        success: boolean;
        data: {
            results: Array<{
                input: string;
                expectedOutput: string;
                actualOutput: string;
                passed: boolean;
                error?: string;
                runtime: string;
                memory: string;
            }>;
            summary: {
                total: number;
                passed: number;
                failed: number;
            };
        };
        message: string;
    }> {
        try {
            const response = await this.apiClient.post('/coding/run', request);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to run code');
        }
    }

    async submitCode(request: SubmitCodeRequest): Promise<{
        success: boolean;
        data: {
            questionId: number;
            testCasesPassed: number;
            totalTestCases: number;
            marksObtained: number;
            compilationStatus: string;
            submitted: boolean;
            errorMessage?: string;
        };
        message: string;
    }> {
        try {
            const response = await this.apiClient.post('/coding/submit', request);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to submit code');
        }
    }

    async getCodingSessionStatus(sessionToken: string): Promise<{
        success: boolean;
        data: SessionStatus & { submittedQuestions: number };
    }> {
        try {
            const response = await this.apiClient.get(`/coding/session/${sessionToken}`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to get coding session status');
        }
    }

    async endCodingTest(sessionToken: string): Promise<{
        success: boolean;
        data: {
            sessionId: number;
            totalQuestions: number;
            attemptedQuestions: number;
            fullyCorrect: number;
            partiallyCorrect: number;
            incorrect: number;
            unattempted: number;
            totalMarks: number;
            percentage: number;
            timeTaken: number;
            languageWiseResults: Record<string, any>;
            startTime: string;
            endTime: string;
        };
        message: string;
    }> {
        try {
            const response = await this.apiClient.post('/coding/end', { sessionToken });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to end coding test');
        }
    }

    // Utility Methods
    formatTimeRemaining(seconds: number): string {
        if (seconds <= 0) return '00:00:00';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    calculateProgress(answered: number, total: number): number {
        return total > 0 ? Math.round((answered / total) * 100) : 0;
    }

    isSessionActive(status: string): boolean {
        return ['started', 'ongoing'].includes(status);
    }

    isSessionExpired(timeRemaining: number): boolean {
        return timeRemaining <= 0;
    }
}

// Export a singleton instance
const testService = new TestService();
export default testService; 
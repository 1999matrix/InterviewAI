import axios from 'axios';
import { serverUrl } from './Sharedservice';

// Types for aptitude test
export interface AptitudeQuestionOption {
  key: string;
  text: string;
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
  options?: AptitudeQuestionOption[];
}

export interface AptitudeTestSession {
  sessionToken: string;
  sessionId: number;
  duration: number;
  totalQuestions: number;
  questions: AptitudeQuestion[];
  startTime: string;
}

export interface AptitudeSessionStatus {
  sessionToken: string;
  status: string;
  timeRemaining: number;
  totalQuestions: number;
  answeredQuestions: number;
  reviewedQuestions: number;
  currentScore: number;
  startTime: string;
  endTime?: string;
}

export interface AptitudeTestResults {
  sessionId: number;
  totalQuestions: number;
  attemptedQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattempted: number;
  totalMarks: number;
  percentage: number;
  timeTaken: number;
  subjectWiseResults: Record<string, {
    total: number;
    correct: number;
    marks: number;
  }>;
  startTime: string;
  endTime: string;
}

export interface Subject {
  subject: string;
  questionCount: number;
}

// Types for coding test
export interface CodingQuestion {
  id: number;
  questionNumber: number;
  question: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  testCases: TestCase[];
  savedCode?: string;
  savedLanguage?: string;
}

export interface TestCase {
  id: number;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface CodingTestSession {
  sessionToken: string;
  sessionId: number;
  duration: number;
  totalQuestions: number;
  questions: CodingQuestion[];
  supportedLanguages: string[];
  startTime: string;
}

export interface TestResult {
  passed: boolean;
  output: string;
  runtime?: string;
  memory?: string;
  error?: string;
}

export interface RunCodeResult {
  success: boolean;
  data?: {
    results: TestResult[];
    summary: {
      total: number;
      passed: number;
      failed: number;
    };
  };
  message?: string;
}

export interface SubmitCodeResult {
  success: boolean;
  data?: {
    questionId: number;
    testCasesPassed: number;
    totalTestCases: number;
    marksObtained: number;
    compilationStatus: string;
    submitted: boolean;
    errorMessage?: string;
  };
  message?: string;
}

export interface SessionStatus {
  sessionToken: string;
  status: string;
  timeRemaining: number;
  totalQuestions: number;
  submittedQuestions: number;
  currentScore: number;
  startTime: string;
  endTime?: string;
}

export interface FinalResults {
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
}

// API Service class for coding tests
export class CodingTestService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${serverUrl}/v1/coding`;
  }

  /**
   * Start a new coding test session
   */
  async startTest(params: {
    username?: string;
    email?: string;
    userId?: number;
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    language?: string;
    duration?: number;
    questionCount?: number;
  }): Promise<CodingTestSession> {
    try {
      const response = await axios.post(`${this.baseUrl}/start`, params);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to start coding test');
      }
      
      return response.data.data as CodingTestSession;
    } catch (error: any) {
      console.error('Start coding test error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to start coding test');
    }
  }

  /**
   * Run code against test cases (for testing)
   */
  async runCode(params: {
    sessionToken: string;
    questionId: number;
    language: string;
    code: string;
    testCaseIndex?: number;
  }): Promise<RunCodeResult> {
    try {
      const response = await axios.post(`${this.baseUrl}/run`, params);
      return response.data;
    } catch (error: any) {
      console.error('Run code error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to run code');
    }
  }

  /**
   * Submit final code solution
   */
  async submitCode(params: {
    sessionToken: string;
    questionId: number;
    language: string;
    code: string;
    timeSpent?: number;
  }): Promise<SubmitCodeResult> {
    try {
      const response = await axios.post(`${this.baseUrl}/submit`, params);
      return response.data;
    } catch (error: any) {
      console.error('Submit code error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to submit code');
    }
  }

  /**
   * Auto-save code without submitting
   */
  async autoSave(params: {
    sessionToken: string;
    questionId: number;
    language: string;
    code: string;
  }): Promise<{ success: boolean; message: string; timestamp: string }> {
    try {
      const response = await axios.post(`${this.baseUrl}/autosave`, params);
      return response.data;
    } catch (error: any) {
      console.error('Auto-save error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to auto-save code');
    }
  }

  /**
   * Get current question and saved code
   */
  async getCurrentQuestion(sessionToken: string, questionId: number): Promise<{
    question: CodingQuestion;
    sessionInfo: {
      timeRemaining: number;
      totalQuestions: number;
      attemptedQuestions: number;
    };
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}/question/${sessionToken}/${questionId}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to get question');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Get current question error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to get question');
    }
  }

  /**
   * Get session status
   */
  async getSessionStatus(sessionToken: string): Promise<SessionStatus> {
    try {
      const response = await axios.get(`${this.baseUrl}/session/${sessionToken}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to get session status');
      }
      
      return response.data.data as SessionStatus;
    } catch (error: any) {
      console.error('Get session status error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to get session status');
    }
  }

  /**
   * End coding test and get results
   */
  async endTest(sessionToken: string): Promise<FinalResults> {
    try {
      const response = await axios.post(`${this.baseUrl}/end`, { sessionToken });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to end test');
      }
      
      return response.data.data as FinalResults;
    } catch (error: any) {
      console.error('End test error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to end test');
    }
  }

  /**
   * Check if session is still valid
   */
  async validateSession(sessionToken: string): Promise<boolean> {
    try {
      const status = await this.getSessionStatus(sessionToken);
      return status.status === 'started' || status.status === 'ongoing';
    } catch (error) {
      return false;
    }
  }

  /**
   * Get time remaining for session
   */
  async getTimeRemaining(sessionToken: string): Promise<number> {
    try {
      const status = await this.getSessionStatus(sessionToken);
      return status.timeRemaining;
    } catch (error) {
      return 0;
    }
  }
}

// API Service class for aptitude tests
export class AptitudeTestService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${serverUrl}/v1/aptitude`;
  }

  /**
   * Start a new aptitude test session
   */
  async startTest(params: {
    userId: number;
    subjects?: string[];
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    duration?: number;
    questionCount?: number;
  }): Promise<{ success: boolean; data: AptitudeTestSession; message: string }> {
    try {
      const response = await axios.post(`${this.baseUrl}/start`, params);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to start aptitude test');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Start aptitude test error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to start aptitude test');
    }
  }

  /**
   * Submit answer for a question
   */
  async submitAnswer(params: {
    sessionToken: string;
    questionId: number;
    answer: string | string[] | number;
    timeSpent?: number;
    isReviewed?: boolean;
  }): Promise<{ success: boolean; data: { isCorrect: boolean; marksObtained: number; questionId: number; submitted: boolean }; message: string }> {
    try {
      const response = await axios.post(`${this.baseUrl}/submit-answer`, params);
      return response.data;
    } catch (error: any) {
      console.error('Submit aptitude answer error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to submit answer');
    }
  }

  /**
   * Mark question for review
   */
  async markForReview(sessionToken: string, questionId: number, isReviewed: boolean): Promise<{ success: boolean; data: { questionId: number; isReviewed: boolean }; message: string }> {
    try {
      const response = await axios.post(`${this.baseUrl}/mark-review`, {
        sessionToken,
        questionId,
        isReviewed
      });
      return response.data;
    } catch (error: any) {
      console.error('Mark for review error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to mark question for review');
    }
  }

  /**
   * Get session status
   */
  async getSessionStatus(sessionToken: string): Promise<{ success: boolean; data: AptitudeSessionStatus }> {
    try {
      const response = await axios.get(`${this.baseUrl}/session/${sessionToken}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to get session status');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Get aptitude session status error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to get session status');
    }
  }

  /**
   * End aptitude test and get results
   */
  async endTest(sessionToken: string): Promise<{ success: boolean; data: AptitudeTestResults; message: string }> {
    try {
      const response = await axios.post(`${this.baseUrl}/end`, { sessionToken });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to end test');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('End aptitude test error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to end test');
    }
  }

  /**
   * Get available subjects
   */
  async getSubjects(): Promise<{ success: boolean; data: Subject[] }> {
    try {
      const response = await axios.get(`${this.baseUrl}/subjects`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to get subjects');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Get subjects error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to get subjects');
    }
  }
}

// Create singleton instances
export const codingTestService = new CodingTestService();
export const aptitudeTestService = new AptitudeTestService();

// Export individual functions for backward compatibility
export const startCodingTest = (params: Parameters<typeof codingTestService.startTest>[0]) => 
  codingTestService.startTest(params);

export const runCodingTest = (params: Parameters<typeof codingTestService.runCode>[0]) => 
  codingTestService.runCode(params);

export const submitCodingTest = (params: Parameters<typeof codingTestService.submitCode>[0]) => 
  codingTestService.submitCode(params);

export const autoSaveCodingTest = (params: Parameters<typeof codingTestService.autoSave>[0]) => 
  codingTestService.autoSave(params);

export const getCodingQuestion = (sessionToken: string, questionId: number) => 
  codingTestService.getCurrentQuestion(sessionToken, questionId);

export const getCodingSessionStatus = (sessionToken: string) => 
  codingTestService.getSessionStatus(sessionToken);

export const endCodingTest = (sessionToken: string) => 
  codingTestService.endTest(sessionToken);

// Export individual aptitude functions for backward compatibility
export const startAptitudeTest = (params: Parameters<typeof aptitudeTestService.startTest>[0]) => 
  aptitudeTestService.startTest(params);

export const submitAptitudeAnswer = (params: Parameters<typeof aptitudeTestService.submitAnswer>[0]) => 
  aptitudeTestService.submitAnswer(params);

export const markAptitudeQuestionForReview = (sessionToken: string, questionId: number, isReviewed: boolean) => 
  aptitudeTestService.markForReview(sessionToken, questionId, isReviewed);

export const getAptitudeSessionStatus = (sessionToken: string) => 
  aptitudeTestService.getSessionStatus(sessionToken);

export const endAptitudeTest = (sessionToken: string) => 
  aptitudeTestService.endTest(sessionToken);

export const getAptitudeSubjects = () => 
  aptitudeTestService.getSubjects();

// Combined service object
const testService = {
  // Coding test methods
  startCodingTest: codingTestService.startTest.bind(codingTestService),
  runCode: codingTestService.runCode.bind(codingTestService),
  submitCode: codingTestService.submitCode.bind(codingTestService),
  autoSave: codingTestService.autoSave.bind(codingTestService),
  getCurrentQuestion: codingTestService.getCurrentQuestion.bind(codingTestService),
  getSessionStatus: codingTestService.getSessionStatus.bind(codingTestService),
  endTest: codingTestService.endTest.bind(codingTestService),
  validateSession: codingTestService.validateSession.bind(codingTestService),
  getTimeRemaining: codingTestService.getTimeRemaining.bind(codingTestService),

  // Aptitude test methods
  startAptitudeTest: aptitudeTestService.startTest.bind(aptitudeTestService),
  submitAptitudeAnswer: aptitudeTestService.submitAnswer.bind(aptitudeTestService),
  markAptitudeQuestionForReview: aptitudeTestService.markForReview.bind(aptitudeTestService),
  getAptitudeSessionStatus: aptitudeTestService.getSessionStatus.bind(aptitudeTestService),
  endAptitudeTest: aptitudeTestService.endTest.bind(aptitudeTestService),
  getSubjects: aptitudeTestService.getSubjects.bind(aptitudeTestService)
};

export default testService;
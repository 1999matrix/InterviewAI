import React from 'react';
import { 
  Clock, 
  Calculator, 
  Edit3, 
  Eye, 
  AlertTriangle, 
  CheckSquare,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Save,
  Maximize
} from 'lucide-react';
import Button from '../../components/ui/Button';

interface ExamInterfaceProps {
  questions: any[];
  currentQuestionIndex: number;
  questionStates: Record<number, any>;
  timeRemaining: number;
  tabSwitchCount: number;
  showTimeWarning: boolean;
  showCalculator: boolean;
  showScratchpad: boolean;
  scratchpadContent: string;
  calculatorDisplay: string;
  showQuestionPalette: boolean;
  showSubmissionDialog: boolean;
  statusSummary: any;
  formatTime: (seconds: number) => string;
  getCurrentQuestion: () => any;
  getCurrentQuestionState: () => any;
  getStatusColor: (status: string) => string;
  handleAnswerChange: (answer: string | string[] | number) => void;
  goToQuestion: (index: number) => void;
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  clearAnswer: () => void;
  markForReview: () => void;
  saveAndNext: () => void;
  toggleFullScreen: () => void;
  setShowCalculator: (show: boolean) => void;
  setShowScratchpad: (show: boolean) => void;
  setScratchpadContent: (content: string) => void;
  handleCalculatorInput: (value: string) => void;
  setShowSubmissionDialog: (show: boolean) => void;
  setShowTimeWarning: (show: boolean) => void;
  handleFinalSubmit: () => void;
}

const AptitudeExamInterface: React.FC<ExamInterfaceProps> = ({
  questions,
  currentQuestionIndex,
  questionStates,
  timeRemaining,
  tabSwitchCount,
  showTimeWarning,
  showCalculator,
  showScratchpad,
  scratchpadContent,
  calculatorDisplay,
  showQuestionPalette,
  showSubmissionDialog,
  statusSummary,
  formatTime,
  getCurrentQuestion,
  getCurrentQuestionState,
  getStatusColor,
  handleAnswerChange,
  goToQuestion,
  goToNextQuestion,
  goToPreviousQuestion,
  clearAnswer,
  markForReview,
  saveAndNext,
  toggleFullScreen,
  setShowCalculator,
  setShowScratchpad,
  setScratchpadContent,
  handleCalculatorInput,
  setShowSubmissionDialog,
  setShowTimeWarning,
  handleFinalSubmit
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">Aptitude Test</h1>
            {tabSwitchCount > 0 && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Tab switches: {tabSwitchCount}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Timer */}
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
              timeRemaining <= 300 ? 'bg-red-100 text-red-700' : 
              timeRemaining <= 900 ? 'bg-yellow-100 text-yellow-700' : 
              'bg-blue-100 text-blue-700'
            }`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
            </div>
            
            {/* Full screen toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullScreen}
              className="flex items-center"
            >
              <Maximize className="w-4 h-4" />
            </Button>
            
            {/* Submit button */}
            <Button
              variant="outline"
              onClick={() => setShowSubmissionDialog(true)}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Submit Exam
            </Button>
          </div>
        </div>
      </div>
      
      {/* Time warning overlay */}
      {showTimeWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center space-x-3 text-yellow-600 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Time Warning</h3>
            </div>
            <p className="text-gray-700 mb-4">
              {timeRemaining <= 300 ? 'Only 5 minutes remaining!' :
               timeRemaining <= 900 ? 'Only 15 minutes remaining!' :
               '30 minutes remaining!'}
            </p>
            <Button 
              onClick={() => setShowTimeWarning(false)}
              className="w-full"
            >
              Continue Exam
            </Button>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex-1 flex">
        {/* Question palette */}
        {showQuestionPalette && (
          <div className="w-80 bg-white shadow-sm border-r p-4">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Question Palette</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Total: {questions.length}</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>Answered: {statusSummary.answered + statusSummary['answered-and-marked']}</div>
                  <div>Not Answered: {statusSummary['not-answered']}</div>
                  <div>Marked: {statusSummary['marked-for-review'] + statusSummary['answered-and-marked']}</div>
                  <div>Not Visited: {statusSummary['not-visited']}</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-5 gap-2 mb-4">
              {questions.map((question, index) => {
                const state = questionStates[question.id];
                const status = state?.status || 'not-visited';
                const isCurrentQuestion = index === currentQuestionIndex;
                
                return (
                  <button
                    key={question.id}
                    onClick={() => goToQuestion(index)}
                    className={`
                      w-10 h-10 rounded text-sm font-medium border-2 transition-all
                      ${getStatusColor(status)}
                      ${isCurrentQuestion ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                      hover:scale-105
                    `}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            
            {/* Tools */}
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCalculator(!showCalculator)}
                className="w-full flex items-center justify-center"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Calculator
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowScratchpad(!showScratchpad)}
                className="w-full flex items-center justify-center"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Scratchpad
              </Button>
            </div>
          </div>
        )}
        
        {/* Question area */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Question header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-500">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <span className="text-sm text-gray-500">
                    {getCurrentQuestion()?.subject} | {getCurrentQuestion()?.difficulty}
                  </span>
                  <span className="text-sm text-green-600 font-medium">
                    +{getCurrentQuestion()?.marks} marks
                  </span>
                  {getCurrentQuestion()?.negativeMarks && (
                    <span className="text-sm text-red-600">
                      -{getCurrentQuestion()?.negativeMarks} for wrong answer
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    getStatusColor(getCurrentQuestionState().status)
                  }`}>
                    {getCurrentQuestionState().status.replace('-', ' ').toUpperCase()}
                  </div>
                </div>
              </div>
              
              {/* Question content */}
              <div className="mb-6">
                <p className="text-lg text-gray-900 leading-relaxed">
                  {getCurrentQuestion()?.question}
                </p>
              </div>
              
              {/* Answer options */}
              <div className="space-y-3">
                {getCurrentQuestion()?.type === 'MCQ' && getCurrentQuestion()?.options?.map((option: string, index: number) => {
                  const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
                  const isSelected = getCurrentQuestionState().answer === option;
                  
                  return (
                    <label
                      key={index}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      <span className="font-medium text-gray-700 min-w-[20px]">{optionLabel}.</span>
                      <span className="text-gray-900">{option}</span>
                      <input
                        type="radio"
                        name={`question-${getCurrentQuestion()?.id}`}
                        value={option}
                        checked={isSelected}
                        onChange={() => handleAnswerChange(option)}
                        className="sr-only"
                      />
                    </label>
                  );
                })}
                
                {getCurrentQuestion()?.type === 'MSQ' && getCurrentQuestion()?.options?.map((option: string, index: number) => {
                  const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
                  const currentAnswers = (getCurrentQuestionState().answer as string[]) || [];
                  const isSelected = currentAnswers.includes(option);
                  
                  return (
                    <label
                      key={index}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                        {isSelected && <CheckSquare className="w-3 h-3 text-white" />}
                      </div>
                      <span className="font-medium text-gray-700 min-w-[20px]">{optionLabel}.</span>
                      <span className="text-gray-900">{option}</span>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const newAnswers = e.target.checked
                            ? [...currentAnswers, option]
                            : currentAnswers.filter(a => a !== option);
                          handleAnswerChange(newAnswers);
                        }}
                        className="sr-only"
                      />
                    </label>
                  );
                })}
                
                {getCurrentQuestion()?.type === 'NAT' && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Enter your numerical answer:
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={getCurrentQuestionState().answer as number || ''}
                      onChange={(e) => handleAnswerChange(parseFloat(e.target.value) || 0)}
                      className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter numerical answer"
                    />
                  </div>
                )}
                
                {getCurrentQuestion()?.type === 'TRUE_FALSE' && getCurrentQuestion()?.options?.map((option: string, index: number) => {
                  const isSelected = getCurrentQuestionState().answer === option;
                  
                  return (
                    <label
                      key={index}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      <span className="text-gray-900">{option}</span>
                      <input
                        type="radio"
                        name={`question-${getCurrentQuestion()?.id}`}
                        value={option}
                        checked={isSelected}
                        onChange={() => handleAnswerChange(option)}
                        className="sr-only"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
            
            {/* Navigation buttons */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={goToPreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={clearAnswer}
                    className="flex items-center text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={markForReview}
                    className="flex items-center text-purple-600 border-purple-300 hover:bg-purple-50"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Mark for Review
                  </Button>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={saveAndNext}
                    disabled={currentQuestionIndex === questions.length - 1}
                    className="flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save & Next
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={goToNextQuestion}
                    disabled={currentQuestionIndex === questions.length - 1}
                    className="flex items-center"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Calculator modal */}
      {showCalculator && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border p-4 w-64 z-40">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Calculator</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCalculator(false)}
            >
              ×
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="bg-gray-100 p-2 rounded text-right font-mono">
              {calculatorDisplay}
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {['C', '÷', '×', '⌫', '7', '8', '9', '-', '4', '5', '6', '+', '1', '2', '3', '=', '0', '.', '00', '='].map((btn, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleCalculatorInput(btn)}
                  className={`h-10 ${btn === '=' ? 'col-span-2 bg-blue-500 text-white' : ''}`}
                >
                  {btn}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Scratchpad modal */}
      {showScratchpad && (
        <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-lg border p-4 w-80 h-64 z-40">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Scratchpad</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowScratchpad(false)}
            >
              ×
            </Button>
          </div>
          
          <textarea
            value={scratchpadContent}
            onChange={(e) => setScratchpadContent(e.target.value)}
            placeholder="Use this space for rough work..."
            className="w-full h-full resize-none border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
      
      {/* Submission dialog */}
      {showSubmissionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Submit Exam</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to submit your exam? This action cannot be undone.
            </p>
            
            <div className="bg-gray-50 p-3 rounded mb-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>Total Questions: {questions.length}</div>
                <div>Answered: {statusSummary.answered + statusSummary['answered-and-marked']}</div>
                <div>Not Answered: {statusSummary['not-answered'] + statusSummary['not-visited']}</div>
                <div>Marked for Review: {statusSummary['marked-for-review'] + statusSummary['answered-and-marked']}</div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowSubmissionDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleFinalSubmit}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Submit Exam
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AptitudeExamInterface; 
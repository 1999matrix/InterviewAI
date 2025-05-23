import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Code, 
  Upload, 
  FileText, 
  Briefcase, 
  Clock, 
  Check, 
  ArrowLeft, 
  ArrowRight,
  XCircle
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { saveResume, getQuestion } from '../../services/Sharedservice';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

const jobRoles = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Mobile Developer',
  'DevOps Engineer',
  'Data Scientist',
  'Machine Learning Engineer',
  'Product Manager',
  'UX/UI Designer',
  'QA Engineer',
];

const experienceLevels = [
  'Entry Level (0-2 years)',
  'Junior (2-4 years)',
  'Mid-Level (4-7 years)',
  'Senior (7+ years)',
  'Lead/Manager',
];

const CreateSessionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    interviewType: '',
    interviewMode: '',
    uploadResume: false,
    file: null as File | null,
    jobRole: '',
    experienceLevel: '',
    jobDescription: '',
  });
  const [fileName, setFileName] = useState('');
  const [fileError, setFileError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleInterviewTypeSelect = (type: string) => {
    setFormData({
      ...formData,
      interviewType: type,
    });
    setCurrentStep(2);
  };
  
  const handleResumeOptionSelect = (upload: boolean) => {
    setFormData({
      ...formData,
      uploadResume: upload,
    });
    setCurrentStep(upload ? 3 : 4);
  };
  
  const processFile = (file: File) => {
    setFileError('');
    if (file.type !== 'application/pdf') {
      setFileError('Please upload a PDF file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError('File size should be less than 5MB');
      return;
    }
    setFormData({
      ...formData,
      file,
    });
    setFileName(file.name);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handlePrevStep = () => {
    if (currentStep === 3 && formData.uploadResume) {
      setCurrentStep(2);
    } else if (currentStep === 4 && formData.uploadResume) {
      setCurrentStep(3);
    } else if (currentStep === 4 && !formData.uploadResume) {
      setCurrentStep(2);
    } else {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const isStepComplete = () => {
    switch (currentStep) {
      case 1:
        return !!formData.interviewType;
      case 2:
        return formData.uploadResume !== undefined;
      case 3:
        return formData.uploadResume ? !!formData.file : true;
      case 4:
        return !!formData.jobRole && !!formData.experienceLevel;
      default:
        return false;
    }
  };
  
  const handleSubmit = async () => {
    setIsLoading(true);
    setApiError(null);
    
    try {
      const experienceNumber = parseInt(formData.experienceLevel.split(' ')[0]) || 1;
      
      if (formData.uploadResume && formData.file) {
        const resumeFormData = new FormData();
        resumeFormData.append('username', user?.name || user?.email || 'guest');
        resumeFormData.append('pdf_file', formData.file);
        
        console.log('Uploading resume...');
        
        await saveResume('upload_cv', resumeFormData);
      }
      
      let questionResult;
      if (formData.interviewMode === 'comp2') {
        questionResult = await getQuestion(
          'start_test_comp2',
          user?.name || user?.email || 'guest',
          formData.jobRole,
          formData.jobDescription,
          experienceNumber,
          formData.uploadResume && !!formData.file
        );
      } else if (formData.interviewMode === 'comp3') {
        questionResult = await getQuestion(
          'start_test_comp3',
          user?.name || user?.email || 'guest',
          formData.jobRole,
          formData.jobDescription,
          experienceNumber,
          formData.uploadResume && !!formData.file
        );
      }
      
      if (questionResult && questionResult.status === 200) {
        navigate('/interview/session', {
          state: {
            question: questionResult.data.questions || questionResult.data.question,
            interviewType: formData.interviewType,
            user: user?.name || user?.email || 'guest',
            interviewMode: formData.interviewMode,
          }
        });
      }
    } catch (error: any) {
      console.error('Error starting interview:', error);
      setApiError(error.response?.data?.message || error.message || 'Failed to start the interview. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const removeFile = () => {
    setFormData({
      ...formData,
      file: null,
    });
    setFileName('');
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create Interview Session</h1>
        <p className="text-gray-600">Set up your practice interview session with the options below.</p>
      </div>
      
      {/* Progress Steps */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`rounded-full flex items-center justify-center h-8 w-8 ${
              currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {currentStep > 1 ? <Check size={16} /> : '1'}
            </div>
            <div className={`ml-2 text-sm font-medium ${
              currentStep >= 1 ? 'text-gray-900' : 'text-gray-500'
            }`}>
              Interview Type
            </div>
          </div>
          
          <div className={`flex-1 border-t mx-4 ${
            currentStep > 1 ? 'border-blue-600' : 'border-gray-300'
          }`}></div>
          
          <div className="flex items-center">
            <div className={`rounded-full flex items-center justify-center h-8 w-8 ${
              currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {currentStep > 2 ? <Check size={16} /> : '2'}
            </div>
            <div className={`ml-2 text-sm font-medium ${
              currentStep >= 2 ? 'text-gray-900' : 'text-gray-500'
            }`}>
              Resume
            </div>
          </div>
          
          <div className={`flex-1 border-t mx-4 ${
            currentStep > 2 ? 'border-blue-600' : 'border-gray-300'
          }`}></div>
          
          <div className="flex items-center">
            <div className={`rounded-full flex items-center justify-center h-8 w-8 ${
              currentStep >= 3 && formData.uploadResume ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {currentStep > 3 && formData.uploadResume ? <Check size={16} /> : '3'}
            </div>
            <div className={`ml-2 text-sm font-medium ${
              currentStep >= 3 && formData.uploadResume ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {formData.uploadResume ? 'Upload' : 'Job Details'}
            </div>
          </div>
          
          {formData.uploadResume && (
            <>
              <div className={`flex-1 border-t mx-4 ${
                currentStep > 3 ? 'border-blue-600' : 'border-gray-300'
              }`}></div>
              
              <div className="flex items-center">
                <div className={`rounded-full flex items-center justify-center h-8 w-8 ${
                  currentStep >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > 4 ? <Check size={16} /> : '4'}
                </div>
                <div className={`ml-2 text-sm font-medium ${
                  currentStep >= 4 ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  Job Details
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Step Content */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Select Interview Mode</h2>
            <p className="text-gray-600 mb-8">Choose your interview experience.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                type="button"
                className={`flex flex-col items-center justify-center border rounded-lg p-6 transition-all ${
                  formData.interviewMode === 'comp2'
                    ? 'border-blue-600 ring-2 ring-blue-200 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
                onClick={() => setFormData({ ...formData, interviewMode: 'comp2' })}
              >
                <h3 className="text-lg font-medium">No Cross-Questioning</h3>
                <p className="text-gray-500 text-sm mt-2 text-center">
                  Standard interview (Comp2): No follow-up questions.
                </p>
              </button>
              <button
                type="button"
                className={`flex flex-col items-center justify-center border rounded-lg p-6 transition-all ${
                  formData.interviewMode === 'comp3'
                    ? 'border-blue-600 ring-2 ring-blue-200 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
                onClick={() => setFormData({ ...formData, interviewMode: 'comp3' })}
              >
                <h3 className="text-lg font-medium">With Cross-Questioning</h3>
                <p className="text-gray-500 text-sm mt-2 text-center">
                  Dynamic interview (Comp3): Get follow-up questions based on your answers.
                </p>
              </button>
            </div>
            <div className="flex justify-end mt-10">
              <Button
                type="button"
                onClick={() => formData.interviewMode && setCurrentStep(2)}
                disabled={!formData.interviewMode}
                className="flex items-center"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
        
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Add Your Resume</h2>
            <p className="text-gray-600 mb-8">
              Would you like to upload your resume to receive tailored interview questions?
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                type="button"
                className={`flex flex-col items-center justify-center border rounded-lg p-6 transition-all ${
                  formData.uploadResume === true
                    ? 'border-blue-600 ring-2 ring-blue-200 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
                onClick={() => handleResumeOptionSelect(true)}
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium">Yes, Upload Resume</h3>
                <p className="text-gray-500 text-sm mt-2 text-center">
                  Get personalized questions based on your experience and skills.
                </p>
              </button>
              
              <button
                type="button"
                className={`flex flex-col items-center justify-center border rounded-lg p-6 transition-all ${
                  formData.uploadResume === false
                    ? 'border-blue-600 ring-2 ring-blue-200 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
                onClick={() => handleResumeOptionSelect(false)}
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium">No, Skip This Step</h3>
                <p className="text-gray-500 text-sm mt-2 text-center">
                  You'll still get quality questions based on your job role and experience level.
                </p>
              </button>
            </div>
          </div>
        )}
        
        {currentStep === 3 && formData.uploadResume && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Upload Your Resume</h2>
            <p className="text-gray-600 mb-8">
              Upload your resume in PDF format. We'll use this to tailor your interview questions.
            </p>
            
            {!formData.file ? (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Drag and drop your resume</h3>
                <p className="text-gray-500 text-sm mb-4">or click to browse (PDF only, max 5MB)</p>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="mx-auto mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  Browse Files
                </Button>
                
                {fileError && (
                  <p className="text-red-500 text-sm mt-3">{fileError}</p>
                )}
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-md">
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">{fileName}</p>
                      <p className="text-sm text-gray-500">PDF Document</p>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={removeFile}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
            
            <div className="flex justify-between mt-10">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <Button
                type="button"
                onClick={() => setCurrentStep(4)}
                disabled={!formData.file}
                className="flex items-center"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
        
        {((currentStep === 4 && formData.uploadResume) || (currentStep === 3 && !formData.uploadResume)) && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Job Details</h2>
            <p className="text-gray-600 mb-8">
              Provide information about the job you're preparing for.
            </p>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="jobRole" className="block text-sm font-medium text-gray-700 mb-1">
                  Job Role
                </label>
                <select
                  id="jobRole"
                  name="jobRole"
                  value={formData.jobRole}
                  onChange={handleSelectChange}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a role</option>
                  {jobRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-1">
                  Experience Level
                </label>
                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleSelectChange}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select experience level</option>
                  {experienceLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Job Description (Optional)
                </label>
                <textarea
                  id="jobDescription"
                  name="jobDescription"
                  rows={5}
                  value={formData.jobDescription}
                  onChange={handleTextareaChange}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Paste the job description here for more tailored questions..."
                ></textarea>
              </div>
            </div>
            
            <div className="flex justify-between mt-10">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!isStepComplete() || isLoading}
                className="flex items-center"
              >
                {isLoading ? 'Starting...' : 'Start Interview'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            {apiError && (
              <p className="text-red-500 text-sm mt-3">{apiError}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateSessionPage;
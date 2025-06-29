import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Video, 
  Mic, 
  Shield, 
  Clock, 
  Users, 
  Award, 
  Headphones,
  Play,
  CheckCircle,
  ArrowRight,
  Star,
  Zap
} from 'lucide-react';
import Button from '../components/ui/Button';

const DemoPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeDemo, setActiveDemo] = useState<'comp2' | 'comp3' | null>(null);

  const handleStartDemo = (mode: 'comp2' | 'comp3') => {
    navigate('/interview/session', {
      state: {
        question: "Welcome to your AI interview demo. This is a sample question to demonstrate our professional interview platform. Please introduce yourself and tell me about your background.",
        interviewType: mode === 'comp2' ? 'Standard Interview Demo' : 'Cross-Questioning Interview Demo',
        user: 'Demo User',
        interviewMode: mode,
      }
    });
  };

  const features = [
    {
      icon: <Brain className="w-8 h-8 text-blue-600" />,
      title: "AI-Powered Interviews",
      description: "Advanced AI conducts natural, conversational interviews tailored to your role and experience."
    },
    {
      icon: <Video className="w-8 h-8 text-blue-600" />,
      title: "Professional Video Interface",
      description: "Enterprise-grade video conferencing experience similar to Microsoft Teams and Google Meet."
    },
    {
      icon: <Mic className="w-8 h-8 text-blue-600" />,
      title: "High-Quality Voice Recording",
      description: "Crystal-clear audio recording with noise cancellation and automatic transcription."
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Secure & Private",
      description: "Enterprise-level security ensures your interview data remains confidential and protected."
    },
    {
      icon: <Clock className="w-8 h-8 text-blue-600" />,
      title: "Real-Time Feedback",
      description: "Instant analysis and feedback on your responses to help improve your interview skills."
    },
    {
      icon: <Award className="w-8 h-8 text-blue-600" />,
      title: "Performance Analytics",
      description: "Detailed reports and insights to track your progress and identify areas for improvement."
    }
  ];

  const interviewModes = [
    {
      id: 'comp2',
      title: 'Standard Interview',
      subtitle: 'Perfect for practice sessions',
      description: 'Experience a structured interview with carefully crafted questions. No follow-up questions, allowing you to focus on delivering your best responses.',
      features: [
        'Pre-defined question sequence',
        'Consistent interview structure',
        'Ideal for preparation',
        'Clear progression through topics'
      ],
      icon: <Users className="w-12 h-12 text-blue-600" />,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'comp3',
      title: 'Cross-Questioning Interview',
      subtitle: 'Advanced interactive experience',
      description: 'Dynamic interview experience with intelligent follow-up questions based on your responses. Simulates real-world interview scenarios.',
      features: [
        'Adaptive questioning based on answers',
        'Follow-up and clarification questions',
        'More realistic interview simulation',
        'Deeper skill assessment'
      ],
      icon: <Brain className="w-12 h-12 text-blue-600" />,
      color: 'from-purple-500 to-blue-600'
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer",
      company: "Tech Corp",
      rating: 5,
      comment: "The AI interview platform helped me prepare for my dream job. The cross-questioning feature made it feel incredibly realistic!"
    },
    {
      name: "Michael Rodriguez",
      role: "Product Manager",
      company: "Innovation Labs",
      rating: 5,
      comment: "Outstanding platform! The professional interface and detailed feedback helped me land my current role. Highly recommended!"
    },
    {
      name: "Emma Thompson",
      role: "Data Scientist",
      company: "Analytics Pro",
      rating: 5,
      comment: "The voice recording quality is excellent, and the AI interviewer asks incredibly relevant questions. Game-changing tool!"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white bg-opacity-20 rounded-full">
                <Brain className="w-16 h-16 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              AI Interview Platform
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Experience the future of interview preparation with our enterprise-grade AI platform. 
              Professional, secure, and incredibly effective.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setActiveDemo('comp2')}
                className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-3 text-lg font-semibold"
              >
                <Play className="w-5 h-5 mr-2" />
                Try Standard Demo
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setActiveDemo('comp3')}
                className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg font-semibold"
              >
                <Zap className="w-5 h-5 mr-2" />
                Try Advanced Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built with enterprise-grade technology and designed for professionals who demand the best
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border p-8 hover:shadow-lg transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interview Modes Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Interview Experience
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Two powerful modes designed to match your preparation needs and skill level
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {interviewModes.map((mode) => (
              <div key={mode.id} className="relative">
                <div className={`bg-gradient-to-br ${mode.color} rounded-2xl p-8 text-white h-full`}>
                  <div className="flex items-center mb-6">
                    {mode.icon}
                    <div className="ml-4">
                      <h3 className="text-2xl font-bold">{mode.title}</h3>
                      <p className="text-blue-100">{mode.subtitle}</p>
                    </div>
                  </div>
                  
                  <p className="text-lg mb-6 text-blue-50">{mode.description}</p>
                  
                  <ul className="space-y-3 mb-8">
                    {mode.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-blue-200 mr-3 flex-shrink-0" />
                        <span className="text-blue-50">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    onClick={() => handleStartDemo(mode.id as 'comp2' | 'comp3')}
                    className="w-full bg-white text-blue-600 hover:bg-gray-50 font-semibold py-3"
                  >
                    Start {mode.title} Demo
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Professionals
            </h2>
            <p className="text-xl text-gray-600">
              See what our users say about their interview preparation experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.comment}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role} at {testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals who have improved their interview skills with our AI platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/interview/create')}
              className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-3 text-lg font-semibold"
            >
              Start Your Interview
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/pricing')}
              className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg font-semibold"
            >
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* Demo Modal */}
      {activeDemo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Start {activeDemo === 'comp2' ? 'Standard' : 'Cross-Questioning'} Demo
            </h3>
            <p className="text-gray-600 mb-6">
              You're about to experience our professional AI interview platform. 
              This demo will showcase the {activeDemo === 'comp2' ? 'standard interview' : 'cross-questioning'} mode.
            </p>
            <div className="flex space-x-3">
              <Button
                onClick={() => handleStartDemo(activeDemo)}
                className="flex-1"
              >
                Launch Demo
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveDemo(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
  </div>
);
};

export default DemoPage; 
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Brain,
  FileText,
  LineChart,
  Clock,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import Button from '../components/ui/Button';

const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-rose-100 to-blue-300 text-stone-800 py-20 md:py-32">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Ace Your Next Interview with AI-Powered Practice
              </h1>
              <p className="text-xl md:text-2xl text-stone-600">
                Prepare smarter, not harder. Get personalized interview practice and ATS-optimized resumes powered by artificial intelligence.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/signup">
                  <Button className="text-lg px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:bg-gradient-to-l hover:from-blue-600 hover:to-purple-600">
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/demo">
                  <Button variant="outline" className="text-lg px-8 py-3 bg-slate-800 text-white hover:bg-slate-600 font-bold">
                    Watch Demo
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block relative">
              <div className="absolute -top-12 -left-12 w-24 h-24 bg-blue-500 opacity-20 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-purple-500 opacity-20 rounded-full animate-pulse delay-700"></div>
              <img 
                src="https://t3.ftcdn.net/jpg/06/41/85/58/360_F_641855825_rjqxXUjgaAcMSFvpvSrqow0J3PHHDvCi.jpg" 
                alt="Person on video interview" 
                className="rounded-lg shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-stone-800">Prepare for Success</h2>
            <p className="text-xl text-stone-600 max-w-3xl mx-auto">
              Our AI-powered platform helps you prepare for interviews with personalized practice sessions and resume optimization.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Brain className="w-10 h-10 text-blue-400" />}
              title="AI Interview Practice"
              description="Practice with our AI that simulates real interview scenarios and provides instant feedback on your responses."
            />
            <FeatureCard 
              icon={<FileText className="w-10 h-10 text-blue-400 " />}
              title="ATS Resume Optimization" 
              description="Ensure your resume gets past Applicant Tracking Systems with our AI-powered resume scoring and optimization."
            />
            <FeatureCard 
              icon={<LineChart className="w-10 h-10 text-blue-400" />}
              title="Track Your Progress"
              description="Monitor your improvement over time with detailed analytics and personalized recommendations."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-stone-800">How It Works</h2>
            <p className="text-xl text-stone-600 max-w-3xl mx-auto">
              Our platform makes interview preparation simple, effective, and tailored to your needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <StepCard 
              number="1"
              title="Create Account"
              description="Sign up and tell us about your career goals and target positions."
            />
            <StepCard 
              number="2"
              title="Upload Resume"
              description="Upload your resume for AI analysis and optimization suggestions."
            />
            <StepCard 
              number="3"
              title="Practice Interviews"
              description="Select your job role and experience level for tailored interview practice."
            />
            <StepCard 
              number="4"
              title="Get Feedback"
              description="Receive detailed feedback and improve with each practice session."
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-stone-800">Success Stories</h2>
            <p className="text-xl text-stone-600 max-w-3xl mx-auto">
              See how InterviewAI has helped job seekers land their dream roles.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="After practicing with InterviewAI for two weeks, I felt so much more confident in my real interview. I got the job!"
              name="Sarah Johnson"
              role="Software Engineer"
              image="https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg"
            />
            <TestimonialCard 
              quote="The ATS optimization suggestions helped my resume get through to hiring managers, leading to 3x more interviews."
              name="Michael Rodriguez"
              role="Marketing Director"
              image="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg"
            />
            <TestimonialCard 
              quote="As someone with interview anxiety, this platform was a game-changer. I could practice at my own pace and build confidence."
              name="Emily Chen"
              role="Product Manager"
              image="https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-rose-100 to-blue-300 text-white">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-stone-800">Ready to Ace Your Next Interview?</h2>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto mb-8">
            Join thousands of job seekers who are landing their dream jobs with the help of InterviewAI.
          </p>
          <Link to="/signup">
            <Button className="text-lg px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:bg-gradient-to-l hover:from-blue-600 hover:to-purple-600">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2 text-stone-700">{title}</h3>
    <p className="text-stone-600">{description}</p>
  </div>
);

const StepCard: React.FC<{
  number: string;
  title: string;
  description: string;
}> = ({ number, title, description }) => (
  <div className="flex flex-col items-center text-center">
    <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">
      {number}
    </div>
    <h3 className="text-xl font-semibold mb-2 text-stone-700">{title}</h3>
    <p className="text-stone-600">{description}</p>
  </div>
);

const TestimonialCard: React.FC<{
  quote: string;
  name: string;
  role: string;
  image: string;
}> = ({ quote, name, role, image }) => (
  <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
    <p className="text-stone-800 mb-6 italic">"{quote}"</p>
    <div className="flex items-center">
      <img 
        src={image} 
        alt={name} 
        className="w-12 h-12 rounded-full object-cover mr-4"
      />
      <div>
        <p className="font-semibold text-stone-800">{name}</p>
        <p className="text-stone-600 text-sm">{role}</p>
      </div>
    </div>
  </div>
);

export default LandingPage;
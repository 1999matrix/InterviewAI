import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  Calendar, 
  BarChart3, 
  ArrowUpRight, 
  Sparkles,
  Award,
  FileCheck,
  ExternalLink
} from 'lucide-react';
import Button from '../../components/ui/Button';
import ActivityHeatmap from '../../components/dashboard/ActivityHeatmap';
import ProgressChart from '../../components/dashboard/ProgressChart';
import RecentInterviewCard from '../../components/dashboard/RecentInterviewCard';
import ThemeToggle from '../../components/ui/ThemeToggle';
import { useTheme } from '../../contexts/ThemeContext';

const ProfilePage: React.FC = () => {
  const { theme } = useTheme();
  
  // Mock data for recent interviews
  const recentInterviews = [
    {
      id: 1,
      title: 'React Frontend Developer',
      date: '2025-03-15',
      duration: 35,
      score: 85,
      questionCount: 12,
    },
    {
      id: 2,
      title: 'Full Stack JavaScript',
      date: '2025-03-12',
      duration: 42,
      score: 78,
      questionCount: 15,
    },
    {
      id: 3,
      title: 'Backend Node.js Engineer',
      date: '2025-03-08',
      duration: 28,
      score: 92,
      questionCount: 10,
    },
  ];
  
  return (
    <div className="space-y-6 theme-transition">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">
            Interview Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your interview preparation progress and performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/create-session">
            <Button className="flex items-center hover-lift hover-glow">
              <Sparkles className="w-4 h-4 mr-2" />
              Create Session
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Practice Time" 
          value="18.5 hours" 
          icon={<Clock className="w-5 h-5" />} 
          change="+2.5 hrs this week"
          isPositive={true}
        />
        <StatCard 
          title="Practice Sessions" 
          value="24" 
          icon={<Calendar className="w-5 h-5" />} 
          change="+3 sessions this week"
          isPositive={true}
        />
        <StatCard 
          title="Average Score" 
          value="83%" 
          icon={<BarChart3 className="w-5 h-5" />} 
          change="+5% from last month"
          isPositive={true}
        />
        <StatCard 
          title="Resume Score" 
          value="92/100" 
          icon={<FileCheck className="w-5 h-5" />} 
          change="+8 points improvement"
          isPositive={true}
        />
      </div>
      
      {/* Recent Activity and Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Activity Heatmap */}
          <div className="card-interactive p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold dark:text-white">Activity</h2>
              <Link to="/progress" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center theme-transition">
                View details
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
            <ActivityHeatmap />
          </div>
          
          {/* Progress Chart */}
          <div className="card-interactive p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold dark:text-white">Your Progress</h2>
              <Link to="/progress" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center theme-transition">
                View details
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
            <ProgressChart />
          </div>
        </div>
        
        {/* Recent Sessions */}
        <div className="lg:col-span-1">
          <div className="card-interactive p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold dark:text-white">Recent Sessions</h2>
              <Link to="/sessions" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center theme-transition">
                View all
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentInterviews.map((interview) => (
                <RecentInterviewCard key={interview.id} interview={interview} />
              ))}
            </div>
            
            <div className="mt-6">
              <Link to="/create-session" className="block hover-lift">
                <Button 
                  variant={theme === 'dark' ? 'secondary' : 'outline'} 
                  fullWidth 
                  className="theme-transition"
                >
                  Start New Session
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Skill Progress */}
      <div className="card-interactive p-6">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">Interview Skills Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkillCard
            title="Technical Knowledge"
            score={85}
            improvement="+12%"
          />
          <SkillCard
            title="Communication"
            score={78}
            improvement="+8%"
          />
          <SkillCard
            title="Problem Solving"
            score={92}
            improvement="+15%"
          />
          <SkillCard
            title="Behavioral Skills"
            score={88}
            improvement="+10%"
          />
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  change: string;
  isPositive: boolean;
}> = ({ title, value, icon, change, isPositive }) => {
  return (
    <div className="card hover-lift border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</span>
        <div className="p-2 bg-blue-50 dark:bg-blue-900 rounded-lg text-blue-700 dark:text-blue-400">
          {icon}
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold dark:text-white">{value}</span>
        <div className={`flex items-center mt-1 text-sm ${isPositive 
          ? 'text-green-600 dark:text-green-400'
          : 'text-red-600 dark:text-red-400'}`}
        >
          <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
          <span>{change}</span>
        </div>
      </div>
    </div>
  );
};

const SkillCard: React.FC<{
  title: string;
  score: number;
  improvement: string;
}> = ({ title, score, improvement }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-all duration-200 hover:shadow-md hover:bg-gray-100 dark:hover:bg-gray-600">
      <h3 className="font-medium mb-2 dark:text-gray-200">{title}</h3>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl font-bold dark:text-white">{score}%</span>
        <span className="text-green-600 dark:text-green-400">{improvement}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
        <div 
          className="bg-primary-600 dark:bg-primary-400 rounded-full h-2"
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProfilePage;
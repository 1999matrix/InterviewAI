import React from 'react';
import { Calendar, Clock, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Interview {
  id: number;
  title: string;
  date: string;
  duration: number;
  score: number;
  questionCount: number;
}

interface RecentInterviewCardProps {
  interview: Interview;
}

const RecentInterviewCard: React.FC<RecentInterviewCardProps> = ({ interview }) => {
  // Format the date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Determine the score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  return (
    <Link to={`/sessions/${interview.id}`} className="block">
      <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
        <h3 className="font-medium text-gray-900 mb-2">{interview.title}</h3>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1.5 text-gray-400" />
            <span>{formatDate(interview.date)}</span>
          </div>
          
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
            <span>{interview.duration} mins</span>
          </div>
          
          <div className="flex items-center">
            <BarChart3 className="w-4 h-4 mr-1.5 text-gray-400" />
            <span className={getScoreColor(interview.score)}>{interview.score}%</span>
          </div>
        </div>
        
        <div className="mt-3 flex justify-between items-center">
          <span className="text-xs text-gray-500">{interview.questionCount} questions</span>
          <span className="text-xs text-blue-600">View Details</span>
        </div>
      </div>
    </Link>
  );
};

export default RecentInterviewCard;
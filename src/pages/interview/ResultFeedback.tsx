import React from 'react';
//import FeedbackCard from '../components/FeedbackCard';

interface FeedbackCardProps {
  comments: string;
}

const feedbackData = {
  candidateName: 'Prashant Rajpoot',
  position: 'Frontend Developer',
  averageRating: 3.9,
  feedbacks: 'The candidate demonstrated a strong understanding of core React concepts, including component lifecycle, state management, and props. Their ability to articulate the differences between class and functional components was clear. The candidate also showed proficiency in using hooks and had a good grasp of virtual DOM concepts. Their problem-solving approach to the coding challenge was logical and well-structured, although the solution was not fully completed.',
};

const ResultFeedback: React.FC = () => {
  const { candidateName, position, averageRating, feedbacks } = feedbackData;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">{candidateName}</h1>
        <p className="text-gray-600">Interviewed for: <span className="font-medium">{position}</span></p>
        <p className="text-gray-600 mt-1">Average Rating: <span className="text-yellow-500 font-semibold">{averageRating}/5</span></p>
        <FeedbackCard comments= {feedbacks} />
      </div>
    </div>
  );
};

const FeedbackCard: React.FC<FeedbackCardProps> = ({ comments }) => {
  return (
    <div className="bg-white rounded-lg p-4">
      <p className="text-gray-600 text-md">{comments}</p>
    </div>
  );
};

export default ResultFeedback;
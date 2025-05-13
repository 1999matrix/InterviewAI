import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

// Generate mock data for the progress chart
const generateProgressData = () => {
  const data = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  
  let interviewScore = 65;
  let resumeScore = 72;
  
  // Generate data for the last 6 months
  for (let i = 5; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    
    // Simulate progress with some randomness and upward trend
    interviewScore += Math.floor(Math.random() * 5) - 1;
    resumeScore += Math.floor(Math.random() * 4);
    
    // Keep scores in range
    interviewScore = Math.min(98, Math.max(60, interviewScore));
    resumeScore = Math.min(100, Math.max(70, resumeScore));
    
    data.push({
      month: months[monthIndex],
      interviewScore: interviewScore,
      resumeScore: resumeScore,
    });
  }
  
  return data;
};

const ProgressChart: React.FC = () => {
  const data = generateProgressData();
  
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="month" stroke="#9ca3af" />
          <YAxis domain={[50, 100]} stroke="#9ca3af" />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="interviewScore"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
            name="Interview Score"
          />
          <Line
            type="monotone"
            dataKey="resumeScore"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
            name="Resume Score"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgressChart;
import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from 'react-tooltip';

// Generate random activity data for the heatmap
const generateActivityData = () => {
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);
  
  const values = [];
  let currentDate = new Date(oneYearAgo);
  
  while (currentDate <= today) {
    // Add some random activity, with higher probability for recent dates
    const daysAgo = Math.floor((today.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    const probability = Math.max(0.1, 1 - daysAgo / 365); // Higher probability for recent dates
    
    if (Math.random() < probability * 0.4) {
      const count = Math.floor(Math.random() * 4) + 1; // 1 to 4 activities
      values.push({
        date: new Date(currentDate).toISOString().split('T')[0],
        count: count,
      });
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return values;
};

const ActivityHeatmap: React.FC = () => {
  const activityData = generateActivityData();
  
  const getTooltipDataAttrs = (value: any) => {
    if (!value || !value.date) {
      return { 'data-tooltip-id': 'activity-tooltip', 'data-tooltip-content': 'No activity' };
    }
    return {
      'data-tooltip-id': 'activity-tooltip',
      'data-tooltip-content': `${value.date}: ${value.count} ${value.count === 1 ? 'session' : 'sessions'}`,
    };
  };
  
  const getClassForValue = (value: any) => {
    if (!value || !value.count) {
      return 'color-empty';
    }
    
    if (value.count === 1) {
      return 'color-scale-1';
    } else if (value.count === 2) {
      return 'color-scale-2';
    } else if (value.count === 3) {
      return 'color-scale-3';
    } else {
      return 'color-scale-4';
    }
  };
  
  return (
    <div className="activity-heatmap">
      <CalendarHeatmap
        startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
        endDate={new Date()}
        values={activityData}
        classForValue={getClassForValue}
        tooltipDataAttrs={getTooltipDataAttrs}
      />
      <Tooltip id="activity-tooltip" />
      
      <style>{`
        .activity-heatmap {
          margin: 0 -10px;
        }
        .activity-heatmap :global(.color-empty) {
          fill: #f3f4f6;
        }
        .activity-heatmap :global(.color-scale-1) {
          fill: #93c5fd;
        }
        .activity-heatmap :global(.color-scale-2) {
          fill: #60a5fa;
        }
        .activity-heatmap :global(.color-scale-3) {
          fill: #3b82f6;
        }
        .activity-heatmap :global(.color-scale-4) {
          fill: #2563eb;
        }
        .activity-heatmap :global(.react-calendar-heatmap) {
          margin-top: 10px;
        }
        .activity-heatmap :global(.react-calendar-heatmap text) {
          font-size: 7px;
          fill: #9ca3af;
        }
        .activity-heatmap :global(.react-calendar-heatmap rect) {
          rx: 2;
        }
      `}</style>
    </div>
  );
};

export default ActivityHeatmap;
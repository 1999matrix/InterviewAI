import React from 'react';
import { Brain } from 'lucide-react';

const Logo: React.FC = () => {
  return (
    <div className="relative h-8 w-8 flex items-center justify-center bg-blue-600 text-white rounded-md">
      <Brain size={20} />
      <div className="absolute -right-1 -top-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
    </div>
  );
};

export default Logo;
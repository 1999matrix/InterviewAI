import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TraditionalAuthProvider } from './contexts/TraditionalAuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AppRoutes from './routes';
import './index.css';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <TraditionalAuthProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </TraditionalAuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
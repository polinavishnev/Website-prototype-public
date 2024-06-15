/**
 * The main component of the application.
 * Renders different slides based on the current route.
 *
 * @returns {JSX.Element} The rendered application component.
 */

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WelcomeSlide from './components/WelcomeSlide';
import CopyPasteTextSlide from './components/CopyPasteTextSlide';
import AddModifyTopicsSlide from './components/AddModifyTopicsSlide';
import QuizPage from './components/QuizPage';
import { TopicsProvider } from './TopicsContext'; // Adjust the path as necessary


function App() {
  return (
    <Router>
      <TopicsProvider>
        <Routes>
          <Route path="/" element={<WelcomeSlide />} />
          <Route path="/upload" element={<CopyPasteTextSlide />} />
          <Route path="/topics" element={<AddModifyTopicsSlide />} />
          <Route path="/quiz" element={<QuizPage />} />
        </Routes>
      </TopicsProvider>
    </Router>
  );
}

export default App;

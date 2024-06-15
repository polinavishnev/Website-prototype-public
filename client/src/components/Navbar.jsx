import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTopics } from '../TopicsContext';

const API_URL = process.env.NODE_ENV === "production"
  ? "https://website-prototype-production.up.railway.app"
  : "http://localhost:3001";

/**
 * Renders a navigation bar component.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.currentStep - The current step in the navigation.
 * @returns {JSX.Element} The rendered navigation bar component.
 */

const NavBar = ({ currentStep }) => {
  // Define the steps in an array for scalability and easier management
  const steps = ['Upload', 'Topics', 'Quiz'];
  const navigate = useNavigate();
  const { isUploadCompleted, isFocusCompleted, resetCompletionStatus } = useTopics();

  // Function to handle navigation to different steps based on completion status
  const handleNavigate = (path) => {
    if (path === '/topics' && !isUploadCompleted) {
      alert('Please complete the upload first.');
      return;
    } else if (path === '/quiz' && !isFocusCompleted) {
      alert('Please complete the topic selection first.');
      return;
    }
    navigate(path);
  };


  const handleCleanup = async () => {
    // Make an API call to the backend to trigger the cleanup
    try {
      const response = await fetch(`${API_URL}/cleanup`, {
        method: 'POST',
      });
      const data = await response.json();
      console.log(data.message);
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };


  const handleRefresh = async () => {
    const confirmRestart = window.confirm("Are you sure you would like to start a new session? All the materials you've uploaded and topics you've selected will be erased.");
    if (confirmRestart) { // If user confirms, then proceed with cleanup and navigate
      await handleCleanup();
      resetCompletionStatus(); // Resets the completion status stored in context
      navigate('/');
    }
};

return (
  <nav style={{ fontFamily: 'Mulish', display: 'flex', justifyContent: 'space-around', padding: '1rem', background: '#f0f0f0' }}>
    {steps.map((step, index) => (
      <button
        key={index}
        onClick={() => handleNavigate(`/${step.toLowerCase()}`)}
        className={`nav-button ${index === steps.indexOf(currentStep) ? 'current' : ''}`}
      >
        {step}
      </button>
    ))}
    <button className="nav-button restart-button" onClick={handleRefresh}>Restart</button>
  </nav>
);

};

export default NavBar;

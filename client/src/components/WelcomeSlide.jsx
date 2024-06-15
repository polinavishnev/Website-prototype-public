/**
 * Component representing the welcome slide.
 * @returns {JSX.Element} The rendered welcome slide.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const WelcomeSlide = () => {
    
    // Use the navigate hook to programmatically navigate to the next slide
    const navigate = useNavigate();

    return (
        <div style={{ fontFamily: 'Mulish', textAlign: 'left' }}>
            <div className="description">
                <h1>Welcome!</h1>
                <p>I am Discearn, your personalized quizzing tool.</p> 
                <p>I’m here to help you better engage with and understand the text you read. </p>
                <p>Would you like to get started?</p>
                <br/>
            </div>
            
            <button className="welcome-button" onClick={() => navigate('/upload')}>Continue</button>
        </div>
    );
};

export default WelcomeSlide;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './Navbar';
import '../App.css';
import { useTopics } from '../TopicsContext';

const API_URL = process.env.NODE_ENV === "production"
  ? "https://website-prototype-production.up.railway.app"
  : "http://localhost:3001";

const API_KEY = process.env.REACT_APP_API_KEY;

/**
 * Represents a component for uploading and processing text for the vector database. The component also generates topics.
 *
 * @component
 * @returns {JSX.Element} The CopyPasteTextSlide component.
 */

const CopyPasteTextSlide = () => {
  const [text, setText] = useState('');
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [extractedTopics, setExtractedTopics] = useState([]);
  const [textUploaded, setTextUploaded] = useState(false);
  const { markUploadCompleted } = useTopics();

  const handleTextChange = (e) => setText(e.target.value);

  const handleUpload = async () => {
    if (text.trim() === "") return;

    setUploading(true);
    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('Failed to upload text.');

      console.log("Text uploaded successfully");
      markUploadCompleted();
      setTextUploaded(true); // Keep this to manage the UI state

      const croppedText = text.substring(0, 7000);
      const prompt = `Based on this text, generate a list of 3 specific but overarching topics of 3-4 words that would be relevant to be quizzed on in relation to this text. \n\nText: ${croppedText}`;

      const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "system", content: prompt }],
          temperature: 0.8,
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const newExtractedTopics = aiData.choices[0].message.content
          .split("\n")
          .filter(line => line.trim().length > 0)
          .map(line => line.trim());

        setExtractedTopics(currentTopics => [...currentTopics, ...newExtractedTopics]);
        console.log("Extracted topics:", extractedTopics);
      } else {
        throw new Error('Error fetching topics from OpenAI API');
      }
    } catch (error) {
      console.error("Error during upload or topic extraction:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleClearText = () => {
    setText('');
    // Do not change textUploaded here; allow users to add more text
  };

  // Navigate only when user decides by clicking "I'm ready to narrow my focus!"
  const handleNavigateToFocus = () => {
    if (extractedTopics.length > 0) {
      navigate('/topics', { state: { topics: extractedTopics } });
    } else {
      alert("Please upload some text to extract topics.");
    }
  };

  return (
    <div style={{ fontFamily: 'Mulish' }}>
      <NavBar currentStep="Upload"/>
      <div className='description'>
        <h2>Step 1: Upload text</h2>
        <p>Let’s get started! I will now ask you to copy-paste the text you would like to be quizzed on into the textbox below.</p>
      </div>
      <textarea className="textarea" value={text} onChange={handleTextChange} placeholder="Paste here" disabled={uploading} />
      <br/>
      <button className="button" onClick={handleUpload} disabled={uploading || text.trim() === ""}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {textUploaded && (
        <div className="button-bar">
          <button className="button" onClick={handleClearText}>
            I want to upload more text
          </button>
          <button className="button" onClick={handleNavigateToFocus}>
            I'm ready to select topics to focus on
          </button>
        </div>
      )}
    </div>
  );
};

export default CopyPasteTextSlide;

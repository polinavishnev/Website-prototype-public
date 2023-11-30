import React, { useState } from 'react';

const API_KEY = process.env.REACT_APP_API_KEY;

function Upload({ onUploadFinish }) {
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (text.trim() !== '') {
      setUploading(true);
  
      try {
        // Upload text to your server
        const croppedText = text.substring(0, 7000);
        const prompt = `Based on this text, generate a list of 3 specific but overarching topics that would be relevant to be quizzed on in relation to this text. \n\nText: ${croppedText}`;
  
        const response = await fetch('http://localhost:3001/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        });
  
        if (response.ok) {
          console.log('Text uploaded successfully');
  
          // Generate topics using OpenAI API after text upload
          const apiRequestBody = {
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: prompt }, // Use the uploaded text here
            ],
            temperature: 0.8,
          };
  
          const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiRequestBody),
          });
  
          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            console.log('AI Response:', aiData);
  
            // Extract topics from AI response (adjust this logic based on API response structure)
            const extractedTopics = aiData.choices[0].message.content
                .split('\n')
                .filter(line => line.trim().length > 0) // Filter out empty lines
                .map(line => line.trim()) 
  
            // Call the callback function with the extracted topics
            console.log('Extracted topics:', extractedTopics)
            onUploadFinish(extractedTopics);
          } else {
            console.error('Error fetching topics from AI API');
            // Handle error fetching topics from the AI API
          }
        } else {
          const errorMessage = await response.text(); // Get the error message
          console.error('Error uploading text:', errorMessage);
          // Handle error uploading text
        }
      } catch (error) {
        console.error('Error:', error);
        // Handle general error scenario
      }
  
      setUploading(false);
    }
  };
  

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  return (
    <div className="upload">
      <h2>Upload</h2>
      <form onSubmit={handleTextSubmit}>
        <label htmlFor="text">Paste your text here:</label>
        <textarea
          id="text"
          name="text"
          value={text}
          onChange={handleTextChange}
          rows={10}
          cols={50}
          placeholder="Paste your text here..."
        ></textarea>
        <br />
        <button type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
    </div>
  );
}

export default Upload;

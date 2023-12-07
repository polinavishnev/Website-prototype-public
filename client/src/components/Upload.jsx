import React, { useState } from "react";

const API_KEY = process.env.REACT_APP_API_KEY;

// The API URL is different depending on whether the app is running in production or locally.
// It represents the link on which the server is running.
const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://website-prototype-production.up.railway.app"
    : "http://localhost:3001";


/** 
 * This component is responsible for uploading the text to the Pinecone database.
 *
 * @param {function} onUploadFinish - Callback function to be called after the text is uploaded
 * @returns {JSX.Element} - Upload component
*/

function Upload({ onUploadFinish }) {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);


  // Handles the submission of text for upload and topic generation.
  const handleTextSubmit = async (e) => {

    e.preventDefault();
    if (text.trim() !== "") {
      setUploading(true);

      try {

        // Upload text to Pinecone database
        const response = await fetch(`${API_URL}/upload`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        });

        if (response.ok) {
          console.log("Text uploaded successfully");

          // Trim text for OpenAI context window
          const croppedText = text.substring(0, 7000);
          const prompt = `Based on this text, generate a list of 3 specific but overarching topics of 3-4 words that would be relevant to be quizzed on in relation to this text. \n\nText: ${croppedText}`;


          // Send a request to OpenAI API to generate topics after text upload
          const apiRequestBody = {
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: prompt },
            ],
            temperature: 0.8,
          };

          // Get topics back from OpenAI API
          const aiResponse = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(apiRequestBody),
            }
          );
          

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();

            // Extract topics from AI response
            const extractedTopics = aiData.choices[0].message.content
              .split("\n")
              .filter((line) => line.trim().length > 0) // Filter out empty lines
              .map((line) => line.trim());

            // Call the callback function with the extracted topics
            console.log("Extracted topics:", extractedTopics);
            onUploadFinish(extractedTopics);
          } else {
            // Handle error fetching topics from OpenAI API
            console.error("Error fetching topics from OpenAI API");
          }
        } else {
          // Handle error uploading text
          const errorMessage = await response.text(); // Get the error message
          console.error("Error uploading text:", errorMessage);
        }
      } catch (error) {
      // Handle general error scenario
        console.error("Error:", error);
      }

      setUploading(false);
    }
  };

  const handleTextChange = (e) => {
    // Update the text state variable with the text in the text area as the user types
    setText(e.target.value);
  };

  return (
    <div className="upload">

      <h2>Upload</h2>

      {/* Form to paste the text into */}
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

        {/* Button to submit the text for upload. Will show "Uploading" while uploading and topic extraction occurs.*/}
        <button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>

      </form>
    </div>
  );
}

export default Upload;

import React, { useState, useEffect } from 'react';
import "../App.css";
import Chat from './Chat';

const REACT_APP_API_KEY = process.env.REACT_APP_API_KEY;


/**
 * A card component that displays a question and allows the user to submit an answer.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.question - The question to be displayed on the card.
 * @param {string} props.topic - The topic related to the question.
 * @param {string} props.initialAnswer - The initial answer value for the textarea.
 * @param {Function} props.onUpdatedAnswers - A callback function to handle updated answers.
 * @param {Object} props.feedbackAndChat - An object containing feedback and chat messages.
 * @param {string} props.feedbackAndChat.feedback - The initial feedback value.
 * @param {Array} props.feedbackAndChat.chatMessages - An array of chat messages.
 * @param {Function} props.onUpdateFeedbackAndChat - A callback function to handle updated feedback and chat messages.
 * @returns {JSX.Element} The rendered Card component.
 */

const Card = ({ question, topic, initialAnswer, onUpdatedAnswers, feedbackAndChat, onUpdateFeedbackAndChat }) => {
  const [answer, setAnswer] = useState(initialAnswer);
  const [feedback, setFeedback] = useState(feedbackAndChat ? feedbackAndChat.feedback : '');
  const [chatMessages, setChatMessages] = useState(feedbackAndChat ? feedbackAndChat.chatMessages : []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Update states if feedbackAndChat changes
    if (feedbackAndChat) {
      setFeedback(feedbackAndChat.feedback);
      setChatMessages(feedbackAndChat.chatMessages);
    }
  }, [feedbackAndChat]);

  const handleSubmitAnswer = async () => {
    setLoading(true);
    console.log(`Submitting answer for question about ${topic}: ${answer}`);
    // Call the function to generate feedback
    try {
      const feedbackPrompt = generateFeedbackPrompt(answer, topic);
      const feedbackResponse = await fetchFeedback(feedbackPrompt);
      setFeedback(feedbackResponse);
      const updatedChatMessages = [...chatMessages];
      onUpdateFeedbackAndChat({ feedback: feedbackResponse, chatMessages: updatedChatMessages });
      setLoading(false);
    } catch (error) {
      console.error("Error generating feedback:", error);
      setFeedback("There was an error generating feedback. Please try again.");

    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async (prompt) => {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${REACT_APP_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: prompt }],
        temperature: 1.2,
      }),
    });
    const data = await response.json();
    return data.choices[0].message.content;
  };

  const generateFeedbackPrompt = (answer, topic) => {
    return `
      The following answer was provided for the question on ${topic}: "${answer}".
      Based on this information, generate feedback that is kind, supportive, and encourages further learning.
    `;
  };

  const handleUpdateChatMessages = (newChatMessages) => {
    setChatMessages(newChatMessages);
    onUpdateFeedbackAndChat({ feedback, chatMessages: newChatMessages });
  };

  

  const [showTopic, setShowTopic] = useState(false);

  const handleTopicClick = () => {
    setShowTopic(!showTopic);
  };

  return (
    <div className="card">
      <div className="question-heading">
        <h3>{question}</h3>
        <div className="topic-hint" onClick={handleTopicClick}>
          {showTopic ? topic : "Hint: Reveal topic"}</div>
      </div>
        
      <textarea
        className="textarea"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Your answer here"
      />
      <button className="button" onClick={handleSubmitAnswer} disabled={loading}>
        {loading ? "Generating Feedback..." : "Submit Answer"}
      </button>
      {feedback && (
        <Chat
          question={question}
          answer={answer}
          initialFeedback={feedback} // Make sure this matches prop name
          chatMessages={chatMessages}
          onUpdateChatMessages={handleUpdateChatMessages}
        />
      )}
    </div>
  );
};




export default Card;

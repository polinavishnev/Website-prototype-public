import React, { useState, useEffect, useRef } from 'react';
import "../App.css";

const REACT_APP_API_KEY = process.env.REACT_APP_API_KEY;

const Chat = ({ question, answer, initialFeedback, chatMessages: initialChatMessages, onUpdateChatMessages }) => {
    const [userInput, setUserInput] = useState('');
    const [chatMessages, setChatMessages] = useState(initialChatMessages);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Added to prevent duplicating the initialization logic.
    useEffect(() => {
      let initialMessages = [];

      // Construct an introductory message that includes the question and the answer.
      if (question && answer) {
          initialMessages.push({ message: `Question: ${question}`, sender: "system" });
          initialMessages.push({ message: `Your initial answer: ${answer}`, sender: "user" });
      }

      // Include initial feedback if available.
      if (initialFeedback) {
          initialMessages.push({ message: initialFeedback, sender: "assistant" });
      }

      // Combine with any existing chat messages passed as props.
      setChatMessages([...initialMessages]);
  }, [question, answer, initialFeedback]);

  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

    const handleInputChange = (e) => setUserInput(e.target.value);

    const handleSendMessage = async () => {
        if (!userInput.trim()) return;

        const newUserMessage = { message: userInput, sender: "user" };
        setChatMessages(prev => [...prev, newUserMessage]);
        setIsTyping(true);

        await processMessageToChatGPT(userInput); // Simplified to directly send user input.

        // Directly update chat with user message and GPT response inside processMessageToChatGPT.
        setUserInput(''); // Clear input after message processing.
    };

    const processMessageToChatGPT = async (userMessage) => {
        // Include user message as part of the conversation history for the API call.
        const conversationHistory = [
            ...chatMessages.map(msg => ({ role: msg.sender, content: msg.message })),
            { role: "user", content: userMessage }
        ];

        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${REACT_APP_API_KEY}`,
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: conversationHistory,
                }),
            });

            const data = await response.json();
            if (data.error) {
                throw new Error('Error from OpenAI: ' + data.error.message);
            }

            const reply = { message: data.choices[0].message.content, sender: "assistant" };
            setChatMessages(prev => [...prev, reply]);
            onUpdateChatMessages([...chatMessages, reply]);
        } catch (error) {
            console.error("Error in sending message to OpenAI:", error);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="chat-container">
            <div className="messages-list">
                {chatMessages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender === "user" ? "user-message" : "chatgpt-message"}`}>
                        <p>{msg.message}</p>
                    </div>
                ))}
                {isTyping && <div className="typing-indicator">Typing...</div>}
                <div ref={messagesEndRef} />
            </div>
            <div className="message-input">
                <input
                    type="text"
                    value={userInput}
                    onChange={handleInputChange}
                    placeholder="Type here to chat..."
                />
                <button className="button" onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    );
};

export default Chat;

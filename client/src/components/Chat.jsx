import { useState, useEffect }  from 'react';
import {
    MainContainer,
    ChatContainer,
    MessageList,
    Message,
    MessageInput,
    TypingIndicator,
  } from '@chatscope/chat-ui-kit-react';


const API_KEY = process.env.REACT_APP_API_KEY;

/**
 * This component represents a chat interface for discussing feedback.
 * 
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.question - The question asked by the user.
 * @param {string} props.answer - The answer provided by the user.
 * @param {string} props.feedback - The feedback received by the user.
 * @param {string} props.topic - The topic related to the question and answer.
 * @returns {JSX.Element} The rendered Chat component.
 */
const Chat = ( {question, answer, feedback, topic} ) => {
    const [messages, setMessages] = useState([
        {
            message: `I am a student trying to learn. I was asked the question ${question} about ${topic} and I answered ${answer}.
            The feedback I got was ${feedback}. 
            I would like to discuss this feedback further.`,
            sentTime: "just now",
            sender: "user",
        },
        {
            message: `I am a supportive teacher who helps students understand the feedback they receive.
                            Ask me anything!`,
            sentTime: "just now",
            sender: "ChatGPT",
        },
    ]);
    const [isTyping, setIsTyping] = useState(false);

    const handleSendRequest = async (message) => {
        // Update the messages state variable with the new message from the user and the response from OpenAI API
        
        const newMessage = {
            message,
            direction: 'outgoing',
            sender: "user",
        };

        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setIsTyping(true);

        try {
            const response = await processMessageToChatGPT([...messages, newMessage]);
            const content = response.choices[0]?.message?.content;


            if (content) {
                const chatGPTResponse = {
                    message: content,
                    sender: "ChatGPT",
                };
                setMessages((prevMessages) => [...prevMessages, chatGPTResponse]);
                console.log(messages)
            }
        } catch (error) {
            console.error("Error processing message:", error);
        } finally {
            setIsTyping(false);
        }
    };

    async function processMessageToChatGPT(chatMessages) {
        // Send the feedback chat to OpenAI API

        // Map the chatMessages dictionary into a JSON object that fits OpenAI API format.
        const apiMessages = chatMessages.map((messageObject) => {
            const role = messageObject.sender === "ChatGPT" ? "assistant" : "user";
            return { role, content: messageObject.message };
        });

        const apiRequestBody = {
            "model": "gpt-3.5-turbo",
            "messages": [
                { role: "system", content: 
                    `I'm a Student using this for learning. 
                    ` },
                ...apiMessages,
            ],
        };

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + API_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(apiRequestBody),
        });

        return response.json();
    }

    return (
        <div className="Chat">
            <div style={{ display: "flex" }}>
                <MainContainer>
                    <ChatContainer>       
                        <MessageList 
                            scrollBehavior="smooth" 
                            typingIndicator={isTyping ? <TypingIndicator content="Assistant is typing" /> : null}
                        >   
                        
                        <h2>Chat</h2>
                            {messages.slice(1).map((message, i) => {
                                console.log(message)
                                
                                return (
                                    <div style={{display: "flex", flexDirection: "column"}}>
                                        {/* Display the message, changing its style depending on the sender (user or else) */}

                                        <Message
                                            key={i}
                                            model={message} 
                                            isOwn={message.sender === "user"} 

                                            style={{ 
                                                backgroundColor: message.sender === "user" ? "#333" : "#000", 
                                                color: "#fff",
                                                alignSelf: message.sender === "user" ? "flex-end" : "flex-start",
                                                textAlign: message.sender === "user" ? "right" : "left",
                                                margin: "0.5em"
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </MessageList>
                        
                        {/* Place where the user types in their question to the assistant */}
                        <MessageInput placeholder="Send a Message" onSend={handleSendRequest} />        

                    </ChatContainer>
                </MainContainer>
            </div>
        </div>
    )
}

  
  export default Chat;

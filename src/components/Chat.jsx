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
                }
            } catch (error) {
                console.error("Error processing message:", error);
            } finally {
                setIsTyping(false);
            }
        };
    
        async function processMessageToChatGPT(chatMessages) {
            const apiMessages = chatMessages.map((messageObject) => {
                const role = messageObject.sender === "ChatGPT" ? "ChatGPT" : "user";
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
                            >   <h2>Chat</h2>
                                {messages.slice(1).map((message, i) => {
                                    console.log(message)
                                    return (
                                        <>
                                            <h3 style={{ alignSelf: message.sender === "user" ? "flex-end" : "flex-start" }}>{message.sender}</h3>
                                            <Message
                                                key={i}
                                                sender={message.sender}
                                                model={message} 
                                                isOwn={message.sender === "user"} 
                                                style={{ 
                                                    backgroundColor: message.sender === "user" ? "#333" : "#000", 
                                                    color: "#fff",
                                                    alignSelf: message.sender === "user" ? "flex-end" : "flex-start",
                                                }}
                                            />
                                        </>
                                    );
                                })}
                            </MessageList>
                            <MessageInput placeholder="Send a Message" onSend={handleSendRequest} />        
                        </ChatContainer>
                    </MainContainer>
                </div>
            </div>
        )
    }

  
  export default Chat;

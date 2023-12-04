import React, { useEffect, useState } from "react";
import Chat from "./Chat";

const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://website-prototype-production.up.railway.app"
    : "http://localhost:3001";

const Card = ({
  question,
  topic,
  defaultAnswer,
  defaultFeedback,
  sendScoreToParent,
  childTopic,
}) => {
  const [answer, setAnswer] = useState(defaultAnswer);
  const [feedback, setFeedback] = useState(defaultFeedback);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [chat, setChat] = useState(false);
  const [dataFromPinecone, setDataFromPinecone] = useState("");
  const [feedbackPrompt, setFeedbackPrompt] = useState("");

  const REACT_APP_API_KEY = process.env.REACT_APP_API_KEY;

  const handleSendDataToParent = () => {
    score ? sendScoreToParent(score) : sendScoreToParent(0);
  };

  // based on this question, response, and topic, find the relevant information from pinecone
  const getPineconeSearch = async () => {
    try {
      // Fetch data from Pinecone API and update dataFromPinecone state
      const response = await fetch(
        `${API_URL}/search?text=${encodeURIComponent(
          question + answer + topic
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const dataReceived = await response.json();

      const concatenatedContent = dataReceived
        .filter((item) => item.pageContent)
        .map((item) => item.pageContent.trim().substring(0, 500))
        .join("... ");

      // Set dataFromPinecone state after receiving data
      setDataFromPinecone(concatenatedContent);
      console.log(concatenatedContent);
      return concatenatedContent;
    } catch (error) {
      console.log(error);
    }
  };

  const getFeedback = async () => {
    setLoading(true);

    try {
      const pineconeData = await getPineconeSearch();
      // set an artificial delay after await getPineconeSearch()

      const newFeedbackPrompt = `
          I answered the following question: ${question}. The question was about this topic:${
        childTopic.topic ? childTopic.topic : "Unknown"
      }.
          I wrote: ${answer}
          Here is some contextual information about the question and answer: ${pineconeData}
          Please provide feedback on my response based on the contextual information, the question, and the topic.

          If I wasn't sure or did not know the answer, please provide feedback on how they could have approached the question.
          Be kind, supportive, and encouraging. Your role is to make sure that I want to try again in the future and keep on learning. 
          Please encourage me to keep learning and congratulate me on my effort regardless of my response.
        `;

      console.log(newFeedbackPrompt);

      // Make the API call directly with the constructed feedbackPrompt
      const apiRequestBody = {
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: newFeedbackPrompt }],
        temperature: 1.2,
      };

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${REACT_APP_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiRequestBody),
        }
      );

      const data = await response.json();
      setFeedback(data.choices[0].message.content);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const handleScore = (value) => {
    setScore(value);
  };

  const activateChat = () => {
    setChat(true);
  };

  useEffect(() => {
    setAnswer(defaultAnswer);
    setFeedback(defaultFeedback);
    setScore(0);
  }, [question]);

  useEffect(() => {
    console.log(topic, "topic within card");
    handleSendDataToParent();
  }, [feedback]);

  // use useeffect to set chat to empty when the question changes
  useEffect(() => {
    setChat(false);
  }, [question, feedback]);

  useEffect(() => {
    handleSendDataToParent();
  }, [score]);

  // use useeffect to set chat to empty when the question changes
  useEffect(() => {
    setChat(false);
  }, [question, feedback]);

  return (
    <div className="card">
      <h2>Question: {question}</h2>
      <textarea
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="What do you think is the answer?"
      ></textarea>
      {loading ? null : (
        <button
          className="get-feedback-button"
          onClick={() => getFeedback(topic)}
        >
          Get feedback
        </button>
      )}
      <div className="answer-box">
        {loading ? "Loading..." : <>{feedback}</>}
        {feedback && (
          <>
            <br />
            <button className="discuss-button" onClick={() => activateChat()}>
              I want to discuss feedback
            </button>
          </>
        )}
        {chat && (
          <Chat
            question={question}
            answer={answer}
            feedback={feedback}
            childTopic={childTopic}
          />
        )}

        {feedback && (
          <div className="self-eval-box">
            <h3>
              Now that you understand what was expected, how do you think you
              did?
            </h3>

            <div className="self-evaluation">
              <button className="eval-button" onClick={() => handleScore(2)}>
                I got it correct
              </button>
              <button className="eval-button" onClick={() => handleScore(1)}>
                I got it partially correct
              </button>
              <button className="eval-button" onClick={() => handleScore(0)}>
                I got it wrong
              </button>
              <button className="eval-button" onClick={() => handleScore(0)}>
                I did not know the answer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;

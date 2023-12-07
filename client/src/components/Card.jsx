import React, { useEffect, useState } from "react";
import Chat from "./Chat";

const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://website-prototype-production.up.railway.app"
    : "http://localhost:3001";

const REACT_APP_API_KEY = process.env.REACT_APP_API_KEY;

/**
 * Card component represents a question card with answer input, feedback, and self-evaluation options.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.question - The question text.
 * @param {string} props.topic - The topic related to the question.
 * @param {string} props.defaultAnswer - The default answer for the question.
 * @param {string} props.defaultFeedback - The default feedback for the question.
 * @param {Function} props.sendScoreToParent - The function to send the score to the parent component.
 * @param {Object} props.childTopic - The child topic related to the question.
 * @returns {JSX.Element} The rendered Card component.
 */
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


  const handleSendDataToParent = () => {
    // Update the score in the parent component
    score ? sendScoreToParent(score) : sendScoreToParent(0);
  };


  const getPineconeSearch = async () => {
    // Function to get relevant information from Pinecone API based on question, answer, and topic
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

      // Parse the data received from Pinecone API
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
    // Function to get feedback from OpenAI API based on question, answer, topic, and relevant information from Pinecone

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
    // Turn off the chat when the question or the feedback changes.
    // The first one is to click through the questions; the second one is to allow new feedback for a new answer to be genrated.
    setChat(false);
  }, [question, feedback]);

  useEffect(() => {
    // Once the score gets updated, send it to the parent component
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
        rows="5"
        cols="50"
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

        {/* Once the feedback is given, allow the user to press a button to activate the chat */}
        {feedback && (
          <>
            <br />
            <button className="discuss-button" onClick={() => activateChat()}>
              I want to discuss feedback
            </button>
          </>
        )}

        {/* Once that chat is there, pass the props variables to the Chat component */}
        {chat && (
          <Chat
            question={question}
            answer={answer}
            feedback={feedback}
            childTopic={childTopic}
          />
        )}

        {/* Once the feedback is given, allow the user to self-evaluate */}
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

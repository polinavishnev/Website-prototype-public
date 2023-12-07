import "./App.css";
import Card from "./components/Card";
import Upload from "./components/Upload";
import { useEffect, useState, useMemo } from "react";

const API_URL =
process.env.NODE_ENV === "production"
  ? "https://website-prototype-production.up.railway.app"
  : "http://localhost:3001";

const REACT_APP_API_KEY = process.env.REACT_APP_API_KEY;


/**
 * The main component of the application.
 * Renders the upload section, question card, and relevant topics sidebar.
 * Allows users to add relevant topics, answer questions, and provide feedback.
 *
 * @component
 * @returns {JSX.Element} The rendered App component
 */

function App() {

  const [questions, setQuestions] = useState([]);
  const [relevantTopics, setRelevantTopics] = useState([]);
  const [topic, setTopic] = useState("");
  const [topicDictionary, setTopicDictionary] = useState({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadedTopics, setUploadedTopics] = useState([]);

  const num_questions = 5;


  const getTopic = () => {
    if (relevantTopics.length === 0) {
      const tempTopic = "computer science";
      return tempTopic;
    } else {
      const tempTopic =
        relevantTopics[Math.floor(Math.random() * relevantTopics.length)];
      return tempTopic;
    }
  };

  const generatedTopics = useMemo(() => {
    // Creates an array of 'num_questions' length, each element being a memoized result of 'getTopic()'. 
    // The generatedTopics array gets recomputed when the dependencies change.
    return Array(num_questions)
      .fill(null)
      .map(() => getTopic());
  }, [num_questions, relevantTopics, topicDictionary]);


  const getQuestions = async () => {
    // Generate questions using OpenAI API
    setLoading(true);
    const questionPrompts = []; // Store all question prompts

    const startPrompt = `Give me ${num_questions} about the topics provided later. One topic: One question. It's fine if topics repeat.
    Each question should be formatted to be answered in a few words or a sentence at most.
    `;
    console.log(generatedTopics, "these are the generated topics");

    // Fill the question prompts array with the start prompt and the corresponding prompts for each topic
    questionPrompts.push(startPrompt);
    for (let i = 1; i <= num_questions; i++) {
      const questionTopic = generatedTopics[i - 1]["topic"];
      console.log(questionTopic, "this is the question topic");
      questionPrompts.push(
        `Topic ${i}: [${questionTopic}]. Question ${i}: [one question ${i} about topic ${questionTopic} here]`
      );
    }
    console.log(questionPrompts);

    // Merge the array into a string to be sent to the API
    const questionPrompt = questionPrompts.join("\n");

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: questionPrompt }],
      temperature: 0.8,
    };

    try {
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
      const content = data.choices[0].message.content;
      const all_questions = [];

      // Parse and store questions in questionDictionary with topics
      for (let i = 1; i <= num_questions; i++) {
        const question = RegExp(`Question ${i}: (.*)`).exec(content)[1].trim();
        all_questions.push({
          question: question,
          topic: generatedTopics[i - 1],
        });
      }

      setQuestions(all_questions);
      setLoading(false);
      console.log(generatedTopics);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = (e) => {
    // Handle the addition of topics through the form on the right sidebar

    e.preventDefault();
    if (topic.trim() !== "") {
      setRelevantTopics([...relevantTopics, { topic, score: 0 }]);
      setTopicDictionary({ ...topicDictionary, [topic]: 0 });
      setTopic("");
    } else {
      setRelevantTopics([
        ...relevantTopics,
        { topic: "computer science", score: 0 },
      ]);
      setTopicDictionary({ ...topicDictionary, ["computer science"]: 0 });
      setTopic("");
    }
  };

  const removeTopic = (index) => {
    // Remove topic from sidebar
    const updatedTopics = relevantTopics.slice();
    updatedTopics.splice(index, 1);
    setRelevantTopics(updatedTopics);
  };

  const receiveScoreFromChild = (score) => {
    // Handle the updating of score for each topic from the Card child component. 
    // The score is updated after the user selects a button at the bottom of the Card component.

    const childTopic = generatedTopics
      ? generatedTopics[questionIndex]
      : "computer science";

    // Update the score for the topic in the topicDictionary
    setTopicDictionary((prevTopicDict) => {
      if (!prevTopicDict[childTopic] || prevTopicDict[childTopic] === 0) {
        return {
          ...prevTopicDict,
          [childTopic]: score,
        };
      } else {
        return {
          ...prevTopicDict,
          [childTopic]: prevTopicDict[childTopic] + score,
        };
      }
    });
  };

  const handleUploadFinish = (topics) => {
    // Add the uploaded topics from the Upload component to relevantTopics dictionary

    setRelevantTopics((prevTopics) => [
      ...prevTopics,
      ...topics.map((topic) => ({ topic, score: 0 })),
    ]);
    setTopicDictionary((prevTopicDict) => {
      const newTopicDict = { ...prevTopicDict };
      topics.forEach((topic) => {
        newTopicDict[topic] = 0;
      });
      return newTopicDict;
    });
  };


  return (
    <div className="whole-page">

    {/* Upload component */}
      <div className="header">
        <Upload onUploadFinish={handleUploadFinish} />
      </div>

    {/* Set of question-answer components. The focus in the Card component.  */}
      <div className="questions-answers">
        {/* If it's the first question, disable the "previous question" button */}
        {questionIndex === 0 ? (
          <button
            id="disabled"
            className="prev"
            onClick={() => setQuestionIndex(Math.max(questionIndex - 1, 0))}
          >
            &lt;
          </button>
        ) : (
          <button
            className="prev"
            onClick={() => setQuestionIndex(Math.max(questionIndex - 1, 0))}
          >
            &lt;
          </button>
        )}

        <div className="card">
          {questions.length > 0 ? (
            <Card
              question={questions[questionIndex].question}
              topic={generatedTopics[questionIndex]}
              defaultAnswer=""
              defaultFeedback=""
              sendScoreToParent={receiveScoreFromChild}
              childTopic={
                generatedTopics
                  ? generatedTopics[questionIndex]
                  : "computer science"
              }
            />
          ) : // make it so that the button shows "loading" when the questions are being generated
          loading ? (
            "Loading..."
          ) : (
            <button onClick={getQuestions}>Get Questions</button>
          )}
        </div>

        {/* If it's the last question, disable the next question button */}
        {questionIndex === questions.length - 1 ? (
          <button
            id="disabled"
            className="next"
            onClick={() =>
              setQuestionIndex(
                Math.min(questionIndex + 1, questions.length - 1)
              )
            }
          >
            &gt;
          </button>
        ) : (
          <button
            className="next"
            onClick={() =>
              setQuestionIndex(
                Math.min(questionIndex + 1, questions.length - 1)
              )
            }
          >
            &gt;
          </button>
        )}
      </div>

    {/* Sidebar for relevant topics */}
      <div className="relevancy-sidebar">

        {/* Form to manually add topics */}
        <form className="relevancy-form" onSubmit={handleSubmit}>
          <textarea
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Add a relevant question or topic"
          ></textarea>

          {/* Disable the form to add topics once the questions have been loaded */}
          {questions.length > 0 ? (
            <button id="disabled" className="add-button" type="submit" disabled>
              Refresh the page to add new topics
            </button>
          ) : (
            <button className="add-button" type="submit">
              Add
            </button>
          )}
        </form>

        {/* Display the relevant topics */}
        <div className="relevancy-topics">
          {relevantTopics.map((item, index) => (
            <div className="topic" key={index}>
              <div>{item.topic}</div>
              <button
                className="remove-button"
                onClick={() => removeTopic(index)}
              >
                X
              </button>
            </div>
          ))}
        
        {/* Display the uploaded topics */}
          <div className="uploaded-topics-sidebar">
            {uploadedTopics.map((topic, index) => (
              <div className="uploaded-topic" key={index}>
                {topic}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

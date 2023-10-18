import './App.css'
import Card from './components/Card'
import { useEffect, useState, useMemo } from 'react';

function App() {
  const [questions, setQuestions] = useState([]);
  const [relevantTopics, setRelevantTopics] = useState([]);
  const [topic, setTopic] = useState("");
  const [topicDictionary, setTopicDictionary] = useState({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const num_questions = 5;

  const REACT_APP_API_KEY = process.env.REACT_APP_API_KEY;

  const getTopic = () => {
    if (relevantTopics.length === 0) {
      const tempTopic = "computer science";
      return tempTopic;
    } else {
      const tempTopic = relevantTopics[Math.floor(Math.random() * relevantTopics.length)];
      return tempTopic;
    }

  };

  const generatedTopics = useMemo(() => {
    return Array(num_questions)
      .fill(null)
      .map(() => getTopic());
  }, [num_questions, relevantTopics]);

  const getQuestions = async () => {
    setLoading(true);
    const questionPrompts = []; // Store all question prompts

    const startPrompt = `Give me ${num_questions} about the topics provided later. One topic: One question. It's fine if topics repeat.
    Each question should be formatted to be answered in a few words or a sentence at most.
    `
    console.log(generatedTopics)
    questionPrompts.push(startPrompt);
    for (let i = 1; i <= num_questions; i++) {
    
      const questionTopic = generatedTopics[i - 1];
      questionPrompts.push(`Topic ${i}: [${questionTopic}]. Question ${i}: [one question ${i} about topic ${questionTopic} here]`);
    }
    console.log(questionPrompts)

    const questionPrompt = questionPrompts.join('\n');

    const apiRequestBody = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: questionPrompt },
      ],
      temperature: 0.8
    };

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${REACT_APP_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiRequestBody),
      });

      const data = await response.json();
      console.log(data);

      const questionContent = data.choices[0].message.content;
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
    e.preventDefault();
    if (topic.trim() !== "") {
      setRelevantTopics([...relevantTopics, topic]);
      setTopicDictionary({ ...topicDictionary, [topic]: 0 });
      setTopic("");
    }
    else {
      // assign the topic to be computer science
      setRelevantTopics([...relevantTopics, "computer science"]);
      setTopicDictionary({ ...topicDictionary, ["computer science"]: 0 });
      setTopic("");
    }
  };

  const removeTopic = (index) => {
    const updatedTopics = relevantTopics.slice();
    updatedTopics.splice(index, 1);
    setRelevantTopics(updatedTopics);
  };
  
  const receiveScoreFromChild = (score) => {
    const childTopic = generatedTopics ? generatedTopics[questionIndex] : "computer science";

    console.log(topicDictionary)
    console.log(generatedTopics)
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
    console.log(childTopic, score);
  };
  

  return (
    <div className="whole-page">
      <div className="questions-answers">

        {questionIndex === 0 ? (
          <button id="disabled" className="prev" onClick={() => setQuestionIndex(Math.max(questionIndex - 1, 0))}>
            &lt;
          </button>
        ) : (
          <button className="prev" onClick={() => setQuestionIndex(Math.max(questionIndex - 1, 0))}>
            &lt;
          </button>
        )  
        }

        <div className="card">
          {questions.length > 0 ? (
            <Card
              question={questions[questionIndex].question}
              topic={generatedTopics[questionIndex]}
              defaultAnswer=""
              defaultFeedback=""
              sendScoreToParent={receiveScoreFromChild}
              childTopic={generatedTopics ? generatedTopics[questionIndex] : "computer science"}
            />
          ) : (
            // make it so that the button shows "loading" when the questions are being generated
            loading ? "Loading..." :
            <button onClick={getQuestions}>Get Questions</button>
          )}
        </div>
        
        {questionIndex === questions.length - 1 ? (
          <button id="disabled" className="next" onClick={() => setQuestionIndex(Math.min(questionIndex + 1, questions.length - 1))}>
            &gt;
          </button>
        ) : (
          <button className="next" onClick={() => setQuestionIndex(Math.min(questionIndex + 1, questions.length - 1))}>
            &gt;
          </button>
        )  
        }

      </div>

      <div className="relevancy-sidebar">
        <form className="relevancy-form" onSubmit={handleSubmit}>
          <textarea
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Add a relevant question or topic"
          ></textarea>
          {questions.length > 0 ? (
            <button id="disabled" className="add-button" type="submit" disabled>
              Refresh the page to add new topics
            </button>
          ) : (
            <button className="add-button" type="submit">
              Add
            </button>
          )
          }
        </form>

        <div className="relevancy-topics">
          {relevantTopics.map((topic, index) => (
            <div className="topic" key={index} onClick={() => removeTopic(index)}>
              {topic} : {topicDictionary[topic]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;

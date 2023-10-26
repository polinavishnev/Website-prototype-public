import React, { useEffect, useState } from 'react';
import Chat from './Chat';

const Card = ({ question, topic, defaultAnswer, defaultFeedback, sendScoreToParent, childTopic }) => {
    const [answer, setAnswer] = useState(defaultAnswer);
    const [feedback, setFeedback] = useState(defaultFeedback);
    const [loading, setLoading] = useState(false);
    const [score, setScore] = useState(0);
    const [chat, setChat] = useState(false);


    const REACT_APP_API_KEY = process.env.REACT_APP_API_KEY;
    
    const handleSendDataToParent = () => {
      score ? sendScoreToParent(score) : sendScoreToParent(0);
    }

    const getFeedback = async () => {
        setLoading(true);
        const feedbackPrompt = `
        I answered the following ${question}.
        I wrote: ${answer}

        You are a gentle, supportive teacher who provides feedback and seeks out what was right about the student's answer.
        Unless the student was VERY wrong or VERY uncertain, you should assume at least a partially correct answer. 

        The feedback goes as follows:

        First sentence:
          One sentence on what the user did well. Relate it to ${childTopic}. 5-10 words.

        Second sentence (Optional):
          One short sentence on what would make a great answer, especially in relation to ${childTopic}. 5-10 words. This is optional and not necessary if the answer is mostly correct.


        Example 1: 
        That is partially correct. It's true that computer science studies computers. Next time, you could elaborate that it studies computation, information, and automation.

        Example 2:
        It is okay to not know the answer. It's great that you're spending time to learn more! Next time, you could say that computer science studies computation, information, and automation.
        
        Example 3: 
        That is correct! It's great that you identified that computer science studies computation, information, and automation.

        `
        
        
        ;


        const apiRequestBody = {
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: feedbackPrompt },
            ],
            temperature: 1.2
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
            setFeedback(data.choices[0].message.content);
            setLoading(false);
        } catch (error) {
            console.log(error);
        }
    };
  
  const handleScore = (value) => {
      setScore(value);
  }

  const activateChat = () => {
    setChat(true);
  }

  useEffect(() => {
    setAnswer(defaultAnswer);
    setFeedback(defaultFeedback);
    setScore(0);
  }, [question])

    
  useEffect( () => {
    console.log(topic, 'topic within card')
    handleSendDataToParent();
  }, [feedback])


  // use useeffect to set chat to empty when the question changes
  useEffect(() => {
    setChat(false);
  } , [question, feedback])

  useEffect(() => {
    handleSendDataToParent();
}, [score]);

  // use useeffect to set chat to empty when the question changes
  useEffect(() => {
    setChat(false);
  } , [question, feedback])

    return (
        <div className="card">
            <h2>Question: {question}</h2>
            <textarea
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="What do you think is the answer?">
            </textarea>
            {loading ? null : 
            <button className="get-feedback-button" onClick={() => getFeedback(topic)}>Get feedback</button>}
            <div className="answer-box">
                {loading ? "Loading..." : (
                  <>
                    {feedback}
                  
                  </>
                )}
                {feedback && (
                      <>
                        <br/>
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
                            <h3>Now that you understand what was expected, how do you think you did?</h3>

                            <div className='self-evaluation'>
                                <button className="eval-button" onClick={() => handleScore(2)}>I got it correct</button>
                                <button className="eval-button" onClick={() => handleScore(1)}>I got it partially correct</button>
                                <button className="eval-button" onClick={() => handleScore(0)}>I got it wrong</button>
                                <button className="eval-button" onClick={() => handleScore(0)}>I did not know the answer</button>
                            </div>
                            </div>
                      )}

            </div>
        </div>
    );
};

export default Card;

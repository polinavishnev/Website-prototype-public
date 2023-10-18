import React, { useEffect, useState } from 'react';

const Card = ({ question, topic, defaultAnswer, defaultFeedback, sendScoreToParent, childTopic }) => {
    const [answer, setAnswer] = useState(defaultAnswer);
    const [feedback, setFeedback] = useState(defaultFeedback);
    const [loading, setLoading] = useState(false);
    const [score, setScore] = useState(0);


    const REACT_APP_API_KEY = process.env.REACT_APP_API_KEY;
    
    const handleSendDataToParent = () => {
      score ? sendScoreToParent(score) : sendScoreToParent(0);
    }

    const getFeedback = async () => {
        setLoading(true);
        const feedbackPrompt = `
        I wrote a few words answering the following ${question}.
        I wrote: ${answer}

        You are a gentle, supportive teacher who provides feedback and seeks out what was right about the student's answer.
        Unless the student was VERY wrong or VERY uncertain, you should assume at least a partially correct answer. 

        The feedback goes as follows:

        First sentence:
          If the answer is mostly or more than that correct, INCLUDE "That is correct!"
          If the answer is VERY incorrect, INCLUDE "That is incorrect."
          If the answer contains phrases such as "I don't know" or "Not sure", and doesn't try to answer the question, INCLUDE "It is okay to not know the answer."
          If the user made an attempt that includes some right elements INCLUDE "That is partially correct."

        Second sentence:
          One sentence on what the user did well. Relate it to ${childTopic}. 5-10 words.

        Third sentence (Optional):
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
            setFeedback(data.choices[0].message.content);
            setScore(parseFeedback(data.choices[0].message.content));
            
            console.log(score)
            setLoading(false);
        } catch (error) {
            console.log(error);
        }
    };

  const parseFeedback = (output) => {

    const correct = RegExp(`That is correct!`).exec(output);
    const incorrect = RegExp(`That is incorrect.`).exec(output);
    const unknown = RegExp(`It is okay to not know the answer.`).exec(output);
    const partial = RegExp(`That is partially correct.`).exec(output);

    if (correct) {
      return 2;
    } else if (partial) {
      return 1;
    } else if (incorrect || unknown) {
      return 0;
    } else {
      return 0;
    }
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
                {loading ? "Loading..." : feedback}
            </div>
        </div>
    );
};

export default Card;

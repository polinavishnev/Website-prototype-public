import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTopics } from '../TopicsContext';
import QuestionNavBar from './QuestionNavBar';
import NavBar from './Navbar';
import Card from './Card';
import '../App.css';

const REACT_APP_API_KEY = process.env.REACT_APP_API_KEY;

/**
 * QuizPage component displays a quiz with questions fetched from OpenAI ChatGPT.
 * It fetches questions based on the selected topics and allows the user to navigate through the questions.
 * The user can provide answers, feedback, and interact with a chat feature for each question.
 *
 * @component
 * @return {JSX.Element}
 */

const QuizPage = () => {
  const { topics: contextTopics } = useTopics();
  const location = useLocation();
  const [questionsData, setQuestionsData] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const topics = location.state?.topics || contextTopics;

 
    // Function to fetch questions from OpenAI ChatGPT
    useEffect(() => {

      const fetchQuestions = async () => {
  
        // Check if topics are available
        if (!topics.length) {
          console.error("No topics available to generate questions.");
          setLoading(false);
          return;
        }
      
        setLoading(true);
        const prompts = topics.map(topic => topic.name).join(", ");
        const combinedPrompt = `Give me one question for each of the following topics: ${prompts}. 
        Format each question as follows, making sure to separate the topic from the question with '###', and put each question on a new line using '\n':
        Example:  
        Topic ### Question \n
        Each question should be possibly answered in a few words or a sentence at most.`;
    
        try {
          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${REACT_APP_API_KEY}`,
            },
            // Lower temperature for more focused responses given the regex-based prompt
            body: JSON.stringify({
              model: "gpt-3.5-turbo",
              messages: [{ role: "system", content: combinedPrompt }],
              temperature: 0.7,
              max_tokens: 100,
            }),
          });
    
          if (response.ok) {
            const data = await response.json();
            console.log(data)

            const entries = data.choices[0].message.content
              .trim()
              .split("\n")
              .map(entry => {
                const parts = entry.split("###");
                const topic = parts[0].trim();
                const questionText = parts[1].trim();
                return { topic, questionText };
              });
            
            setQuestionsData(entries.map((entry, index) => ({
              id: index,
              questionText: entry.questionText,
              topic: entry.topic || 'General',
              answer: '',
              feedback: '',
              chatMessages: [],
              feedbackAndChat: { feedback: '', chatMessages: [] }
            })));
          } else {
            throw new Error('Failed to fetch questions');
          }
        } catch (error) {
          console.error("Error fetching questions from OpenAI ChatGPT:", error);
        } finally {
          setLoading(false);
        }
      };
    
      fetchQuestions();
    }, [topics]);
  
  // Function to handle moving to the next question
  const handleNextQuestion = () => setCurrentQuestionIndex((prevIndex) => (prevIndex + 1) % questionsData.length);

  // Function to update the question data as the user interacts with the chat
  const handleUpdateQuestionData = (questionId, updatedData) => {
    setQuestionsData(currentData =>
      currentData.map((item) =>
        item.id === questionId ? { ...item, ...updatedData } : item
      )
    );
  };

  // Render loading message while fetching questions
  if (loading) return <div className='loading'>Loading...</div>;

  return (
    <div>
      <NavBar currentStep="Quiz"/>
      <QuestionNavBar
        totalQuestions={questionsData.length}
        currentQuestionIndex={currentQuestionIndex}
        setCurrentQuestionIndex={setCurrentQuestionIndex}
      />
      {questionsData.length > 0 && (
        <>
          <Card
            className="card"
            key={currentQuestionIndex}
            question={questionsData[currentQuestionIndex].questionText}
            topic={questionsData[currentQuestionIndex].topic}
            initialAnswer={questionsData[currentQuestionIndex].answer}
            initialFeedback={questionsData[currentQuestionIndex].feedback}
            initialChatMessages={questionsData[currentQuestionIndex].chatMessages}
            onUpdateFeedbackAndChat={(updatedData) => handleUpdateQuestionData(questionsData[currentQuestionIndex].id, updatedData)}
          />
          <div className="fixed-button-container">
            <button className="button fixed-button" onClick={handleNextQuestion}>Take me to the next question</button>
          </div>
        </>
      )}
    </div>
  );
};

export default QuizPage;

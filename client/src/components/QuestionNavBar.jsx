import React from 'react';

/**
 * QuestionNavBar component.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {number} props.totalQuestions - The total number of questions.
 * @param {number} props.currentQuestionIndex - The index of the current question.
 * @param {function} props.setCurrentQuestionIndex - The function to set the current question index.
 * @returns {JSX.Element} The rendered QuestionNavBar component.
 */

const QuestionNavBar = ({ totalQuestions, currentQuestionIndex, setCurrentQuestionIndex }) => {
  
  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
      {Array.from({ length: totalQuestions }, (_, i) => (
        <button
          className="button"
          key={i}
          onClick={() => goToQuestion(i)}
          style={{
            padding: '5px 10px',
            marginRight: '5px',
            color: i === currentQuestionIndex ? 'white' : 'black',
            backgroundColor: i === currentQuestionIndex ? '#5c95ffff' : i < currentQuestionIndex ? '#d9d9d9ff' : '#d7f1ffff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
};

export default QuestionNavBar;

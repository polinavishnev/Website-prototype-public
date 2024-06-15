import React, { useState, useEffect } from 'react';
import NavBar from './Navbar';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTopics } from '../TopicsContext';
import '../App.css';

/**
 * Component for adding or modifying topics.
 *
 * @returns {JSX.Element} The AddModifyTopics component.
 */

const AddModifyTopics = () => {
  const { topics, setTopics, markFocusCompleted } = useTopics();
  const location = useLocation();
  const navigate = useNavigate();
  
  // New state for the new topic input
  const [newTopic, setNewTopic] = useState('');

  // Update topics state when location.state.topics changes
  useEffect(() => {
    // Ensure topics are not overriden unnecessarily to avoid infinite loops
    if (!location.state?.topics || location.state.topics.length === 0 || topics.length !== 0) {
      return;
    }
    
    const updatedTopics = location.state.topics.map((topicName, index) => ({
      id: index,
      name: topicName.replace(/^\d+\.\s*/, ''),
      selected: false,
    }));
  
    setTopics(updatedTopics);
    // Ensure this effect only runs once when the component mounts or when location.state.topics changes
  }, [location.state?.topics]);
  
  // Function to toggle the selection of a topic
  const toggleTopicSelection = (id) => {
    setTopics(currentTopics => currentTopics.map(topic =>
      topic.id === id ? { ...topic, selected: !topic.selected } : topic
    ));
  };

  // Function to handle the addition of a new topic
  const handleAddTopic = () => {
    if (newTopic.trim()) {
      const newId = topics.length ? Math.max(...topics.map(topic => topic.id)) + 1 : 0;
      setTopics([...topics, { id: newId, name: newTopic, selected: true }]);
      setNewTopic('');
    }
  };

  // Function to navigate to the quiz with selected topics
  const navigateToQuiz = () => {
    const selectedTopics = topics.filter(topic => topic.selected).map(topic => topic.name);
    if (selectedTopics.length) {
      markFocusCompleted();
      navigate('/quiz', { state: { topics: topics } });
    } else {
      alert('Please select at least one topic before proceeding to the quiz.');
    }
  };

  return (
    <div>
      <NavBar currentStep="Focus" />
      <div className="add-modify-topics" style={{ fontFamily: 'Mulish', padding: '20px' }}>
        <div className="description">
          <h2>Step 2: Select focus topics</h2>
          <p>Select the topics you want to be quizzed on. You can also add new topics if needed.</p>
        </div>
        
        {topics.map((topic, index) => (
          <div key={index} className="topic-item">
            <label>
              <input
                type="checkbox"
                checked={topic.selected}
                onChange={() => toggleTopicSelection(topic.id)}
              /> {topic.name}
            </label>
          </div>
        ))}

        <div className="topic-item">
          <input
            type="text"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder="Add new topic"
          />
          <button className="button" onClick={handleAddTopic}>Add</button>
        </div>
        
      </div>
      <button className="button" onClick={navigateToQuiz}>Ready for the quiz</button>
    </div>
  );
};

export default AddModifyTopics;

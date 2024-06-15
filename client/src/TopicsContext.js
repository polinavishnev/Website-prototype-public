import React, { createContext, useState, useContext } from 'react';

const TopicsContext = createContext();

/**
 * @file Provides the TopicsProvider component for managing topics and completion status.
 * @module TopicsContext
 */

/**
 * Provides the TopicsProvider component.
 * @param {Object} props - The component props.
 * @param {ReactNode} props.children - The child components.
 * @returns {ReactNode} The rendered component.
 */
export const TopicsProvider = ({ children }) => {
  // State variables
  const [topics, setTopics] = useState([]);
  const [isUploadCompleted, setIsUploadCompleted] = useState(() => JSON.parse(localStorage.getItem('isUploadCompleted')) || false);
  const [isFocusCompleted, setIsFocusCompleted] = useState(() => JSON.parse(localStorage.getItem('isFocusCompleted')) || false);

  /**
   * Marks the upload as completed and updates the state.
   */
  const markUploadCompleted = () => {
    localStorage.setItem('isUploadCompleted', true);
    setIsUploadCompleted(true);
  };

  /**
   * Marks the focus as completed and updates the state.
   */
  const markFocusCompleted = () => {
    localStorage.setItem('isFocusCompleted', true);
    setIsFocusCompleted(true);
  };

  /**
   * Resets the completion status, topics, and clears local storage.
   */
  const resetCompletionStatus = () => {
    localStorage.removeItem('isUploadCompleted');
    localStorage.removeItem('isFocusCompleted');
    setIsUploadCompleted(false);
    setIsFocusCompleted(false);
    setTopics([]);
  };

  return (
    <TopicsContext.Provider value={{
      topics, setTopics,
      isUploadCompleted, isFocusCompleted,
      markUploadCompleted, markFocusCompleted,
      resetCompletionStatus
    }}>
      {children}
    </TopicsContext.Provider>
  );
};

export const useTopics = () => useContext(TopicsContext);

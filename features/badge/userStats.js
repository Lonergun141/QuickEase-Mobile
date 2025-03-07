import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchUserFlashcards } from '../flashcards/FlashCard';
import { fetchAllNotes } from '../summarizer/openAI';
import { fetchAllQuiz } from '../quiz/quizServices';
import { useSelector } from 'react-redux';

const UserStatsContext = createContext();

export const UserStatsProvider = ({ children }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const [flashcardCount, setFlashcardCount] = useState(0);
  const [notesCount, setNotesCount] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [perfectQuizAchieved, setPerfectQuizAchieved] = useState(false);
  const [perfectQuizCount, setPerfectQuizCount] = useState(0);

  useEffect(() => {
    if (userInfo?.id) {
      loadUserData();
    }
  }, [userInfo]);

  const loadUserData = async () => {
    try {
      setStatsLoaded(false);
      
      // Initialize counts to 0 first
      setFlashcardCount(0);
      setNotesCount(0);
      setAverageScore(0);
      setPerfectQuizAchieved(false);
      setPerfectQuizCount(0);

      // Then fetch and update with actual data
      const flashcardsData = await fetchUserFlashcards(userInfo.id);
      setFlashcardCount(flashcardsData?.length || 0);
      
      const notesData = await fetchAllNotes();
      const userNotesCount = notesData?.filter((note) => note.user === userInfo.id)?.length || 0;
      setNotesCount(userNotesCount);
      
      const quizData = await fetchAllQuiz();
      calculateAverageScore(quizData || []);
      
      setStatsLoaded(true);
    } catch (error) {
      console.error('Error loading user data:', error);
      // Reset stats on error
      setFlashcardCount(0);
      setNotesCount(0);
      setAverageScore(0);
      setPerfectQuizAchieved(false);
      setPerfectQuizCount(0);
      setStatsLoaded(true);
    }
  };

  const calculateAverageScore = (quizData) => {
    let totalScore = 0;
    let totalQuizzes = 0;
    let perfectScoreAchieved = false;
    let perfectQuizCount = 0;

    quizData.forEach((quiz) => {
      if (quiz.TestScore && quiz.TestTotalScore) {
        totalScore += quiz.TestScore;
        totalQuizzes += quiz.TestTotalScore;

        if (quiz.TestScore === quiz.TestTotalScore) {
          perfectScoreAchieved = true;
          perfectQuizCount++;
        }
      }
    });

    const average = totalQuizzes > 0 ? (totalScore / totalQuizzes) * 100 : 0;
    setAverageScore(parseFloat(average.toFixed(2)));
    setPerfectQuizAchieved(perfectScoreAchieved);
    setPerfectQuizCount(perfectQuizCount);
  };

  return (
    <UserStatsContext.Provider
      value={{
        flashcardCount,
        notesCount,
        averageScore,
        perfectQuizAchieved,
        refreshUserStats: loadUserData,
        statsLoaded,
        perfectQuizCount,
      }}
    >
      {children}
    </UserStatsContext.Provider>
  );
};

export const useUserStats = () => {
  const context = useContext(UserStatsContext);
  if (context === undefined) {
    throw new Error('useUserStats must be used within a UserStatsProvider');
  }
  return context;
};

import React, { useState, useEffect, useContext } from "react";
import { Context } from "../context/index";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import styles from "../styles/TopicsPage.module.css";

// Question components imports
import MultipleChoiceQuestion from "../components/questions/MultipleChoiceQuestion";
import SingleChoice from "../components/questions/SingleChoice";
import ShortAnswerQuestion from "../components/questions/ShortAnswerQuestion";
import NumericAnswer from "../components/questions/NumericAnswer";
import MatchingQuestion from "../components/questions/MatchingQuestion";
import SortableQuestion from "../components/questions/SortableQuestion";

// Answer components for test-taking
const SingleChoiceAnswerComponent: React.FC<{
  questionData: any;
  answer: any;
  onAnswerChange: (answer: any) => void;
}> = ({ questionData, answer, onAnswerChange }) => {
  if (!questionData?.options) return null;
  
  return (
    <div>
      {questionData.options.map((option: string, index: number) => (
        <div key={index} style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "12px",
          marginBottom: "8px",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          cursor: "pointer",
          background: answer === index ? "#eff6ff" : "#fff",
          borderColor: answer === index ? "#3b82f6" : "#e5e7eb"
        }} onClick={() => onAnswerChange(index)}>
          <input
            type="radio"
            checked={answer === index}
            onChange={() => onAnswerChange(index)}
            style={{ cursor: "pointer" }}
          />
          <span style={{ flex: 1, fontSize: "16px" }}>{option}</span>
        </div>
      ))}
    </div>
  );
};

const MultipleChoiceAnswerComponent: React.FC<{
  questionData: any;
  answer: any;
  onAnswerChange: (answer: any) => void;
}> = ({ questionData, answer, onAnswerChange }) => {
  if (!questionData?.options) return null;
  
  const selectedOptions = Array.isArray(answer) ? answer : [];
  
  const toggleOption = (index: number) => {
    const newSelected = selectedOptions.includes(index)
      ? selectedOptions.filter(i => i !== index)
      : [...selectedOptions, index];
    onAnswerChange(newSelected);
  };
  
  return (
    <div>
      {questionData.options.map((option: string, index: number) => {
        const isSelected = selectedOptions.includes(index);
        return (
          <div key={index} style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px",
            marginBottom: "8px",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            cursor: "pointer",
            background: isSelected ? "#eff6ff" : "#fff",
            borderColor: isSelected ? "#3b82f6" : "#e5e7eb"
          }} onClick={() => toggleOption(index)}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleOption(index)}
              style={{ cursor: "pointer" }}
            />
            <span style={{ flex: 1, fontSize: "16px" }}>{option}</span>
          </div>
        );
      })}
    </div>
  );
};

const TextAnswerComponent: React.FC<{
  answer: any;
  onAnswerChange: (answer: any) => void;
}> = ({ answer, onAnswerChange }) => {
  return (
    <textarea
      value={answer || ""}
      onChange={(e) => onAnswerChange(e.target.value)}
      placeholder="Введите ваш ответ..."
      style={{
        width: "100%",
        minHeight: "120px",
        padding: "12px",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        fontSize: "16px",
        resize: "vertical",
        fontFamily: "inherit"
      }}
    />
  );
};

const NumericAnswerComponent: React.FC<{
  answer: any;
  onAnswerChange: (answer: any) => void;
}> = ({ answer, onAnswerChange }) => {
  return (
    <input
      type="number"
      value={answer || ""}
      onChange={(e) => onAnswerChange(e.target.value)}
      placeholder="Введите число..."
      style={{
        width: "100%",
        padding: "12px",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        fontSize: "16px",
        fontFamily: "inherit"
      }}
    />
  );
};

const MatchingAnswerComponent: React.FC<{
  questionData: any;
  answer: any;
  onAnswerChange: (answer: any) => void;
}> = ({ questionData, answer, onAnswerChange }) => {
  if (!questionData?.leftItems || !questionData?.rightItems) return null;
  
  const matches = answer || {};
  
  const setMatch = (leftIndex: number, rightIndex: number) => {
    const newMatches = { ...matches, [leftIndex]: rightIndex };
    onAnswerChange(newMatches);
  };
  
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
      <div>
        <h4 style={{ marginBottom: "12px", fontSize: "16px", fontWeight: "600" }}>Сопоставьте:</h4>
        {questionData.leftItems.map((item: string, leftIndex: number) => (
          <div key={leftIndex} style={{
            padding: "12px",
            marginBottom: "8px",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            background: "#f9fafb"
          }}>
            {item}
          </div>
        ))}
      </div>
      <div>
        <h4 style={{ marginBottom: "12px", fontSize: "16px", fontWeight: "600" }}>С вариантами:</h4>
        {questionData.rightItems.map((item: string, rightIndex: number) => {
          const isUsed = Object.values(matches).includes(rightIndex);
          return (
            <div key={rightIndex} style={{
              padding: "12px",
              marginBottom: "8px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              background: isUsed ? "#f3f4f6" : "#fff",
              cursor: "pointer",
              opacity: isUsed ? 0.6 : 1
            }} onClick={() => {
              // Find which left item should match with this right item
              const leftIndex = Object.keys(matches).find(key => matches[key] === rightIndex);
              if (leftIndex !== undefined) {
                // Remove existing match
                const newMatches = { ...matches };
                delete newMatches[leftIndex];
                onAnswerChange(newMatches);
              }
            }}>
              {item}
              {isUsed && <span style={{ marginLeft: "8px", color: "#22c55e" }}>✓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const OrderingAnswerComponent: React.FC<{
  questionData: any;
  answer: any;
  onAnswerChange: (answer: any) => void;
}> = ({ questionData, answer, onAnswerChange }) => {
  if (!questionData?.items) return null;
  
  const orderedItems = answer || questionData.items.slice();
  
  const moveItem = (fromIndex: number, toIndex: number) => {
    const newItems = [...orderedItems];
    const [removed] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, removed);
    onAnswerChange(newItems);
  };
  
  return (
    <div>
      <p style={{ marginBottom: "16px", color: "#6b7280" }}>Расположите элементы в правильном порядке:</p>
      {orderedItems.map((item: string, index: number) => (
        <div key={index} style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "12px",
          marginBottom: "8px",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          background: "#fff"
        }}>
          <span style={{ fontSize: "14px", color: "#6b7280", minWidth: "20px" }}>{index + 1}.</span>
          <span style={{ flex: 1, fontSize: "16px" }}>{item}</span>
          <div style={{ display: "flex", gap: "4px" }}>
            {index > 0 && (
              <button
                onClick={() => moveItem(index, index - 1)}
                style={{
                  padding: "4px 8px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "4px",
                  background: "#f9fafb",
                  cursor: "pointer",
                  fontSize: "12px"
                }}
              >
                ↑
              </button>
            )}
            {index < orderedItems.length - 1 && (
              <button
                onClick={() => moveItem(index, index + 1)}
                style={{
                  padding: "4px 8px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "4px",
                  background: "#f9fafb",
                  cursor: "pointer",
                  fontSize: "12px"
                }}
              >
                ↓
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Types based on API documentation
interface Question {
  id: number;
  question_text: string;
  question_type: string;
  points: number;
  data: any;
  topic_id: number;
}

interface AttemptQuestionView {
  answer: any;
  question: Question;
}

interface Attempt {
  id: number;
  user_id: number;
  test_id: number;
  discipline_id: number;
  status: string;
  score?: number;
}

interface AttemptDetailView {
  attempt: Attempt;
  questions: AttemptQuestionView[];
}

interface AnswerSubmitInput {
  question_id: number;
  answer: any;
}

export default function AttemptPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const { store } = useContext(Context);
  
  const [attemptData, setAttemptData] = useState<AttemptDetailView | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{
    score: number;
    maxScore: number;
    percentage: number;
  } | null>(null);
  const [answers, setAnswers] = useState<Map<number, any>>(new Map());

  // Auto-dismiss messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const getAccess = () => {
    const access_token = localStorage.getItem("token");
    if (access_token == null) {
      store.refresh();
    }
    return access_token;
  };

  // Fetch attempt details and questions
  const fetchAttemptData = async () => {
    if (!attemptId) {
      setError("ID попытки не указан");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // First, get attempt details
      const attemptResponse = await axios.get(`/server/attempts/${attemptId}`, {
        headers: { Authorization: `Bearer ${getAccess()}` },
      });
      
      if (attemptResponse.status !== 200) {
        throw new Error("Ошибка при загрузке данных попытки");
      }

      // Then, get all questions for this attempt
      const questionsResponse = await axios.get(`/server/attempts/${attemptId}/questions`, {
        headers: { Authorization: `Bearer ${getAccess()}` },
      });
      
      if (questionsResponse.status !== 200) {
        throw new Error("Ошибка при загрузке вопросов");
      }

      const attemptInfo = attemptResponse.data as Attempt;
      const questions = questionsResponse.data as Question[];
      
      // Create AttemptDetailView structure
      const data: AttemptDetailView = {
        attempt: attemptInfo,
        questions: questions.map(q => ({
          answer: null, // No saved answer initially
          question: q
        }))
      };
      
      setAttemptData(data);
      
      // Debug: Log the attempt data
      console.log("Attempt data loaded:", data);
      console.log("Questions:", data.questions);
      if (data.questions && data.questions.length > 0) {
        console.log("First question:", data.questions[0]);
        console.log("First question data:", data.questions[0].question.data);
      }
      
      // Initialize answers map (empty initially since we're getting fresh questions)
      const answersMap = new Map<number, any>();
      setAnswers(answersMap);
      
      // Set current answer for first question (null initially)
      if (data.questions && data.questions.length > 0) {
        setCurrentAnswer(null);
      }
    } catch (err: any) {
      console.error("Error fetching attempt data:", err);
      if (err.response?.status === 401) {
        setError("Нет прав доступа. Попробуйте войти заново.");
      } else if (err.response?.status === 404) {
        setError("Попытка не найдена");
      } else {
        setError(err?.message || "Ошибка при загрузке данных попытки");
      }
    } finally {
      setLoading(false);
    }
  };

  // Submit answer for current question
  const submitAnswer = async () => {
    if (!attemptData || !attemptId) return;

    const currentQuestion = attemptData.questions[currentQuestionIndex];
    if (!currentQuestion) return;

    setSaving(true);
    try {
      const answerData: AnswerSubmitInput = {
        question_id: currentQuestion.question.id,
        answer: currentAnswer,
      };

      const response = await axios.post(
        `/server/attempts/${attemptId}/answers`,
        answerData,
        {
          headers: { Authorization: `Bearer ${getAccess()}` },
        }
      );

      if (response.status !== 200) {
        throw new Error("Ошибка при сохранении ответа");
      }

      // Update local answers map
      const newAnswers = new Map(answers);
      newAnswers.set(currentQuestion.question.id, currentAnswer);
      setAnswers(newAnswers);

      setSuccess("Ответ сохранен!");
    } catch (err: any) {
      console.error("Error submitting answer:", err);
      if (err.response?.status === 401) {
        setError("Нет прав доступа. Попробуйте войти заново.");
      } else {
        setError(err?.message || "Ошибка при сохранении ответа");
      }
    } finally {
      setSaving(false);
    }
  };

  // Finish test attempt
  const finishTest = async () => {
    if (!attemptId) return;

    if (!window.confirm("Вы уверены, что хотите завершить тест? После завершения изменить ответы будет невозможно.")) {
      return;
    }

    setFinishing(true);
    try {
      const response = await axios.post(
        `/server/attempts/${attemptId}/finish`,
        {},
        {
          headers: { Authorization: `Bearer ${getAccess()}` },
        }
      );

      if (response.status !== 200) {
        throw new Error("Ошибка при завершении теста");
      }

      // Get the final attempt data with score
      const finalAttemptResponse = await axios.get(`/server/attempts/${attemptId}`, {
        headers: { Authorization: `Bearer ${getAccess()}` },
      });

      if (finalAttemptResponse.status === 200) {
        const finalAttempt = finalAttemptResponse.data as Attempt;
        
        // Calculate maximum possible score from all questions
        const maxScore = attemptData?.questions.reduce((total, q) => total + (q.question.points || 0), 0) || 0;
        const score = finalAttempt.score || 0;
        const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
        
        // Update attempt data with final score
        if (attemptData) {
          setAttemptData({
            ...attemptData,
            attempt: { ...attemptData.attempt, ...finalAttempt }
          });
        }
        
        // Set test results for display
        setTestResults({
          score,
          maxScore,
          percentage
        });
      }

      setSuccess("Тест завершен!");
    } catch (err: any) {
      console.error("Error finishing test:", err);
      if (err.response?.status === 401) {
        setError("Нет прав доступа. Попробуйте войти заново.");
      } else {
        setError(err?.message || "Ошибка при завершении теста");
      }
    } finally {
      setFinishing(false);
    }
  };

  // Navigate to specific question
  const goToQuestion = (index: number) => {
    if (!attemptData || index < 0 || index >= attemptData.questions.length) return;

    // Save current answer before switching
    if (attemptData.questions[currentQuestionIndex]) {
      const currentQuestionId = attemptData.questions[currentQuestionIndex].question.id;
      const newAnswers = new Map(answers);
      newAnswers.set(currentQuestionId, currentAnswer);
      setAnswers(newAnswers);
    }

    setCurrentQuestionIndex(index);
    const newQuestionId = attemptData.questions[index].question.id;
    setCurrentAnswer(answers.get(newQuestionId) || null);
  };

  // Navigate to next question
  const nextQuestion = () => {
    if (!attemptData) return;
    if (currentQuestionIndex < attemptData.questions.length - 1) {
      goToQuestion(currentQuestionIndex + 1);
    }
  };

  // Navigate to previous question
  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      goToQuestion(currentQuestionIndex - 1);
    }
  };

  // Load attempt data on component mount
  useEffect(() => {
    fetchAttemptData();
  }, [attemptId]);

  // Update current answer when question changes
  useEffect(() => {
    if (attemptData && attemptData.questions[currentQuestionIndex]) {
      const question = attemptData.questions[currentQuestionIndex];
      const questionId = question.question.id;
      
      // Get existing answer or set to null for initialization
      const existingAnswer = answers.get(questionId);
      setCurrentAnswer(existingAnswer || null);
    }
  }, [currentQuestionIndex, attemptData, answers]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>Загрузка теста...</p>
        </div>
      </div>
    );
  }

  if (!attemptData) {
    return (
      <div className={styles.page}>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>Данные теста не найдены</p>
          <button
            onClick={() => navigate("/tests")}
            className={`${styles.btn} ${styles.blue}`}
          >
            Вернуться к тестам
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = attemptData.questions[currentQuestionIndex];
  const isCompleted = attemptData.attempt.status === "completed";

  return (
    <div className={styles.page}>
      {/* Error display */}
      {error && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: "#fee2e2",
            color: "#dc2626",
            padding: "12px 16px",
            borderRadius: "8px",
            border: "1px solid #fecaca",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            maxWidth: "400px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <AlertCircle style={{ width: "16px", height: "16px" }} />
          <span style={{ flex: 1 }}>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              background: "transparent",
              border: "none",
              color: "#dc2626",
              cursor: "pointer",
              fontSize: "18px",
              padding: "0",
              width: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Success display */}
      {success && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: "#dcfce7",
            color: "#166534",
            padding: "12px 16px",
            borderRadius: "8px",
            border: "1px solid #bbf7d0",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            maxWidth: "400px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <CheckCircle style={{ width: "16px", height: "16px" }} />
          <span style={{ flex: 1 }}>{success}</span>
          <button
            onClick={() => setSuccess(null)}
            style={{
              background: "transparent",
              border: "none",
              color: "#166534",
              cursor: "pointer",
              fontSize: "18px",
              padding: "0",
              width: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className={styles.content} style={{ width: "100%", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Header */}
        <div className={styles.contentHeader}>
          <div>
            <h2 className={styles.title}>Прохождение теста</h2>
            <div style={{ display: "flex", gap: "16px", alignItems: "center", marginTop: "8px" }}>
              <div className={styles.itemMeta}>
                <FileText
                  className={`${styles.icon} ${styles.blue}`}
                  style={{ width: "16px", height: "16px", display: "inline", marginRight: "4px" }}
                />
                Попытка #{attemptData.attempt.id}
              </div>
              <div className={styles.itemMeta}>
                <Clock
                  className={`${styles.icon} ${styles.gray}`}
                  style={{ width: "16px", height: "16px", display: "inline", marginRight: "4px" }}
                />
                Статус: {attemptData.attempt.status}
              </div>
              {attemptData.attempt.score !== null && attemptData.attempt.score !== undefined && (
                <div className={styles.itemMeta}>
                  Балл: {attemptData.attempt.score}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate("/tests")}
            className={`${styles.btn} ${styles.gray}`}
          >
            Назад к тестам
          </button>
        </div>

        {/* Question Container - Centered or Results Display */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 0" }}>
          {testResults ? (
            /* Test Results Display */
            <div
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "16px",
                padding: "40px",
                maxWidth: "600px",
                width: "100%",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                textAlign: "center"
              }}
            >
              {/* Results Header */}
              <div style={{ marginBottom: "32px" }}>
                <CheckCircle 
                  style={{ 
                    width: "64px", 
                    height: "64px", 
                    color: "#22c55e", 
                    margin: "0 auto 16px" 
                  }} 
                />
                <h2 style={{ 
                  fontSize: "28px", 
                  fontWeight: "700", 
                  margin: "0 0 8px 0", 
                  color: "#1f2937" 
                }}>
                  Тест завершён!
                </h2>
                <p style={{ 
                  fontSize: "16px", 
                  color: "#6b7280", 
                  margin: 0 
                }}>
                  Вот ваши результаты:
                </p>
              </div>

              {/* Results Stats */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr 1fr", 
                gap: "24px", 
                marginBottom: "32px" 
              }}>
                {/* Score */}
                <div style={{
                  padding: "20px",
                  background: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0"
                }}>
                  <div style={{
                    fontSize: "32px",
                    fontWeight: "700",
                    color: "#3b82f6",
                    marginBottom: "4px"
                  }}>
                    {testResults.score}
                  </div>
                  <div style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    fontWeight: "500"
                  }}>
                    Полученный балл
                  </div>
                </div>

                {/* Max Score */}
                <div style={{
                  padding: "20px",
                  background: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0"
                }}>
                  <div style={{
                    fontSize: "32px",
                    fontWeight: "700",
                    color: "#64748b",
                    marginBottom: "4px"
                  }}>
                    {testResults.maxScore}
                  </div>
                  <div style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    fontWeight: "500"
                  }}>
                    Максимальный балл
                  </div>
                </div>

                {/* Percentage */}
                <div style={{
                  padding: "20px",
                  background: testResults.percentage >= 80 ? "#f0fdf4" : 
                           testResults.percentage >= 60 ? "#fffbeb" : "#fef2f2",
                  borderRadius: "12px",
                  border: `1px solid ${testResults.percentage >= 80 ? "#bbf7d0" : 
                                       testResults.percentage >= 60 ? "#fed7aa" : "#fecaca"}`
                }}>
                  <div style={{
                    fontSize: "32px",
                    fontWeight: "700",
                    color: testResults.percentage >= 80 ? "#22c55e" : 
                           testResults.percentage >= 60 ? "#f59e0b" : "#ef4444",
                    marginBottom: "4px"
                  }}>
                    {testResults.percentage}%
                  </div>
                  <div style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    fontWeight: "500"
                  }}>
                    Процент
                  </div>
                </div>
              </div>

              {/* Performance Message */}
              <div style={{ marginBottom: "24px" }}>
                {testResults.percentage >= 90 ? (
                  <div style={{
                    padding: "16px",
                    background: "#f0fdf4",
                    borderRadius: "8px",
                    border: "1px solid #bbf7d0"
                  }}>
                    <p style={{
                      color: "#166534",
                      margin: 0,
                      fontSize: "16px",
                      fontWeight: "500"
                    }}>
                      🎉 Отличный результат! Поздравляем!
                    </p>
                  </div>
                ) : testResults.percentage >= 70 ? (
                  <div style={{
                    padding: "16px",
                    background: "#fffbeb",
                    borderRadius: "8px",
                    border: "1px solid #fed7aa"
                  }}>
                    <p style={{
                      color: "#92400e",
                      margin: 0,
                      fontSize: "16px",
                      fontWeight: "500"
                    }}>
                      👍 Хороший результат!
                    </p>
                  </div>
                ) : (
                  <div style={{
                    padding: "16px",
                    background: "#fef2f2",
                    borderRadius: "8px",
                    border: "1px solid #fecaca"
                  }}>
                    <p style={{
                      color: "#dc2626",
                      margin: 0,
                      fontSize: "16px",
                      fontWeight: "500"
                    }}>
                      💪 Можно лучше! Продолжайте учиться.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
                <button
                  onClick={() => navigate("/tests")}
                  className={`${styles.btn} ${styles.blue}`}
                  style={{ padding: "12px 24px", fontSize: "16px" }}
                >
                  Вернуться к тестам
                </button>
              </div>
            </div>
          ) : (
            /* Question Interface */
            <div style={{ width: "100%", maxWidth: "900px" }}>
              {currentQuestion && (
                <div>
                  {/* Question Progress */}
                  <div style={{
                    background: "#f8fafc",
                    padding: "16px",
                    borderRadius: "8px",
                    marginBottom: "24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <div>
                      <span style={{ fontSize: "14px", color: "#64748b" }}>Вопрос</span>
                      <span style={{ fontSize: "18px", fontWeight: "600", marginLeft: "8px" }}>
                        {currentQuestionIndex + 1} из {attemptData.questions.length}
                      </span>
                    </div>
                    <div style={{ fontSize: "14px", color: "#64748b" }}>
                      Баллов: {currentQuestion.question.points}
                    </div>
                  </div>

                  {/* Question Content */}
                  <div style={{
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "32px",
                    marginBottom: "24px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)"
                  }}>
                    {/* Question Text */}
                    <h3 style={{
                      fontSize: "20px",
                      fontWeight: "600",
                      marginBottom: "24px",
                      color: "#1f2937",
                      lineHeight: "1.5"
                    }}>
                      {currentQuestion.question.question_text}
                    </h3>

                    {/* Question Component Based on Type */}
                    <div>
                      {currentQuestion.question.question_type === "single_choice" && (
                        <SingleChoiceAnswerComponent
                          questionData={currentQuestion.question.data}
                          answer={currentAnswer}
                          onAnswerChange={setCurrentAnswer}
                        />
                      )}
                      {currentQuestion.question.question_type === "multiple_choice" && (
                        <MultipleChoiceAnswerComponent
                          questionData={currentQuestion.question.data}
                          answer={currentAnswer}
                          onAnswerChange={setCurrentAnswer}
                        />
                      )}
                      {currentQuestion.question.question_type === "text" && (
                        <TextAnswerComponent
                          answer={currentAnswer}
                          onAnswerChange={setCurrentAnswer}
                        />
                      )}
                      {currentQuestion.question.question_type === "numeric" && (
                        <NumericAnswerComponent
                          answer={currentAnswer}
                          onAnswerChange={setCurrentAnswer}
                        />
                      )}
                      {currentQuestion.question.question_type === "matching" && (
                        <MatchingAnswerComponent
                          questionData={currentQuestion.question.data}
                          answer={currentAnswer}
                          onAnswerChange={setCurrentAnswer}
                        />
                      )}
                      {currentQuestion.question.question_type === "ordering" && (
                        <OrderingAnswerComponent
                          questionData={currentQuestion.question.data}
                          answer={currentAnswer}
                          onAnswerChange={setCurrentAnswer}
                        />
                      )}
                    </div>
                  </div>

                  {/* Navigation and Actions */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px"
                  }}>
                    {/* Previous Button */}
                    <button
                      onClick={prevQuestion}
                      disabled={currentQuestionIndex === 0}
                      className={`${styles.btn} ${styles.gray}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        opacity: currentQuestionIndex === 0 ? 0.5 : 1
                      }}
                    >
                      <ChevronLeft style={{ width: "16px", height: "16px" }} />
                      Назад
                    </button>

                    {/* Save Answer Button */}
                    <button
                      onClick={submitAnswer}
                      disabled={saving}
                      className={`${styles.btn} ${styles.blue}`}
                      style={{ display: "flex", alignItems: "center", gap: "8px" }}
                    >
                      {saving ? "Сохранение..." : "Сохранить ответ"}
                    </button>

                    {/* Next or Finish Button */}
                    {currentQuestionIndex < attemptData.questions.length - 1 ? (
                      <button
                        onClick={nextQuestion}
                        className={`${styles.btn} ${styles.blue}`}
                        style={{ display: "flex", alignItems: "center", gap: "8px" }}
                      >
                        Далее
                        <ChevronRight style={{ width: "16px", height: "16px" }} />
                      </button>
                    ) : (
                      <button
                        onClick={finishTest}
                        disabled={finishing}
                        className={`${styles.btn} ${styles.green}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          background: "#22c55e",
                          color: "white"
                        }}
                      >
                        {finishing ? "Завершение..." : "Завершить тест"}
                      </button>
                    )}
                  </div>

                  {/* Question Navigation Pills */}
                  <div style={{
                    marginTop: "32px",
                    padding: "20px",
                    background: "#f8fafc",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0"
                  }}>
                    <div style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#64748b",
                      marginBottom: "12px"
                    }}>
                      Переход к вопросу:
                    </div>
                    <div style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px"
                    }}>
                      {attemptData.questions.map((_, index) => {
                        const hasAnswer = answers.has(attemptData.questions[index].question.id);
                        return (
                          <button
                            key={index}
                            onClick={() => goToQuestion(index)}
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "8px",
                              border: "1px solid",
                              background: currentQuestionIndex === index ? "#3b82f6" :
                                         hasAnswer ? "#22c55e" : "#fff",
                              color: currentQuestionIndex === index ? "#fff" :
                                     hasAnswer ? "#fff" : "#64748b",
                              borderColor: currentQuestionIndex === index ? "#3b82f6" :
                                          hasAnswer ? "#22c55e" : "#e2e8f0",
                              cursor: "pointer",
                              fontSize: "14px",
                              fontWeight: "500",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            {index + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
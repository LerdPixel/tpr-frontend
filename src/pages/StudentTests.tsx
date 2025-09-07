import React, { useState, useEffect, useContext } from "react";
import { Context } from "../context/index";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  Calendar,
  Play,
  User,
} from "lucide-react";
import styles from "../styles/TopicsPage.module.css";

// Question components for test-taking functionality
const SingleChoiceAnswerComponent: React.FC<{
  questionData: any;
  answer: any;
  onAnswerChange: (answer: any) => void;
}> = ({ questionData, answer, onAnswerChange }) => {
  if (!questionData?.options) return null;

  return (
    <div>
      {questionData.options.map((option: string, index: number) => (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px",
            marginBottom: "8px",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            cursor: "pointer",
            background: answer === index ? "#eff6ff" : "#fff",
            borderColor: answer === index ? "#3b82f6" : "#e5e7eb",
          }}
          onClick={() => onAnswerChange(index)}
        >
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
      ? selectedOptions.filter((i) => i !== index)
      : [...selectedOptions, index];
    onAnswerChange(newSelected);
  };

  return (
    <div>
      {questionData.options.map((option: string, index: number) => {
        const isSelected = selectedOptions.includes(index);
        return (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px",
              marginBottom: "8px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              cursor: "pointer",
              background: isSelected ? "#eff6ff" : "#fff",
              borderColor: isSelected ? "#3b82f6" : "#e5e7eb",
            }}
            onClick={() => toggleOption(index)}
          >
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
        fontFamily: "inherit",
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
        fontFamily: "inherit",
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
    <div
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
    >
      <div>
        <h4
          style={{ marginBottom: "12px", fontSize: "16px", fontWeight: "600" }}
        >
          Сопоставьте:
        </h4>
        {questionData.leftItems.map((item: string, leftIndex: number) => (
          <div
            key={leftIndex}
            style={{
              padding: "12px",
              marginBottom: "8px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              background: "#f9fafb",
            }}
          >
            {item}
          </div>
        ))}
      </div>
      <div>
        <h4
          style={{ marginBottom: "12px", fontSize: "16px", fontWeight: "600" }}
        >
          С вариантами:
        </h4>
        {questionData.rightItems.map((item: string, rightIndex: number) => {
          const isUsed = Object.values(matches).includes(rightIndex);
          return (
            <div
              key={rightIndex}
              style={{
                padding: "12px",
                marginBottom: "8px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                background: isUsed ? "#f3f4f6" : "#fff",
                cursor: "pointer",
                opacity: isUsed ? 0.6 : 1,
              }}
              onClick={() => {
                const leftIndex = Object.keys(matches).find(
                  (key) => matches[key] === rightIndex
                );
                if (leftIndex !== undefined) {
                  const newMatches = { ...matches };
                  delete newMatches[leftIndex];
                  onAnswerChange(newMatches);
                }
              }}
            >
              {item}
              {isUsed && (
                <span style={{ marginLeft: "8px", color: "#22c55e" }}>✓</span>
              )}
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
      <p style={{ marginBottom: "16px", color: "#6b7280" }}>
        Расположите элементы в правильном порядке:
      </p>
      {orderedItems.map((item: string, index: number) => (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px",
            marginBottom: "8px",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            background: "#fff",
          }}
        >
          <span
            style={{ fontSize: "14px", color: "#6b7280", minWidth: "20px" }}
          >
            {index + 1}.
          </span>
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
                  fontSize: "12px",
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
                  fontSize: "12px",
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

// Types from API documentation
interface TestSchedule {
  id: number;
  user_id: number;
  discipline_id: number;
  opens_at: string;
  closes_at: string;
  attempt_time_limit_sec: number;
  max_attempts?: number;
  created_at?: string;
  updated_at?: string;
}

interface Test {
  id: number;
  title: string;
  description?: string;
}

interface Discipline {
  id: number;
  name: string;
  description?: string;
}

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

interface TestScheduleWithDetails extends TestSchedule {
  test?: Test;
  discipline?: Discipline;
}

export default function StudentTestsPage() {
  const { store } = useContext(Context);
  const navigate = useNavigate();

  // Authentication guard
  if (!store.isAuth || store.role !== "student") {
    navigate("/login");
    return null;
  }

  // Page state
  const [testSchedules, setTestSchedules] = useState<TestScheduleWithDetails[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Test taking state
  const [currentAttempt, setCurrentAttempt] =
    useState<AttemptDetailView | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [finishing, setFinishing] = useState(false);
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

  // Fetch open test schedules for current student
  const fetchOpenTestSchedules = async () => {
    setLoading(true);
    try {
      console.log("Fetching student disciplines...");
      // First, get student's discipline IDs
      const disciplinesResponse = await axios.get(
        `/server/disciplines/my-ids`,
        {
          headers: { Authorization: `Bearer ${getAccess()}` },
        }
      );

      console.log("Disciplines response:", disciplinesResponse.data);

      if (disciplinesResponse.status === 200) {
        const disciplineIds = disciplinesResponse.data as number[];
        console.log("Student discipline IDs:", disciplineIds);

        // Get test schedules for each discipline
        const schedulePromises = disciplineIds.map(async (disciplineId) => {
          try {
            console.log(`Fetching schedule for discipline ${disciplineId}...`);
            const response = await axios.get(
              `/server/disciplines/${disciplineId}/test/schedule`,
              {
                headers: { Authorization: `Bearer ${getAccess()}` },
              }
            );
            console.log(
              `Schedule response for discipline ${disciplineId}:`,
              response.data
            );
            return { disciplineId, data: response.data };
          } catch (err) {
            // If no schedule for this discipline, skip it
            console.log(`No schedule for discipline ${disciplineId}:`, err);
            return null;
          }
        });

        const scheduleResults = await Promise.all(schedulePromises);
        const validSchedules = scheduleResults.filter(
          (result) => result !== null
        );

        console.log("Valid schedules found:", validSchedules);

        // Process schedules and add discipline/test details
        const schedulesWithDetails = await Promise.all(
          validSchedules.map(async (result) => {
            const { disciplineId, data: schedule } = result!;

            // Fetch test and discipline details
            const [testResponse, disciplineResponse] = await Promise.all([
              axios
                .get(`/server/disciplines/${disciplineId}/test`, {
                  headers: { Authorization: `Bearer ${getAccess()}` },
                })
                .catch(() => null),
              axios
                .get(`/server/disciplines/${disciplineId}`, {
                  headers: { Authorization: `Bearer ${getAccess()}` },
                })
                .catch(() => null),
            ]);

            return {
              ...(schedule as any),
              discipline_id: disciplineId,
              test: (testResponse as any)?.data || null,
              discipline: (disciplineResponse as any)?.data || null,
            };
          })
        );

        console.log("Schedules with details:", schedulesWithDetails);

        // Filter only open schedules
        const now = new Date();
        const openSchedules = schedulesWithDetails.filter((schedule: any) => {
          if (!schedule.opens_at || !schedule.closes_at) return false;
          const opens = new Date(schedule.opens_at);
          const closes = new Date(schedule.closes_at);
          const isOpen = now >= opens && now <= closes;
          console.log(
            `Schedule for discipline ${schedule.discipline_id}: opens=${opens}, closes=${closes}, now=${now}, isOpen=${isOpen}`
          );
          return isOpen;
        });

        console.log("Open schedules:", openSchedules);
        setTestSchedules(openSchedules);
      }
    } catch (err: any) {
      console.error("Error fetching test schedules:", err);
      setError(
        `Ошибка при загрузке открытых тестов: ${
          err.response?.data?.error || err.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Start test attempt
  const startTestAttempt = async (testId: number, disciplineId: number) => {
    try {
      const response = await axios.post(
        `/server/tests/${testId}/attempts`,
        { discipline_id: disciplineId },
        {
          headers: { Authorization: `Bearer ${getAccess()}` },
        }
      );
      if (response.status !== 201 && response.status !== 200) {
        throw new Error("Ошибка при создании попытки теста");
      }

      // Get the attempt ID and start the test
      const attemptId = (response.data as { id: number }).id;
      await fetchAttemptData(attemptId);
      setSuccess("Тест начат!");
    } catch (err: any) {
      console.error("Error starting test attempt:", err);
      if (err.response?.data?.error) {
        setError(`Ошибка: ${err.response.data.error}`);
      } else {
        setError(err?.message || "Ошибка при создании попытки теста");
      }
    }
  };

  // Fetch attempt data and questions
  const fetchAttemptData = async (attemptId: number) => {
    setLoading(true);
    try {
      const [attemptResponse, questionsResponse] = await Promise.all([
        axios.get(`/server/attempts/${attemptId}`, {
          headers: { Authorization: `Bearer ${getAccess()}` },
        }),
        axios.get(`/server/attempts/${attemptId}/questions`, {
          headers: { Authorization: `Bearer ${getAccess()}` },
        }),
      ]);

      const attemptInfo = attemptResponse.data as Attempt;
      const questions = questionsResponse.data as Question[];

      const data: AttemptDetailView = {
        attempt: attemptInfo,
        questions: questions.map((q) => ({
          answer: null,
          question: q,
        })),
      };

      setCurrentAttempt(data);
      setAnswers(new Map());
      setCurrentQuestionIndex(0);
      setCurrentAnswer(null);
    } catch (err: any) {
      console.error("Error fetching attempt data:", err);
      setError("Ошибка при загрузке данных попытки");
    } finally {
      setLoading(false);
    }
  };

  // Submit answer for current question
  const submitAnswer = async () => {
    if (!currentAttempt) return;

    const currentQuestion = currentAttempt.questions[currentQuestionIndex];
    if (!currentQuestion) return;

    setSaving(true);
    try {
      const answerData: AnswerSubmitInput = {
        question_id: currentQuestion.question.id,
        answer: currentAnswer,
      };

      const response = await axios.post(
        `/server/attempts/${currentAttempt.attempt.id}/answers`,
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
      setError(err?.message || "Ошибка при сохранении ответа");
    } finally {
      setSaving(false);
    }
  };

  // Finish test attempt
  const finishTest = async () => {
    if (!currentAttempt) return;

    if (
      !window.confirm(
        "Вы уверены, что хотите завершить тест? После завершения изменить ответы будет невозможно."
      )
    ) {
      return;
    }

    setFinishing(true);
    try {
      const response = await axios.post(
        `/server/attempts/${currentAttempt.attempt.id}/finish`,
        {},
        {
          headers: { Authorization: `Bearer ${getAccess()}` },
        }
      );

      const finishedAttempt = response.data as Attempt;
      const maxScore = currentAttempt.questions.reduce(
        (total, q) => total + (q.question.points || 0),
        0
      );
      const score = finishedAttempt.score || 0;
      const percentage =
        maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

      setTestResults({ score, maxScore, percentage });
      setSuccess("Тест завершен!");
    } catch (err: any) {
      console.error("Error finishing test:", err);
      setError(err?.message || "Ошибка при завершении теста");
    } finally {
      setFinishing(false);
    }
  };

  // Navigation functions
  const goToQuestion = (index: number) => {
    if (
      !currentAttempt ||
      index < 0 ||
      index >= currentAttempt.questions.length
    )
      return;

    if (currentAttempt.questions[currentQuestionIndex]) {
      const currentQuestionId =
        currentAttempt.questions[currentQuestionIndex].question.id;
      const newAnswers = new Map(answers);
      newAnswers.set(currentQuestionId, currentAnswer);
      setAnswers(newAnswers);
    }

    setCurrentQuestionIndex(index);
    const newQuestionId = currentAttempt.questions[index].question.id;
    setCurrentAnswer(answers.get(newQuestionId) || null);
  };

  const nextQuestion = () => {
    if (!currentAttempt) return;
    if (currentQuestionIndex < currentAttempt.questions.length - 1) {
      goToQuestion(currentQuestionIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      goToQuestion(currentQuestionIndex - 1);
    }
  };

  // Load test schedules on component mount
  useEffect(() => {
    fetchOpenTestSchedules();
  }, []);

  // Update current answer when question changes
  useEffect(() => {
    if (currentAttempt && currentAttempt.questions[currentQuestionIndex]) {
      const question = currentAttempt.questions[currentQuestionIndex];
      const questionId = question.question.id;
      const existingAnswer = answers.get(questionId);
      setCurrentAnswer(existingAnswer || null);
    }
  }, [currentQuestionIndex, currentAttempt, answers]);

  if (loading && !currentAttempt) {
    return (
      <div className={styles.page}>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>Загрузка открытых тестов...</p>
        </div>
      </div>
    );
  }

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

      {currentAttempt ? (
        /* Test Taking Interface */
        <div
          className={styles.content}
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
          {/* Header */}
          <div className={styles.contentHeader}>
            <div>
              <h2 className={styles.title}>Прохождение теста</h2>
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  alignItems: "center",
                  marginTop: "8px",
                }}
              >
                <div className={styles.itemMeta}>
                  <FileText
                    className={`${styles.icon} ${styles.blue}`}
                    style={{
                      width: "16px",
                      height: "16px",
                      display: "inline",
                      marginRight: "4px",
                    }}
                  />
                  Попытка #{currentAttempt.attempt.id}
                </div>
                <div className={styles.itemMeta}>
                  <Clock
                    className={`${styles.icon} ${styles.gray}`}
                    style={{
                      width: "16px",
                      height: "16px",
                      display: "inline",
                      marginRight: "4px",
                    }}
                  />
                  Статус: {currentAttempt.attempt.status}
                </div>
                {currentAttempt.attempt.score !== null &&
                  currentAttempt.attempt.score !== undefined && (
                    <div className={styles.itemMeta}>
                      Балл: {currentAttempt.attempt.score}
                    </div>
                  )}
              </div>
            </div>
            <button
              onClick={() => {
                setCurrentAttempt(null);
                setTestResults(null);
                fetchOpenTestSchedules();
              }}
              className={`${styles.btn} ${styles.gray}`}
            >
              Назад к тестам
            </button>
          </div>

          {/* Question Container */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px 0",
            }}
          >
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
                  textAlign: "center",
                }}
              >
                <div style={{ marginBottom: "32px" }}>
                  <CheckCircle
                    style={{
                      width: "64px",
                      height: "64px",
                      color: "#22c55e",
                      margin: "0 auto 16px",
                    }}
                  />
                  <h2
                    style={{
                      fontSize: "28px",
                      fontWeight: "700",
                      margin: "0 0 8px 0",
                      color: "#1f2937",
                    }}
                  >
                    Тест завершён!
                  </h2>
                  <p style={{ fontSize: "16px", color: "#6b7280", margin: 0 }}>
                    Вот ваши результаты:
                  </p>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "24px",
                    marginBottom: "32px",
                  }}
                >
                  <div
                    style={{
                      padding: "20px",
                      background: "#f8fafc",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "32px",
                        fontWeight: "700",
                        color: "#3b82f6",
                        marginBottom: "4px",
                      }}
                    >
                      {testResults.score}
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#6b7280",
                        fontWeight: "500",
                      }}
                    >
                      Полученный балл
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "20px",
                      background: "#f8fafc",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "32px",
                        fontWeight: "700",
                        color: "#64748b",
                        marginBottom: "4px",
                      }}
                    >
                      {testResults.maxScore}
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#6b7280",
                        fontWeight: "500",
                      }}
                    >
                      Максимальный балл
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "20px",
                      background:
                        testResults.percentage >= 80
                          ? "#f0fdf4"
                          : testResults.percentage >= 60
                          ? "#fffbeb"
                          : "#fef2f2",
                      borderRadius: "12px",
                      border: `1px solid ${
                        testResults.percentage >= 80
                          ? "#bbf7d0"
                          : testResults.percentage >= 60
                          ? "#fed7aa"
                          : "#fecaca"
                      }`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "32px",
                        fontWeight: "700",
                        color:
                          testResults.percentage >= 80
                            ? "#22c55e"
                            : testResults.percentage >= 60
                            ? "#f59e0b"
                            : "#ef4444",
                        marginBottom: "4px",
                      }}
                    >
                      {testResults.percentage}%
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#6b7280",
                        fontWeight: "500",
                      }}
                    >
                      Процент
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    justifyContent: "center",
                  }}
                >
                  <button
                    onClick={() => {
                      setCurrentAttempt(null);
                      setTestResults(null);
                      fetchOpenTestSchedules();
                    }}
                    className={`${styles.btn} ${styles.blue}`}
                    style={{ padding: "12px 24px", fontSize: "16px" }}
                  >
                    Вернуться к тестам
                  </button>
                </div>
              </div>
            ) : (
              /* Question Interface */
              currentAttempt.questions[currentQuestionIndex] && (
                <div style={{ width: "100%", maxWidth: "900px" }}>
                  {/* Question Progress */}
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "16px",
                      borderRadius: "8px",
                      marginBottom: "24px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "14px", color: "#64748b" }}>
                        Вопрос
                      </span>
                      <span
                        style={{
                          fontSize: "18px",
                          fontWeight: "600",
                          marginLeft: "8px",
                        }}
                      >
                        {currentQuestionIndex + 1} из{" "}
                        {currentAttempt.questions.length}
                      </span>
                    </div>
                    <div style={{ fontSize: "14px", color: "#64748b" }}>
                      Баллов:{" "}
                      {
                        currentAttempt.questions[currentQuestionIndex].question
                          .points
                      }
                    </div>
                  </div>

                  {/* Question Content */}
                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      padding: "32px",
                      marginBottom: "24px",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "20px",
                        fontWeight: "600",
                        marginBottom: "24px",
                        color: "#1f2937",
                        lineHeight: "1.5",
                      }}
                    >
                      {
                        currentAttempt.questions[currentQuestionIndex].question
                          .question_text
                      }
                    </h3>

                    {/* Question Component Based on Type */}
                    <div>
                      {currentAttempt.questions[currentQuestionIndex].question
                        .question_type === "single_choice" && (
                        <SingleChoiceAnswerComponent
                          questionData={
                            currentAttempt.questions[currentQuestionIndex]
                              .question.data
                          }
                          answer={currentAnswer}
                          onAnswerChange={setCurrentAnswer}
                        />
                      )}
                      {currentAttempt.questions[currentQuestionIndex].question
                        .question_type === "multiple_choice" && (
                        <MultipleChoiceAnswerComponent
                          questionData={
                            currentAttempt.questions[currentQuestionIndex]
                              .question.data
                          }
                          answer={currentAnswer}
                          onAnswerChange={setCurrentAnswer}
                        />
                      )}
                      {currentAttempt.questions[currentQuestionIndex].question
                        .question_type === "text" && (
                        <TextAnswerComponent
                          answer={currentAnswer}
                          onAnswerChange={setCurrentAnswer}
                        />
                      )}
                      {currentAttempt.questions[currentQuestionIndex].question
                        .question_type === "numeric" && (
                        <NumericAnswerComponent
                          answer={currentAnswer}
                          onAnswerChange={setCurrentAnswer}
                        />
                      )}
                      {currentAttempt.questions[currentQuestionIndex].question
                        .question_type === "matching" && (
                        <MatchingAnswerComponent
                          questionData={
                            currentAttempt.questions[currentQuestionIndex]
                              .question.data
                          }
                          answer={currentAnswer}
                          onAnswerChange={setCurrentAnswer}
                        />
                      )}
                      {currentAttempt.questions[currentQuestionIndex].question
                        .question_type === "ordering" && (
                        <OrderingAnswerComponent
                          questionData={
                            currentAttempt.questions[currentQuestionIndex]
                              .question.data
                          }
                          answer={currentAnswer}
                          onAnswerChange={setCurrentAnswer}
                        />
                      )}
                    </div>
                  </div>

                  {/* Navigation and Actions */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <button
                      onClick={prevQuestion}
                      disabled={currentQuestionIndex === 0}
                      className={`${styles.btn} ${styles.gray}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        opacity: currentQuestionIndex === 0 ? 0.5 : 1,
                      }}
                    >
                      <ChevronLeft style={{ width: "16px", height: "16px" }} />
                      Назад
                    </button>
                    <button
                      onClick={submitAnswer}
                      disabled={saving}
                      className={`${styles.btn} ${styles.blue}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {saving ? "Сохранение..." : "Сохранить ответ"}
                    </button>
                    {currentQuestionIndex <
                    currentAttempt.questions.length - 1 ? (
                      <button
                        onClick={nextQuestion}
                        className={`${styles.btn} ${styles.blue}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        Далее
                        <ChevronRight
                          style={{ width: "16px", height: "16px" }}
                        />
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
                          color: "white",
                        }}
                      >
                        {finishing ? "Завершение..." : "Завершить тест"}
                      </button>
                    )}
                  </div>

                  {/* Question Navigation Pills */}
                  <div
                    style={{
                      marginTop: "32px",
                      padding: "20px",
                      background: "#f8fafc",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#64748b",
                        marginBottom: "12px",
                      }}
                    >
                      Переход к вопросу:
                    </div>
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                    >
                      {currentAttempt.questions.map((_, index) => {
                        const hasAnswer = answers.has(
                          currentAttempt.questions[index].question.id
                        );
                        return (
                          <button
                            key={index}
                            onClick={() => goToQuestion(index)}
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "8px",
                              border: "1px solid",
                              background:
                                currentQuestionIndex === index
                                  ? "#3b82f6"
                                  : hasAnswer
                                  ? "#22c55e"
                                  : "#fff",
                              color:
                                currentQuestionIndex === index
                                  ? "#fff"
                                  : hasAnswer
                                  ? "#fff"
                                  : "#64748b",
                              borderColor:
                                currentQuestionIndex === index
                                  ? "#3b82f6"
                                  : hasAnswer
                                  ? "#22c55e"
                                  : "#e2e8f0",
                              cursor: "pointer",
                              fontSize: "14px",
                              fontWeight: "500",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {index + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      ) : (
        /* Test Selection Interface */
        <div className={styles.content}>
          <div className={styles.contentHeader}>
            <h2 className={styles.title}>Мои открытые тесты</h2>
            <p className={styles.subtitle}>Доступные для прохождения тесты</p>
          </div>

          {testSchedules.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#6b7280",
              }}
            >
              <FileText
                style={{
                  width: "48px",
                  height: "48px",
                  margin: "0 auto 16px",
                  color: "#d1d5db",
                }}
              />
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "500",
                  marginBottom: "8px",
                }}
              >
                Нет открытых тестов
              </h3>
              <p>У вас пока нет доступных для прохождения тестов</p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                gap: "24px",
              }}
            >
              {testSchedules.map((schedule) => {
                const now = new Date();
                const opens = new Date(schedule.opens_at);
                const closes = new Date(schedule.closes_at);
                const timeLeft = Math.max(0, closes.getTime() - now.getTime());
                const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
                const minutesLeft = Math.floor(
                  (timeLeft % (1000 * 60 * 60)) / (1000 * 60)
                );

                return (
                  <div
                    key={schedule.id}
                    style={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "16px",
                      padding: "24px",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                      transition: "all 0.2s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 8px 24px rgba(0, 0, 0, 0.12)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(0, 0, 0, 0.05)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "16px",
                        marginBottom: "16px",
                      }}
                    >
                      <div
                        style={{
                          background: "#eff6ff",
                          padding: "12px",
                          borderRadius: "12px",
                          border: "1px solid #dbeafe",
                        }}
                      >
                        <FileText
                          style={{
                            width: "24px",
                            height: "24px",
                            color: "#3b82f6",
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3
                          style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            marginBottom: "4px",
                            color: "#1f2937",
                          }}
                        >
                          {schedule.test?.title || "Тест"}
                        </h3>
                        <p
                          style={{
                            fontSize: "14px",
                            color: "#6b7280",
                            marginBottom: "8px",
                          }}
                        >
                          {schedule.discipline?.name || "Дисциплина"}
                        </p>
                        {schedule.test?.description && (
                          <p
                            style={{
                              fontSize: "14px",
                              color: "#9ca3af",
                              marginBottom: "8px",
                            }}
                          >
                            {schedule.test.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        marginBottom: "20px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <Calendar
                          style={{
                            width: "16px",
                            height: "16px",
                            color: "#6b7280",
                          }}
                        />
                        <span style={{ fontSize: "14px", color: "#6b7280" }}>
                          Открыт до:{" "}
                          {new Date(schedule.closes_at).toLocaleString("ru-RU")}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <Clock
                          style={{
                            width: "16px",
                            height: "16px",
                            color: "#6b7280",
                          }}
                        />
                        <span style={{ fontSize: "14px", color: "#6b7280" }}>
                          Время на выполнение:{" "}
                          {Math.floor(schedule.attempt_time_limit_sec / 60)} мин
                        </span>
                      </div>
                      {timeLeft > 0 && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <AlertCircle
                            style={{
                              width: "16px",
                              height: "16px",
                              color: timeLeft < 3600000 ? "#f59e0b" : "#10b981",
                            }}
                          />
                          <span
                            style={{
                              fontSize: "14px",
                              color: timeLeft < 3600000 ? "#f59e0b" : "#10b981",
                              fontWeight: "500",
                            }}
                          >
                            Осталось: {hoursLeft > 0 ? `${hoursLeft}ч ` : ""}
                            {minutesLeft}мин
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (schedule.test && schedule.discipline) {
                          startTestAttempt(
                            schedule.test.id,
                            schedule.discipline.id
                          );
                        }
                      }}
                      className={`${styles.btn} ${styles.blue}`}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        padding: "12px 20px",
                        fontSize: "16px",
                        fontWeight: "500",
                      }}
                    >
                      <Play style={{ width: "16px", height: "16px" }} />
                      Начать тест
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

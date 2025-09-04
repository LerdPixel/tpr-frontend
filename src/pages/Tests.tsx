import { useState, useEffect, useRef } from "react";
import QuestionCreator from "./QuestionCreator";
import type IQuestion from "../components/ui/interfaces/IQuestion";
import { Context } from "../context/index.ts";
import axios from "axios";
import { useContext } from "react";
import {
  ListChecks,
  CheckSquare,
  FileText,
  Hash,
  ArrowDownAZ,
  Shuffle,
  Plus,
  MoreVertical,
} from "lucide-react";
import styles from "../styles/TopicsPage.module.css";
import Modal from "@/components/news/Modal";

// Типы данных
interface Topic {
  id: number;
  title: string;
  description: string;
}

// Функция выбора иконки по типу вопроса
const getIconByType = (type: string) => {
  switch (type) {
    case "single_choice":
      return <CheckSquare className={`${styles.icon} ${styles.blue}`} />;
    case "multiple_choice":
      return <ListChecks className={`${styles.icon} ${styles.green}`} />;
    case "text":
      return <FileText className={`${styles.icon} ${styles.purple}`} />;
    case "numeric":
      return <Hash className={`${styles.icon} ${styles.orange}`} />;
    case "sortable":
      return <ArrowDownAZ className={`${styles.icon} ${styles.pink}`} />;
    case "matching":
      return <Shuffle className={`${styles.icon} ${styles.teal}`} />;
    default:
      return <FileText className={`${styles.icon} ${styles.gray}`} />;
  }
};

export default function TopicsPage() {
  const { store } = useContext(Context);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [postError, setPostError] = useState<string | null>(null);
  const [menu, setMenu] = useState<{
    type: "topic" | "question";
    id: number;
  } | null>(null);
  const [modalData, setModalData] = useState<any | null>(null);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  const getAccess = () => {
    const access_token = localStorage.getItem("token");
    if (access_token == null) {
      store.refresh();
    }
    return access_token;
  };
  const modalRef = useRef<HTMLDivElement | null>(null);
  const fetchTopics = async () => {
    try {
      const response = await axios.get("/server/admin/topics", {
        headers: { Authorization: `Bearer ${getAccess()}` },
      });
      if (response.status != 200) throw new Error("Ошибка при загрузке тем");
      const data = response.data as Topic[];
      setTopics(data);
    } catch (err: any) {
      setPostError(err?.message || "Неизвестная ошибка");
    }
  };
  const createTopic = async (topic: Omit<Topic, "id">) => {
    const access_token = localStorage.getItem("token");
    if (access_token == null) {
      store.refresh();
    }
    const response = await axios.post("/server/admin/topics", topic, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (response.status != 201) setPostError("Ошибка при создании темы");
    await fetchTopics();
  };
  const updateTopic = async (id: number, topic: Omit<Topic, "id">) => {
    const response = await axios.put(`/server/admin/topics/${id}`, topic, {
      headers: { Authorization: `Bearer ${getAccess()}` },
    });
    if (response.status != 200) setPostError("Ошибка при изменении темы");
    await fetchTopics();
  };
  const deleteTopic = async (id: number) => {
    const response = await axios.delete(`/server/admin/topics/${id}`, {
      headers: { Authorization: `Bearer ${getAccess()}` },
    });
    if (response.status != 200) setPostError("Ошибка при удалении темы");
    await fetchTopics();
  };
  // Fetch questions for selected topic
  const fetchQuestions = async (topicId: number) => {
    setQuestionsLoading(true);
    try {
      const response = await axios.get(
        `/server/admin/topics/${topicId}/questions`,
        {
          headers: { Authorization: `Bearer ${getAccess()}` },
        }
      );
      if (response.status === 200) {
        setQuestions(response.data as IQuestion[]);
      } else {
        throw new Error("Ошибка при загрузке вопросов");
      }
    } catch (err: any) {
      setPostError(err?.message || "Ошибка при загрузке вопросов");
      setQuestions([]);
    } finally {
      setQuestionsLoading(false);
    }
  };
  // Create question
  const createQuestion = async (question: Omit<IQuestion, "id">) => {
    try {
      const response = await axios.post("/server/admin/questions", question, {
        headers: {
          Authorization: `Bearer ${getAccess()}`,
          "Content-Type": "application/json",
        },
      });
      if (response.status === 201) {
        return { ...question, id: (response.data as { id: number }).id };
      } else {
        throw new Error("Ошибка при создании вопроса");
      }
    } catch (err: any) {
      setPostError(
        err?.response?.data?.error ||
          err?.message ||
          "Ошибка при создании вопроса"
      );
      throw err;
    }
  };

  // Update question
  const updateQuestion = async (
    id: number,
    question: Omit<IQuestion, "id">
  ) => {
    try {
      const response = await axios.put(
        `/server/admin/questions/${id}`,
        question,
        {
          headers: {
            Authorization: `Bearer ${getAccess()}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status !== 200) {
        throw new Error("Ошибка при обновлении вопроса");
      }
    } catch (err: any) {
      setPostError(
        err?.response?.data?.error ||
          err?.message ||
          "Ошибка при обновлении вопроса"
      );
      throw err;
    }
  };

  // Delete question
  const deleteQuestion = async (id: number) => {
    try {
      const response = await axios.delete(`/server/admin/questions/${id}`, {
        headers: { Authorization: `Bearer ${getAccess()}` },
      });
      if (response.status !== 200) {
        throw new Error("Ошибка при удалении вопроса");
      }
    } catch (err: any) {
      setPostError(
        err?.response?.data?.error ||
          err?.message ||
          "Ошибка при удалении вопроса"
      );
      throw err;
    }
  };
  useEffect(() => {
    fetchTopics();
  }, []);

  // Load questions when topic is selected
  useEffect(() => {
    if (selectedTopic !== null) {
      fetchQuestions(selectedTopic);
    } else {
      setQuestions([]);
    }
  }, [selectedTopic]);

  // ---------- TOPICS ----------
  const addTopic = () => {
    const newId = topics.length ? Math.max(...topics.map((t) => t.id)) + 1 : 0;
    setModalData({
      type: "topic",
      mode: "create",
      data: { id: newId, title: "", description: "" },
    });
  };

  const removeTopic = async (id: number) => {
    await deleteTopic(id);
    if (selectedTopic === id) setSelectedTopic(null);
    setMenu(null);
  };

  // ---------- QUESTIONS ----------
  const addQuestion = () => {
    if (selectedTopic === null) return;
    const newId = questions.length
      ? Math.max(...questions.map((q) => q.id)) + 1
      : 0;
    setModalData({
      type: "question",
      mode: "create",
      data: {
        id: newId,
        question_text: "",
        points: 1,
        question_type: "single_choice",
        data: { options: [""] },
      },
      topic_id: selectedTopic,
    });
  };

  const editTopic = (id: number) => {
    const topic = topics.find((t) => t.id === id);
    if (!topic) return;
    setModalData({ type: "topic", mode: "edit", id, data: topic });
    setMenu(null);
  };

  const editQuestion = (id: number) => {
    const question = questions.find((q) => q.id === id);
    if (!question) return;
    setModalData({
      type: "question",
      mode: "edit",
      id,
      data: question,
      topic_id: question.topic_id,
    });
    setMenu(null);
  };

  const removeQuestion = async (id: number) => {
    try {
      await deleteQuestion(id);
      setQuestions(questions.filter((q) => q.id !== id));
      setMenu(null);
    } catch (err) {
      // Error is already handled in deleteQuestion
    }
  };

  // ---------- SAVE ----------
  const saveModal = async () => {
    if (!modalData) return;
    if (modalData.type === "topic") {
      if (modalData.mode === "create") {
        await createTopic(modalData.data);
      } else {
        console.log("dsfdasdds");

        await updateTopic(modalData.id, modalData.data);
      }
    }
    /*
    if (modalData.type === "topic") {
      if (modalData.mode === "create") {
        setTopics([...topics, modalData.data]);
      } else {
        setTopics(topics.map((t) => (t.id === modalData.id ? modalData.data : t)));
      }
    } else if (modalData.type === "question") {
      if (modalData.mode === "create") {
        const newQuestion: IQuestion = { ...modalData.data, topic_id: modalData.topic_id };
        setQuestions([...questions, newQuestion]);
      } else {
        setQuestions(questions.map((q) => (q.id === modalData.id ? modalData.data : q)));
      }
    }*/

    setModalData(null);
  };

  const saveQuestion = async (question: IQuestion) => {
    if (!modalData || modalData.type !== "question") return;
    try {
      if (modalData.mode === "create") {
        const newQuestion = await createQuestion(question);
        setQuestions([...questions, newQuestion]);
      } else {
        await updateQuestion(question.id, question);
        setQuestions(
          questions.map((q) =>
            q.id === question.id ? { ...question, topic_id: q.topic_id } : q
          )
        );
      }
      setModalData(null);
    } catch (err) {
      // Error is already handled in createQuestion/updateQuestion
    }
  };

  return (
    <div className={styles.page}>
      {/* Сайдбар: темы */}
      {postError && (
        <h1 style={{ color: "red" }}>Произошла ошибка в {postError}</h1>
      )}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.title}>Темы</h2>
          <button onClick={addTopic} className={`${styles.btn} ${styles.blue}`}>
            <Plus className={styles.icon} />
          </button>
        </div>
        <ul className={styles.list}>
          {topics.map((topic) => (
            <li
              key={topic.id}
              className={`${styles.listItem} ${
                selectedTopic === topic.id ? styles.active : ""
              }`}
            >
              <div onClick={() => setSelectedTopic(topic.id)}>
                <div className={styles.itemTitle}>{topic.title}</div>
                <div className={styles.itemDesc}>{topic.description}</div>
              </div>
              <div className={styles.menuContainer}>
                <button
                  onClick={() => setMenu({ type: "topic", id: topic.id })}
                  className={styles.menuBtn}
                >
                  <MoreVertical className={styles.icon} />
                </button>
                {menu?.id === topic.id && menu?.type === "topic" && (
                  <div className={styles.dropdown}>
                    <button
                      onClick={() => {
                        console.log(topic.id);
                        editTopic(topic.id);
                      }}
                      className={styles.dropdownItem}
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => {
                        console.log(topic.id);
                        removeTopic(topic.id);
                      }}
                      className={`${styles.dropdownItem} ${styles.danger}`}
                    >
                      Удалить
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Контент: вопросы */}
      <div className={styles.content}>
        <div className={styles.contentHeader}>
          <h2 className={styles.title}>Вопросы</h2>
          {selectedTopic !== null && (
            <button
              onClick={addQuestion}
              className={`${styles.btn} ${styles.green}`}
            >
              <Plus className={styles.icon} />
            </button>
          )}
        </div>
        {selectedTopic === null ? (
          <p className={styles.placeholder}>
            Выберите тему, чтобы увидеть вопросы
          </p>
        ) : questionsLoading ? (
          <p className={styles.placeholder}>Загрузка вопросов...</p>
        ) : (
          <ul className={styles.list}>
            {questions.map((q) => (
              <li key={q.id} className={styles.listItem}>
                <div className={styles.itemMain}>
                  <div className={styles.iconContainer}>
                    {getIconByType(q.question_type)}
                  </div>
                  <div>
                    <div className={styles.itemTitle}>{q.question_text}</div>
                    <div className={styles.itemMeta}>
                      Тип: {q.question_type}
                    </div>
                    <div className={styles.itemMeta}>Баллы: {q.points}</div>
                  </div>
                </div>
                <div className={styles.menuContainer}>
                  <button
                    onClick={() =>
                      setMenu(
                        menu?.id === q.id && menu?.type === "question"
                          ? null
                          : { type: "question", id: q.id }
                      )
                    }
                    className={styles.menuBtn}
                  >
                    <MoreVertical className={styles.icon} />
                  </button>
                  {menu?.id === q.id && menu?.type === "question" && (
                    <div className={styles.dropdown}>
                      <button
                        onClick={() => editQuestion(q.id)}
                        className={styles.dropdownItem}
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => removeQuestion(q.id)}
                        className={`${styles.dropdownItem} ${styles.danger}`}
                      >
                        Удалить
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Модалка для вопросов */}
      <Modal
        open={modalData && modalData.type === "question"}
        onClose={() => setModalData(null)}
      >
        <QuestionCreator
          saveQuestion={saveQuestion}
          modalData={modalData}
          setModalData={setModalData}
        />
      </Modal>

      {/* Модалка для тем */}
      {modalData && modalData.type === "topic" && (
        <div className={styles.modalOverlay}>
          <div ref={modalRef} className={styles.modal}>
            <h3 className={styles.modalTitle}>
              {modalData.mode === "create" ? "Создать" : "Редактировать"} тему
            </h3>
            <input
              type="text"
              value={modalData.data.title}
              onChange={(e) =>
                setModalData({
                  ...modalData,
                  data: { ...modalData.data, title: e.target.value },
                })
              }
              placeholder="Название темы"
              className={styles.input}
            />
            <textarea
              value={modalData.data.description}
              onChange={(e) =>
                setModalData({
                  ...modalData,
                  data: { ...modalData.data, description: e.target.value },
                })
              }
              placeholder="Описание"
              className={styles.textarea}
            />
            <div className={styles.modalActions}>
              <button
                onClick={() => setModalData(null)}
                className={`${styles.btn} ${styles.gray}`}
              >
                Отмена
              </button>
              <button
                onClick={saveModal}
                className={`${styles.btn} ${styles.blue}`}
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

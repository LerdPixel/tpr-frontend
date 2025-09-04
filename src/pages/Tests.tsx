import React, { useState, useEffect, useRef } from "react";
import QuestionCreator from "./QuestionCreator";
import type IQuestion from "../components/ui/interfaces/IQuestion";
import { Context } from '../context/index.ts';
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

// Пример данных
const initialTopics: Topic[] = [
  { id: 0, title: "Математика", description: "Вопросы по алгебре и геометрии" },
  { id: 1, title: "История", description: "Вопросы по мировой истории" },
  { id: 2, title: "Физика", description: "Законы и явления природы" },
];

const initialQuestions: IQuestion[] = [
  {
    id: 0,
    data: { options: ["2", "3", "4"], correct: 1 },
    points: 1,
    question_text: "Сколько будет 2+2?",
    question_type: "single_choice",
    topic_id: 0,
  },
  {
    id: 1,
    data: {},
    points: 2,
    question_text: "Кто был первым президентом США?",
    question_type: "text",
    topic_id: 1,
  },
  {
    id: 2,
    data: {},
    points: 1,
    question_text: "Что измеряется в Ньютонах?",
    question_type: "single_choice",
    topic_id: 2,
  },
];

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
    const {store} = useContext(Context)
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questions, setQuestions] = useState<IQuestion[]>(initialQuestions);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
const [postError, setPostError] = useState();
  const [menu, setMenu] = useState<{ type: "topic" | "question"; id: number } | null>(null);
  const [modalData, setModalData] = useState<any | null>(null);
const [loading, setLoading] = useState(true)

    const getAccess = () => {
        const access_token = localStorage.getItem("token")
        if (access_token == null) {
            store.refresh() 
        }
        return access_token;
    }
  const menuRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
        const fetchTopics = async () => {
        setLoading(true);

        try {
            const response = await axios.get("/server/admin/topics", {
                headers: { Authorization: `Bearer ${getAccess()}` }
            })
            if (response.status != 200) throw new Error("Ошибка при загрузке тем");
            const data = response.data
            setTopics(data);
        } catch (err) {
            setPostError(err.message);
        } finally {
            setLoading(false);
        }
    };
    const createTopic = async (topic: Omit<Topic, "id">) => {
        const access_token = localStorage.getItem("token")
        if (access_token == null) {
            store.refresh() 
        }
        const response = await axios.post("/server/admin/topics", topic ,
        { 
            headers: { Authorization: `Bearer ${access_token}` }
        })
        if (response.status != 201) 
            setPostError("Ошибка при создании темы");
        await fetchTopics();
    };
    const updateTopic = async (id: number, topic: Omit<Topic, "id">) => {
        const response = await axios.put(`/server/admin/topics/${id}`, topic ,
        { 
            headers: { Authorization: `Bearer ${getAccess()}` }
        })
        if (response.status != 200) 
            setPostError("Ошибка при изменении темы");
        await fetchTopics();
    };
    const deleteTopic = async (id: number) => {
        const response = await axios.delete(`/server/admin/topics/${id}` ,
        { 
            headers: { Authorization: `Bearer ${getAccess()}` }
        })
        if (response.status != 200)
            setPostError("Ошибка при удалении темы");
        await fetchTopics();
    };
        const createQuestion = async (question: Omit<IQuestion, "id">) => {
    const res = await fetch("/api/v1/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(question),
    });
    if (!res.ok) throw new Error("Ошибка при создании вопроса");
    const data = await res.json(); // вернёт { id: number }
    return { ...question, id: data.id };
    };

    const updateQuestion = async (id: number, question: Omit<IQuestion, "id">) => {
    const res = await fetch(`/api/v1/admin/questions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(question),
    });
    if (!res.ok) throw new Error("Ошибка при обновлении вопроса");
    };

    const deleteQuestion = async (id: number) => {
    const res = await fetch(`/api/v1/admin/questions/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Ошибка при удалении вопроса");
    };

    // --- Сохранение из модалки ---
    const saveQuestion = async (question: IQuestion) => {
    if (modalData?.mode === "create") {
        const newQuestion = await createQuestion(question);
        setQuestions([...questions, newQuestion]);
    } else {
        await updateQuestion(question.id, question);
        setQuestions(questions.map((q) => (q.id === question.id ? question : q)));
    }
    setModalData(null);
    };

    // --- Удаление вопроса ---
    const removeQuestion = async (id: number) => {
    await deleteQuestion(id);
    setQuestions(questions.filter((q) => q.id !== id));
    setMenu(null);
    };
  useEffect(() => {
    /*const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // если клик не внутри dropdown и не на кнопке меню → закрыть
      if (!target.closest(`.${styles.menuContainer}`)) {
        setMenu(null);
      }
      if (!target.closest(`.${styles.modal}`)) {
        setModalData(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);*/
    fetchTopics();
  }, []);


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
    const newId = questions.length ? Math.max(...questions.map((q) => q.id)) + 1 : 0;
    setModalData({
      type: "question",
      mode: "create",
      data: { id: newId, question_text: "", points: 1, question_type: "single_choice", data: {options : ['']} },
      topic_id: selectedTopic,
    });
  };

  const editTopic = (id: number) => {
    const topic = topics.find((t) => t.id === id);
    if (!topic) return;
    setModalData({ type: "topic", mode: "edit", id, data: topic });
    setMenu(null);
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter((q) => q.id !== id));
    setMenu(null);
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

  const saveQuestion = (question: IQuestion) => {
    if (!modalData || modalData.type !== "question") return;
    if (modalData.mode === "create") {
      setQuestions([...questions, question]);
    } else {
      setQuestions(questions.map((q) => q.id === question.id ? { ...question, topic_id: q.topic_id } : q));
    }
    setModalData(null);
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
              className={`${styles.listItem} ${selectedTopic === topic.id ? styles.active : ""}`}
            >
              <div onClick={() => setSelectedTopic(topic.id)}>
                <div className={styles.itemTitle}>{topic.title}</div>
                <div className={styles.itemDesc}>{topic.description}</div>
              </div>
              <div className={styles.menuContainer}>
                <button
                  onClick={() =>
                    setMenu({ type: "topic", id: topic.id })
                  }
                  className={styles.menuBtn}
                >
                  <MoreVertical className={styles.icon} />
                </button>
                {menu?.id === topic.id && menu?.type === "topic" && (
                  <div className={styles.dropdown}>
                    <button onClick={() => {console.log(topic.id); editTopic(topic.id)}} className={styles.dropdownItem}>
                      Редактировать
                    </button>
                    <button onClick={() => {console.log(topic.id); removeTopic(topic.id)}} className={`${styles.dropdownItem} ${styles.danger}`}>
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
            <button onClick={addQuestion} className={`${styles.btn} ${styles.green}`}>
              <Plus className={styles.icon} />
            </button>
          )}
        </div>
        {selectedTopic === null ? (
          <p className={styles.placeholder}>Выберите тему, чтобы увидеть вопросы</p>
        ) : (
          <ul className={styles.list}>
            {questions.filter((q) => q.topic_id === selectedTopic).map((q) => (
              <li key={q.id} className={styles.listItem}>
                <div className={styles.itemMain}>
                  <div className={styles.iconContainer}>{getIconByType(q.question_type)}</div>
                  <div>
                    <div className={styles.itemTitle}>{q.question_text}</div>
                    <div className={styles.itemMeta}>Тип: {q.question_type}</div>
                    <div className={styles.itemMeta}>Баллы: {q.points}</div>
                  </div>
                </div>
                <div className={styles.menuContainer}>
                  <button
                    onClick={() =>
                      setMenu(menu?.id === q.id && menu?.type === "question" ? null : { type: "question", id: q.id })
                    }
                    className={styles.menuBtn}
                  >
                    <MoreVertical className={styles.icon} />
                  </button>
                  {menu?.id === q.id && menu?.type === "question" && (
                    <div className={styles.dropdown}>
                      <button onClick={() => editQuestion(q.id)} className={styles.dropdownItem}>
                        Редактировать
                      </button>
                      <button onClick={() => removeQuestion(q.id)} className={`${styles.dropdownItem} ${styles.danger}`}>
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
      <Modal open={modalData && modalData.type === "question"} onClose={() => setModalData(null)}>
        <QuestionCreator saveQuestion={saveQuestion} modalData={modalData} setModalData={setModalData} />
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
                setModalData({ ...modalData, data: { ...modalData.data, title: e.target.value } })
              }
              placeholder="Название темы"
              className={styles.input}
            />
            <textarea
              value={modalData.data.description}
              onChange={(e) =>
                setModalData({ ...modalData, data: { ...modalData.data, description: e.target.value } })
              }
              placeholder="Описание"
              className={styles.textarea}
            />
            <div className={styles.modalActions}>
              <button onClick={() => setModalData(null)} className={`${styles.btn} ${styles.gray}`}>
                Отмена
              </button>
              <button onClick={saveModal} className={`${styles.btn} ${styles.blue}`}>
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

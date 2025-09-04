import React, { useState, useEffect, useRef } from "react";
import QuestionCreator from "./Test";
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

// Типы данных
interface Topic {
  title: string;
  description: string;
}

interface Question {
  data: Record<string, any>;
  points: number;
  question_text: string;
  question_type: string;
  topic_id: number;
}

// Пример данных
const initialTopics: Topic[] = [
  { title: "Математика", description: "Вопросы по алгебре и геометрии" },
  { title: "История", description: "Вопросы по мировой истории" },
  { title: "Физика", description: "Законы и явления природы" },
];

const initialQuestions: Question[] = [
  {
    data: { additionalProp1: { options: ["2", "3", "4"] } },
    points: 1,
    question_text: "Сколько будет 2+2?",
    question_type: "single",
    topic_id: 0,
  },
  {
    data: { additionalProp1: { placeholder: "Введите ответ" } },
    points: 2,
    question_text: "Кто был первым президентом США?",
    question_type: "short",
    topic_id: 1,
  },
  {
    data: { additionalProp1: { options: ["Сила", "Масса", "Энергия"] } },
    points: 1,
    question_text: "Что измеряется в Ньютонах?",
    question_type: "single",
    topic_id: 2,
  },
];

// Функция выбора иконки по типу вопроса
const getIconByType = (type: string) => {
  switch (type) {
    case "single":
      return <CheckSquare className={`${styles.icon} ${styles.blue}`} />;
    case "multiple":
      return <ListChecks className={`${styles.icon} ${styles.green}`} />;
    case "short":
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
  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);

  const [menu, setMenu] = useState<{ type: "topic" | "question"; index: number } | null>(null);
  const [modalData, setModalData] = useState<any | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenu(null);
      }
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setModalData(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addTopic = () => {
    setModalData({ type: "topic", mode: "create", data: { title: "", description: "" } });
  };

  const editTopic = (index: number) => {
    setModalData({ type: "topic", mode: "edit", index, data: topics[index] });
    setMenu(null);
  };

  const removeTopic = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index));
    if (selectedTopic === index) setSelectedTopic(null);
    setMenu(null);
  };

  const addQuestion = () => {
    if (selectedTopic === null) return;
    setModalData({
      type: "question",
      mode: "create",
      data: { question_text: "", points: 1, question_type: "short" },
      topic_id: selectedTopic,
    });
  };

  const editQuestion = (index: number) => {
    setModalData({ type: "question", mode: "edit", index, data: questions[index] });
    setMenu(null);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
    setMenu(null);
  };

  const saveModal = () => {
    if (!modalData) return;

    if (modalData.type === "topic") {
      if (modalData.mode === "create") {
        setTopics([...topics, modalData.data]);
      } else if (modalData.mode === "edit") {
        const newTopics = [...topics];
        newTopics[modalData.index] = modalData.data;
        setTopics(newTopics);
      }
    } else if (modalData.type === "question") {
      if (modalData.mode === "create") {
        const newQuestion: Question = {
          ...modalData.data,
          data: {},
          topic_id: modalData.topic_id,
        };
        setQuestions([...questions, newQuestion]);
      } else if (modalData.mode === "edit") {
        const newQuestions = [...questions];
        newQuestions[modalData.index] = modalData.data;
        setQuestions(newQuestions);
      }
    }

    setModalData(null);
  };

  return (
    <div className={styles.page}>
      {/* Левая часть - список тем */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.title}>Темы</h2>
          <button onClick={addTopic} className={`${styles.btn} ${styles.blue}`}>
            <Plus className={styles.icon} />
          </button>
        </div>
        <ul className={styles.list}>
          {topics.map((topic, index) => (
            <li
              key={index}
              className={`${styles.listItem} ${selectedTopic === index ? styles.active : ""}`}
            >
              <div onClick={() => setSelectedTopic(index)}>
                <div className={styles.itemTitle}>{topic.title}</div>
                <div className={styles.itemDesc}>{topic.description}</div>
              </div>
              <div className={styles.menuContainer} ref={menuRef}>
                <button
                  onClick={() =>
                    setMenu(menu?.index === index && menu?.type === "topic" ? null : { type: "topic", index })
                  }
                  className={styles.menuBtn}
                >
                  <MoreVertical className={styles.icon} />
                </button>
                {menu?.index === index && menu?.type === "topic" && (
                  <div className={styles.dropdown}>
                    <button onClick={() => editTopic(index)} className={styles.dropdownItem}>
                      Редактировать
                    </button>
                    <button onClick={() => removeTopic(index)} className={`${styles.dropdownItem} ${styles.danger}`}>
                      Удалить
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Правая часть - список вопросов */}
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
            {questions
              .filter((q) => q.topic_id === selectedTopic)
              .map((q, i) => (
                <li key={i} className={styles.listItem}>
                  <div className={styles.itemMain}>
                    <div className={styles.iconContainer}>{getIconByType(q.question_type)}</div>
                    <div>
                      <div className={styles.itemTitle}>{q.question_text}</div>
                      <div className={styles.itemMeta}>Тип: {q.question_type}</div>
                      <div className={styles.itemMeta}>Баллы: {q.points}</div>
                    </div>
                  </div>
                  <div className={styles.menuContainer} ref={menuRef}>
                    <button
                      onClick={() =>
                        setMenu(menu?.index === i && menu?.type === "question" ? null : { type: "question", index: i })
                      }
                      className={styles.menuBtn}
                    >
                      <MoreVertical className={styles.icon} />
                    </button>
                    {menu?.index === i && menu?.type === "question" && (
                      <div className={styles.dropdown}>
                        <button onClick={() => editQuestion(i)} className={styles.dropdownItem}>
                          Редактировать
                        </button>
                        <button onClick={() => removeQuestion(i)} className={`${styles.dropdownItem} ${styles.danger}`}>
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

      {/* Модальное окно */}
      {modalData && (
        <div className={styles.modalOverlay}>
          <div ref={modalRef} className={styles.modal}>
            <h3 className={styles.modalTitle}>
              {modalData.mode === "create" ? "Создать" : "Редактировать"} {modalData.type === "topic" ? "тему" : "вопрос"}
            </h3>
            {modalData.type === "topic" ? (
              <>
                <input
                  type="text"
                  value={modalData.data.title}
                  onChange={(e) => setModalData({ ...modalData, data: { ...modalData.data, title: e.target.value } })}
                  placeholder="Название темы"
                  className={styles.input}
                />
                <textarea
                  value={modalData.data.description}
                  onChange={(e) => setModalData({ ...modalData, data: { ...modalData.data, description: e.target.value } })}
                  placeholder="Описание"
                  className={styles.textarea}
                />
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={modalData.data.question_text}
                  onChange={(e) => setModalData({ ...modalData, data: { ...modalData.data, question_text: e.target.value } })}
                  placeholder="Текст вопроса"
                  className={styles.input}
                />
                <input
                  type="number"
                  value={modalData.data.points}
                  onChange={(e) => setModalData({ ...modalData, data: { ...modalData.data, points: Number(e.target.value) } })}
                  placeholder="Баллы"
                  className={styles.input}
                />
                <select
                  value={modalData.data.question_type}
                  onChange={(e) => setModalData({ ...modalData, data: { ...modalData.data, question_type: e.target.value } })}
                  className={styles.input}
                >
                  <option value="single">Один вариант</option>
                  <option value="multiple">Несколько вариантов</option>
                  <option value="short">Краткий ответ</option>
                  <option value="numeric">Числовой</option>
                  <option value="sortable">Сортировка</option>
                  <option value="matching">Соответствие</option>
                </select>
              </>
            )}
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

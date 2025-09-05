import React, { useState, useEffect, useContext } from "react";
import { Context } from "../context/index";
import axios from "axios";
import {
  BookOpen,
  Users,
  Clock,
  Plus,
  MoreVertical,
  FileText,
  Play,
} from "lucide-react";
import styles from "../styles/TopicsPage.module.css";

// Types for Test management
interface Test {
  id: number;
  title: string;
  description?: string;
}

interface TestCreateInput {
  title: string;
  description?: string;
}

interface TestUpdateInput {
  title?: string;
  description?: string;
}

interface Topic {
  id: number;
  title: string;
  description?: string;
}

interface Discipline {
  id: number;
  name: string;
  description?: string;
}

interface TestTopic {
  topic_id: number;
  questions_count: number;
  test_id?: number;
}

interface TestTopicsReplaceInput {
  topics: TestTopic[];
}

export default function TestsManagementPage() {
  const { store } = useContext(Context);
  const [tests, setTests] = useState<Test[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(false);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [disciplinesLoading, setDisciplinesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [menu, setMenu] = useState<{ id: number } | null>(null);
  const [modalData, setModalData] = useState<{
    mode: "create" | "edit";
    data: Partial<Test>;
    id?: number;
  } | null>(null);

  // Test attempt modal state
  const [attemptModalData, setAttemptModalData] = useState<{
    testId: number;
    selectedDisciplineId: number;
  } | null>(null);

  // Local state for test topics management
  const [modalTopics, setModalTopics] = useState<TestTopic[]>([]);

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Auto-dismiss success after 3 seconds
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

  // Fetch disciplines from server
  const fetchDisciplines = async () => {
    setDisciplinesLoading(true);
    try {
      const response = await axios.get("/server/disciplines");
      if (response.status !== 200)
        throw new Error("Ошибка при загрузке дисциплин");
      setDisciplines((response.data as Discipline[]) || []);
    } catch (err: any) {
      console.error("Error fetching disciplines:", err);
      setError(err?.message || "Ошибка при загрузке дисциплин");
    } finally {
      setDisciplinesLoading(false);
    }
  };

  // Fetch topics from server
  const fetchTopics = async () => {
    setTopicsLoading(true);
    try {
      const response = await axios.get("/server/admin/topics", {
        headers: { Authorization: `Bearer ${getAccess()}` },
      });
      if (response.status !== 200) throw new Error("Ошибка при загрузке тем");
      setTopics(response.data as Topic[]);
    } catch (err: any) {
      console.error("Error fetching topics:", err);
      setError(err?.message || "Ошибка при загрузке тем");
    } finally {
      setTopicsLoading(false);
    }
  };

  // Fetch tests from server
  const fetchTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/server/tests");
      if (response.status !== 200)
        throw new Error("Ошибка при загрузке тестов");
      setTests((response.data as Test[]) || []);
    } catch (err: any) {
      console.error("Error fetching tests:", err);
      if (err.response) {
        setError(`Ошибка сервера: ${err.response.status}`);
      } else if (err.request) {
        setError("Ошибка сети. Проверьте подключение к интернету.");
      } else {
        setError(err?.message || "Неизвестная ошибка");
      }
    } finally {
      setLoading(false);
    }
  };

  // Create test
  const createTest = async (testData: TestCreateInput) => {
    try {
      const response = await axios.post("/server/admin/tests", testData, {
        headers: { Authorization: `Bearer ${getAccess()}` },
      });
      if (response.status !== 201) {
        setError("Ошибка при создании теста");
        throw new Error("Ошибка при создании теста");
      }

      // If there are topics to assign, update them
      if (modalTopics.length > 0) {
        const testId = (response.data as { id: number }).id;
        await updateTestTopics(testId, modalTopics);
      }

      await fetchTests();
      setSuccess("Тест успешно создан!");
    } catch (err: any) {
      console.error("Error creating test:", err);
      if (err.response?.data?.error) {
        setError(`Ошибка: ${err.response.data.error}`);
      } else if (err.response?.status === 401) {
        setError("Нет прав доступа. Попробуйте войти заново.");
      } else {
        setError(err?.message || "Ошибка при создании теста");
      }
      throw err;
    }
  };

  // Update test
  const updateTest = async (id: number, testData: TestUpdateInput) => {
    try {
      const response = await axios.put(`/server/admin/tests/${id}`, testData, {
        headers: { Authorization: `Bearer ${getAccess()}` },
      });
      if (response.status !== 200) {
        setError("Ошибка при обновлении теста");
        throw new Error("Ошибка при обновлении теста");
      }

      // Update topics if they were modified
      if (modalTopics.length >= 0) {
        // Allow empty array to clear topics
        await updateTestTopics(id, modalTopics);
      }

      await fetchTests();
      setSuccess("Тест успешно обновлен!");
    } catch (err: any) {
      setError(err?.message || "Ошибка при обновлении теста");
      throw err;
    }
  };

  // Update test topics
  const updateTestTopics = async (testId: number, topics: TestTopic[]) => {
    try {
      const topicsData: TestTopicsReplaceInput = { topics };
      const response = await axios.put(
        `/server/admin/tests/${testId}/topics`,
        topicsData,
        {
          headers: { Authorization: `Bearer ${getAccess()}` },
        }
      );
      if (response.status !== 200) {
        throw new Error("Ошибка при обновлении тем теста");
      }
    } catch (err: any) {
      console.error("Error updating test topics:", err);
      setError(err?.message || "Ошибка при обновлении тем теста");
      throw err;
    }
  };

  // Delete test
  const deleteTest = async (id: number) => {
    try {
      const response = await axios.delete(`/server/admin/tests/${id}`, {
        headers: { Authorization: `Bearer ${getAccess()}` },
      });
      if (response.status !== 200) {
        setError("Ошибка при удалении теста");
        throw new Error("Ошибка при удалении теста");
      }
      await fetchTests();
      setMenu(null);
      setSuccess("Тест успешно удален!");
    } catch (err: any) {
      setError(err?.message || "Ошибка при удалении теста");
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
      setSuccess("Попытка теста успешно создана!");
      setAttemptModalData(null);
    } catch (err: any) {
      console.error("Error starting test attempt:", err);
      if (err.response?.data?.error) {
        setError(`Ошибка: ${err.response.data.error}`);
      } else if (err.response?.status === 401) {
        setError("Нет прав доступа. Попробуйте войти заново.");
      } else {
        setError(err?.message || "Ошибка при создании попытки теста");
      }
    }
  };

  // Load tests and topics on component mount
  useEffect(() => {
    fetchTests();
    fetchTopics();
    fetchDisciplines();
  }, []);

  // Click outside handler for dropdown menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(`.${styles.menuContainer}`)) {
        setMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Modal handlers
  const openCreateModal = () => {
    setModalTopics([]);
    setModalData({
      mode: "create",
      data: {
        title: "",
        description: "",
      },
    });
  };

  const openEditModal = async (test: Test) => {
    // Fetch current test topics
    try {
      const response = await axios.get(`/server/tests/${test.id}/topics`);
      if (response.status === 200) {
        setModalTopics((response.data as TestTopic[]) || []);
      } else {
        setModalTopics([]);
      }
    } catch (err) {
      console.error("Error fetching test topics:", err);
      setModalTopics([]);
    }

    setModalData({
      mode: "edit",
      id: test.id,
      data: { ...test },
    });
    setMenu(null);
  };

  const closeModal = () => {
    setModalData(null);
    setModalTopics([]);
  };

  const saveModal = async () => {
    if (!modalData) return;

    // Clear previous messages
    setError(null);
    setSuccess(null);

    const { title } = modalData.data;

    // Validation
    if (!title) {
      setError("Заполните название теста");
      return;
    }

    try {
      const testData: TestCreateInput = {
        title: title!,
        description: modalData.data.description || "",
      };

      if (modalData.mode === "create") {
        await createTest(testData);
      } else if (modalData.id) {
        await updateTest(modalData.id, testData);
      }

      closeModal();
    } catch (error) {
      console.error("Ошибка при сохранении теста:", error);
    }
  };

  // Test topics management functions
  const addTestTopic = () => {
    const newTopic: TestTopic = { topic_id: 0, questions_count: 1 };
    setModalTopics([...modalTopics, newTopic]);
  };

  const removeTestTopic = (index: number) => {
    setModalTopics(modalTopics.filter((_, i) => i !== index));
  };

  const updateTestTopic = (
    index: number,
    field: keyof TestTopic,
    value: number
  ) => {
    setModalTopics(
      modalTopics.map((topic, i) =>
        i === index ? { ...topic, [field]: value } : topic
      )
    );
  };

  // Helper function to get topic name by ID
  const getTopicName = (topicId: number) => {
    const topic = topics.find((t) => t.id === topicId);
    return topic ? topic.title : `Тема #${topicId}`;
  };

  // Navigate to test attempts
  const openTestAttempts = (testId: number) => {
    setAttemptModalData({
      testId,
      selectedDisciplineId: 0,
    });
    setMenu(null);
  };

  const removeTest = async (id: number) => {
    if (window.confirm("Вы уверены, что хотите удалить этот тест?")) {
      await deleteTest(id);
    }
  };

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

      {/* Loading indicator */}
      {loading && (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>Загрузка тестов...</p>
        </div>
      )}

      {/* Main Content */}
      <div className={styles.content} style={{ width: "100%" }}>
        <div className={styles.contentHeader}>
          <h2 className={styles.title}>Тесты</h2>
          <button
            onClick={openCreateModal}
            className={`${styles.btn} ${styles.blue}`}
          >
            <Plus className={styles.icon} />
            <span style={{ marginLeft: "8px" }}>Добавить тест</span>
          </button>
        </div>

        {/* Tests List */}
        <div className={styles.list}>
          {/* Retry button when there's an error and no data */}
          {error && (tests || []).length === 0 && !loading && (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <button
                onClick={fetchTests}
                className={`${styles.btn} ${styles.blue}`}
                style={{ padding: "12px 24px" }}
              >
                Попробовать снова
              </button>
            </div>
          )}
          {(tests || []).map((test) => (
            <div key={test.id} className={styles.listItem}>
              <div className={styles.itemMain}>
                <div className={styles.iconContainer}>
                  <FileText className={`${styles.icon} ${styles.blue}`} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className={styles.itemTitle}>{test.title}</div>
                  {test.description && (
                    <div className={styles.itemDesc}>{test.description}</div>
                  )}
                  <div
                    style={{ display: "flex", gap: "16px", marginTop: "8px" }}
                  >
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
                      ID: {test.id}
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.menuContainer}>
                <button
                  onClick={() =>
                    setMenu(menu?.id === test.id ? null : { id: test.id })
                  }
                  className={styles.menuBtn}
                >
                  <MoreVertical className={styles.icon} />
                </button>
                {menu?.id === test.id && (
                  <div className={styles.dropdown}>
                    <button
                      onClick={() => openTestAttempts(test.id)}
                      className={styles.dropdownItem}
                    >
                      <Play
                        style={{
                          width: "16px",
                          height: "16px",
                          marginRight: "8px",
                        }}
                      />
                      Открыть попытки
                    </button>
                    <button
                      onClick={() => openEditModal(test)}
                      className={styles.dropdownItem}
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => removeTest(test.id)}
                      className={`${styles.dropdownItem} ${styles.danger}`}
                      style={{ color: "#dc2626" }}
                    >
                      Удалить
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {(tests || []).length === 0 && !loading && (
            <div
              className={styles.placeholder}
              style={{ textAlign: "center", padding: "40px" }}
            >
              {error
                ? "Проверьте подключение к серверу и обновите страницу."
                : 'Нет тестов. Создайте первый тест, нажав кнопку "Добавить тест".'}
            </div>
          )}
        </div>
      </div>

      {/* Modal for Create/Edit */}
      {modalData && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "600px",
              width: "90vw",
              maxHeight: "90vh",
              overflow: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h3 className={styles.modalTitle}>
              {modalData.mode === "create"
                ? "Создать тест"
                : "Редактировать тест"}
            </h3>

            <div style={{ overflow: "auto", flex: 1, paddingRight: "8px" }}>
              <div>
                <label
                  className={styles.label}
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontWeight: "600",
                  }}
                >
                  Название теста *
                </label>
                <input
                  type="text"
                  value={modalData.data.title || ""}
                  onChange={(e) =>
                    setModalData({
                      ...modalData,
                      data: { ...modalData.data, title: e.target.value },
                    })
                  }
                  placeholder="Например: Тест по математическому анализу"
                  className={styles.input}
                />
              </div>

              <div>
                <label
                  className={styles.label}
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontWeight: "600",
                  }}
                >
                  Описание (необязательно)
                </label>
                <textarea
                  value={modalData.data.description || ""}
                  onChange={(e) =>
                    setModalData({
                      ...modalData,
                      data: { ...modalData.data, description: e.target.value },
                    })
                  }
                  placeholder="Краткое описание теста"
                  className={styles.textarea}
                />
              </div>

              {/* Test Topics Section */}
              <div style={{ marginTop: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                  }}
                >
                  <label
                    className={styles.label}
                    style={{
                      fontWeight: "600",
                    }}
                  >
                    Темы и количество вопросов
                  </label>
                  <button
                    type="button"
                    onClick={addTestTopic}
                    className={`${styles.btn} ${styles.blue}`}
                    style={{ padding: "6px 12px", fontSize: "14px" }}
                    disabled={topicsLoading}
                  >
                    <Plus
                      style={{
                        width: "16px",
                        height: "16px",
                        marginRight: "4px",
                      }}
                    />
                    Добавить тему
                  </button>
                </div>

                {topicsLoading ? (
                  <p style={{ color: "#666", fontSize: "14px" }}>
                    Загрузка тем...
                  </p>
                ) : modalTopics.length === 0 ? (
                  <p
                    style={{
                      color: "#666",
                      fontSize: "14px",
                      fontStyle: "italic",
                    }}
                  >
                    Нет добавленных тем. Нажмите "Добавить тему" для создания.
                  </p>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {modalTopics.map((testTopic, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "12px",
                          border: "1px solid #e5e7eb",
                          borderRadius: "6px",
                          backgroundColor: "#f9fafb",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <label
                            style={{
                              fontSize: "14px",
                              fontWeight: "500",
                              marginBottom: "4px",
                              display: "block",
                            }}
                          >
                            Тема:
                          </label>
                          <select
                            value={testTopic.topic_id}
                            onChange={(e) =>
                              updateTestTopic(
                                index,
                                "topic_id",
                                parseInt(e.target.value)
                              )
                            }
                            className={styles.input}
                            style={{ width: "100%" }}
                          >
                            <option value={0}>Выберите тему</option>
                            {topics?.map((topic) => (
                              <option key={topic.id} value={topic.id}>
                                {topic.title}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div style={{ minWidth: "120px" }}>
                          <label
                            style={{
                              fontSize: "14px",
                              fontWeight: "500",
                              marginBottom: "4px",
                              display: "block",
                            }}
                          >
                            Количество вопросов:
                          </label>
                          <input
                            type="number"
                            value={testTopic.questions_count ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              updateTestTopic(
                                index,
                                "questions_count",
                                value === "" ? 0 : parseInt(value)
                              );
                            }}
                            placeholder="1"
                            className={styles.input}
                            style={{ width: "100%" }}
                            min="1"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeTestTopic(index)}
                          style={{
                            background: "#dc2626",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            padding: "6px 8px",
                            cursor: "pointer",
                            fontSize: "12px",
                            alignSelf: "flex-end",
                          }}
                        >
                          Удалить
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div
              className={styles.modalActions}
              style={{
                position: "sticky",
                bottom: 0,
                backgroundColor: "white",
                borderTop: "1px solid #e5e7eb",
                paddingTop: "16px",
                marginTop: "16px",
              }}
            >
              <button
                onClick={closeModal}
                className={`${styles.btn} ${styles.gray}`}
              >
                Отмена
              </button>
              <button
                onClick={saveModal}
                className={`${styles.btn} ${styles.blue}`}
              >
                {modalData.mode === "create" ? "Создать" : "Сохранить"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Attempt Modal */}
      {attemptModalData && (
        <div
          className={styles.modalOverlay}
          onClick={() => setAttemptModalData(null)}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "400px",
              width: "90vw",
            }}
          >
            <h3 className={styles.modalTitle}>Открыть тест</h3>

            <div>
              <label
                className={styles.label}
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                }}
              >
                Выберите дисциплину *
              </label>
              {disciplinesLoading ? (
                <p style={{ color: "#666", fontSize: "14px" }}>
                  Загрузка дисциплин...
                </p>
              ) : (
                <select
                  value={attemptModalData.selectedDisciplineId}
                  onChange={(e) =>
                    setAttemptModalData({
                      ...attemptModalData,
                      selectedDisciplineId: parseInt(e.target.value),
                    })
                  }
                  className={styles.input}
                >
                  <option value={0}>Выберите дисциплину</option>
                  {(disciplines || []).map((discipline) => (
                    <option key={discipline.id} value={discipline.id}>
                      {discipline.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className={styles.modalActions}>
              <button
                onClick={() => setAttemptModalData(null)}
                className={`${styles.btn} ${styles.gray}`}
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  if (attemptModalData.selectedDisciplineId === 0) {
                    setError("Выберите дисциплину");
                    return;
                  }
                  startTestAttempt(
                    attemptModalData.testId,
                    attemptModalData.selectedDisciplineId
                  );
                }}
                className={`${styles.btn} ${styles.blue}`}
                disabled={attemptModalData.selectedDisciplineId === 0}
              >
                Открыть тест
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

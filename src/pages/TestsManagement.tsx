import { useState, useEffect, useContext } from "react";
import { Context } from "../context/index";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Clock, Plus, MoreVertical, FileText } from "lucide-react";
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

interface TestTopicWithTitle extends TestTopic {
  topic_title?: string;
}

interface TestTopicsReplaceInput {
  topics: TestTopic[];
}

interface QuestionTypeQuota {
  topic_id: number;
  types: Record<string, number>;
}

interface TypeQuotasReplaceInput {
  quotas: QuestionTypeQuota[];
}

interface TestTypeQuotaResponse {
  question_type: string;
  questions_count: number;
  test_id: number;
  topic_id: number;
}

interface TestTopicWithQuotas extends TestTopicWithTitle {
  typeQuotas?: Record<string, number>;
  showTypeSelection?: boolean;
}

export default function TestsManagementPage() {
  const { store } = useContext(Context);
  const navigate = useNavigate();
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

  // Local state for test topics management
  const [modalTopics, setModalTopics] = useState<TestTopicWithQuotas[]>([]);
  const [loadingTestTopics, setLoadingTestTopics] = useState(false);
  const [typeQuotas, setTypeQuotas] = useState<QuestionTypeQuota[]>([]);

  // Available question types
  const questionTypes = {
    single_choice: "Один ответ",
    multiple_choice: "Несколько вариантов",
    text: "Краткий ответ",
    numeric: "Числовой",
    sorting: "Сортировка",
    matching: "Соответствие",
  };

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
      const response = await axios.get("/server/disciplines", {
        headers: { Authorization: `Bearer ${getAccess()}` },
      });
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
      const response = await axios.get("/server/tests", {
        headers: { Authorization: `Bearer ${getAccess()}` },
      });
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

      const testId = (response.data as { id: number }).id;

      // If there are topics to assign, update them
      if (modalTopics.length > 0) {
        await updateTestTopics(testId, modalTopics);

        // If there are type quotas, update them as well
        const typeQuotasToSave = modalTopics
          .filter(
            (topic) =>
              topic.typeQuotas && Object.keys(topic.typeQuotas).length > 0
          )
          .map((topic) => ({
            topic_id: topic.topic_id,
            types: topic.typeQuotas!,
          }));

        if (typeQuotasToSave.length > 0) {
          await updateTestTypeQuotas(testId, typeQuotasToSave);
        }
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

        // Update type quotas
        const typeQuotasToSave = modalTopics
          .filter(
            (topic) =>
              topic.typeQuotas && Object.keys(topic.typeQuotas).length > 0
          )
          .map((topic) => ({
            topic_id: topic.topic_id,
            types: topic.typeQuotas!,
          }));

        await updateTestTypeQuotas(id, typeQuotasToSave);
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
      console.log("Updating test topics::::", topicsData);
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
      throw new Error(
        err?.response?.data?.error || "Ошибка при обновлении тем теста"
      );
    }
  };

  // Update test type quotas
  const updateTestTypeQuotas = async (
    testId: number,
    quotas: QuestionTypeQuota[]
  ) => {
    try {
      const quotasData: TypeQuotasReplaceInput = { quotas };
      console.log("quotasData : ->", quotasData);

      const response = await axios.put(
        `/server/admin/tests/${testId}/type-quotas`,
        quotasData,
        {
          headers: { Authorization: `Bearer ${getAccess()}` },
        }
      );
      if (response.status !== 200) {
        throw new Error("Ошибка при обновлении квот типов вопросов");
      }
    } catch (err: any) {
      console.error("Error updating test type quotas:", err);
      throw new Error(
        err?.response?.data?.error ||
          "Ошибка при обновлении квот типов вопросов"
      );
    }
  };

  // Load test type quotas
  const loadTestTypeQuotas = async (testId: number) => {
    try {
      const response = await axios.get(`/server/tests/${testId}/type-quotas`, {
        headers: { Authorization: `Bearer ${getAccess()}` },
      });
      if (response.status === 200) {
        const quotasResponse = (response.data as TestTypeQuotaResponse[]) || [];
        // Convert response to QuestionTypeQuota format
        const quotasMap = new Map<number, Record<string, number>>();
        quotasResponse.forEach((quota) => {
          if (!quotasMap.has(quota.topic_id)) {
            quotasMap.set(quota.topic_id, {});
          }
          quotasMap.get(quota.topic_id)![quota.question_type] =
            quota.questions_count;
        });

        const quotas: QuestionTypeQuota[] = Array.from(quotasMap.entries()).map(
          ([topic_id, types]) => ({
            topic_id,
            types,
          })
        );
        setTypeQuotas(quotas);

        // Update modalTopics with type quotas
        setModalTopics((current) =>
          current.map((topic) => {
            const quota = quotas.find((q) => q.topic_id === topic.topic_id);
            return {
              ...topic,
              typeQuotas: quota?.types || {},
            };
          })
        );
      }
    } catch (err: any) {
      console.error("Error fetching test type quotas:", err);
      setTypeQuotas([]);
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

      // Get the attempt ID from response and navigate to attempt page
      const attemptId = (response.data as { id: number }).id;
      setSuccess("Попытка теста создана! Переход к тесту...");

      // Navigate to attempt page
      setTimeout(() => {
        navigate(`/attempt/${attemptId}`);
      }, 1000);
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

  const loadTestTopics = async (testId: number) => {
    setLoadingTestTopics(true);
    try {
      const response = await axios.get(`/server/tests/${testId}/topics`, {
        headers: { Authorization: `Bearer ${getAccess()}` },
      });
      if (response.status === 200) {
        const testTopics = (response.data as TestTopic[]) || [];
        // Enrich with topic titles
        const enrichedTopics: TestTopicWithTitle[] = testTopics.map(
          (testTopic) => {
            const topic = topics.find((t) => t.id === testTopic.topic_id);
            return {
              ...testTopic,
              topic_title: topic?.title || `Topic #${testTopic.topic_id}`,
            };
          }
        );
        setModalTopics(enrichedTopics);
      } else {
        setModalTopics([]);
      }
    } catch (err: any) {
      console.error("Error fetching test topics:", err);
      setModalTopics([]);
      if (err.response?.status === 401) {
        setError("Нет прав доступа. Попробуйте войти заново.");
      } else {
        setError(err?.message || "Ошибка при загрузке тем теста");
      }
    } finally {
      setLoadingTestTopics(false);
    }
  };

  const openEditModal = async (test: Test) => {
    await loadTestTopics(test.id);
    await loadTestTypeQuotas(test.id);
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
    const newTopic: TestTopicWithTitle = {
      topic_id: 0,
      questions_count: 1,
      topic_title: undefined,
    };
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

  // Toggle type selection visibility for a topic
  const toggleTypeSelection = (index: number) => {
    setModalTopics((current) =>
      current.map((topic, i) =>
        i === index
          ? {
              ...topic,
              showTypeSelection: !topic.showTypeSelection,
              typeQuotas: topic.typeQuotas || {},
            }
          : topic
      )
    );
  };

  // Update type quota for a specific topic and question type
  const updateTypeQuota = (
    topicIndex: number,
    questionType: string,
    count: number
  ) => {
    setModalTopics((current) =>
      current.map((topic, i) => {
        if (i === topicIndex) {
          const newTypeQuotas = {
            ...topic.typeQuotas,
            [questionType]: count,
          };

          // Calculate total from type quotas
          const totalFromTypes = Object.values(newTypeQuotas).reduce(
            (sum, val) => sum + (val || 0),
            0
          );

          return {
            ...topic,
            typeQuotas: newTypeQuotas,
            questions_count: totalFromTypes, // Update total to match sum of types
          };
        }
        return topic;
      })
    );
  };

  // Get available question types for a topic (placeholder - in real app this would come from API)
  const getTopicQuestionTypes = (topicId: number): string[] => {
    // For now, return all available types. In a real implementation,
    // this would be fetched from an API endpoint specific to the topic
    return Object.keys(questionTypes);
  };

  // Calculate total questions from type quotas
  const getTotalFromTypeQuotas = (
    typeQuotas: Record<string, number> = {}
  ): number => {
    return Object.values(typeQuotas).reduce(
      (sum, count) => sum + (count || 0),
      0
    );
  };

  // Helper function to get topic name by ID
  // const getTopicName = (topicId: number) => {
  //   const topic = topics.find((t) => t.id === topicId);
  //   return topic ? topic.title : `Тема #${topicId}`;
  // };

  // Navigate to test attempts
  const openTestAttempts = (testId: number) => {
    // This functionality has been removed as per requirements
    console.log("Test attempts functionality removed");
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
              <div
                className={styles.itemMain}
                onClick={() => openEditModal(test)}
                style={{ cursor: "pointer" }}
              >
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenu(menu?.id === test.id ? null : { id: test.id });
                  }}
                  className={styles.menuBtn}
                >
                  <MoreVertical className={styles.icon} />
                </button>
                {menu?.id === test.id && (
                  <div className={styles.dropdown}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(test);
                      }}
                      className={styles.dropdownItem}
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTest(test.id);
                      }}
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
                    disabled={topicsLoading || loadingTestTopics}
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

                {loadingTestTopics ? (
                  <p style={{ color: "#666", fontSize: "14px" }}>
                    Загрузка тем теста...
                  </p>
                ) : topicsLoading ? (
                  <p style={{ color: "#666", fontSize: "14px" }}>
                    Загрузка списка тем...
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
                      <div key={index}>
                        <div
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
                              onChange={(e) => {
                                const newTopicId = parseInt(e.target.value);
                                const topic = topics.find(
                                  (t) => t.id === newTopicId
                                );
                                updateTestTopic(index, "topic_id", newTopicId);
                                // Update the topic title as well
                                setModalTopics((current) =>
                                  current.map((t, i) =>
                                    i === index
                                      ? {
                                          ...t,
                                          topic_title:
                                            topic?.title ||
                                            `Topic #${newTopicId}`,
                                        }
                                      : t
                                  )
                                );
                              }}
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
                            {modalData?.mode === "edit" &&
                              testTopic.topic_title && (
                                <div
                                  style={{
                                    fontSize: "12px",
                                    color: "#666",
                                    marginTop: "2px",
                                    fontStyle: "italic",
                                  }}
                                >
                                  {testTopic.topic_title}
                                </div>
                              )}
                          </div>
                          <div style={{ minWidth: "140px" }}>
                            <label
                              style={{
                                fontSize: "14px",
                                fontWeight: "500",
                                marginBottom: "4px",
                                display: "block",
                              }}
                            >
                              Вопросов из темы:
                            </label>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
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
                                style={{ width: "80px" }}
                                min="1"
                              />
                              {testTopic.topic_id > 0 && (
                                <button
                                  type="button"
                                  onClick={() => toggleTypeSelection(index)}
                                  style={{
                                    background: testTopic.showTypeSelection
                                      ? "#10b981"
                                      : "#6b7280",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    padding: "4px 8px",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    whiteSpace: "nowrap",
                                  }}
                                  title="Настроить типы вопросов"
                                >
                                  {testTopic.showTypeSelection
                                    ? "Скрыть типы"
                                    : "Типы"}
                                </button>
                              )}
                            </div>
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

                        {/* Question Type Selection */}
                        {testTopic.showTypeSelection &&
                          testTopic.topic_id > 0 && (
                            <div
                              style={{
                                marginTop: "12px",
                                padding: "12px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                backgroundColor: "#ffffff",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "14px",
                                  fontWeight: "600",
                                  marginBottom: "8px",
                                  color: "#374151",
                                }}
                              >
                                Типы вопросов для темы
                              </div>

                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns:
                                    "repeat(auto-fit, minmax(200px, 1fr))",
                                  gap: "8px",
                                  marginBottom: "8px",
                                }}
                              >
                                {getTopicQuestionTypes(testTopic.topic_id).map(
                                  (questionType) => (
                                    <div
                                      key={questionType}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        padding: "6px",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "4px",
                                        backgroundColor: "#f9fafb",
                                      }}
                                    >
                                      <label
                                        style={{
                                          fontSize: "13px",
                                          flex: 1,
                                          fontWeight: "500",
                                        }}
                                      >
                                        {
                                          questionTypes[
                                            questionType as keyof typeof questionTypes
                                          ]
                                        }
                                      </label>
                                      <input
                                        type="number"
                                        value={
                                          testTopic.typeQuotas?.[
                                            questionType
                                          ] || ""
                                        }
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          updateTypeQuota(
                                            index,
                                            questionType,
                                            value === "" ? 0 : parseInt(value)
                                          );
                                        }}
                                        placeholder="0"
                                        className={styles.input}
                                        style={{
                                          width: "60px",
                                          padding: "4px 6px",
                                          fontSize: "13px",
                                        }}
                                        min="0"
                                      />
                                    </div>
                                  )
                                )}
                              </div>

                              {/* Summary and validation */}
                              {testTopic.typeQuotas &&
                                Object.keys(testTopic.typeQuotas).length >
                                  0 && (
                                  <div
                                    style={{
                                      fontSize: "12px",
                                      padding: "6px 8px",
                                      borderRadius: "4px",
                                      backgroundColor:
                                        getTotalFromTypeQuotas(
                                          testTopic.typeQuotas
                                        ) === testTopic.questions_count
                                          ? "#dcfce7"
                                          : "#fef2f2",
                                      color:
                                        getTotalFromTypeQuotas(
                                          testTopic.typeQuotas
                                        ) === testTopic.questions_count
                                          ? "#166534"
                                          : "#dc2626",
                                      border: `1px solid ${
                                        getTotalFromTypeQuotas(
                                          testTopic.typeQuotas
                                        ) === testTopic.questions_count
                                          ? "#bbf7d0"
                                          : "#fecaca"
                                      }`,
                                    }}
                                  >
                                    Сумма по типам:{" "}
                                    {getTotalFromTypeQuotas(
                                      testTopic.typeQuotas
                                    )}{" "}
                                    / Общее количество:{" "}
                                    {testTopic.questions_count}
                                    {getTotalFromTypeQuotas(
                                      testTopic.typeQuotas
                                    ) !== testTopic.questions_count && (
                                      <span
                                        style={{
                                          display: "block",
                                          marginTop: "2px",
                                          fontWeight: "500",
                                        }}
                                      >
                                        ⚠️ Количество вопросов по типам должно
                                        равняться общему количеству!
                                      </span>
                                    )}
                                  </div>
                                )}
                            </div>
                          )}
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
    </div>
  );
}

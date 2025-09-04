import React, { useState, useEffect, useContext } from "react";
import { Context } from "../context/index";
import axios from "axios";
import {
  BookOpen,
  Users,
  Clock,
  Award,
  Plus,
  MoreVertical,
} from "lucide-react";
import styles from "../styles/TopicsPage.module.css";

// Types for Discipline
interface Discipline {
  id: number;
  name: string;
  description?: string;
  lecture_count: number;
  lecture_points: number;
  test_points: number;
  lab_count?: number;
  labs?: DisciplineLabComponent[];
  group_ids?: number[];
}

interface DisciplineLabComponent {
  lab_id: number;
  points: number;
}

interface DisciplineCreateInput {
  name: string;
  description?: string;
  lecture_count: number;
  lecture_points: number;
  test_points: number;
  lab_count?: number;
  labs?: DisciplineLabComponent[];
  group_ids?: number[];
}

export default function DisciplinesPage() {
  const { store } = useContext(Context);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [menu, setMenu] = useState<{ id: number } | null>(null);
  const [modalData, setModalData] = useState<{
    mode: "create" | "edit";
    data: Partial<Discipline>;
    id?: number;
  } | null>(null);

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
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/server/disciplines");
      if (response.status !== 200)
        throw new Error("Ошибка при загрузке дисциплин");
      setDisciplines(response.data as Discipline[]);
    } catch (err: any) {
      console.error('Error fetching disciplines:', err);
      if (err.response) {
        // Server responded with error status
        setError(`Ошибка сервера: ${err.response.status}`);
      } else if (err.request) {
        // Network error
        setError('Ошибка сети. Проверьте подключение к интернету.');
      } else {
        setError(err?.message || 'Неизвестная ошибка');
      }
    } finally {
      setLoading(false);
    }
  };

  // Create discipline
  const createDiscipline = async (disciplineData: DisciplineCreateInput) => {
    try {
      const response = await axios.post(
        "/server/admin/disciplines",
        disciplineData,
        {
          headers: { Authorization: `Bearer ${getAccess()}` },
        }
      );
      if (response.status !== 201) {
        setError("Ошибка при создании дисциплины");
        throw new Error("Ошибка при создании дисциплины");
      }
      await fetchDisciplines();
      setSuccess('Дисциплина успешно создана!');
    } catch (err: any) {
      console.error('Error creating discipline:', err);
      if (err.response?.data?.error) {
        setError(`Ошибка: ${err.response.data.error}`);
      } else if (err.response?.status === 401) {
        setError('Нет прав доступа. Попробуйте войти заново.');
      } else {
        setError(err?.message || 'Ошибка при создании дисциплины');
      }
      throw err;
    }
  };

  // Update discipline
  const updateDiscipline = async (
    id: number,
    disciplineData: DisciplineCreateInput
  ) => {
    try {
      const response = await axios.put(
        `/server/admin/disciplines/${id}`,
        disciplineData,
        {
          headers: { Authorization: `Bearer ${getAccess()}` },
        }
      );
      if (response.status !== 200) {
        setError("Ошибка при обновлении дисциплины");
        throw new Error("Ошибка при обновлении дисциплины");
      }
      await fetchDisciplines();
    } catch (err: any) {
      setError(err?.message || "Ошибка при обновлении дисциплины");
      throw err;
    }
  };

  // Delete discipline
  const deleteDiscipline = async (id: number) => {
    try {
      const response = await axios.delete(`/server/admin/disciplines/${id}`, {
        headers: { Authorization: `Bearer ${getAccess()}` },
      });
      if (response.status !== 200) {
        setError("Ошибка при удалении дисциплины");
        throw new Error("Ошибка при удалении дисциплины");
      }
      await fetchDisciplines();
      setMenu(null);
    } catch (err: any) {
      setError(err?.message || "Ошибка при удалении дисциплины");
    }
  };

  // Load disciplines on component mount
  useEffect(() => {
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

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Modal handlers
  const openCreateModal = () => {
    setModalData({
      mode: "create",
      data: {
        name: "",
        description: "",
        lecture_count: 1,
        lecture_points: 10,
        test_points: 10,
        lab_count: 0,
        group_ids: [],
      },
    });
  };

  const openEditModal = (discipline: Discipline) => {
    setModalData({
      mode: "edit",
      id: discipline.id,
      data: { ...discipline },
    });
    setMenu(null);
  };

  const closeModal = () => {
    setModalData(null);
  };

  const saveModal = async () => {
    if (!modalData) return;
    
    // Clear previous messages
    setError(null);
    setSuccess(null);

    const { name, lecture_count, lecture_points, test_points } = modalData.data;

    // Validation
    if (!name || !lecture_count || !lecture_points || !test_points) {
      setError("Заполните все обязательные поля");
      return;
    }

    try {
      const disciplineData: DisciplineCreateInput = {
        name: name!,
        description: modalData.data.description || "",
        lecture_count: lecture_count!,
        lecture_points: lecture_points!,
        test_points: test_points!,
        lab_count: modalData.data.lab_count || 0,
        group_ids: modalData.data.group_ids || [],
      };

      if (modalData.mode === "create") {
        await createDiscipline(disciplineData);
      } else if (modalData.id) {
        await updateDiscipline(modalData.id, disciplineData);
      }

      closeModal();
    } catch (error) {
      console.error("Ошибка при сохранении дисциплины:", error);
    }
  };

  const removeDiscipline = async (id: number) => {
    if (window.confirm("Вы уверены, что хотите удалить эту дисциплину?")) {
      await deleteDiscipline(id);
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
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
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
              justifyContent: "center"
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
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
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
              justifyContent: "center"
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>Загрузка дисциплин...</p>
        </div>
      )}

      {/* Main Content */}
      <div className={styles.content} style={{ width: "100%" }}>
        <div className={styles.contentHeader}>
          <h2 className={styles.title}>Дисциплины</h2>
          <button
            onClick={openCreateModal}
            className={`${styles.btn} ${styles.blue}`}
          >
            <Plus className={styles.icon} />
            <span style={{ marginLeft: "8px" }}>Добавить дисциплину</span>
          </button>
        </div>

        {/* Disciplines List */}
        <div className={styles.list}>
          {/* Retry button when there's an error and no data */}
          {error && disciplines.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <button 
                onClick={fetchDisciplines}
                className={`${styles.btn} ${styles.blue}`}
                style={{ padding: '12px 24px' }}
              >
                Попробовать снова
              </button>
            </div>
          )}
          {disciplines.map((discipline) => (
            <div key={discipline.id} className={styles.listItem}>
              <div className={styles.itemMain}>
                <div className={styles.iconContainer}>
                  <BookOpen className={`${styles.icon} ${styles.blue}`} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className={styles.itemTitle}>{discipline.name}</div>
                  {discipline.description && (
                    <div className={styles.itemDesc}>
                      {discipline.description}
                    </div>
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
                      Лекций: {discipline.lecture_count}
                    </div>
                    <div className={styles.itemMeta}>
                      <Award
                        className={`${styles.icon} ${styles.orange}`}
                        style={{
                          width: "16px",
                          height: "16px",
                          display: "inline",
                          marginRight: "4px",
                        }}
                      />
                      Баллы:{" "}
                      {discipline.lecture_points + discipline.test_points}
                    </div>
                    {discipline.lab_count && discipline.lab_count > 0 && (
                      <div className={styles.itemMeta}>
                        <Users
                          className={`${styles.icon} ${styles.green}`}
                          style={{
                            width: "16px",
                            height: "16px",
                            display: "inline",
                            marginRight: "4px",
                          }}
                        />
                        Лабы: {discipline.lab_count}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.menuContainer}>
                <button
                  onClick={() =>
                    setMenu(
                      menu?.id === discipline.id ? null : { id: discipline.id }
                    )
                  }
                  className={styles.menuBtn}
                >
                  <MoreVertical className={styles.icon} />
                </button>
                {menu?.id === discipline.id && (
                  <div className={styles.dropdown}>
                    <button
                      onClick={() => openEditModal(discipline)}
                      className={styles.dropdownItem}
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => removeDiscipline(discipline.id)}
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

          {disciplines.length === 0 && !loading && (
            <div className={styles.placeholder} style={{ textAlign: 'center', padding: '40px' }}>
              {error ? 
                'Проверьте подключение к серверу и обновите страницу.' : 
                'Нет дисциплин. Создайте первую дисциплину, нажав кнопку "Добавить дисциплину".'
              }
            </div>
          )}
        </div>
      </div>

      {/* Modal for Create/Edit */}
      {modalData && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>
              {modalData.mode === "create"
                ? "Создать дисциплину"
                : "Редактировать дисциплину"}
            </h3>

            <input
              type="text"
              value={modalData.data.name || ""}
              onChange={(e) =>
                setModalData({
                  ...modalData,
                  data: { ...modalData.data, name: e.target.value },
                })
              }
              placeholder="Название дисциплины *"
              className={styles.input}
            />

            <textarea
              value={modalData.data.description || ""}
              onChange={(e) =>
                setModalData({
                  ...modalData,
                  data: { ...modalData.data, description: e.target.value },
                })
              }
              placeholder="Описание"
              className={styles.textarea}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <input
                type="number"
                value={modalData.data.lecture_count || 1}
                onChange={(e) =>
                  setModalData({
                    ...modalData,
                    data: {
                      ...modalData.data,
                      lecture_count: parseInt(e.target.value) || 1,
                    },
                  })
                }
                placeholder="Количество лекций *"
                className={styles.input}
                min="1"
              />

              <input
                type="number"
                value={modalData.data.lab_count || 0}
                onChange={(e) =>
                  setModalData({
                    ...modalData,
                    data: {
                      ...modalData.data,
                      lab_count: parseInt(e.target.value) || 0,
                    },
                  })
                }
                placeholder="Количество лаб"
                className={styles.input}
                min="0"
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <input
                type="number"
                value={modalData.data.lecture_points || 10}
                onChange={(e) =>
                  setModalData({
                    ...modalData,
                    data: {
                      ...modalData.data,
                      lecture_points: parseInt(e.target.value) || 10,
                    },
                  })
                }
                placeholder="Баллы за лекции *"
                className={styles.input}
                min="1"
              />

              <input
                type="number"
                value={modalData.data.test_points || 10}
                onChange={(e) =>
                  setModalData({
                    ...modalData,
                    data: {
                      ...modalData.data,
                      test_points: parseInt(e.target.value) || 10,
                    },
                  })
                }
                placeholder="Баллы за тесты *"
                className={styles.input}
                min="1"
              />
            </div>

            <div className={styles.modalActions}>
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

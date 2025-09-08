import React, { useState, useEffect, useContext } from "react";
import { Context } from "../context/index";
import { useNavigate } from "react-router-dom";
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
import GroupSelector from "../components/GroupSelector";
import type { IGroup } from "../components/ui/interfaces/IGroup";

// Types for Discipline
interface Discipline {
  id: number;
  name: string;
  description?: string;
  lecture_count: number;
  lecture_points: number;
  test_points: number;
  test_id?: number;
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
  test_id: number;
  lab_count?: number;
  labs?: DisciplineLabComponent[];
  group_ids?: number[];
}

interface Test {
  id: number;
  title: string;
  description?: string;
}

export default function DisciplinesPage() {
  const { store } = useContext(Context);
  const navigate = useNavigate();
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [groups, setGroups] = useState<IGroup[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<IGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [testsLoading, setTestsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [menu, setMenu] = useState<{ id: number } | null>(null);
  const [modalData, setModalData] = useState<{
    mode: "create" | "edit";
    data: Partial<Discipline>;
    id?: number;
  } | null>(null);

  // Local state for laboratory works (stub until server implementation)
  const [modalLabs, setModalLabs] = useState<DisciplineLabComponent[]>([]);

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

  // Fetch groups from server
  const fetchGroups = async () => {
    setGroupsLoading(true);
    try {
      const response = await axios.get("/server/groups");
      if (response.status !== 200) throw new Error("Ошибка при загрузке групп");
      setGroups(response.data as IGroup[]);
    } catch (err: any) {
      console.error("Error fetching groups:", err);
      setError(err?.message || "Ошибка при загрузке групп");
    } finally {
      setGroupsLoading(false);
    }
  };

  // Fetch tests from server
  const fetchTests = async () => {
    setTestsLoading(true);
    try {
      const response = await axios.get("/server/tests", {
        headers: { Authorization: `Bearer ${getAccess()}` },
      });
      if (response.status !== 200)
        throw new Error("Ошибка при загрузке тестов");
      setTests(response.data as Test[]);
    } catch (err: any) {
      console.error("Error fetching tests:", err);
      setError(err?.message || "Ошибка при загрузке тестов");
    } finally {
      setTestsLoading(false);
    }
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
      console.error("Error fetching disciplines:", err);
      if (err.response) {
        // Server responded with error status
        setError(`Ошибка сервера: ${err.response.status}`);
      } else if (err.request) {
        // Network error
        setError("Ошибка сети. Проверьте подключение к интернету.");
      } else {
        setError(err?.message || "Неизвестная ошибка");
      }
    } finally {
      setLoading(false);
    }
  };

  // Create discipline
  const createDiscipline = async (disciplineData: DisciplineCreateInput) => {
    try {
      console.log("Creating discipline with data:", disciplineData);
      const response = await axios.post(
        "/server/admin/disciplines",
        disciplineData,
        {
          headers: { Authorization: `Bearer ${getAccess()}` },
        }
      );
      console.log("Create discipline response:", response);
      if (response.status !== 201) {
        setError("Ошибка при создании дисциплины");
        throw new Error("Ошибка при создании дисциплины");
      }
      await fetchDisciplines();
      setSuccess("Дисциплина успешно создана!");
    } catch (err: any) {
      console.error("Error creating discipline:", err);
      console.error("Error response data:", err.response?.data);
      console.error("Error response status:", err.response?.status);
      if (err.response?.data?.error) {
        setError(`Ошибка: ${err.response.data.error}`);
      } else if (err.response?.status === 401) {
        setError("Нет прав доступа. Попробуйте войти заново.");
      } else {
        setError(err?.message || "Ошибка при создании дисциплины");
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

  // Load disciplines, groups, and tests on component mount
  useEffect(() => {
    fetchDisciplines();
    fetchGroups();
    fetchTests();
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
    setSelectedGroups([]);
    setModalLabs([]);
    setModalData({
      mode: "create",
      data: {
        name: "",
        description: "",
        lecture_count: 16,
        lecture_points: 10,
        test_points: 10,
        test_id: undefined,
        group_ids: [],
      },
    });
  };

  const openEditModal = (discipline: Discipline) => {
    // Set selected groups based on discipline's group_ids
    const disciplineGroups = groups.filter((group) =>
      discipline.group_ids?.includes(group.id)
    );
    setSelectedGroups(disciplineGroups);

    // Set laboratories (use existing labs or create empty array)
    setModalLabs(discipline.labs || []);

    setModalData({
      mode: "edit",
      id: discipline.id,
      data: { ...discipline },
    });
    setMenu(null);
  };

  const closeModal = () => {
    setModalData(null);
    setSelectedGroups([]);
    setModalLabs([]);
  };

  const saveModal = async () => {
    if (!modalData) return;

    // Clear previous messages
    setError(null);
    setSuccess(null);

    const { name, lecture_count, lecture_points, test_points, test_id } =
      modalData.data;

    // Validation
    if (
      !name ||
      !lecture_count ||
      !lecture_points ||
      !test_points ||
      !test_id
    ) {
      setError("Заполните все обязательные поля");
      return;
    }

    if (lecture_count <= 0 || lecture_points <= 0 || test_points <= 0) {
      setError("Количество и баллы должны быть больше 0");
      return;
    }

    try {
      const disciplineData: DisciplineCreateInput = {
        name: name!,
        description: modalData.data.description || "",
        lecture_count: lecture_count!,
        lecture_points: lecture_points!,
        test_points: test_points!,
        test_id: test_id!,
        lab_count: modalLabs.length,
        labs: modalLabs.length > 0 ? modalLabs : [],
        group_ids:
          selectedGroups.length > 0
            ? selectedGroups.map((group) => group.id)
            : [],
      };

      console.log(
        "Discipline data being sent:",
        JSON.stringify(disciplineData, null, 2)
      );

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

  // Helper function to get group names by IDs
  const getGroupNames = (groupIds: number[] = []) => {
    return groups
      .filter((group) => groupIds.includes(group.id))
      .map((group) => group.name)
      .join(", ");
  };

  // Helper function to get test name by ID
  const getTestName = (testId?: number) => {
    if (!testId) return "Не выбран";
    const test = tests.find((test) => test.id === testId);
    return test ? test.title : `Тест #${testId}`;
  };

  // Laboratory work management functions
  const addLab = () => {
    const newLabId =
      modalLabs.length > 0
        ? Math.max(...modalLabs.map((lab) => lab.lab_id)) + 1
        : 1;
    setModalLabs([...modalLabs, { lab_id: newLabId, points: 10 }]);
  };

  const removeLab = (labId: number) => {
    setModalLabs(modalLabs.filter((lab) => lab.lab_id !== labId));
  };

  const updateLabPoints = (labId: number, points: number) => {
    setModalLabs(
      modalLabs.map((lab) => (lab.lab_id === labId ? { ...lab, points } : lab))
    );
  };

  // Helper function to get total lab points
  const getTotalLabPoints = (labs: DisciplineLabComponent[] = []) => {
    return labs.reduce((total, lab) => total + lab.points, 0);
  };

  const removeDiscipline = async (id: number) => {
    if (window.confirm("Вы уверены, что хотите удалить эту дисциплину?")) {
      await deleteDiscipline(id);
    }
  };

  // Open gradebook for discipline and group
  const openGradebook = (disciplineId: number, groupId: number) => {
    navigate(`/gradesheet/${disciplineId}/${groupId}`);
    setMenu(null);
  };

  // Handle discipline click - open gradebook directly
  const handleDisciplineClick = (discipline: Discipline) => {
    if (!discipline.group_ids || discipline.group_ids.length === 0) {
      setError("У дисциплины нет назначенных групп");
      return;
    }

    // If only one group, navigate directly
    if (discipline.group_ids.length === 1) {
      openGradebook(discipline.id, discipline.group_ids[0]);
    } else {
      // If multiple groups, open the first one (most common use case)
      // User can still use the menu to select specific groups
      openGradebook(discipline.id, discipline.group_ids[0]);
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
            <div style={{ textAlign: "center", padding: "20px" }}>
              <button
                onClick={fetchDisciplines}
                className={`${styles.btn} ${styles.blue}`}
                style={{ padding: "12px 24px" }}
              >
                Попробовать снова
              </button>
            </div>
          )}
          {disciplines.map((discipline) => (
            <div
              key={discipline.id}
              className={styles.listItem}
              style={{
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onClick={() => handleDisciplineClick(discipline)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f8fafc";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0, 0, 0, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "";
              }}
            >
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
                  {discipline.group_ids && discipline.group_ids.length > 0 && (
                    <div
                      className={styles.itemDesc}
                      style={{ color: "#0056a6", fontWeight: "500" }}
                    >
                      Группы: {getGroupNames(discipline.group_ids)}
                      {discipline.group_ids.length > 1 && (
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#666",
                            fontWeight: "400",
                            marginLeft: "8px",
                          }}
                        >
                          (нажмите для открытия ведомости)
                        </span>
                      )}
                    </div>
                  )}
                  {discipline.test_id && (
                    <div
                      className={styles.itemDesc}
                      style={{ color: "#059669", fontWeight: "500" }}
                    >
                      Тест: {getTestName(discipline.test_id)}
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
                      {discipline.lecture_points +
                        discipline.test_points +
                        getTotalLabPoints(discipline.labs)}
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
                        Лабы: {discipline.lab_count} (
                        {getTotalLabPoints(discipline.labs)} баллов)
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.menuContainer}>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent discipline click
                    setMenu(
                      menu?.id === discipline.id ? null : { id: discipline.id }
                    );
                  }}
                  className={styles.menuBtn}
                >
                  <MoreVertical className={styles.icon} />
                </button>
                {menu?.id === discipline.id && (
                  <div className={styles.dropdown}>
                    {/* Gradebook option for each group */}
                    {discipline.group_ids &&
                      discipline.group_ids.length > 0 && (
                        <>
                          {discipline.group_ids.length === 1 ? (
                            <button
                              onClick={() =>
                                openGradebook(
                                  discipline.id,
                                  discipline.group_ids![0]
                                )
                              }
                              className={styles.dropdownItem}
                            >
                              Открыть ведомость
                            </button>
                          ) : (
                            <div className={styles.submenu}>
                              <span className={styles.submenuTitle}>
                                Открыть ведомость:
                              </span>
                              {discipline.group_ids.map((groupId) => {
                                const group = groups.find(
                                  (g) => g.id === groupId
                                );
                                return (
                                  <button
                                    key={groupId}
                                    onClick={() =>
                                      openGradebook(discipline.id, groupId)
                                    }
                                    className={styles.dropdownItem}
                                    style={{
                                      paddingLeft: "20px",
                                      fontSize: "14px",
                                    }}
                                  >
                                    {group ? group.name : `Группа ${groupId}`}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                          <hr
                            style={{
                              margin: "4px 0",
                              border: "none",
                              borderTop: "1px solid #e5e7eb",
                            }}
                          />
                        </>
                      )}
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
            <div
              className={styles.placeholder}
              style={{ textAlign: "center", padding: "40px" }}
            >
              {error
                ? "Проверьте подключение к серверу и обновите страницу."
                : 'Нет дисциплин. Создайте первую дисциплину, нажав кнопку "Добавить дисциплину".'}
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
                ? "Создать дисциплину"
                : "Редактировать дисциплину"}
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
                  Название дисциплины *
                </label>
                <input
                  type="text"
                  value={modalData.data.name || ""}
                  onChange={(e) =>
                    setModalData({
                      ...modalData,
                      data: { ...modalData.data, name: e.target.value },
                    })
                  }
                  placeholder="Например: Математический анализ"
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
                  placeholder="Краткое описание дисциплины"
                  className={styles.textarea}
                />
              </div>

              <div>
                <label
                  className={styles.label}
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Выберите группы
                </label>
                {groupsLoading ? (
                  <p style={{ color: "#666", fontSize: "14px" }}>
                    Загрузка групп...
                  </p>
                ) : (
                  <GroupSelector
                    groups={groups}
                    setSelectedGroups={setSelectedGroups}
                    initialSelected={selectedGroups}
                  />
                )}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <div>
                <label
                  className={styles.label}
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontWeight: "600",
                  }}
                >
                  Выберите тест *
                </label>
                {testsLoading ? (
                  <p style={{ color: "#666", fontSize: "14px" }}>
                    Загрузка тестов...
                  </p>
                ) : (
                  <select
                    value={modalData.data.test_id || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setModalData({
                        ...modalData,
                        data: {
                          ...modalData.data,
                          test_id: value === "" ? undefined : parseInt(value),
                        },
                      });
                    }}
                    className={styles.input}
                    style={{ padding: "10px" }}
                  >
                    <option value="">Выберите тест</option>
                    {tests.map((test) => (
                      <option key={test.id} value={test.id}>
                        {test.title}
                      </option>
                    ))}
                  </select>
                )}
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
                  Количество лекций *
                </label>
                <input
                  type="number"
                  value={modalData.data.lecture_count ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setModalData({
                      ...modalData,
                      data: {
                        ...modalData.data,
                        lecture_count:
                          value === "" ? undefined : parseInt(value),
                      },
                    });
                  }}
                  placeholder="16"
                  className={styles.input}
                  min="1"
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <div>
                <label
                  className={styles.label}
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontWeight: "600",
                  }}
                >
                  Максимальные баллы за лекции *
                </label>
                <input
                  type="number"
                  value={modalData.data.lecture_points ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setModalData({
                      ...modalData,
                      data: {
                        ...modalData.data,
                        lecture_points:
                          value === "" ? undefined : parseInt(value),
                      },
                    });
                  }}
                  placeholder="40"
                  className={styles.input}
                  min="1"
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
                  Максимальные баллы за тесты *
                </label>
                <input
                  type="number"
                  value={modalData.data.test_points ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setModalData({
                      ...modalData,
                      data: {
                        ...modalData.data,
                        test_points: value === "" ? undefined : parseInt(value),
                      },
                    });
                  }}
                  placeholder="60"
                  className={styles.input}
                  min="1"
                />
              </div>
            </div>

            {/* Laboratory Works Section */}
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
                  Лабораторные работы (количество: {modalLabs.length})
                </label>
                <button
                  type="button"
                  onClick={addLab}
                  className={`${styles.btn} ${styles.blue}`}
                  style={{ padding: "6px 12px", fontSize: "14px" }}
                >
                  <Plus
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "4px",
                    }}
                  />
                  Добавить лабу
                </button>
              </div>

              {modalLabs.length === 0 ? (
                <p
                  style={{
                    color: "#666",
                    fontSize: "14px",
                    fontStyle: "italic",
                  }}
                >
                  Нет лабораторных работ. Нажмите "Добавить лабу" для создания.
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {modalLabs.map((lab, index) => (
                    <div
                      key={lab.lab_id}
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
                      <span style={{ fontWeight: "500", minWidth: "120px" }}>
                        Лабораторная {index + 1}:
                      </span>
                      <input
                        type="number"
                        value={lab.points ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          updateLabPoints(
                            lab.lab_id,
                            value === "" ? 0 : parseInt(value)
                          );
                        }}
                        placeholder="Баллы"
                        className={styles.input}
                        style={{ width: "100px" }}
                        min="0"
                      />
                      <span style={{ fontSize: "14px", color: "#666" }}>
                        баллов
                      </span>
                      <button
                        type="button"
                        onClick={() => removeLab(lab.lab_id)}
                        style={{
                          background: "#dc2626",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          padding: "6px 8px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        Удалить
                      </button>
                    </div>
                  ))}

                  {modalLabs.length > 0 && (
                    <div
                      style={{
                        marginTop: "8px",
                        padding: "8px 12px",
                        backgroundColor: "#eff6ff",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#1d4ed8",
                      }}
                    >
                      Общие баллы за лабораторные:{" "}
                      {getTotalLabPoints(modalLabs)}
                    </div>
                  )}
                </div>
              )}
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

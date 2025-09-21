import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import styles from "../styles/TopicsPage.module.css";
import GroupSelector from "./GroupSelector";
import type { IGroup } from "./ui/interfaces/IGroup";

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
  title?: string; // Add title for lab name
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

// Lab interface based on the API documentation
interface Lab {
  id: number;
  title: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

interface DisciplineFormProps {
  modalData: {
    mode: "create" | "edit";
    data: Partial<Discipline>;
    id?: number;
  } | null;
  groups: IGroup[];
  tests: Test[];
  selectedGroups: IGroup[];
  modalLabs: DisciplineLabComponent[];
  groupsLoading: boolean;
  testsLoading: boolean;
  onClose: () => void;
  onSave: () => void;
  onDataChange: (data: Partial<Discipline>) => void;
  onSelectedGroupsChange: (groups: IGroup[]) => void;
  onModalLabsChange: (labs: DisciplineLabComponent[]) => void;
}

export default function DisciplineForm({
  modalData,
  groups,
  tests,
  selectedGroups,
  modalLabs,
  groupsLoading,
  testsLoading,
  onClose,
  onSave,
  onDataChange,
  onSelectedGroupsChange,
  onModalLabsChange,
}: DisciplineFormProps) {
  if (!modalData) return null;

  // Laboratory work management functions
  const addLab = () => {
    const newLabId =
      modalLabs.length > 0
        ? Math.max(...modalLabs.map((lab) => lab.lab_id)) + 1
        : 1;
    onModalLabsChange([
      ...modalLabs,
      {
        lab_id: newLabId,
        points: 10,
        title: `Лабораторная работа ${newLabId}`,
      },
    ]);
  };

  const removeLab = (labId: number) => {
    onModalLabsChange(modalLabs.filter((lab) => lab.lab_id !== labId));
  };

  const updateLabPoints = (labId: number, points: number) => {
    onModalLabsChange(
      modalLabs.map((lab) => (lab.lab_id === labId ? { ...lab, points } : lab))
    );
  };

  // Function to update lab title
  const updateLabTitle = (labId: number, title: string) => {
    onModalLabsChange(
      modalLabs.map((lab) => (lab.lab_id === labId ? { ...lab, title } : lab))
    );
  };

  // Helper function to get total lab points
  const getTotalLabPoints = (labs: DisciplineLabComponent[] = []) => {
    return labs.reduce((total, lab) => total + lab.points, 0);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
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
                onDataChange({ ...modalData.data, name: e.target.value })
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
                onDataChange({ ...modalData.data, description: e.target.value })
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
                setSelectedGroups={onSelectedGroupsChange}
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
                  onDataChange({
                    ...modalData.data,
                    test_id: value === "" ? undefined : parseInt(value),
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
                onDataChange({
                  ...modalData.data,
                  lecture_count: value === "" ? undefined : parseInt(value),
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
                onDataChange({
                  ...modalData.data,
                  lecture_points: value === "" ? undefined : parseInt(value),
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
                onDataChange({
                  ...modalData.data,
                  test_points: value === "" ? undefined : parseInt(value),
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
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                      flex: 1,
                    }}
                  >
                    <input
                      type="text"
                      value={lab.title || `Лабораторная работа ${lab.lab_id}`}
                      onChange={(e) =>
                        updateLabTitle(lab.lab_id, e.target.value)
                      }
                      placeholder="Название лабораторной работы"
                      className={styles.input}
                      style={{ width: "100%", marginBottom: "4px" }}
                    />
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span style={{ fontWeight: "500", minWidth: "80px" }}>
                        Баллы:
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
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLab(lab.lab_id)}
                    style={{
                      background: "#dc2626",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "8px",
                      cursor: "pointer",
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Trash2 style={{ width: "16px", height: "16px" }} />
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
                  Общие баллы за лабораторные: {getTotalLabPoints(modalLabs)}
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
          <button onClick={onClose} className={`${styles.btn} ${styles.gray}`}>
            Отмена
          </button>
          <button onClick={onSave} className={`${styles.btn} ${styles.blue}`}>
            {modalData.mode === "create" ? "Создать" : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
}

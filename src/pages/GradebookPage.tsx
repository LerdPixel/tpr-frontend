import React, { useState, useEffect, useContext } from "react";
import { Context } from "../context/index";
import axios from "axios";
import { useParams } from "react-router-dom";
import styles from "../styles/Gradebook.module.css";

// Types based on API documentation
interface Discipline {
  id: number;
  name: string;
  description?: string;
  lecture_count: number;
  lecture_points: number;
  test_points: number;
  lab_count?: number;
  labs?: DisciplineLabComponent[];
}

const a = " "
interface DisciplineLabComponent {
  lab_id: number;
  points: number;
}

interface Group {
  id: number;
  name: string;
  created_at: string;
  archived_at?: string;
}

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  patronymic: string;
  email: string;
  group_id: number;
  is_approved: boolean;
  role_id: number;
  created_at: string;
}

interface ProgressView {
  discipline_id: number;
  labs_points_awarded: number;
  lecture_points_awarded: number;
  test_points_awarded: number;
  total_awarded: number;
  total_possible: number;
}

interface GroupProgressRow {
  user_id: number;
  first_name: string;
  last_name: string;
  group_id: number;
  progress: ProgressView;
}

interface AttendanceMarkInput {
  user_id: number;
  discipline_id: number;
  lecture_no: number;
}

export default function GradebookPage() {
  const { disciplineId, groupId } = useParams<{
    disciplineId: string;
    groupId: string;
  }>();
  const { store } = useContext(Context);

  // State
  const [discipline, setDiscipline] = useState<Discipline | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [groupProgress, setGroupProgress] = useState<GroupProgressRow[]>([]);
  const [group, setGroup] = useState<Group | null>(null);
  const [attendance, setAttendance] = useState<Record<number, number[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  // Fetch discipline data
  const fetchDiscipline = async () => {
    if (!disciplineId) return;
    console.log("Fetching discipline:", disciplineId);
    try {
      // Try without auth first since swagger docs show no auth required
      const response = await axios.get(`/server/disciplines/${disciplineId}`);
      console.log("Discipline response:", response);
      if (response.status === 200) {
        console.log("Discipline data:", response.data);
        setDiscipline(response.data as Discipline);
      }
    } catch (err: any) {
      console.error("Error fetching discipline:", err);
      setError(err?.response?.data?.error || "Ошибка при загрузке дисциплины");
    }
  };

  // Fetch group data
  const fetchGroup = async () => {
    if (!groupId) return;
    console.log("Fetching group:", groupId);
    try {
      // Get all groups since there's no individual group endpoint
      const response = await axios.get(`/server/groups`);
      console.log("Groups response:", response);
      if (response.status === 200) {
        const groups = response.data as Group[];
        const targetGroup = groups.find((g) => g.id === parseInt(groupId));
        console.log("Found group:", targetGroup);
        if (targetGroup) {
          setGroup(targetGroup);
        } else {
          setError(`Группа с ID ${groupId} не найдена`);
        }
      }
    } catch (err: any) {
      console.error("Error fetching group:", err);
      setError(err?.response?.data?.error || "Ошибка при загрузке группы");
    }
  };

  // Fetch students in group
  const fetchStudents = async () => {
    if (!groupId) return;
    try {
      const response = await axios.get(`/server/groups/${groupId}/students`, {
        headers: { Authorization: `Bearer ${getAccess()}` },
      });
      if (response.status === 200) {
        const studentsData = response.data as Student[];
        setStudents(studentsData.filter((s) => s.is_approved));
      }
    } catch (err: any) {
      console.error("Error fetching students:", err);
      setError(err?.response?.data?.error || "Ошибка при загрузке студентов");
    }
  };

  // Fetch group progress for discipline
  const fetchGroupProgress = async () => {
    if (!groupId || !disciplineId) return;
    try {
      const response = await axios.get(
        `/server/seminarist/groups/${groupId}/progress?discipline_id=${disciplineId}`,
        {
          headers: { Authorization: `Bearer ${getAccess()}` },
        }
      );
      if (response.status === 200) {
        const progressData = response.data as GroupProgressRow[];
        setGroupProgress(progressData);

        // Extract attendance data from progress if available
        // Note: The API doesn't seem to include attendance in GroupProgressRow,
        // so we'll need to fetch it separately for each student
        await fetchAttendanceData(progressData.map((p) => p.user_id));
      }
    } catch (err: any) {
      console.error("Error fetching group progress:", err);
      setError(
        err?.response?.data?.error || "Ошибка при загрузке прогресса группы"
      );
    }
  };

  // Fetch attendance data for students
  const fetchAttendanceData = async (userIds: number[]) => {
    if (!disciplineId) return;

    const attendancePromises = userIds.map(async (userId) => {
      try {
        const response = await axios.get(
          `/server/seminarist/progress/attendance?userId=${userId}&disciplineId=${disciplineId}`,
          {
            headers: { Authorization: `Bearer ${getAccess()}` },
          }
        );
        if (response.status === 200) {
          // API returns array of lecture numbers attended
          return { userId, lectures: response.data as number[] };
        }
      } catch (err: any) {
        console.error(`Error fetching attendance for user ${userId}:`, err);
        return { userId, lectures: [] };
      }
      return { userId, lectures: [] };
    });

    const attendanceResults = await Promise.all(attendancePromises);
    const attendanceMap: Record<number, number[]> = {};
    attendanceResults.forEach((result) => {
      if (result) {
        attendanceMap[result.userId] = result.lectures;
      }
    });
    setAttendance(attendanceMap);
  };

  // Mark or unmark attendance
  const toggleAttendance = async (studentId: number, lecture: number) => {
    console.log(
      `Toggling attendance for student ${studentId}, lecture ${lecture}`
    );
    if (!disciplineId) return;

    const currentAttendance = attendance[studentId] || [];
    const isCurrentlyAttended = currentAttendance.includes(lecture);

    console.log("Current attendance:", currentAttendance);
    console.log("Is currently attended:", isCurrentlyAttended);

    try {
      const attendanceData: AttendanceMarkInput = {
        user_id: studentId,
        discipline_id: parseInt(disciplineId),
        lecture_no: lecture,
      };

      console.log("Sending attendance data:", attendanceData);

      if (isCurrentlyAttended) {
        // Remove attendance
        console.log("Removing attendance");
        await axios({
          method: "delete",
          url: "/server/seminarist/progress/attendance",
          headers: {
            Authorization: `Bearer ${getAccess()}`,
            "Content-Type": "application/json",
          },
          data: attendanceData,
        });
      } else {
        // Mark attendance
        console.log("Marking attendance");
        await axios.post(
          "/server/seminarist/progress/attendance",
          attendanceData,
          {
            headers: { Authorization: `Bearer ${getAccess()}` },
          }
        );
      }

      // Update local state
      setAttendance((prev) => {
        const updated = { ...prev };
        if (isCurrentlyAttended) {
          updated[studentId] = (updated[studentId] || []).filter(
            (l) => l !== lecture
          );
        } else {
          updated[studentId] = [...(updated[studentId] || []), lecture];
        }
        console.log("Updated attendance state:", updated);
        return updated;
      });

      setSuccess(
        isCurrentlyAttended
          ? "Отметка о посещении удалена"
          : "Посещение отмечено"
      );
    } catch (err: any) {
      console.error("Error toggling attendance:", err);
      setError(
        err?.response?.data?.error || "Ошибка при изменении посещаемости"
      );
    }
  };

  // Load all data on component mount
  useEffect(() => {
    const loadData = async () => {
      console.log("GradebookPage - URL params:", { disciplineId, groupId });

      if (!disciplineId || !groupId) {
        console.log("Missing URL parameters:", { disciplineId, groupId });
        setError("Не указаны ID дисциплины или группы");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log(
          "Starting data load for discipline",
          disciplineId,
          "and group",
          groupId
        );
        // Load data in parallel where possible
        await Promise.all([fetchDiscipline(), fetchGroup(), fetchStudents()]);

        // Load progress after we have the basic data
        await fetchGroupProgress();
        console.log("Data load completed successfully");
      } catch (err) {
        console.error("Error loading gradebook data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [disciplineId, groupId]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>Загрузка ведомости...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: "center", padding: "40px", color: "#dc2626" }}>
          <h3>Ошибка</h3>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "16px",
              padding: "8px 16px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (!discipline || !group) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <h3>Данные не найдены</h3>
          <p>
            Параметры URL: disciplineId={disciplineId}, groupId={groupId}
          </p>
          <p>Дисциплина: {discipline ? "загружена" : "не найдена"}</p>
          <p>Группа: {group ? "загружена" : "не найдена"}</p>
          <button
            onClick={() => window.history.back()}
            style={{
              marginTop: "16px",
              padding: "8px 16px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Success message */}
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
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          {success}
        </div>
      )}

      {/* Error message */}
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
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          {error}
        </div>
      )}

      <h2 className={styles.title}>
        Ведомость дисциплины "{discipline.name}" (группа: {group.name})
      </h2>

      <table className={styles.table}>
        <thead>
          {/* верхняя строка */}
          <tr>
            <th rowSpan={2}>Ученик</th>
            <th colSpan={discipline.lecture_count}>Лекции</th>
            {Array.from({ length: discipline.lab_count || 0 }).map((_, i) => (
              <th key={`labHeader${i}`} rowSpan={2}>
                Лаб{i + 1}
              </th>
            ))}
            <th rowSpan={2}>Тест</th>
            <th rowSpan={2}>Итог</th>
          </tr>
          {/* строка с номерами */}
          <tr>
            {Array.from({ length: discipline.lecture_count }).map((_, i) => (
              <th key={i}>{i + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            // Find progress data for this student
            const progressData = groupProgress.find(
              (p) => p.user_id === student.id
            );
            const studentAttendance = attendance[student.id] || [];

            return (
              <tr key={student.id}>
                <td>
                  {`${student.last_name} ${student.first_name[0]}.${student.patronymic[0]}.`}
                </td>
                {Array.from({ length: discipline.lecture_count }).map(
                  (_, i) => {
                    const lectureNumber = i + 1; // Convert to 1-based
                    const attended = studentAttendance.includes(lectureNumber);
                    return (
                      <td
                        key={i}
                        className={styles.cell}
                        onClick={() =>
                          toggleAttendance(student.id, lectureNumber)
                        }
                        style={{
                          cursor: "pointer",
                          backgroundColor: attended ? "#dcfce7" : "#fee2e2",
                          userSelect: "none",
                        }}
                      >
                        {attended ? "" : "Н"}
                      </td>
                    );
                  }
                )}
                {Array.from({ length: discipline.lab_count || 0 }).map(
                  (_, i) => (
                    <td key={`lab${i}`} className={styles.cell}>
                      {progressData?.progress.labs_points_awarded || ""}
                    </td>
                  )
                )}
                <td className={styles.cell}>
                  {progressData?.progress.test_points_awarded || ""}
                </td>
                <td className={styles.cell}>
                  {progressData?.progress.total_awarded || ""}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ marginTop: "20px", fontSize: "14px", color: "#666" }}>
        <p>
          <strong>Пояснение:</strong>
        </p>
        <p>• Кликните по ячейке лекции, чтобы отметить/снять посещение</p>
        <p>• Зеленый цвет - присутствовал, красный с "Н" - отсутствовал</p>
        <p>• Баллы за лабораторные и тесты загружаются с сервера</p>
      </div>
    </div>
  );
}

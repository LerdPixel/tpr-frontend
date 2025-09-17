import { useState, useEffect, useContext } from "react";
import { Context } from "../context/index";
import axios from "axios";
import { useParams } from "react-router-dom";
import styles from "../styles/Gradebook.module.css";
import { finalMark } from "./GradebookPage";
// Types based on API documentation
interface Discipline {
  id: number;
  name: string;
  description?: string;
  lecture_count: number;
  lecture_points: number;
  test_points: number;
  test_id: number;
  lab_count?: number;
  labs?: DisciplineLabComponent[];
}

interface DisciplineLabComponent {
  lab_id: number;
  points: number;
}

interface StudentProgress {
  discipline_id: number;
  labs_points_awarded: number;
  lecture_points_awarded: number;
  test_points_awarded: number;
  total_awarded: number;
  total_possible: number;
}

export default function StudentGradebook() {
  const { disciplineId } = useParams<{
    disciplineId: string;
  }>();
  const { store } = useContext(Context);

  // State
  const [discipline, setDiscipline] = useState<Discipline | null>(null);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [attendance, setAttendance] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-dismiss error messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const getAccess = () => {
    const access_token = localStorage.getItem("token");
    if (access_token == null) {
      store.refresh();
    }
    return access_token;
  };

  // Check if user is a student
  useEffect(() => {
    if (!store.isLoading && store.role !== "student") {
      setError("Access denied. This page is only available for students.");
      setLoading(false);
      return;
    }
  }, [store.isLoading, store.role]);

  // Fetch discipline data
  const fetchDiscipline = async () => {
    if (!disciplineId) return;

    try {
      const response = await axios.get(`/server/disciplines/${disciplineId}`);
      if (response.status === 200) {
        setDiscipline(response.data as Discipline);
      }
    } catch (err: any) {
      console.error("Error fetching discipline:", err);
      setError(err?.response?.data?.error || "Error loading discipline");
    }
  };

  // Fetch student's progress for the discipline
  const fetchProgress = async () => {
    if (!disciplineId) return;

    try {
      const response = await axios.get(
        `/server/progress/${disciplineId}`,
        {
          headers: { Authorization: `Bearer ${getAccess()}` },
        }
      );
      if (response.status === 200) {
        setProgress(response.data as StudentProgress);
      }
    } catch (err: any) {
      console.error("Error fetching progress:", err);
      setError(err?.response?.data?.error || "Error loading progress data");
    }
  };

  // Fetch student's attendance for the discipline
  const fetchAttendance = async () => {
    if (!disciplineId) return;

    try {
      const response = await axios.get(
        `/server/progress/${disciplineId}/attendance`,
        {
          headers: { Authorization: `Bearer ${getAccess()}` },
        }
      );
      if (response.status === 200) {
        // API returns array of lecture numbers attended
        setAttendance(response.data as number[]);
      }
    } catch (err: any) {
      console.error("Error fetching attendance:", err);
      setError(err?.response?.data?.error || "Error loading attendance data");
    }
  };

  // Load all data on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!disciplineId) {
        setError("Discipline ID not specified");
        setLoading(false);
        return;
      }

      if (store.role !== "student") {
        return; // Will be handled by role check useEffect
      }

      setLoading(true);
      setError(null);

      try {
        // Load data in parallel
        await Promise.all([
          fetchDiscipline(),
          fetchProgress(),
          fetchAttendance(),
        ]);
      } catch (err) {
        console.error("Error loading gradebook data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!store.isLoading) {
      loadData();
    }
  }, [disciplineId, store.isLoading, store.role]);

  if (store.isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (store.role !== "student") {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <h3>Access Denied</h3>
          <p>This page is only available for students.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <p>Loading gradebook...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <h3>Error</h3>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className={styles.errorButton}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!discipline) {
    return (
      <div className={styles.container}>
        <div className={styles.notFoundContainer}>
          <h3>Discipline not found</h3>
          <p>Discipline ID: {disciplineId}</p>
          <button
            onClick={() => window.history.back()}
            className={styles.backButton}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // Calculate final mark based on total points

  const studentName = store.person
    ? `${store.person.last_name} ${store.person.first_name[0]}.${store.person.patronymic[0]}.`
    : "Student";

  return (
    <div className={styles.container}>
      {/* Error message */}
      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.header}>
        <h2 className={styles.title}>My Progress in "{discipline.name}"</h2>
      </div>

      <table className={styles.table}>
        <thead>
          {/* Header row */}
          <tr>
            <th rowSpan={2}>Студент</th>
            <th colSpan={discipline.lecture_count}>Лекции</th>
            <th rowSpan={2} style={{ whiteSpace: "pre-line", textAlign: "center" }}>
              {"Балл за\nпосещения"}
            </th>
            {Array.from({ length: discipline.lab_count || 0 }).map((_, i) => (
              <th key={`labHeader${i}`} rowSpan={2}>
                Lab{i + 1}
              </th>
            ))}
            <th rowSpan={2}>Тест</th>
            <th rowSpan={2} style={{ whiteSpace: "pre-line", textAlign: "center" }}>
              {"Итог за\nсеместр"}
            </th>
            <th rowSpan={2}>Итог</th>
          </tr>
          {/* Lecture numbers row */}
          <tr>
            {Array.from({ length: discipline.lecture_count }).map((_, i) => (
              <th key={i}>{i + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{studentName}</td>
            {Array.from({ length: discipline.lecture_count }).map((_, i) => {
              const lectureNumber = i + 1;
              const attended = attendance.includes(lectureNumber);
              return (
                <td
                  key={i}
                  className={`${styles.cell} ${
                    attended
                      ? styles.attendanceCellPresent
                      : styles.attendanceCellAbsent
                  }`}
                >
                  {attended ? "" : "A"}
                </td>
              );
            })}
            <td className={styles.cell}>
              {progress?.lecture_points_awarded || ""}
            </td>
            {Array.from({ length: discipline.lab_count || 0 }).map((_, i) => (
              <td key={`lab${i}`} className={styles.cell}>
                {progress?.labs_points_awarded || ""}
              </td>
            ))}
            <td className={styles.cell}>
              {progress?.test_points_awarded || ""}
            </td>
            <td className={styles.cell}>
              {(() => {
                const lecturePoints = progress?.lecture_points_awarded || 0;
                const labPoints = progress?.labs_points_awarded || 0;
                const semesterTotal = lecturePoints + labPoints;
                return semesterTotal > 0 ? semesterTotal : "";
              })()}
            </td>
            <td className={styles.cell}>
              {(() => {
                const totalPoints = progress?.total_awarded || 0;
                const maxPoints = progress?.total_possible || 0;
                return finalMark(totalPoints);
              })()}
            </td>
          </tr>
        </tbody>
      </table>

    </div>
  );
}

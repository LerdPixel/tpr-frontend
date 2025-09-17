import { useState, useEffect, useContext } from "react";
import { Context } from "../context/index";
import axios from "axios";
import { useParams } from "react-router-dom";
import TestScheduleModal from "../components/TestScheduleModal";
import styles from "../styles/Gradebook.module.css";

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

interface Test {
  id: number;
  title: string;
  description?: string;
}

interface TestSchedule {
  id: number;
  user_id: number;
  discipline_id: number;
  opens_at: string;
  closes_at: string;
  attempt_time_limit_sec: number;
  max_attempts?: number;
  created_at?: string;
  updated_at?: string;
}

interface TestScheduleUpdateInput {
  opens_at: string;
  closes_at: string;
  attempt_time_limit_sec: number;
}

interface TestScheduleCreateInput {
  user_id: number;
  discipline_id: number;
  opens_at: string;
  closes_at: string;
  attempt_time_limit_sec: number;
}

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
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(
    new Set()
  );
  const [showTestModal, setShowTestModal] = useState(false);
  const [testData, setTestData] = useState<Test | null>(null);
  const [testModalData, setTestModalData] = useState({
    opensAt: new Date().toISOString().slice(0, 16),
    closesAt: new Date(Date.now() + 2 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 16), // 2 hours from now
    attemptTimeLimit: 60, // minutes
  });
  const [testSchedules, setTestSchedules] = useState<TestSchedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<TestSchedule | null>(
    null
  );
  const [showScheduleModal, setShowScheduleModal] = useState(false);

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

  // Fetch test schedules for the discipline
  const fetchTestSchedules = async () => {
    if (!disciplineId) return;
    console.log("disciplineId=", disciplineId);

    try {
      const response = await axios.get(
        `/server/admin/tests/schedules?discipline_id=${disciplineId}`,
        {
          headers: { Authorization: `Bearer ${getAccess()}` },
        }
      );
      if (response.status === 200) {
        setTestSchedules(response.data as TestSchedule[]);
      }
    } catch (err: any) {
      console.error("Error fetching test schedules:", err);
      // This is not a critical error, so we don't show it to the user
    }
  };

  // Fetch test data for the discipline
  const fetchTest = async () => {
    if (!discipline?.test_id) return;
    try {
      const response = await axios.get(`/server/tests/${discipline.test_id}`, {
        headers: { Authorization: `Bearer ${getAccess()}` },
      });
      if (response.status === 200) {
        setTestData(response.data as Test);
      }
    } catch (err: any) {
      console.error("Error fetching test:", err);
      // Test not found is not a critical error for gradebook functionality
    }
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
      console.log(
        `🔍 DEBUG: Fetching progress for group ${groupId}, discipline ${disciplineId}`
      );
      const response = await axios.get(
        `/server/seminarist/groups/${groupId}/progress?discipline_id=${disciplineId}`,
        {
          headers: { Authorization: `Bearer ${getAccess()}` },
        }
      );

      console.log(`📡 DEBUG: Server response status:`, response.status);
      console.log(`📊 DEBUG: Raw server response data:`, response.data);

      if (response.status === 200) {
        const progressData = response.data as GroupProgressRow[];

        console.log(
          `👥 DEBUG: Parsed progress data (${progressData.length} students):`
        );
        progressData.forEach((student, index) => {
          console.log(`🎓 DEBUG: Student ${index + 1}:`, {
            user_id: student.user_id,
            name: `${student.first_name} ${student.last_name}`,
            group_id: student.group_id,
            progress: {
              discipline_id: student.progress.discipline_id,
              labs_points_awarded: student.progress.labs_points_awarded,
              lecture_points_awarded: student.progress.lecture_points_awarded,
              test_points_awarded: student.progress.test_points_awarded,
              total_awarded: student.progress.total_awarded,
              total_possible: student.progress.total_possible,
            },
          });
        });

        // Focus on test scores specifically
        const testScores = progressData.map((student) => ({
          name: `${student.first_name} ${student.last_name}`,
          test_points_awarded: student.progress.test_points_awarded,
        }));
        console.log(`🎯 DEBUG: Test scores summary:`, testScores);

        setGroupProgress(progressData);

        // Extract attendance data from progress if available
        // Note: The API doesn't seem to include attendance in GroupProgressRow,
        // so we'll need to fetch it separately for each student
        await fetchAttendanceData(progressData.map((p) => p.user_id));
      }
    } catch (err: any) {
      console.error("❌ DEBUG: Error fetching group progress:", err);
      console.error("❌ DEBUG: Error response data:", err?.response?.data);
      console.error("❌ DEBUG: Error response status:", err?.response?.status);
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

        // Load test data and schedules after discipline is loaded
        if (discipline?.test_id) {
          await fetchTest();
        }
        await fetchTestSchedules();
        console.log("Data load completed successfully");
      } catch (err) {
        console.error("Error loading gradebook data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [disciplineId, groupId]);

  // Load test when discipline changes
  useEffect(() => {
    if (discipline?.test_id) {
      fetchTest();
    }
    fetchTestSchedules();
  }, [discipline?.test_id]);

  // Get test schedule for a specific student
  const getStudentTestSchedule = (studentId: number): TestSchedule | null => {
    if (testSchedules === null) return null;
    return (
      testSchedules.find((schedule) => schedule.user_id === studentId) || null
    );
  };

  // Check if a test is currently open for a student
  const isTestOpen = (schedule: TestSchedule | null): boolean => {
    if (!schedule) return false;

    const now = new Date();
    const opens = new Date(schedule.opens_at);
    const closes = new Date(schedule.closes_at);

    return now >= opens && now <= closes;
  };

  // Handle test cell click
  const handleTestCellClick = (student: Student) => {
    const schedule = getStudentTestSchedule(student.id);
    if (schedule) {
      setSelectedSchedule(schedule);
      setShowScheduleModal(true);
    }
  };

  // Handle schedule deletion
  const handleDeleteSchedule = async (scheduleId: number): Promise<void> => {
    try {
      await axios.delete(`/server/admin/tests/schedules/${scheduleId}`, {
        headers: { Authorization: `Bearer ${getAccess()}` },
      });

      // Remove from local state
      setTestSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
      setSuccess("Расписание теста удалено");
    } catch (err: any) {
      console.error("Error deleting schedule:", err);
      throw new Error(
        err?.response?.data?.error || "Ошибка при удалении расписания"
      );
    }
  };

  // Handle schedule update
  const handleUpdateSchedule = async (
    scheduleId: number,
    data: TestScheduleUpdateInput
  ): Promise<void> => {
    try {
      const response = await axios.put(
        `/server/admin/tests/schedules/${scheduleId}`,
        data,
        {
          headers: { Authorization: `Bearer ${getAccess()}` },
        }
      );

      if (response.status === 200) {
        // Update local state
        setTestSchedules((prev) =>
          prev.map((s) => (s.id === scheduleId ? { ...s, ...data } : s))
        );
        setSuccess("Расписание теста обновлено");
      }
    } catch (err: any) {
      console.error("Error updating schedule:", err);
      throw new Error(
        err?.response?.data?.error || "Ошибка при обновлении расписания"
      );
    }
  };

  // Handle student selection
  const toggleStudentSelection = (studentId: number) => {
    setSelectedStudents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const selectAllStudents = () => {
    setSelectedStudents(new Set(students.map((s) => s.id)));
  };

  const clearStudentSelection = () => {
    setSelectedStudents(new Set());
  };

  // Handle test opening
  const openTestModal = () => {
    if (!testData) {
      setError("Тест не найден для данной дисциплины");
      return;
    }
    if (selectedStudents.size === 0) {
      setError("Выберите хотя бы одного студента");
      return;
    }
    setShowTestModal(true);
  };

  const closeTestModal = () => {
    setShowTestModal(false);
  };

  const createTestSchedules = async () => {
    if (!testData || !disciplineId || selectedStudents.size === 0) return;

    try {
      const schedulePromises = Array.from(selectedStudents).map((studentId) => {
        const scheduleData: TestScheduleCreateInput = {
          user_id: studentId,
          discipline_id: parseInt(disciplineId),
          opens_at: new Date(testModalData.opensAt).toISOString(),
          closes_at: new Date(testModalData.closesAt).toISOString(),
          attempt_time_limit_sec: testModalData.attemptTimeLimit * 60, // convert minutes to seconds
        };

        return axios.post("/server/admin/tests/schedules", scheduleData, {
          headers: { Authorization: `Bearer ${getAccess()}` },
        });
      });

      await Promise.all(schedulePromises);
      setSuccess(`Тест открыт для ${selectedStudents.size} студентов`);
      setShowTestModal(false);
      setSelectedStudents(new Set());

      // Refresh test schedules
      await fetchTestSchedules();
    } catch (err: any) {
      console.error("Error creating test schedules:", err);
      setError(err?.response?.data?.error || "Ошибка при открытии теста");
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <p>Загрузка ведомости...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <h3>Ошибка</h3>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className={styles.errorButton}
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
        <div className={styles.notFoundContainer}>
          <h3>Данные не найдены</h3>
          <p>
            Параметры URL: disciplineId={disciplineId}, groupId={groupId}
          </p>
          <p>Дисциплина: {discipline ? "загружена" : "не найдена"}</p>
          <p>Группа: {group ? "загружена" : "не найдена"}</p>
          <button
            onClick={() => window.history.back()}
            className={styles.backButton}
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
        <div className={styles.successMessage}>
          {success}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <div className={styles.header}>
        <h2 className={styles.title}>
          Ведомость дисциплины "{discipline.name}" (группа: {group.name})
        </h2>
        <div className={styles.controls}>
          {testData && (
            <>
              <div className={styles.selectionInfo}>
                Выбрано студентов: {selectedStudents.size}
                {selectedStudents.size > 0 && (
                  <button
                    onClick={clearStudentSelection}
                    className={styles.clearBtn}
                  >
                    Очистить
                  </button>
                )}
                <button
                  onClick={selectAllStudents}
                  className={styles.selectAllBtn}
                >
                  Выбрать всех
                </button>
              </div>
              <button
                onClick={openTestModal}
                disabled={selectedStudents.size === 0}
                className={`${styles.openTestBtn} ${
                  selectedStudents.size === 0 ? styles.disabled : ""
                }`}
              >
                Открыть тест
              </button>
            </>
          )}
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          {/* верхняя строка */}
          <tr>
            <th rowSpan={2}>
              <input
                type="checkbox"
                checked={
                  selectedStudents.size === students.length &&
                  students.length > 0
                }
                onChange={
                  selectedStudents.size === students.length
                    ? clearStudentSelection
                    : selectAllStudents
                }
                className={styles.checkboxSpacing}
              />
              Ученик
            </th>
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
            const testSchedule = getStudentTestSchedule(student.id);
            const hasOpenTest = isTestOpen(testSchedule);

            // Debug logging for each student's test score display in UI
            console.log(
              `📊 UI DEBUG: Rendering student ${student.first_name} ${student.last_name}:`,
              {
                user_id: student.id,
                test_points_awarded: progressData?.progress.test_points_awarded,
                total_awarded: progressData?.progress.total_awarded,
                has_progress_data: !!progressData,
                full_progress: progressData?.progress,
                display_value:
                  progressData?.progress.test_points_awarded ||
                  (testSchedule ? "🟡" : ""),
              }
            );

            return (
              <tr key={student.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedStudents.has(student.id)}
                    onChange={() => toggleStudentSelection(student.id)}
                    className={styles.checkboxSpacing}
                  />
                  {`${student.last_name} ${student.first_name[0]}.${student.patronymic[0]}.`}
                </td>
                {Array.from({ length: discipline.lecture_count }).map(
                  (_, i) => {
                    const lectureNumber = i + 1; // Convert to 1-based
                    const attended = studentAttendance.includes(lectureNumber);
                    return (
                      <td
                        key={i}
                        className={`${
                          styles.cell
                        } ${styles.attendanceCell} ${
                          attended
                            ? styles.attendanceCellPresent
                            : styles.attendanceCellAbsent
                        }`}
                        onClick={() =>
                          toggleAttendance(student.id, lectureNumber)
                        }
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
                <td
                  className={`${styles.cell} ${
                    testSchedule
                      ? hasOpenTest
                        ? styles.testCellOpen
                        : styles.cell
                      : styles.cell
                  } ${
                    testSchedule
                      ? styles.testCellClickable
                      : styles.testCellDefault
                  }`}
                  onClick={
                    testSchedule
                      ? () => handleTestCellClick(student)
                      : undefined
                  }
                >
                  {progressData?.progress.test_points_awarded ||
                    (testSchedule ? "🟡" : "")}
                </td>
                <td className={styles.cell}>
                  {progressData?.progress.total_awarded || ""}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className={styles.explanationSection}>
        <p>
          <strong>Пояснение:</strong>
        </p>
        <p>• Кликните по ячейке лекции, чтобы отметить/снять посещение</p>
        <p>• Зеленый цвет - присутствовал, красный с "Н" - отсутствовал</p>
        <p>• Баллы за лабораторные и тесты загружаются с сервера</p>
        {testData && <p>• Доступен тест: "{testData.title}"</p>}
      </div>

      {/* Test Schedule Modal */}
      {showTestModal && (
        <div className={styles.modalOverlay} onClick={closeTestModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>
              Открыть тест "{testData?.title}" для {selectedStudents.size}{" "}
              студентов
            </h3>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Время открытия:
                  <input
                    type="datetime-local"
                    value={testModalData.opensAt}
                    onChange={(e) =>
                      setTestModalData((prev) => ({
                        ...prev,
                        opensAt: e.target.value,
                      }))
                    }
                    className={styles.input}
                  />
                </label>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Время закрытия:
                  <input
                    type="datetime-local"
                    value={testModalData.closesAt}
                    onChange={(e) =>
                      setTestModalData((prev) => ({
                        ...prev,
                        closesAt: e.target.value,
                      }))
                    }
                    className={styles.input}
                  />
                </label>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Время на прохождение (минуты):
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={testModalData.attemptTimeLimit}
                    onChange={(e) =>
                      setTestModalData((prev) => ({
                        ...prev,
                        attemptTimeLimit: parseInt(e.target.value) || 60,
                      }))
                    }
                    className={styles.input}
                  />
                </label>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                onClick={closeTestModal}
                className={`${styles.btn} ${styles.gray}`}
              >
                Отмена
              </button>
              <button
                onClick={createTestSchedules}
                className={`${styles.btn} ${styles.blue}`}
              >
                Открыть тест
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Schedule Modal */}
      {selectedSchedule && (
        <TestScheduleModal
          isOpen={showScheduleModal}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedSchedule(null);
          }}
          schedule={selectedSchedule}
          studentName={`${
            students.find((s) => s.id === selectedSchedule.user_id)
              ?.last_name || ""
          } ${
            students.find((s) => s.id === selectedSchedule.user_id)
              ?.first_name || ""
          }`}
          testTitle={testData?.title || "Тест"}
          onDelete={handleDeleteSchedule}
          onUpdate={handleUpdateSchedule}
        />
      )}
    </div>
  );
}

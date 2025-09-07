import React, { useState, useEffect } from "react";
import { Clock, Calendar, User, Trash2, Edit3, X } from "lucide-react";
import styles from "../styles/Gradebook.module.css";

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

interface Props {
  isOpen: boolean;
  onClose: () => void;
  schedule: TestSchedule | null;
  studentName: string;
  testTitle: string;
  onDelete: (scheduleId: number) => Promise<void>;
  onUpdate: (
    scheduleId: number,
    data: TestScheduleUpdateInput
  ) => Promise<void>;
}

export default function TestScheduleModal({
  isOpen,
  onClose,
  schedule,
  studentName,
  testTitle,
  onDelete,
  onUpdate,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<TestScheduleUpdateInput>({
    opens_at: "",
    closes_at: "",
    attempt_time_limit_sec: 60,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize edit data when schedule changes
  useEffect(() => {
    if (schedule) {
      const opensAt = new Date(schedule.opens_at).toISOString().slice(0, 16);
      const closesAt = new Date(schedule.closes_at).toISOString().slice(0, 16);

      setEditData({
        opens_at: opensAt,
        closes_at: closesAt,
        attempt_time_limit_sec: schedule.attempt_time_limit_sec,
      });
    }
  }, [schedule]);

  // Clear error when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setIsEditing(false);
    }
  }, [isOpen]);

  if (!isOpen || !schedule) return null;

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString("ru-RU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}ч ${remainingMinutes}мин`;
    }
    return `${minutes}мин`;
  };

  const isTestOpen = () => {
    const now = new Date();
    const opens = new Date(schedule.opens_at);
    const closes = new Date(schedule.closes_at);
    return now >= opens && now <= closes;
  };

  const getStatusInfo = () => {
    const now = new Date();
    const opens = new Date(schedule.opens_at);
    const closes = new Date(schedule.closes_at);

    if (now < opens) {
      return {
        status: "upcoming",
        text: "Предстоящий",
        color: "#f59e0b",
      };
    } else if (now >= opens && now <= closes) {
      return {
        status: "open",
        text: "Открыт",
        color: "#10b981",
      };
    } else {
      return {
        status: "closed",
        text: "Закрыт",
        color: "#ef4444",
      };
    }
  };

  const handleDelete = async () => {
    if (
      !schedule ||
      !window.confirm("Вы уверены, что хотите удалить это расписание теста?")
    ) {
      return;
    }

    setLoading(true);
    try {
      await onDelete(schedule.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Ошибка при удалении расписания");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!schedule) return;

    // Validation
    const opensAt = new Date(editData.opens_at);
    const closesAt = new Date(editData.closes_at);

    if (opensAt >= closesAt) {
      setError("Время открытия должно быть раньше времени закрытия");
      return;
    }

    if (editData.attempt_time_limit_sec < 60) {
      setError("Время на прохождение должно быть не менее 1 минуты");
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        opens_at: new Date(editData.opens_at).toISOString(),
        closes_at: new Date(editData.closes_at).toISOString(),
        attempt_time_limit_sec: editData.attempt_time_limit_sec,
      };

      await onUpdate(schedule.id, updateData);
      setIsEditing(false);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Ошибка при обновлении расписания");
    } finally {
      setLoading(false);
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.scheduleModal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Расписание теста</h3>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalContent}>
          {/* Error display */}
          {error && (
            <div className={styles.errorMessage}>
              {error}
              <button
                onClick={() => setError(null)}
                className={styles.errorClose}
              >
                ×
              </button>
            </div>
          )}

          {/* Test info */}
          <div className={styles.testInfo}>
            <h4 className={styles.testTitle}>{testTitle}</h4>
            <div className={styles.studentInfo}>
              <User size={16} />
              <span>{studentName}</span>
              <div
                className={styles.statusBadge}
                style={{ backgroundColor: statusInfo.color }}
              >
                {statusInfo.text}
              </div>
            </div>
          </div>

          {/* Schedule details */}
          <div className={styles.scheduleDetails}>
            <div className={styles.detailRow}>
              <Calendar size={16} />
              <span className={styles.detailLabel}>Время открытия:</span>
              {isEditing ? (
                <input
                  type="datetime-local"
                  value={editData.opens_at}
                  onChange={(e) =>
                    setEditData({ ...editData, opens_at: e.target.value })
                  }
                  className={styles.input}
                />
              ) : (
                <span>{formatDateTime(schedule.opens_at)}</span>
              )}
            </div>

            <div className={styles.detailRow}>
              <Calendar size={16} />
              <span className={styles.detailLabel}>Время закрытия:</span>
              {isEditing ? (
                <input
                  type="datetime-local"
                  value={editData.closes_at}
                  onChange={(e) =>
                    setEditData({ ...editData, closes_at: e.target.value })
                  }
                  className={styles.input}
                />
              ) : (
                <span>{formatDateTime(schedule.closes_at)}</span>
              )}
            </div>

            <div className={styles.detailRow}>
              <Clock size={16} />
              <span className={styles.detailLabel}>Время на прохождение:</span>
              {isEditing ? (
                <input
                  type="number"
                  min="1"
                  max="600"
                  value={Math.floor(editData.attempt_time_limit_sec / 60)}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      attempt_time_limit_sec:
                        parseInt(e.target.value || "60") * 60,
                    })
                  }
                  className={styles.input}
                  placeholder="минуты"
                />
              ) : (
                <span>{formatDuration(schedule.attempt_time_limit_sec)}</span>
              )}
            </div>

            {schedule.max_attempts && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Максимум попыток:</span>
                <span>{schedule.max_attempts}</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.modalActions}>
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className={`${styles.btn} ${styles.gray}`}
                disabled={loading}
              >
                Отмена
              </button>
              <button
                onClick={handleUpdate}
                className={`${styles.btn} ${styles.blue}`}
                disabled={loading}
              >
                {loading ? "Сохранение..." : "Сохранить"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleDelete}
                className={`${styles.btn} ${styles.red}`}
                disabled={loading}
              >
                <Trash2 size={16} />
                Удалить
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className={`${styles.btn} ${styles.blue}`}
                disabled={loading}
              >
                <Edit3 size={16} />
                Редактировать
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

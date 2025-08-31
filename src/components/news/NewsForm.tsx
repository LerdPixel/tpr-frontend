import styles from "./News.module.css";
import React, { useState } from "react";

type Group = { id: number; name: string };
type Test = { id: number; name: string };

export interface NewsDraft {
  id?: number;
  title: string;
  description?: string;
  fileUrl?: string;   // в реальном проекте ты загрузишь файл и получишь URL
  testId?: number;
  groupIds: number[];
}

interface Props {
  groups: Group[];
  tests: Test[];
  initial?: NewsDraft;
  onSubmit: (data: NewsDraft) => void;
  onCancel: () => void;
}

export default function NewsForm({
  groups,
  tests,
  initial,
  onSubmit,
  onCancel,
}: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [attachMode, setAttachMode] = useState<"none" | "file" | "test">(
    initial?.testId ? "test" : initial?.fileUrl ? "file" : "none"
  );
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState(initial?.fileUrl ?? "");
  const [testId, setTestId] = useState<number | "">(
    initial?.testId ?? ""
  );
  const [groupIds, setGroupIds] = useState<number[]>(
    initial?.groupIds ?? []
  );

  const toggleGroup = (id: number) => {
    setGroupIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    // имитация загрузки файла: в реале вместо URL — upload и ответ бэка
    let computedFileUrl = fileUrl;
    if (file) {
      computedFileUrl = URL.createObjectURL(file);
    }

    onSubmit({
      id: initial?.id,
      title: title.trim(),
      description: description.trim(),
      fileUrl: attachMode === "file" ? computedFileUrl : undefined,
      testId: attachMode === "test" && testId !== "" ? Number(testId) : undefined,
      groupIds,
    });
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <h3 className={styles.formTitle}>
        {initial ? "Редактировать новость" : "Добавить новость"}
      </h3>

      <label className={styles.label}>
        Название
        <input
          className={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Введите заголовок"
          required
        />
      </label>

      <label className={styles.label}>
        Описание
        <textarea
          className={styles.textarea}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Краткое описание / ссылка"
          rows={3}
        />
      </label>

      <div className={styles.attachBlock}>
        <span className={styles.attachLabel}>Вложение:</span>
        <div className={styles.attachControls}>
          <label className={styles.radio}>
            <input
              type="radio"
              name="attach"
              checked={attachMode === "none"}
              onChange={() => setAttachMode("none")}
            />
            Нет
          </label>
          <label className={styles.radio}>
            <input
              type="radio"
              name="attach"
              checked={attachMode === "file"}
              onChange={() => setAttachMode("file")}
            />
            Файл
          </label>
          <label className={styles.radio}>
            <input
              type="radio"
              name="attach"
              checked={attachMode === "test"}
              onChange={() => setAttachMode("test")}
            />
            Тест
          </label>
        </div>

        {attachMode === "file" && (
          <div className={styles.fileRow}>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
        )}

        {attachMode === "test" && (
          <div className={styles.selectRow}>
            <select
              className={styles.select}
              value={testId}
              onChange={(e) => setTestId(e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">— Выберите тест —</option>
              {tests.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className={styles.groupsBlock}>
        <div className={styles.groupsTitle}>Доступно для групп:</div>
        <div className={styles.groupList}>
          {groups.map((g) => (
            <label key={g.id} className={styles.groupCheck}>
              <input
                type="checkbox"
                checked={groupIds.includes(g.id)}
                onChange={() => toggleGroup(g.id)}
              />
              {g.name}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.formActions}>
        <button type="button" className={styles.btnGhost} onClick={onCancel}>
          Отмена
        </button>
        <button type="submit" className={styles.btnPrimary}>
          Сохранить
        </button>
      </div>
    </form>
  );
}

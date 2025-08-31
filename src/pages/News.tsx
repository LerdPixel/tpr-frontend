import React, { useState, useMemo } from "react";
import NewsItem from "../components/news/NewsItem";
import NewsForm from "../components/news/NewsForm";
import styles from "../components/news/News.module.css"
import Modal from "../components/news/Modal";

type News = {
  id: number;
  title: string;
  description?: string;
  fileUrl?: string;      // если приложен файл (URL)
  testId?: number;       // если выбран тест
  groupIds: number[];    // id групп, для которых доступна новость
};

type Group = { id: number; name: string };
type Test = { id: number; name: string };



const mockGroups: Group[] = [
  { id: 1, name: "Б22-534" },
  { id: 2, name: "М23-705" },
  { id: 3, name: "М23-735" },
];

const mockTests: Test[] = [
  { id: 101, name: "Тест 1" },
  { id: 102, name: "Тест 2" },
];

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([
    { id: 1, title: "Тест 3", description: "", groupIds: [1] },
    {
      id: 2,
      title: "Выложены лекции 1 и 2",
      description: "Можно посмотреть здесь",
      testId: 101,
      groupIds: [2],
    },
    {
      id: 3,
      title: "Лабораторная работа 4",
      description: "Необходимо выполнить до субботы здесь",
      groupIds: [2, 3],
    },
    { id: 4, title: "Вводная лекция", description: "скачать", groupIds: [1] },
  ]);

  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<News | null>(null);

  const groupsById = useMemo(
    () => Object.fromEntries(mockGroups.map((g) => [g.id, g.name])),
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return news;
    return news.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        (n.description || "").toLowerCase().includes(q)
    );
  }, [news, query]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (id: number) => {
    const item = news.find((n) => n.id === id) || null;
    setEditing(item);
    setModalOpen(true);
  };

  const handleSave = (payload: Omit<News, "id"> & { id?: number }) => {
    if (payload.id) {
      setNews((prev) =>
        prev.map((n) => (n.id === payload.id ? { ...n, ...payload } as News : n))
      );
    } else {
      const id = Date.now();
      setNews((prev) => [...prev, { ...payload, id } as News]);
    }
    setModalOpen(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.titleBar}>Новости</div>

      <div className={styles.list}>
        {filtered.map((n) => (
          <NewsItem
            key={n.id}
            id={n.id}
            title={n.title}
            description={n.description}
            fileUrl={n.fileUrl}
            testId={n.testId}
            groupNames={n.groupIds.map((id) => groupsById[id]).filter(Boolean)}
            onEdit={openEdit}
          />
        ))}
      </div>

      <div className={styles.controlsRow}>
        <div className={styles.searchBox}>
          <input
            className={styles.searchInput}
            placeholder="Поиск"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className={styles.searchIcon} aria-hidden>🔍</span>
        </div>

        <button className={styles.addBtn} onClick={openCreate}>
          Добавить новость
        </button>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <NewsForm
          groups={mockGroups}
          tests={mockTests}
          initial={editing ?? undefined}
          onSubmit={handleSave}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
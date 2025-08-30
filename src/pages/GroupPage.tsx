// src/pages/GroupsPage.tsx
import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Context } from '../context/index.ts';
import PostList from "../components/PostList";
import type {IGroup} from '../components/ui/interfaces/IGroup.tsx'
import styles from "./GroupsPage.module.css"
import GroupItem from "@/components/Group.tsx";
import { useFetching } from "../hooks/useFetching.ts";
import { useNavigate } from "react-router-dom";

export default function GroupsPage() {
    const navigate = useNavigate();
    const [groups, setGroups] = useState<IGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const {store} = useContext(Context)
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState<string>("");
    const [busyId, setBusyId] = useState<number | null>(null); // блокируем кнопки на время запроса
    const [error, setError] = useState<string | null>(null);
    const [newName, setNewName] = useState("");
    const [creating, setCreating] = useState(false);
    const [fetching, isLoading, postError] = useFetching(async () => {
        try {
            const response = await store.getGroupList();
        if (response.status == 200 && response.data != null)
            setGroups(response.data);
        } catch (e: any) {
            setError(e?.message || "Не удалось загрузить группы");
        } finally {
            setLoading(false);
        }
    })
    const findGroup = (id : number)=> groups.find((gr) => gr.id === id)
  // загрузка
    useEffect(() => {
        fetching();
    }, []);
    const handleArchive = async (id: number, isArchived: boolean) => {
        setBusyId(id);
        const selectedGroup = findGroup(id)
        if (!selectedGroup) return
        try {
            if (isArchived) {
                await store.unArchiveGroup(id);
                setGroups((prev) =>
                    prev.map((g) =>
                        g.id === id
                        ? { ...g, archived_at: !isArchived ? new Date().toISOString() : undefined }
                        : g
                    )
                );
            } else {
                await store.archiveGroup(id);
                setGroups((prev) =>
                    prev.map((g) =>
                        g.id === id
                        ? { ...g, archived_at: !isArchived ? new Date().toISOString() : undefined }
                        : g
                    )
                );
            }
        } catch (e: any) {
            setError(e?.message || "Не удалось изменить статус группы");
        } finally {
            setBusyId(null);
        }
    };
  const handleRename = async (id: number, name: string) => {
    setBusyId(id);
    let updatedGroup = findGroup(id)
    if (!updatedGroup) return
    updatedGroup.name = name
    try {
      await store.updateGroup(updatedGroup);
      setGroups((prev) => prev.map((x) => (x.id === id ? { ...x, ...updatedGroup } : x)));
    } catch (e: any) {
      setError(e?.message || "Не удалось переименовать группу");
    } finally {
      setBusyId(null);
    }
  };
  
  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await store.createGroup({name : newName.trim()});
      fetching();
      setNewName("");
    } catch (e: any) {
      setError(e?.message || "Не удалось создать группу");
    } finally {
      setCreating(false);
    }
  };
  const goToGroupStudents = (id : number) => {
    navigate(`/users/${id}`)
  }

  if (loading) return <div className={styles.loading}>Загрузка…</div>;

  return (
    <div className={styles.wrapper}>
      {/* форма создания */}
      <div className={styles.newGroup}>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Введите название группы"
          className={styles.input}
        />
        <button
          onClick={handleCreate}
          disabled={creating}
          className={styles.btn}
        >
          Добавить
        </button>
      </div>

      <div className={styles.list}>
        <PostList<IGroup> posts={groups} title={"Список групп"} renderItem={(g, index) => (
            <GroupItem 
            key={g.id}
            group={g}
            busyId={busyId}
            onRename={handleRename}
            onArchive={handleArchive}
            onClick={goToGroupStudents}
            ></GroupItem>)
            }>
        </PostList>

      </div>

      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}

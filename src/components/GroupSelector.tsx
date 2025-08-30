import React, { useState } from "react";
import styles from "./styles/GroupSelector.module.css";
import type {IGroup} from '../components/ui/interfaces/IGroup.tsx'


interface Props {
  groups: IGroup[];                // все группы для выбора
  setSelectedGroups: (selected: IGroup[]) => void; // callback при изменении выбора
}

const GroupSelector: React.FC<Props> = ({ groups, setSelectedGroups }) => {
  const [selected, setSelected] = useState<IGroup[]>([]);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const groupId = Number(e.target.value);
    const group = groups.find((g) => g.id === groupId);
    if (group && !selected.find((s) => s.id === group.id)) {
      const newSelected = [...selected, group];
      setSelected(newSelected);
      setSelectedGroups(newSelected);
    }
    e.target.value = ""; // сброс выбора
  };

  const handleRemove = (id: number) => {
    const newSelected = selected.filter((g) => g.id !== id);
    setSelected(newSelected);
    setSelectedGroups(newSelected);
  };

  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>Для групп:</label>
      <select className={styles.select} onChange={handleSelect} defaultValue="">
        <option value="" disabled>
          добавьте группу
        </option>
        {groups.map((group) => (
          <option key={group.id} value={group.id}>
            {group.name}
          </option>
        ))}
      </select>

      <div className={styles.tags}>
        {selected.map((group) => (
          <div key={group.id} className={styles.tag}>
            {group.name}
            <button
              className={styles.closeBtn}
              onClick={() => handleRemove(group.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupSelector;

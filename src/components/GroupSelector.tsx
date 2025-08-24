import React from "react";
import type { IGroup } from "../pages/GradesheetCreation.tsx";

interface Props {
  groups: IGroup[];
  selectedGroups: number[];
  setSelectedGroups: (ids: number[]) => void;
}

const GroupSelector: React.FC<Props> = ({ groups, selectedGroups, setSelectedGroups }) => {
  const toggleGroup = (id: number) => {
    if (selectedGroups.includes(id)) {
      setSelectedGroups(selectedGroups.filter(g => g !== id));
    } else {
      setSelectedGroups([...selectedGroups, id]);
    }
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <h2>Выберите группы</h2>
      {groups.map(group => (
        <label key={group.id} style={{ display: "block" }}>
          <input
            type="checkbox"
            checked={selectedGroups.includes(group.id)}
            onChange={() => toggleGroup(group.id)}
          />{" "}
          {group.name}
        </label>
      ))}
    </div>
  );
};

export default GroupSelector;

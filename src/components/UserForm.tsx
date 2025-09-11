import React, { useEffect, useState } from "react";
import styles from "./styles/UserForm.module.css";
import { type IPerson } from "./ui/interfaces/IPerson.tsx";
import { SelectList } from "./ui/select/Select.tsx";
import type { IGroup } from "./ui/interfaces/IGroup.tsx";

interface Props {
  user: IPerson;
  onSave: (updatedUser: IPerson) => void;
  groups: IGroup[];
}

const UserForm: React.FC<Props> = ({ user, onSave, groups }) => {
  const [formData, setFormData] = useState<IPerson>({ ...user });
  useEffect(() => {
    setFormData({ ...user });
  }, [user]);
  const handleChange = (field: keyof IPerson, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    console.log(formData);
  };
  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <label>
        Email:
        <input
          className={styles.formInput}
          type="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          disabled
        />
      </label>
      <br />

      <label>
        Имя:
        <input
          className={styles.formInput}
          type="text"
          value={formData.first_name}
          onChange={(e) => handleChange("first_name", e.target.value)}
        />
      </label>
      <br />

      <label>
        Фамилия:
        <input
          className={styles.formInput}
          type="text"
          value={formData.last_name}
          onChange={(e) => handleChange("last_name", e.target.value)}
        />
      </label>
      <br />

      <label>
        Отчество:
        <input
          className={styles.formInput}
          type="text"
          value={formData.patronymic}
          onChange={(e) => handleChange("patronymic", e.target.value)}
        />
      </label>
      <br />
      <label>
        Группа:
        <SelectList
          className={styles.formInput}
          name="group_id"
          options={groups.map((g) => ({
            label: g.name,
            value: g.id.toString(),
          }))}
          value={formData.group_id}
          onChange={(value) => handleChange("group_id", value)}
          placeholder="Выберите группу"
        />
      </label>
      <button type="submit" className={styles.btn}>
        Сохранить
      </button>
    </form>
  );
};

export default UserForm;

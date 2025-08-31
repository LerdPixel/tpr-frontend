import React, { useState } from "react";
import styles from "./styles/UserForm.module.css";
import { type IStudent } from "./ui/interfaces/IStudent.tsx";


interface Props {
  user: IStudent;
  onSave: (updatedUser: IStudent) => void;
}

const UserForm: React.FC<Props> = ({ user, onSave }) => {
  const [form, setForm] = useState<IStudent>(user);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "group_id" ? Number(value) : value, // group_id → число
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <label>
        Email:
        <input className={styles.formInput} type="email" name="email" value={form.email} onChange={handleChange} />
      </label>

      <label>
        Имя:
        <input className={styles.formInput} type="text" name="first_name" value={form.first_name} onChange={handleChange} />
      </label>

      <label>
        Фамилия:
        <input  className={styles.formInput} type="text" name="last_name" value={form.last_name} onChange={handleChange} />
      </label>

      <label>
        Отчество:
        <input className={styles.formInput} type="text" name="patronymic" value={form.patronymic} onChange={handleChange} />
      </label>

      <label>
        Группа:
        <input  className={styles.formInput} type="number" name="group_id" value={form.group_id} onChange={handleChange} />
      </label>

      <label>
        Роль:
        <select  className={styles.formSelect} name="role" value={form.role} onChange={handleChange}>
          <option value="student">Студент</option>
          <option value="teacher">Преподаватель</option>
          <option value="admin">Админ</option>
        </select>
      </label>

      <button type="submit" className={styles.btn}>Сохранить</button>
    </form>
  );
};

export default UserForm;

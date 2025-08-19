import React, { forwardRef, useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MyInput from "../components/ui/input/MyInput.tsx";
import MyButton from "../components/ui/button/MyButton.tsx";
import { SelectList } from "../components/ui/select/Select.tsx";
import { Context } from '../context/index.ts';
import { observer } from 'mobx-react-lite';
import { useFetching } from "../hooks/useFetching.ts";
import axios from "axios";

interface Group {
  id: number;
  name: string;
  created_at: string;
}



const Registration = () => {
  const [error, setError] = useState<string | null>(null);
  const {store} = useContext(Context)
  const [groups, setGroups] = useState<Group[]>([]);
  const [fetchingGroupList, isLoading, postError] = useFetching(async () => {
      const responce = await store.getGroupList();
      setGroups(responce.data);
  });
  async function printGroups() {
    let responce = await axios.get("/api/groups/").catch(() => setError("Не удалось загрузить список групп"))
    console.log(groups);
  }
  useEffect(() => {
    //axios.get<Group[]>("/api/groups/").then((res) => setGroups(res.data)).catch(() => setError("Не удалось загрузить список групп"));
    fetchingGroupList()
    document.body.classList.add("centered-body");
    return () => document.body.classList.remove("centered-body");
  }, []);
  /*useEffect(() => {
    document.body.classList.add("centered-body");
    return () => document.body.classList.remove("centered-body");
  }, []);*/
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    patronymic: "",
    email: "",
    password: "",
    confirmPassword: "",
    group: "",
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    store.setAuth(true);
    localStorage.setItem('auth', 'true')
  };
  
  return (
    <div className="container">
      <form onSubmit={handleSubmit} >
        <h1 className="title">Регистрация</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <MyInput placeholder="Имя" value={formData.firstName} onChange={e => handleChange("firstName", e.target.value)} />
        <MyInput placeholder="Фамилия" value={formData.lastName} onChange={e => handleChange("lastName", e.target.value)}  />
        <MyInput placeholder="Отчество" value={formData.patronymic} onChange={e => handleChange("patronymic", e.target.value)}  />
        <MyInput placeholder="Email" value={formData.email} onChange={e => handleChange("email", e.target.value)} />
        <MyInput type="password" placeholder="Пароль" value={formData.password} onChange={e => handleChange("password", e.target.value)}  />
        <MyInput type="password" placeholder="Повторите пароль" value={formData.confirmPassword} onChange={e => handleChange("confirmPassword", e.target.value)}  />
        <div className="select_container">
        <SelectList 
          options={
            groups.map((g) => ({label: g.name, value : g.id}))
          }
          onChange={value => handleChange("group", value)}
          placeholder = "Группа"
        />
        </div>
        <MyButton type="submit" className="submit-button">
          Зарегистрироваться
        </MyButton>
        <Link className="text-btn" to="/login">Уже есть аккаунт (вход)</Link>
      </form>
    </div>
  )
}

export default observer(Registration)
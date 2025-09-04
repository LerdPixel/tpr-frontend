import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MyInput from "../components/ui/input/MyInput.tsx";
import MyButton from "../components/ui/button/MyButton.tsx";
import { SelectList } from "../components/ui/select/Select.tsx";
import { Context } from '../context/index.ts';
import { observer } from 'mobx-react-lite';
import { useFetching } from "../hooks/useFetching.ts";
import type {IGroup} from '../components/ui/interfaces/IGroup.tsx'

const Registration = () => {
  const [error, setError] = useState<string | null>(null);
  const {store} = useContext(Context)
  const [groups, setGroups] = useState<IGroup[]>([]);
  const [fetchingGroupList, isLoading, postError] = useFetching(async () => {
      const response = await store.getGroupList();
      if (response.status == 200) {
        console.log("OK");
        console.log(response);
        if (Array.isArray(response.data))
          setGroups(response.data);
        else {
          setError("Ошибка загрузки данных")
        }
      }
      else {
        setError("Ошибка подключения к серверу")
      }
  });
  useEffect(() => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.patronymic || 
        !formData.email || !formData.password || !formData.group) {
      setError('Пожалуйста, заполните все поля');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    try {
      const response = await store.registration({
        "email": formData.email,
        "first_name": formData.firstName,
        "group_id": Number(formData.group),
        "last_name": formData.lastName,
        "password": formData.password,
        "patronymic": formData.patronymic,
        "role": formData.group === "1" ? "seminarist" : "student",
      });
      
      if (response.status === 201) {
        store.writeTokens(response);
        store.setAuth(true);
      } else if (response.status === 400) {
        if (response.data.details === "Key: 'UserSignUpInput.Email' Error:Field validation for 'Email' failed on the 'email' tag") {
          setError('Некорректный формат email');
        } else {
          setError(response.data.details || 'Ошибка регистрации');
        }
      } else {
        setError(response.data.details || 'Ошибка регистрации');
      }
    } catch (error: any) {
      setError('Ошибка сети. Попробуйте позже.');
    }
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
          {!isLoading &&
        <SelectList
          options={
            groups.map((g) => ({label: g.name, value : g.id}))
          }
          onChange={value => handleChange("group", value)}
          placeholder = "Группа"
        /> }
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
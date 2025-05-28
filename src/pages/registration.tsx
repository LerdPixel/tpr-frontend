import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import MyInput from "../components/ui/input/MyInput.tsx";
import MyButton from "../components/ui/button/MyButton.tsx";
import { SelectList } from "../components/ui/select/Select.tsx";
import { AuthContext } from '../context/index.ts';

const Registration = () => {
    const {isAuth, setIsAuth} = useContext(AuthContext);
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
  };
  return (
    <div className="container">
      <form onSubmit={handleSubmit} >
        <h1 className="title">Регистрация</h1>

        <MyInput placeholder="Имя" value={formData.firstName} onChange={e => handleChange("firstName", e.target.value)} />
        <MyInput placeholder="Фамилия" value={formData.lastName} onChange={e => handleChange("lastName", e.target.value)}  />
        <MyInput placeholder="Отчество" value={formData.patronymic} onChange={e => handleChange("patronymic", e.target.value)}  />
        <MyInput placeholder="Email" value={formData.email} onChange={e => handleChange("email", e.target.value)} />
        <MyInput type="password" placeholder="Пароль" value={formData.password} onChange={e => handleChange("password", e.target.value)}  />
        <MyInput type="password" placeholder="Повторите пароль" value={formData.confirmPassword} onChange={e => handleChange("confirmPassword", e.target.value)}  />
        <SelectList 
          options={[
            { label: "Семинарист", value: "Семинарист" },
            { label: "Б14-889", value: "Б14-889" },
            { label: "Б22-228", value: "Б22-228" },
            { label: "Б22-229", value: "Б22-229" }
          ]}
          onChange={value => handleChange("group", value)}
          placeholder = "Группа"
        >

        </SelectList>

        <MyButton type="submit" className="submit-button">
          Зарегистрироваться
        </MyButton>
        <Link className="text-btn" to="/login">Уже есть аккаунт (вход)</Link>
      </form>
    </div>
  )
}

export default Registration
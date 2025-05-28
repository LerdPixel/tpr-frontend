import React, { useState } from "react";
import  './App.css'
import MyInput from "./components/ui/input/MyInput.tsx";
import MyButton from "./components/ui/button/MyButton.tsx";
import {Checkbox} from "./components/ui/checkbox/Checkbox.tsx";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./components/ui/select/Select.tsx";

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    patronymic: "",
    email: "",
    password: "",
    confirmPassword: "",
    group: "",
    isSeminarist: false,
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
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="title">Регистрация</h1>

        <MyInput placeholder="Имя" value={formData.firstName} onChange={e => handleChange("firstName", e.target.value)} />
        <MyInput placeholder="Фамилия" value={formData.lastName} onChange={e => handleChange("lastName", e.target.value)}  />
        <MyInput placeholder="Отчество" value={formData.patronymic} onChange={e => handleChange("patronymic", e.target.value)}  />
        <MyInput placeholder="Email" value={formData.email} onChange={e => handleChange("email", e.target.value)} />
        <MyInput type="password" placeholder="Пароль" value={formData.password} onChange={e => handleChange("password", e.target.value)}  />
        <MyInput type="password" placeholder="Повторите пароль" value={formData.confirmPassword} onChange={e => handleChange("confirmPassword", e.target.value)}  />

        <div className="flex items-center gap-4 mb-4">
          <Select onValueChange={value => handleChange("group", value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Группа" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">A</SelectItem>
              <SelectItem value="B">B</SelectItem>
              <SelectItem value="C">C</SelectItem>
            </SelectContent>
          </Select>

          {/* <div className="flex items-center space-x-2">
            <Checkbox id="seminarist" checked={formData.isSeminarist} onCheckedChange={value => handleChange("isSeminarist", Boolean(value))} />
            <label htmlFor="seminarist" className="text-sm">я семинарист</label>
          </div> */}
        </div>

        <MyButton type="submit" className="submit-button">
          Зарегистрироваться
        </MyButton>

        <p className="text-sm text-gray-500 text-center mt-4">Уже есть аккаунт (вход)</p>
      </form>
    </div>
  );
}

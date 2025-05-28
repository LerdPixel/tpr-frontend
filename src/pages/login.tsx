import React, { useContext, useState } from 'react'
import MyInput from "../components/ui/input/MyInput.tsx";
import MyButton from "../components/ui/button/MyButton.tsx";
import { AuthContext } from '../context/index.ts';
import { Link } from 'react-router-dom'
import { useEffect } from "react";

const Login = () => {
  useEffect(() => {
    document.body.classList.add("centered-body");
    return () => document.body.classList.remove("centered-body");
  }, []);

    const {isAuth, setIsAuth} = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));

  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setIsAuth(true);
    localStorage.setItem('auth', 'true')
  };
  return (
    <div className="form-body">
      <div className="container">
        <form onSubmit={handleSubmit} >
          <h1 className="title">Вход</h1>

          <MyInput placeholder="Email" value={formData.email} onChange={e => handleChange(e, "email", e.target.value)} />
          <MyInput type="password" placeholder="Пароль" value={formData.password} onChange={e => handleChange("password", e.target.value)}  />
          <MyButton type="submit" className="submit-button">
            Войти
          </MyButton>
          <div className="text-btn-container">
              <Link className="text-btn" to="/registration">Регистрация</Link>
              <Link className="text-btn" to="/registration">Восстановить пароль</Link>
          </div>
          
          

        </form>
      </div>
    </div>
  )
}

export default Login
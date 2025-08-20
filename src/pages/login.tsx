import React, { useContext, useState, type FC } from 'react'
import MyInput from "../components/ui/input/MyInput.tsx";
import MyButton from "../components/ui/button/MyButton.tsx";
import { Context } from '../context/index.ts';
import { Link } from 'react-router-dom'
import { useEffect } from "react";
import { observer } from 'mobx-react-lite';

const Login: FC = () => {
  useEffect(() => {
    document.body.classList.add("centered-body");
    return () => document.body.classList.remove("centered-body");
  }, []);  
  const [error, setError] = useState()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const {store} = useContext(Context)
  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      store.login(formData.email, formData.password)
    } catch(e) {
      setError(e.response?.data?.details)
      return
    }
    localStorage.setItem('auth', 'true')
  };
  return (
    <div className="form-body">
      <div className="container">
        <form onSubmit={handleSubmit} >
          <h1 className="title">Вход</h1>

          <MyInput placeholder="Email" value={formData.email} onChange={e => handleChange("email", e.target.value)} />
          <MyInput type="password" placeholder="Пароль" value={formData.password} onChange={e => handleChange("password", e.target.value)}  />
          <MyButton type="submit" className="submit-button">
            Войти
          </MyButton>
          <div className="text-btn-container">
              <Link className="text-btn" to="/registration">Регистрация</Link>
              <Link className="text-btn" to="/registration">Восстановить пароль</Link>
          </div>
        </form>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  )
}

export default observer(Login);
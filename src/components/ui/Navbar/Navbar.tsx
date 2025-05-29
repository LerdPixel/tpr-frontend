import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../../../context/index.ts'
import LogoutPng from '../../../imgs/door.png';
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const {isAuth, setIsAuth} = useContext(AuthContext);
  const logout = () => {
    setIsAuth(false);
    localStorage.removeItem('auth')
  }
  return (
    <div className='navbar'>
      <div className='navbar__left' >
        <div onClick={() => navigate('/menu')}>МЕНЮ</div>
        <div className='navbar__links'>
          <Link className='navbar__link' to="/about">О сайте</Link>
          <Link className='navbar__link' to="/users">Пользователи</Link>
        </div>
      </div>
      <div className='navbar__right'>
        {isAuth ?
         <>
            <span className='navbar__user'>Фамилия И.О.</span>
            <button className='navbar__logout-btn' onClick={logout} title="Выйти">
              <img src={LogoutPng} 
                alt="Logout"
                className="navbar__logout-icon"
                style={{ width: 36, height: 36 }}
              />
            </button>
        </>
        :
      <span className='navbar__user' onClick={() => {navigate('/login')} }>Вход</span>

          
        }
      </div>
    </div>
  )
}

export default Navbar;
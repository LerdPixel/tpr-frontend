import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext, Context } from '../../../context/index.ts'
import LogoutPng from '../../../imgs/door.png';
import { useNavigate } from "react-router-dom";
import { observer } from 'mobx-react-lite';

const Navbar = () => {
  const navigate = useNavigate();
  const {store} = useContext(Context);
  const [userInfo, setUserInfo] = useState(store.userInfo)
  const [userLoading, setUserLoading] = useState(true)
  const logout = () => {
    console.log("logout");
    store.logout();
  }
  useEffect(() => {
    const fetching = async () => {
      setUserLoading(true)
      try {
        const response = await store.getUserInfo()
        setUserInfo(response)
      } catch (e) {
        console.log(e.data);
      } finally {
        setUserLoading(false)
      }
    }
    if (store.isAuth)
      fetching()
  }, [store.isAuth])
  return (
    <div className='navbar'>
      <div className='navbar__left' >
        <div onClick={() => navigate('/menu')}>МЕНЮ</div>
        <div className='navbar__links'>
          <Link className='navbar__link' to="/news">О сайте</Link>
          <Link className='navbar__link' to="/users">Пользователи</Link>
        </div>
      </div>
      <div className='navbar__right'>
        {store.isAuth ?
         <>
            {userLoading || Object.keys(userInfo).length == 0 || <span className='navbar__user'>{`${userInfo.last_name} ${userInfo.first_name.substring(0, 1)}.${userInfo.patronymic.substring(0, 1)}.`}</span>}
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

export default observer(Navbar);
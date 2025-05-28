import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import MyButton from '../button/MyButton.tsx'
import { AuthContext } from '../../../context/index.ts'

const Navbar = () => {
  const {isAuth, setIsAuth} = useContext(AuthContext);
  const logout = () => {
    setIsAuth(false);
    localStorage.removeItem('auth')
  }
  return (
    <div className='navbar'>
        { isAuth &&
          <MyButton onClick={logout}>
            Logout
          </MyButton>
        }
        <div className='navbar__links'>
            <Link className='navbar__link' to="/about">About site</Link>
            <Link className='navbar__link' to="/posts">Posts</Link>
        </div>
    </div>
  )
}

export default Navbar
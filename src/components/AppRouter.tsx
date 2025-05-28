import { Navigate, Route, Routes } from 'react-router-dom';
import { privatRoutes, publicRoutes } from '../router/index.tsx';
import { useContext } from 'react';
import { AuthContext } from '../context/index.ts';
import Loader from './ui/Loader/loader.tsx';

const  AppRouter = () => {
  const {isAuth, isLoading} = useContext(AuthContext);
  if (isLoading) {
    return <Loader/>
  }
  return (
    isAuth ?
      <Routes>
        {
          privatRoutes.map(route => 
            <Route element={route.element} path = {route.path} key={route.path}/>
        )}
        <Route path="/*" element={<Navigate replace to="/about" />}/>
      </Routes>
        :
    <Routes>
        {
          publicRoutes.map(route => 
            <Route element={route.element} path = {route.path} key={route.path}/>
        )}
       <Route path="/*" element={<Navigate replace to="/registration" />} />
    </Routes>
  )
}

export default AppRouter;
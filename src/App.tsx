import  './styles/App.css'
import { createContext, useContext, useEffect, useState } from 'react';
import AppRouter from './components/AppRouter.tsx';
import Navbar from './components/ui/Navbar/Navbar.tsx';
import { BrowserRouter } from "react-router";
import { AuthContext, Context } from './context/index.ts';
import {observer} from 'mobx-react-lite'

const App = () => {
    const {store} = useContext(Context)
    useEffect(() => {
        if(localStorage.getItem('token')) {
            store.checkAuth()
        } 
        store.setLoading(false)
    }, [])
    return (
        <AuthContext.Provider value={{
            store
        }}>
            <BrowserRouter>
                <h1>{store.isAuth ? `user ${store.user.email}` : ''}</h1>
                <Navbar/> 
                <AppRouter/>
            </BrowserRouter>
        </AuthContext.Provider>  
    );
}
export default observer(App);
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
        console.log(store.getCookie("refresh"));
        store.refresh()
        store.setLoading(false)
    }, [])
    return (
        <AuthContext.Provider value={{
            store
        }}>
            <BrowserRouter>
                <Navbar/> 
                <AppRouter/>
            </BrowserRouter>
        </AuthContext.Provider>  
    );
}
export default observer(App);
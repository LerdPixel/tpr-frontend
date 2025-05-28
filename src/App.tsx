import  './App.css'
import { useEffect, useState } from 'react';
import AppRouter from './components/AppRouter.tsx';
import Navbar from './components/UI/Navbar/Navbar.tsx';
import { BrowserRouter } from "react-router";
import { AuthContext } from './context/index.ts';


const App = () => {
    const [isAuth, setIsAuth] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        if(localStorage.getItem('auth')) {
            setIsAuth(true)
        } 
        setIsLoading(false)
    }, [])
    return (
        <AuthContext.Provider value={{
            isAuth,
            setIsAuth,
            isLoading
        }}>
            <BrowserRouter>
                <Navbar/> 
                <AppRouter/>
            </BrowserRouter>
        </AuthContext.Provider>  
    );
}
export default App;
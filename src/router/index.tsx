import About from '../pages/About.tsx'
import Login from '../pages/login.tsx'
import Registration from '../pages/registration.tsx'

export const privatRoutes = [

    {path: '/about', element: <About/>,  exact: true},
]
export const publicRoutes = [
    {path: '/registration', element: <Registration/>,  exact: true},
    {path: '/login', element: <Login/>,  exact: true},
]
import About from '../pages/About.tsx'
import Login from '../pages/login.tsx'
import Menu from '../pages/Menu.tsx'
import Registration from '../pages/registration.tsx';
import PostIdPage from '../pages/PostIdPage.tsx'
import Posts from '../pages/Posts.tsx'


export const privatRoutes = [
    {path: '/posts', element: <Posts/>,  exact: true},
    {path: '/posts/:id', element: <PostIdPage/>,  exact: true},
    {path: '/menu', element: <Menu/>,  exact: true},    
    {path: '/about', element: <About/>,  exact: true},
]
export const publicRoutes = [
    {path: '/registration', element: <Registration/>,  exact: true},
    {path: '/login', element: <Login/>,  exact: true},
]
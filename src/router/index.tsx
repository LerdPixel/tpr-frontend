import About from "../pages/About.tsx";
import Login from "../pages/login.tsx";
import Menu from "../pages/Menu.tsx";
import Registration from "../pages/registration.tsx";
import PostIdPage from "../pages/PostIdPage.tsx";
import Posts from "../pages/Posts.tsx";
import Gradesheet from "../pages/Gradesheet.tsx";
import QuestionCreator from "../pages/Test.tsx";
import GradesheetCreation from "../pages/GradesheetCreation.tsx";

export const privatRoutes = [
  { path: "/users", element: <Posts />, exact: true },
  { path: "/users/:id", element: <PostIdPage />, exact: true },
  { path: "/menu", element: <Menu />, exact: true },
  { path: "/about", element: <About />, exact: true },
  { path: "/gradesheet", element: <Gradesheet />, exact: true },
  { path: "/tests", element: <QuestionCreator />, exact: true },
  { path: "/gradesheet_creation", element: <GradesheetCreation />, exact: true },
];
export const publicRoutes = [
  { path: "/registration", element: <Registration />, exact: true },
  { path: "/login", element: <Login />, exact: true },
];

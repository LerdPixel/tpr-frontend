import About from "../pages/About.tsx";
import Login from "../pages/login.tsx";
import Menu from "../pages/Menu.tsx";
import Registration from "../pages/registration.tsx";
import Posts from "../pages/Posts.tsx";
import Gradesheet from "../pages/Gradesheet.tsx";
import QuestionCreator from "../pages/QuestionCreator.tsx";
import GradesheetCreation from "../pages/GradesheetCreation.tsx";
import GroupsPage from "@/pages/GroupPage.tsx";
import News from "@/pages/News.tsx";
import Tests from "@/pages/Tests.tsx";
import Disciplines from "@/pages/Disciplines.tsx";

export const privateRoutes = [
  { path: "/users", element: <Posts />, exact: true },
  { path: "/users/:id", element: <Posts />, exact: true },
  { path: "/menu", element: <Menu />, exact: true },
  { path: "/about", element: <About />, exact: true },
  { path: "/gradesheet", element: <Gradesheet />, exact: true },
  {
    path: "/gradesheet_creation",
    element: <GradesheetCreation />,
    exact: true,
  },
  { path: "/groups", element: <GroupsPage />, exact: true },
  { path: "/news", element: <News />, exact: true },
  { path: "/tests", element: <Tests />, exact: true },
  { path: "/disciplines", element: <Disciplines />, exact: true },
];
export const publicRoutes = [
  { path: "/registration", element: <Registration />, exact: true },
  { path: "/login", element: <Login />, exact: true },
  { path: "/tests", element: <Tests />, exact: true },
];

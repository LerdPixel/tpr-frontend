import { Navigate, Route, Routes } from "react-router-dom";
import { privateRoutes, publicRoutes } from "../router/index.tsx";
import { useContext } from "react";
import { Context } from "../context/index.ts";
import Loader from "./ui/Loader/loader.tsx";
import { observer } from "mobx-react-lite";

const AppRouter = () => {
  const { store } = useContext(Context);
  if (store.isLoading) {
    return (
      <>
        <Loader />
      </>
    );
  }
  return store.isAuth ? (
    <Routes>
      {privateRoutes.map((route) => (
        <Route element={route.element} path={route.path} key={route.path} />
      ))}
      <Route path="/*" element={<Navigate replace to="/news" />} />
    </Routes>
  ) : (
    <Routes>
      {publicRoutes.map((route) => (
        <Route element={route.element} path={route.path} key={route.path} />
      ))}
      <Route path="/*" element={<Navigate replace to="/login" />} />
    </Routes>
  );
};

export default observer(AppRouter);

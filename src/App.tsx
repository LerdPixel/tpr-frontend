import "./styles/App.css";
import { useContext, useEffect } from "react";
import AppRouter from "./components/AppRouter.tsx";
import Navbar from "./components/ui/Navbar/Navbar.tsx";
import { BrowserRouter } from "react-router";
import { AuthContext, Context } from "./context/index.ts";
import { observer } from "mobx-react-lite";

const App = () => {
  const { store } = useContext(Context);
  useEffect(() => {
    store.refresh().finally(() => {
      store.setLoading(false);
    });
  }, []);
  return (
    <AuthContext.Provider
      value={{
        store,
      }}
    >
      <BrowserRouter>
        <Navbar />
        <AppRouter />
      </BrowserRouter>
    </AuthContext.Provider>
  );
};
export default observer(App);

import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Context } from "../../../context/index.ts";
import LogoutPng from "../../../imgs/door.png";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

const Navbar = () => {
  const navigate = useNavigate();
  const { store } = useContext(Context);

  const logout = () => {
    console.log("logout");
    store.logout();
  };

  const renderUserName = () => {
    if (!store.person) return null;

    const { last_name, first_name, patronymic } = store.person;
    return `${last_name} ${first_name.substring(0, 1)}.${patronymic.substring(
      0,
      1
    )}.`;
  };

  return (
    <div className="navbar">
      <div className="navbar__left">
        <div onClick={() => navigate("/menu")}>МЕНЮ</div>
        <div className="navbar__links">
          <Link className="navbar__link" to="/news">
            О сайте
          </Link>
          <Link className="navbar__link" to="/users">
            Пользователи
          </Link>
        </div>
      </div>
      <div className="navbar__right">
        {store.isAuth ? (
          <>
            {store.person && (
              <span className="navbar__user">{renderUserName()}</span>
            )}
            <button
              className="navbar__logout-btn"
              onClick={logout}
              title="Выйти"
            >
              <img
                src={LogoutPng}
                alt="Logout"
                className="navbar__logout-icon"
                style={{ width: 36, height: 36 }}
              />
            </button>
          </>
        ) : (
          <span
            className="navbar__user"
            onClick={() => {
              navigate("/login");
            }}
          >
            Вход
          </span>
        )}
      </div>
    </div>
  );
};

export default observer(Navbar);

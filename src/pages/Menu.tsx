import React from "react";
import { useNavigate } from "react-router-dom";

const menuItems = [
  { label: "Новости", link: "/news" },
  { label: "Дисциплины", link: "/disciplines" },
  { label: "Тесты", link: "/tests" },
  { label: "Вопросы", link: "/questions" },
  { label: "Лабораторные работы", link: "/labs" },
  { label: "Группы", link: "/groups" },
  { label: "Студенты", link: "/users" },
  { label: "Лекции", link: "/lectures" },
  { label: "Ведомость", link: "/gradesheet" },
];

const Menu: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        paddingTop: 80,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: "#e3e3e3",
          width: 600,
          margin: "0 auto 32px auto",
          padding: "16px 0",
          textAlign: "center",
          fontSize: 32,
          fontWeight: 700,
        }}
      >
        Меню преподавателя
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          width: 400,
          margin: "0 auto",
        }}
      >
        {menuItems.map((item) => (
          <button
            key={item.label}
            style={{
              background: "#0056a6",
              color: "#fff",
              border: "none",
              borderRadius: 0,
              padding: "18px 0",
              fontSize: 26,
              fontWeight: 600,
              cursor: "pointer",
              width: "100%",
            }}
            onClick={() => {
              navigate(item.link);
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Menu;

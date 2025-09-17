import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { Context } from "../context/index.ts";

const adminMenuItems = [
  { label: "Новости", link: "/news" },
  { label: "Дисциплины", link: "/disciplines" },
  { label: "Тесты", link: "/tests" },
  { label: "Вопросы", link: "/questions" },
  { label: "Лабораторные работы", link: "/labs" },
  { label: "Группы", link: "/groups" },
  { label: "Студенты", link: "/users" },
  { label: "Материалы", link: "/materials" },
];
const seminaristMenuItems = [
  { label: "Новости", link: "/news" },
  { label: "Дисциплины", link: "/disciplines" },
  { label: "Тесты", link: "/tests" },
  { label: "Лабораторные работы", link: "/labs" },
  { label: "Группы", link: "/groups" },
  { label: "Студенты", link: "/users" },
  { label: "Материалы", link: "/materials" },
];
const studentMenuItems = [
  { label: "Новости", link: "/news" },
  { label: "Дисциплины", link: "/disciplines" },
  { label: "Мои тесты", link: "/student-tests" },
  { label: "Лабораторные работы", link: "/labs" },
  { label: "Лекции", link: "/lectures" },
  { label: "Материалы", link: "/materials" },
];

const Menu: React.FC = () => {
  const navigate = useNavigate();
  const { store } = useContext(Context);
  const [menuItems, setMenuItems] = useState(studentMenuItems);
  const [menuHeader, setMenuHeader] = useState("");
  useEffect(() => {
    if (store.role === "seminarist") {
      setMenuItems(seminaristMenuItems);
      setMenuHeader("Меню преподавателя");
    } else if (store.role === "admin") {
      setMenuItems(adminMenuItems);
      setMenuHeader("Меню админариста");
    } else if (store.role === "student") {
      setMenuItems(studentMenuItems);
      setMenuHeader("Меню студента");
    } else {
      setMenuHeader("Меню неподтвержденного пользователя");
    }
  }, [store.role]);

  // Set body overflow to hidden for this page
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";

    // Cleanup function to restore scrolling when leaving the page
    return () => {
      document.body.style.overflow = "auto";
      document.body.style.height = "auto";
    };
  }, []);

  return (
    <div
      style={{
        height: "calc(100vh - 56px)", // Full viewport height minus navbar
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
        padding: "min(20px, 2vh) 20px",
      }}
    >
      <div
        style={{
          background: "#e3e3e3",
          width: "min(600px, 90vw)",
          margin: "0 auto min(32px, 3vh) auto",
          padding: "min(16px, 2vh) 0",
          textAlign: "center",
          fontSize: "min(32px, 6vw, 4vh)",
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {menuHeader}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "min(20px, 1.5vh)",
          width: "min(400px, 80vw)",
          margin: "0 auto",
          flex: 1,
          justifyContent: "center",
          maxHeight: "calc(100vh - 200px)", // Reserve space for header and padding
          overflow: "hidden",
        }}
      >
        {menuItems.map((item) => {
          // Calculate dynamic button height based on available space and number of items
          const availableHeight = `calc((100vh - 200px - ${
            (menuItems.length - 1) * 20
          }px) / ${menuItems.length})`;
          const minButtonHeight = "20px";
          const maxButtonHeight = "80px";

          return (
            <button
              key={item.label}
              style={{
                background: "#0056a6",
                color: "#fff",
                border: "none",
                borderRadius: 0,
                padding: "min(18px, 2vh) 0",
                fontSize: "min(26px, 5vw, 3vh)",
                fontWeight: 600,
                cursor: "pointer",
                width: "100%",
                transition: "background-color 0.2s ease",
                height: `clamp(${minButtonHeight}, ${availableHeight}, ${maxButtonHeight})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor =
                  "#003d7a";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor =
                  "#0056a6";
              }}
              onClick={() => {
                navigate(item.link);
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default observer(Menu);

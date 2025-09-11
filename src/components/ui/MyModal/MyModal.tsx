import React, { type ReactNode } from "react";
import cl from "./MyModal.module.css";

interface Props {
  children: ReactNode;
  visible: boolean;
  setVisible: (state: boolean) => void;
}

const MyModal = ({ children, visible, setVisible }: Props) => {
  const rootClasses = [cl.myModal];
  if (visible) {
    rootClasses.push(cl.active);
  }
  return (
    <div className={rootClasses.join(" ")} onClick={() => setVisible(false)}>
      <div className={cl.myModalContent} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default MyModal;

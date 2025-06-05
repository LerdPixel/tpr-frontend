import { useMemo } from "react";
import MyButton from "./ui/button/MyButton.tsx";
import classes from "./item.module.css";
import { useNavigate } from "react-router-dom";

const PostItem = (props) => {
  const router = useNavigate();
  function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
  }
  const GetGroup2 = useMemo(() => {
    const firstLet = ["Б", "C", "М"];
    return (
      firstLet[getRandomInt(firstLet.length)] +
      String(getRandomInt(99)) +
      "-" +
      String(getRandomInt(999))
    );
  }, []);
  const GetGroup = useMemo(() => {
    const initialList = ["Б23-677", "Б23-807", "C22-793", "М24-102"];
    return initialList[getRandomInt(initialList.length)];
  }, []);
  return (
    <div className="post" ref={props.ref}>
      <div className="post__content">
        <strong>{props.post.title}</strong>
        <div>{GetGroup}</div>
      </div>
      <div className="post__btns">
        <MyButton
          onClick={() => router(`/posts/${props.post.id}`)}
          className={classes.post_btns}
        >
          Открыть
        </MyButton>
        <MyButton
          onClick={() => {
            props.remove(props.post);
          }}
          className={classes.post_btns}
        >
          Удалить
        </MyButton>
      </div>
    </div>
  );
};

export default PostItem;

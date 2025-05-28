import MyButton from "./button/MyButton.tsx";
import classes from "./item.module.css"
import {useNavigate} from 'react-router-dom'
const PostItem = (props) => {
  const router = useNavigate()
  
  return (
    <div className="post" ref={props.ref}>
      <div className="post__content">
        <strong>
          {props.post.id}. {props.post.title}
        </strong>
        <div>{props.post.body}</div>
      </div>
      <div className="post__btns">
        <MyButton onClick={() => router(`/posts/${props.post.id}`)} className={classes.post_btns}>Открыть</MyButton>
        <MyButton onClick={() => {props.remove(props.post)}} className={classes.post_btns}>Удалить</MyButton>
      </div>
    </div>
  );
};

export default PostItem;

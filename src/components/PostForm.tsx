import { useState } from "react";
import MyButton from "./ui/button/MyButton.tsx";
import MyInput from "./ui/input/MyInput.tsx";
import { type IPost } from "./ui/interfaces/IPost.tsx";

interface PostFormProps {
  create: (a: IPost) => void;
}

const PostForm = ({ create }: PostFormProps) => {
  const [post, setPost] = useState({ title: "", body: "" });

  const addNewPost = (e) => {
    e.preventDefault();
    const newPost = { id: Date.now(), ...post };
    create(newPost);
    setPost({ title: "", body: "" });
  };
  return (
    <form action="">
      <MyInput
        value={post.title}
        onChange={(e) => setPost({ ...post, title: e.target.value })}
        type="text"
        placeholder="ФИО"
      />
      <MyInput
        value={post.body}
        onChange={(e) => setPost({ ...post, body: e.target.value })}
        type="text"
        placeholder="Группа"
      />
      <MyButton onClick={addNewPost}>Создать студента</MyButton>
    </form>
  );
};

export default PostForm;

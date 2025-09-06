import { type IPerson } from "./ui/interfaces/IPerson.tsx";
import Student from "./Student.tsx";
import styles from "./styles/PostList.module.css";

interface Props<T> {
  posts: T[];
  title: string;
  renderItem: (item: T, index: number) => React.ReactNode;
}

const PostList = <T,>({ posts, title, renderItem, ...props }: Props<T>) => {
  if (!posts.length) {
    return <h1 style={{ textAlign: "center" }}>Ничего не было найдено</h1>;
  }

  return (
    <div className={styles.studentTable}>
      <h1 className={styles.studentTitle}>{title}</h1>
      <table>
        <tbody>{posts.map((post, index) => renderItem(post, index))}</tbody>
      </table>
    </div>
  );
};

export default PostList;

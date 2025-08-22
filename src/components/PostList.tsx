import { type IStudent } from "./ui/interfaces/IStudent.tsx";
import Student from "./Student.tsx";
import styles from "./styles/PostList.module.css";

interface Props {
  posts: IStudent[];
  title: string;
  remove?: (student: IStudent) => void;
  approve?: (student: IStudent) => void;
}

const PostList = ({ posts, title, remove, approve }: Props) => {
  if (!posts.length) {
    return <h1 style={{ textAlign: "center" }}>Студентов нет</h1>;
  }

  return (
    <div className={styles.studentTable}>
      <h1 className={styles.studentTitle}>{title}</h1>
      <table>
        <tbody>
          {posts.map((student, index) => (
            <Student key={student.id || index} student={student} remove={remove} approve={approve} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PostList;

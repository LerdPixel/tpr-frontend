import { useEffect, useRef, useState, useContext } from "react";
import Loader from "../components/ui/Loader/loader.tsx";
import MyModal from "../components/ui/MyModal/MyModal.tsx";
import PostFilter from "../components/PostFilter.tsx";
import PostForm from "../components/PostForm.tsx";
import PostList from "../components/PostList.tsx";
import MyButton from "../components/ui/button/MyButton.tsx";
import { useFetching } from "../hooks/useFetching.ts";
import { usePosts } from "../hooks/usePosts.ts";
import { type IStudent } from "../components/ui/interfaces/IStudent.tsx";
import { type Group } from "../components/ui/interfaces/IGroup.tsx";
import { getPageCount } from "../utils/pages.ts";
import { Outlet } from "react-router-dom";
import { useObserver } from "../hooks/useObserver.ts";
import { Context } from '../context/index.ts';
import Student from "../components/Student.tsx"

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState({ sort: "", query: "" });
  const [modal, setModal] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [groups, setGroups] = useState<Group[]>([])
  const sortedAndSearchedPosts = usePosts(posts, filter.sort, filter.query);
  const lastElement = useRef();
  const {store} = useContext(Context)

  const [fetching, isLoading, postError] = useFetching(async () => {
    const response = await store.getGroupList();
    if (response.status == 200) {
      if (Array.isArray(response.data))
        setGroups(response.data);
      else {
        console.log("Ошибка загрузки данных")
      }
    }
    const response2 = await store.getPending();
    let totalCount;
    if (Array.isArray(response2.data)) {
      setPosts([...response2.data]);
      totalCount = response2.data.length;
    }
    else {
      setPosts([...posts])
      totalCount = 0
    }

    console.log(groups);
    
    setTotalPages(getPageCount(totalCount, limit));
  });
  useObserver(lastElement, page < totalPages, isLoading, () => {
    setPage(page + 1);
  });

  useEffect(() => {
    fetching();
  }, [page]);

  const createPost = (newPost: IStudent) => {
    setPosts([...posts, newPost]);
    setModal(false);
  };
  const removeStudent = (student: IStudent) => {
    store.delete(student.id)
    setPosts(posts.filter((p: IStudent) => p.id !== student.id));
  };
  const approveStudent = (student: IStudent) => {
    store.approve(student.id)
    setPosts(posts.filter((p: IStudent) => p.id !== student.id));
  }
  const groupFromId = (id : number) => {
    const found = groups.find((el) => el.id == id)
    if (found != undefined) {
      return found.name
    }
    return "Группа не найдена"
  }
  async function getPending() {
    const response = await store.getPending()
    console.log(response);
  }
  const usersFromGroups = async (selectedGroups) => {
    console.log("pending", posts);
    
    const response = await store.getPending()
    let newPosts = response.data == null ? [] : response.data
    for (const group of selectedGroups) {
      const response = await store.getStudents(group.id) 
      if (response.status == 200) {
        if (response.data != null) {
          newPosts = [...newPosts, ...response.data]
        } 
      }
    }
    setPosts(newPosts)
  }
  return (
    <div className="App">
      <Outlet />
      <MyButton onClick={() => usersFromGroups(groups)}>
        Все студенты
      </MyButton>
      <MyButton style={{ marginTop: 30 }} onClick={() => setModal(true)}>
        Добавить пользователя
      </MyButton>
      <MyModal visible={modal} setVisible={setModal}>
        <PostForm create={createPost} />
      </MyModal>
      <PostFilter filter={filter} setFilter={setFilter} />
      {postError && (
        <h1 style={{ color: "red" }}>Произошла ошибка в {postError}</h1>
      )}
      <PostList<IStudent>
        posts={sortedAndSearchedPosts}
        title="Студенты"
        renderItem={(student, index) => (
          <Student key={student.id} student={student} remove={removeStudent} approve={approveStudent} groupFromId={groupFromId} />
        )}
      />
      <div ref={lastElement}></div>
      {isLoading && (
        <div
          style={{ display: "flex", justifyContent: "center", marginTop: 50 }}
        >
          {" "}
          <Loader />{" "}
        </div>
      )}
      {/* <Pagination page={page} changePage={changePage} totalPages={totalPages} /> */}
    </div>
  );
};
export default Posts;

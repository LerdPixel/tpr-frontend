import { useEffect, useRef, useState, useContext, useMemo } from "react";
import Loader from "../components/ui/Loader/loader.tsx";
import MyModal from "../components/ui/MyModal/MyModal.tsx";
import PostFilter from "../components/PostFilter.tsx";
import PostForm from "../components/PostForm.tsx";
import PostList from "../components/PostList.tsx";
import MyButton from "../components/ui/button/MyButton.tsx";
import { useFetching } from "../hooks/useFetching.ts";
import { usePosts } from "../hooks/usePosts.ts";
import { type IPerson } from "../components/ui/interfaces/IPerson.tsx";
import { type IGroup } from "../components/ui/interfaces/IGroup.tsx";
import { getPageCount } from "../utils/pages.ts";
import { Outlet, useParams } from "react-router-dom";
import { useObserver } from "../hooks/useObserver.ts";
import { Context } from "../context/index.ts";
import Student from "../components/Student.tsx";
import UserForm from "@/components/UserForm.tsx";
import styles from "@/styles/Posts.module.css";

function idsFromGroups(groups: IGroup[]) {
  return groups.map((gr) => gr.id);
}

const Posts = () => {
  const params = useParams();
  const initialReceive = {
    pending: !("id" in params),
    groups: "id" in params ? [Number(params.id)] : [],
    archived: false,
  };
  const [selectedUser, setSelectedUser] = useState<IPerson | null>(null);
  const [posts, setPosts] = useState<IPerson[]>([]);
  const [filter, setFilter] = useState({ sort: "", query: "" });
  const [receive, setReceive] = useState(initialReceive);
  const [modal, setModal] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [groups, setGroups] = useState<IGroup[]>([]);
  const sortedAndSearchedPosts = usePosts(posts, filter.sort, filter.query);
  const lastElement = useRef();
  const [groupsLoader, setGroupsLoader] = useState(true);
  const [postError, setPostError] = useState<string | null>(null);
  const { store } = useContext(Context);
  const notArchivedGroups = useMemo(
    () => groups.filter((gr) => !("archived_at" in gr)),
    [groups]
  );
  // const [fetching, isLoading, postError] = useFetching(async () => {
  //   const response = await store.getGroupList();
  //   if (response.status == 200 && Array.isArray(response.data)) {
  //     setGroups(response.data);
  //     if (receive.groups.length == 0)
  //       setReceive(prev => ({...prev, groups: idsFromGroups(response.data)}));
  //   }
  // })
  useEffect(() => {
    const fetching = async () => {
      const response = await store.getGroupList();
      if (response.status == 200 && Array.isArray(response.data)) {
        setGroups(response.data);
        if (receive.groups.length == 0)
          setReceive((prev) => ({
            ...prev,
            groups: idsFromGroups(response.data),
          }));
      }
    };
    fetching()
      .catch((e) => setPostError(e.message))
      .finally(() => setGroupsLoader(false));
  }, [params]);
  useEffect(() => {
    const fetchUsers = async () => {
      const pendingStudents = receive.pending ? await getPending() : [];
      console.log("useEFFECT Receive ", receive);
      if (Array.isArray(receive.groups)) {
        const students = await usersFromGroups(
          receive.archived
            ? receive.groups
            : receive.groups.filter((gr) => !("archived_at" in groupFromId(gr)))
        );
        setPosts([...pendingStudents, ...students]);
      }
    };
    if (!groupsLoader) fetchUsers();
  }, [receive, groupsLoader]);

  const createPost = (newPost: IPerson) => {
    setPosts([...posts, newPost]);
    setModal(false);
  };
  const removeStudent = (student: IPerson) => {
    store.delete(student.id);
    setPosts(posts.filter((p: IPerson) => p.id !== student.id));
  };
  const approveStudent = (student: IPerson) => {
    store.approve(student.id);
    setPosts(
      posts
        .filter((p: IPerson) => p.id !== student.id)
        .concat([{ ...student, is_approved: true }])
    );
  };
  const groupFromId = (id: number) => {
    const found = groups.find((el) => el.id == id);
    if (found != undefined) {
      return found;
    }
    return undefined;
  };
  const groupNameFromId = (id: number) =>
    groupFromId(id) == undefined ? "Группа не найдена" : groupFromId(id)!.name;
  const getPending = async () => {
    const response2 = await store.getPending();
    if (Array.isArray(response2.data)) {
      return response2.data;
    }
    return [];
  };
  const usersFromGroups = async (selectedGroups: number[]) => {
    let newPosts = [];
    for (const id of selectedGroups) {
      const response = await store.getStudents(id);
      if (response.status == 200) {
        if (response.data != null) {
          newPosts.push(...response.data);
        }
      }
    }
    return newPosts;
  };
  const clickOnStudent = (student: IPerson) => {
    setSelectedUser(student);
    setModal(true);
  };
  const editUser = async (student: IPerson) => {
    setModal(false);
    store.editUser(student);
    setPosts((prev) =>
      prev.map((st) => (st.id === student.id ? { ...st, ...student } : st))
    );
  };
  return (
    <div className={styles.wrapper}>
      <Outlet />
      <MyButton
        onClick={() =>
          setReceive({
            ...receive,
            pending: false,
            groups: idsFromGroups(groups),
          })
        }
      >
        Все студенты
      </MyButton>
      <MyButton
        style={{ marginTop: 30 }}
        onClick={() => setReceive({ ...receive, pending: true, groups: [] })}
      >
        Неподтверждённые
      </MyButton>
      {/* <MyButton style={{ marginTop: 30 }} onClick={() => setModal(true)}>
        Добавить пользователя
      </MyButton> */}
      {selectedUser && (
        <MyModal visible={modal} setVisible={setModal}>
          <UserForm
            user={selectedUser}
            onSave={editUser}
            groups={notArchivedGroups}
          />
        </MyModal>
      )}
      <PostFilter filter={filter} setFilter={setFilter} />
      {postError && (
        <h1 style={{ color: "red" }}>Произошла ошибка в {postError}</h1>
      )}
      <PostList<IPerson>
        posts={sortedAndSearchedPosts}
        title="Студенты"
        renderItem={(student, index) => (
          <Student
            key={student.id}
            student={student}
            remove={removeStudent}
            approve={approveStudent}
            groupFromId={groupNameFromId}
            onClick={clickOnStudent}
          />
        )}
      />
      <div ref={lastElement}></div>
      {groupsLoader && (
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

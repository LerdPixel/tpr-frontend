import { useEffect, useRef, useState, useContext } from "react";
import PostService from "../API/PostService.ts";
import Loader from "../components/ui/Loader/loader.tsx";
import MyModal from "../components/ui/MyModal/MyModal.tsx";
import PostFilter from "../components/PostFilter.tsx";
import PostForm from "../components/PostForm.tsx";
import PostList from "../components/PostList.tsx";
import MyButton from "../components/ui/button/MyButton.tsx";
import { useFetching } from "../hooks/useFetching.ts";
import { usePosts } from "../hooks/usePosts.ts";
import { type IPost } from "../components/ui/interfaces/IPost.tsx";
import Pagination from "../components/ui/pagination/Pagination.tsx";
import { getPageCount } from "../utils/pages.ts";
import { Outlet } from "react-router-dom";
import { useObserver } from "../hooks/useObserver.ts";
import { Context } from '../context/index.ts';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState({ sort: "", query: "" });
  const [modal, setModal] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const sortedAndSearchedPosts = usePosts(posts, filter.sort, filter.query);
  const lastElement = useRef();
  const {store} = useContext(Context)

  const [fetching, isLoading, postError] = useFetching(async () => {
    const responce = await PostService.getAll(limit, page);
    setPosts([...posts, ...responce.data]);
    const totalCount = responce.headers["x-total-count"];
    setTotalPages(getPageCount(totalCount, limit));
  });

  useObserver(lastElement, page < totalPages, isLoading, () => {
    setPage(page + 1);
  });

  useEffect(() => {
    fetching();
  }, [page]);

  const createPost = (newPost: IPost) => {
    setPosts([...posts, newPost]);
    setModal(false);
  };
  const removePost = (post: IPost) => {
    setPosts(posts.filter((p: IPost) => p.id !== post.id));
  };

  const changePage = (page) => {
    setPage(page);
  };
  async function getPending() {
    const responce = await store.getPending()
    console.log(responce);
  }
  return (
    <div className="App">
      <Outlet />
      <MyButton onClick={() => getPending()}>
        Нажмика
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
      <PostList
        remove={removePost}
        posts={sortedAndSearchedPosts}
        title={"Студенты"}
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

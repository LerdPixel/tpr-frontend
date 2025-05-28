import { useEffect, useRef, useState } from "react";
import PostService from "../API/PostService.ts";
import Loader from "../components/UIc/Loader/loader.tsx";
import MyModal from "../components/UIc/MyModal/MyModal.tsx";
import PostFilter from "../components/UIc/PostFilter";
import PostForm from "../components/UIc/PostForm";
import PostList from "../components/UIc/PostList";
import MyButton from "../components/UIc/button/MyButton.tsx";
import { useFetching } from "../hooks/useFetching.ts";
import { usePosts } from "../hooks/usePosts.ts";
import {type IPost} from "../components/UIc/interfaces/IPost.ts";
import Pagination from "../components/UIc/pagination/Pagination.tsx";
import { getPageCount } from "../utils/pages.ts";
import { Outlet } from "react-router-dom";
import { useObserver } from "../hooks/useObserver.ts";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState({ sort: "", query: "" });
  const [modal, setModal] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const sortedAndSearchedPosts = usePosts(posts, filter.sort, filter.query);
  const lastElement = useRef();

  const [fetching, isLoading, postError] = useFetching(async () => {
    const responce = await PostService.getAll(limit, page);
    setPosts([...posts, ...responce.data]);
    const totalCount = responce.headers["x-total-count"];
    setTotalPages(getPageCount(totalCount, limit));
  });

  useObserver(lastElement, page < totalPages, isLoading, () => {
    setPage(page + 1)
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
  return (
    <div className="App">
      <Outlet />
      <MyButton style={{ marginTop: 30 }} onClick={() => setModal(true)}>
        Создать объявление
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
        title={"Посты про ???"}
      />
      <div ref={lastElement} style={{ height: 20, background: "red" }}></div>
      {isLoading && (
        <div
          style={{ display: "flex", justifyContent: "center", marginTop: 50 }}
        >
          {" "}
          <Loader />{" "}
        </div>
      )}
      <Pagination page={page} changePage={changePage} totalPages={totalPages} />
    </div>
  );
};
export default Posts;
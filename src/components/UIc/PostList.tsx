import { TransitionGroup } from "react-transition-group";
import { CSSTransitionWithRef } from "./CSSTransitionUpgrade/CSSTransitionWithRef.tsx";
import {type IPost} from "./interfaces/IPost.ts";
import PostItem from "./PostItem.tsx";

interface Props {
  posts: IPost[];
  title: string;
  remove?: (post: IPost) => void;
}

const PostList = ({ posts, title, remove }: Props) => {
  if (!posts.length) {
    return <h1 style={{ textAlign: "center" }}>Постов нет</h1>;
  }

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>{title}</h1>
      <TransitionGroup>
        {posts.map((post, index) => (
          <CSSTransitionWithRef
            key={post.id}
            timeout={500}
            classNames="post"
            node
          >
            <PostItem remove={remove} number={index + 1} post={post} />
          </CSSTransitionWithRef>
        ))}
      </TransitionGroup>
    </div>
  );
};

export default PostList;

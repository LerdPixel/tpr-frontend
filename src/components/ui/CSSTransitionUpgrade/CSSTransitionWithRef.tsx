import { cloneElement, type ReactElement, useRef } from "react";
import { CSSTransition } from "react-transition-group";
import { type CSSTransitionProps } from "react-transition-group/CSSTransition";

type Props = Omit<CSSTransitionProps, "addEndListener"> & {
  // intended behavior: https://github.com/facebook/react/issues/31824
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: ReactElement<any>;
  addEndListener?: (node: HTMLElement, done: () => void) => void;
};
// returning CSSTransition with incerted refs
function CSSTransitionWithRef({ children, ...restProps }: Props) {
  const ref = useRef<HTMLElement>(null);

  const setRef = (value: HTMLElement | null) => {
    ref.current = value;
  };

  // Remove addEndListener if it exists to avoid type conflicts
  const { addEndListener, ...cleanProps } = restProps;

  return (
    <CSSTransition
      nodeRef={ref}
      addEndListener={(done) => {
        // Provide a dummy implementation
        setTimeout(done, 0);
      }}
      {...cleanProps}
    >
      {cloneElement(children, { ref: setRef })}
    </CSSTransition>
  );
}

export { CSSTransitionWithRef };

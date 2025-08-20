import { createContext } from "react";
import CookieStore from "../store/CookieStore";

const cookieStore = new CookieStore();

interface ICookieStore {
  cookieStore: CookieStore;
}

export const CookieContext = createContext<ICookieStore>({
  cookieStore,
});
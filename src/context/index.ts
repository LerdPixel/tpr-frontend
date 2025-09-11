import { createContext } from "react";
import Store from "../store/store.ts";

const store = new Store();

interface IStore {
    store: Store,
}

interface IAuthContext {
    store: Store,
}

export const Context = createContext<IStore>({
    store,
})

export const AuthContext = createContext<IAuthContext>({ store });




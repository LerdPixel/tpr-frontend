import {createContext} from 'react'
import Store from "../store/store.ts";

const store = new Store();

interface IStore {
    store: Store,
}

export const Context = createContext<IStore>({
    store,
})

export const AuthContext = createContext(null);
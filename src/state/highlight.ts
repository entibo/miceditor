
import { writable } from "svelte/store"
import { Store } from "state/util"
import * as Editor from "data/editor"

export default writable(new Set<Store<Editor.Object>>(), ()=>{})
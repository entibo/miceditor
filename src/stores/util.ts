
import * as S from "svelte/store"


function arrayReadable<T>(values: T[]) {
  let { set, update, subscribe } = S.readable<T>([])

}
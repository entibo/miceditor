
declare type Point = { x: number, y: number }
declare type Box = { p1: Point, p2: Point }

// https://stackoverflow.com/a/50375286/1183577
declare type UnionToIntersection<U> = 
  (U extends any ? (k: U)=>void : never) extends ((k: infer I)=>void) ? I : never




declare module "*.svelte"
declare module "fa-svelte"
declare module "svelte-i18n"



type foo = MouseEvent

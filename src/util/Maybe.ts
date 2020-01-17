
export const None: unique symbol = Symbol("None")
export type None = symbol // typeof None
export type Maybe<T> = T | None

export function is <A>(a: Maybe<A>): a is A {
  return a !== None
}


export const iffDefined: <A> (a: A | undefined | null) => Maybe<A>
  = a => (a === undefined || a === null) ? None : a

export const iff: <A> (fn: (a: A) => boolean) => (a: A) => Maybe<A>
  = fn => a => fn(a) ? a : None

export const unless: <A> (fn: (a: A) => boolean) => (a: A) => Maybe<A>
  = fn => a => !fn(a) ? a : None

export const withDefault: <A> (defaultValue: A) => (a: Maybe<A>) => A
  = defaultValue => a => is(a) ? a : defaultValue


/* export const map: <A,B> (a: Maybe<A>, fn: (a: A) => B) => Maybe<B>
  = (a, fn) => is(a) ? fn(a) : None */

/* export function map <S,T> (x: Maybe<S>, f: (y: S) => T): Maybe<T>
export function map <S,T0,T1> 
                (x: Maybe<S>, 
                  f0: (y0: S) => T0,
                  f1: (y1: T0) => T1,
                ): Maybe<T1>
export function map <S,T0,T1,T2> 
                (x: Maybe<S>, 
                  f0: (y0: S) => T0,
                  f1: (y1: T0) => T1,
                  f2: (y2: T1) => T2,
                ): Maybe<T2>
export function map <S> (x: Maybe<S>, ...fns: ((x: any) => any)[]): Maybe<any> {
  if(x === None) return None
  for(let fn of fns) x = fn(x)
  return x
} */

export function map <R,T0> 
                (f: (x0: T0) => Maybe<R>, x0: Maybe<T0>): R
export function map <R,T0,T1> 
                (f: (x0:T0, x1:T1) => Maybe<R>, x0: Maybe<T0>, x1: Maybe<T1>): R
export function map <R,T0,T1,T2> 
                (f: (x0:T0, x1:T1, x2:T2) => Maybe<R>, x0: Maybe<T0>, x1: Maybe<T1>, x2: Maybe<T2>): R
export function map <R> (f: (...args: any[]) => R, ...args: any[]): R {
  return f(...args)
}

//export function andThen <S> (x: Maybe<S>): <T> (f: (y: S) => Maybe<T>) => Maybe<T>
export function andThen <S,T> (x: Maybe<S>, f: (y: S) => Maybe<T>): Maybe<T>
export function andThen <S,T0,T1> 
                ( x: Maybe<S>, 
                  f0: (y0: S) => Maybe<T0>,
                  f1: (y1: T0) => Maybe<T1>,
                ): Maybe<T1>
export function andThen <S,T0,T1,T2> 
                ( x: Maybe<S>, 
                  f0: (y0: S) => Maybe<T0>,
                  f1: (y1: T0) => Maybe<T1>,
                  f2: (y2: T1) => Maybe<T2>,
                ): Maybe<T2>
export function andThen <S> (x: Maybe<S>, ...fns: ((x: any) => any)[]) {
  if(!fns.length) return x
  let y = x
  for(let fn of fns) {
    if(y === None) return None
    y = fn(y)
  }
  return y
}



export const bind: <S> (x: Maybe<S>) => <T> (f: (y: S) => Maybe<T>) => Maybe<T>
  = x => f => is(x) ? f(x) : None



export const pipe = <T extends any[], R>(
  fn1: (...args: T) => R,
  ...fns: Array<(a: R) => R>
) => {
  const piped = fns.reduce(
    (prevFn, nextFn) => (value: R) => nextFn(prevFn(value)),
    value => value
  );
  return (...args: T) => piped(fn1(...args));
};

/* export const andThen: <A,B> (a: Maybe<A>, fn: (a: A) => Maybe<B>) => Maybe<B>
  = (a, fn) => is(a) ? fn(a) : None */

export type Partial<T> = { [K in keyof T]: Maybe<T[K]> }

export function merge <T> (target: T, source: Partial<T>) {
  for(let k in source) {
    if(source[k] === None) continue
    target[k] = source[k] as T[Extract<keyof T, string>]
  }
  return target
}
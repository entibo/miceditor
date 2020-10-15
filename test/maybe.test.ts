
import * as M from "maybe/Maybe"
import * as util from "data/util"

const increment = (x: number) => x + 1
const even = (x: number) => x%2 === 0
const odd  = (x: number) => x%2 === 1

describe("iffDefined", () => {
  test("iffDefined(null) == None", 
    ()=> expect( M.iffDefined(null) ).toBe(M.None))
  test("iffDefined(undefined) == None", 
    ()=> expect( M.iffDefined(undefined) ).toBe(M.None))
  test("iffDefined(0) == 0", 
    ()=> expect( M.iffDefined(0) ).toBe(0))
  test("iffDefined('') == ''", 
    ()=> expect( M.iffDefined('') ).toBe(''))
  test("iffDefined([]) == []", 
    ()=> expect( M.iffDefined([]) ).toEqual([]))
})

describe("iff", () => {
  test("iff(even)(5) == None", 
    ()=> expect( M.iff(even)(5) ).toBe(M.None))
  test("iff(odd)(5) == 5", 
    ()=> expect( M.iff(odd)(5) ).toBe(5))
})

describe("unless", () => {
  test("unless(even)(5) == 5", 
    ()=> expect( M.unless(even)(5) ).toBe(5))
  test("unless(odd)(5) == M.None", 
    ()=> expect( M.unless(odd)(5) ).toBe(M.None))
})

function decodeInt(s: string | undefined): M.Maybe<number> {
  return M.andThen(s, M.iffDefined, util.readInt)
}

describe("andThen", () => {
  test("decodeInt(undefined) == None",
    ()=> expect( decodeInt(undefined) ).toBe(M.None))
  test("decodeInt('') == None",
    ()=> expect( decodeInt("") ).toBe(M.None))
  test("decodeInt('abc') == None",
    ()=> expect( decodeInt("abc") ).toBe(M.None))
  test("decodeInt('123') == 123",
    ()=> expect( decodeInt("123") ).toBe(123))

  test.each([undefined, '', 'abc', '123'])
    ("andThen(x, y, z) == andThen(andThen(x, y), z) | (x = %s)", s => {
      expect( M.andThen(s, M.iffDefined, util.readInt) )
        .toBe( M.andThen(M.andThen(s, M.iffDefined), util.readInt) )
    })
})

describe("map", () => {
  
  test("map(5, increment) == 6", () => {
    let m: M.Maybe<number> = 5
    expect(M.map(m, increment))
      .toBe(6)
  })
  test("map(None, increment) == None", () => {
    let m: M.Maybe<number> = M.None
    expect(M.map(m, increment))
      .toBe(M.None)
  })

  test.each(['', 'abc', '123', '5', '-15', '1000', '10000'])
    ("map(readInt(x), x => clamp(10, 3000)) | (x = %s)", s => {
      let int = parseInt(s)
      let expected = 
        isNaN(int) 
        ? M.None 
        : int < 10 
          ? 10
          : int > 3000
            ? 3000
            : int
      expect( M.map(util.readInt(s), x => util.clamp(x, 10, 3000)) )
        .toBe(expected)
    })
})
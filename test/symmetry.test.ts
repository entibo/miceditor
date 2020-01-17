
import * as Map from "../src/data/Map"




const samples = [
`<C><P /><Z><S /><D /><O /><L /></Z></C>`

]


test.each(samples)("xml == encode(decode(xml))", xml => {
  let map = Map.fromString(xml)
  let result = Map.toString(map)
  expect(result).toBe(xml)
})



import * as XML from "data/XML"
import * as Platform from "data/Platform"

import { normalizeSerializedXmlNode } from "../util"

const examples = [
  `<S foo="" c="3" L="264" H="126" X="357" N="" Y="292" T="0" P="0,0,0.3,0.2,15,0,0,0" />`
]

it("decodes", () => {
  let input = examples[0]
  let node = XML.parse(input)
  let platform = Platform.decode(node)
  console.log(platform)
  let output = XML.generate(Platform.encode(platform) as XML.Node)
  expect( normalizeSerializedXmlNode(output) ) 
    .toBe( normalizeSerializedXmlNode(input) )
})
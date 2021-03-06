
import * as XML from "./XML"
import * as MapSettings from "./MapSettings"
import * as Platform from "./Platform"
import * as Decoration from "./Decoration"
import * as ShamanObject from "./ShamanObject"
import * as Joint from "./Joint"

export interface Node extends XML.Node {
  name: "C",
  attributes: {},
  children: [
    MapSettings.Node,
    {
      name: "Z",
      attributes: {},
      children: [
        {
          name: "S",
          attributes: {},
          children: Platform.Node[]
        },
        {
          name: "D",
          attributes: {},
          children: Decoration.Node[]
        },
        {
          name: "O",
          attributes: {},
          children: ShamanObject.Node[]
        },
        {
          name: "L",
          attributes: {},
          children: Joint.Node[]
        },
      ]
    }
  ]
}

export interface Map {
  mapSettings: MapSettings.MapSettings
  platforms: Platform.Platform[]
  decorations: Decoration.Decoration[]
  shamanObjects: ShamanObject.ShamanObject[]
  joints: Joint.Joint[]
}

export function parse(str: string): Map {
  let C = XML.parse(str)
  let P, Z
  let S, D, O, L

  for(let e of C.children) {
    if(e.name === "P") P = e
    else if(e.name === "Z") Z = e
  }
  
  let mapSettings = P ? MapSettings.decode(P) : MapSettings.defaults()

  if(Z) {
    for(let e of Z.children) {
      if(e.name === "S") S = e
      else if(e.name === "D") D = e
      else if(e.name === "O") O = e
      else if(e.name === "L") L = e
    }
  }

  let platforms       = S ? S.children.map(Platform.decode)     : []
  let decorations     = D ? D.children.map(Decoration.decode)   : []
  let shamanObjects   = O ? O.children.map(ShamanObject.decode) : []
  let joints          = L ? L.children.map(Joint.decode)        : []

  return {
    mapSettings,
    platforms,
    decorations,
    shamanObjects,
    joints,
  }
}

export function serialize(map: Map): string {
  let tree: Node = {
    name: "C",
    attributes: [],
    children: [
      MapSettings.encode(map.mapSettings),
      {
        name: "Z",
        attributes: [],
        children: [
          {
            name: "S",
            attributes: [],
            children: map.platforms.map(Platform.encode)
          },
          {
            name: "D",
            attributes: [],
            children: map.decorations.map(Decoration.encode)
          },
          {
            name: "O",
            attributes: [],
            children: map.shamanObjects.map(ShamanObject.encode)
          },
          {
            name: "L",
            attributes: [],
            children: map.joints.map(Joint.encode)
          },
        ]
      }
    ]
  }
  return XML.generate(tree)
}

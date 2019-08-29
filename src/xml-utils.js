
function error(msg="Error") {
  throw msg
}

// Token types: < </ > /> = IDENTIFIER STRING
function tokenize(str) {
  let tokens = []
  let k = 0
  
  while(k < str.length) {
    let c = str[k]
    if(c === " " || c === "\t" || c === "\n") {
      k++
      continue
    }
    if(str.startsWith("</", k)) {
      k += 2
      tokens.push({ type: "</", value: "</" })
      continue
    }
    if(str.startsWith("/>", k)) {
      k += 2
      tokens.push({ type: "/>", value: "/>" })
      continue
    }
    if(c === "<") {
      k++
      tokens.push({ type: "<", value: "<" })
      continue
    }
    if(c === ">") {
      k++
      tokens.push({ type: ">", value: ">" })
      continue
    }
    if(c === "=") {
      k++
      tokens.push({ type: "=", value: "=" })
      continue
    }
    if(c === '"') {
      k++
      let value = ""
      while(k < str.length && str[k] !== '"') {
        value += str[k++]
      }
      if(k >= str.length || str[k++] !== '"')
        error("Missing end quote")
      tokens.push({ type: "STRING", value })
      continue
    }
    if(c.match(/[a-z0-9]/i)){
      let value = ""
      do {
        value += str[k++]
      } while(k < str.length && str[k].match(/[a-z0-9]/i))
      tokens.push({ type: "IDENTIFIER", value })
      continue
    }
    error("Unexpected character: "+c)
  }

  return tokens
}

export function parseXMLData(str) {
  let state = "ROOT"
  let rootNode = null
  let currentNode = null
  let nodeStack = []

  let tokens = tokenize(str)
  let currentTokenIndex = 0
  let eat = (type, value, errorMsg) => {
    if(currentTokenIndex >= tokens.length) {
      error("Unexpected end of file")
    }
    let t = tokens[currentTokenIndex++]
    if((type && type !== t.type) || (value && value !== t.value))
      error(errorMsg || `Expected '${value}' (${type}), got '${t.value}' (${t.type})`)
    return t
  }

  while(currentTokenIndex < tokens.length) {
    let t = eat()
    if(state === "ROOT") {
      if(t.type === "<") {
        state = "OPENING"
        rootNode = currentNode = { children: [] }
        currentNode.name = eat("IDENTIFIER").value
        continue
      }
      error("Expected '<' at beginning of file")
    }
    if(state === "NORMAL") {
      if(t.type === "<") {
        state = "OPENING"
        nodeStack.push(currentNode)
        currentNode.children.push(currentNode = { children: [] })
        currentNode.name = eat("IDENTIFIER").value
        continue
      }
      if(t.type === "</") {
        eat("IDENTIFIER", currentNode.name)
        eat(">")
        currentNode = nodeStack.pop()
        continue
      }
      error("Expected opening tag")
    }
    if(state === "OPENING") {
      if(t.type === "IDENTIFIER") {
        eat("=")
        currentNode[t.value] = eat("STRING").value
        continue
      }
      if(t.type === ">") {
        state = "NORMAL"
        continue
      }
      if(t.type === "/>") {
        state = "NORMAL"
        currentNode = nodeStack.pop()
        continue
      }
      error("Expected attribute or end of tag")
    }
  }

  return rootNode
}

export function xmlDataToString(node) {
  node._raw_old = node._raw
  let attributes = ""
  for(let [key, value] of Object.entries(node)) {
    if(key === "name" || key === "children" || key[0] === "_")
      continue
    attributes += ` ${key}="${value}"`
  }
  let str
  if(node.children.length === 0) {
    str = `<${node.name}${attributes}/>`
  }
  else {
    let children = node.children.map(xmlDataToString).join("")
    str = `<${node.name}${attributes}>${children}</${node.name}>`
  }
  node._raw = str
  // if(node._raw_old === undefined) node._raw_old = str
  return str
}


export function rotate(x, y, angle, cx=0, cy=0) {
  var radians = (Math.PI / 180) * angle,
      cos = Math.cos(radians),
      sin = Math.sin(radians),
      nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
      ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
  return [nx, ny];
}

function parseXMLColorHex(str) {
  if(!str)
    return ""
  if(str.length === 6)
    return str
  return "0".repeat(6-str.length) + str
}

function getFullTransformiceImageUrl(path) {
  let m 
  if(m = path.match(/^\/?([a-z0-9]+.png)/i))
    return "http://images.atelier801.com/"+m[1]
  return "http://transformice.com/images/"+path
}


export const mapBooleanProps = [
  { xmlName: "P", name: "_portals", titleKey: "allow-portals"},
  { xmlName: "C", name: "_collisions", titleKey: "enable-mouse-collisions"},
  { xmlName: "A", name: "_soulmate", titleKey: "soulmate-mode"},
  { xmlName: "N", name: "_night", titleKey: "night-mode"},
  { xmlName: "Ca", name: "_hideOffscreen", titleKey: "hide-offscreen"},
  { xmlName: "mc", name: "_hideNails", titleKey: "hide-anchors"},
  { xmlName: "bh", name: "_upwardsCannonballs", titleKey: "cannonballs-up"},
]
export function decodeMapData(object) {

  object._defilanteEnabled = object.defilante !== undefined
  let defilanteProps = (object.defilante || "").split(",")
  object._defilanteStartSpeed = parseFloat(defilanteProps[0] || 0)
  object._defilanteAcceleration = parseFloat(defilanteProps[1] || 0)
  object._defilanteMaxSpeed = parseFloat(defilanteProps[2] || 0)
  object._defilanteFreeScroll = defilanteProps[3] === undefined ? "1" : defilanteProps[3] === "1"

  object._width_max = object._defilanteEnabled ? 4800 : 1600
  object._height_max = 800

  object._width = parseInt(object.L) || 800
  object._width = Math.max(800, Math.min(object._width_max, object._width))
  object._height = parseInt(object.H) || 400
  object._height = Math.max(400, Math.min(object._height_max, object._height))

  object._backgroundImageId = "-1"
  if(object.F !== undefined) {
    object._backgroundImageId = object.F
  }

  for(let {xmlName,name} of mapBooleanProps) {
    object[name] = object[xmlName] !== undefined
  }

  let gravityProps = (object.G || "0,10").split(",")
  object._wind = parseFloat(gravityProps[0]) 
  object._gravity = parseFloat(gravityProps[1]) 

  object._shamanObjectsMass = parseInt(object.mgoc || "0")

  for(let [xmlName, name] of [["D", "_backgroundImages"], ["d", "_foregroundImages"]]) {
    object[name] = []
    if(object[xmlName] !== undefined && object[xmlName].length) {
      object[name] = 
        object[xmlName].split(";")
        .filter(s => s.trim().length)
        .map(s => {
          let [url,x,y] = s.split(",")
          x = parseInt(x || "0")
          y = parseInt(y || "0")
          return { 
            url, 
            fullUrl: getFullTransformiceImageUrl(url),
            x, y,  
          }
        })
        .reverse()
    }
  }

  object._disappearingImages = []
  if(object.APS !== undefined && object.APS.length) {
    object._disappearingImages =
      object.APS.split(";")
      .filter(s => s.trim().length)
      .map((s, index) => {
        let [url,something,rx,ry,rw,rh,x,y] = s.split(",")
        rx = parseInt(rx || "0")
        ry = parseInt(ry || "0")
        rw = parseInt(rw || "0")
        rh = parseInt(rh || "0")
        x = parseInt(x || "0")
        y = parseInt(y || "0")
        return { 
          url,
          something,
          fullUrl: getFullTransformiceImageUrl(url),
          x, y,  
          rx, ry, rw, rh,
          index
        }
      })
      .reverse()
  }

  // normal | multiple | random
  object._miceSpawn = { type: "normal" }
  if(object.DS) {
    try {
      let [left,right] = object.DS.split(";")
      if(left === "m") {
        let positions = []
        let xy = right.split(",")
        for(let i=0; i < xy.length; i+=2) {
          positions.push({
            x: xy[i]   || "0",
            y: xy[i+1] || "0",
          })
        }
        object._miceSpawn = {
          type: "multiple",
          positions,
        }
      }
      else if(left === "x" || left === "y") {
        object._miceSpawn = {
          type: "random",
          axis: left,
          value: right || (left === "x" ? "200" : "400"),
        }
      }
    } 
    catch(e) {}
  }


}

export function encodeMapData(object) {

  // let [maxWidth, maxHeight] = object.
  object.L = object._width.toString()
  if(object.L === "800") delete object.L
  object.H = object._height.toString()
  if(object.H === "400") delete object.H

  if(object._backgroundImageId !== undefined && object._backgroundImageId != -1) {
    object.F = object._backgroundImageId
  } else delete object.F

  for(let {xmlName,name} of mapBooleanProps) {
    if(object[name] === true) {
      object[xmlName] = ""
    } else delete object[xmlName]
  }

  object.G = [object._wind,object._gravity].map(x => x.toString()).join(",")
  if(object.G === "0,10") delete object.G

  if(object._shamanObjectsMass) {
    object.mgoc = object._shamanObjectsMass.toString()
  } else delete object.mgoc

  for(let [xmlName, name] of [["D", "_backgroundImages"], ["d", "_foregroundImages"]]) {
    if(object[name].length) {
      object[xmlName] = 
        object[name]
        .reverse()
        // .filter(({url}) => url)
        .map(({url,x,y}) => [url,x,y].join(","))
        .join(";")
    } else delete object[xmlName]
  }

  if(object._disappearingImages.length) {
    object.APS = 
      object._disappearingImages
      .reverse()
      .map(({url,something,rx,ry,rw,rh,x,y}) => [url,something,rx,ry,rw,rh,x,y].join(","))
      .join(";")
  } else delete object.APS

  if(object._miceSpawn.type !== "normal") {
    if(object._miceSpawn.type === "multiple") {
      let xy = object._miceSpawn.positions.map(({x,y}) => `${x},${y}`).join(",")
      object.DS = "m;"+xy
    }
    else if(object._miceSpawn.type === "random") {
      object.DS = `${object._miceSpawn.axis};${object._miceSpawn.value}`
    }
  } else delete object.DS

  if(object._defilanteEnabled) {
    object.defilante = [
      object._defilanteStartSpeed,
      object._defilanteAcceleration,
      object._defilanteMaxSpeed,
      object._defilanteFreeScroll ? "1" : "0",
    ].join(",")
  } else delete object.defilante

}


export const platformProperties = [
  "_z", "_width", "_height", "_x", "_y", "T", "_color", "_rotation", "_fixedRotation",
  "_dynamic", "_mass", 
  "_friction", "_restitution", 
  "_friction_default", "_restitution_default", "_rotation_default", 
  "_vanish", "_foreground", 
  "_linearDamping", "_angularDamping", "_miceCollision", "_groundCollision"
]

;[
  "wood", "ice", "trampoline", "chocolate", "cloud", 
  "earth", "grass", "snow", "lava", "water", "stone", 
  "sand", "cobweb",
  "rectangle", "circle",
  "invisible", 
]
export const groundTypes = [
  "wood", "ice", "trampoline", 
  "lava", "chocolate", 
  "earth", "grass",
  "sand", "cloud", "water",
  "stone", "snow", 
  "rectangle", "circle",
  "invisible", "cobweb",
]

export const platformDefaults  = (() => {
  let defaults = {}
  for(let type of groundTypes)
    defaults[type] = {}
  for(let [prop, details] of Object.entries({
    friction: {
      chocolate: 20,
      default: 0.3,
      sand: 0.1,
      snow: 0.05,
      trampoline: 0,
      ice: 0,
      lava: 0,
    },
    restitution: {
      lava: 20,
      trampoline: 1.2,
      default: 0.2,
      snow: 0.1,
      stone: 0,
    },
    rotation: { default: 0, },
    miceCollision: {
      cloud: false,
      default: true,
    },
    groundCollision: {
      default: true,
    },
  })) {
    for(let type of groundTypes)
      defaults[type][`_${prop}_default`] 
        = details[type] !== undefined ? details[type] : details.default
  }
  return defaults
})()

export function decodePlatformData(platform, index) {
  platform._objectType = "platform"
  platform._z = index

  // if(platform._raw && platform._raw !== platform._raw_old) return

  platform._type = platform.T
  platform._typeName = groundTypes[platform.T]
  // console.log("decoding a ", platform.T, platform._type, platform._typeName)

  Object.assign(platform, platformDefaults[platform._typeName])
  for(let [a,b,c] of [["_width","L",10],["_height","H",10],["_x","X",0],["_y","Y",0]]) {
    let v = c
    if(platform[a] !== undefined) {
      v = platform[a]
    }
    else if(platform[b]) {
      let int = parseInt(platform[b])
      if(!isNaN(int))
        v = int
    }
    if(b === "L" || b === "H")
      v = Math.max(10, Math.min(3000, v))
    platform[a] = v
  }
  
  platform._displayX = platform._x
  platform._displayY = platform._y
  if(platform._typeName !== "circle") {
    platform._displayX = Math.round(platform._displayX - platform._width/2)
    platform._displayY = Math.round(platform._displayY - platform._height/2)
  }
  platform._radius = platform._width
  if(["rectangle", "circle"].includes(platform._typeName)) {
    platform._color = parseXMLColorHex(platform.o)
    platform._displayColor = platform._color ? "#"+platform._color : "#324650"
  }
  else {
    delete platform._color
    delete platform._displayColor
  }

  // Dynamic, Mass, Friction, Resitution, Rotation, Fixed rotation, Linear damping, Angular damping
  let props = (platform.P || "0,0,0.3,0.2,0,0,0,0").split(",")

  if(!["water","cobweb"].includes(platform._typeName)) {

    platform._dynamic = props[0] === "1"
    platform._mass = parseFloat(props[1] || "0")
    platform._friction = props[2] ? parseFloat(props[2]) : platform._friction_default
    platform._restitution = props[3] ? parseFloat(props[3]) : platform._restitution_default
    platform._fixedRotation = props[5] === "1"
    platform._linearDamping = parseFloat(props[6] || "0")
    platform._angularDamping = parseFloat(props[7] || "0")
    
    platform._vanish = parseInt(platform.v || "0")
    
    platform._foreground = platform.N !== undefined
    
    if(platform.c && !isNaN(parseInt(platform.c))) {
      let c = 4 - parseInt(platform.c || "1")
      platform._miceCollision = !!(c & 1)
      platform._groundCollision = !!(c & 2)
    }
    else {
      platform._miceCollision = platform._miceCollision_default
      platform._groundCollision = platform._groundCollision_default
    }
  
  }
  else {
    let props = "dynamic,mass,friction,restitution,fixedRotation,linearDamping,angularDamping,vanish,foreground,miceCollision,groundCollision"
      .split(",").map(s => "_"+s)
    for(let prop of props) {
      delete platform[prop]
    }
  }

  if(platform._typeName !== "water") {
    platform._rotation = parseFloat(props[4] || "0")
  }
  else delete platform._rotation  

  platform._invisible = platform.m !== undefined

  platform._lua = platform.lua || ""

  platform._nosync = platform.nosync !== undefined

  platform._groundImageEnabled = false
  platform._groundImageUrl = ""
  platform._groundImageFullUrl = ""
  platform._groundImageX = 0
  platform._groundImageY = 0
  if(platform.i) {
    let props = platform.i.split(",")
    platform._groundImageEnabled = true
    platform._groundImageX = parseInt(props[0] || "0")
    platform._groundImageY = parseInt(props[1] || "0")
    platform._groundImageUrl = props[2] || ""
    platform._groundImageFullUrl = getFullTransformiceImageUrl(platform._groundImageUrl)
  }

  if(platform._typeName === "circle") {
    platform._boundingBox = {
      x1: -platform._radius,
      y1: -platform._radius,
      x2: +platform._radius,
      y2: +platform._radius,
    }
  }
  else {
    let rotation = platform._rotation || 0
    let [xtl,ytl] = rotate(-platform._width/2, -platform._height/2, rotation)
    let [xtr,ytr] = rotate(platform._width/2, -platform._height/2, rotation)
    let [xbl,ybl] = rotate(-platform._width/2, +platform._height/2, rotation)
    let [xbr,ybr] = rotate(platform._width/2, +platform._height/2, rotation)
    platform._boundingBox = {
      x1: Math.min(xtl, xtr, xbl, xbr),
      y1: Math.min(ytl, ytr, ybl, ybr),
      x2: Math.max(xtl, xtr, xbl, xbr),
      y2: Math.max(ytl, ytr, ybl, ybr),
    }
  }
  
}

export function encodePlatformData(platform) {
  platform.T = platform._type.toString()

  platform.L = Math.round(platform._width).toString()
  platform.H = Math.round(platform._height).toString()
  platform.X = Math.round(platform._x).toString()
  platform.Y = Math.round(platform._y).toString()

  if(platform._color !== undefined) {
    platform.o = platform._color
  } else delete platform.o

  platform.P = [
    (platform._dynamic || 0) ? "1" : "0",
    (platform._mass || 0).toString(),
    (platform._friction || 0).toString(),
    (platform._restitution || 0).toString(),
    ((platform._rotation || 0) % 360).toString(),
    (platform._fixedRotation || 0) ? "1" : "0",
    (platform._linearDamping || 0).toString(),
    (platform._angularDamping || 0).toString(),
  ].join(",")

  if(platform._vanish) {
    platform.v = platform._vanish.toString()
  } else delete platform.v

  if(platform._foreground) {
    platform.N = ""
  } else delete platform.N

  if(platform._miceCollision !== platform._miceCollision_default || platform._groundCollision !== platform._groundCollision_default) {
    let c = (4 - (platform._miceCollision | (platform._groundCollision << 1))).toString()
    platform.c = c
  } else delete platform.c

  if(platform._invisible) {
    platform.m = ""
  } else delete platform.m

  if(platform._lua && platform._lua.length) {
    platform.lua = platform._lua
  } else delete platform.lua

  if(platform._nosync) {
    platform.nosync = ""
  } else delete platform.nosync

  if(platform._groundImageEnabled) {
    platform.i = [
      platform._groundImageX.toString(),
      platform._groundImageY.toString(),
      platform._groundImageUrl,
    ].join(",")
  } else delete platform.i
}

import decorationMetadata from "./decorationMetadata.js"

export function decodeDecorationData(decoration, index) {
  decoration._objectType = "decoration"
  decoration._z = index

  // if(decoration._raw && decoration._raw === decoration._raw_old) return

  decoration._x = parseInt(decoration.X || "0")
  decoration._y = parseInt(decoration.Y || "0")

  if(decoration.name === "P") {
    decoration._type = decoration.T

    let metadata = decorationMetadata[decoration._type]
    let defaultColors = metadata.filters.map(x => x.defaultColor)
    let userColors = decoration.C ? decoration.C.split(",").map(parseXMLColorHex) : []
    decoration._numColors = defaultColors.length
    for(let i=0; i < 5; i++) {
      delete decoration["_color"+i]
      delete decoration["_displayColor"+i]
    }
    for(let i=0; i < defaultColors.length; i++) {
      let color = userColors[i] || defaultColors[i]
      decoration["_color"+i] = color
      decoration["_displayColor"+i] = "#"+color
    }

    let props = (decoration.P || "0,0").split(",")
    decoration._foreground = props[0] === "1"
    decoration._reverse = props[1] === "1"
  }
  else {
    decoration._type = decoration.name
    if(["DS", "DC", "DC2"].includes(decoration._type)) {
      decoration._unique = true
    }
  }

  if(decoration.name === "T" || decoration.name === "F") {
    decoration._foreground = decoration.N !== undefined
  }

  decoration._boundingBox = {
    x1: 0, 
    y1: 0, 
    x2: 0, 
    y2: 0,
  }

}

export function encodeDecorationData(decoration) {
  decoration.X = Math.round(decoration._x).toString()
  decoration.Y = Math.round(decoration._y).toString()

  if(decoration.name === "P") {
    decoration.T = decoration._type.toString()
    if(decoration._numColors) {
      let colors = []
      for(let i=0; i < decoration._numColors; i++) {
        colors.push(decoration["_color"+i])
      }
      decoration.C = colors.join(",")
    } else delete decoration.C
    decoration.P = [
      decoration._foreground ? "1" : "0",
      decoration._reverse ? "1" : "0",
    ].join(",")
  }

  if(decoration.name === "T" || decoration.name === "F") {
    if(decoration._foreground) {
      decoration.N = ""
    } else delete decoration.N
  }

}

import shamanObjectMetadata from "./shamanObjectMetadata.js"

export function decodeShamanObjectData(object, index) {
  object._objectType = "shamanObject"
  object._z = index

  // if(object._raw && object._raw === object._raw_old) return

  object._type = object.C

  object._x = parseInt(object.X || "0")
  object._y = parseInt(object.Y || "0")

  object._nosync = object.nosync !== undefined
  
  object._spriteData = shamanObjectMetadata[object._type]
  
  if(object._spriteData) {

    object._isNail = ["12","13","15","16"].includes(object._type)

    if(object._isNail) {
      object._nailPower = parseFloat(object.Mp || "0")
      object._nailSpeed = parseFloat(object.Mv || "0")
    }
    else {
      let props = (object.P || "0,0").split(",")
      object._rotation = parseFloat(props[0] || "0")
      object._ghost = props[1] === "1"
    }

    let w = object._spriteData.boundingWidth || object._spriteData.width
    let h = object._spriteData.boundingHeight || object._spriteData.height
    object._boundingBox = {
      x1: -w/2, 
      y1: -h/2, 
      x2: w/2, 
      y2: h/2,
    }
  }
  else {
    object._boundingBox = {
      x1: 0, 
      y1: 0, 
      x2: 0, 
      y2: 0,
    }
  }

}

export function encodeShamanObjectData(object) {
  object.C = object._type.toString()

  object.X = Math.round(object._x).toString()
  object.Y = Math.round(object._y).toString()

  object.P = [
    ((object._rotation||0) % 360).toString(),
    object._ghost ? "1" : "0",
  ].join(",")

  if(object._nosync) {
    object.nosync = ""
  } else delete object.nosync

  if(object._nailPower) {
    object.Mp = object._nailPower.toString()
  } else delete object.Mp
  if(object._nailSpeed) {
    object.Mv = object._nailSpeed.toString()
  } else delete object.Mv
}


export function decodeObjectData(object, index=0) {
  switch(object.name) {
    case "S":
      return decodePlatformData(object, index)
    case "P": case "T": case "F": case "DS": case "DC": case "DC2":
      return decodeDecorationData(object, index)
    case "O":
      return decodeShamanObjectData(object, index)
  }
  throw "Unknown object type, couldn't decode: "+JSON.stringify(object)
}

export function encodeObjectData(object) {
  switch(object._objectType) {
    case "platform":
      return encodePlatformData(object)
    case "decoration":
      return encodeDecorationData(object)
    case "shamanObject":
      return encodeShamanObjectData(object)
  }
  throw "Unknown object type, couldn't encode: "+object
}

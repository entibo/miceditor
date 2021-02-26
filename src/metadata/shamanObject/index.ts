
import { range } from "common"

type Dimensions = {
  width:  number
  height: number
  boundingWidth?:  number
  boundingHeight?: number
  circle?: boolean
}

type Sprite = Dimensions & {
  sprite: string
}
type Spritesheet = Dimensions & {
  spritesheet: string
  variants?: number[]
  isVariant: boolean
  offset: Point
}

export type Metadata 
  = (Sprite | Spritesheet) 
  & { defilanteVariant?: Sprite } 
  & { placeholder?: boolean
      placeholderData?: { 
        baseId: number
        invisibleId: number
      }
    }
      

const data = new Map<number, Metadata>()

export default {
  get: (type: number) =>
    data.get(type)
    || getPlaceholder(type)
    || {
      sprite: "unknown-shaman-object.png",
      width: 30,
      height: 30,
      boundingWidth: 30,
      boundingHeight: 30,
    },
  entries: () => [...data.entries()]
}

function getPlaceholder(t: number): Metadata | undefined {
  if((t >= 100 && t <= 199) || (t >= 20000 && t <= 29999))
    return {
      ...data.get(1)!,
      placeholder: true,
    }
  if((t >= 200 && t <= 299) || (t >= 30000 && t <= 32767))
    return {
      ...data.get(2)!,
      placeholder: true,
    }
  if(t >= 300 && t <= 399)
    return {
      ...data.get(3)!,
      placeholder: true,
    }
  if(t >= 400 && t <= 499)
    return {
      ...data.get(4)!,
      placeholder: true,
    }
  if(t >= 600 && t <= 699)
    return {
      ...data.get(6)!,
      placeholder: true,
    }
  if(t >= 700 && t <= 799)
    return {
      ...data.get(7)!,
      placeholder: true,
    }
  if(t >= 1700 && t <= 1799)
    return {
      ...data.get(17)!,
      placeholder: true,
    }
  if(t >= 2800 && t <= 3199)
    return {
      ...data.get(28)!,
      placeholder: true,
    }
  let base = parseInt(t.toString().slice(0,2))
  let meta = data.get(base)
  if(meta) {
    return {
      ...meta,
      placeholder: true,
    }
  }
}

function normalizeDimensions<T extends Dimensions>(value: T): T {
  if(value.boundingWidth === undefined)
    value.boundingWidth = value.width
  if(value.boundingHeight === undefined)
    value.boundingHeight = value.height
  return value
}

function setData(types: number | number[], arg: Metadata | ((t: number) => Metadata)) {
  if(!(types instanceof Array))
    types = [types]

  for(let type of types) {
    let value = (typeof arg === "function") ? arg(type) : arg
    value = normalizeDimensions(value)
    data.set(type, value)
  }
}

function setDefilanteVariant(type: number, sprite: Sprite) {
  let value = data.get(type)
  if(!value) throw "Couldn't set defilante variant on unknown type: "+type
  value.defilanteVariant = normalizeDimensions(sprite)
}


setData(0, {
  sprite: "arrow.png",
  width: 27, height: 31,
})
setData([1, ...range(101,127)], type => {
  let variant = type === 1 ? 0 : type - 100
  return {
    variants: range(101,127),
    isVariant: type !== 1,
    spritesheet: "small-boxes.png",
    width: 68, height: 68,
    offset: { x: 68*variant, y: 0 },
    boundingWidth: 30,
    boundingHeight: 30,
    placeholderData: { 
      baseId: 1,
      invisibleId: 100,
    },
  }
})
setData([2, ...range(201, 231)], type => {
  let variant = type === 2 ? 0 : type - 200
  return {
    variants: range(201,231),
    isVariant: type !== 2,
    spritesheet: "big-boxes.png",
    width: 118, height: 118,
    offset: { x: 118*variant, y: 0 },
    boundingWidth: 62,
    boundingHeight: 62,
    placeholderData: { 
      baseId: 2,
      invisibleId: 200,
    },
  }
})
setData([3, ...range(301, 326)], type => {
  let variant = type === 3 ? 0 : type - 300
  return {
    variants: range(301,326),
    isVariant: type !== 3,
    spritesheet: "small-planks.png",
    width: 180, height: 60,
    offset: { x: 0, y: 60*variant },
    boundingWidth: 100,
    boundingHeight: 10,
    placeholderData: { 
      baseId: 3,
      invisibleId: 300,
    },
  }
})
setData([4, ...range(401, 429)], type => {
  let variant = type === 4 ? 0 : type - 400
  return {
    variants: range(401,429),
    isVariant: type !== 4,
    spritesheet: "big-planks.png",
    width: 240, height: 60,
    offset: { x: 0, y: 60*variant },
    boundingWidth: 200,
    boundingHeight: 10,
    placeholderData: { 
      baseId: 4,
      invisibleId: 400,
    },
  }
})
setData([6, ...range(601, 626)], type => {
  let variant = type === 6 ? 0 : type - 600
  return {
    variants: range(601,626),
    isVariant: type !== 6,
    spritesheet: "balls.png",
    width: 90, height: 90,
    offset: { x: 90*variant, y: 0 },
    boundingWidth: 30,
    boundingHeight: 30,
    circle: true,
    placeholderData: { 
      baseId: 6,
      invisibleId: 600,
    },
  }
})
setData([7, ...range(701, 703)], type => {
  let variant = type === 7 ? 0 : type - 700
  return {
    variants: range(701,703),
    isVariant: type !== 7,
    spritesheet: "trampolines.png",
    width: 140, height: 70,
    offset: { x: 140*variant, y: 0 },
    boundingWidth: 100,
    boundingHeight: 20,
    placeholderData: { 
      baseId: 7,
      invisibleId: 700,
    },
  }
})
setData([10, ...range(1002, 1012)], type => {
  let variant = type === 10 ? 0 : type - 1000 - 1
  return {
    variants: range(1002,1012),
    isVariant: type !== 10,
    spritesheet: "anvils.png",
    width: 60, height: 60,
    offset: { x: 60*variant, y: 0 },
    boundingWidth: 30,
    boundingHeight: 30,
    placeholderData: { 
      baseId: 10,
      invisibleId: 1000,
    },
  }
})
setData([17, ...range(1701, 1724)], type => {
  let variant = type === 17 ? 0 : type - 1700
  return {
    variants: range(1701,1724),
    isVariant: type !== 17,
    spritesheet: "cannonballs.png",
    width: 90, height: 90,
    offset: { x: 90*variant, y: 0 },
    boundingWidth: 30,
    boundingHeight: 30,
    circle: true,
    placeholderData: { 
      baseId: 17,
      invisibleId: 1700,
    },
  }
})
setData([...range(28,31), ...range(2801, 2832)], type => {
  let variant = type >= 28 && type <= 31 ? type - 28 : type - 2801 + 4
  return {
    variants: [...range(29,31), ...range(2801, 2832)],
    isVariant: type !== 28,
    spritesheet: "balloons.png",
    width: 72, height: 100,
    offset: { x: 72*variant, y: 0 },
    boundingWidth: 30,
    boundingHeight: 30,
    circle: true,
    placeholderData: { 
      baseId: 28,
      invisibleId: 2800,
    },
  }
})
setData([22, ...range(11, 16)], type => {
  let variant = type === 22 ? 0 : type - 10
  return {
    variants: [12,13].includes(type) ? [12,13] : [15,16].includes(type) ? [15,16] : undefined,
    isVariant: type === 13 || type === 16,
    spritesheet: "nails.png",
    width: 40, height: 40,
    offset: { x: 40*variant, y: 0 },
    boundingWidth: 10,
    boundingHeight: 10,
    circle: true,
  }
})
setData(32, {
  sprite: "rune.png",
  width: 34, height: 26,
  boundingWidth: 30,
  boundingHeight: 30,
  circle: true,
  placeholderData: { 
    baseId: 32,
    invisibleId: 3200,
  },
})
setData(62, {
  sprite: "stable-rune.png",
  width: 34, height: 26,
  boundingWidth: 30,
  boundingHeight: 30,
  circle: true,
  placeholderData: { 
    baseId: 62,
    invisibleId: 6200,
  },
})
setData(54, {
  sprite: "icecube.png",
  width: 61, height: 61,
  placeholderData: { 
    baseId: 54,
    invisibleId: 5400,
  },
})
setData(23, {
  sprite: "bomb.png",
  width: 80, height: 80,
  boundingWidth: 30,
  boundingHeight: 30,
  circle: true,
  placeholderData: { 
    baseId: 23,
    invisibleId: 2300,
  },
})
setData(33, {
  sprite: "chicken.png",
  width: 34, height: 34,
  boundingWidth: 20,
  boundingHeight: 20,
  circle: true,
  placeholderData: { 
    baseId: 33,
    invisibleId: 3300,
  },
})
setData(34, {
  sprite: "snowball.png",
  width: 12, height: 12,
  boundingWidth: 12,
  boundingHeight: 12,
  circle: true,
  placeholderData: { 
    baseId: 34,
    invisibleId: 3400,
  },
})
setData(63, {
  sprite: "fish.png",
  width: 40, height: 40,
  boundingWidth: 34,
  boundingHeight: 40,
  placeholderData: { 
    baseId: 63,
    invisibleId: 6300,
  },
})
setData(65, {
  sprite: "pufferfish.png",
  width: 40, height: 40,
  boundingWidth: 22,
  boundingHeight: 22,
  circle: true,
  placeholderData: { 
    baseId: 65,
    invisibleId: 6500,
  },
})
setData(80, {
  sprite: "plane.png",
  width: 42, height: 42,
  boundingWidth: 14,
  boundingHeight: 14,
  circle: true,
  placeholderData: { 
    baseId: 80,
    invisibleId: 8000,
  },
})
setData(89, {
  sprite: "pumpkin.png",
  width: 40, height: 40,
  boundingWidth: 24,
  boundingHeight: 24,
  circle: true,
  placeholderData: { 
    baseId: 89,
    invisibleId: 8900,
  },
})
setData(90, {
  sprite: "tombstone.png",
  width: 42, height: 46,
  placeholderData: { 
    baseId: 90,
    invisibleId: 9000,
  },
})
setData(95, {
  sprite: "paperball.png",
  width: 40, height: 40,
  boundingWidth: 16,
  boundingHeight: 16,
  circle: true,
  placeholderData: { 
    baseId: 95,
    invisibleId: 9500,
  },
})
setData(97, {
  sprite: "energyorb.png",
  width: 40, height: 40,
  boundingWidth: 10,
  boundingHeight: 10,
  circle: true,
  placeholderData: { 
    baseId: 97,
    invisibleId: 9700,
  },
})
setData(39, {
  sprite: "apple.png",
  width: 40, height: 40,
  boundingWidth: 30,
  boundingHeight: 30,
  placeholderData: { 
    baseId: 39,
    invisibleId: 3900,
  },
})
setData(40, {
  sprite: "sheep.png",
  width: 56, height: 47,
  boundingWidth: 30,
  boundingHeight: 30,
  placeholderData: { 
    baseId: 40,
    invisibleId: 4000,
  },
})
setData(45, {
  sprite: "ice-plank.png",
  width: 120, height: 28,
  boundingWidth: 100,
  boundingHeight: 10,
  placeholderData: { 
    baseId: 45,
    invisibleId: 4500,
  },
})
setData(46, {
  sprite: "chocolate-plank.png",
  width: 120, height: 28,
  boundingWidth: 100,
  boundingHeight: 10,
  placeholderData: { 
    baseId: 46,
    invisibleId: 4600,
  },
})
setData(57, {
  sprite: "cloud.png",
  width: 100, height: 70,
  boundingWidth: 61,
  boundingHeight: 31,
  placeholderData: { 
    baseId: 57,
    invisibleId: 5700,
  },
})
setData(59, {
  sprite: "bubble.png",
  width: 44, height: 44,
  boundingWidth: 30,
  boundingHeight: 30,
  circle: true,
  placeholderData: { 
    baseId: 59,
    invisibleId: 5900,
  },
})
setData(60, {
  sprite: "mini-plank.png",
  width: 70, height: 30,
  boundingWidth: 50,
  boundingHeight: 10,
  placeholderData: { 
    baseId: 60,
    invisibleId: 6000,
  },
})
setData(61, {
  sprite: "companion.png",
  width: 66, height: 66,
  boundingWidth: 55,
  boundingHeight: 55,
  placeholderData: { 
    baseId: 61,
    invisibleId: 6100,
  },
})
setData(68, {
  sprite: "triangle.png",
  width: 100, height: 100,
  boundingWidth: 80,
  boundingHeight: 80,
  placeholderData: { 
    baseId: 68,
    invisibleId: 6800,
  },
})
setData(69, {
  sprite: "s.png",
  width: 88, height: 88,
  boundingWidth: 71,
  boundingHeight: 71,
  placeholderData: { 
    baseId: 69,
    invisibleId: 6900,
  },
})
setData(35, {
  sprite: "cupid-arrow.png",
  width: 40, height: 40,
  boundingWidth: 25,
  boundingHeight: 9,
  placeholderData: { 
    baseId: 35,
    invisibleId: 3500,
  },
})
setData(24, {
  sprite: "spirit.png",
  width: 40, height: 40,
  boundingWidth: 20,
  boundingHeight: 20,
  circle: true,
})
setData(67, {
  sprite: "very-big-plank.png",
  width: 306, height: 14,
  boundingWidth: 300,
  boundingHeight: 10,
  placeholderData: { 
    baseId: 67,
    invisibleId: 6700,
  },
})

setDefilanteVariant(6, {
  sprite: "plus-one.png",
  width: 30, height: 30,
  circle: true,
})
setDefilanteVariant(32, {
  sprite: "speed-boost.png",
  width: 30, height: 30,
  circle: true,
})
setDefilanteVariant(15, {
  sprite: "skull.png",
  width: 30, height: 30,
  circle: true,
})
setDefilanteVariant(16, {
  sprite: "spring.png",
  width: 30, height: 30,
  circle: true,
})


let data = {}

function range(a, b) {
  let arr = []
  for(let k=a; k <= b; k++)
    arr.push(k)
  return arr
}
function setData(types, arg) {
  if(!(types instanceof Array))
    types = [types]
  if(typeof arg === "function") {
    for(let type of types) {
      data[type] = arg(type)
    }
  }
  else {
    for(let type of types) {
      data[type] = arg
    }
  }
}

setData(0, {
  sprite: "arrow.png",
  width: 27, height: 31,
})
setData([1, ...range(101,114)], type => {
  let variant = type === 1 ? 0 : type - 100
  return {
    variants: range(101,114),
    isVariant: type !== 1,
    spritesheet: "small-boxes.png",
    width: 68, height: 68,
    offset: { x: 68*variant, y: 0 },
    boundingWidth: 30,
    boundingHeight: 30,
  }
})
setData([2, ...range(201, 217)], type => {
  let variant = type === 2 ? 0 : type - 200
  return {
    variants: range(201,217),
    isVariant: type !== 2,
    spritesheet: "big-boxes.png",
    width: 118, height: 118,
    offset: { x: 118*variant, y: 0 },
    boundingWidth: 62,
    boundingHeight: 62,
  }
})
setData([3, ...range(301, 312)], type => {
  let variant = type === 3 ? 0 : type - 300
  return {
    variants: range(301,312),
    isVariant: type !== 3,
    spritesheet: "small-planks.png",
    width: 120, height: 60,
    offset: { x: 0, y: 60*variant },
    boundingWidth: 100,
    boundingHeight: 10,
  }
})
setData([4, ...range(401, 414)], type => {
  let variant = type === 4 ? 0 : type - 400
  return {
    variants: range(401,414),
    isVariant: type !== 4,
    spritesheet: "big-planks.png",
    width: 240, height: 60,
    offset: { x: 0, y: 60*variant },
    boundingWidth: 200,
    boundingHeight: 10,
  }
})
setData([6, ...range(601, 613)], type => {
  let variant = type === 6 ? 0 : type - 600
  return {
    variants: range(601,613),
    isVariant: type !== 6,
    spritesheet: "balls.png",
    width: 90, height: 90,
    offset: { x: 90*variant, y: 0 },
    boundingWidth: 30,
    boundingHeight: 30,
  }
})
setData([7, 701], type => {
  let variant = type === 7 ? 0 : type - 700
  return {
    variants: [701],
    isVariant: type !== 7,
    spritesheet: "trampolines.png",
    width: 140, height: 70,
    offset: { x: 140*variant, y: 0 },
    boundingWidth: 102,
    boundingHeight: 20,
  }
})
setData([10, ...range(1002, 1005)], type => {
  let variant = type === 10 ? 0 : type - 1000 - 1
  return {
    variants: range(1002,1005),
    isVariant: type !== 10,
    spritesheet: "anvils.png",
    width: 60, height: 60,
    offset: { x: 60*variant, y: 0 },
    boundingWidth: 30,
    boundingHeight: 30,
  }
})
setData([17, ...range(1701, 1711)], type => {
  let variant = type === 17 ? 0 : type - 1700
  return {
    variants: range(1701,1711),
    isVariant: type !== 17,
    spritesheet: "cannonballs.png",
    width: 90, height: 90,
    offset: { x: 90*variant, y: 0 },
    boundingWidth: 30,
    boundingHeight: 30,
  }
})
setData([...range(28,31), ...range(2801, 2820)], type => {
  let variant = type >= 28 && type <= 31 ? type - 28 : type - 2801 + 4
  return {
    variants: [...range(29,31), ...range(2801, 2820)],
    isVariant: type !== 28,
    spritesheet: "balloons.png",
    width: 72, height: 100,
    offset: { x: 72*variant, y: 0 },
    boundingWidth: 42,
    boundingHeight: 42,
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
    boundingWidth: 40,
    boundingHeight: 40,
  }
})
setData(32, {
  sprite: "rune.png",
  width: 34, height: 26,
})
setData(62, {
  sprite: "stable-rune.png",
  width: 34, height: 26,
})
setData(54, {
  sprite: "icecube.png",
  width: 61, height: 61,
})
setData(23, {
  sprite: "bomb.png",
  width: 80, height: 80,
})
setData(33, {
  sprite: "chicken.png",
  width: 34, height: 34,
})
setData(63, {
  sprite: "fish.png",
  width: 40, height: 40,
})
setData(65, {
  sprite: "pufferfish.png",
  width: 40, height: 40,
})
setData(80, {
  sprite: "plane.png",
  width: 42, height: 42,
})
setData(89, {
  sprite: "pumpkin.png",
  width: 40, height: 40,
})
setData(90, {
  sprite: "tombstone.png",
  width: 42, height: 46,
})
setData(95, {
  sprite: "paperball.png",
  width: 40, height: 40,
})
setData(97, {
  sprite: "energyorb.png",
  width: 40, height: 40,
})
setData(39, {
  sprite: "apple.png",
  width: 40, height: 40,
})
setData(45, {
  sprite: "ice-plank.png",
  width: 120, height: 28,
})
setData(46, {
  sprite: "chocolate-plank.png",
  width: 120, height: 28,
})
setData(57, {
  sprite: "cloud.png",
  width: 100, height: 70,
})
setData(59, {
  sprite: "bubble.png",
  width: 44, height: 44,
})
setData(60, {
  sprite: "mini-plank.png",
  width: 70, height: 30,
})
setData(61, {
  sprite: "companion.png",
  width: 66, height: 66,
})
setData(68, {
  sprite: "triangle.png",
  width: 100, height: 100,
})
setData(69, {
  sprite: "s.png",
  width: 88, height: 88,
})
setData(35, {
  sprite: "cupid-arrow.png",
  width: 40, height: 40,
})
setData(24, {
  sprite: "spirit.png",
  width: 40, height: 40,
})
setData(67, {
  spritesheet: "very-big-plank.png",
  width: 306, height: 14,
  offset: { x: 0, y: 0 },
  boundingWidth: 300,
  boundingHeight: 10,
})

data[6].defilanteVariant = {
  sprite: "plus-one.png",
  width: 30, height: 30,
}
data[32].defilanteVariant = {
  sprite: "speed-boost.png",
  width: 30, height: 30,
}
data[15].defilanteVariant = {
  sprite: "skull.png",
  width: 30, height: 30,
}
data[16].defilanteVariant = {
  sprite: "spring.png",
  width: 30, height: 30,
}

export default data
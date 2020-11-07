
/*
  Step 1: download file "x_pictos_editeur.swf"
  Step 2: open with software "JPEXS Free Flash Decompiler (@11.2.0)"
  Step 3: select all sprites
  Step 4: "Export selection"
  Step 5: export as SVG
  Step 6: pick "dist/decorations"
  Step 7: repeat steps 4,5,6 but this time export as PNG
  Step 8: run "node ./prepareSvgAssets.js"
*/

const fs = require("fs")
const path = require("path")
const rimraf = require("rimraf")

const root = path.resolve(__dirname, "..")

let decorationMetadata = []

function processSvg(svg, type) {
  let prefix = "decoration"+type

  // Prefix id attributes
  svg = svg
    .replace(/id="([^"]+)"/g, (_, name) => {
      return `id="${prefix}-${name}"`
    })
    .replace(/href="#([^"]+)"/g, (_, name) => {
      return `href="#${prefix}-${name}"`
    })
    .replace(/url\(#([^\)]+)\)/g, (_, name) => {
      return `url(#${prefix}-${name})`
    })

  let data = {
    type,
    offset: {
      x: 0,
      y: 0,
    },
    filters: [], // { name: "decoration14-filter0", defaultColor: "46788E", }
  }

  { // Extract offset position
    let match = svg.match(/<g transform="matrix\(([^\)]+)\)/)
    let [x,y] = match[1].split(",").map(s => s.trim()).slice(-2).map(s => parseFloat(s))
    data.offset.x = x
    data.offset.y = y
  }

  { // Inject filters where necessary
    svg =svg.replace(/Couleur(\d+)_([^"]+)"/g, (match, index, defaultColor) => {
      if(data.filters[index] === undefined) {
        data.filters[index] = {
          name: `${prefix}-filter${index}`,
          defaultColor,
        }
      }
      let name = data.filters[index].name
      return match + ` filter="url(#${name})"`
    })
  }

  return [svg, data]
}

let destination = path.join(root, "dist", "decorations")
let originalDirs = fs.readdirSync(path.join(destination, "sprites"))
for(let dir of originalDirs.filter(s => s.includes("$P"))) {
  let type = dir.split("$P_")[1]
  let svg = fs.readFileSync(path.join(destination, "sprites", dir, "1.svg"))
  let [transformedSvg, data] = processSvg(svg.toString(), type)
  decorationMetadata[type] = data
  fs.writeFileSync(path.join(destination, type+".svg"), transformedSvg)
  fs.copyFileSync(
    path.join(destination, "sprites", dir, "1.png"),
    path.join(destination, type+".png")
  )
}

fs.writeFileSync(
  path.join(root, "src", "metadata", "decoration", "decorationMetadata.json"), 
  JSON.stringify(decorationMetadata)
)

// Clean up
rimraf(path.join(destination, "sprites"), e => {
  if(e) throw e
  console.log("Done")
})




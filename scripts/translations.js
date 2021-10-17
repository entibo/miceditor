
const fs = require("fs")
const path = require("path")
const got = require("got")

const root = path.resolve(__dirname, "..")

;(async () => {
  let resp = await got("https://docs.google.com/spreadsheets/d/1Hfjn9HaykT3OxKRfR3psSnK9LqLPDkwYMk3EJnU3CnY/gviz/tq?tqx=out:csv")
  let csv = resp.body.split("\n")
    .map(line => line.replace(/""([^",]+)""/g, "\\\"$1\\\""))
    .map(line => line.replace(/\\/g, "\\\\"))
    .map(line => {
      try { return JSON.parse("["+line+"]") }
      catch(e) {
        console.error("Failed to parse line:", line)
        process.exit(1)
      }
    })

  let languages = {}

  languages.locales = csv[2].slice(2).filter(s => s !== "")

  console.log(languages.locales)

  languages.translators = {}
  let translators = csv[3].slice(2)
  for(let [i, locale] of languages.locales.entries()) {
    languages.translators[locale] = translators[i].split(",").map(s => s.trim())
  }

  languages.translations = {}
  for(let [i, locale] of languages.locales.entries()) {
    languages.translations[locale] = {}
    for(let row of csv.slice(4)) {
      let id = row[0]
      let value = row[2+i]
      languages.translations[locale][id] = value
    }
  }

  fs.writeFileSync(
    path.join(root, "src", "languages.json"), 
    JSON.stringify(languages)
  )

  console.log("Done!")
})()
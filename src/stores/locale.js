
import { locale, dictionary, getClientLocale, _ } from "svelte-i18n"

import { persistentWritable } from "/stores/user.js"
import languages from "/languages.json"

export { dictionary, _ }


export const localeFlag = {
  "en": "gb",
  "fr": "fr",
  "hu": "hu",
  "br": "br",
  "lv": "lv",
  "pl": "pl",
  "bg": "bg",
}
export const localeTranslators = {
  "hu": ["Lemax#7166"],
  "lv": ["Syrius#8114"],
  "pl": ["Lament"],
  "bg": ["Silence#5339"],
}

for(let cc of Object.keys(languages).filter(s => s != "en")) {
  for(let k of Object.keys(languages.en)) {
    languages[cc][k] = languages[cc][k] || languages.en[k]
  }
}


dictionary.set(languages)


let initLocale = getClientLocale({
  fallback: "en",
  navigator: true,
})
if (initLocale) {
  initLocale = initLocale.slice(0, 2)
  if(!localeFlag[initLocale]) {
    initLocale = "en"
  }
}
else {
  initLocale = "en"
}

export const language = persistentWritable("userLocale", initLocale)

language.subscribe(v => {
  locale.set(v)
})
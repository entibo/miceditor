
import { locale, dictionary, getClientLocale, _ } from "svelte-i18n"

import { persistentWritable } from "state/util"
import languages from "languages.json"
type Locale = keyof typeof languages

export { dictionary, _ }


export const localeFlag: Record<Locale, string> = {
  "en": "gb",
  "fr": "fr",
  "hu": "hu",
  "br": "br",
  "lv": "lv",
  "pl": "pl",
  "bg": "bg",
  "ro": "ro",
  "es": "es",
}
export const localeTranslators: Record<Locale, string[]> = {
  "hu": ["Lemax#7166"],
  "lv": ["Syrius#8114"],
  "pl": ["Lament"],
  "bg": ["Silence#5339"],
  "br": ["Ikke"],
  "ro": ["Narcis"],
  "es": ["Tanu23"],
  "en": ["entibo"],
  "fr": ["entibo"],
}

{ let _languages = languages as any
  for(let cc of Object.keys(_languages)) {
    if(cc.length > 2) {
      _languages[cc.slice(0,2)] = _languages[cc]
      delete _languages[cc]
    }
  }
  for(let cc of Object.keys(_languages).filter(s => s != "en")) {
    for(let k of Object.keys(_languages.en)) {
      _languages[cc][k] = _languages[cc][k] || _languages.en[k]
    }
  }
}

dictionary.set(languages)


let initLocale: Locale = getClientLocale({
  fallback: "en",
  navigator: true,
})
if(initLocale) {
  initLocale = initLocale.slice(0, 2) as Locale
  if(!(initLocale in localeFlag)) {
    initLocale = "en"
  }
} else {
  initLocale = "en"
}

export const language = persistentWritable("userLocale", initLocale)

language.subscribe(v => {
  locale.set(v)
})
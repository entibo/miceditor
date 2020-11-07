
import { persistentWritable } from "state/util"
import { previousVersion, currentVersion } from "state/user"

import { locale, dictionary, getClientLocale, _ } from "svelte-i18n"
export { dictionary, _ }

import languages from "languages.json"

export type Locale = keyof typeof languages["translators"]
export type TranslationId = keyof (typeof languages)["translations"]["en"]

export const locales = languages.locales as Locale[]
export const translators: Record<Locale, string[]> = languages.translators

for(let locale of locales) {
  if(locale === "en") continue
  for(let _id of Object.keys(languages.translations.en)) {
    let id = _id as TranslationId
    if(languages.translations[locale][id] === "") {
      languages.translations[locale][id] = languages.translations.en[id]
    }
  }
}

dictionary.set(languages.translations)


let initLocale: Locale = getClientLocale({
  fallback: "en",
  navigator: true,
})
if(initLocale) {
  initLocale = initLocale.slice(0, 2) as Locale
  if(!languages.locales.includes(initLocale)) {
    initLocale = "en"
  }
} else {
  initLocale = "en"
}

if(previousVersion !== currentVersion) {
  localStorage.removeItem("userLocale")
}

export const userLocale = persistentWritable("userLocale", initLocale)

userLocale.subscribe(v => {
  locale.set(v)
})
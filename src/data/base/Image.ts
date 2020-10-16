
export interface Image {
  x: number
  y: number
  imageUrl: ImageUrl
}
export const defaults: () => Image = () => ({
  x: 0,
  y: 0,
  imageUrl: { value: "", url: "" }
})

export type ImageUrl
  = { value: string
      url: string }

export function readUrl(str: string): ImageUrl {
  let url = str.match(/^https?:/i) ? str : getAbsoluteUrl(str)
  url = url.split("?")[0]
  let info = new URL(url)
  if(info.hostname === "images.atelier801.com") {
    return {
      value: cleanValue(info.pathname),
      url: url,
    }
  }
  else if(info.hostname === "data.atelier801.com") {
    return {
      value: cleanValue(info.pathname),
      url: url,
    }
  }
  else if(info.hostname === "transformice.com") {
    let match = info.pathname.match(/^\/?([^\/]+)\/?(.*)/)
    if(match === null) {
      return {
        value: cleanValue(info.pathname),
        url: url,
      }
    }
    let [first,rest] = [match[1],match[2]]
    if(first === "images") {
      return {
        value: cleanValue(rest),
        url: `https://data.atelier801.com/${rest}`,
      }
    }
    else if(first === "godspaw") {
      return {
        value: cleanValue(info.pathname),
        url: `https://data.atelier801.com/godspaw/${rest}`,
      }
    }

    /**
     * Fallback to http://transformice.com
     * https doesn't work (redirects to the root)
     * http doesn't work on some browsers (passive mixed content)
     */
    return {
      value: "../" + cleanValue(info.pathname),
      url: `http://transformice.com/${cleanValue(info.pathname)}`,
    }
  }
  return {
    value: str,
    url: url,
  }
}

/**
 * @param str path as it should appear in the XML
 * @return the URL that the Transformice client will make the request to
 */
function getAbsoluteUrl(str: string): string {
  let m
  return (m = str.match(/^\/?([a-z0-9]+.(?:png|jpg))/i))
    ? "https://images.atelier801.com/" + m[1]
    : "http://transformice.com/images/" + str
}

function cleanValue(str: string): string {
  if(str.startsWith("/"))
    str = str.slice(1)
  str = str.replace(/%20/g, " ")
  return str
}

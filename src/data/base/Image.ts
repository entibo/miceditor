
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
  str = str.split("?")[0]
  if(!str.match(/^https?:/i)) {
    return { 
      value: cleanValue(str), 
      url: getAbsoluteUrl(str),
    }
  }
  let info = new URL(str)
  if(info.hostname === "images.atelier801.com"
  || info.hostname === "data.atelier801.com" ) {
    return {
      value: info.pathname.startsWith("/")
        ? info.pathname.slice(1)
        : info.pathname,
      url: str,
    }
  }
  else if(info.hostname === "transformice.com") {
    let match = info.pathname.match(/^\/?([^\/]+)\/?(.*)/)
    if(match === null)
      return {
        value: str,
        url: str,
      }
    let [first,rest] = [match[1],match[2]]
    let value = first === "images"
      ? rest
      : `../${first}/${rest}`
    return {
      value,
      url: str,
    }
  }
  else {
    return {
      value: str,
      url: str,
    }
  }
}

function cleanValue(str: string): string {
  return str.replace(/%20/g, " ")
}

function getAbsoluteUrl(str: string): string {
  let m
  return (m = str.match(/^\/?([a-z0-9]+.(?:png|jpg))/i))
    ? "http://images.atelier801.com/" + m[1]
    : "http://transformice.com/images/" + str
}
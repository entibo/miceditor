
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

/**
 * @param str can be a full url or a relative path
 */
export function readUrl(str: string): ImageUrl {
  let url = str.match(/^https?:/i) ? str : getAbsoluteUrl(str)
  url = url.split("?")[0]
  let info = new URL(url)
  let value = str

  if(info.hostname === "images.atelier801.com" || info.hostname === "data.atelier801.com" || info.hostname === "transformice.com") {
    value = info.pathname
  }

  if(info.hostname === "transformice.com") {
    info.protocol = "http:"
    let match = info.pathname.match(/^\/?([^\/]+)\/?(.*)/)
    if(match !== null) {
      if(match[1] !== "images") {
        value = ".."+info.pathname
      } else {
        value = match[2]
      }
    }
  }

  return {
    value: cleanValue(value),
    url: "https://images.weserv.nl/?url="+info.toString()
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

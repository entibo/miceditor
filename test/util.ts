
export function normalizeSerializedXmlNode(str: string) {
  let name = str.match(/^<(\w+)/i)![1]
  let attrs = str.match(/(\w+)="([^"]*)"/ig)!.sort()
  return `<${name} ${attrs.join(" ")} />`
}
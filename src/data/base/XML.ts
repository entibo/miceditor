
export interface Node {
  name: string,
  children: Node[],
  attributes: Attributes
}

export type Attributes = Partial<Record<string, string>>

interface Token {
  type: TokenType,
  value: string,
}
type TokenType = "<" | "</" | ">" | "/>" | "=" | "IDENTIFIER" | "STRING"

export function parse(str: string): Node {
  let state: "ROOT"|"OPENING"|"NORMAL" = "ROOT"
  let rootNode!: Node
  let currentNode!: Node
  let nodeStack = [] as Node[]

  let tokens = tokenize(str)

  let currentTokenIndex = 0
  const eat = (type?: TokenType, value?: string, errorMsg?: string) => {
    if(currentTokenIndex >= tokens.length) {
      error("Unexpected end of file")
    }
    let t = tokens[currentTokenIndex++]
    if((type && type !== t.type) || (value && value !== t.value))
      error(errorMsg || `Expected '${value}' (${type}), got '${t.value}' (${t.type})`)
    return t
  }

  while(currentTokenIndex < tokens.length) {
    let t = eat()
    if(state === "ROOT") {
      if(t.type === "<") {
        state = "OPENING"
        rootNode = currentNode = { 
          name: eat("IDENTIFIER").value,
          children: [],
          attributes: {},
        }
        continue
      }
      error("Expected '<' at beginning of file")
    }
    if(state === "NORMAL") {
      if(t.type === "<") {
        state = "OPENING"
        nodeStack.push(currentNode)
        let newNode = { 
          name: eat("IDENTIFIER").value,
          children: [],
          attributes: {},
        }
        currentNode.children.push(newNode)
        currentNode = newNode
        continue
      }
      if(t.type === "</") {
        eat("IDENTIFIER", currentNode.name)
        eat(">")
        currentNode = nodeStack.pop()!
        continue
      }
      error("Expected opening tag")
    }
    if(state === "OPENING") {
      if(t.type === "IDENTIFIER") {
        eat("=")
        currentNode.attributes[t.value] = eat("STRING").value
        continue
      }
      if(t.type === ">") {
        state = "NORMAL"
        continue
      }
      if(t.type === "/>") {
        state = "NORMAL"
        currentNode = nodeStack.pop()!
        continue
      }
      error("Expected attribute or end of tag")
    }
  }

  return rootNode
}

export function generate<T extends Node>(node: T): string {
  let attributes = Object.entries(node.attributes)
    .filter(([_,value]) => value !== undefined)
    .map(([key,value]) => ` ${key}="${value}"`)
    .join("")

  if(node.children.length === 0) {
    return `<${node.name}${attributes}/>`
  }
  let children = node.children.map(generate).join("")
  return `<${node.name}${attributes}>${children}</${node.name}>`
}

const identifierRegex = /[_a-z0-9-]/i

function tokenize(str: string): Token[] {
  let tokens = [] as Token[]
  let k = 0
  
  while(k < str.length) {
    let c = str[k]
    if(c === " " || c === "\t" || c === "\n") {
      k++
      continue
    }
    if(str.startsWith("</", k)) {
      k += 2
      tokens.push({ type: "</", value: "</" })
      continue
    }
    if(str.startsWith("/>", k)) {
      k += 2
      tokens.push({ type: "/>", value: "/>" })
      continue
    }
    if(c === "<") {
      k++
      tokens.push({ type: "<", value: "<" })
      continue
    }
    if(c === ">") {
      k++
      tokens.push({ type: ">", value: ">" })
      continue
    }
    if(c === "=") {
      k++
      tokens.push({ type: "=", value: "=" })
      continue
    }
    if(c === '"') {
      k++
      let value = ""
      while(k < str.length && str[k] !== '"') {
        value += str[k++]
      }
      if(k >= str.length || str[k++] !== '"')
        error("Missing end quote")
      tokens.push({ type: "STRING", value })
      continue
    }
    if(c.match(identifierRegex)){
      let value = ""
      do {
        value += str[k++]
      } while(k < str.length && str[k].match(identifierRegex))
      tokens.push({ type: "IDENTIFIER", value })
      continue
    }
    error("Unexpected character: "+c+" (context) "
      +str.slice(Math.max(0,k-10),k+10))
  }

  return tokens
}

function error(msg="Error") {
  throw msg
}

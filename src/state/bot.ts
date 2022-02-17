import { writable, Writable } from "svelte/store"

import { store } from "state/util"
import { persistentWritable } from "state/util"
import { storeGet } from "common"

// const botUrl = "ws://localhost:9000"
const botUrl = "ws://map-loader-bot.herokuapp.com"
let ws: WebSocket | null = null

export const botStatus = store({
  connecting: false,
  connected: false,
  connectionError: false,
  isModuleLoaded: false,
  hasTribehouseAccess: false,
  isBotOnline: false,
})

interface BotConfig {
  autoConnect: boolean
  name: string
}
export const botConfig: Writable<BotConfig> = persistentWritable("botConfig", {
  autoConnect: false,
  name: "",
})
botConfig.subscribe(($botConfig) => {
  if ($botConfig.autoConnect) connectToBot()
  if (isValidName($botConfig.name)) sendName($botConfig.name)
})

export function isValidName(name: string) {
  return !!name.match(/^[a-zA-Z0-9_+-]+#[0-9]{4}$/)
}

export function connectToBot() {
  if (botStatus.connected || botStatus.connecting) return

  botStatus.set({
    connecting: true,
    connected: false,
    connectionError: false,
    isModuleLoaded: false,
    hasTribehouseAccess: false,
    isBotOnline: false,
  })

  ws = new WebSocket(botUrl)
  ws.binaryType = "arraybuffer"
  //@ts-ignore
  window.ws = ws

  let heartbeatInterval: any

  ws.addEventListener("open", (e) => {
    botStatus.update((o) => {
      o.connecting = false
      o.connected = true
      o.isModuleLoaded = false
      o.hasTribehouseAccess = false
      return o
    })
    const { name } = storeGet(botConfig)
    if (isValidName(name)) {
      sendName(name)
    }
    heartbeatInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send("")
      }
    }, 15000)
  })
  ws.addEventListener("error", (e) => {
    console.log(e)
    botStatus.update((o) => {
      o.connectionError = true
      return o
    })
  })
  ws.addEventListener("close", (e) => {
    console.log(e)
    botStatus.update((o) => {
      o.connected = false
      o.connecting = false
      if (e.code === 1006) o.connectionError = true
      return o
    })
    clearInterval(heartbeatInterval)
    ws = null
  })
  ws.addEventListener("message", (e) => {
    const str = e.data.toString()
    // console.log("WebSocket message", e.data, str)
    if (str === "ok") {
      botStatus.update((o) => {
        o.hasTribehouseAccess = true
        o.isModuleLoaded = true
        return o
      })
      return
    } else if(str === "") {
      // heartbeat
      return
    }
    botStatus.update((o) => {
      Object.assign(o, JSON.parse(str))
      return o
    })
  })
}

export function sendName(name: string) {
  if (!botStatus.connected || !ws) return
  ws.send(JSON.stringify({ name }))
}
export function sendMap(xml: string) {
  if (!botStatus.connected || !ws) return
  ws.send(JSON.stringify({ xml }))
}
export function testBot() {
  sendMap("")
}

export const botName = "Entibot#5692"
export const botInviteCommand = `/inv ${botName}`
export const botLuaModule = `local botName = "${botName}"
local lastXML = nil
local loadMapWhenBotLeaves = false

-- Feel free to customize this module.

function eventNewGame()
    tfm.exec.disableAutoShaman(true)
    tfm.exec.disableAutoNewGame(true)
    tfm.exec.disableAutoTimeLeft(true)
    tfm.exec.disableAfkDeath(true)
end

function numPlayers()
    local count = 0
    for _ in pairs(tfm.get.room.playerList) do count = count + 1 end
    return count
end

function eventPopupAnswer(id, name, str)
    if id == 5692 and name == botName then
        lastXML = str
        if numPlayers() == 2 then
            loadMapWhenBotLeaves = true
        else
            tfm.exec.newGame(str)
        end
    end
    addPopup()
end
function addPopup() ui.addPopup(5692, 2, "xml", botName) end
addPopup()

function eventPlayerDied(name) tfm.exec.respawnPlayer(name) end

function eventNewPlayer(name)
    if name == botName then
        addPopup()
    else
        tfm.exec.respawnPlayer(name)
    end
end

function eventPlayerLeft(name)
    if loadMapWhenBotLeaves and name == botName then
        loadMapWhenBotLeaves = false
        tfm.exec.newGame(lastXML)
    end
end

function eventChatCommand(name, cmd)
    if cmd == "reload" then if lastXML then tfm.exec.newGame(lastXML) end end
    if cmd:sub(1, 3) == "You" then addPopup() end
end
system.disableChatCommandDisplay("reload")
system.disableChatCommandDisplay("You")
`

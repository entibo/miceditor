import { derived, writable, Writable } from "svelte/store"

import { store } from "state/util"
import { persistentWritable } from "state/util"
import { storeGet } from "common"

// const botUrl = "ws://localhost:9000"
const botUrl = "wss://map-loader-bot.herokuapp.com"
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
  room: string
  tab: "room" | "tribehouse"
}
export const botConfig: Writable<BotConfig> = persistentWritable("botConfig", {
  autoConnect: false,
  name: "",
  room: randomRoomName(),
  tab: "room",
})
botConfig.update(($botConfig) => {
  $botConfig.room = $botConfig.room || randomRoomName()
  $botConfig.tab = $botConfig.tab || "room"
  return $botConfig
})
botConfig.subscribe(($botConfig) => {
  if ($botConfig.autoConnect) connectToBot()
  if ($botConfig.tab === "room") {
    sendRoom($botConfig.room)
  } else {
    if (isValidName($botConfig.name)) sendName($botConfig.name)
  }
})

export const botRoomCommand = derived(
  botConfig,
  ($botConfig) => `/room *#bolodefchoco miceditor ${$botConfig.room}`
)

export const isWarning = derived(
  [botConfig, botStatus],
  ([$botConfig, $botStatus]) => {
    if ($botConfig.tab === "room") {
      return $botStatus.isBotOnline
    } else {
      return (
        $botStatus.isBotOnline &&
        $botStatus.hasTribehouseAccess &&
        $botStatus.isModuleLoaded &&
        isValidName($botConfig.name)
      )
    }
  }
)

function randomRoomName() {
  return (Date.now() & 0xffff).toString(36)
}

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
    const { name, room, tab } = storeGet(botConfig)
    if (tab === "room") sendRoom(room)
    else if (isValidName(name)) sendName(name)

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
    if (storeGet(botConfig).autoConnect) setTimeout(connectToBot, 5000)
  })
  ws.addEventListener("message", (e) => {
    const str = e.data.toString()
    // console.log("WebSocket message", e.data, str)
    if (str === "ok") {
      return
    } else if (str === "") {
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
export function sendRoom(room: string) {
  if (!botStatus.connected || !ws) return
  ws.send(JSON.stringify({ room }))
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
export const botLuaModule = String.raw`local botName = "${botName}"
local isTribeHouse = string.byte(tfm.get.room.name, 2) == 3

if isTribeHouse then
    tfm.exec.chatMessage = function(msg, player)
        if player then
            print(string.format("<J>Sent to <BL>%s</BL>:</J>\n%s", player, msg))
        else
            print(string.format("<J>Sent to room:</J>\n%s", msg))
        end
    end
end

------------- State -------------

local playerData = {}
local isFirstPlayer = true
function initPlayerData(player)
    playerData[player] = {
        spawnPoint = nil,
        lastClick = nil,
        cooldowns = {speed = 0},
        facing = 0,
        admin = false
    }
    if isFirstPlayer or isTribeHouse then
        playerData[player].admin = true
        isFirstPlayer = false
    end
end

local powersEnabled = true

local lastXML = nil
local loadMapWhenBotLeaves = false
local lastNewGameValue = nil
function newGame(value)
    lastNewGameValue = value
    tfm.exec.newGame(value)
end

------------- Util -------------

function playerCount()
    local count = 0
    for _ in pairs(tfm.get.room.playerList) do
        count = count + 1
    end
    return count
end

function isShaman(player)
    return tfm.get.room.playerList[player] and tfm.get.room.playerList[player].isShaman
end

function truthy(str)
    return str == "true" or str == "yes" or str == "1" or str == "on"
end
function falsy(str)
    return str == "false" or str == "no" or str == "0" or str == "off"
end

------------- Text alignment -------------

local letterWidth = {}
local _letterWidth = {
    {3, "il'"},
    {4, " fj.,"},
    {5, "rt!()-[]|/:;"},
    {6, "c"},
    {7, "ksvxyz?"},
    {8, "0123456789abdeghnopqu$*_{}"},
    {9, "+=&<>"},
    {10, "#^"},
    {11, "mw"},
    {12, "@"},
    {13, "%"}
}
for _, t in pairs(_letterWidth) do
    n, s = t[1], t[2]
    for i = 1, #s do
        letterWidth[s:sub(i, i)] = n
    end
end
function getWidth(str)
    str = str:gsub("<[^>]*>", "") -- remove html tags
    local w = 0
    for i = 1, #str do
        w = w + (letterWidth[str:sub(i, i)] or 7)
    end
    return w
end
function fillWidth(width, char)
    char = char or " "
    return string.rep(char, math.max(0, math.floor(width / letterWidth[char])))
end
function leftAligned(line, offset, str, char)
    local width = offset - getWidth(line)
    return line .. fillWidth(width, char) .. str
end
function rightAligned(line, str, offset, char)
    offset = offset or 0
    local width = 370 - offset - getWidth(line) - getWidth(str)
    return line .. fillWidth(width, char) .. str
end

------------- Commands -------------

local commands = {
    {
        alias = {"s", "shaman"},
        descriptions = {
            {args = "on/off", desc = "disableAutoShaman"},
            {args = "player(s)", desc = "toggle shaman for this round"}
        },
        handler = function(player, arg)
            if truthy(arg) then
                tfm.exec.disableAutoShaman(false)
                tfm.exec.chatMessage("<BL>Shaman will be enabled starting next map.", player)
            elseif falsy(arg) then
                tfm.exec.disableAutoShaman(true)
                tfm.exec.chatMessage("<BL>Shaman will be disabled starting next map.", player)
            else
                if arg == "" then
                    arg = player
                end
                for word in arg:gmatch("%S+") do
                    tfm.exec.setShaman(word, not isShaman(word))
                end
            end
        end
    },
    {
        alias = {"skills"},
        descriptions = {
            {args = "on/off", desc = "disableAllShamanSkills"}
        },
        handler = function(player, arg)
            if truthy(arg) then
                tfm.exec.disableAllShamanSkills(false)
                tfm.exec.chatMessage("<BL>Shaman skills will be enabled starting next map.", player)
            elseif falsy(arg) then
                tfm.exec.disableAllShamanSkills(true)
                tfm.exec.chatMessage(
                    "<BL>Shaman skills will be disabled starting next map.",
                    player
                )
            else
                return false
            end
        end
    },
    {
        alias = {"flip", "mirror"},
        descriptions = {
            {args = "on/off", desc = "setAutoMapFlipMode"}
        },
        handler = function(player, arg)
            if truthy(arg) then
                tfm.exec.setAutoMapFlipMode(true)
                tfm.exec.chatMessage("<BL>Map mirroring will be enabled starting next map.", player)
            elseif falsy(arg) then
                tfm.exec.setAutoMapFlipMode(false)
                tfm.exec.chatMessage(
                    "<BL>Map mirroring will be disabled starting next map.",
                    player
                )
            else
                return false
            end
        end
    },
    {
        alias = {"p", "powers"},
        descriptions = {
            {args = "on/off", desc = "fly, teleport, etc"}
        },
        handler = function(player, arg)
            if truthy(arg) then
                powersEnabled = true
                tfm.exec.chatMessage("<BL>Powers enabled.", player)
            elseif falsy(arg) then
                powersEnabled = false
                tfm.exec.chatMessage("<BL>Powers disabled.", player)
            else
                return false
            end
        end
    },
    {
        alias = {"np", "map"},
        descriptions = {
            {args = "@123", desc = "load a map"}
        },
        handler = function(player, arg)
            newGame(arg)
            tfm.exec.chatMessage("<BL>Loaded map: <J>" .. arg, player)
        end
    },
    {
        alias = {"a", "admin"},
        descriptions = {
            {args = "player(s)", desc = "allow player(s) to use commands"}
        },
        handler = function(player, arg)
            if arg == "" then
                return false
            end
            for word in arg:gmatch("%S+") do
                local data = playerData[word]
                if data then
                    if data.admin then
                        tfm.exec.chatMessage("<BL>" .. arg .. " is already admin.", player)
                    else
                        data.admin = true
                        tfm.exec.chatMessage("<BL>" .. arg .. " is now admin.", player)
                    end
                end
            end
        end
    },
    {
        alias = {"r", "restart", "reload"},
        descriptions = {
            {args = "", desc = "reload the current map"}
        },
        handler = function()
            newGame(lastNewGameValue)
        end
    },
    {
        alias = {"h", "help"},
        admin = false,
        descriptions = {{args = "", desc = "show this menu"}},
        handler = function(player)
            printHelp(player)
        end
    }
}

for _, command in ipairs(commands) do
    for _, alias in ipairs(command.alias) do
        system.disableChatCommandDisplay(alias)
    end
end

function eventChatCommand(player, str)
    local playersIsAdmin = playerData[player].admin
    local cmd, arg = str:match("^(%S+)%s*(.*)")
    for _, command in pairs(commands) do
        for _, alias in pairs(command.alias) do
            if cmd == alias then
                if not playersIsAdmin and command.admin ~= false then
                    tfm.exec.chatMessage("<ROSE>You need to be admin to use this command.", player)
                    return
                end
                if command.handler(player, arg) == false then
                    tfm.exec.chatMessage("<ROSE>Invalid arguments.", player)
                end
                return
            end
        end
    end
    tfm.exec.chatMessage("<ROSE>Unknown command.", player)
end

------------- Powers -------------

local powers = {
    {key = "[m]", desc = "mort"},
    {key = "[shift]", desc = "speed"},
    {key = "[space]", desc = "fly"},
    {key = "[click]", desc = "teleport"},
    {key = "[double click]", desc = "set spawnpoint"}
}

function bindMouseAndKeyboard(player)
    system.bindMouse(player, true)
    tfm.exec.bindKeyboard(player, 16, true, true)
    tfm.exec.bindKeyboard(player, 32, true, true)
    tfm.exec.bindKeyboard(player, 77, true, true)
    tfm.exec.bindKeyboard(player, 67, true, true)
    tfm.exec.bindKeyboard(player, 0, true, true)
    tfm.exec.bindKeyboard(player, 2, true, true)
end

function eventMouse(player, x, y)
    if isShaman(player) or not powersEnabled then
        return
    end
    local data = playerData[player]
    local time = os.time()
    if not data.lastClick then
        data.lastClick = {time = 0}
    end
    if time - data.lastClick.time < 500 then
        data.lastClick = {time = 0}
        data.spawnPoint = {x = data.lastClick.x or x, y = data.lastClick.y or y}
        tfm.exec.killPlayer(player)
        return
    end
    data.lastClick = {time = time, x = x, y = y}
    tfm.exec.movePlayer(player, x, y)
end

function eventKeyboard(player, keyCode)
    local data = playerData[player]
    local time = os.time()
    if keyCode == 0 or keyCode == 2 then -- Left/right
        data.facing = keyCode == 2
    elseif keyCode == 16 then -- Shift
        if isShaman(player) or not powersEnabled then
            return
        end
        if time - data.cooldowns.speed < 1000 then
            return
        end
        data.cooldowns.speed = time
        tfm.exec.movePlayer(player, 0, 0, true, data.facing and 60 or -60, 0, true)
    elseif keyCode == 32 then -- Spacebar
        if isShaman(player) or not powersEnabled then
            return
        end
        tfm.exec.movePlayer(player, 0, 0, true, 0, -50, false)
    elseif keyCode == 77 then -- M
        tfm.exec.killPlayer(player)
    end
end

------------ Help Menu ------------

function printHelp(player)
    printPowers(player)
    printCommands(player)
end

function printPowers(player)
    local lines = {}
    for _, o in ipairs(powers) do
        local key, desc = o.key, o.desc
        local line = "<CH>" .. key .. " <G>"
        line = rightAligned(line, "</G> <BL>" .. desc, 0, ".")
        table.insert(lines, line)
    end
    local message = "<VP>• Powers:\n" .. table.concat(lines, "\n")
    tfm.exec.chatMessage(message, player)
end

function printCommands(player)
    local lines = {}
    for _, command in ipairs(commands) do
        local alias = {}
        for _, a in ipairs(command.alias) do
            table.insert(alias, "!" .. a)
        end
        local start = "<CH>" .. table.concat(alias, "<G>,</G> ")
        for i, o in ipairs(command.descriptions) do
            local args, desc = o.args, o.desc
            local line
            if i == 1 then
                line = start
            else
                line = fillWidth(getWidth(start))
            end
            if args ~= "" then
                line = leftAligned(line, 80, "<BV> " .. args)
            end
            if desc ~= "" then
                line = line .. " <G>"
                line = rightAligned(line, "</G> <BL>" .. desc, 0, ".")
            end
            table.insert(lines, line)
        end
    end
    local message = "<VP>• Commands:\n" .. table.concat(lines, "\n")
    tfm.exec.chatMessage(message, player)
end

------------- Events -------------

function eventNewPlayer(player)
    if player == botName then
        ui.addPopup(5692, 2, "xml", botName)
        initPlayerData(player)
    else
        initPlayerData(player)
        bindMouseAndKeyboard(player)
        tfm.exec.respawnPlayer(player)
        tfm.exec.chatMessage("<VP>• Type <B>!help</B> to see commands and powers!", player)
        tfm.exec.chatMessage(
            "<T>Feedback: <B>https://atelier801.com/topic?f=6&t=884238</B>",
            player
        )
    end
end

function eventNewGame()
    for _, data in pairs(playerData) do
        data.spawnPoint = nil
        data.lastClick = nil
    end
end

function eventPlayerDied(player)
    tfm.exec.respawnPlayer(player)
end

function eventPlayerWon(player)
    tfm.exec.respawnPlayer(player)
end

function eventPlayerRespawn(player)
    local data = playerData[player]
    if data.spawnPoint and powersEnabled then
        tfm.exec.movePlayer(player, data.spawnPoint.x, data.spawnPoint.y)
        return
    end
end

function eventPlayerLeft(player)
    if loadMapWhenBotLeaves and player == botName then
        loadMapWhenBotLeaves = false
        newGame(lastXML)
    end
    playerData[player] = nil
end

-- This is how the bot loads xml into the module
function eventPopupAnswer(id, player, str)
    if id == 5692 and player == botName then
        lastXML = str
        if playerCount() == 2 then
            loadMapWhenBotLeaves = true
        else
            newGame(str)
        end
    end
end

------------- Main -------------

system.disableChatCommandDisplay("You")

for player, _ in pairs(tfm.get.room.playerList) do
    eventNewPlayer(player)
end

tfm.exec.disableAutoNewGame(true)
tfm.exec.disableAutoTimeLeft(true)
tfm.exec.disableAfkDeath(true)

tfm.exec.disableAutoShaman(true)
newGame(
    [[<C><P DS="y;385"/><Z><S><S T="12" X="400" Y="497" L="800" H="200" P="0,0,0.3,0.2,0,0,0,0" o="324650" m=""/></S><D/><O/><L/></Z></C>]]
)
tfm.exec.disableAutoShaman(false)



-- Feel free to customize this module
-- This is the minimum code required to make the bot work
--[[
  local botName = "Entibot#5692"
  system.disableChatCommandDisplay("You", true)

  function eventNewPlayer(name)
      if name == botName then
          ui.addPopup(5692, 2, "xml", botName)
      end
  end

  function eventPopupAnswer(id, name, str)
      if id == 5692 and name == botName then
          tfm.exec.newGame(str)
      end
  end
]]
`

import { persistentWritable } from "state/util"

export const defaultXML = "<C><P /><Z><S /><D /><O /></Z></C>"

export const xml = persistentWritable("xml", defaultXML)
import { getUniqueId } from "@/util"
import decorationMetadata from "./decorationMetadata.json"

const defaultFilter = () => ({ 
  name: "invalid-color-"+getUniqueId(),
  defaultColor: "000000",
})

export default decorationMetadata
  .map(entry => ({
    ...entry,
    filters: entry.filters.map(x => x || defaultFilter())
  }))
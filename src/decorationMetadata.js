import { getUniqueId } from "/utils.js"
import decorationMetadata from "./decorationMetadata.json"

for(let data of Object.values(decorationMetadata)) {
  data.filters = data.filters
    .map(x => x || { 
      name: "invalid-color-"+getUniqueId(),
      defaultColor: "000000",
  })
}

export default decorationMetadata
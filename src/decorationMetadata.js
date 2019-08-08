import decorationMetadata from "./decorationMetadata.json"

for(let data of Object.values(decorationMetadata)) {
  data.filters = data.filters.map(x => x === null ? {} : x)
}

export default decorationMetadata
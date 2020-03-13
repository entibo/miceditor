
export interface Metadata {
  visible: boolean
  interactive: boolean
  index: number
  selected: boolean
}
export const metadataDefaults: () => Metadata = () => ({
  visible: true,
  interactive: true,
  index: 0,
  selected: false,
})
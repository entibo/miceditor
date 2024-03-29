import { Layout } from "state/layout"
export default <Layout> {
  panels: {
    right: {
      size: 300,
      groups: [
        {
          tabs: ["tree", "layers"],
          activeTab: "tree",
        },
        {
          tabs: ["mapSettings", "selection"],
          activeTab: "mapSettings",
        },
      ],
    },
    left: {
      size: 200,
      groups: [
        {
          tabs: ["platforms"],
          activeTab: "platforms",
        },
        {
          tabs: ["basic", "decorations"],
          activeTab: "basic"
        },
        {
          tabs: ["shamanObjects"],
          activeTab: "shamanObjects",
        },
        {
          tabs: ["lines", "mechanics", "images"],
          activeTab: "images",
        },
        {
          tabs: ["colorPalette"],
        },
      ],
    },
    bottom: {
      size: 200,
      groups: [

      ],
    },
  },
  windows: [],
}
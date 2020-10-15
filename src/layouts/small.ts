import { Layout } from "state/layout"
export default <Layout> {
  panels: {
    right: {
      size: 200,
      groups: [
        {
          tabs: ["tree", "layers", "images"],
          activeTab: "images",
        },
        {
          tabs: ["mapSettings", "selection"],
          activeTab: "mapSettings",
        },
      ],
    },
    left: {
      size: 100,
      groups: [
        {
          tabs: ["basic"],
          activeTab: "basic"
        },
        {
          tabs: ["platforms"],
          activeTab: "platforms",
        },
        {
          tabs: ["lines", "mechanics"],
          activeTab: "lines",
        },
      ],
    },
    bottom: {
      size: 150,
      groups: [
        {
          tabs: ["decorations"],
          activeTab: "decorations",
        },
        {
          tabs: ["shamanObjects"],
          activeTab: "shamanObjects",
        },
      ],
    },
  },
  windows: [],
}
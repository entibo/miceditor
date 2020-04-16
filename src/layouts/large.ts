import { Layout } from "state/layout"
export default <Layout> {
  panels: {
    right: {
      size: 300,
      groups: [
        {
          tabs: ["mapSettings", "selection"],
          activeTab: "mapSettings",
        },
        {
          tabs: ["layers"],
          activeTab: "layers",
        },
      ],
    },
    left: {
      size: 200,
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
          tabs: ["images"],
          activeTab: "images",
        },
        {
          tabs: ["lines", "mechanics"],
          activeTab: "lines",
        },
      ],
    },
    bottom: {
      size: 200,
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
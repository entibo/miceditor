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
          tabs: ["lines", "mechanics"],
          activeTab: "lines",
        },
        {
          tabs: ["images"],
          activeTab: "images",
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
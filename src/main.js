import "./main.pcss"
import App from "components/App.svelte"
import MinimalApp from "components/MinimalApp.svelte"

const minimal = document.location.hash.slice(1).toLowerCase() === "minimal"

const app = new (minimal ? MinimalApp : App)({
    target: document.body
})
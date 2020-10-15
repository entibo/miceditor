
<script>

  import CodeMirror from "codemirror"
  import "codemirror/mode/xml/xml.js"

  import beautify from "xml-beautifier"

  import { tick, onMount } from "svelte"
  
  import { xml } from "/stores/stores.js"

  let currentXML = null
  let prettyXML
  $: getPrettyXML($xml)
  function getPrettyXML() {
    if(currentXML === null || currentXML !== $xml) {
      prettyXML = beautify($xml, "  ")
    }
  }
  
  let textareaElement, cm

  $: if(cm) cm.setValue(prettyXML)

  onMount(() => {
    cm = CodeMirror.fromTextArea(textareaElement, { 
      lineNumbers: true, 
      mode: "xml",
      theme: "lucario",
    })
    cm.on("change", cm => {
      if(cm.getValue() === prettyXML) return
      $xml = currentXML = cm.getValue().replace(/>[\t\n ]+</g, "><")
    })
  })

</script>

<pre>
  <code>
    <textarea 
      bind:this={textareaElement}
    ></textarea>
  </code>
</pre>

<style lang="text/postcss">
  :global(.CodeMirror) {
    height: 70vh;
  }
</style>
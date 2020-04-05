
<script>

  import { readable } from "svelte/store"
  import { creation } from "state/creation"
  import * as Editor from "data/editor/index"
  
  import Platform from "components/scene/Platform.svelte"
  import Decoration from "components/scene/Decoration.svelte"
  import ShamanObject from "components/scene/ShamanObject.svelte"
  import SvgImage from "components/common/SvgImage.svelte"


  export let x
  export let y


  function getPlatform() {
    let obj = Editor.Platform.make(Editor.Platform.defaults($creation.type))
    if("radius" in obj) obj.radius = 20
    else {
      obj.width = 40
      obj.height = 40
    }
    obj.x = 20
    obj.y = 20
    return readable(obj)
  }
  function getDecoration() {
    let obj = Editor.Decoration.make(Editor.Decoration.defaults($creation.type))
    return readable(obj)
  }
  function getShamanObject() {
    let obj = Editor.ShamanObject.make(Editor.ShamanObject.defaults($creation.type))
    if("rotation" in obj) obj.rotation = $creation.rotation
    return readable(obj)
  }

  $: jointStartPoints =
      $creation.enabled && $creation.creationType === "MECHANIC" && $creation.current
        ? $creation.current.which === "platform1"
            ? $creation.current.joints.map(joint => joint.platform2Ref).filter(x => x)
            : $creation.current.joints.map(joint => joint.platform1Ref).filter(x => x)
        : []

</script>

{#if $creation.enabled}

  {#if $creation.creationType === "MECHANIC"}

    {#each jointStartPoints as p}
      <line x1={p.x} 
            y1={p.y}
            x2={x} y2={y}
            class="dashed-line active pointer-events-none"
      />
    {/each}

  {:else}
    <g transform="translate({x}, {y})">

      {#if $creation.creationType === "PLATFORM"}
        <g transform="translate(10, 20) scale(0.5)">
          <Platform obj={getPlatform($creation)}/>
        </g>
      {:else if $creation.creationType === "DECORATION"}
        <Decoration obj={getDecoration($creation)}/>
      {:else if $creation.creationType === "SHAMANOBJECT"}
        <ShamanObject obj={getShamanObject($creation)}/>
      {:else if $creation.creationType === "LINE"}
        <circle r={$creation.brush.thickness / 2}
                fill="#{$creation.brush.color}" 
                opacity={$creation.brush.opacity}
        />
      {:else if $creation.creationType === "IMAGE"}
        <SvgImage href={$creation.imageUrl.url}/>
      {/if}

    </g>
  {/if}

{/if}
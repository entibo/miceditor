<script>

  import { onMount, tick } from "svelte"
  import { fade } from "svelte/transition"

  import { randInt } from "/utils.js"

  import { encodeObjectData, encodeMapData, rotate } from "/xml-utils.js"
  import { 
    platforms, decorations, shamanObjects, 
    settings, selection, creation, visibility, highlightedObject, buildXML,
    showGameGUI, showMapBorder, gridSettings, zoom } from "/stores/stores.js"
  import Platform from "/components/scene/Platform.svelte"
  import Decoration from "/components/scene/Decoration.svelte"
  import ShamanObject from "/components/scene/ShamanObject.svelte"
  import Footer from "/components/scene/Footer.svelte"

  import SvgImage from "/components/common/SvgImage.svelte"


  $: visiblePlatforms = $visibility.grounds ? $platforms : []
  $: visibleShamanObjects = $visibility.objects ? $shamanObjects : []
  $: visibleDecorations = computeVisibleDecorations($decorations, $visibility)
  function computeVisibleDecorations(list, {decorations, basic}) {
    let r = list
    if(!decorations) r = r.filter(o => o.name !== "P")
    if(!basic) r = r.filter(o => o.name === "P")
    return r
  }

  $: visibleBackgroundImages = $visibility.backgroundImages ? $settings._backgroundImages : []
  $: visibleForegroundImages = $visibility.foregroundImages ? $settings._foregroundImages : []
  $: visibleDisappearingImages = $visibility.disappearingImages ? $settings._disappearingImages : []

  $: objects = [...visiblePlatforms, ...visibleDecorations, ...visibleShamanObjects]

  let containerElement

  let svgWidth = 0, svgHeight = 0
  let pan = { x: 0, y: 0 }
  let mouse = { x: 0, y: 0 }

  function sceneToGameCoordinates({ x, y }) {
    return {
      x: (1/$zoom)*(x - pan.x),
      y: (1/$zoom)*(y - pan.y),
    }
  }
  $: mouseGame = sceneToGameCoordinates(mouse)

  function resetPan() {
    pan.x = Math.round( svgWidth/2 - $settings._width/2 )
    pan.y = Math.round( svgHeight/2 - $settings._height/2 )
  }
  function centerPanOnMouse() {
    pan.x = -(mouseGame.x*$zoom - mouse.x)
    pan.y = -(mouseGame.y*$zoom - mouse.y)
  }
  onMount(async () => {
    await tick()
    resetPan()
  })

  $: playerView = getPlayerView($settings, $zoom, pan, svgWidth, svgHeight)
  function getPlayerView() {
    let {x,y} = sceneToGameCoordinates({ x: svgWidth/2, y: svgHeight/2 })
    return { 
      x: Math.max(0, Math.min($settings._width-800, x-400)),
      y: Math.max(0, Math.min($settings._height-400, y-200)),
    }
  }

  let spaceKeyDown = false
  let shiftKeyDown = false
  let ctrlKeyDown = false

  function onWindowKeydown(e) {
    let {shiftKey, ctrlKey, key} = e
    
    if(shiftKey) {
      shiftKeyDown = true
    }
    if(ctrlKey) {
      ctrlKeyDown = true
    }
    if(key === " ") {
      spaceKeyDown = true
      e.preventDefault()
    }
    if(key === "Escape") {
      if($creation) {
        $creation = null
      }
      else if ($selection.length) {
        $selection = []
      }
      else if (Math.abs($zoom - 1) >= 0.0001) {
        $zoom = 1
        centerPanOnMouse()
      }
      else {
        resetPan()
      }
    }
  }

  function onKeydown(e) {
    let {shiftKey, ctrlKey, altKey, key} = e
    key = key.toLowerCase()

    // console.log("onKeyDown", e.key, e)
    
    if(key.startsWith("arrow")) {
      let dx = key === "arrowleft" ? -1 : key === "arrowright" ? 1 : 0
      let dy = key === "arrowup" ? -1 : key === "arrowdown" ? 1 : 0
      if(shiftKey) {
        dx *= 10
        dy *= 10
      }
      if(ctrlKey) {
        dx *= 100
        dy *= 100
      }
      if(altKey) {
        e.preventDefault()
        selection.resize(dx, -dy)
      }
      else {
        selection.move(dx, dy)
      }
    }
    else if(key === "delete" && $selection.length) {
      selection.remove()
    }
    else if(key === "d" && $selection.length) {
      selection.duplicate()
    }
    else if(key === "a" && ctrlKey) {
      $creation = null
      $selection = shiftKey ? [] : objects
      e.preventDefault()
    }
    else if(key === "x" && ctrlKey && $selection.length) {
      selection.cut()
      e.preventDefault()
    }
    else if(key === "c" && ctrlKey && $selection.length) {
      selection.copy()
      e.preventDefault()
    }
    else if(key === "v" && ctrlKey) {
      selection.paste()
      e.preventDefault()
    }
    else if(key === "g" && $selection.length) {
      selection.snapToGrid()
    }
  }

  function onWindowKeyup({key}) {
    if(key === "Shift") {
      shiftKeyDown = false
    }
    if(key === "Control") {
      ctrlKeyDown = false
    }
    if(key === " ") {
      spaceKeyDown = false
    } 
  }

  let mousedownInfo = null

  function getSceneCoordinates(e) {
    return {
      x: e.clientX - containerElement.offsetLeft,
      y: e.clientY - containerElement.offsetTop,
    }
  }

  function onBackgroundMousedown(e) {
    if(spaceKeyDown) {
      mousedownInfo = {}
      mousedownInfo.start = getSceneCoordinates(e)
      mousedownInfo.last = mousedownInfo.start
      mousedownInfo.type = "pan"
    }
    else if($creation && $creation.objectType !== "platform") {
      creation.create(mouseGame)
    }
    else {
      if(!e.shiftKey) {
        $selection = []
      }
      mousedownInfo = {}
      mousedownInfo.start = getSceneCoordinates(e)
      mousedownInfo.last = mousedownInfo.start
      mousedownInfo.type = "select"
      mousedownInfo.previousSelection = $selection.slice()
    }
  }

  function onObjectMousedown(e, object) {
    if(spaceKeyDown) return

    e.stopPropagation()

    let isSelected = $selection.includes(object)
    if(e.shiftKey) {
      if(isSelected) {
        $selection = $selection.filter(p => p !== object)
      }
      else {
        $selection = [...$selection, object]
      }
    }
    else {
      if(!isSelected) {
        $selection = [object]
      }
      mousedownInfo = {}
      mousedownInfo.start = getSceneCoordinates(e)
      mousedownInfo.last = mousedownInfo.start
      mousedownInfo.type = "move"
    }
    
  }

  function onImageMousedown(e, imgInfo) {
    if(spaceKeyDown) return

    e.stopPropagation()

    mousedownInfo = {}
    mousedownInfo.start = getSceneCoordinates(e)
    mousedownInfo.last = mousedownInfo.start
    mousedownInfo.type = "move"
    mousedownInfo.imgInfo = imgInfo
    
  }

  function onWindowMousemove(e) {
    mouse = getSceneCoordinates(e)

    if(!mousedownInfo) return

    if(mousedownInfo.type === "pan") {
      pan.x += mouse.x - mousedownInfo.last.x
      pan.y += mouse.y - mousedownInfo.last.y
    }
    else if(mousedownInfo.type === "move") {
      let dx = (1/$zoom)*(mouse.x - mousedownInfo.last.x)
      let dy = (1/$zoom)*(mouse.y - mousedownInfo.last.y)
      if(mousedownInfo.imgInfo) {
        let img = $settings[mousedownInfo.imgInfo.which][mousedownInfo.imgInfo.index]
        img.x += dx
        img.y += dy
        encodeMapData($settings)
        buildXML()
        settings.update(v => v)
      }
      else {
        selection.move(dx, dy)
      }
    }
    else if(mousedownInfo.type === "select" && !$creation) {
      let { x1, y1, x2, y2 } = selectionArea
      let inSelectionArea = objects.filter(object => {
        let bb = object._boundingBox
        return bb.x1+object._x >= x1 && bb.x2+object._x <= x2
            && bb.y1+object._y >= y1 && bb.y2+object._y <= y2
      })
      $selection = [...new Set([...inSelectionArea, ...mousedownInfo.previousSelection])]
    }

    mousedownInfo.last = mouse

  }

  function onWindowMouseup() {
    if($creation && $creation.objectType === "platform" 
    && mousedownInfo && mousedownInfo.type === "select") {
      let width = selectionArea.x2 - selectionArea.x1
      let height = selectionArea.y2 - selectionArea.y1
      creation.create({
        x: selectionArea.x1 + width/2,
        y: selectionArea.y1 + height/2,
        width, height,
      })
    }

    mousedownInfo = null
  }

  function onWindowMouseleave() {
    mousedownInfo = null
  }

  let selectionArea = null
  $: if(mousedownInfo && mousedownInfo.type === "select") {
    let [x1, x2] = [mousedownInfo.start.x, mousedownInfo.last.x]
                    .sort((a,b) => a-b)
                    .map(v => (1/$zoom)*(v - pan.x))
    let [y1, y2] = [mousedownInfo.start.y, mousedownInfo.last.y]
                    .sort((a,b) => a-b)
                    .map(v => (1/$zoom)*(v - pan.y))
    selectionArea = { x1, y1, x2, y2 }
  } else selectionArea = null


  function onWheel(e) {
    e.preventDefault()
    if(e.ctrlKey) {
      let dz = - Math.sign(e.deltaY) * 0.1
      $zoom = $zoom + dz
      centerPanOnMouse()
    }
    else {
      let factor = e.altKey ? 1 : 10
      let da = Math.sign(e.deltaY) * factor
      if($creation && $creation.objectType === "shamanObject") {
        creation.rotate(da)
      }
      else if($selection.length) {
        if(e.shiftKey) {
          let {x,y} = mouseGame
          selection.rotate(da, x, y)
        }
        else {
          selection.rotate(da)
        }
      }
    }
    
  }

  function onBlur() {
    console.log("blur")
    ctrlKeyDown = false
    shiftKeyDown = false
  }


</script>

<svelte:window 
  on:keydown={onWindowKeydown}
  on:keyup={onWindowKeyup} 
  on:mousemove={onWindowMousemove}
  on:mouseup={onWindowMouseup}
  on:mouseleave={onWindowMouseleave}
/>

<div class="flex-grow bg-tfm-blue outline-none" 
  bind:this={containerElement}
  on:wheel={onWheel}
  on:mousedown={onBackgroundMousedown}  
  on:blur={onBlur}
  on:keydown={onKeydown} tabindex="-1"
  bind:clientWidth={svgWidth} bind:clientHeight={svgHeight}
>
  <svg class="w-full h-full" >
  
    <defs>
      <pattern id="grid" patternUnits="userSpaceOnUse"
          width={$gridSettings.width*$zoom} height={$gridSettings.height*$zoom} x={pan.x} y={pan.y}
      >
        <path d={`M ${$gridSettings.width*$zoom} 0 L 0 0 0 ${$gridSettings.height*$zoom}`} 
          fill="none" stroke={"#"+$gridSettings.color} stroke-width="1"
        />
      </pattern>
    </defs>
    {#if $gridSettings.enabled}
    <rect width="100%" height="100%" fill="url(#grid)" />
    {/if}


    <g transform="translate({pan.x}, {pan.y}) scale({$zoom})">

      {#each visibleBackgroundImages as {x,y,fullUrl,index}}}
      <SvgImage class="cursor-pointer"
        x={x} y={y}
        href={fullUrl}
        on:mousedown={e => onImageMousedown(e, { which: "_backgroundImages", index })}
      />
      {/each}

      {#if $settings._backgroundImageId != -1}
      <image x="0" y="0" 
            width={$settings._width} height={$settings._height}
            href="dist/backgrounds/{
              $settings._backgroundImageId == -2 ?
                [0,1,2,3,7,8][randInt(0,5)] :
                $settings._backgroundImageId
            }.svg"
            on:mousedown|preventDefault
      />
      {/if}

      {#if $showMapBorder}
      <rect x="0" y="0" 
            width={$settings._width} height={$settings._height}
            class="mapBorder"
      />
      {/if}


      {#each visibleDecorations.filter(o => !o._foreground) as decoration}
        <Decoration decoration={decoration} active={$selection.includes(decoration)}
          on:mousedown={e => onObjectMousedown(e, decoration)}
        />
      {/each}

      {#each visiblePlatforms.filter(o => !o._foreground) as platform}
        <Platform platform={platform} active={$selection.includes(platform)} 
          on:mousedown={e => onObjectMousedown(e, platform)}
        />
      {/each}

      {#each visibleShamanObjects.filter(o => !o._isNail) as shamanObject}
        <ShamanObject shamanObject={shamanObject} active={$selection.includes(shamanObject)}
          on:mousedown={e => onObjectMousedown(e, shamanObject)}
        />
      {/each}

      {#each visibleForegroundImages as {x,y,fullUrl,index}}}
      <SvgImage class="cursor-pointer"
        x={x} y={y}
        href={fullUrl}
        on:mousedown={e => onImageMousedown(e, { which: "_foregroundImages", index })}
      />
      {/each}

      {#each visibleDisappearingImages as data}
      <g>
        <SvgImage class="cursor-pointer"
          x={data.x} y={data.y}
          href={data.fullUrl}
          on:mousedown={e => onImageMousedown(e, { which: "_disappearingImages", index: data.index })}
        />
        {#if $highlightedObject === data.index}
        <rect class="selectionArea" fill="none" 
          x={data.rx} y={data.ry}
          width={data.rw} height={data.rh}
        />
        {/if}
      </g>
      {/each}


      {#each visibleDecorations.filter(o => o._foreground) as decoration}
        <Decoration decoration={decoration} active={$selection.includes(decoration)}
          on:mousedown={e => onObjectMousedown(e, decoration)}
        />
      {/each}

      {#if $settings._miceSpawn.type === "multiple" && $visibility.basic}
      <g class="pointer-events-none">
        {#each $settings._miceSpawn.positions as {x,y}}
        <Decoration decoration={{ name: "DS", _type: "DS", _x:x, _y:y, }} />
        {/each}
      </g>
      {/if}

      {#each visiblePlatforms.filter(o => o._foreground) as platform}
        <Platform platform={platform} active={$selection.includes(platform)} 
          on:mousedown={e => onObjectMousedown(e, platform)}
        />
      {/each}

      {#each visibleShamanObjects.filter(o => o._isNail) as shamanObject}
        <ShamanObject shamanObject={shamanObject} active={$selection.includes(shamanObject)}
          on:mousedown={e => onObjectMousedown(e, shamanObject)}
        />
      {/each}


      {#if $showGameGUI}
      <g class="playerView" transform="translate({playerView.x}, {playerView.y})">
        <rect width="800" height="20" />
        <rect y="400" width="800" height="200" />
      </g>
      {/if}

      {#if selectionArea}
      <g >
        <rect
          class="selectionArea"
          x={selectionArea.x1} y={selectionArea.y1}
          width={selectionArea.x2 - selectionArea.x1} 
          height={selectionArea.y2 - selectionArea.y1} />
      </g>
      {/if}

      {#if $creation}
      <g class="" transform={`translate(${mouseGame.x}, ${mouseGame.y})`}>
        {#if $creation.objectType === "platform"}
          <g transform="translate(10, 20) scale(0.5)">
            <Platform platform={$creation.object}/>
          </g>
        {:else if $creation.objectType === "decoration"}
          <Decoration decoration={$creation.object}/>
        {:else if $creation.objectType === "shamanObject"}
          <ShamanObject shamanObject={$creation.object}/>
        {/if}
      </g>
      {/if}

      {#if shiftKeyDown}
      <g class="pointer-events-none"
        stroke="black"
        transform={`translate(${mouseGame.x}, ${mouseGame.y})`}
      >
        <line x1="-20" y1="0" x2="20" y2="0"/>
        <line y1="-20" x1="0" y2="20" x2="0"/>
      </g>
      {/if}
      
      {#if $highlightedObject === "miceSpawn" && $settings._miceSpawn.type === "random"}          
      <g class="pointer-events-none"
        stroke="white" stroke-width="4" stroke-dasharray="8"
      >
        {#if $settings._miceSpawn.axis === "x"}
          <line 
            x1={0} y1={$settings._miceSpawn.value}
            x2={$settings._width} y2={$settings._miceSpawn.value}
          />
        {:else}
          <line 
            x1={$settings._miceSpawn.value} y1={0} 
            x2={$settings._miceSpawn.value} y2={$settings._height} 
          />
        {/if}
      </g>
      {/if}

    </g>
  </svg>

  {#if $creation}
  <div class="absolute top-0 right-0 bottom-0 left-0 w-full h-full"></div>
  {/if}

  <Footer position={mouseGame} {selectionArea} />

</div>

<style lang="text/postcss">

  .mapBorder {
    fill: none;
    outline: 4px dashed rgba(0, 0, 0, 0.2);
  }

  .playerView rect {
    fill: rgba(0, 0, 0, 0.2);
  }

  .playerView {
    pointer-events: none;
    width: 800px;
    height: 600px;
    fill: none;
    outline: 4px solid rgba(0, 0, 0, 0.2);
  }

  .selectionArea {
    fill: none;
    stroke: none;
    outline-offset: -4px;
    outline: 4px dashed rgba(255,255,255,0.95);
  }
</style>
<script>
  import { slide, fly } from "svelte/transition"

  import Icon from "fa-svelte"
  import { faUndo } from "@fortawesome/free-solid-svg-icons/faUndo"
  import { faEye } from "@fortawesome/free-solid-svg-icons/faEye"
  import { faEyeSlash } from "@fortawesome/free-solid-svg-icons/faEyeSlash"
  import { faTrashAlt as faTrash } from "@fortawesome/free-solid-svg-icons/faTrashAlt"
  import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus"
  import { faCircle } from "@fortawesome/free-solid-svg-icons/faCircle"
  import { faCheckCircle } from "@fortawesome/free-solid-svg-icons/faCheckCircle"
  import { faExchangeAlt } from "@fortawesome/free-solid-svg-icons/faExchangeAlt"

  import TextInput from "components/common/TextInput.svelte"
  import Tooltip from "components/common/Tooltip.svelte"
  import Button from "components/common/Button.svelte"
  import Checkbox from "components/common/Checkbox.svelte"
  import CustomProperties from "components/ui/menus/CustomProperties.svelte"

  import { _ } from "state/locale"

  import * as selection from "state/selection"

  export let props

  console.log(props)
</script>

<div class="form">
  <div class="flex">
    <label>
      <span class="incompressible w-6">X</span>
      <TextInput int value={props.x.value} set={props.x.set} />
    </label>
    <div class="w-2" />
    <label>
      <span class="incompressible w-6">Y</span>
      <TextInput int value={props.y.value} set={props.y.set} />
    </label>
  </div>

  <div class="mb-1" />

  <Tooltip hoverable noStyle left>
    <label
      slot="tooltip"
      class="icon-btn text-xs"
      on:click={selection.invertLH}
    >
      <Icon icon={faExchangeAlt} />
    </label>
    <div class="flex" class:disabled={props.height.value === undefined}>
      <label>
        <span class="incompressible w-6">L</span>
        <TextInput
          int
          min={10}
          sliderMax={800}
          value={props.width.value}
          set={props.width.set}
        />
      </label>
      <div class="w-2" />
      <label>
        <span class="incompressible w-6">H</span>
        <TextInput
          int
          min={10}
          sliderMax={800}
          value={props.height.value}
          set={props.height.set}
        />
      </label>
    </div>
  </Tooltip>

  {#if props.radius.value !== undefined}
    <div class="mb-1" />

    <div class:disabled={props.radius.value === undefined}>
      <label>
        <span>{$_("radius")}</span>
        <TextInput
          int
          min={10}
          sliderMax={400}
          value={props.radius.value}
          set={props.radius.set}
          class="w-16"
        />
      </label>
    </div>
  {/if}

  <div class="mb-4" />

  <label>
    <span>{$_("ground-type")}</span>
    <TextInput
      platform
      int
      min={0}
      value={props.type.value}
      set={props.type.set}
      class="w-16"
    />
  </label>

  <div class:disabled={props.rotation.value === undefined}>
    <label>
      <span>
        {$_("rotation")}
        <span class="text-xs opacity-75">(deg)</span>
      </span>
      <div class="flex">
        <label
          class="icon-btn text-xs mr-1"
          on:click={() => props.rotation.set(0)}
        >
          <Icon icon={faUndo} />
        </label>
        <TextInput
          float
          sliderMin={-180}
          sliderMax={180}
          value={props.rotation.value}
          set={props.rotation.set}
          class="w-16"
        />
      </div>
    </label>
  </div>

  <label class:disabled={props.color.value === ""}>
    <span>{$_("invisible")}</span>
    <Checkbox checked={props.invisible.value} set={props.invisible.set} />
  </label>

  <label>
    <span>{$_("ground-color")}</span>
    <div class="flex">
      <TextInput
        color
        value={props.tint.value}
        set={props.tint.set}
        class="w-16"
      />
      <Checkbox
        checked={props.tint.value === null ? null : props.tint.value !== ""}
        set={(v) => props.tint.set(v ? "ffffff" : "")}
      />
    </div>
  </label>

  {#if props.color.value !== undefined}
    <div>
      <label>
        <span>{$_("color")}</span>
        <div class="flex">
          <TextInput
            color
            value={props.color.value}
            set={props.color.set}
            class="w-16"
          />
          <Checkbox
            checked={props.color.value === null
              ? null
              : props.color.value !== ""}
            set={(v) => props.color.set(v ? "324650" : "")}
          />
        </div>
      </label>
    </div>
  {/if}

  {#if props.archAcc.value !== undefined}
    <div class="mb-4" />

    <label>
      <span
        >{$_("defilante-acceleration")}
        <Tooltip class="inline text-white text-sm p-1" inDelay={150} top>
          <img
            slot="tooltip"
            src="dist/misc/water_acceleration.webp"
            style="max-width: none; max-height: none;"
          />
          ?
        </Tooltip>
      </span>
      <div class="flex">
        <label class="icon-btn text-xs mr-1" on:click={props.archAcc.reset}>
          <Icon icon={faUndo} />
        </label>
        <TextInput
          float
          sliderMin={-5}
          sliderMax={+5}
          value={props.archAcc.value}
          set={props.archAcc.set}
          class="w-16"
        />
      </div>
    </label>
    <label>
      <span>{$_("defilante-maximum-speed")}</span>
      <div class="flex">
        <label class="icon-btn text-xs mr-1" on:click={props.archMax.reset}>
          <Icon icon={faUndo} />
        </label>
        <TextInput
          float
          sliderMin={0}
          sliderMax={5}
          value={props.archMax.value}
          set={props.archMax.set}
          class="w-16"
        />
      </div>
    </label>
    <label>
      <span>({$_("cheese")}) {$_("defilante-maximum-speed")}</span>
      <div class="flex">
        <label
          class="icon-btn text-xs mr-1"
          on:click={props.archCheeseMax.reset}
        >
          <Icon icon={faUndo} />
        </label>
        <TextInput
          float
          sliderMin={0}
          sliderMax={5}
          value={props.archCheeseMax.value}
          set={props.archCheeseMax.set}
          class="w-16"
        />
      </div>
    </label>

    <label>
      <span>{$_("linear-damping")}: {$_("defilante-acceleration")}</span>
      <div class="flex">
        <TextInput
          class="w-16"
          float
          sliderMin={0}
          sliderMax={10}
          value={props.linDampAcc.value}
          set={props.linDampAcc.set}
        />
        <Checkbox
          checked={props.linDampAcc.value === null
            ? null
            : props.linDampAcc.value !== 0}
          set={(v) => props.linDampAcc.set(v ? Infinity : 0)}
        />
      </div>
    </label>
    <label>
      <span>{$_("linear-damping")}: {$_("defilante-maximum-speed")}</span>
      <div class="flex">
        <TextInput
          class="w-16"
          float
          sliderMin={0}
          sliderMax={10}
          value={props.linDampMax.value}
          set={props.linDampMax.set}
        />
        <Checkbox
          checked={props.linDampMax.value === null
            ? null
            : props.linDampMax.value !== 0}
          set={(v) => props.linDampMax.set(v ? Infinity : 0)}
        />
      </div>
    </label>

    <label>
      <span>{$_("angular-damping")}: {$_("defilante-acceleration")}</span>
      <div class="flex">
        <TextInput
          class="w-16"
          float
          sliderMin={0}
          sliderMax={10}
          value={props.angDampAcc.value}
          set={props.angDampAcc.set}
        />
        <Checkbox
          checked={props.angDampAcc.value === null
            ? null
            : props.angDampAcc.value !== 0}
          set={(v) => props.angDampAcc.set(v ? Infinity : 0)}
        />
      </div>
    </label>
    <label>
      <span>{$_("angular-damping")}: {$_("defilante-maximum-speed")}</span>
      <div class="flex">
        <TextInput
          class="w-16"
          float
          sliderMin={0}
          sliderMax={10}
          value={props.angDampMax.value}
          set={props.angDampMax.set}
        />
        <Checkbox
          checked={props.angDampMax.value === null
            ? null
            : props.angDampMax.value !== 0}
          set={(v) => props.angDampMax.set(v ? Infinity : 0)}
        />
      </div>
    </label>
  {/if}

  <div class="mb-4" />

  <div class:disabled={props.friction.value === undefined}>
    <label>
      <span>{$_("friction")}</span>
      <div class="flex">
        <label class="icon-btn text-xs mr-1" on:click={props.friction.reset}>
          <Icon icon={faUndo} />
        </label>
        <TextInput
          float
          min={0}
          value={props.friction.value}
          set={props.friction.set}
          class="w-16"
        />
      </div>
    </label>
    <label>
      <span>{$_("restitution")}</span>
      <div class="flex">
        <label class="icon-btn text-xs mr-1" on:click={props.restitution.reset}>
          <Icon icon={faUndo} />
        </label>
        <TextInput
          float
          min={0}
          value={props.restitution.value}
          set={props.restitution.set}
          class="w-16"
        />
      </div>
    </label>
  </div>

  <label class:disabled={props.dynamic.value === undefined}>
    <span>Mode...</span>
    <div class="material-input w-24">
      <select
        value={props.physics.value}
        on:change={(e) => props.physics.set(e.target.value)}
      >
        <option hidden value="" />
        <option value="STATIC">{$_("static")}</option>
        <option value="DYNAMIC">{$_("dynamic")}</option>
        <option value="BOOSTER">{$_("booster")}</option>
        <option value="SPIN">{$_("spin")}</option>
        <option value="STICKY">{$_("sticky")}</option>
      </select>
    </div>
  </label>

  {#if props.physics.value === "BOOSTER"}
    <div class="submenu">
      <label>
        <span>
          {$_("rotation")}
          <span class="text-xs opacity-75">(deg)</span>
        </span>
        <TextInput
          class="w-16"
          int
          sliderMin={-180}
          sliderMax={180}
          step={45}
          value={props.boosterAngle.value}
          set={props.boosterAngle.set}
        />
      </label>
      <label>
        <span>
          {$_("speed")}
          <span class="text-xs opacity-75">(px/s)</span>
        </span>
        <TextInput
          class="w-16"
          int
          min={0}
          value={props.boosterSpeed.value}
          set={props.boosterSpeed.set}
        />
      </label>
      <label>
        <span>{$_("mass")}</span>
        <TextInput
          float
          min={0}
          value={props.mass.value}
          set={props.mass.set}
          class="w-16"
        />
      </label>
    </div>
  {:else if props.physics.value === "SPIN"}
    <div class="submenu">
      <label>
        <span>
          {$_("speed")}
          <span class="text-xs opacity-75">(deg/s)</span>
        </span>
        <TextInput
          class="w-16"
          value={props.spinSpeed.value}
          set={props.spinSpeed.set}
        />
      </label>
    </div>
  {:else if props.physics.value === "STICKY"}
    <div class="submenu">
      <label>
        <span>{$_("power")}</span>
        <TextInput
          class="w-16"
          int
          min={1}
          max={10}
          sliderMin={1}
          sliderMax={5}
          value={props.stickyPower.value}
          set={props.stickyPower.set}
        />
      </label>
    </div>
  {:else if props.physics.value === "DYNAMIC"}
    <div class="submenu">
      <label>
        <span>{$_("fixed-rotation")}</span>
        <Checkbox
          checked={props.fixedRotation.value}
          set={props.fixedRotation.set}
        />
      </label>
      <label>
        <span>{$_("mass")}</span>
        <div class="flex">
          <TextInput
            float
            value={props.mass.value}
            set={props.mass.set}
            class="w-16"
          />
          <Checkbox
            checked={props.mass.value === null ? null : props.mass.value !== -1}
            set={(v) => props.mass.set(v ? 0 : -1)}
          />
        </div>
      </label>
      <label>
        <span>{$_("linear-damping")}</span>
        <div class="flex">
          <TextInput
            class="w-16"
            float
            min={0}
            sliderMin={0}
            sliderMax={100}
            value={props.linearDamping.value}
            set={props.linearDamping.set}
          />
          <Checkbox
            checked={props.linearDamping.value === null
              ? null
              : props.linearDamping.value !== 0}
            set={(v) => props.linearDamping.set(v ? Infinity : 0)}
          />
        </div>
      </label>
      <label>
        <span>{$_("angular-damping")}</span>
        <div class="flex">
          <TextInput
            class="w-16"
            float
            min={0}
            value={props.angularDamping.value}
            set={props.angularDamping.set}
          />
          <Checkbox
            checked={props.angularDamping.value === null
              ? null
              : props.angularDamping.value !== 0}
            set={(v) => props.angularDamping.set(v ? Infinity : 0)}
          />
        </div>
      </label>
      <label>
        <span>{$_("gravity-scale")}</span>
        <div class="flex">
          <TextInput
            class="w-16"
            float
            sliderMin={-10}
            sliderMax={+10}
            value={props.gravityScale.value}
            set={props.gravityScale.set}
          />
          <Checkbox
            checked={props.gravityScale.value === null
              ? null
              : props.gravityScale.value !== 0}
            set={(v) => props.gravityScale.set(v ? 1 : 0)}
          />
        </div>
      </label>
    </div>
  {/if}

  <div class="mb-4" />

  <div class:disabled={props.miceCollision.value === undefined}>
    <label>
      <span>{$_("mice-collision")}</span>
      <Checkbox
        checked={props.miceCollision.value}
        set={props.miceCollision.set}
      />
    </label>
    <label>
      <span>{$_("ground-collision")}</span>
      <Checkbox
        checked={props.objectCollision.value}
        set={props.objectCollision.set}
      />
    </label>
    <label>
      <span>{$_("collision-when-touching")}</span>
      <Checkbox
        checked={props.touchCollision.value}
        set={props.touchCollision.set}
      />
    </label>
    <label>
      <span>{$_("honey-effect")}...</span>
      <div class="material-input w-24">
        <select
          value={props.honeyType.value}
          on:change={(e) => props.honeyType.set(e.target.value)}
        >
          <option value="none">{$_("none")}</option>
          <option value="sticky">🍯 {$_("honey-sticky")}</option>
          <option value="slippery">❄️ {$_("honey-slippery")}</option>
          <option value="glitched">{$_("honey-glitched")}</option>
        </select>
      </div>
    </label>
    {#if props.honeyType.value === "sticky" || props.honeyType.value === "slippery"}
      <div class="submenu" transition:fly={{ duration: 80, x: 50 }}>
        <label>
          <span
            >{$_("friction")}
            <span class="text-xs opacity-75 font-mono"
              >{props.honeyType.value === "sticky" ? "*=" : "-="}</span
            >
          </span>
          <TextInput
            float
            min={0}
            value={props.honeyValue.value}
            set={props.honeyValue.set}
            class="w-16"
          />
        </label>
        <label>
          <span
            >{$_("honey-duration")}<span class="text-xs opacity-75">(s)</span
            ></span
          >
          <TextInput
            float
            min={0}
            value={props.honeyDuration.value}
            set={props.honeyDuration.set}
            class="w-16"
          />
        </label>
      </div>
    {/if}
  </div>

  {#if props.galaxyName.value !== undefined}
    <div class="mb-4" />

    <label>
      <span>Galaxy name</span>
      <TextInput value={props.galaxyName.value} set={props.galaxyName.set} class="w-16" />
    </label>
    <label>
      <span>Galaxy target name</span>
      <TextInput value={props.galaxyTarget.value} set={props.galaxyTarget.set} class="w-16" />
    </label>
    <label>
      <span>inputSpeedBonus</span>
      <TextInput
        class="w-16"
        float
        value={props.galaxyInputSpeedBonus.value}
        set={props.galaxyInputSpeedBonus.set}
      />
    </label>
    <label>
      <span>outputSpeedBonus</span>
      <TextInput
        class="w-16"
        float
        value={props.galaxyOutputSpeedBonus.value}
        set={props.galaxyOutputSpeedBonus.set}
      />
    </label>
    <label>
      <span>addInputGroundSpeed</span>
      <Checkbox checked={props.galaxyAddInputGroundSpeed.value} set={props.galaxyAddInputGroundSpeed.set} />
    </label>
    <label>
      <span>invertOutputPoint</span>
      <Checkbox checked={props.galaxyInvertOutputPoint.value} set={props.galaxyInvertOutputPoint.set} />
    </label>
  {/if}

  <div class="mb-4" />

  <div class:disabled={props.vanish.value === undefined}>
    <label>
      <span>{$_("vanish")}<span class="text-xs opacity-75">(ms)</span></span>
      <div class="flex">
        <TextInput
          int
          min={0}
          sliderMin={0}
          sliderMax={180000}
          value={props.vanish.value}
          set={props.vanish.set}
          class="w-16"
        />
        <Checkbox
          checked={props.vanish.value === null
            ? null
            : props.vanish.value !== 0}
          set={(v) => props.vanish.set(v ? 5000 : 0)}
        />
      </div>
    </label>
  </div>

  <div class="mb-1" />

  <label>
    <span>nosync</span>
    <Checkbox checked={props.nosync.value} set={props.nosync.set} />
  </label>

  <div class="mb-4" />

  <label>
    <span>{$_("ground-image")}...</span>
    <Checkbox checked={props.imageEnabled.value} set={props.imageEnabled.set} />
  </label>
  {#if props.imageEnabled.value}
    <div class="submenu" transition:fly={{ duration: 80, x: 50 }}>
      <div class="flex">
        <label>
          <span class="incompressible">X</span>
          <TextInput int value={props.imageX.value} set={props.imageX.set} />
        </label>
        <div class="w-2" />
        <label>
          <span class="incompressible">Y</span>
          <TextInput int value={props.imageY.value} set={props.imageY.set} />
        </label>
      </div>
      <div class="mb-1" />
      <label>
        <span class="incompressible">Url</span>
        <TextInput
          value={props.imageValue.value}
          set={props.imageValue.set}
          outerClass="flex-grow"
          class="w-full"
        />
      </label>
    </div>
  {/if}

  <div class="mb-1" />

  <label>
    <span>lua</span>
    <TextInput value={props.lua.value} set={props.lua.set} class="w-16" />
  </label>

  <div class="mb-4" />

  <CustomProperties bind:props={props.unknownAttributes.value} />
</div>

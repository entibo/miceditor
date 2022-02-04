import { storeGet } from "common";
import { clone } from "data/base/util";
import * as Editor from "data/editor";
import { isPlatform } from "data/editor";
import { isCircle } from "data/editor/Platform";
// import { selection, set as selectionSet } from "state/selection";
import * as selection from "state/selection";
import * as sceneObjects from "state/sceneObjects";
import { persistentWritable } from "state/util";

const defaultSlopeConfig = {
  enabled: false,
  startAngle: 0,
  endAngle: 90,
  segments: 5,
  width: 0,
  height: 20,
  platformAngle: 0,
};

export const slopeConfig = persistentWritable(
  "slopeConfig",
  clone(defaultSlopeConfig)
);

selection.selection.subscribe(($selection) => {
  if (
    $selection.length === 1 &&
    isPlatform($selection[0]) &&
    isCircle($selection[0])
  )
    return;
  slopeConfig.update((cfg) => {
    cfg.enabled = false;
    return cfg;
  });
});

export function generateSlope() {
  const $selection = storeGet(selection.selection);
  if (
    !(
      $selection.length === 1 &&
      isPlatform($selection[0]) &&
      isCircle($selection[0])
    )
  )
    return;
  const circle = $selection[0];
  const { x, y, radius, rotation } = circle;
  let { startAngle, endAngle, segments, width, height, platformAngle } =
    storeGet(slopeConfig);
  startAngle += rotation;
  endAngle += rotation;

  let platforms = [];

  for (const segment of getLineSegments(
    x,
    y,
    radius,
    startAngle,
    endAngle,
    height,
    segments
  )) {
    const obj = Editor.Platform.make(
      Editor.Platform.defaults(Editor.Platform.Type.Ice)
    ) as Extract<
      Editor.Platform.Platform,
      Editor.Platform.Rectangle & Editor.Platform.Rotatable
    >;
    obj.x = Math.round(segment.x);
    obj.y = Math.round(segment.y);
    obj.rotation = Math.round(segment.angle) + platformAngle;
    obj.width = width === 0 ? Math.ceil(segment.length) : width;
    obj.height = height;
    if (platformAngle === 90 || platformAngle === 270) {
      [obj.width, obj.height] = [obj.height, obj.width];
    }
    platforms.push(sceneObjects.add(obj));
  }
  selection.set(platforms);
}

export function getLineSegments(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  height: number,
  numSegments: number
) {
  const r2 = radius + height / 2;
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  const radDiff = endRad - startRad;
  const radStep = radDiff / numSegments;
  let length
  {
    const x1 = radius*Math.cos(0)
    const y1 = radius*Math.sin(0)
    const x2 = radius*Math.cos(radStep)
    const y2 = radius*Math.sin(radStep)
    const dx = x2-x1 
    const dy = y2-y1
    length = Math.sqrt(dx*dx+dy*dy)
  }
  const segments = [];
  for (let i = 0; i < numSegments; i++) {
    const rad = startRad + radStep * i;
    const x1 = x + r2 * Math.cos(rad);
    const y1 = y + r2 * Math.sin(rad);
    const x2 = x + r2 * Math.cos(rad + radStep);
    const y2 = y + r2 * Math.sin(rad + radStep);
    const dx = x2 - x1;
    const dy = y2 - y1;
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    segments.push({
      x1: x1,
      y1: y1,
      x2: x2,
      y2: y2,
      x: x1 + dx / 2,
      y: y1 + dy / 2,
      angle,
      length,
    });
  }
  return segments;
}

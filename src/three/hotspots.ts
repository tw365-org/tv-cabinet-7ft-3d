import * as THREE from "three";
import type { WoodHotspot } from "../data/wood-presets";

export type Marker = {
  hotspot: WoodHotspot;
  dot: THREE.Sprite;
  pulse: THREE.Sprite;
  anchor: THREE.Vector3;
  opacity: number;
  emphasis: number;
};

const TAU = Math.PI * 2;
const SURFACE_LIFT = 0.02;
const VIEW_LIFT = 0.28;
const PULSE_SECONDS = 4.5;

function rgba(color: THREE.Color, alpha: number) {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function dotTexture(hex: string) {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const c = size / 2;
  const color = new THREE.Color(hex);

  const halo = ctx.createRadialGradient(c, c, size * 0.3, c, c, size * 0.5);
  halo.addColorStop(0, rgba(color, 0.45));
  halo.addColorStop(0.5, rgba(color, 0.16));
  halo.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(c, c, c, 0, TAU);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(c, c, size * 0.3, 0, TAU);
  ctx.fillStyle = "rgba(42, 28, 18, 0.28)";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(c, c, size * 0.285, 0, TAU);
  ctx.fillStyle = "rgba(255, 252, 245, 0.98)";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(c, c, size * 0.19, 0, TAU);
  ctx.fillStyle = rgba(color, 1);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function ringTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const c = size / 2;
  ctx.strokeStyle = "rgba(255, 255, 255, 1)";
  ctx.lineWidth = size * 0.038;
  ctx.beginPath();
  ctx.arc(c, c, size * 0.42, 0, TAU);
  ctx.stroke();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export class HotspotLayer {
  private markers: Marker[] = [];
  private ring = ringTexture();
  private group = new THREE.Group();
  private pixelScale = 0.021;
  private time = 0;
  private selectedAt = -PULSE_SECONDS;
  private lastSelectedId: string | null = null;

  private readonly world = new THREE.Vector3();
  private readonly toCamera = new THREE.Vector3();
  private readonly outward = new THREE.Vector3();
  private readonly center = new THREE.Vector3();
  private readonly projected = new THREE.Vector3();
  private readonly localCamera = new THREE.Vector3();
  private readonly lift = new THREE.Vector3();

  constructor() {
    this.group.name = "hotspot-layer";
    this.group.renderOrder = 10;
  }

  get list(): readonly Marker[] {
    return this.markers;
  }

  attach(pivot: THREE.Group, hotspots: WoodHotspot[], meshes: THREE.Mesh[]) {
    this.clear();
    if (!hotspots.length) return;

    const anchors = snapToSurface(hotspots, pivot, meshes);
    hotspots.forEach((hotspot, index) => {
      const dot = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: dotTexture(hotspot.color),
          transparent: true,
          depthWrite: false,
          depthTest: true,
          sizeAttenuation: false,
          toneMapped: false,
          polygonOffset: true,
          polygonOffsetFactor: -4,
          polygonOffsetUnits: -12,
        }),
      );
      dot.position.copy(anchors[index]);
      dot.renderOrder = 11;

      const pulse = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: this.ring,
          color: new THREE.Color(hotspot.color),
          transparent: true,
          opacity: 0,
          depthWrite: false,
          depthTest: true,
          sizeAttenuation: false,
          toneMapped: false,
        }),
      );
      pulse.position.copy(anchors[index]);
      pulse.renderOrder = 10;

      this.group.add(pulse, dot);
      this.markers.push({ hotspot, dot, pulse, anchor: anchors[index].clone(), opacity: 0.9, emphasis: 0 });
    });

    this.group.position.set(0, 0, 0);
    pivot.add(this.group);
    this.applyScale();
  }

  setPixelSize(pixels: number, viewportHeight: number, fovDegrees: number) {
    const fov = THREE.MathUtils.degToRad(fovDegrees);
    this.pixelScale = 2 * (pixels / Math.max(viewportHeight, 1)) * Math.tan(fov / 2);
    this.applyScale();
  }

  private applyScale() {
    this.markers.forEach((marker) => {
      const scale = this.pixelScale * (1 + marker.emphasis * 0.32) * (0.76 + 0.24 * marker.opacity);
      marker.dot.scale.setScalar(scale);
    });
  }

  update(camera: THREE.Camera, delta: number, selectedId: string | null, hoveredId: string | null) {
    if (!this.markers.length) return true;
    this.time += delta;
    this.group.updateWorldMatrix(true, false);
    this.group.getWorldPosition(this.center);
    this.localCamera.copy(camera.position);
    this.group.worldToLocal(this.localCamera);

    if (selectedId !== this.lastSelectedId) {
      this.lastSelectedId = selectedId;
      this.selectedAt = this.time;
    }
    const beating = this.time - this.selectedAt < PULSE_SECONDS;

    let settled = true;
    for (const marker of this.markers) {
      this.lift.copy(this.localCamera).sub(marker.anchor);
      const span = this.lift.length();
      if (span > 1e-4) this.lift.multiplyScalar(VIEW_LIFT / span);
      else this.lift.set(0, 0, 0);
      marker.dot.position.copy(marker.anchor).add(this.lift);
      marker.pulse.position.copy(marker.dot.position);

      marker.dot.getWorldPosition(this.world);
      this.outward.copy(this.world).sub(this.center);
      const radius = this.outward.length();
      this.toCamera.copy(camera.position).sub(this.world).normalize();
      const facing = radius > 1e-4 ? this.outward.divideScalar(radius).dot(this.toCamera) : 1;
      const target = THREE.MathUtils.smoothstep(facing, -0.15, 0.25);

      const active = marker.hotspot.id === selectedId || marker.hotspot.id === hoveredId;
      const emphasisTarget = active ? 1 : 0;
      const ease = 1 - Math.exp(-delta * 12);

      if (Math.abs(target - marker.opacity) > 0.002) settled = false;
      if (Math.abs(emphasisTarget - marker.emphasis) > 0.002) settled = false;
      marker.opacity += (target - marker.opacity) * ease;
      marker.emphasis += (emphasisTarget - marker.emphasis) * ease;

      marker.dot.material.opacity = marker.opacity;
      marker.dot.visible = marker.opacity > 0.01;

      if (marker.emphasis > 0.01) {
        marker.pulse.material.color.set(marker.hotspot.color);
        marker.pulse.visible = true;
        if (beating || marker.hotspot.id === hoveredId) {
          const beat = (this.time * 0.75) % 1;
          marker.pulse.material.opacity = marker.emphasis * marker.opacity * (1 - beat) * 0.85;
          marker.pulse.scale.setScalar(this.pixelScale * (1.15 + beat * 1.5));
          settled = false;
        } else {
          marker.pulse.material.opacity = marker.emphasis * marker.opacity * 0.42;
          marker.pulse.scale.setScalar(this.pixelScale * 1.6);
        }
      } else if (marker.pulse.visible) {
        marker.pulse.visible = false;
      }
    }
    this.applyScale();
    return settled;
  }

  pick(x: number, y: number, camera: THREE.Camera, width: number, height: number, radius = 24) {
    let best: Marker | null = null;
    let bestDistance = radius;
    for (const marker of this.markers) {
      if (marker.opacity < 0.25) continue;
      marker.dot.getWorldPosition(this.projected).project(camera as THREE.PerspectiveCamera);
      if (this.projected.z > 1) continue;
      const px = (this.projected.x * 0.5 + 0.5) * width;
      const py = (-this.projected.y * 0.5 + 0.5) * height;
      const distance = Math.hypot(px - x, py - y);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = marker;
      }
    }
    return best;
  }

  screenPosition(id: string, camera: THREE.PerspectiveCamera, width: number, height: number) {
    const marker = this.markers.find((item) => item.hotspot.id === id);
    if (!marker) return null;
    marker.dot.getWorldPosition(this.projected).project(camera);
    return {
      x: (this.projected.x * 0.5 + 0.5) * width,
      y: (-this.projected.y * 0.5 + 0.5) * height,
      opacity: marker.opacity,
    };
  }

  clear() {
    this.markers.forEach((marker) => {
      marker.dot.material.map?.dispose();
      marker.dot.material.dispose();
      marker.pulse.material.dispose();
    });
    this.markers = [];
    this.group.clear();
    this.group.removeFromParent();
  }

  dispose() {
    this.clear();
    this.ring.dispose();
  }
}

function snapToSurface(hotspots: WoodHotspot[], pivot: THREE.Group, meshes: THREE.Mesh[]) {
  // 若是使用者直接透過滑鼠 Raycast 點擊模型表面新增的標註點 (exactSurface = true)，直接使用該精確表面座標
  return hotspots.map((hotspot) => {
    const target = new THREE.Vector3(...hotspot.position);
    if (hotspot.exactSurface || !meshes.length) {
      const outward = target.clone().normalize();
      return target.addScaledVector(outward, SURFACE_LIFT);
    }
    return target;
  });
}

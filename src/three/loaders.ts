import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { disposeObject } from "./dispose";
import { buildProceduralWoodModel } from "./ProceduralWoodModels";

/**
 * 無論木工師傅從 SketchUp、Rhino、AutoCAD 或 Blender 匯出的 .glb 單位是 mm、cm 還是台尺，
 * 載入時一律自動等比縮放並置中至 FIT_SIZE = 3.8 的標準空間。
 */
export const FIT_SIZE = 3.8;

const CACHE_LIMIT = 5;

export type LoadedOrgan = {
  url: string;
  pivot: THREE.Group;
  meshes: THREE.Mesh[];
  mixer: THREE.AnimationMixer | null;
  /** 原始模型未縮放前的長寬高比例（供尺寸顯示參考） */
  rawSize: { x: number; y: number; z: number };
};

export class AnatomyAssetManager {
  private loader: GLTFLoader;
  private cache = new Map<string, LoadedOrgan>();
  private inflight = new Map<string, Promise<LoadedOrgan>>();
  private current: LoadedOrgan | null = null;
  private maxAnisotropy: number;

  constructor(renderer: THREE.WebGLRenderer) {
    this.maxAnisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const draco = new DRACOLoader();
    draco.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
    this.loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).setDRACOLoader(draco);
  }

  get hasAnimation() {
    return Boolean(this.current?.mixer);
  }

  prefetch(url: string) {
    if (url.startsWith("preset:") || url.startsWith("blob:") || this.cache.has(url) || this.inflight.has(url)) return;
    void fetch(url, { priority: "low" } as RequestInit).catch(() => {});
  }

  async load(url: string, onProgress?: (progress: number) => void): Promise<LoadedOrgan> {
    const cached = this.cache.get(url);
    if (cached) {
      this.cache.delete(url);
      this.cache.set(url, cached);
      this.resetMaterials(cached);
      onProgress?.(1);
      this.current = cached;
      return cached;
    }

    const pending = this.inflight.get(url) ?? this.parse(url, onProgress);
    this.inflight.set(url, pending);
    try {
      const organ = await pending;
      this.cache.set(url, organ);
      this.evict();
      this.current = organ;
      return organ;
    } finally {
      this.inflight.delete(url);
    }
  }

  private async parse(url: string, onProgress?: (progress: number) => void): Promise<LoadedOrgan> {
    let model: THREE.Group;
    let animations: THREE.AnimationClip[] = [];

    if (url.startsWith("preset:")) {
      onProgress?.(0.5);
      model = buildProceduralWoodModel(url);
      onProgress?.(1);
    } else {
      const gltf = await this.loader.loadAsync(url, (event) => {
        if (event.total > 0) onProgress?.(event.loaded / event.total);
      });
      model = gltf.scene;
      animations = gltf.animations;
    }

    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const rawSize = { x: +size.x.toFixed(2), y: +size.y.toFixed(2), z: +size.z.toFixed(2) };
    const center = box.getCenter(new THREE.Vector3());
    const scale = FIT_SIZE / Math.max(size.x, size.y, size.z, 0.001);
    model.scale.setScalar(scale);
    model.position.copy(center.multiplyScalar(-scale));

    const pivot = new THREE.Group();
    pivot.name = "wood-pivot";
    pivot.add(model);
    pivot.rotation.set(0.08, -0.35, 0);

    const meshes: THREE.Mesh[] = [];
    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      meshes.push(child);
      child.frustumCulled = false;
      child.castShadow = false;
      child.receiveShadow = false;
      this.forEachMaterial(child, (material) => {
        material.transparent = false;
        material.opacity = 1;
        material.depthWrite = true;
        material.depthTest = true;
        // 木工家具開啟 3D 剖面時，雙面渲染 (DoubleSide) 可避免切開後內部板材背面透明穿幫
        material.side = THREE.DoubleSide;
        if (material instanceof THREE.MeshStandardMaterial) {
          material.roughness = THREE.MathUtils.clamp(material.roughness ?? 0.5, 0.25, 0.72);
          material.envMapIntensity = 0.45;
          if (material.map) material.map.colorSpace = THREE.SRGBColorSpace;
          for (const map of [
            material.map,
            material.normalMap,
            material.roughnessMap,
            material.metalnessMap,
            material.aoMap,
          ]) {
            if (!map) continue;
            map.anisotropy = this.maxAnisotropy;
            map.generateMipmaps = true;
            map.minFilter = THREE.LinearMipmapLinearFilter;
            map.magFilter = THREE.LinearFilter;
            map.needsUpdate = true;
          }
        }
        material.needsUpdate = true;
      });
    });

    let mixer: THREE.AnimationMixer | null = null;
    if (animations.length) {
      mixer = new THREE.AnimationMixer(model);
      animations.forEach((clip) => mixer?.clipAction(clip).play());
    }

    return { url, pivot, meshes, mixer, rawSize };
  }

  private resetMaterials(organ: LoadedOrgan) {
    organ.pivot.rotation.set(0.08, -0.35, 0);
    organ.pivot.position.set(0, 0, 0);
    organ.meshes.forEach((mesh) => {
      this.forEachMaterial(mesh, (material) => {
        material.transparent = false;
        material.opacity = 1;
        material.depthWrite = true;
        material.clippingPlanes = null;
        material.clipShadows = false;
        if (material instanceof THREE.MeshStandardMaterial) material.wireframe = false;
        material.needsUpdate = true;
      });
    });
  }

  private forEachMaterial(mesh: THREE.Mesh, fn: (material: THREE.Material) => void) {
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach(fn);
  }

  private evict() {
    while (this.cache.size > CACHE_LIMIT) {
      const oldest = this.cache.keys().next().value as string | undefined;
      if (!oldest) return;
      const organ = this.cache.get(oldest);
      this.cache.delete(oldest);
      if (organ && organ !== this.current) this.destroy(organ);
    }
  }

  private destroy(organ: LoadedOrgan) {
    organ.mixer?.stopAllAction();
    organ.mixer?.uncacheRoot(organ.pivot);
    organ.pivot.removeFromParent();
    disposeObject(organ.pivot);
  }

  update(delta: number) {
    this.current?.mixer?.update(delta);
  }

  release(organ: LoadedOrgan | null = this.current) {
    if (!organ) return;
    organ.mixer?.stopAllAction();
    organ.pivot.removeFromParent();
    if (organ === this.current) this.current = null;
  }

  dispose() {
    this.release();
    this.cache.forEach((organ) => this.destroy(organ));
    this.cache.clear();
  }
}

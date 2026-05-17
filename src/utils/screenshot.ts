import type * as THREE from 'three';
import { triggerDownload } from './csv';

let _gl: THREE.WebGLRenderer | null = null;
let _scene: THREE.Scene | null = null;
let _camera: THREE.Camera | null = null;

export function bindRenderer(
  gl: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera
) {
  _gl = gl;
  _scene = scene;
  _camera = camera;
}

export function isRendererReady() {
  return !!_gl;
}

/** 截取当前 3D 视口为 PNG 文件。需 Canvas 设置 preserveDrawingBuffer: true */
export function captureScreenshot(filenameBase = 'rebar-3d') {
  if (!_gl || !_scene || !_camera) {
    throw new Error('3D 渲染器尚未就绪');
  }
  // 强制一次渲染,确保 drawing buffer 为最新
  _gl.render(_scene, _camera);
  const canvas = _gl.domElement;
  canvas.toBlob((blob) => {
    if (!blob) return;
    const ts = new Date()
      .toISOString()
      .replace(/[-:T]/g, '')
      .slice(0, 14);
    triggerDownload(blob, `${filenameBase}_${ts}.png`);
  }, 'image/png');
}

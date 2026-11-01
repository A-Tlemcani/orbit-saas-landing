import * as THREE from 'three';
import { createStage, pointerTracker } from './lib/stage';
import { isLand } from './landmask';

/** Points on a sphere (instanced), animated arcs between "regions", and a fresnel atmosphere. */
export function initGlobe(canvas: HTMLCanvasElement) {
  const stage = createStage(canvas, { fov: 30 });
  if (!stage) return;
  const { scene, camera, reducedMotion } = stage;
  camera.position.set(0, 0, 16);
  const R = 3;
  const globe = new THREE.Group();
  globe.rotation.set(0.35, 0, 0.15);
  scene.add(globe);

  // Dotted sphere: Fibonacci lattice, kept only where Natural Earth says there is land.
  const N = innerWidth < 700 ? 7000 : 14000;
  const dot = new THREE.CircleGeometry(0.018, 6);
  const dots = new THREE.InstancedMesh(dot, new THREE.MeshBasicMaterial({ color: '#8b7bff', transparent: true, opacity: 0.85 }), N);
  const m = new THREE.Matrix4(), p = new THREE.Vector3(), q = new THREE.Quaternion(), one = new THREE.Vector3(1, 1, 1), z = new THREE.Vector3(0, 0, 1);
  let n = 0;
  for (let i = 0; i < N * 3.4 && n < N; i++) {
    const y = 1 - (i / (N * 3.4 - 1)) * 2, r = Math.sqrt(1 - y * y), phi = i * Math.PI * (3 - Math.sqrt(5));
    p.set(Math.cos(phi) * r, y, Math.sin(phi) * r);
    if (!isLand(THREE.MathUtils.radToDeg(Math.asin(p.y)), THREE.MathUtils.radToDeg(Math.atan2(-p.z, p.x)))) continue;
    q.setFromUnitVectors(z, p);
    dots.setMatrixAt(n++, m.compose(p.clone().multiplyScalar(R), q, one));
  }
  dots.count = n;
  globe.add(dots);

  // Inner occluder so back-facing dots are hidden
  globe.add(new THREE.Mesh(new THREE.SphereGeometry(R * 0.995, 64, 64), new THREE.MeshBasicMaterial({ color: '#0a0b14' })));

  // Fresnel atmosphere
  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.18, 64, 64),
    new THREE.ShaderMaterial({
      transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
      vertexShader: 'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'varying vec3 vN; void main(){ float i = pow(0.72 - dot(vN, vec3(0,0,1.0)), 3.0); gl_FragColor = vec4(0.48,0.36,1.0,1.0) * i * 0.75; }',
    }),
  );
  scene.add(atmo);

  // Arcs between data regions, drawn progressively with a moving dash window
  const regions: Array<[number, number]> = [[48.8, 2.3], [50.1, 8.7], [40.7, -74], [37.7, -122.4], [35.7, 139.7], [1.35, 103.8], [-33.9, 151.2], [51.5, -0.1], [-23.5, -46.6]];
  const toVec = ([lat, lon]: [number, number], h = R) => {
    const la = THREE.MathUtils.degToRad(lat), lo = THREE.MathUtils.degToRad(lon);
    return new THREE.Vector3(Math.cos(la) * Math.cos(lo), Math.sin(la), -Math.cos(la) * Math.sin(lo)).multiplyScalar(h);
  };
  const arcs: Array<{ mat: THREE.ShaderMaterial; offset: number; speed: number }> = [];
  const pairs = [[0, 2], [0, 4], [1, 5], [3, 4], [7, 8], [2, 3], [5, 6], [0, 7], [8, 3]];
  for (const [a, b] of pairs) {
    const A = toVec(regions[a] as [number, number]), B = toVec(regions[b] as [number, number]);
    const mid = A.clone().add(B).multiplyScalar(0.5);
    mid.setLength(R + A.distanceTo(B) * 0.35);
    const curve = new THREE.QuadraticBezierCurve3(A, mid, B);
    const geo = new THREE.TubeGeometry(curve, 64, 0.012, 6, false);
    const mat = new THREE.ShaderMaterial({
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
      uniforms: { uT: { value: 0 } },
      vertexShader: 'varying float vU; void main(){ vU = uv.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'uniform float uT; varying float vU; void main(){ float head = fract(uT); float d = head - vU; float a = smoothstep(0.35, 0.0, d) * step(0.0, d); gl_FragColor = vec4(mix(vec3(0.13,0.83,0.93), vec3(0.6,0.5,1.0), vU), a); }',
    });
    globe.add(new THREE.Mesh(geo, mat));
    arcs.push({ mat, offset: Math.random(), speed: 0.25 + Math.random() * 0.2 });
  }
  // Region pins
  const pinGeo = new THREE.SphereGeometry(0.045, 12, 12), pinMat = new THREE.MeshBasicMaterial({ color: '#22d3ee' });
  regions.forEach((r) => { const pin = new THREE.Mesh(pinGeo, pinMat); pin.position.copy(toVec(r, R * 1.005)); globe.add(pin); });

  const pointer = pointerTracker();
  stage.onFrame((t, dt) => {
    const pt = pointer.update(dt, 2);
    const time = reducedMotion ? 0 : t;
    globe.rotation.y = time * 0.08 + pt.x * 0.3;
    globe.rotation.x = 0.35 - pt.y * 0.15;
    arcs.forEach((a) => (a.mat.uniforms.uT.value = reducedMotion ? 0.8 : a.offset + time * a.speed));
  });
}

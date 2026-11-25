import {memo, useEffect, useRef} from 'react';
import {
  computeParticleBudget,
  evaluateIntroTimeline,
  hasIntroPlayedInMemory,
  INTRO_FAILSAFE_TIMEOUT_MS,
  isScrollLockBlockedKey,
  markIntroPlayedInMemory,
  type IntroStage,
} from '../utils/particleIntro';
import {prefersReducedMotion} from '../hooks/useScrollReveal';

export interface IntroVisualState {
  active: boolean;
  stage: IntroStage;
  heroReveal: number;
}

interface HeroParticleIntroProps {
  active: boolean;
  onStateChange: (next: IntroVisualState) => void;
}

const VERTEX_SHADER_SOURCE = `#version 300 es
precision highp float;

layout(location = 0) in vec3 a_posVoid;
layout(location = 1) in vec3 a_posBrand;
layout(location = 2) in vec3 a_posDisperse;
layout(location = 3) in vec3 a_posCode;
layout(location = 4) in vec3 a_posExit;
layout(location = 5) in vec4 a_seed;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_dpr;
uniform float u_pointScale;
uniform float u_brandMix;
uniform float u_disperseMix;
uniform float u_codeMix;
uniform float u_exitMix;
uniform float u_turbulence;
uniform float u_particleAlpha;
uniform vec2 u_pointer;

out float v_alpha;
out float v_isDust;

vec3 curlOffset(vec3 p, float t, float phase) {
  float a = p.y * 3.1 + t * 0.85 + phase * 6.2831;
  float b = p.x * 2.7 - t * 0.72 + phase * 4.1887;
  float c = (p.x - p.y) * 2.3 + t * 0.65 + phase * 3.1415;
  return vec3(
    sin(a) * 0.085 + cos(c) * 0.045,
    cos(b) * 0.085 + sin(a) * 0.04,
    sin(b + c) * 0.11
  );
}

void main() {
  float isDust = a_seed.w;
  float phase = a_seed.x;
  float speed = a_seed.y;
  float sizeJitter = a_seed.z;

  float aspect = max(u_resolution.x / max(u_resolution.y, 1.0), 0.35);
  float textScale = aspect < 0.85 ? aspect * 1.24 : min(1.48, aspect * 1.15);

  vec3 pos;
  if (isDust > 0.5) {
    vec3 drift = vec3(
      sin(u_time * (0.18 + speed * 0.12) + phase * 6.2831) * 0.14,
      cos(u_time * (0.15 + speed * 0.1) + phase * 5.0265) * 0.12,
      sin(u_time * 0.22 + phase * 3.7699) * 0.18
    );
    pos = a_posVoid + drift + a_posExit * (u_exitMix * 0.35);
  } else {
    float wVoid = max(0.0, 1.0 - u_brandMix - u_disperseMix - u_codeMix - u_exitMix);
    vec3 brandScaled = vec3(a_posBrand.xy * textScale, a_posBrand.z);
    vec3 codeScaled = vec3(a_posCode.xy * textScale, a_posCode.z);

    pos = a_posVoid * wVoid
        + brandScaled * u_brandMix
        + a_posDisperse * u_disperseMix
        + codeScaled * u_codeMix
        + a_posExit * u_exitMix;

    float formedWeight = clamp(u_brandMix + u_codeMix, 0.0, 1.0);
    vec3 flightCurl = curlOffset(pos, u_time * (0.8 + speed * 0.5), phase);
    pos += flightCurl * (u_turbulence + (1.0 - formedWeight) * 0.18);

    // Subtle micro-breathing while settled in glyph formation
    float breath = sin(u_time * 2.2 + phase * 6.2831) * 0.0045 * formedWeight;
    pos.x += breath;
    pos.y += cos(u_time * 1.9 + phase * 6.2831) * 0.0045 * formedWeight;
  }

  // Subtle 3D pointer parallax
  float depthParallax = (pos.z + 1.4) * 0.032;
  pos.x += u_pointer.x * depthParallax;
  pos.y += u_pointer.y * depthParallax;

  float cameraDist = 2.45;
  float zClamped = clamp(pos.z, -1.9, 1.45);
  float perspective = cameraDist / (cameraDist - zClamped * 0.68);

  vec2 projected = vec2((pos.x * perspective) / aspect, pos.y * perspective);
  gl_Position = vec4(projected, clamp(-zClamped * 0.25, -0.95, 0.95), 1.0);

  float formedBright = clamp(u_brandMix + u_codeMix, 0.0, 1.0);
  float baseSize = isDust > 0.5
    ? mix(1.35, 3.1, sizeJitter)
    : mix(1.85, 3.55, sizeJitter) * mix(1.0, 1.12, formedBright);

  gl_PointSize = clamp(baseSize * perspective * u_dpr * u_pointScale, 1.1, 22.0);

  float depthAtten = clamp(0.42 + (zClamped + 1.5) * 0.28, 0.22, 1.0);
  float twinkle = 0.8 + 0.2 * sin(u_time * (1.4 + speed * 2.0) + phase * 6.2831);
  float dustScale = isDust > 0.5 ? 0.52 : 0.94;

  v_alpha = clamp(depthAtten * twinkle * dustScale * u_particleAlpha, 0.0, 1.0);
  v_isDust = isDust;
}
`;

const FRAGMENT_SHADER_SOURCE = `#version 300 es
precision highp float;

in float v_alpha;
in float v_isDust;
out vec4 outColor;

void main() {
  vec2 uv = gl_PointCoord - vec2(0.5);
  float dist = length(uv);
  if (dist > 0.5) {
    discard;
  }

  float core = exp(-dist * dist * 16.0);
  float halo = smoothstep(0.5, 0.04, dist) * (v_isDust > 0.5 ? 0.28 : 0.42);
  float intensity = clamp(core + halo, 0.0, 1.0);

  outColor = vec4(vec3(0.97, 0.985, 1.0), intensity * v_alpha);
}
`;

function createMulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error('Unable to allocate WebGL2 shader');
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader) || 'Shader compilation failed';
    gl.deleteShader(shader);
    throw new Error(info);
  }
  return shader;
}

function createProgram(
  gl: WebGL2RenderingContext,
  vsSource: string,
  fsSource: string,
): WebGLProgram {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    throw new Error('Unable to allocate WebGL2 program');
  }
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program) || 'Program link failed';
    gl.deleteProgram(program);
    throw new Error(info);
  }
  return program;
}

function sampleTextPointCloud(
  text: string,
  targetCount: number,
  worldWidth: number,
  seed: number,
): Float32Array {
  const out = new Float32Array(targetCount * 3);
  const rng = createMulberry32(seed);

  const canvasWidth = 960;
  const canvasHeight = 300;
  const offscreen = document.createElement('canvas');
  offscreen.width = canvasWidth;
  offscreen.height = canvasHeight;
  const ctx = offscreen.getContext('2d', {willReadFrequently: true});

  if (ctx) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const fontSize = text.length > 4 ? 176 : 196;
    ctx.font = `800 ${fontSize}px "Oxanium", sans-serif`;
    ctx.fillText(text, canvasWidth / 2, canvasHeight / 2);

    const img = ctx.getImageData(0, 0, canvasWidth, canvasHeight).data;
    const rawCoords: number[] = [];

    for (let y = 0; y < canvasHeight; y += 2) {
      for (let x = 0; x < canvasWidth; x += 2) {
        const alpha = img[(y * canvasWidth + x) * 4 + 3] ?? 0;
        if (alpha > 90) {
          rawCoords.push(x, y);
        }
      }
    }

    const totalSamples = rawCoords.length / 2;
    if (totalSamples > 0) {
      // Find tight bounding box so text fills requested worldWidth accurately
      let minX = canvasWidth;
      let maxX = 0;
      let minY = canvasHeight;
      let maxY = 0;
      for (let i = 0; i < totalSamples; i++) {
        const px = rawCoords[i * 2]!;
        const py = rawCoords[i * 2 + 1]!;
        if (px < minX) minX = px;
        if (px > maxX) maxX = px;
        if (py < minY) minY = py;
        if (py > maxY) maxY = py;
      }

      const spanX = Math.max(1, maxX - minX);
      const centerX = (minX + maxX) * 0.5;
      const centerY = (minY + maxY) * 0.5;
      const scale = worldWidth / spanX;

      // Build shuffled index table for uniform stroke coverage
      const indices = new Uint32Array(totalSamples);
      for (let i = 0; i < totalSamples; i++) {
        indices[i] = i;
      }
      for (let i = totalSamples - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        const tmp = indices[i]!;
        indices[i] = indices[j]!;
        indices[j] = tmp;
      }

      for (let i = 0; i < targetCount; i++) {
        const sampleIdx = indices[i % totalSamples]!;
        const sx = rawCoords[sampleIdx * 2]!;
        const sy = rawCoords[sampleIdx * 2 + 1]!;
        const jitterX = (rng() - 0.5) * 0.011;
        const jitterY = (rng() - 0.5) * 0.011;

        out[i * 3] = (sx - centerX) * scale + jitterX;
        out[i * 3 + 1] = -(sy - centerY) * scale + jitterY;
        out[i * 3 + 2] = (rng() - 0.5) * 0.14;
      }
      return out;
    }
  }

  // Deterministic geometric ring fallback if 2D canvas readback is unavailable
  for (let i = 0; i < targetCount; i++) {
    const angle = (i / targetCount) * Math.PI * 2;
    const radius = 0.25 + (i % 7) * 0.04;
    out[i * 3] = Math.cos(angle) * radius;
    out[i * 3 + 1] = Math.sin(angle) * radius * 0.5;
    out[i * 3 + 2] = (rng() - 0.5) * 0.2;
  }
  return out;
}

function generateParticleBuffers(
  morphCount: number,
  dustCount: number,
  viewportAspect: number,
) {
  const total = morphCount + dustCount;
  const rng = createMulberry32(0x71ab0101);

  const brandPts = sampleTextPointCloud('qrbqq', morphCount, 1.0, 101);
  const codePts = sampleTextPointCloud('0101', morphCount, 0.82, 202);

  const posVoid = new Float32Array(total * 3);
  const posBrand = new Float32Array(total * 3);
  const posDisperse = new Float32Array(total * 3);
  const posCode = new Float32Array(total * 3);
  const posExit = new Float32Array(total * 3);
  const seeds = new Float32Array(total * 4);

  const spreadX = Math.max(1.3, viewportAspect * 1.45);
  const spreadY = 1.25;

  for (let i = 0; i < total; i++) {
    const isDust = i >= morphCount;
    const base = i * 3;
    const sBase = i * 4;

    // Void 3D starfield distribution
    const vx = (rng() - 0.5) * 2.0 * spreadX;
    const vy = (rng() - 0.5) * 2.0 * spreadY;
    const vz = (rng() - 0.5) * 2.6 - 0.2;

    posVoid[base] = vx;
    posVoid[base + 1] = vy;
    posVoid[base + 2] = vz;

    seeds[sBase] = rng();
    seeds[sBase + 1] = rng();
    seeds[sBase + 2] = rng();
    seeds[sBase + 3] = isDust ? 1.0 : 0.0;

    if (isDust) {
      posBrand[base] = vx;
      posBrand[base + 1] = vy;
      posBrand[base + 2] = vz;

      posDisperse[base] = vx;
      posDisperse[base + 1] = vy;
      posDisperse[base + 2] = vz;

      posCode[base] = vx;
      posCode[base + 1] = vy;
      posCode[base + 2] = vz;

      posExit[base] = (rng() - 0.5) * 0.8;
      posExit[base + 1] = (rng() - 0.5) * 0.8;
      posExit[base + 2] = rng() * 0.8;
      continue;
    }

    const bx = brandPts[base]!;
    const by = brandPts[base + 1]!;
    const bz = brandPts[base + 2]!;
    posBrand[base] = bx;
    posBrand[base + 1] = by;
    posBrand[base + 2] = bz;

    // Cosmic radial dispersion outward from qrbqq
    const angle = Math.atan2(by, bx) + (rng() - 0.5) * 1.1;
    const radialDist = 0.55 + rng() * 1.25;
    posDisperse[base] = bx * 1.2 + Math.cos(angle) * radialDist * Math.max(1, spreadX * 0.65);
    posDisperse[base + 1] = by * 1.2 + Math.sin(angle) * radialDist * 0.9;
    posDisperse[base + 2] = (rng() - 0.5) * 2.4;

    const cx = codePts[base]!;
    const cy = codePts[base + 1]!;
    const cz = codePts[base + 2]!;
    posCode[base] = cx;
    posCode[base + 1] = cy;
    posCode[base + 2] = cz;

    // Final radial scatter outward from 0101 into the hero reveal
    const exitAngle = Math.atan2(cy, cx) + (rng() - 0.5) * 0.8;
    const exitDist = 0.85 + rng() * 1.65;
    posExit[base] = cx + Math.cos(exitAngle) * exitDist * Math.max(1, spreadX * 0.75);
    posExit[base + 1] = cy + Math.sin(exitAngle) * exitDist * 0.95;
    posExit[base + 2] = 0.4 + rng() * 1.6;
  }

  return {
    total,
    posVoid,
    posBrand,
    posDisperse,
    posCode,
    posExit,
    seeds,
  };
}

export const HeroParticleIntro = memo(function HeroParticleIntro({
  active,
  onStateChange,
}: HeroParticleIntroProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const onStateChangeRef = useRef(onStateChange);
  onStateChangeRef.current = onStateChange;

  // Bulletproof scroll lock while intro is active (always restores on unlock or unmount)
  useEffect(() => {
    if (!active) {
      return;
    }

    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverscroll = html.style.overscrollBehavior;
    const prevBodyOverscroll = body.style.overscrollBehavior;
    const prevBodyTouchAction = body.style.touchAction;

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    html.style.overscrollBehavior = 'none';
    body.style.overscrollBehavior = 'none';
    body.style.touchAction = 'none';

    if (window.scrollY !== 0) {
      window.scrollTo(0, 0);
    }

    const preventWheelOrTouch = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
    };

    const preventScrollKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (isScrollLockBlockedKey(event.key)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const keepAtTop = () => {
      if (window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener('wheel', preventWheelOrTouch, {
      passive: false,
      capture: true,
    });
    window.addEventListener('touchmove', preventWheelOrTouch, {
      passive: false,
      capture: true,
    });
    window.addEventListener('keydown', preventScrollKey, {
      passive: false,
      capture: true,
    });
    window.addEventListener('scroll', keepAtTop, {passive: true});

    return () => {
      window.removeEventListener('wheel', preventWheelOrTouch, {capture: true});
      window.removeEventListener('touchmove', preventWheelOrTouch, {
        capture: true,
      });
      window.removeEventListener('keydown', preventScrollKey, {capture: true});
      window.removeEventListener('scroll', keepAtTop);
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      html.style.overscrollBehavior = prevHtmlOverscroll;
      body.style.overscrollBehavior = prevBodyOverscroll;
      body.style.touchAction = prevBodyTouchAction;
    };
  }, [active]);

  useEffect(() => {
    if (!active) {
      return;
    }

    if (hasIntroPlayedInMemory() || prefersReducedMotion()) {
      markIntroPlayedInMemory();
      onStateChangeRef.current({
        active: false,
        stage: 'complete',
        heroReveal: 1,
      });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      markIntroPlayedInMemory();
      onStateChangeRef.current({
        active: false,
        stage: 'complete',
        heroReveal: 1,
      });
      return;
    }

    let disposed = false;
    let finished = false;
    let rafId: number | null = null;
    let failsafeTimer: number | null = null;
    let startTimestamp: number | null = null;
    let lastReportedStage: IntroStage = 'deep-space';
    let lastReportedRevealBucket = -1;

    const pointer = {x: 0, y: 0, targetX: 0, targetY: 0};

    const finishIntro = () => {
      if (finished || disposed) {
        return;
      }
      finished = true;
      markIntroPlayedInMemory();
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (failsafeTimer !== null) {
        window.clearTimeout(failsafeTimer);
        failsafeTimer = null;
      }
      onStateChangeRef.current({
        active: false,
        stage: 'complete',
        heroReveal: 1,
      });
    };

    // Hard master safety timer so scroll lock can NEVER remain trapped
    failsafeTimer = window.setTimeout(finishIntro, INTRO_FAILSAFE_TIMEOUT_MS);

    let gl: WebGL2RenderingContext | null = null;
    let program: WebGLProgram | null = null;
    let vao: WebGLVertexArrayObject | null = null;
    const buffers: WebGLBuffer[] = [];

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      finishIntro();
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        return;
      }
      pointer.targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.targetY = -(((event.clientY - rect.top) / rect.height - 0.5) * 2);
    };

    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    window.addEventListener('pointermove', handlePointerMove, {passive: true});

    const initAndRun = async () => {
      try {
        gl = canvas.getContext('webgl2', {
          alpha: true,
          antialias: false,
          depth: false,
          powerPreference: 'high-performance',
          premultipliedAlpha: true,
        });

        if (!gl) {
          finishIntro();
          return;
        }

        // Wait briefly for Oxanium font face so glyph sampling uses exact geometry
        if (document.fonts?.ready) {
          await Promise.race([
            document.fonts.ready.catch(() => {}),
            new Promise<void>((resolve) => window.setTimeout(resolve, 260)),
          ]);
        }

        if (disposed || finished || !gl) {
          return;
        }

        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const rendererStr = debugInfo
          ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '')
          : String(gl.getParameter(gl.RENDERER) || '');
        const isSoftwareRenderer = /swiftshader|llvmpipe|software/i.test(
          rendererStr,
        );

        const budget = computeParticleBudget({
          viewportWidth: window.innerWidth,
          hardwareConcurrency: navigator.hardwareConcurrency,
          devicePixelRatio: window.devicePixelRatio,
          isSoftwareRenderer,
        });

        const resizeCanvas = () => {
          if (!gl) {
            return {width: 1, height: 1, aspect: 1};
          }
          const rect = canvas.getBoundingClientRect();
          const cssW = Math.max(1, rect.width || window.innerWidth);
          const cssH = Math.max(1, rect.height || window.innerHeight);
          const w = Math.round(cssW * budget.dpr);
          const h = Math.round(cssH * budget.dpr);
          if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
          }
          gl.viewport(0, 0, w, h);
          return {width: w, height: h, aspect: cssW / cssH};
        };

        const initialDims = resizeCanvas();
        const data = generateParticleBuffers(
          budget.morphCount,
          budget.dustCount,
          initialDims.aspect,
        );

        program = createProgram(
          gl,
          VERTEX_SHADER_SOURCE,
          FRAGMENT_SHADER_SOURCE,
        );
        vao = gl.createVertexArray();
        if (!vao) {
          throw new Error('Unable to allocate WebGL2 VAO');
        }
        gl.bindVertexArray(vao);

        const bindFloatBuffer = (
          loc: number,
          array: Float32Array,
          components: number,
        ) => {
          if (!gl) return;
          const buf = gl.createBuffer();
          if (!buf) {
            throw new Error('Unable to allocate WebGL2 buffer');
          }
          buffers.push(buf);
          gl.bindBuffer(gl.ARRAY_BUFFER, buf);
          gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);
          gl.enableVertexAttribArray(loc);
          gl.vertexAttribPointer(loc, components, gl.FLOAT, false, 0, 0);
        };

        bindFloatBuffer(0, data.posVoid, 3);
        bindFloatBuffer(1, data.posBrand, 3);
        bindFloatBuffer(2, data.posDisperse, 3);
        bindFloatBuffer(3, data.posCode, 3);
        bindFloatBuffer(4, data.posExit, 3);
        bindFloatBuffer(5, data.seeds, 4);

        gl.bindVertexArray(null);

        const uTime = gl.getUniformLocation(program, 'u_time');
        const uResolution = gl.getUniformLocation(program, 'u_resolution');
        const uDpr = gl.getUniformLocation(program, 'u_dpr');
        const uPointScale = gl.getUniformLocation(program, 'u_pointScale');
        const uBrandMix = gl.getUniformLocation(program, 'u_brandMix');
        const uDisperseMix = gl.getUniformLocation(program, 'u_disperseMix');
        const uCodeMix = gl.getUniformLocation(program, 'u_codeMix');
        const uExitMix = gl.getUniformLocation(program, 'u_exitMix');
        const uTurbulence = gl.getUniformLocation(program, 'u_turbulence');
        const uParticleAlpha = gl.getUniformLocation(program, 'u_particleAlpha');
        const uPointer = gl.getUniformLocation(program, 'u_pointer');

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        gl.clearColor(0, 0, 0, 0);

        const renderFrame = (now: number) => {
          if (disposed || finished || !gl || !program || !vao) {
            return;
          }

          if (startTimestamp === null) {
            startTimestamp = now;
          }

          const elapsed = now - startTimestamp;
          const sample = evaluateIntroTimeline(elapsed);

          const dims = resizeCanvas();
          pointer.x += (pointer.targetX - pointer.x) * 0.06;
          pointer.y += (pointer.targetY - pointer.y) * 0.06;

          if (backdropRef.current) {
            backdropRef.current.style.opacity = sample.backdropAlpha.toFixed(3);
          }

          gl.clear(gl.COLOR_BUFFER_BIT);
          gl.useProgram(program);
          gl.bindVertexArray(vao);

          gl.uniform1f(uTime, elapsed * 0.001);
          gl.uniform2f(uResolution, dims.width, dims.height);
          gl.uniform1f(uDpr, budget.dpr);
          gl.uniform1f(uPointScale, budget.pointScale);
          gl.uniform1f(uBrandMix, sample.brandMix);
          gl.uniform1f(uDisperseMix, sample.disperseMix);
          gl.uniform1f(uCodeMix, sample.codeMix);
          gl.uniform1f(uExitMix, sample.exitMix);
          gl.uniform1f(uTurbulence, sample.turbulence);
          gl.uniform1f(uParticleAlpha, sample.particleAlpha);
          gl.uniform2f(uPointer, pointer.x, pointer.y);

          gl.drawArrays(gl.POINTS, 0, data.total);
          gl.bindVertexArray(null);

          const revealBucket = Math.round(sample.heroReveal * 20);
          if (
            sample.stage !== lastReportedStage ||
            revealBucket !== lastReportedRevealBucket
          ) {
            lastReportedStage = sample.stage;
            lastReportedRevealBucket = revealBucket;
            onStateChangeRef.current({
              active: !sample.completed,
              stage: sample.stage,
              heroReveal: sample.heroReveal,
            });
          }

          if (sample.completed) {
            finishIntro();
            return;
          }

          rafId = window.requestAnimationFrame(renderFrame);
        };

        rafId = window.requestAnimationFrame(renderFrame);
      } catch {
        finishIntro();
      }
    };

    void initAndRun();

    return () => {
      disposed = true;
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      window.removeEventListener('pointermove', handlePointerMove);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      if (failsafeTimer !== null) {
        window.clearTimeout(failsafeTimer);
      }
      if (gl) {
        for (const buf of buffers) {
          gl.deleteBuffer(buf);
        }
        if (vao) {
          gl.deleteVertexArray(vao);
        }
        if (program) {
          gl.deleteProgram(program);
        }
      }
      // If user navigated away mid-intro after it visibly started, avoid replaying on SPA return
      if (startTimestamp !== null && performance.now() - startTimestamp > 800) {
        markIntroPlayedInMemory();
      }
    };
  }, [active]);

  if (!active) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[5] overflow-hidden"
    >
      {/* Deep-Space Void Backdrop Harmonized Over Hero Video */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,#06080c_0%,#000000_72%)] transition-opacity duration-200 ease-out"
      />
      {/* Pure GPU WebGL2 Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="relative block h-full w-full"
      />
    </div>
  );
});

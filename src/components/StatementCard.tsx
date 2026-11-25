import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {ChevronDown, ChevronUp} from 'lucide-react';
import {prefersReducedMotion} from '../hooks/useScrollReveal';
import {
  computeWordLensResponse,
  computeWordPointerDistance,
  evaluateStatementTimeline,
  isFineHoverPointerEnvironment,
  OPTICAL_LENS_MAX_SCALE,
  OPTICAL_LENS_RADIUS_PX,
  STATEMENT_FAILSAFE_TIMEOUT_MS,
  STATEMENT_INTERSECTION_THRESHOLD,
  tokenizeTextWords,
  type StatementRevealPhase,
} from '../utils/statementReveal';

interface StatementCardProps {
  title: string;
  openingParagraph: string;
  middleParagraphs: string[];
  purposeParagraph: string;
  closingParagraphs: string[];
  readFullLabel: string;
  collapseLabel: string;
}

interface CachedWordRect {
  el: HTMLSpanElement;
  left: number;
  top: number;
  width: number;
  height: number;
  hadEffect: boolean;
}

interface VisualLineBox {
  text: string;
  left: number;
  midY: number;
}

interface CardParticleCloud {
  total: number;
  morphCount: number;
  posScatter: Float32Array;
  posTarget: Float32Array;
  seeds: Float32Array;
}

const VERTEX_SHADER_SOURCE = `#version 300 es
precision highp float;

layout(location = 0) in vec3 a_posScatter;
layout(location = 1) in vec3 a_posTarget;
layout(location = 2) in vec4 a_seed;

uniform float u_time;
uniform float u_converge;
uniform float u_turbulence;
uniform float u_alpha;
uniform float u_dpr;
uniform float u_pointScale;
uniform float u_aspect;

out float v_alpha;
out float v_isDust;

vec3 curlOffset(vec3 p, float t, float phase) {
  float a = p.y * 3.2 + t * 1.1 + phase * 6.2831;
  float b = p.x * 2.9 - t * 0.95 + phase * 4.1887;
  float c = (p.x - p.y) * 2.4 + t * 0.8 + phase * 3.1415;
  return vec3(
    sin(a) * 0.065 + cos(c) * 0.035,
    cos(b) * 0.075 + sin(a) * 0.035,
    sin(b + c) * 0.09
  );
}

void main() {
  float phase = a_seed.x;
  float speed = a_seed.y;
  float sizeJitter = a_seed.z;
  float packed = a_seed.w;
  float isDust = packed < 0.0 ? 1.0 : 0.0;
  float delay = clamp(abs(packed), 0.0, 0.42);

  vec3 pos;
  if (isDust > 0.5) {
    vec3 drift = vec3(
      sin(u_time * (0.28 + speed * 0.2) + phase * 6.2831) * 0.06,
      cos(u_time * (0.24 + speed * 0.18) + phase * 5.0265) * 0.07,
      sin(u_time * 0.3 + phase * 3.7699) * 0.08
    );
    pos = a_posScatter + drift;
  } else {
    float span = max(0.18, 1.0 - delay);
    float localT = clamp((u_converge - delay) / span, 0.0, 1.0);
    float eased = 1.0 - pow(1.0 - localT, 4.0);

    pos = mix(a_posScatter, a_posTarget, eased);
    vec3 flightCurl = curlOffset(pos, u_time * (0.9 + speed * 0.5), phase);
    float arc = sin(localT * 3.14159265);
    pos += flightCurl * (u_turbulence * (0.45 + arc * 0.85));

    // Gentle orbital drift while scattered before convergence
    float preDrift = 1.0 - eased;
    pos.x += sin(u_time * (0.7 + speed * 0.4) + phase * 6.2831) * 0.025 * preDrift;
    pos.y += cos(u_time * (0.65 + speed * 0.35) + phase * 5.1) * 0.03 * preDrift;
  }

  float cameraDist = 2.6;
  float zClamped = clamp(pos.z, -1.6, 1.1);
  float perspective = cameraDist / (cameraDist - zClamped * 0.48);

  // Perspective pulls slightly around center without breaking target alignment when z = 0
  vec2 projected = vec2(
    pos.x * mix(1.0, perspective, 1.0 - u_converge * 0.85),
    pos.y * mix(1.0, perspective, 1.0 - u_converge * 0.85)
  );
  gl_Position = vec4(projected, clamp(-zClamped * 0.2, -0.9, 0.9), 1.0);

  float baseSize = isDust > 0.5
    ? mix(1.25, 2.7, sizeJitter)
    : mix(1.8, 3.25, sizeJitter) * mix(1.0, 0.88, u_converge);

  float aspectGuard = clamp(u_aspect * 0.25 + 0.75, 0.9, 1.25);
  gl_PointSize = clamp(baseSize * perspective * u_dpr * u_pointScale * aspectGuard, 1.1, 14.0);

  float twinkle = 0.82 + 0.18 * sin(u_time * (1.5 + speed * 2.0) + phase * 6.2831);
  float dustDim = isDust > 0.5 ? 0.44 : 0.96;
  v_alpha = clamp(twinkle * dustDim * u_alpha, 0.0, 1.0);
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
  float halo = smoothstep(0.5, 0.04, dist) * (v_isDust > 0.5 ? 0.28 : 0.44);
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

/**
 * Measures the exact browser-wrapped visual lines for the DOM <h2> so
 * converged white particles align seamlessly with the real heading on any width.
 */
function measureHeadingLines(headingEl: HTMLElement): VisualLineBox[] {
  const headingRect = headingEl.getBoundingClientRect();
  if (headingRect.width <= 0 || headingRect.height <= 0) {
    return [];
  }

  const textNode = headingEl.firstChild;
  if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
    return [
      {
        text: headingEl.textContent || '',
        left: 0,
        midY: headingRect.height * 0.5,
      },
    ];
  }

  const rawText = textNode.textContent || '';
  const wordMatches = Array.from(rawText.matchAll(/\S+/g));
  if (wordMatches.length === 0) {
    return [];
  }

  const lines: Array<{
    startIndex: number;
    endIndex: number;
    minLeft: number;
    topSum: number;
    bottomSum: number;
    count: number;
  }> = [];

  const range = document.createRange();

  for (const match of wordMatches) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    range.setStart(textNode, start);
    range.setEnd(textNode, end);
    const rect = range.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      continue;
    }

    const relLeft = rect.left - headingRect.left;
    const relTop = rect.top - headingRect.top;
    const relBottom = rect.bottom - headingRect.top;
    const lastLine = lines[lines.length - 1];

    if (
      lastLine &&
      Math.abs(relTop - lastLine.topSum / lastLine.count) < rect.height * 0.55
    ) {
      lastLine.endIndex = end;
      lastLine.minLeft = Math.min(lastLine.minLeft, relLeft);
      lastLine.topSum += relTop;
      lastLine.bottomSum += relBottom;
      lastLine.count += 1;
    } else {
      lines.push({
        startIndex: start,
        endIndex: end,
        minLeft: relLeft,
        topSum: relTop,
        bottomSum: relBottom,
        count: 1,
      });
    }
  }

  range.detach?.();

  return lines.map((line) => ({
    text: rawText.slice(line.startIndex, line.endIndex).trim(),
    left: line.minLeft,
    midY: (line.topSum + line.bottomSum) / (2 * line.count),
  }));
}

function buildCardParticleCloud(
  cardEl: HTMLElement,
  headingEl: HTMLElement,
  title: string,
  isSoftwareOrMobile: boolean,
): CardParticleCloud {
  const cardRect = cardEl.getBoundingClientRect();
  const headingRect = headingEl.getBoundingClientRect();
  const cardW = Math.max(240, cardRect.width);
  const cardH = Math.max(180, cardRect.height);
  const headingBoxW = Math.max(160, Math.ceil(headingRect.width));
  const headingBoxH = Math.max(24, Math.ceil(headingRect.height));

  const headingRelLeft = headingRect.left - cardRect.left;
  const headingRelTop = headingRect.top - cardRect.top;

  const computed = window.getComputedStyle(headingEl);
  const fontSize = parseFloat(computed.fontSize) || 18;
  const fontWeight = computed.fontWeight || '600';
  const letterSpacing = computed.letterSpacing;

  const lines = measureHeadingLines(headingEl);
  const sampleScale = 2;
  const offscreen = document.createElement('canvas');
  offscreen.width = Math.ceil(headingBoxW * sampleScale);
  offscreen.height = Math.ceil(headingBoxH * sampleScale);
  const ctx = offscreen.getContext('2d', {willReadFrequently: true});

  const morphTargetBudget = isSoftwareOrMobile ? 1150 : 2100;
  const dustCount = isSoftwareOrMobile ? 220 : 380;
  const rng = createMulberry32(0x71ab5a7e);

  const sampledPts: number[] = [];

  if (ctx) {
    ctx.clearRect(0, 0, offscreen.width, offscreen.height);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = `${fontWeight} ${fontSize * sampleScale}px "Oxanium", sans-serif`;

    if ('letterSpacing' in ctx && letterSpacing && letterSpacing !== 'normal') {
      const numericSpacing = parseFloat(letterSpacing);
      if (Number.isFinite(numericSpacing)) {
        (ctx as CanvasRenderingContext2D & {letterSpacing: string}).letterSpacing =
          `${numericSpacing * sampleScale}px`;
      }
    }

    if (lines.length > 0) {
      for (const line of lines) {
        ctx.fillText(
          line.text,
          line.left * sampleScale,
          line.midY * sampleScale,
        );
      }
    } else {
      ctx.fillText(title, 0, (headingBoxH * sampleScale) / 2);
    }

    const img = ctx.getImageData(0, 0, offscreen.width, offscreen.height).data;
    const step = offscreen.width > 760 ? 2 : 1;

    for (let y = 0; y < offscreen.height; y += step) {
      for (let x = 0; x < offscreen.width; x += step) {
        const alpha = img[(y * offscreen.width + x) * 4 + 3] ?? 0;
        if (alpha > 82) {
          sampledPts.push(x / sampleScale, y / sampleScale);
        }
      }
    }
  }

  const sampleTotal = sampledPts.length / 2;
  const morphCount =
    sampleTotal > 0
      ? Math.min(morphTargetBudget, Math.max(550, Math.round(sampleTotal * 1.1)))
      : 600;
  const total = morphCount + dustCount;

  const posScatter = new Float32Array(total * 3);
  const posTarget = new Float32Array(total * 3);
  const seeds = new Float32Array(total * 4);

  const indices = new Uint32Array(Math.max(1, sampleTotal));
  for (let i = 0; i < sampleTotal; i++) {
    indices[i] = i;
  }
  for (let i = sampleTotal - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = indices[i]!;
    indices[i] = indices[j]!;
    indices[j] = tmp;
  }

  // Clamp horizontal target margin cleanly within card bounds on mobile/narrow viewports
  const safeMarginPx = 14;
  const maxAllowedSpanX = Math.max(120, cardW - safeMarginPx * 2);
  const fitFactor =
    headingBoxW > maxAllowedSpanX ? maxAllowedSpanX / headingBoxW : 1;

  for (let i = 0; i < total; i++) {
    const isDust = i >= morphCount;
    const base = i * 3;
    const sBase = i * 4;

    const sx = (rng() - 0.5) * 1.82;
    const sy = (rng() - 0.5) * 1.76;
    const sz = (rng() - 0.5) * 1.7;

    posScatter[base] = sx;
    posScatter[base + 1] = sy;
    posScatter[base + 2] = sz;

    seeds[sBase] = rng();
    seeds[sBase + 1] = rng();
    seeds[sBase + 2] = rng();

    if (isDust) {
      posTarget[base] = sx;
      posTarget[base + 1] = sy;
      posTarget[base + 2] = sz;
      seeds[sBase + 3] = -(0.01 + rng() * 0.3);
      continue;
    }

    let cssX: number;
    let cssY: number;
    if (sampleTotal > 0) {
      const pick = indices[i % sampleTotal]!;
      const localX = sampledPts[pick * 2]! * fitFactor;
      const localY = sampledPts[pick * 2 + 1]! * fitFactor;
      cssX = Math.max(
        safeMarginPx,
        Math.min(cardW - safeMarginPx, headingRelLeft + localX + (rng() - 0.5) * 0.55),
      );
      cssY = Math.max(
        10,
        Math.min(cardH - 10, headingRelTop + localY + (rng() - 0.5) * 0.55),
      );
    } else {
      cssX = headingRelLeft + rng() * Math.min(headingBoxW, maxAllowedSpanX);
      cssY = headingRelTop + headingBoxH * (0.25 + rng() * 0.5);
    }

    const ndcX = (cssX / cardW) * 2 - 1;
    const ndcY = 1 - (cssY / cardH) * 2;
    const progressX = Math.max(0, Math.min(1, (cssX - headingRelLeft) / headingBoxW));

    posTarget[base] = ndcX;
    posTarget[base + 1] = ndcY;
    posTarget[base + 2] = 0;
    seeds[sBase + 3] = progressX * 0.24 + rng() * 0.14;
  }

  return {
    total,
    morphCount,
    posScatter,
    posTarget,
    seeds,
  };
}

interface LensParagraphProps {
  text: string;
  className?: string;
}

const LensParagraph = memo(function LensParagraph({
  text,
  className = '',
}: LensParagraphProps) {
  const tokens = useMemo(() => tokenizeTextWords(text), [text]);

  return (
    <p className={className}>
      {tokens.map((token, idx) =>
        token.isWhitespace ? (
          <span key={idx}>{token.text}</span>
        ) : (
          <span key={idx} className="statement-lens-word">
            {token.text}
          </span>
        ),
      )}
    </p>
  );
});

export const StatementCard = memo(function StatementCard({
  title,
  openingParagraph,
  middleParagraphs,
  purposeParagraph,
  closingParagraphs,
  readFullLabel,
  collapseLabel,
}: StatementCardProps) {
  const [statementExpanded, setStatementExpanded] = useState(false);
  const [phase, setPhase] = useState<StatementRevealPhase>(() =>
    prefersReducedMotion() ? 'revealed' : 'idle',
  );
  const [sequenceRunning, setSequenceRunning] = useState(false);
  const [headingOpacity, setHeadingOpacity] = useState<number>(() =>
    prefersReducedMotion() ? 1 : 0,
  );

  const cardRef = useRef<HTMLDivElement | null>(null);
  const proseContainerRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const coverRef = useRef<HTMLDivElement | null>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lensBackdropRef = useRef<HTMLDivElement | null>(null);
  const lensOverlayRef = useRef<HTMLDivElement | null>(null);
  const hasTriggeredRef = useRef(phase !== 'idle');

  // Optical lens mutable refs (zero React re-renders during cursor movement)
  const wordCacheRef = useRef<CachedWordRect[]>([]);
  const cacheDirtyRef = useRef(true);
  const pointerStateRef = useRef({
    inside: false,
    overButton: false,
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
    intensity: 0,
  });
  const lensRafRef = useRef<number | null>(null);

  // Effect 1: Scroll-triggered IntersectionObserver (~22% visible, run once per mount)
  useEffect(() => {
    if (hasTriggeredRef.current || phase !== 'idle') {
      return;
    }

    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      hasTriggeredRef.current = true;
      setHeadingOpacity(1);
      setPhase('revealed');
      return;
    }

    const cardNode = cardRef.current;
    if (!cardNode) {
      hasTriggeredRef.current = true;
      setHeadingOpacity(1);
      setPhase('revealed');
      return;
    }

    const triggerOnce = () => {
      if (hasTriggeredRef.current) {
        return;
      }
      hasTriggeredRef.current = true;
      observer.disconnect();
      setPhase('black-cover');
      setSequenceRunning(true);
    };

    const initialRect = cardNode.getBoundingClientRect();
    const initialVisiblePx =
      Math.min(initialRect.bottom, window.innerHeight) -
      Math.max(initialRect.top, 0);
    const initialRatio =
      initialRect.height > 0 ? initialVisiblePx / initialRect.height : 0;

    if (
      initialRatio >= STATEMENT_INTERSECTION_THRESHOLD ||
      initialRect.top < 0
    ) {
      hasTriggeredRef.current = true;
      setPhase('black-cover');
      setSequenceRunning(true);
      return;
    }

    const checkScrollGeometry = () => {
      if (hasTriggeredRef.current) {
        return;
      }
      const rect = cardNode.getBoundingClientRect();
      const visiblePx =
        Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
      const ratio = rect.height > 0 ? visiblePx / rect.height : 0;
      if (ratio >= STATEMENT_INTERSECTION_THRESHOLD || rect.top < 0) {
        triggerOnce();
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (
            (entry.isIntersecting &&
              (entry.intersectionRatio >= STATEMENT_INTERSECTION_THRESHOLD ||
                entry.boundingClientRect.top <= window.innerHeight * 0.68)) ||
            entry.boundingClientRect.top < 0
          ) {
            triggerOnce();
            break;
          }
        }
      },
      {
        threshold: [0, STATEMENT_INTERSECTION_THRESHOLD, 0.45],
      },
    );

    observer.observe(cardNode);
    window.addEventListener('scroll', checkScrollGeometry, {passive: true});

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', checkScrollGeometry);
    };
  }, [phase]);

  // Effect 2: 5-Stage WebGL2 / Canvas Sequence (runs AFTER React commits cover + canvas)
  useEffect(() => {
    if (!sequenceRunning) {
      return;
    }

    let disposed = false;
    let finished = false;
    let rafId: number | null = null;
    let failsafeTimer: number | null = null;
    let gl: WebGL2RenderingContext | null = null;
    let program: WebGLProgram | null = null;
    let vao: WebGLVertexArrayObject | null = null;
    const buffers: WebGLBuffer[] = [];

    const completeSequence = () => {
      if (finished || disposed) {
        return;
      }
      finished = true;
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (failsafeTimer !== null) {
        window.clearTimeout(failsafeTimer);
        failsafeTimer = null;
      }
      if (coverRef.current) {
        coverRef.current.style.opacity = '0';
      }
      setHeadingOpacity(1);
      setPhase('revealed');
      setSequenceRunning(false);
    };

    // Hard failsafe timer so black cover can NEVER stay stuck over text
    failsafeTimer = window.setTimeout(
      completeSequence,
      STATEMENT_FAILSAFE_TIMEOUT_MS,
    );

    const canvasEl = particleCanvasRef.current;
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      completeSequence();
    };
    canvasEl?.addEventListener('webglcontextlost', handleContextLost, false);

    const startSequence = async () => {
      try {
        if (document.fonts?.ready) {
          await Promise.race([
            document.fonts.ready.catch(() => {}),
            new Promise<void>((resolve) => window.setTimeout(resolve, 180)),
          ]);
        }

        if (disposed || finished) {
          return;
        }

        const cardEl = cardRef.current;
        const headingEl = headingRef.current;
        const canvas = particleCanvasRef.current;
        if (!cardEl || !headingEl || !canvas) {
          completeSequence();
          return;
        }

        const cardRect = cardEl.getBoundingClientRect();
        const cardW = Math.max(240, cardRect.width);
        const cardH = Math.max(180, cardRect.height);
        const aspect = cardW / cardH;

        let useWebGL = false;
        let isSoftwareOrMobile = window.innerWidth < 768;

        try {
          gl = canvas.getContext('webgl2', {
            alpha: true,
            antialias: false,
            depth: false,
            powerPreference: 'high-performance',
            premultipliedAlpha: true,
          });
          if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            const rendererStr = debugInfo
              ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '')
              : String(gl.getParameter(gl.RENDERER) || '');
            if (/swiftshader|llvmpipe|software/i.test(rendererStr)) {
              isSoftwareOrMobile = true;
            }
            useWebGL = true;
          }
        } catch {
          gl = null;
        }

        const dpr = isSoftwareOrMobile
          ? 1
          : Math.min(2, window.devicePixelRatio || 1);
        const pointScale = isSoftwareOrMobile ? 1.1 : 1.0;

        const cloud = buildCardParticleCloud(
          cardEl,
          headingEl,
          title,
          isSoftwareOrMobile,
        );

        const resizeCanvas = () => {
          const rect = cardEl.getBoundingClientRect();
          const w = Math.max(1, Math.round(rect.width * dpr));
          const h = Math.max(1, Math.round(rect.height * dpr));
          if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
          }
          if (gl && useWebGL) {
            gl.viewport(0, 0, w, h);
          }
          return {cssW: Math.max(1, rect.width), cssH: Math.max(1, rect.height)};
        };

        resizeCanvas();

        let uTime: WebGLUniformLocation | null = null;
        let uConverge: WebGLUniformLocation | null = null;
        let uTurbulence: WebGLUniformLocation | null = null;
        let uAlpha: WebGLUniformLocation | null = null;
        let uDpr: WebGLUniformLocation | null = null;
        let uPointScale: WebGLUniformLocation | null = null;
        let uAspect: WebGLUniformLocation | null = null;

        if (gl && useWebGL) {
          try {
            program = createProgram(
              gl,
              VERTEX_SHADER_SOURCE,
              FRAGMENT_SHADER_SOURCE,
            );
            vao = gl.createVertexArray();
            if (!vao) {
              throw new Error('VAO failed');
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
                throw new Error('Buffer failed');
              }
              buffers.push(buf);
              gl.bindBuffer(gl.ARRAY_BUFFER, buf);
              gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);
              gl.enableVertexAttribArray(loc);
              gl.vertexAttribPointer(loc, components, gl.FLOAT, false, 0, 0);
            };

            bindFloatBuffer(0, cloud.posScatter, 3);
            bindFloatBuffer(1, cloud.posTarget, 3);
            bindFloatBuffer(2, cloud.seeds, 4);
            gl.bindVertexArray(null);

            uTime = gl.getUniformLocation(program, 'u_time');
            uConverge = gl.getUniformLocation(program, 'u_converge');
            uTurbulence = gl.getUniformLocation(program, 'u_turbulence');
            uAlpha = gl.getUniformLocation(program, 'u_alpha');
            uDpr = gl.getUniformLocation(program, 'u_dpr');
            uPointScale = gl.getUniformLocation(program, 'u_pointScale');
            uAspect = gl.getUniformLocation(program, 'u_aspect');

            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
            gl.clearColor(0, 0, 0, 0);
          } catch {
            useWebGL = false;
          }
        }

        const ctx2d = !useWebGL ? canvas.getContext('2d') : null;
        if (!useWebGL && !ctx2d) {
          completeSequence();
          return;
        }

        let startTs: number | null = null;
        let lastStage: StatementRevealPhase = 'black-cover';
        let lastHeadingBucket = -1;

        const renderFrame = (now: number) => {
          if (disposed || finished) {
            return;
          }
          if (startTs === null) {
            startTs = now;
          }

          const elapsed = now - startTs;
          const sample = evaluateStatementTimeline(elapsed);

          if (sample.phase !== lastStage) {
            lastStage = sample.phase;
            setPhase(sample.phase);
          }

          if (coverRef.current) {
            coverRef.current.style.opacity = sample.coverAlpha.toFixed(3);
          }

          const headingBucket = Math.round(sample.headingOpacity * 40);
          if (headingBucket !== lastHeadingBucket) {
            lastHeadingBucket = headingBucket;
            setHeadingOpacity(sample.headingOpacity);
          }

          const dims = resizeCanvas();

          if (useWebGL && gl && program && vao) {
            gl.clear(gl.COLOR_BUFFER_BIT);
            if (sample.particleAlpha > 0.005) {
              gl.useProgram(program);
              gl.bindVertexArray(vao);
              gl.uniform1f(uTime, elapsed * 0.001);
              gl.uniform1f(uConverge, sample.particleConverge);
              gl.uniform1f(uTurbulence, sample.turbulence);
              gl.uniform1f(uAlpha, sample.particleAlpha);
              gl.uniform1f(uDpr, dpr);
              gl.uniform1f(uPointScale, pointScale);
              gl.uniform1f(uAspect, aspect);
              gl.drawArrays(gl.POINTS, 0, cloud.total);
              gl.bindVertexArray(null);
            }
          } else if (ctx2d) {
            ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx2d.clearRect(0, 0, dims.cssW, dims.cssH);
            if (sample.particleAlpha > 0.005) {
              ctx2d.globalCompositeOperation = 'lighter';
              const sec = elapsed * 0.001;
              for (let i = 0; i < cloud.total; i++) {
                const base = i * 3;
                const sBase = i * 4;
                const packed = cloud.seeds[sBase + 3]!;
                const isDust = packed < 0;
                const delay = Math.abs(packed);
                const seedPhase = cloud.seeds[sBase]!;
                const sx = (cloud.posScatter[base]! * 0.5 + 0.5) * dims.cssW;
                const sy = (0.5 - cloud.posScatter[base + 1]! * 0.5) * dims.cssH;

                let px = sx;
                let py = sy;
                if (!isDust) {
                  const span = Math.max(0.18, 1 - delay);
                  const localT = Math.max(
                    0,
                    Math.min(1, (sample.particleConverge - delay) / span),
                  );
                  const eased = 1 - Math.pow(1 - localT, 4);
                  const tx = (cloud.posTarget[base]! * 0.5 + 0.5) * dims.cssW;
                  const ty = (0.5 - cloud.posTarget[base + 1]! * 0.5) * dims.cssH;
                  px = sx + (tx - sx) * eased;
                  py = sy + (ty - sy) * eased;
                } else {
                  px += Math.sin(sec + seedPhase * 6.28) * 6;
                  py += Math.cos(sec + seedPhase * 5.1) * 6;
                }

                const alpha = sample.particleAlpha * (isDust ? 0.38 : 0.92);
                ctx2d.globalAlpha = alpha;
                ctx2d.fillStyle = '#f7fbff';
                ctx2d.beginPath();
                ctx2d.arc(px, py, isDust ? 1.0 : 1.35, 0, Math.PI * 2);
                ctx2d.fill();
              }
              ctx2d.globalCompositeOperation = 'source-over';
              ctx2d.globalAlpha = 1;
            }
          }

          if (sample.completed) {
            completeSequence();
            return;
          }

          rafId = window.requestAnimationFrame(renderFrame);
        };

        rafId = window.requestAnimationFrame(renderFrame);
      } catch {
        completeSequence();
      }
    };

    void startSequence();

    return () => {
      disposed = true;
      canvasEl?.removeEventListener('webglcontextlost', handleContextLost);
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
    };
  }, [sequenceRunning, title]);

  // Measure word positions relative to card container for zero-reflow lens math
  const rebuildWordCache = useCallback(() => {
    const cardEl = cardRef.current;
    const proseEl = proseContainerRef.current;
    if (!cardEl || !proseEl) {
      wordCacheRef.current = [];
      cacheDirtyRef.current = false;
      return;
    }

    const cardRect = cardEl.getBoundingClientRect();
    const nodes = proseEl.querySelectorAll<HTMLSpanElement>('.statement-lens-word');
    const cached: CachedWordRect[] = [];

    nodes.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        return;
      }
      cached.push({
        el,
        left: rect.left - cardRect.left,
        top: rect.top - cardRect.top,
        width: rect.width,
        height: rect.height,
        hadEffect: false,
      });
    });

    wordCacheRef.current = cached;
    cacheDirtyRef.current = false;
  }, []);

  useEffect(() => {
    cacheDirtyRef.current = true;
    const timer = window.setTimeout(() => {
      cacheDirtyRef.current = true;
      if (pointerStateRef.current.inside) {
        rebuildWordCache();
      }
    }, 360);
    return () => window.clearTimeout(timer);
  }, [statementExpanded, rebuildWordCache]);

  useEffect(() => {
    const handleResize = () => {
      cacheDirtyRef.current = true;
    };
    window.addEventListener('resize', handleResize, {passive: true});
    return () => {
      window.removeEventListener('resize', handleResize);
      if (lensRafRef.current !== null) {
        window.cancelAnimationFrame(lensRafRef.current);
      }
    };
  }, []);

  const stepLensFrame = useCallback(() => {
    const state = pointerStateRef.current;
    const targetIntensity = state.inside && !state.overButton ? 1 : 0;

    state.currentX += (state.targetX - state.currentX) * 0.28;
    state.currentY += (state.targetY - state.currentY) * 0.28;
    state.intensity += (targetIntensity - state.intensity) * 0.2;

    if (cacheDirtyRef.current && state.inside) {
      rebuildWordCache();
    }

    const lensBackdropEl = lensBackdropRef.current;
    const lensEl = lensOverlayRef.current;
    const lensTx = `translate3d(${(state.currentX - OPTICAL_LENS_RADIUS_PX).toFixed(1)}px, ${(state.currentY - OPTICAL_LENS_RADIUS_PX).toFixed(1)}px, 0) scale(${(0.92 + 0.08 * state.intensity).toFixed(3)})`;
    const lensOp =
      state.intensity < 0.008 && targetIntensity === 0
        ? '0'
        : (state.intensity * 0.96).toFixed(3);

    if (lensBackdropEl) {
      lensBackdropEl.style.opacity = lensOp;
      if (lensOp !== '0') {
        lensBackdropEl.style.transform = lensTx;
      }
    }
    if (lensEl) {
      lensEl.style.opacity = lensOp;
      if (lensOp !== '0') {
        lensEl.style.transform = lensTx;
      }
    }

    const words = wordCacheRef.current;
    const cullMargin = OPTICAL_LENS_RADIUS_PX + 28;

    let focalWord: CachedWordRect | null = null;
    let focalExpansionHalfPx = 0;
    if (state.intensity >= 0.008) {
      let bestDist = Infinity;
      for (const item of words) {
        if (Math.abs(item.top + item.height * 0.5 - state.currentY) > 28) {
          continue;
        }
        const d = computeWordPointerDistance(
          state.currentX,
          state.currentY,
          item.left,
          item.top,
          item.width,
          item.height,
        );
        if (d < bestDist && d < OPTICAL_LENS_RADIUS_PX * 0.6) {
          bestDist = d;
          focalWord = item;
        }
      }
      if (focalWord) {
        focalExpansionHalfPx =
          focalWord.width * (OPTICAL_LENS_MAX_SCALE - 1) * 0.5 * state.intensity;
      }
    }

    for (const item of words) {
      const midY = item.top + item.height * 0.5;
      if (
        state.intensity < 0.008 ||
        Math.abs(midY - state.currentY) > cullMargin
      ) {
        if (item.hadEffect) {
          item.el.style.transform = '';
          item.el.style.filter = '';
          item.el.style.zIndex = '';
          item.hadEffect = false;
        }
        continue;
      }

      const dist = computeWordPointerDistance(
        state.currentX,
        state.currentY,
        item.left,
        item.top,
        item.width,
        item.height,
      );
      const wordMidX = item.left + item.width * 0.5;
      const isFocal = focalWord === item;
      const response = computeWordLensResponse(
        dist,
        OPTICAL_LENS_RADIUS_PX,
        OPTICAL_LENS_MAX_SCALE,
        isFocal ? 0 : wordMidX - state.currentX,
      );

      if (response.focus <= 0.008 && !focalWord) {
        if (item.hadEffect) {
          item.el.style.transform = '';
          item.el.style.filter = '';
          item.el.style.zIndex = '';
          item.hadEffect = false;
        }
        continue;
      }

      const scale = 1 + (response.scale - 1) * state.intensity;
      const liftY = response.liftY * state.intensity;
      let shiftX = response.shiftX * state.intensity;

      if (
        focalWord &&
        !isFocal &&
        Math.abs(item.top - focalWord.top) < focalWord.height * 0.6
      ) {
        const focalMidX = focalWord.left + focalWord.width * 0.5;
        const dxFromFocal = wordMidX - focalMidX;
        const proximity = Math.max(
          0,
          1 -
            Math.abs(dxFromFocal) /
              (focalWord.width * 0.6 + OPTICAL_LENS_RADIUS_PX * 1.1),
        );
        const dir = dxFromFocal >= 0 ? 1 : -1;
        shiftX += dir * Math.min(8.5, focalExpansionHalfPx + 1.5) * proximity;
      }

      const focus = response.focus * state.intensity;
      if (scale <= 1.001 && Math.abs(shiftX) < 0.08) {
        if (item.hadEffect) {
          item.el.style.transform = '';
          item.el.style.filter = '';
          item.el.style.zIndex = '';
          item.hadEffect = false;
        }
        continue;
      }

      item.el.style.transform = `translate3d(${shiftX.toFixed(2)}px, ${liftY.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
      item.el.style.filter =
        focus > 0.03
          ? `brightness(${(1 + focus * 0.34).toFixed(3)}) contrast(${(1 + focus * 0.16).toFixed(3)})`
          : '';
      item.el.style.zIndex = isFocal ? '4' : focus > 0.12 ? '3' : '';
      item.hadEffect = true;
    }

    const settledOut = !state.inside && state.intensity < 0.008;
    const settledPos =
      Math.abs(state.targetX - state.currentX) < 0.25 &&
      Math.abs(state.targetY - state.currentY) < 0.25 &&
      Math.abs(targetIntensity - state.intensity) < 0.008;

    if (settledOut || (settledPos && !state.inside)) {
      lensRafRef.current = null;
      return;
    }

    lensRafRef.current = window.requestAnimationFrame(stepLensFrame);
  }, [rebuildWordCache]);

  const ensureLensLoop = useCallback(() => {
    if (lensRafRef.current === null) {
      lensRafRef.current = window.requestAnimationFrame(stepLensFrame);
    }
  }, [stepLensFrame]);

  const handleCardPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (
        (event.pointerType && event.pointerType !== 'mouse') ||
        !isFineHoverPointerEnvironment() ||
        prefersReducedMotion() ||
        (phase !== 'text-reveal' && phase !== 'revealed')
      ) {
        return;
      }

      const cardEl = cardRef.current;
      if (!cardEl) {
        return;
      }

      const rect = cardEl.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const state = pointerStateRef.current;
      const wasInside = state.inside;

      state.targetX = x;
      state.targetY = y;
      if (!wasInside) {
        state.currentX = x;
        state.currentY = y;
      }
      state.inside = true;
      state.overButton = Boolean(
        (event.target as HTMLElement | null)?.closest('button, a'),
      );

      if (cacheDirtyRef.current) {
        rebuildWordCache();
      }
      ensureLensLoop();
    },
    [ensureLensLoop, phase, rebuildWordCache],
  );

  const handleCardPointerLeave = useCallback(() => {
    const state = pointerStateRef.current;
    if (!state.inside && state.intensity === 0) {
      return;
    }
    state.inside = false;
    state.overButton = false;
    ensureLensLoop();
  }, [ensureLensLoop]);

  const bodyRevealed = phase === 'text-reveal' || phase === 'revealed';

  return (
    <section
      id="statement"
      aria-labelledby="statement-heading"
      data-statement-phase={phase}
      className="relative mx-auto w-full scroll-mt-24 border-t border-b border-white/[0.08] py-16 sm:py-20"
    >
      <div
        ref={cardRef}
        onPointerMove={handleCardPointerMove}
        onPointerLeave={handleCardPointerLeave}
        className="relative overflow-hidden text-start"
      >
        <span
          aria-hidden="true"
          style={{'--tick-delay': '3s'} as CSSProperties}
          className="home-border-tick pointer-events-none absolute top-0 start-0 h-[1px] w-28"
        />

        {/* Stages 1–4 Bespoke Full-Card #000000 Shroud + Glowing White Particle Layer */}
        {sequenceRunning ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[inherit]"
          >
            <div
              ref={coverRef}
              data-testid="statement-black-cover"
              className="absolute inset-0 bg-[#000000]"
              style={{opacity: 0}}
            />
            <canvas
              ref={particleCanvasRef}
              data-testid="statement-particle-canvas"
              className="relative block h-full w-full"
            />
          </div>
        ) : null}

        {/* Desktop fine-pointer optical lens backdrop illumination */}
        <div
          ref={lensBackdropRef}
          aria-hidden="true"
          className="statement-optical-lens-bg pointer-events-none absolute top-0 left-0 z-0 rounded-full opacity-0"
          style={{
            width: `${OPTICAL_LENS_RADIUS_PX * 2}px`,
            height: `${OPTICAL_LENS_RADIUS_PX * 2}px`,
          }}
        />

        {/* Desktop fine-pointer optical lens specular glass rim */}
        <div
          ref={lensOverlayRef}
          aria-hidden="true"
          className="statement-optical-lens pointer-events-none absolute top-0 left-0 z-[2] rounded-full opacity-0"
          style={{
            width: `${OPTICAL_LENS_RADIUS_PX * 2}px`,
            height: `${OPTICAL_LENS_RADIUS_PX * 2}px`,
          }}
        />

        <div className="relative z-[1] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2
            id="statement-heading"
            ref={headingRef}
            style={{opacity: headingOpacity}}
            className="font-display-heading relative text-base font-semibold text-[var(--text-primary)] sm:text-lg"
          >
            {title}
          </h2>

          <button
            type="button"
            onClick={() => setStatementExpanded((prev) => !prev)}
            aria-expanded={statementExpanded}
            data-revealed={bodyRevealed}
            className="statement-phase-reveal glass-surface-subtle inline-flex min-h-[38px] shrink-0 items-center justify-center gap-1.5 self-start whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] sm:self-auto"
          >
            <span>{statementExpanded ? collapseLabel : readFullLabel}</span>
            {statementExpanded ? (
              <ChevronUp className="h-3.5 w-3.5" strokeWidth={1.75} />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.75} />
            )}
          </button>
        </div>

        <div
          ref={proseContainerRef}
          data-revealed={bodyRevealed}
          className="statement-phase-reveal font-body-prose relative z-[1] mt-4 text-sm text-[var(--text-secondary)] sm:text-[15px]"
        >
          <LensParagraph text={openingParagraph} />

          <div
            data-expanded={statementExpanded}
            aria-hidden={!statementExpanded}
            className="statement-collapse-grid"
          >
            <div className="statement-collapse-inner">
              <div className="space-y-3.5 pt-3.5">
                {middleParagraphs.map((paragraph, index) => (
                  <LensParagraph key={index} text={paragraph} />
                ))}
              </div>
            </div>
          </div>

          <LensParagraph
            text={purposeParagraph}
            className="mt-3.5 font-semibold text-[var(--text-primary)]"
          />

          {closingParagraphs.length > 0 ? (
            <div
              data-expanded={statementExpanded}
              aria-hidden={!statementExpanded}
              className="statement-collapse-grid"
            >
              <div className="statement-collapse-inner">
                <div className="space-y-3.5 pt-3.5">
                  {closingParagraphs.map((paragraph, index) => (
                    <LensParagraph key={index} text={paragraph} />
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
});

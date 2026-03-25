import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Layers, Atom, Code2, Server, RefreshCw, FileCode, Palette,
  Monitor, ArrowRight, Zap, PenTool, Globe, Database,
  TextCursorInput, Linkedin, GitBranch, Twitter, Brain, Coffee, Code,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────
// Layout constants — all coordinates are in a 900×580 design space.
// Icons and the SVG are positioned as % of the container so the
// section scales responsively on any screen width.
// ─────────────────────────────────────────────────────────────────
const W = 900;          // design-space width
const H = 580;          // design-space height
const ORB_X = 450;      // orb centre x
const ORB_Y = 390;      // orb centre y

// ── Two rows of static tech icons at the top ──────────────────────
const ROW1_Y = 65;
const ROW2_Y = 132;
const ICON_STEP = 66;   // horizontal gap between icon centres

const ROW1_ICONS: LucideIcon[] = [Layers, Atom, Code2, Server, RefreshCw, FileCode, Palette];
const ROW2_ICONS: LucideIcon[] = [Monitor, ArrowRight, Zap, PenTool, Globe, Database];

// Calculate centred x positions for a row of n icons
function rowX(count: number): number[] {
  const half = ((count - 1) * ICON_STEP) / 2;
  return Array.from({ length: count }, (_, i) => ORB_X - half + i * ICON_STEP);
}

// ── Three orbit rings, each with its own icons and rotation speed ──
// rx / ry define the ellipse; duration = seconds for one full lap.
const ORBITS = [
  { rx: 148, ry: 46,  duration: 8,  icons: [Brain, Linkedin, Coffee]           },
  { rx: 238, ry: 76,  duration: 14, icons: [Code, Globe, Twitter]               },
  { rx: 334, ry: 110, duration: 22, icons: [FileCode, Atom, GitBranch, Monitor] },
];

// ── Point on a plain (un-tilted) ellipse at angle θ (degrees) ─────
function ellipsePoint(cx: number, cy: number, rx: number, ry: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + rx * Math.cos(rad), y: cy + ry * Math.sin(rad) };
}

// Convert design-space coords to CSS percentage strings
const px = (n: number) => `${(n / W) * 100}%`;
const py = (n: number) => `${(n / H) * 100}%`;

// ─────────────────────────────────────────────────────────────────
export function TechOrbitSection() {
  // Single time counter (seconds) drives all orbit animations
  const [time, setTime] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    let frameId: number;

    function tick(ts: number) {
      if (start === null) start = ts;
      setTime((ts - start) / 1000); // convert ms → seconds
      frameId = requestAnimationFrame(tick);
    }

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Pre-compute static row positions
  const row1X = rowX(ROW1_ICONS.length);
  const row2X = rowX(ROW2_ICONS.length);

  // All tech icon positions (used to draw connector lines)
  const allIconPos = [
    ...row1X.map((x) => ({ x, y: ROW1_Y })),
    ...row2X.map((x) => ({ x, y: ROW2_Y })),
  ];

  return (
    <section
      className="w-full overflow-hidden"
      style={{ background: "linear-gradient(180deg, #080612 0%, #0d0b1e 60%, #0a0715 100%)" }}
    >
      {/* ── Heading ─────────────────────────────────────────────── */}
      <div className="text-center pt-14 pb-6 px-4">
        <p className="text-white text-xl md:text-2xl font-light tracking-wide">
          I'm currently looking to join a{" "}
          <span className="text-purple-400 font-semibold">cross-functional</span> team
        </p>
        <p className="text-gray-500 text-sm md:text-base mt-2">
          that values improving people's lives through accessible design
        </p>
      </div>

      {/* ── Main visual (SVG + absolutely-positioned icons) ─────── */}
      <div
        className="relative w-full mx-auto"
        style={{ maxWidth: `${W}px`, aspectRatio: `${W} / ${H}` }}
      >
        {/* SVG draws the glow, connector lines, and orbit rings */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={`0 0 ${W} ${H}`}
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="orbGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#7c3aed" stopOpacity="0.5" />
              <stop offset="70%"  stopColor="#7c3aed" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0"   />
            </radialGradient>
            <radialGradient id="floorGlow" cx="50%" cy="20%" r="50%">
              <stop offset="0%"   stopColor="#6d28d9" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#6d28d9" stopOpacity="0"    />
            </radialGradient>
          </defs>

          {/* Soft floor glow beneath the orb */}
          <ellipse cx={ORB_X} cy={ORB_Y + 90} rx={340} ry={140} fill="url(#floorGlow)" />

          {/* Orb halo */}
          <circle cx={ORB_X} cy={ORB_Y} r={120} fill="url(#orbGlow)" />

          {/* Connector lines from each tech icon down to the orb */}
          {allIconPos.map((pos, i) => (
            <line
              key={i}
              x1={pos.x} y1={pos.y + 14}
              x2={ORB_X} y2={ORB_Y - 50}
              stroke="rgba(139,92,246,0.2)"
              strokeWidth="0.9"
            />
          ))}

          {/* Orbit ellipses (flat — no tilt) */}
          {ORBITS.map((o, i) => (
            <ellipse
              key={i}
              cx={ORB_X} cy={ORB_Y}
              rx={o.rx} ry={o.ry}
              fill="none"
              stroke="rgba(139,92,246,0.35)"
              strokeWidth="0.85"
            />
          ))}
        </svg>

        {/* ── Row 1 — static tech icon circles ──────────────────── */}
        {row1X.map((x, i) => {
          const Icon = ROW1_ICONS[i];
          return (
            <IconCircle key={`r1-${i}`} x={x} y={ROW1_Y}>
              <Icon style={{ width: "46%", height: "46%" }} className="text-purple-400" />
            </IconCircle>
          );
        })}

        {/* ── Row 2 — static tech icon circles ──────────────────── */}
        {row2X.map((x, i) => {
          const Icon = ROW2_ICONS[i];
          return (
            <IconCircle key={`r2-${i}`} x={x} y={ROW2_Y}>
              <Icon style={{ width: "46%", height: "46%" }} className="text-purple-400" />
            </IconCircle>
          );
        })}

        {/* ── Centre glowing orb ────────────────────────────────── */}
        <div
          className="absolute"
          style={{ left: px(ORB_X), top: py(ORB_Y), transform: "translate(-50%,-50%)", width: "15.5%", aspectRatio: "1/1" }}
        >
          {/* Diffuse outer glow */}
          <div className="absolute rounded-full" style={{ inset: "-55%", background: "radial-gradient(circle, rgba(109,40,217,0.3) 0%, transparent 70%)" }} />
          {/* Orb sphere */}
          <div
            className="absolute inset-0 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(145deg, #7c3aed 0%, #4c1d95 60%, #2d0f6b 100%)",
              boxShadow: "0 0 32px 8px rgba(109,40,217,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            <TextCursorInput
              className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              style={{ width: "50%", height: "50%" }}
            />
          </div>
        </div>

        {/* ── Orbit icons — animated using time counter ─────────── */}
        {ORBITS.map((orbit, oi) =>
          orbit.icons.map((Icon, ii) => {
            // Each icon starts evenly spaced, then all move together as time advances
            const startAngle = (360 / orbit.icons.length) * ii;
            const currentAngle = startAngle + (time / orbit.duration) * 360;
            const { x, y } = ellipsePoint(ORB_X, ORB_Y, orbit.rx, orbit.ry, currentAngle);

            return (
              <div
                key={`orbit-${oi}-${ii}`}
                className="absolute flex items-center justify-center"
                style={{ left: px(x), top: py(y), transform: "translate(-50%,-50%)", width: "2.2%", aspectRatio: "1/1" }}
              >
                <Icon style={{ width: "100%", height: "100%", color: "rgba(167,139,250,0.6)" }} />
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

// ── Small reusable icon circle ─────────────────────────────────────
function IconCircle({ x, y, children }: { x: number; y: number; children: React.ReactNode }) {
  return (
    <div
      className="absolute rounded-full flex items-center justify-center"
      style={{
        left: px(x), top: py(y),
        transform: "translate(-50%,-50%)",
        width: "5.6%", aspectRatio: "1/1",
        background: "#15102a",
        border: "1px solid #2e275a",
        boxShadow: "0 0 10px rgba(109,40,217,0.15)",
      }}
    >
      {children}
    </div>
  );
}

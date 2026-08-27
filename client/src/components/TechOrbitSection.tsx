import { useEffect, useState } from "react";
import {
  Code2,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────
// Layout constants — all coordinates are in a 900×430 design space.
// Icons and the SVG are positioned as % of the container so the
// section scales responsively on any screen width.
// ─────────────────────────────────────────────────────────────────
const W = 900;          // design-space width
const H = 430;          // design-space height
const ORB_X = 450;      // orb centre x
const ORB_Y = 260;      // orb centre y
const ORBIT_SCALE = 1.25;

// ── Two rows of static tech icons at the top ──────────────────────
const ROW1_Y = 65;
const ROW2_Y = 132;
const ICON_STEP = 66;   // horizontal gap between icon centres

const FLATICON_ATTRIBUTION = "https://www.flaticon.com/free-icons/javascript";

type TechIcon = {
  name: string;
  src: string;
  title: string;
};

const icon = (name: string, slug: string, color?: string, title?: string): TechIcon => ({
  name,
  src: `https://cdn.simpleicons.org/${slug}${color ? `/${color}` : ""}`,
  title: `${title}`,
});

const ROW1_ICONS: TechIcon[] = [
  icon("JavaScript", "javascript", "F7DF1E", "JavaScript"),
  icon("React", "react", "61DAFB", "React"),
  icon("TypeScript", "typescript", "3178C6", "TypeScript"),
  icon("Node.js", "nodedotjs", "5FA04E", "Node.js"),
  icon("Git", "git", "F05032", "Git/GitHub"),
  icon("HTML5", "html5", "E34F26", "HTML5"),
  icon("CSS3", "css", "1572B6", "CSS3"),
];
const ROW2_ICONS: TechIcon[] = [
  icon("Tailwind CSS", "tailwindcss", "06B6D4", "Tailwind CSS"),
  icon("Vite", "vite", "646CFF", "Vite"),
  icon("Express", "express", "FFFFFF", "Express"),
  icon("MongoDB", "mongodb", "47A248", "MongoDB"),
];

// Calculate centred x positions for a row of n icons
function rowX(count: number): number[] {
  const half = ((count - 1) * ICON_STEP) / 2;
  return Array.from({ length: count }, (_, i) => ORB_X - half + i * ICON_STEP);
}

// ── Three orbit rings, each with its own icons and rotation speed ──
// rx / ry define the ellipse; duration = seconds for one full lap.
const ORBITS = [
  {
    rx: 148, ry: 46, duration: 8, icons: [icon("JavaScript", "javascript", "F7DF1E", "JavaScript"),
    icon("React", "react", "61DAFB", "React"),
    icon("TypeScript", "typescript", "3178C6", "TypeScript"),]
  },
  {
    rx: 238, ry: 76, duration: 14, icons: [icon("Node.js", "nodedotjs", "5FA04E", "Node.js"),
    icon("Git", "git", "F05032", "Git/GitHub"),
    icon("HTML5", "html5", "E34F26", "HTML5"),
    icon("CSS3", "css", "1572B6", "CSS3"),]
  },
  {
    rx: 334, ry: 110, duration: 22, icons: [icon("Tailwind CSS", "tailwindcss", "06B6D4", "Tailwind CSS"),
    icon("Vite", "vite", "646CFF", "Vite"),
    icon("Express", "express", "FFFFFF", "Express"),
    icon("MongoDB", "mongodb", "47A248", "MongoDB"),]
  },
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
    <div className="w-full overflow-hidden">
  
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
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
              <stop offset="70%" stopColor="hsl(var(--primary))" stopOpacity="0.12" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="floorGlow" cx="50%" cy="20%" r="50%">
              <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.28" />
              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Soft floor glow beneath the orb */}
          <ellipse cx={ORB_X} cy={ORB_Y + 90} rx={340} ry={140} fill="url(#floorGlow)" />

          {/* Orb halo */}
          <circle cx={ORB_X} cy={ORB_Y} r={92} fill="url(#orbGlow)" />

          {/* Orbit ellipses (flat — no tilt) */}
          {ORBITS.map((o, i) => (
            <ellipse
              key={i}
              cx={ORB_X} cy={ORB_Y}
              rx={o.rx * ORBIT_SCALE} ry={o.ry * ORBIT_SCALE}
              fill="none"
              stroke="hsl(var(--primary) / 0.35)"
              strokeWidth="0.85"
            />
          ))}
        </svg>



        {/* ── Centre glowing orb ────────────────────────────────── */}
        <div
          className="absolute"
          style={{ left: px(ORB_X), top: py(ORB_Y), transform: "translate(-50%,-50%)", width: "11%", aspectRatio: "1/1" }}
        >
          {/* Diffuse outer glow */}
          <div className="absolute rounded-full" style={{ inset: "-48%", background: "radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, transparent 70%)" }} />
          {/* Orb sphere */}
          <div
            className="absolute inset-0 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(145deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)",
              boxShadow: "0 0 32px 8px hsl(var(--primary) / 0.45), inset 0 1px 0 rgba(255,255,255,0.14)",
            }}
          >
            <Code2
              className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              style={{ width: "50%", height: "50%" }}
            />
          </div>
        </div>

        {/* ── Orbit icons — animated using time counter ─────────── */}
        {ORBITS.map((orbit, oi) =>
          orbit.icons.map((techIcon, ii) => {
            // Each icon starts evenly spaced, then all move together as time advances
            const startAngle = (360 / orbit.icons.length) * ii;
            const currentAngle = startAngle + (time / orbit.duration) * 360;
            const { x, y } = ellipsePoint(ORB_X, ORB_Y, orbit.rx * ORBIT_SCALE, orbit.ry * ORBIT_SCALE, currentAngle);

            return (
              <div
                key={`orbit-${oi}-${ii}`}
                className="absolute flex items-center justify-center"
                style={{ left: px(x), top: py(y), transform: "translate(-50%,-50%)", width: "3.2%", aspectRatio: "1/1" }}
              >
                <TechIconLink techIcon={techIcon} orbit />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function TechIconLink({ techIcon, orbit = false }: { techIcon: TechIcon; orbit?: boolean }) {
  return (

    <a
      href={FLATICON_ATTRIBUTION}
      title={techIcon.title}
      target="_blank"
      rel="noreferrer"
      aria-label={`${techIcon.name} icon attribution`}
      className="flex items-center justify-center"
      style={{ width: "100%", height: "100%" }}
    >
      <img
        src={techIcon.src}
        alt={techIcon.name}
        style={{ width: orbit ? "100%" : "46%", height: orbit ? "100%" : "46%", opacity: orbit ? 0.6 : 1 }}
      />
    </a>
  );
}


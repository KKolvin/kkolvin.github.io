import { useEffect, useRef } from 'react';
import Delaunator from 'delaunator';

// Default (far from cursor): dusty rose matching --pink-deep (#dfa8c8 = 223,168,200)
// Vortex  (near cursor): mint green accent (#6a9fa0 = 106,159,160)    
const C_DEFAULT = [223, 168, 200];
const C_VORTEX  = [106, 159, 160];

// Poisson disk minimum distance — controls spatial density uniformly across all screens.
// r ≈ sqrt(2 * CELL_AREA / sqrt(3)); with CELL_AREA = 11000 → r ≈ 113px
const POISSON_CELL = 16000; // px² per node (approx)

const MOUSE_R        = 900;    // radius of attraction (px)
const RADIAL_FORCE   = 0.085;   // slow inward pull toward cursor
const RETURN_LERP    = 0.045;  // position lerp per frame when returning (no bounce)
const DAMPING        = 0.88;   // velocity damping during mouse attraction
const MOUSE_LAG      = 0.065;  // vortex center lags behind real cursor
const COLOR_FADE     = 0.022;  // colour lerp speed (~45 frames to fully transition)
const LINE_ALPHA     = 0.45;
const NODE_ALPHA     = 0.8;
const LINE_ALPHA_HOT = 0.62;
const NODE_ALPHA_HOT = 0.78;
const NODE_R         = 1.7;

const next = (e) => (e % 3 === 2 ? e - 2 : e + 1);

// ── Bridson's Poisson-disk sampling ──────────────────────────────────────────
// Returns an array of [x, y] pairs with minimum distance `r` between any two.
function poissonDisk(W, H, r, k = 30) {
    const cell  = r / Math.SQRT2;
    const cols  = Math.ceil(W / cell);
    const rows  = Math.ceil(H / cell);
    const grid  = new Int32Array(cols * rows).fill(-1); // stores point index
    const pts   = [];
    const active = [];

    const gridIdx = (x, y) => Math.floor(y / cell) * cols + Math.floor(x / cell);

    const isValid = (x, y) => {
        if (x < 0 || x >= W || y < 0 || y >= H) return false;
        const col = Math.floor(x / cell);
        const row = Math.floor(y / cell);
        const c0 = Math.max(0, col - 2), c1 = Math.min(cols - 1, col + 2);
        const r0 = Math.max(0, row - 2), r1 = Math.min(rows - 1, row + 2);
        for (let rr = r0; rr <= r1; rr++) {
            for (let cc = c0; cc <= c1; cc++) {
                const idx = grid[rr * cols + cc];
                if (idx !== -1) {
                    const dx = x - pts[idx][0];
                    const dy = y - pts[idx][1];
                    if (dx * dx + dy * dy < r * r) return false;
                }
            }
        }
        return true;
    };

    // Seed with a point at the centre
    const sx = W / 2, sy = H / 2;
    pts.push([sx, sy]);
    active.push(0);
    grid[gridIdx(sx, sy)] = 0;

    while (active.length > 0) {
        const i  = Math.floor(Math.random() * active.length);
        const [px, py] = pts[active[i]];
        let found = false;

        for (let attempt = 0; attempt < k; attempt++) {
            const angle = Math.random() * Math.PI * 2;
            const dist  = r * (1 + Math.random()); // uniform in [r, 2r]
            const nx = px + Math.cos(angle) * dist;
            const ny = py + Math.sin(angle) * dist;
            if (isValid(nx, ny)) {
                const newIdx = pts.length;
                pts.push([nx, ny]);
                active.push(newIdx);
                grid[gridIdx(nx, ny)] = newIdx;
                found = true;
                break;
            }
        }

        if (!found) active.splice(i, 1);
    }

    return pts;
}

function NeuralCanvas() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx    = canvas.getContext('2d');
        let animId;
        let W, H;
        const rawMouse = { x: -9999, y: -9999 };
        const vortex   = { x: -9999, y: -9999 };
        let nodes     = [];
        let nInterior = 0;
        let colorInf  = new Float32Array(0);

        function buildNodes() {
            nodes = [];
            // Derive minimum distance r from desired cell area so density scales with screen
            const r = Math.sqrt(2 * POISSON_CELL / Math.sqrt(3));
            const pts = poissonDisk(W, H, r);
            nInterior = pts.length;
            colorInf  = new Float32Array(nInterior);
            for (const [x, y] of pts) {
                nodes.push({ hx: x, hy: y, x, y, vx: 0, vy: 0 });
            }
            // Boundary anchors just outside viewport — keep triangulation full-coverage
            const pad = 80;
            const bx = [-pad, W / 4, W / 2, (3 * W) / 4, W + pad];
            const by = [-pad, H / 4, H / 2, (3 * H) / 4, H + pad];
            for (const x of bx) {
                for (const y of by) {
                    if (x === -pad || x === W + pad || y === -pad || y === H + pad) {
                        nodes.push({ hx: x, hy: y, x, y, vx: 0, vy: 0, anchor: true });
                    }
                }
            }
        }

        function resize() {
            W = canvas.width  = window.innerWidth;
            H = canvas.height = window.innerHeight;
            buildNodes();
        }

        function draw() {
            ctx.clearRect(0, 0, W, H);

            // ── Smooth vortex center behind real cursor ──
            if (rawMouse.x > -1000) {
                if (vortex.x < -1000) {
                    vortex.x = rawMouse.x;
                    vortex.y = rawMouse.y;
                } else {
                    vortex.x += (rawMouse.x - vortex.x) * MOUSE_LAG;
                    vortex.y += (rawMouse.y - vortex.y) * MOUSE_LAG;
                }
            } else {
                vortex.x = -9999;
                vortex.y = -9999;
            }

            // ── Physics ──
            const mouseActive = vortex.x > -1000;
            const R2 = MOUSE_R * MOUSE_R;
            for (const n of nodes) {
                if (n.anchor) continue;

                if (mouseActive) {
                    const dx = vortex.x - n.x;
                    const dy = vortex.y - n.y;
                    const d  = Math.hypot(dx, dy);
                    if (d > 1) {
                        const t = R2 / (d * d + R2);
                        n.vx += (dx / d) * RADIAL_FORCE * t;
                        n.vy += (dy / d) * RADIAL_FORCE * t;
                    }
                    n.vx *= DAMPING;
                    n.vy *= DAMPING;
                    n.x  += n.vx;
                    n.y  += n.vy;
                } else {
                    n.vx = 0;
                    n.vy = 0;
                    n.x += (n.hx - n.x) * RETURN_LERP;
                    n.y += (n.hy - n.y) * RETURN_LERP;
                }
            }

            // ── Colour influence (lagged) ──
            for (let i = 0; i < nInterior; i++) {
                const dm     = Math.hypot(nodes[i].x - vortex.x, nodes[i].y - vortex.y);
                const target = dm < MOUSE_R ? 1 - dm / MOUSE_R : 0;
                colorInf[i] += (target - colorInf[i]) * COLOR_FADE;
            }
            const inf = colorInf; // anchors implicitly 0 (out of bounds read = 0)

            // ── Delaunay triangulation ──
            const coords = new Float64Array(nodes.length * 2);
            for (let i = 0; i < nodes.length; i++) {
                coords[i * 2]     = nodes[i].x;
                coords[i * 2 + 1] = nodes[i].y;
            }
            const del = new Delaunator(coords);
            const { triangles, halfedges } = del;

            // Draw unique edges
            ctx.lineWidth = 0.7;
            for (let e = 0; e < triangles.length; e++) {
                if (halfedges[e] !== -1 && halfedges[e] < e) continue;
                const p = triangles[e];
                const q = triangles[next(e)];
                const t = Math.max(inf[p] ?? 0, inf[q] ?? 0);
                const r = Math.round(C_DEFAULT[0] + (C_VORTEX[0] - C_DEFAULT[0]) * t);
                const g = Math.round(C_DEFAULT[1] + (C_VORTEX[1] - C_DEFAULT[1]) * t);
                const b = Math.round(C_DEFAULT[2] + (C_VORTEX[2] - C_DEFAULT[2]) * t);
                const a = (LINE_ALPHA + (LINE_ALPHA_HOT - LINE_ALPHA) * t).toFixed(3);
                ctx.beginPath();
                ctx.strokeStyle = `rgba(${r},${g},${b},${a})`;
                ctx.moveTo(nodes[p].x, nodes[p].y);
                ctx.lineTo(nodes[q].x, nodes[q].y);
                ctx.stroke();
            }

            // Draw interior node dots
            for (let i = 0; i < nInterior; i++) {
                const t = inf[i];
                const r = Math.round(C_DEFAULT[0] + (C_VORTEX[0] - C_DEFAULT[0]) * t);
                const g = Math.round(C_DEFAULT[1] + (C_VORTEX[1] - C_DEFAULT[1]) * t);
                const b = Math.round(C_DEFAULT[2] + (C_VORTEX[2] - C_DEFAULT[2]) * t);
                const a = (NODE_ALPHA + (NODE_ALPHA_HOT - NODE_ALPHA) * t).toFixed(3);
                ctx.beginPath();
                ctx.arc(nodes[i].x, nodes[i].y, NODE_R, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
                ctx.fill();
            }

            animId = requestAnimationFrame(draw);
        }

        resize();
        draw();

        const BLOCK   = 'h1, h2, h3, h4, h5, h6, p, img, .work-card, .top-bar, .scroll-down, .scroll-up, .top-bar-label, .work-intro-tags, .nav-menu, .nav-dropdown';
        const onResize = () => resize();
        const onMove   = (e) => {
            if (e.target.closest(BLOCK)) {
                rawMouse.x = -9999;
                rawMouse.y = -9999;
            } else {
                rawMouse.x = e.clientX;
                rawMouse.y = e.clientY;
            }
        };
        const onLeave = () => { rawMouse.x = -9999; rawMouse.y = -9999; };

        window.addEventListener('resize', onResize);
        window.addEventListener('mousemove', onMove);
        document.addEventListener('mouseleave', onLeave);

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', onResize);
            window.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseleave', onLeave);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                inset: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: 0,
            }}
        />
    );
}

export default NeuralCanvas;

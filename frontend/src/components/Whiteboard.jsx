"use client"

import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { io } from "socket.io-client"
import { getBoard, saveBoard } from "../services/api"

// ===== UI constants =====
const COLORS = ["#111827", "#2563eb", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#64748b"]
const NOTE_BG = "#fef3c7"
const TOOLS = ["select", "pen", "note", "rect", "ellipse", "diamond", "arrow", "text", "eraser"]

// ===== helpers =====
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
const clamp = (v, min, max) => Math.max(min, Math.min(max, v))
const hcol = (seed) => `hsl(${(seed * 2654435761) % 360} 85% 55%)`

const lerp = (a, b, t) => a + (b - a) * t
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

// offscreen canvas for measurements
const measureCtx = document.createElement("canvas").getContext("2d")

export default function Whiteboard({ projectId, user, height = "60vh" }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const socketRef = useRef(null)
  const animationRef = useRef(null)

  const [elements, setElements] = useState([])
  const [tool, setTool] = useState("select")
  const [color, setColor] = useState("#2563eb")
  const [size, setSize] = useState(3)

  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 40, y: 40 })

  const [targetScale, setTargetScale] = useState(1)
  const [targetPan, setTargetPan] = useState({ x: 40, y: 40 })

  const [isDown, setIsDown] = useState(false)
  const [draft, setDraft] = useState(null)
  const [selId, setSelId] = useState(null)
  const [dragOff, setDragOff] = useState({ x: 0, y: 0 })

  // resize state
  const [resizeHandle, setResizeHandle] = useState(null)
  const resizeMetaRef = useRef(null)

  // label dragging
  const [dragLabel, setDragLabel] = useState(false)
  const [labelOff, setLabelOff] = useState({ x: 0, y: 0 })

  // middle-mouse panning
  const [isMMBPan, setIsMMBPan] = useState(false)
  const [mmbOff, setMmbOff] = useState({ x: 0, y: 0 })

  const [cursors, setCursors] = useState({})

  const [hoverId, setHoverId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // tuned grabbing
  const HIT_PAD_PX_DEFAULT = 8
  const HIT_PAD_PX_ARROW = 2
  const HANDLE_PX = 12

  const userColor = useMemo(() => hcol(user.id || 7), [user])

  useEffect(() => {
    const animate = () => {
      const panDiff = Math.abs(pan.x - targetPan.x) + Math.abs(pan.y - targetPan.y)
      const scaleDiff = Math.abs(scale - targetScale)

      if (panDiff > 0.5 || scaleDiff > 0.001) {
        setPan((prev) => ({
          x: lerp(prev.x, targetPan.x, 0.15),
          y: lerp(prev.y, targetPan.y, 0.15),
        }))
        setScale((prev) => lerp(prev, targetScale, 0.15))
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [targetPan, targetScale, pan, scale])

  // ===== boot: load + sockets + events =====
  useEffect(() => {
    let mounted = true
    setIsLoading(true)
    ;(async () => {
      try {
        const { elements: initial } = await getBoard(projectId)
        if (mounted) {
          setElements(initial || [])
          setIsLoading(false)
        }
      } catch {
        if (mounted) setIsLoading(false)
      }
    })()

    const s = io("http://localhost:8080")
    socketRef.current = s
    s.emit("join", projectId)

    s.on("wb:add", ({ element }) => setElements((prev) => [...prev, element]))
    s.on("wb:update", ({ element }) => setElements((prev) => prev.map((el) => (el.id === element.id ? element : el))))
    s.on("wb:delete", ({ id }) => setElements((prev) => prev.filter((el) => el.id !== id)))
    s.on("wb:clear", () => setElements([]))
    s.on("wb:cursor", (c) => {
      setCursors((prev) => ({ ...prev, [c.id]: c }))
      setTimeout(
        () =>
          setCursors((p) => {
            const now = Date.now(),
              x = { ...p }
            for (const k in x) if (now - (x[k]?.t || 0) > 4000) delete x[k]
            return x
          }),
        5000,
      )
    })

    const onWheel = (e) => {
      if (!wrapRef.current) return
      if (!e.ctrlKey) return
      e.preventDefault()
      const rect = wrapRef.current.getBoundingClientRect()
      const mx = e.clientX - rect.left,
        my = e.clientY - rect.top
      const wx = (mx - pan.x) / scale,
        wy = (my - pan.y) / scale
      const newScale = clamp(scale * (e.deltaY < 0 ? 1.1 : 0.9), 0.25, 4)
      const nx = wx * newScale + pan.x,
        ny = wy * newScale + pan.y

      setTargetPan({ x: pan.x + (mx - nx), y: pan.y + (my - ny) })
      setTargetScale(newScale)
    }

    wrapRef.current?.addEventListener("wheel", onWheel, { passive: false })
    const onResize = () => draw()
    window.addEventListener("resize", onResize)

    return () => {
      mounted = false
      s.disconnect()
      wrapRef.current?.removeEventListener("wheel", onWheel)
      window.removeEventListener("resize", onResize)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [projectId])

  const draw = useCallback(() => {
    const canvas = canvasRef.current,
      wrap = wrapRef.current
    if (!canvas || !wrap) return
    const dpr = window.devicePixelRatio || 1
    const rect = wrap.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    const ctx = canvas.getContext("2d", { willReadFrequently: true })
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height)
    gradient.addColorStop(0, "#ffffff")
    gradient.addColorStop(1, "#fafafa")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, rect.width, rect.height)

    const vis = {
      left: toWorld(0, 0).x,
      top: toWorld(0, 0).y,
      right: toWorld(rect.width, rect.height).x,
      bottom: toWorld(rect.width, rect.height).y,
    }
    const grid = 32
    ctx.strokeStyle = scale > 0.5 ? "#f1f5f9" : "transparent"
    ctx.lineWidth = 0.5
    for (let x = Math.floor(vis.left / grid) * grid; x < vis.right; x += grid) {
      const s = toScreen(x, 0)
      ctx.beginPath()
      ctx.moveTo(s.x, 0)
      ctx.lineTo(s.x, rect.height)
      ctx.stroke()
    }
    for (let y = Math.floor(vis.top / grid) * grid; y < vis.bottom; y += grid) {
      const s = toScreen(0, y)
      ctx.beginPath()
      ctx.moveTo(0, s.y)
      ctx.lineTo(rect.width, s.y)
      ctx.stroke()
    }
    // elements with hover effects
    ;[...elements, ...(draft ? [draft] : [])].forEach((el) => {
      const isHovered = hoverId === el.id
      const isSelected = selId === el.id
      drawElement(ctx, el, isSelected, isHovered)
    })

    Object.values(cursors).forEach((c) => {
      const x = c.x * rect.width,
        y = c.y * rect.height

      // Cursor dot with glow effect
      ctx.save()
      ctx.shadowColor = c.color || "#2563eb"
      ctx.shadowBlur = 8
      ctx.fillStyle = c.color || "#2563eb"
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // Enhanced label
      const label = (c.name || "").split("@")[0]
      if (label) {
        ctx.fillStyle = "rgba(17,24,39,0.9)"
        const pad = 6
        ctx.font = "bold 11px Inter, system-ui"
        const w = ctx.measureText(label).width + pad * 2
        const h = 20

        // Rounded label background
        ctx.beginPath()
        ctx.roundRect(x + 10, y - 10, w, h, 6)
        ctx.fill()

        ctx.fillStyle = "#fff"
        ctx.fillText(label, x + 10 + pad, y + 4)
      }
    })
  }, [elements, draft, scale, pan, selId, tool, hoverId, cursors])

  // redraw on state changes
  useEffect(() => {
    draw()
  }, [draw])

  // ===== transforms =====
  const toScreen = (x, y) => ({ x: x * scale + pan.x, y: y * scale + pan.y })
  const toWorld = (sx, sy) => ({ x: (sx - pan.x) / scale, y: (sy - pan.y) / scale })

  function drawElement(ctx, el, selected, hovered = false) {
    ctx.save()

    if (hovered && !selected) {
      ctx.shadowColor = "rgba(37, 99, 235, 0.3)"
      ctx.shadowBlur = 8
    }

    if (el.type === "stroke") {
      ctx.lineJoin = "round"
      ctx.lineCap = "round"
      ctx.strokeStyle = el.color || "#111827"
      ctx.lineWidth = (el.size || 3) * scale
      ctx.beginPath()
      el.points.forEach((p, i) => {
        const s = toScreen(p.x, p.y)
        i ? ctx.lineTo(s.x, s.y) : ctx.moveTo(s.x, s.y)
      })
      ctx.stroke()
    } else if (el.type === "note") {
      const w = el.w || 220,
        h = autoNoteHeight(el)
      const s = toScreen(el.x, el.y)

      ctx.save()
      if (!selected) {
        ctx.shadowColor = "rgba(0,0,0,0.1)"
        ctx.shadowBlur = 4
        ctx.shadowOffsetY = 2
      }
      roundRect(ctx, s.x, s.y, w * scale, h * scale, 12 * scale, true, NOTE_BG)
      ctx.restore()

      ctx.fillStyle = "#111827"
      ctx.font = `600 ${14 * scale}px Inter, system-ui`
      wrapText(ctx, el.text || "Note", s.x + 12 * scale, s.y + 20 * scale, (w - 24) * scale, 18 * scale)
      if (selected) drawSelection(ctx, s.x, s.y, w * scale, h * scale, { corners: true, sides: true, note: true })
    } else if (el.type === "rect" || el.type === "ellipse" || el.type === "diamond") {
      const s = toScreen(el.x, el.y)
      const w = el.w * scale,
        h = el.h * scale

      ctx.lineWidth = hovered ? 3 : 2
      ctx.strokeStyle = el.color || "#111827"
      ctx.fillStyle = "rgba(255,255,255,0.8)"

      if (el.type === "rect") {
        roundRect(ctx, s.x, s.y, w, h, 8 * scale, true)
        ctx.fill()
        ctx.stroke()
      } else if (el.type === "ellipse") {
        ctx.beginPath()
        ctx.ellipse(s.x + w / 2, s.y + h / 2, Math.abs(w / 2), Math.abs(h / 2), 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      } else {
        ctx.beginPath()
        ctx.moveTo(s.x + w / 2, s.y)
        ctx.lineTo(s.x + w, s.y + h / 2)
        ctx.lineTo(s.x + w / 2, s.y + h)
        ctx.lineTo(s.x, s.y + h / 2)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
      }

      // auto-fit label inside shape
      if (el.label) {
        const { fs, lines } = fitLabel(el)
        const pos = labelPosition(el)
        const screen = toScreen(pos.x, pos.y)
        ctx.fillStyle = "#111827"
        ctx.font = `600 ${fs * scale}px Inter, system-ui`
        const lh = fs * 1.3 * scale
        lines.forEach((ln, i) => ctx.fillText(ln, screen.x, screen.y + i * lh))
      }
      if (selected) drawSelection(ctx, s.x, s.y, w, h, { corners: true, sides: true })
    } else if (el.type === "arrow") {
      const { a, b } = arrowEndpoints(el)
      const A = toScreen(a.x, a.y),
        B = toScreen(b.x, b.y)
      ctx.strokeStyle = el.color || "#111827"
      ctx.lineWidth = hovered ? 3 : 2
      ctx.beginPath()
      ctx.moveTo(A.x, A.y)
      ctx.lineTo(B.x, B.y)
      ctx.stroke()
      drawArrowHead(ctx, A, B)
      if (selected) drawSelection(ctx, Math.min(A.x, B.x), Math.min(A.y, B.y), Math.abs(B.x - A.x), Math.abs(B.y - A.y))
    } else if (el.type === "text") {
      const w = el.w || 260
      const fs = (el.fontSize || 18) * scale
      const lh = fs * 1.3
      const s = toScreen(el.x, el.y)
      ctx.fillStyle = el.color || "#111827"
      ctx.font = `600 ${fs}px Inter, system-ui`
      const lines = wrapLines(ctx, el.text || "", w * scale, fs, "600")
      lines.forEach((ln, i) => ctx.fillText(ln, s.x, s.y + (i + 1) * lh))
      if (selected) {
        const h = Math.max(lh * lines.length + 8 * scale, 30 * scale)
        drawSelection(ctx, s.x - 8, s.y - fs, w * scale + 16, h, { text: true })
      }
    }
    ctx.restore()
  }

  function drawSelection(ctx, x, y, w, h, opts = {}) {
    ctx.save()

    // Animated dashed border
    const dashOffset = (Date.now() * 0.1) % 20
    ctx.strokeStyle = "rgba(37,99,235,0.9)"
    ctx.setLineDash([8, 4])
    ctx.lineDashOffset = -dashOffset
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, w, h)
    ctx.setLineDash([])

    // Enhanced handles with glow
    ctx.fillStyle = "#2563eb"
    ctx.shadowColor = "rgba(37,99,235,0.4)"
    ctx.shadowBlur = 4

    const s = HANDLE_PX
    if (opts.corners) {
      ctx.fillRect(x - s / 2, y - s / 2, s, s) // nw
      ctx.fillRect(x + w - s / 2, y - s / 2, s, s) // ne
      ctx.fillRect(x - s / 2, y + h - s / 2, s, s) // sw
      ctx.fillRect(x + w - s / 2, y + h - s / 2, s, s) // se
    }
    if (opts.sides) {
      ctx.fillRect(x + w / 2 - s / 2, y - s / 2, s, s) // n
      ctx.fillRect(x + w / 2 - s / 2, y + h - s / 2, s, s) // s
      ctx.fillRect(x - s / 2, y + h / 2 - s / 2, s, s) // w
      ctx.fillRect(x + w - s / 2, y + h / 2 - s / 2, s, s) // e
    }
    if (opts.text) {
      ctx.fillRect(x + w - s / 2, y + h / 2 - s / 2, s, s) // e
      ctx.fillRect(x + w / 2 - s / 2, y + h - s / 2, s, s) // s
      ctx.fillRect(x + w - s / 2, y + h - s / 2, s, s) // se
    }
    ctx.restore()
  }

  function roundRect(ctx, x, y, w, h, r, fill, bg) {
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, r)
    if (fill) {
      ctx.fillStyle = bg || "transparent"
      ctx.fill()
    } else {
      ctx.stroke()
    }
  }

  function drawArrowHead(ctx, A, B) {
    const ang = Math.atan2(B.y - A.y, B.x - A.x),
      len = 12
    ctx.beginPath()
    ctx.moveTo(B.x, B.y)
    ctx.lineTo(B.x - len * Math.cos(ang - Math.PI / 6), B.y - len * Math.sin(ang - Math.PI / 6))
    ctx.moveTo(B.x, B.y)
    ctx.lineTo(B.x - len * Math.cos(ang + Math.PI / 6), B.y - len * Math.sin(ang + Math.PI / 6))
    ctx.stroke()
  }

  // ===== label auto-fit inside shape =====
  function fitLabel(el) {
    const innerW = Math.max(10, el.w - 16)
    const innerH = Math.max(10, el.h - 32)
    const base = clamp(el.fontSize || 14, 8, 48)
    let lo = 8,
      hi = base,
      best = lo,
      bestLines = [el.label || ""]
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2)
      const { lines, height } = measureWrapped(el.label || "", mid, innerW)
      if (height <= innerH) {
        best = mid
        bestLines = lines
        lo = mid + 1
      } else {
        hi = mid - 1
      }
    }
    return { fs: best, lines: bestLines }
  }

  function measureWrapped(text, fs, maxWidth) {
    measureCtx.font = `600 ${fs}px Inter, system-ui`
    const words = String(text || "").split(/\s+/)
    const lines = []
    let line = ""
    for (let i = 0; i < words.length; i++) {
      const test = line + words[i] + " "
      if (measureCtx.measureText(test).width > maxWidth && i > 0) {
        lines.push(line.trim())
        line = words[i] + " "
      } else {
        line = test
      }
    }
    lines.push(line.trim())
    const lh = fs * 1.3
    return { lines, height: lines.length * lh }
  }

  // ===== text helpers =====
  function wrapLines(ctx, text, maxWidth, fontSize, weight = "600") {
    ctx.font = `${weight} ${fontSize}px Inter, system-ui`
    const words = String(text || "").split(/\s+/)
    const lines = []
    let line = ""
    for (let i = 0; i < words.length; i++) {
      const test = line + words[i] + " "
      if (ctx.measureText(test).width > maxWidth && i > 0) {
        lines.push(line.trim())
        line = words[i] + " "
      } else line = test
    }
    lines.push(line.trim())
    return lines
  }

  // ===== label pos (inside shapes) =====
  function labelPosition(el) {
    const fx = el.labelFx ?? 0.5
    const fy = el.labelFy ?? 0.5
    const x = el.x + 8 + (el.w - 16) * fx
    const y = el.y + 16 + (el.h - 32) * fy
    return { x, y }
  }
  function setLabelByClick(el, pt) {
    const fx = clamp((pt.x - el.x - 8) / Math.max(1, el.w - 16), 0, 1)
    const fy = clamp((pt.y - el.y - 16) / Math.max(1, el.h - 32), 0, 1)
    return { ...el, labelFx: fx, labelFy: fy }
  }

  // ===== anchors & arrows =====
  const anchorsOf = (el) => {
    const w = el.w || 220,
      h = el.type === "note" ? autoNoteHeight(el) : el.h || 0
    const cx = el.x + w / 2,
      cy = el.y + h / 2
    return {
      n: { x: cx, y: el.y },
      s: { x: cx, y: el.y + h },
      e: { x: el.x + w, y: cy },
      w: { x: el.x, y: cy },
      c: { x: cx, y: cy },
    }
  }
  const closestAnchor = (el, pt) => {
    const a = anchorsOf(el)
    let best = "e",
      d = Number.POSITIVE_INFINITY
    for (const k of Object.keys(a)) {
      const v = a[k]
      const dd = (v.x - pt.x) ** 2 + (v.y - pt.y) ** 2
      if (dd < d) {
        d = dd
        best = k
      }
    }
    return best
  }
  const arrowEndpoints = (arrow) => {
    const a = arrow.from?.elId
      ? anchorsOf(elements.find((e) => e.id === arrow.from.elId))[arrow.from.anchor || "e"]
      : { x: arrow.from.x, y: arrow.from.y }
    const b = arrow.to?.elId
      ? anchorsOf(elements.find((e) => e.id === arrow.to.elId))[arrow.to.anchor || "w"]
      : { x: arrow.to.x, y: arrow.to.y }
    return { a: a || arrow.from, b: b || arrow.to }
  }

  // ===== hit testing (tool-aware) =====
  function hitAt(pt, mode = "default") {
    const pad = (mode === "arrow" ? HIT_PAD_PX_ARROW : HIT_PAD_PX_DEFAULT) / scale
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i]
      if (el.type === "note") {
        const h = autoNoteHeight(el),
          w = el.w || 220
        if (pt.x >= el.x - pad && pt.x <= el.x + w + pad && pt.y >= el.y - pad && pt.y <= el.y + h + pad) return el.id
      } else if (el.type === "rect" || el.type === "ellipse" || el.type === "diamond") {
        if (pt.x >= el.x - pad && pt.x <= el.x + el.w + pad && pt.y >= el.y - pad && pt.y <= el.y + el.h + pad)
          return el.id
      } else if (el.type === "text") {
        const { w, h, top } = textDims(el)
        const x = el.x,
          y = el.y - top
        if (pt.x >= x - pad && pt.x <= x + w + pad && pt.y >= y - pad && pt.y <= y + h + pad) return el.id
      } else if (el.type === "stroke") {
        for (const p of el.points) {
          const dx = p.x - pt.x,
            dy = p.y - pt.y
          if (dx * dx + dy * dy <= Math.pow((el.size || 3) + pad / 2, 2)) return el.id
        }
      } else if (el.type === "arrow") {
        const { a, b } = arrowEndpoints(el)
        if (pointLineDist(pt, a, b) <= (pad || 1.5)) return el.id
      }
    }
    return null
  }

  function getHandleUnder(el, pt) {
    const rad = Math.max(10, HANDLE_PX) / scale
    if (el.type === "text") {
      const { w, h, top } = textDims(el)
      const x = el.x,
        y = el.y - top
      const e = { x: x + w, y: y + h / 2 }
      const s = { x: x + w / 2, y: y + h }
      const se = { x: x + w, y: y + h }
      if (Math.abs(pt.x - e.x) <= rad && Math.abs(pt.y - e.y) <= rad) return "e"
      if (Math.abs(pt.x - s.x) <= rad && Math.abs(pt.y - s.y) <= rad) return "s"
      if (Math.abs(pt.x - se.x) <= rad && Math.abs(pt.y - se.y) <= rad) return "se"
      return null
    }
    if (el.type === "note") {
      const bx = el.x + (el.w || 220),
        by = el.y + autoNoteHeight(el)
      if (Math.abs(pt.x - bx) <= rad && Math.abs(pt.y - by) <= rad) return "se"
      if (Math.abs(pt.x - (el.x + (el.w || 220) / 2)) <= rad && Math.abs(pt.y - el.y) <= rad) return "n"
      if (Math.abs(pt.x - (el.x + (el.w || 220) / 2)) <= rad && Math.abs(pt.y - (el.y + autoNoteHeight(el))) <= rad)
        return "s"
      if (Math.abs(pt.x - el.x) <= rad && Math.abs(pt.y - (el.y + autoNoteHeight(el) / 2)) <= rad) return "w"
      if (Math.abs(pt.x - (el.x + (el.w || 220))) <= rad && Math.abs(pt.y - (el.y + autoNoteHeight(el) / 2)) <= rad)
        return "e"
      return null
    }
    if (el.type === "rect" || el.type === "ellipse" || el.type === "diamond") {
      const corners = [
        { k: "nw", x: el.x, y: el.y },
        { k: "ne", x: el.x + el.w, y: el.y },
        { k: "sw", x: el.x, y: el.y + el.h },
        { k: "se", x: el.x + el.w, y: el.y + el.h },
      ]
      const sides = [
        { k: "n", x: el.x + el.w / 2, y: el.y },
        { k: "s", x: el.x + el.w / 2, y: el.y + el.h },
        { k: "w", x: el.x, y: el.y + el.h / 2 },
        { k: "e", x: el.x + el.w, y: el.y + el.h / 2 },
      ]
      for (const c of [...corners, ...sides]) {
        if (Math.abs(pt.x - c.x) <= rad && Math.abs(pt.y - c.y) <= rad) return c.k
      }
    }
    return null
  }
  function pointLineDist(p, a, b) {
    const A = { x: a.x, y: a.y },
      B = { x: b.x, y: b.y }
    const l2 = (B.x - A.x) ** 2 + (B.y - A.y) ** 2
    if (!l2) return Math.hypot(p.x - A.x, p.y - A.y)
    let t = ((p.x - A.x) * (B.x - A.x) + (p.y - A.y) * (B.y - A.y)) / l2
    t = clamp(t, 0, 1)
    const proj = { x: A.x + t * (B.x - A.x), y: A.y + t * (B.y - A.y) }
    return Math.hypot(p.x - proj.x, p.y - proj.y)
  }

  // ===== sizes =====
  function autoNoteHeight(el) {
    const inner = (el.w || 220) - 24
    const text = String(el.text || "")
    if (!text) return Math.max(120, el.h || 120)
    const charsPerLine = Math.max(10, Math.floor(inner / 7))
    const lines = Math.ceil(text.length / charsPerLine)
    return Math.max(el.h || 0, 28 + lines * 18)
  }
  function textDims(el) {
    const w = el.w || 260
    const fs = el.fontSize || 18
    const lh = fs * 1.3
    measureCtx.font = `600 ${fs}px Inter, system-ui`
    const words = String(el.text || "").split(/\s+/)
    let line = ""
    let rows = 0
    words.forEach((wd, i) => {
      const test = line + wd + " "
      if (measureCtx.measureText(test).width > w && i > 0) {
        rows++
        line = wd + " "
      } else line = test
    })
    rows++
    const h = rows * lh + 8
    const top = fs
    return { w, h, top }
  }

  // ===== socket emit =====
  const sEmit = (ev, p) => socketRef.current?.emit(ev, p)

  // ===== interactions =====
  function onPointerDown(e) {
    e.preventDefault()
    document.body.style.userSelect = "none"

    const rect = canvasRef.current.getBoundingClientRect()
    const sx = e.clientX - rect.left,
      sy = e.clientY - rect.top
    const pt = toWorld(sx, sy)

    if (e.button === 1) {
      setIsMMBPan(true)
      setMmbOff({ x: sx - pan.x, y: sy - pan.y })
      return
    }

    setIsDown(true)

    if (tool === "arrow") {
      const hit = hitAt(pt, "arrow")
      const from = hit
        ? {
            elId: hit,
            anchor: closestAnchor(
              elements.find((e) => e.id === hit),
              pt,
            ),
          }
        : { x: pt.x, y: pt.y }
      setDraft({ id: uid(), type: "arrow", from, to: { x: pt.x, y: pt.y }, color })
      return
    }

    const hit = hitAt(pt, "default")
    if (hit && tool !== "eraser") {
      setSelId(hit)
      const el = elements.find((x) => x.id === hit)

      if (["rect", "ellipse", "diamond"].includes(el.type) && el.label) {
        const lp = labelPosition(el)
        const pad = HIT_PAD_PX_DEFAULT / 2 / scale
        if (Math.abs(pt.x - lp.x) <= pad && Math.abs(pt.y - lp.y) <= pad) {
          setDragLabel(true)
          setLabelOff({ x: pt.x - lp.x, y: pt.y - lp.y })
          return
        }
      }

      const h = getHandleUnder(el, pt)
      if (h) {
        setResizeHandle(h)
        if (el.type === "text") {
          resizeMetaRef.current = { start: pt, fs0: el.fontSize || 18, w0: el.w || 260 }
        }
        return
      }

      setDragOff({ x: pt.x - el.x, y: pt.y - el.y })
      return
    }

    if (tool === "eraser") {
      const id = hitAt(pt, "default")
      if (id) {
        setElements((prev) => prev.filter((el) => el.id !== id))
        sEmit("wb:delete", { projectId, id })
      }
      return
    }

    if (tool === "pen") {
      setDraft({ id: uid(), type: "stroke", color, size, points: [pt] })
      return
    }

    if (tool === "note") {
      const text = prompt("Note text:", "New note")
      if (text == null) return
      const el = { id: uid(), type: "note", x: pt.x, y: pt.y, w: 260, text }
      setElements((prev) => [...prev, el])
      sEmit("wb:add", { projectId, element: el })
      setSelId(el.id)
      return
    }

    if (tool === "rect" || tool === "ellipse" || tool === "diamond") {
      setDraft({
        id: uid(),
        type: tool,
        x: pt.x,
        y: pt.y,
        w: 1,
        h: 1,
        color,
        label: "",
        labelFx: 0.5,
        labelFy: 0.5,
        fontSize: 14,
      })
      return
    }

    if (tool === "text") {
      const txt = prompt("Text:", "New text")
      if (txt == null) return
      const el = { id: uid(), type: "text", x: pt.x, y: pt.y, w: 260, text: txt, color: "#111827", fontSize: 18 }
      setElements((prev) => [...prev, el])
      sEmit("wb:add", { projectId, element: el })
      setSelId(el.id)
      return
    }
  }

  function onPointerMove(e) {
    const rect = canvasRef.current.getBoundingClientRect()
    const sx = e.clientX - rect.left,
      sy = e.clientY - rect.top
    const pt = toWorld(sx, sy)

    if (!isDown && tool === "select") {
      const hit = hitAt(pt, "default")
      setHoverId(hit)
    }

    sEmit("wb:cursor", {
      projectId,
      x: sx / rect.width,
      y: sy / rect.height,
      name: user.name || user.email,
      color: userColor,
    })

    if (isMMBPan) {
      const newPan = { x: sx - mmbOff.x, y: sy - mmbOff.y }
      setPan(newPan)
      setTargetPan(newPan)
      return
    }

    if (!isDown) return

    if (selId) {
      const el = elements.find((x) => x.id === selId)
      if (!el) return

      if (dragLabel && ["rect", "ellipse", "diamond"].includes(el.type)) {
        const updated = setLabelByClick(el, { x: pt.x - labelOff.x, y: pt.y - labelOff.y })
        setElements((prev) => prev.map((e) => (e.id === el.id ? updated : e)))
        return
      }

      if (resizeHandle) {
        if (el.type === "text") {
          const meta = resizeMetaRef.current || { start: pt, fs0: el.fontSize || 18, w0: el.w || 260 }
          let w = el.w || 260,
            fs = el.fontSize || 18
          if (["e", "se"].includes(resizeHandle)) {
            w = Math.max(100, pt.x - el.x)
          }
          if (["s", "se"].includes(resizeHandle)) {
            const dy = pt.y - meta.start.y
            fs = clamp(Math.round(meta.fs0 + dy), 10, 96)
          }
          const updated = { ...el, w, fontSize: fs }
          setElements((prev) => prev.map((e) => (e.id === el.id ? updated : e)))
          return
        }
        let { x, y, w, h } = el
        const minW = 40,
          minH = 30
        const apply = () =>
          setElements((prev) =>
            prev.map((e) => (e.id === el.id ? { ...el, x, y, w: Math.max(minW, w), h: Math.max(minH, h) } : e)),
          )

        if (resizeHandle.includes("n")) {
          h = y + h - pt.y
          y = pt.y
        }
        if (resizeHandle.includes("w")) {
          w = x + w - pt.x
          x = pt.x
        }
        if (resizeHandle.includes("s")) {
          h = pt.y - y
        }
        if (resizeHandle.includes("e")) {
          w = pt.x - x
        }
        apply()
        return
      }

      const nx = pt.x - dragOff.x,
        ny = pt.y - dragOff.y
      const updated = { ...el, x: nx, y: ny }
      setElements((prev) => prev.map((e) => (e.id === el.id ? updated : e)))
      return
    }

    if (tool === "pen" && draft) {
      setDraft({ ...draft, points: [...draft.points, pt] })
      return
    }
    if (draft && (draft.type === "rect" || draft.type === "ellipse" || draft.type === "diamond")) {
      setDraft({ ...draft, w: pt.x - draft.x, h: pt.y - draft.y })
      return
    }
    if (draft && draft.type === "arrow") {
      const hit = hitAt(pt, "arrow")
      const to = hit
        ? {
            elId: hit,
            anchor: closestAnchor(
              elements.find((e) => e.id === hit),
              pt,
            ),
          }
        : { x: pt.x, y: pt.y }
      setDraft({ ...draft, to })
      return
    }
  }

  function onPointerUp() {
    document.body.style.userSelect = ""
    if (isMMBPan) {
      setIsMMBPan(false)
      return
    }

    setIsDown(false)

    if (selId) {
      const el = elements.find((x) => x.id === selId)
      if (el) sEmit("wb:update", { projectId, element: el })
      setResizeHandle(null)
      setDragLabel(false)
      resizeMetaRef.current = null
    }
    if (draft) {
      if (draft.type === "stroke") {
        setElements((prev) => [...prev, draft])
        sEmit("wb:add", { projectId, element: draft })
      } else if (draft.type === "rect" || draft.type === "ellipse" || draft.type === "diamond") {
        const x = Math.min(draft.x, draft.x + draft.w),
          y = Math.min(draft.y, draft.y + draft.h)
        const w = Math.abs(draft.w),
          h = Math.abs(draft.h)
        const final = { ...draft, x, y, w: Math.max(40, w), h: Math.max(30, h) }
        setElements((prev) => [...prev, final])
        sEmit("wb:add", { projectId, element: final })
      } else if (draft.type === "arrow") {
        setElements((prev) => [...prev, draft])
        sEmit("wb:add", { projectId, element: draft })
      }
      setDraft(null)
    }
  }

  function onDblClick(e) {
    e.preventDefault()
    const rect = canvasRef.current.getBoundingClientRect()
    const sx = e.clientX - rect.left,
      sy = e.clientY - rect.top
    const pt = toWorld(sx, sy)
    const id = hitAt(pt)
    if (!id) return
    const el = elements.find((el) => el.id === id)
    if (el.type === "note") {
      const text = prompt("Edit note text:", el.text || "")
      if (text == null) return
      const updated = { ...el, text }
      setElements((prev) => prev.map((x) => (x.id === id ? updated : x)))
      sEmit("wb:update", { projectId, element: updated })
    } else if (el.type === "text") {
      const text = prompt("Edit text:", el.text || "")
      if (text == null) return
      const updated = { ...el, text }
      setElements((prev) => prev.map((x) => (x.id === id ? updated : x)))
      sEmit("wb:update", { projectId, element: updated })
    } else if (["rect", "ellipse", "diamond"].includes(el.type)) {
      const t = prompt("Edit label:", el.label || "")
      if (t == null) return
      const updated = { ...el, label: t }
      setElements((prev) => prev.map((x) => (x.id === id ? updated : x)))
      sEmit("wb:update", { projectId, element: updated })
    }
  }

  async function onSave() {
    setIsLoading(true)
    try {
      await saveBoard(projectId, elements)
    } catch {
      alert("Save failed")
    } finally {
      setIsLoading(false)
    }
  }

  function onClear() {
    if (!confirm("Clear the board for everyone?")) return
    setElements([])
    sEmit("wb:clear", { projectId })
  }

  function zoom(delta) {
    const wrap = wrapRef.current
    if (!wrap) return
    const rect = wrap.getBoundingClientRect()
    const mx = rect.width / 2,
      my = rect.height / 2
    const wx = (mx - pan.x) / scale,
      wy = (my - pan.y) / scale
    const s = clamp(scale * delta, 0.25, 4)
    const nx = wx * s + pan.x,
      ny = wy * s + pan.y
    setTargetPan({ x: pan.x + (mx - nx), y: pan.y + (my - ny) })
    setTargetScale(s)
  }

  const fit = () => {
    setTargetPan({ x: 40, y: 40 })
    setTargetScale(1)
  }

  return (
    <div
      className="rounded-xl overflow-hidden shadow-2xl bg-white border border-gray-200"
      style={{ userSelect: "none" }}
    >
      {/* Enhanced Toolbar */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          {TOOLS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTool(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                tool === t
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25 scale-105"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {t === "select"
                ? "↖️ Select"
                : t === "pen"
                  ? "✏️ Pen"
                  : t === "note"
                    ? "📝 Note"
                    : t === "rect"
                      ? "▭ Rect"
                      : t === "ellipse"
                        ? "◯ Ellipse"
                        : t === "diamond"
                          ? "◇ Diamond"
                          : t === "arrow"
                            ? "→ Arrow"
                            : t === "text"
                              ? "📝 Text"
                              : "🧽 Eraser"}
            </button>
          ))}
        </div>

        <div className="w-px h-8 bg-gray-300" />

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Colors</span>
          <div className="flex items-center gap-1">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-8 w-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                  color === c ? "border-gray-400 shadow-lg" : "border-gray-200 hover:border-gray-300"
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600">Size</span>
          <input
            type="range"
            min="1"
            max="14"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-20 accent-blue-600"
          />
          <span className="text-sm text-gray-500 w-6">{size}</span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <button
            className="px-3 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium transition-colors"
            onClick={() => zoom(0.9)}
          >
            −
          </button>
          <span className="text-sm font-medium text-gray-600 w-12 text-center">{Math.round(scale * 100)}%</span>
          <button
            className="px-3 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium transition-colors"
            onClick={() => zoom(1.1)}
          >
            +
          </button>
          <button
            className="px-3 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium transition-colors"
            onClick={fit}
          >
            Fit
          </button>
        </div>

        <div className="w-px h-8 bg-gray-300" />

        <button
          className="px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium transition-colors"
          onClick={onClear}
        >
          Clear
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            isLoading
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25"
          }`}
          onClick={onSave}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save"}
        </button>
      </div>

      {/* Canvas */}
      <div
        ref={wrapRef}
        className="relative"
        style={{ height, background: "#ffffff" }}
        onDoubleClick={onDblClick}
        onMouseLeave={() => isDown && onPointerUp()}
        onContextMenu={(e) => e.preventDefault()}
      >
        <canvas
          ref={canvasRef}
          className={`w-full h-full block transition-all duration-200 ${
            isMMBPan
              ? "cursor-grabbing"
              : tool === "select"
                ? "cursor-default"
                : tool === "pen"
                  ? "cursor-crosshair"
                  : "cursor-crosshair"
          }`}
          onMouseDown={(e) => {
            e.preventDefault()
            onPointerDown(e)
          }}
          onMouseMove={onPointerMove}
          onMouseUp={onPointerUp}
        />

        {isLoading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium text-gray-700">Loading...</span>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-3 text-xs text-gray-500 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            💡 <strong>Tips:</strong> Click elements to select • Drag to move • Use handles to resize • Double-click to
            edit text
          </div>
          <div className="flex items-center gap-4">
            <span>Elements: {elements.length}</span>
            <span>Zoom: {Math.round(scale * 100)}%</span>
            {Object.keys(cursors).length > 0 && <span>👥 {Object.keys(cursors).length} online</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ===== tiny utils =====
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text || "").split(/\s+/)
  let line = ""
  let yy = y
  for (let i = 0; i < words.length; i++) {
    const test = line + words[i] + " "
    if (ctx.measureText(test).width > maxWidth && i > 0) {
      ctx.fillText(line, x, yy)
      line = words[i] + " "
      yy += lineHeight
    } else {
      line = test
    }
  }
  ctx.fillText(line, x, yy)
}

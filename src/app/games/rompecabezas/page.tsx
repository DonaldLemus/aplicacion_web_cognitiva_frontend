"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import styles from "./rompecabezas.module.css";
import { actualizarPuntos, registrarResultado } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";

type Tile = { id: number; img: string; correctIndex: number };

const SIZES = [3, 4, 5];

function RompecabezasGame() {
  const searchParams = useSearchParams();
  const idActividad = parseInt(searchParams.get("idActividad") || "0");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [grid, setGrid] = useState(3);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [order, setOrder] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [finished, setFinished] = useState(false);

  const correctCount = useMemo(
    () => order.filter((idx, pos) => idx === pos).length,
    [order]
  );

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
  };

  const coverDraw = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement | ImageBitmap,
    size: number
  ) => {
    const iw = img.width;
    const ih = img.height;
    const scale = Math.max(size / iw, size / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    const dx = (size - sw) / 2;
    const dy = (size - sh) / 2;
    ctx.drawImage(img, dx, dy, sw, sh);
  };

  const createTiles = async (imageFile: File, n: number) => {
    // 1) Cargar imagen
    const img = await createImageBitmap(imageFile);
    // 2) Canvas base
    const SIZE = 600;
    const base = document.createElement("canvas");
    base.width = SIZE;
    base.height = SIZE;
    const bctx = base.getContext("2d")!;
    bctx.fillStyle = "#000";
    bctx.fillRect(0, 0, SIZE, SIZE);
    coverDraw(bctx, img, SIZE);

    // 3) Cortar en NxN
    const tileSize = SIZE / n;
    const out: Tile[] = [];
    for (let row = 0; row < n; row++) {
      for (let col = 0; col < n; col++) {
        const c = document.createElement("canvas");
        c.width = tileSize;
        c.height = tileSize;
        const cctx = c.getContext("2d")!;
        cctx.drawImage(
          base,
          col * tileSize,
          row * tileSize,
          tileSize,
          tileSize,
          0,
          0,
          tileSize,
          tileSize
        );
        out.push({
          id: row * n + col,
          img: c.toDataURL("image/jpeg", 0.8),
          correctIndex: row * n + col,
        });
      }
    }
    return out;
  };

  const shuffle = <T,>(arr: T[]) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const prepare = async () => {
    if (!file) return;
    const t = await createTiles(file, grid);
    let ord = shuffle(t.map((_, i) => i));
    if (ord.every((i, pos) => i === pos)) ord = shuffle(ord);
    setTiles(t);
    setOrder(ord);
    setMoves(0);
    setFinished(false);
    setSelected(null);
  };

  useEffect(() => {
    setStartTime(new Date());
    const token = localStorage.getItem("cognitiva_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    if (file) prepare();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, grid]);

  const swap = (a: number, b: number) => {
    const next = order.slice();
    [next[a], next[b]] = [next[b], next[a]];
    setOrder(next);
    setMoves((m) => m + 1);
    if (next.every((i, pos) => i === pos)) {
      const endTime = new Date();
      let tiempoTotalSegundos = 0;
      if (startTime) {
        tiempoTotalSegundos = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
      }
      setFinished(true);
      const piezas = grid * grid;
      const puntos = piezas * 5;
      const payload = {
        idActividad,
        puntuacion: puntos,
        tiempoTotal: tiempoTotalSegundos,
        fechaRealizacion: new Date(),
      };
      registrarResultado(payload).catch(console.error);
      actualizarPuntos(puntos).catch(console.error);
    }
  };

  const handleClickTile = (pos: number) => {
    if (finished) return;
    if (selected === null) {
      setSelected(pos);
    } else if (selected === pos) {
      setSelected(null);
    } else {
      swap(selected, pos);
      setSelected(null);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
          className={styles.file}
        />
        <label>
          Dificultad:&nbsp;
          <select
            value={grid}
            onChange={(e) => setGrid(parseInt(e.target.value))}
          >
            {SIZES.map((s) => (
              <option key={s} value={s}>
                {s} × {s}
              </option>
            ))}
          </select>
        </label>
        <button onClick={prepare} disabled={!file}>
          Mezclar
        </button>
        <div className={styles.stats}>
          Movimientos: {moves} · Correctas: {correctCount}/{grid * grid}
        </div>
      </div>

      <div
        className={styles.grid}
        style={{
          gridTemplateColumns: `repeat(${grid}, 1fr)`,
          maxWidth: 600,
          maxHeight: 600,
        }}
      >
        {order.map((tileIndex, pos) => {
          const t = tiles[tileIndex];
          const isSel = selected === pos;
          const isCorrect = tileIndex === pos;
          return (
            <button
              key={pos}
              onClick={() => handleClickTile(pos)}
              className={[
                styles.tile,
                isSel ? styles.selected : "",
                isCorrect ? styles.correct : "",
              ].join(" ")}
              aria-label={`Pieza ${tileIndex + 1}`}
              disabled={!t}
            >
              {t && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.img} alt="" draggable={false} />
              )}
            </button>
          );
        })}
      </div>

      {finished && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>¡Completado! 🎉</h3>
            <p>Has ganado {grid * grid * 5} puntos.</p>
            <button onClick={prepare}>Jugar de nuevo</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente principal con Suspense
export default function RompecabezasPage() {
  return (
    <Suspense fallback={<div className={styles.wrapper}>Cargando juego...</div>}>
      <RompecabezasGame />
    </Suspense>
  );
}
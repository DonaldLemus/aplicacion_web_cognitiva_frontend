"use client";

import React, { useEffect, useState, Suspense } from "react";
import styles from "./secuencia-numeros.module.css";
import { actualizarPuntos, registrarResultado } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";

function SecuenciaGame() {
  const searchParams = useSearchParams();
  const idActividad = parseInt(searchParams.get("idActividad") || "0");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const router = useRouter();
  const SEQ_LENGTH = 16;
  const [gridNumbers, setGridNumbers] = useState<number[]>([]);
  const [sortedNumbers, setSortedNumbers] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [points, setPoints] = useState(0);

  const shuffle = <T,>(arr: T[]): T[] => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Inicia o reinicia el juego
  const restartGame = () => {
    const setNums = new Set<number>();
    while (setNums.size < SEQ_LENGTH) {
      setNums.add(Math.floor(Math.random() * 1000) + 1);
    }
    const arr = Array.from(setNums);
    setGridNumbers(shuffle(arr));
    setSortedNumbers(arr.slice().sort((a, b) => a - b));
    setCurrentIndex(0);
    setFinished(false);
    setPoints(0);
  };

  useEffect(() => {
    setStartTime(new Date());
    console.log("Iniciando juego con id:", idActividad);
    const token = localStorage.getItem("cognitiva_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    restartGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finishGame = async (correct: boolean) => {
    setFinished(true);
    const earned = correct ? (currentIndex + (correct && currentIndex < SEQ_LENGTH - 1 ? 1 : 0)) * 5 : currentIndex * 5;
    setPoints(earned);
    const endTime = new Date();
    let tiempoTotalSegundos = 0;
    if (startTime) {
      tiempoTotalSegundos = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    }
    const payload = {
      idActividad: idActividad,
      puntuacion: earned,
      tiempoTotal: tiempoTotalSegundos,
      fechaRealizacion: new Date()
    };
    try {
      await registrarResultado(payload);
      await actualizarPuntos(earned);
    } catch (e) {
      console.error("Error al actualizar puntos:", e);
    }
  };

  const handleClick = (num: number) => {
    if (finished) return;
    const expected = sortedNumbers[currentIndex];
    if (num === expected) {
      const nextIdx = currentIndex + 1;
      if (nextIdx === sortedNumbers.length) {
        setCurrentIndex(nextIdx - 1);
        finishGame(true);
      } else {
        setCurrentIndex(nextIdx);
      }
    } else {
      // Clic incorrecto
      finishGame(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Juego de Secuencia de Números</h1>
      <p className={styles.status}>
        {!finished
          ? `Sigue la secuencia: ${sortedNumbers[currentIndex]}`
          : `¡Juego terminado! Puntos: ${points}`}
      </p>

      <div className={styles.grid}>
        {gridNumbers.map((num) => {
          const isClicked = sortedNumbers.slice(0, currentIndex).includes(num);
          return (
            <button
              key={num}
              className={`${styles.cell} ${isClicked ? styles.clicked : ""}`}
              onClick={() => handleClick(num)}
              disabled={isClicked || finished}
            >
              {num}
            </button>
          );
        })}
      </div>

      <div className={styles.controls}>
        {!finished ? (
          <button
            className={styles.giveUpButton}
            onClick={() => finishGame(false)}
          >
            Rendirse
          </button>
        ) : (
          <button
            className={styles.restartButton}
            onClick={restartGame}
          >
            Jugar de nuevo
          </button>
        )}
      </div>
    </div>
  );
}

// Componente principal con Suspense
export default function SecuenciaPage() {
  return (
    <Suspense fallback={<div className={styles.container}>Cargando juego...</div>}>
      <SecuenciaGame />
    </Suspense>
  );
}
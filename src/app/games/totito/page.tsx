"use client";

import React, { useEffect, useState, Suspense } from 'react';
import style from './totito.module.css';
import { actualizarPuntos, registrarResultado } from '@/lib/api';
import { useRouter, useSearchParams } from "next/navigation";

const TicTacToeGame = () => {
  const searchParams = useSearchParams();
  const idActividad = parseInt(searchParams.get("idActividad") || "0");
  const router = useRouter();
  const [board, setBoard] = useState<string[]>(Array(9).fill(""));
  const [winner, setWinner] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [lockBoard, setLockBoard] = useState(false);
  const [pointsSent, setPointsSent] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Verificar autenticación solo al montar
  useEffect(() => {
    const token = localStorage.getItem("cognitiva_token");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  // Iniciar timer cuando se reinicia el juego
  useEffect(() => {
    if (!winner) {
      setStartTime(new Date());
    }
  }, [winner]);

  const calculateWinner = (squares: string[]): string | null => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const emptyIndices = (b: string[]) => b.map((val, i) => val === "" ? i : null).filter(v => v !== null) as number[];

  const aiMove = (b: string[]) => {
    const empty = emptyIndices(b);
    return empty[Math.floor(Math.random() * empty.length)];
  };

  const handleClick = (index: number) => {
    if (board[index] || winner || lockBoard) return;

    const newBoard = [...board];
    newBoard[index] = "X";
    setBoard(newBoard);

    const win = calculateWinner(newBoard);
    if (win) {
      setWinner(win);
      return;
    }

    if (newBoard.every(cell => cell !== "")) {
      setWinner("Empate");
      return;
    }

    setLockBoard(true);
    setTimeout(() => {
      const aiIndex = aiMove(newBoard);
      if (aiIndex !== undefined) {
        newBoard[aiIndex] = "O";
        setBoard([...newBoard]);
        const aiWin = calculateWinner(newBoard);
        if (aiWin) setWinner(aiWin);
        else if (newBoard.every(cell => cell !== "")) setWinner("Empate");
      }
      setLockBoard(false);
    }, 400);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(""));
    setWinner(null);
    setLockBoard(false);
    setPointsSent(false);
  };

  // Registrar puntos cuando hay ganador
  useEffect(() => {
    const registrarPuntos = async () => {
      if (winner && !pointsSent && winner === "X") {
        const endTime = new Date();
        let tiempoTotalSegundos = 0;
        if (startTime) {
          tiempoTotalSegundos = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
        }
        
        setScore(prev => prev + 10);
        if ((score + 10) % 50 === 0) setLevel(prev => prev + 1);
        
        const payload = {
          idActividad,
          puntuacion: 10,
          tiempoTotal: tiempoTotalSegundos,
          fechaRealizacion: new Date(),
        };
        
        try {
          await registrarResultado(payload);
          console.log("Resultado registrado");
          await actualizarPuntos(10);
          console.log("Puntos enviados");
        } catch (e) {
          console.error("Error al registrar:", e);
        }
        
        setPointsSent(true);
      }
    };

    registrarPuntos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [winner, pointsSent]);

  return (
    <div className={style.tictactoepage}>
      <div className={style.scoreboard}>
        <p>Puntuación: {score}</p>
        <p>Nivel: {level}</p>
      </div>

      <div className={style.board}>
        {board.map((value, index) => (
          <button key={index} className={style.square} onClick={() => handleClick(index)}>
            {value}
          </button>
        ))}
      </div>

      {winner && (
        <div className={style.winnermessage}>
          <h3>{winner === "Empate" ? "¡Empate!" : `¡Ganador: ${winner}!`}</h3>
          <button onClick={resetGame}>Reiniciar Juego</button>
        </div>
      )}
    </div>
  );
};

// Componente principal exportado con Suspense
export default function TicTacToe() {
  return (
    <Suspense fallback={<div className={style.tictactoepage}>Cargando juego...</div>}>
      <TicTacToeGame />
    </Suspense>
  );
}
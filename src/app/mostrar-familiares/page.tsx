"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./mostrar-familiares.module.css";
import { obtenerFamiliares, Familiar } from "@/lib/api";
import { useRouter } from "next/navigation";

const PARENTESCOS = [
  "Padre",
  "Madre",
  "Hermano",
  "Hermana",
  "Tío",
  "Tía",
  "Primo",
  "Prima",
  "Abuelo",
  "Abuela",
  "Nieto",
  "Nieta"
];

export default function MostrarFamiliaresPage() {
  const [familiares, setFamiliares] = useState<Familiar[]>([]);
  const [loading, setLoading] = useState(true);
  const [seleccionados, setSeleccionados] = useState<{ [key: number]: string }>({});
  const [revelados, setRevelados] = useState<{ [key: number]: boolean }>({});
  const router = useRouter();

  useEffect(() => {
    const cargarFamiliares = async () => {
      try {
        const data = await obtenerFamiliares();
        if (data) setFamiliares(data);
      } catch (err) {
        console.error("Error al obtener familiares", err);
      } finally {
        setLoading(false);
      }
    };

    cargarFamiliares();
  }, []);

  const handleSeleccion = (familiarId: number, parentesco: string) => {
    setSeleccionados(prev => ({
      ...prev,
      [familiarId]: parentesco
    }));
  };

  const verificarRespuesta = (familiar: Familiar) => {
    const seleccion = seleccionados[familiar.id];
    if (!seleccion) {
      alert("Por favor selecciona un parentesco");
      return;
    }

    const normalizar = (str: string) => 
      str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (normalizar(seleccion) === normalizar(familiar.parentesco)) {
      setRevelados(prev => ({
        ...prev,
        [familiar.id]: true
      }));
    } else {
      alert("Incorrecto. Intenta de nuevo.");
    }
  };

  const resetearJuego = () => {
    setSeleccionados({});
    setRevelados({});
  };

  if (loading) return <div className={styles.loading}>Cargando familiares...</div>;

  const totalFamiliares = familiares.length;
  const totalRevelados = Object.keys(revelados).length;
  const juegoCompletado = totalFamiliares > 0 && totalRevelados === totalFamiliares;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>¿Quién es Quién? - Árbol Familiar</h2>
      
      <div className={styles.scoreBoard}>
        <p>Progreso: {totalRevelados} / {totalFamiliares}</p>
        {juegoCompletado && (
          <div className={styles.completado}>
            <p>¡Felicidades! Completaste el juego 🎉</p>
            <button onClick={resetearJuego} className={styles.resetButton}>
              Jugar de nuevo
            </button>
          </div>
        )}
      </div>

      <div className={styles.grid}>
        {familiares.length === 0 ? (
          <p>No se encontraron familiares registrados.</p>
        ) : (
          familiares.map((familiar) => {
            const revelado = revelados[familiar.id];
           const cardClasses = revelado
                            ? styles.card + " " + styles.cardRevealed
                            : styles.card;
            
            return (
              <div key={familiar.id} className={cardClasses}>
                <div className={styles.imageContainer}>
                  <Image 
                    src={familiar.fotoUrl} 
                    alt={familiar.nombre} 
                    fill
                    className={styles.image}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <h3 className={styles.name}>{familiar.nombre}</h3>
                
                {!revelado ? (
                  <div className={styles.gameSection}>
                    <label className={styles.label}>¿Cuál es su parentesco?</label>
                    <select
                      className={styles.select}
                      value={seleccionados[familiar.id] || ""}
                      onChange={(e) => handleSeleccion(familiar.id, e.target.value)}
                    >
                      <option value="">-- Selecciona --</option>
                      {PARENTESCOS.map((parentesco) => (
                        <option key={parentesco} value={parentesco}>
                          {parentesco}
                        </option>
                      ))}
                    </select>
                    <button
                      className={styles.verifyButton}
                      onClick={() => verificarRespuesta(familiar)}
                      disabled={!seleccionados[familiar.id]}
                    >
                      Verificar
                    </button>
                  </div>
                ) : (
                  <div className={styles.revealed}>
                    <p className={styles.relation}>✅ {familiar.parentesco}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <button className={styles.backButton} onClick={() => router.push("/dashboard")}>
        ⬅ Volver al Dashboard
      </button>
    </div>
  );
}
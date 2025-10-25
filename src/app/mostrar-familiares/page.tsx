"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./mostrar-familiares.module.css";
import { obtenerFamiliares, Familiar } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function MostrarFamiliaresPage() {
  const [familiares, setFamiliares] = useState<Familiar[]>([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) return <div className={styles.loading}>Cargando familiares...</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Árbol Familiar</h2>
      <div className={styles.grid}>
        {familiares.length === 0 ? (
          <p>No se encontraron familiares registrados.</p>
        ) : (
          familiares.map((familiar) => (
            <div key={familiar.id} className={styles.card}>
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
              <p className={styles.relation}>{familiar.parentesco}</p>
            </div>
          ))
        )}
        <button className={styles.backButton} onClick={() => router.push("/dashboard")}>
          ⬅ Volver al Dashboard
        </button>
      </div>
    </div>
  );
}
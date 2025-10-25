"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { registrarPersonaArbol } from "@/lib/api";
import styles from "./registrar-familia.module.css";

export default function RegistrarFamiliarPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [parentesco, setParentesco] = useState("");
  const [foto, setFoto] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await registrarPersonaArbol(
        {
          nombre,
          parentesco,
          //idPadre: idPadre ? parseInt(idPadre) : null,
        },
        foto
      );

      alert("Familiar registrado con éxito");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Hubo un error al registrar el familiar");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Registrar Familiar</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className={styles.formGroup}>
          <label className={styles.label}>Nombre:</label>
          <input
            className={styles.input}
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Parentesco:</label>
          <input
            className={styles.input}
            type="text"
            value={parentesco}
            onChange={(e) => setParentesco(e.target.value)}
            required
          />
        </div>
        {/* Evaluar implementacion */}
        {/*<div className={styles.formGroup}>
          <label className={styles.label}>ID del Padre (opcional):</label>
          <input
            className={styles.input}
            type="number"
            value={idPadre}
            onChange={(e) => setIdPadre(e.target.value)}
          />
        </div>*/}

        <div className={styles.formGroup}>
          <label className={styles.label}>Foto:</label>
          <input
            className={styles.fileInput}
            type="file"
            accept="image/*"
            onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
          />
        </div>

        <button type="submit" className={styles.button}>
          Registrar
        </button>
      </form>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import styles from './estadoAnimoModal.module.css';
import { enviarEstadoAnimo } from '@/lib/api';

type EstadoAnimoModalProps = {
  usuarioId: number;
  onClose: () => void;
};

// Emojis asociados a emociones
const emociones = [
  { label: '😊 Feliz', value: 'Feliz' },
  { label: '😢 Triste', value: 'Triste' },
  { label: '😰 Ansioso', value: 'Ansioso' },
  { label: '💪 Motivado', value: 'Motivado' },
  { label: '😌 Relajado', value: 'Relajado' },
  { label: '😠 Enojado', value: 'Enojado' },
];

const EstadoAnimoModal: React.FC<EstadoAnimoModalProps> = ({ usuarioId, onClose }) => {
  const [seleccionado, setSeleccionado] = useState('');
  const [loading, setLoading] = useState(false);
  const [descripcion, setDescripcion] = useState('');

  const enviar = async () => {
    if (!seleccionado) return;

    try {
      setLoading(true);
      await enviarEstadoAnimo({ usuarioId, estado: seleccionado, descripcion });
      onClose(); // cerrar modal
    } catch (error) {
      console.error("Error al enviar estado de ánimo:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>¿Cómo te sientes hoy?</h2>

        <select
          value={seleccionado}
          onChange={(e) => setSeleccionado(e.target.value)}
          disabled={loading}
        >
          <option value="">Selecciona una opción</option>
          {emociones.map((emo) => (
            <option key={emo.value} value={emo.value}>{emo.label}</option>
          ))}
        </select>

        <textarea
          placeholder="¿Por qué te sientes así?"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={4}
          className={styles.textarea}
        />

        <button onClick={enviar} disabled={loading || !seleccionado}>
          {loading ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </div>
  );
};

export default EstadoAnimoModal;

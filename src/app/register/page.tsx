'use client';

import { useState } from 'react';
import styles from './register.module.css';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nombre: '',
    correo: '',
    password: '',
    edad: '',
  });

  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/addUsuario`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          edad: Number(form.edad),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMensaje(data.mensaje || 'Registro exitoso');
        setError(false);
        setTimeout(() => {
          router.push('/login'); // redirigir al login luego de registrar
        }, 1500);
      } else {
        setMensaje(data.mensaje || 'Error al registrarse');
        setError(true);
      }
    } catch (err) {
      console.error(err);
      setMensaje('Error al conectar con el servidor');
      setError(true);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Registro de Usuario</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre completo"
          value={form.nombre}
          onChange={handleChange}
          required
          className={styles.inputField}
        />
        <input
          type="email"
          name="correo"
          placeholder="Correo electrónico"
          value={form.correo}
          onChange={handleChange}
          required
          className={styles.inputField}
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          required
          className={styles.inputField}
        />
        <input
          type="number"
          name="edad"
          placeholder="Edad"
          value={form.edad}
          onChange={handleChange}
          required
          className={styles.inputField}
        />
        <button className={styles.registerButton} type="submit">Registrarme</button>
      </form>
      {mensaje && (
        <p className={error ? styles.error : styles.success}>{mensaje}</p>
      )}
    </div>
  );
}

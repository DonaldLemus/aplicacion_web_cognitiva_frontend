"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";
import EstadoAnimoModal from "../components/estadoDeAnimo/estadoAnimoModal";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!res.ok) {
        if (res.status === 401) {
          setError("Correo o contraseña incorrectos");
        } else {
          setError("Error al iniciar sesión");
        }
        setLoading(false);
        return;
      }

      const data = await res.json();
      localStorage.setItem("cognitiva_token", data.token);
      localStorage.setItem(
        "cognitiva_user",
        JSON.stringify(data.usuarioLoginResponse)
      );
      setUsuarioId(data.usuarioLoginResponse.id); 
      const startRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/startSession`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: data.usuarioLoginResponse.id }),
      });

      if (!startRes.ok) {
        setError("No se pudo iniciar la sesión");
        setLoading(false);
        return;
      }
      const { sesionId } = await startRes.json();
      localStorage.setItem("cognitiva_session", String(sesionId));
      setMostrarModal(true);

    } catch (err) {
      console.error(err);
      setError("No se pudo conectar al servidor");
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setMostrarModal(false);
    router.push("/dashboard");
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h1>Estimule sus habilidades cognitivas</h1>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={styles.loginButton}
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>
        <p className={styles.registerPrompt}>
          ¿No tienes cuenta?{" "}
          <button
            className={styles.registerButton}
            onClick={() => router.push("/register")}
          >
            Regístrate aquí
          </button>
        </p>
      </div>
      {/* Aquí renderizamos el modal*/}
      {mostrarModal && usuarioId && (
        <EstadoAnimoModal
          usuarioId={usuarioId}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

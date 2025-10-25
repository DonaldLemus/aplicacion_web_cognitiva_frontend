"use client";
import { useRouter } from "next/navigation";
import styles from "./registrar-corres.module.css";
import { registrarCorreoAdicional } from "@/lib/api";
import { useState } from "react";

export default function RegistrarCorreoPage() {

    const router = useRouter();
    const [correo, setCorreo] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await registrarCorreoAdicional(
                correo
            );

            alert("Correo registrado con éxito");
            router.push("/dashboard");
        } catch (err) {
            console.error(err);
            alert("Hubo un error al registrar el correo");
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Registrar correo adicional</h2>
            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Correo:</label>
                    <input
                        placeholder="Ingresa el correo adicional"
                        className={styles.input}
                        type="email"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className={styles.button}>
                    Registrar Correo
                </button>
            </form>
            {/* Aquí va el formulario para registrar correos */}
        </div>
    );
}
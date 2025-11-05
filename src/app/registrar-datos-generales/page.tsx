"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./registrar-datos-generales.module.css";
import { registrarInformacionMedica } from "@/lib/api";
import {
    ENFERMEDADES_CRONICAS,
    PARENTESCOS,
    DISPOSITIVOS_MOVILIDAD,
    DIETAS_ESPECIALES,
    NIVEL_MOVILIDAD,
    RIESGO_CAIDAS,
} from "@/app/interface/catalogos";

export default function RegistrarDatosGeneralesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [seccionActual, setSeccionActual] = useState(1);

    // Estado del formulario
    const [formData, setFormData] = useState({
        // Sección 1
        fechaNacimiento: "",
        numeroIdentificacion: "",
        direccion: "",
        telefonoFijo: "",
        telefonoMovil: "",
        contactoNombre: "",
        contactoParentesco: "",
        contactoTelefono: "",
        medicoNombre: "",
        medicoTelefono: "",

        // Sección 2
        enfermedadesCronicas: [] as string[],
        medicamentos: "",
        alergiasAlimentarias: "",
        alergiasAmbientales: "",
        usaLentes: false,
        usaAudifono: false,
        usaProtesisDentadura: false,
        dispositivosMovilidad: "Ninguno",

        // Sección 3
        dietaEspecial: "Normal",
        nivelMovilidad: "Independiente",
        riesgoCaidas: "Bajo",
        rutinaEjercicio: "",
        puedeDucharseSolo: true,
        seVisteSolo: true,
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;

        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData((prev) => ({ ...prev, [name]: checked }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleEnfermedadesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const options = e.target.options;
        const selected: string[] = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selected.push(options[i].value);
            }
        }
        setFormData((prev) => ({ ...prev, enfermedadesCronicas: selected }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const userString = localStorage.getItem("cognitiva_user");
            const user = userString ? JSON.parse(userString) : null;

            if (!user?.id) {
                alert("No se encontró información del usuario");
                return;
            }

            const payload = {
                usuarioId: user.id,
                fechaNacimiento: formData.fechaNacimiento,
                numeroIdentificacion: formData.numeroIdentificacion || undefined,
                direccion: formData.direccion || undefined,
                telefonoFijo: formData.telefonoFijo || undefined,
                telefonoMovil: formData.telefonoMovil || undefined,
                contactoNombre: formData.contactoNombre || undefined,
                contactoParentesco: formData.contactoParentesco || undefined,
                contactoTelefono: formData.contactoTelefono || undefined,
                medicoNombre: formData.medicoNombre || undefined,
                medicoTelefono: formData.medicoTelefono || undefined,
                enfermedadesCronicas: formData.enfermedadesCronicas.join(",") || undefined,
                medicamentos: formData.medicamentos || undefined,
                alergiasAlimentarias: formData.alergiasAlimentarias || undefined,
                alergiasAmbientales: formData.alergiasAmbientales || undefined,
                usaLentes: formData.usaLentes,
                usaAudifono: formData.usaAudifono,
                usaProtesisDentadura: formData.usaProtesisDentadura,
                dispositivosMovilidad: formData.dispositivosMovilidad || undefined,
                dietaEspecial: formData.dietaEspecial || undefined,
                nivelMovilidad: formData.nivelMovilidad || undefined,
                riesgoCaidas: formData.riesgoCaidas || undefined,
                rutinaEjercicio: formData.rutinaEjercicio || undefined,
                puedeDucharseSolo: formData.puedeDucharseSolo,
                seVisteSolo: formData.seVisteSolo,
            };

            await registrarInformacionMedica(payload);
            alert("Información médica registrada exitosamente");
            router.push("/dashboard");
        } catch (error) {
            console.error("Error:", error);
            alert(error instanceof Error ? error.message : "Error al registrar información");
        } finally {
            setLoading(false);
        }
    };


    const siguienteSeccion = () => {
        if (seccionActual < 3) setSeccionActual(seccionActual + 1);
    };

    const anteriorSeccion = () => {
        if (seccionActual > 1) setSeccionActual(seccionActual - 1);
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Información Médica del Adulto Mayor</h1>

            <div className={styles.progress}>
                <div className={styles.progressBar}>
                    <div
                        className={styles.progressFill}
                        style={{ width: `${(seccionActual / 3) * 100}%` }}
                    ></div>
                </div>
                <p className={styles.progressText}>
                    Sección {seccionActual} de 3
                </p>
            </div>

            <form className={styles.form}>

                {/* SECCIÓN 1: Datos Generales */}
                {seccionActual === 1 && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Sección 1: Datos Generales y de Contacto</h2>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Fecha de Nacimiento *</label>
                            <input
                                type="date"
                                name="fechaNacimiento"
                                value={formData.fechaNacimiento}
                                onChange={handleChange}
                                className={styles.input}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Número de Identificación (DPI)</label>
                            <input
                                type="text"
                                name="numeroIdentificacion"
                                value={formData.numeroIdentificacion}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="Ej: 1234567890101"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Dirección</label>
                            <textarea
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleChange}
                                className={styles.textarea}
                                rows={3}
                                placeholder="Dirección completa"
                            />
                        </div>

                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Teléfono Fijo</label>
                                <input
                                    type="tel"
                                    name="telefonoFijo"
                                    value={formData.telefonoFijo}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder="2234-5678"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Teléfono Móvil</label>
                                <input
                                    type="tel"
                                    name="telefonoMovil"
                                    value={formData.telefonoMovil}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder="5555-1234"
                                />
                            </div>
                        </div>

                        <h3 className={styles.subsectionTitle}>Persona de Contacto (Familiar)</h3>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Nombre</label>
                            <input
                                type="text"
                                name="contactoNombre"
                                value={formData.contactoNombre}
                                onChange={handleChange}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Parentesco</label>
                                <select
                                    name="contactoParentesco"
                                    value={formData.contactoParentesco}
                                    onChange={handleChange}
                                    className={styles.select}
                                >
                                    <option value="">-- Selecciona --</option>
                                    {PARENTESCOS.map((p) => (
                                        <option key={p} value={p}>
                                            {p}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Teléfono</label>
                                <input
                                    type="tel"
                                    name="contactoTelefono"
                                    value={formData.contactoTelefono}
                                    onChange={handleChange}
                                    className={styles.input}
                                />
                            </div>
                        </div>

                        <h3 className={styles.subsectionTitle}>Médico de Cabecera</h3>

                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Nombre del Médico</label>
                                <input
                                    type="text"
                                    name="medicoNombre"
                                    value={formData.medicoNombre}
                                    onChange={handleChange}
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Teléfono del Médico</label>
                                <input
                                    type="tel"
                                    name="medicoTelefono"
                                    value={formData.medicoTelefono}
                                    onChange={handleChange}
                                    className={styles.input}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* SECCIÓN 2: Información Médica */}
                {seccionActual === 2 && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Sección 2: Información Médica y de Salud</h2>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Enfermedades Crónicas (Mantén presionado Ctrl para seleccionar varias)
                            </label>
                            <select
                                multiple
                                name="enfermedadesCronicas"
                                value={formData.enfermedadesCronicas}
                                onChange={handleEnfermedadesChange}
                                className={styles.selectMultiple}
                                size={8}
                            >
                                {ENFERMEDADES_CRONICAS.map((enf) => (
                                    <option key={enf} value={enf}>
                                        {enf}
                                    </option>
                                ))}
                            </select>
                            <small className={styles.hint}>
                                Seleccionadas: {formData.enfermedadesCronicas.join(", ") || "Ninguna"}
                            </small>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Medicamentos</label>
                            <textarea
                                name="medicamentos"
                                value={formData.medicamentos}
                                onChange={handleChange}
                                className={styles.textarea}
                                rows={3}
                                placeholder="Lista de medicamentos que toma regularmente"
                            />
                        </div>

                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Alergias Alimentarias</label>
                                <input
                                    type="text"
                                    name="alergiasAlimentarias"
                                    value={formData.alergiasAlimentarias}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder="Ej: Lácteos, maní"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Alergias Ambientales</label>
                                <input
                                    type="text"
                                    name="alergiasAmbientales"
                                    value={formData.alergiasAmbientales}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder="Ej: Polen, polvo"
                                />
                            </div>
                        </div>

                        <div className={styles.checkboxGroup}>
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    name="usaLentes"
                                    checked={formData.usaLentes}
                                    onChange={handleChange}
                                />
                                ¿Usa lentes?
                            </label>

                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    name="usaAudifono"
                                    checked={formData.usaAudifono}
                                    onChange={handleChange}
                                />
                                ¿Usa audífono?
                            </label>

                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    name="usaProtesisDentadura"
                                    checked={formData.usaProtesisDentadura}
                                    onChange={handleChange}
                                />
                                ¿Usa prótesis/dentadura postiza?
                            </label>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Dispositivos de Movilidad</label>
                            <select
                                name="dispositivosMovilidad"
                                value={formData.dispositivosMovilidad}
                                onChange={handleChange}
                                className={styles.select}
                            >
                                {DISPOSITIVOS_MOVILIDAD.map((disp) => (
                                    <option key={disp} value={disp}>
                                        {disp}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* SECCIÓN 3: Rutina Diaria */}
                {seccionActual === 3 && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Sección 3: Rutina Diaria y Cuidados Personales</h2>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Dieta Especial</label>
                            <select
                                name="dietaEspecial"
                                value={formData.dietaEspecial}
                                onChange={handleChange}
                                className={styles.select}
                            >
                                {DIETAS_ESPECIALES.map((dieta) => (
                                    <option key={dieta} value={dieta}>
                                        {dieta}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Nivel de Movilidad</label>
                            <select
                                name="nivelMovilidad"
                                value={formData.nivelMovilidad}
                                onChange={handleChange}
                                className={styles.select}
                            >
                                {NIVEL_MOVILIDAD.map((nivel) => (
                                    <option key={nivel} value={nivel}>
                                        {nivel}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Riesgo de Caídas</label>
                            <select
                                name="riesgoCaidas"
                                value={formData.riesgoCaidas}
                                onChange={handleChange}
                                className={styles.select}
                            >
                                {RIESGO_CAIDAS.map((riesgo) => (
                                    <option key={riesgo} value={riesgo}>
                                        {riesgo}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Rutina de Ejercicio</label>
                            <textarea
                                name="rutinaEjercicio"
                                value={formData.rutinaEjercicio}
                                onChange={handleChange}
                                className={styles.textarea}
                                rows={3}
                                placeholder="Ej: Paseos de 15 min, fisioterapia en casa"
                            />
                        </div>

                        <div className={styles.checkboxGroup}>
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    name="puedeDucharseSolo"
                                    checked={formData.puedeDucharseSolo}
                                    onChange={handleChange}
                                />
                                ¿Puede ducharse solo?
                            </label>

                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    name="seVisteSolo"
                                    checked={formData.seVisteSolo}
                                    onChange={handleChange}
                                />
                                ¿Se viste solo?
                            </label>
                        </div>
                    </div>
                )}

                {/* Botones de navegación */}
                <div className={styles.buttonGroup}>
                    {seccionActual > 1 && (
                        <button
                            type="button"
                            onClick={anteriorSeccion}
                            className={styles.btnSecondary}
                        >
                            ← Anterior
                        </button>
                    )}
                    {seccionActual < 3 ? (
                        <button
                            type="button"
                            onClick={siguienteSeccion}
                            className={styles.btnPrimary}
                            disabled={loading}
                        >
                            Siguiente →
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className={styles.btnSuccess}
                        >
                            {loading ? "Guardando..." : "Guardar Información"}
                        </button>
                    )}

                </div>
            </form>
        </div>
    );
}

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import style from "./dashboard.module.css";
import {
  descargarReporteEstadoAnimo,
  enviarReporte,
  subirFotoPerfil,
} from "@/lib/api";

type Actividad = {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  fecha_creacion: string;
  ruta: string;
};

interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  fecha: string;
  leida?: boolean;
}

type Clima = {
  tempC: number;
  icon?: string;
  ciudad?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPDF, setShowPDF] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem("cognitiva_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/listarActividades`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar actividades");
        return res.json();
      })
      .then((data: Actividad[]) => {
        if (mounted) setActividades(data);
      })
      .catch((e) => {
        console.error(e);
        if (mounted) setError("No se pudo cargar las actividades");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [router]);

  const userString =
    typeof window !== "undefined"
      ? localStorage.getItem("cognitiva_user")
      : null;
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = async () => {
    const token = localStorage.getItem("cognitiva_token");
    const sesionId = localStorage.getItem("cognitiva_session");
    try {
      if (sesionId) {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/${sesionId}/endSession`,
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${token ?? ""}` },
          }
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.removeItem("cognitiva_token");
      localStorage.removeItem("cognitiva_user");
      localStorage.removeItem("cognitiva_session");
      router.replace("/login");
    }
  };

  const handleDescargar = async () => {
    try {
      const blob = await descargarReporteEstadoAnimo();
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      setShowPDF(true);

      const link = document.createElement("a");
      link.href = url;
      link.download = `reporte_estado_animo.pdf`;
      link.click();
    } catch (error) {
      console.error("Error al descargar el reporte:", error);
      alert("Ocurrió un error al descargar el reporte.");
    }
  };

  const handleEnviar = async () => {
    try {
      const res = await enviarReporte();
      if (res.status) {
        alert("Reporte enviado exitosamente a tu correo.");
      } else {
        alert("No se pudo enviar el reporte.");
      }
    } catch (error) {
      console.error("Error al enviar el reporte:", error);
      alert("Ocurrió un error al enviar el reporte.");
    }
  };

  if (loading) return <div className={style.dashboardpage}>Cargando...</div>;
  if (error) return <div className={style.dashboardpage}>{error}</div>;

  return (
    <div className={style.dashboardpage}>
      <TopBar
        nombre={user?.nombre ?? "Usuario"}
        fotoPerfilUrl={user?.fotoPerfilUrl}
        onLogout={handleLogout}
      />

      <div className={style.dashboardmenu}>
        <p>Selecciona un juego para comenzar:</p>
        <div className={style.reportButtons}>
          <button className={style.reportButton} onClick={handleDescargar}>
            📥 Descargar reporte
          </button>
          <button
            className={style.reportButtonSecondary}
            onClick={handleEnviar}
          >
            📧 Enviar reporte
          </button>
          <button
            className={style.reportButton}
            onClick={() => router.push("/registrar-familia")}
          >
            😊 Registrar familiar
          </button>
          <button
            className={style.reportButton}
            onClick={() => router.push("/mostrar-familiares")}
          >
            😊 Ver familiares
          </button>
        </div>

        <div className={style.buttoncontainer}>
          {actividades.map((act) => (
            <button
              key={act.id}
              className={style.gameButton}
              onClick={() =>
                router.push(`/${act.ruta}?idActividad=${act.id}`)
              }
            >
              {act.nombre}
            </button>
          ))}
        </div>
      </div>

      {showPDF && pdfUrl && (
        <div className={style.modalOverlay}>
          <div className={style.modalContent}>
            <button
              className={style.closeButton}
              onClick={() => setShowPDF(false)}
            >
              ✖
            </button>
            <iframe src={pdfUrl} className={style.pdfViewer} title="Visor PDF" />
          </div>
        </div>
      )}
    </div>
  );
}

function TopBar({
  nombre,
  fotoPerfilUrl,
  onLogout,
}: {
  nombre: string;
  fotoPerfilUrl?: string | null;
  onLogout: () => void;
}) {
  const router = useRouter();
  const defaultAvatar =
    "https://res.cloudinary.com/daa36huug/image/upload/v1762242199/cognitiva/personas/11/en4gxcehq6pypzhfeicu.webp";

  // estado reactivo para la foto
  const [fotoUrl, setFotoUrl] = useState(fotoPerfilUrl || defaultAvatar);

  const handleSubirFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirm = window.confirm("¿Deseas cambiar tu foto de perfil?");
    if (!confirm) return;

    try {
      const nuevaUrl = await subirFotoPerfil(file);
      alert("Foto de perfil actualizada correctamente");

      // actualizar localStorage
      const userStr = localStorage.getItem("cognitiva_user");
      const user = userStr ? JSON.parse(userStr) : null;
      if (user) {
        user.fotoPerfilUrl = nuevaUrl;
        localStorage.setItem("cognitiva_user", JSON.stringify(user));
      }
      setFotoUrl(nuevaUrl);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error al subir la foto.");
    }
  };

  return (
    <header className={style.topbar}>
      <div className={style.topbarLeft}>
        <div className={style.profileSection}>
          <div
            className={style.avatarContainer}
            onClick={() => document.getElementById("fotoInput")?.click()}
            title="Haz clic para cambiar tu foto de perfil"
          >
            <Image
              src={fotoUrl || defaultAvatar}
              alt={nombre}
              width={50}
              height={50}
              className={style.avatar}
              unoptimized={!fotoPerfilUrl}
            />
            <input
              id="fotoInput"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleSubirFoto}
            />
          </div>
          <h2 className={style.welcome}>Bienvenido, {nombre}</h2>
          <button
            className={style.addEmailButton}
            onClick={() => router.push("/registrar-datos-generales")}
          >
            Registrar Datos Médicos
          </button>
        </div>
      </div>
      <div className={style.topbarRight}>
        <ClockWidget />
        <WeatherWidget />
        <NotificationsBell />
        <button className={style.logoutButton} onClick={onLogout}>
          Cerrar sesión
        </button>
        <button
          className={style.addEmailButton}
          onClick={() => router.push("/registrar-correos")}
        >
          Agregar Correo
        </button>
      </div>
    </header>
  );
}

function ClockWidget() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className={style.clock}>
      {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
    </div>
  );
}

function WeatherWidget() {
  const [clima, setClima] = useState<Clima | null>(null);
  useEffect(() => {
    let mounted = true;

    const obtenerClima = async () => {
      try {
        const latitude = 14.6349;
        const longitude = -90.5069;

        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
        );

        if (!res.ok) return;

        const data = await res.json();

        const weather = data.current_weather;
        const clima: Clima = {
          tempC: weather.temperature,
          icon: obtenerIconoPorCodigo(weather.weathercode),
          ciudad: "Guatemala",
        };

        if (mounted) setClima(clima);
      } catch (e) {
        console.error("Error al obtener el clima", e);
      }
    };

    obtenerClima();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className={style.weather} title={clima?.ciudad ?? ""}>
      {clima ? (
        <span className={style.weatherRow}>
          {clima.icon && (
            <Image
              src={clima.icon}
              alt="Icono del clima"
              className={style.weatherIcon}
              width={32}
              height={32}
              unoptimized
            />
          )}
          {Math.round(clima.tempC)}°C
        </span>
      ) : (
        "Clima: —"
      )}
    </div>
  );
}

function obtenerIconoPorCodigo(codigo: number): string {
  if ([0].includes(codigo)) return "https://openweathermap.org/img/wn/01d.png";
  if ([1, 2, 3].includes(codigo)) return "https://openweathermap.org/img/wn/02d.png";
  if ([45, 48].includes(codigo)) return "https://openweathermap.org/img/wn/50d.png";
  if ([51, 53, 55, 56, 57].includes(codigo))
    return "https://openweathermap.org/img/wn/09d.png";
  if ([61, 63, 65, 66, 67].includes(codigo))
    return "https://openweathermap.org/img/wn/10d.png";
  if ([71, 73, 75, 77].includes(codigo))
    return "https://openweathermap.org/img/wn/13d.png";
  if ([80, 81, 82].includes(codigo))
    return "https://openweathermap.org/img/wn/11d.png";
  return "https://openweathermap.org/img/wn/03d.png";
}

function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notificacion[]>([]);

  useEffect(() => {
    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/consejos-sse`
    );

    eventSource.addEventListener("nuevo-consejo", (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      const nuevaNotificacion: Notificacion = {
        id: Date.now(),
        titulo: data.titulo,
        mensaje: data.descripcion,
        fecha: new Date().toISOString(),
        leida: false,
      };
      setItems((prev) => [nuevaNotificacion, ...prev]);
    });

    eventSource.onerror = (err) => {
      console.error("Error SSE:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const unread = useMemo(() => items.filter((n) => !n.leida).length, [items]);

  const markAllAsRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, leida: true })));
  };

  return (
    <div className={style.bellWrapper}>
      <button
        className={style.bell}
        onClick={() => {
          setOpen((o) => !o);
          if (!open && unread > 0) markAllAsRead();
        }}
      >
        🔔
        {unread > 0 && <span className={style.badge}>{unread}</span>}
      </button>

      {open && (
        <div className={style.dropdown}>
          <div className={style.dropdownHeader}>
            <strong className={style.bellTitle}>Consejos</strong>
          </div>
          {items.length === 0 ? (
            <div className={style.empty}>Sin notificaciones</div>
          ) : (
            <ul className={style.list}>
              {items.map((n) => (
                <li key={n.id} className={style.item}>
                  <div className={style.itemTitle}>{n.titulo}</div>
                  <div className={style.itemMsg}>{n.mensaje}</div>
                  <div className={style.itemMeta}>
                    {new Date(n.fecha).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
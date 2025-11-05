export interface InformacionMedicaDTO {
  usuarioId: number;
  fechaNacimiento: string; // formato: "yyyy-MM-dd"
  numeroIdentificacion?: string;
  direccion?: string;
  telefonoFijo?: string;
  telefonoMovil?: string;
  contactoNombre?: string;
  contactoParentesco?: string;
  contactoTelefono?: string;
  medicoNombre?: string;
  medicoTelefono?: string;
  enfermedadesCronicas?: string;
  medicamentos?: string;
  alergiasAlimentarias?: string;
  alergiasAmbientales?: string;
  usaLentes: boolean;
  usaAudifono: boolean;
  usaProtesisDentadura: boolean;
  dispositivosMovilidad?: string;
  dietaEspecial?: string;
  nivelMovilidad?: string;
  riesgoCaidas?: string;
  rutinaEjercicio?: string;
  puedeDucharseSolo: boolean;
  seVisteSolo: boolean;
}

export async function actualizarPuntos(puntos: number) {
  const userStr = localStorage.getItem("cognitiva_user");
  if (!userStr) throw new Error("Usuario no encontrado");
  const { id } = JSON.parse(userStr); // tu dto trae id

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/actualizarPuntos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ id, puntos }),
  });

  if (!res.ok) {
    throw new Error("No se pudo actualizar puntos");
  }
  return res.text();
}

export const enviarEstadoAnimo = async (payload: { usuarioId: number, estado: string, descripcion: string }) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/registrarEstadoAnimo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("No se pudo registrar el estado de ánimo");
  return await res.json();
};

export const descargarReporteEstadoAnimo = async (): Promise<Blob> => {
  const userStr = localStorage.getItem("cognitiva_user");
  if (!userStr) throw new Error("Usuario no encontrado");
  const { id } = JSON.parse(userStr);

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/descargar/${id}`);

  if (!response.ok) {
    throw new Error("No se pudo descargar el reporte de estado de ánimo");
  }

  return await response.blob();
};

export interface Familiar {
  id: number;
  nombre: string;
  parentesco: string;
  fotoUrl: string;
}

export const obtenerFamiliares = async (): Promise<Familiar[] | null> => {
  const userStr = localStorage.getItem("cognitiva_user");
  if (!userStr) throw new Error("Usuario no encontrado");

  const { id } = JSON.parse(userStr);

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/listarFamiliares/${id}`);
  if (!res.ok) return null;

  return await res.json();
};

export const enviarReporte = async () => {
  const userStr = localStorage.getItem("cognitiva_user");
  if (!userStr) throw new Error("Usuario no encontrado");
  const { id } = JSON.parse(userStr);
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/enviar-reporte/${id}`,)
  if (!res.ok) throw new Error("No se pudo enviar el reporte de estado de ánimo");
  return await res.json();
}

export const registrarResultado = async (payload: { idUsuario?: number, idActividad: number, puntuacion: number, tiempoTotal: number, fechaRealizacion: Date }) => {
  const userStr = localStorage.getItem("cognitiva_user");
  if (!userStr) throw new Error("Usuario no encontrado");
  const { id } = JSON.parse(userStr);
  payload = { ...payload, idUsuario: id };
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/registrarResultado`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("No se pudo registrar el resultado del juego");
  return await res.json();
};

export const registrarPersonaArbol = async (persona: {
  nombre: string;
  parentesco: string;
  idPadre?: number | null;
  idUsuario?: number;
}, foto?: File | null) => {

  const userStr = localStorage.getItem("cognitiva_user");
  if (!userStr) throw new Error("Usuario no encontrado");
  const { id } = JSON.parse(userStr);
  const formData = new FormData();
  persona = { ...persona, idUsuario: id };
  formData.append("persona", new Blob(
    [JSON.stringify(persona)],
    { type: "application/json" }
  ));

  if (foto) {
    formData.append("foto", foto);
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/agregarPersona`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("No se pudo registrar la persona en el árbol genealógico");
  }

  return await res.json();
};

export const registrarCorreoAdicional = async (correo: string) => {
  const userStr = localStorage.getItem("cognitiva_user");
  if (!userStr) throw new Error("Usuario no encontrado");
  const { id } = JSON.parse(userStr);
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/registrarCorreo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuarioId: id, correo: correo }),
  });
  if (!res.ok) {
    throw new Error("No se pudo registrar el correo adicional");
  }
  return await res.json();
};

export const registrarInformacionMedica = async (data: InformacionMedicaDTO) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/registrarInformacionMedica`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al registrar información médica");
  }

  return response.json();
};


export const subirFotoPerfil = async (foto: File) => {
  const userStr = localStorage.getItem("cognitiva_user");
  if (!userStr) throw new Error("Usuario no encontrado");
  const { id } = JSON.parse(userStr);

  const formData = new FormData();
  formData.append("foto", foto);
  formData.append(
    "dto",
    new Blob([JSON.stringify({ idUsuario: id })], {
      type: "application/json",
    })
  );

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/agregarFoto`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Error al subir la foto");

  const data = await res.json();
  if (!data.status) throw new Error("No se pudo subir la foto");

  return data.message; // URL de la imagen subida
};

import { addKeyword, EVENTS } from "@builderbot/bot";
import { Database } from "firebase-admin/lib/database/database";
import { START_FLOW } from "~/constants/start/start.constant";
import { AUTH_FLOW } from "~/constants/auth/auth.constant";
import { BaileysProvider as Provider } from "@builderbot/provider-baileys";
import {
  onSetDataCollectionDocuments,
  onValidateDataCollectionDocumentActive,
} from "~/services/firebase-generals.service";
import { LEGALIZATIONTYPES } from "~/constants/legalization-types.constant";
import { StartObjectTravel } from "~/services/start-travel.service";
import { setBotDataInit } from "~/services/start-bot.service";

import axios, { AxiosError } from "axios";
import { apiConfig } from "~/config/api.config";
import { httpClient } from "~/services/http-client.service";

// =========================
// URLs y utilidades HTTP
// =========================
const LOGIN_URL = apiConfig.loginUrl;
const USER_TRIPS_URL = apiConfig.userTripsUrl;

/**
 * Llama al servicio de login-bot.
 */
async function loginBot(document: string, phone: string) {
  const payload = { document, phone };
  try {
    console.log("[authFlow] POST:", LOGIN_URL);
    const resp = await httpClient.post(LOGIN_URL, payload);
    return { ok: true, status: resp.status, data: resp.data };
  } catch (e) {
    const err = e as AxiosError;
    if (err.response) {
      return { ok: false, status: err.response.status, data: err.response.data };
    }
    return { ok: false, status: 0, data: null };
  }
}

/**
 * Obtiene viajes del usuario por cédula y retorna la lista cruda del servicio.
 */
async function fetchUserTrips(cedula: string) {
  try {
    console.log("[tripSelectFlow] POST:", USER_TRIPS_URL, "| payload:", { cedula });
    const resp = await httpClient.post(USER_TRIPS_URL, { cedula });
    return { ok: true, status: resp.status, data: resp.data };
  } catch (e) {
    const err = e as AxiosError;
    if (err.response) {
      return { ok: false, status: err.response.status, data: err.response.data };
    }
    return { ok: false, status: 0, data: null };
  }
}

/** Intenta normalizar fechas (por ejemplo MM/DD/YYYY) a un ISO entendible por Date. */
function normalizeDate(d?: string | null): string | null {
  if (!d) return null;
  // Si ya parece ISO, devuélvela.
  if (/^\d{4}-\d{2}-\d{2}/.test(d)) return d;
  // Aceptar "MM/DD/YYYY" o "MM/DD/YYYY HH:mm:ss"
  const m = d.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return d;
  const [, mm, dd, yyyy] = m;
  return `${yyyy}-${mm}-${dd}T00:00:00Z`;
}

/**
 * Mapea las solicitudes del nuevo API al formato usado por el bot.
 * Claves esperadas por el UI: id, destinationCity, reasonTrip, departure, return
 */
function mapSolicitudesToTrips(solicitudes: any[]): any[] {
  return (solicitudes || [])
    .filter((s: any) => {
      const estado = String(s?.estadoRequest || s?.datosSolicitud?.Estado || "").toLowerCase();
      return estado === "pendiente"; // Solo mostrar solicitudes en estado Pendiente
    })
    .map((s: any) => {
      const ds = s?.datosSolicitud || s; // Compatibilidad con posible formato anterior
      const id: string = ds?.["ID Solicitud"] || ds?.["Row ID"] || String(ds?._RowNumber || "");
      const motivo: string = ds?.["Motivo del Viaje"] ?? "";
      const ruta: string = ds?.["Primer Trayecto"] ?? ""; // Ej: "Medellin, Colombia - Cartagena, Colombia"
      const destino = (() => {
        if (!ruta) return "-";
        const parts = String(ruta).split("-");
        if (parts.length >= 2) return parts[parts.length - 1].trim();
        return ruta.trim();
      })();
      const fechaIni: string | null = normalizeDate(ds?.["FechaIniDef"] || ds?.["FechaIni"] || null);
      const fechaFin: string | null = normalizeDate(ds?.["FechaFinDef"] || ds?.["FechaFin"] || null);

      return {
        id,
        destinationCity: destino,
        reasonTrip: motivo,
        departure: fechaIni || undefined,
        return: fechaFin || undefined,
        __raw: s,
      };
    });
}

/** Formatea una fecha ISO a DD/MM/YYYY para UX. */
function toDate(d?: string | null): string {
  if (!d) return "-";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "-";
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = String(dt.getFullYear());
  return `${dd}/${mm}/${yyyy}`;
}

/** Construye el texto enumerado para WhatsApp (sin IDs). */
function buildTripsMessage(trips: any[]) {
  
  const lines: string[] = [];
  lines.push("📌 *Tus solicitudes de viaje activas*");
  lines.push("");
  trips.forEach((t, i) => {
    const idx = i + 1;
    const city = t?.destinationCity ?? "-";
    const reason = t?.reasonTrip ?? "-";
    const dep = toDate(t?.departure);
    const ret = toDate(t?.return);
  lines.push(`*${idx}.* ${city} — ${reason}\n   🗓️ ${dep} → ${ret}`);
  lines.push(""); 
  });
  return lines.join("\n");

}

// =========================
// Flows
// =========================

/**
 * Flow de inicio REAL (ya con viaje seleccionado).
 */
const startFlow = addKeyword<Provider, Database>(EVENTS.ACTION).addAction(
  async (context, { state, flowDynamic, gotoFlow }) => {
    try {
      console.log("[startFlow] Iniciando…");
      const userPhone = context.from;

      let sesionActive = await onValidateDataCollectionDocumentActive(state, userPhone);
      console.log("[startFlow] sesionActive:", sesionActive);

      // Si no hay sesión activa, crear una nueva
      if (!sesionActive) {
        console.log("[startFlow] No hay sesión activa. Creando nueva sesión...");
        await onSetDataCollectionDocuments(
          userPhone,
          LEGALIZATIONTYPES.travel,
          state,
          StartObjectTravel,
          ""
        );
        console.log("[startFlow] Nueva sesión creada");
        sesionActive = true;
      }

      // Continuar con el proceso normal
      console.log("[startFlow] Estableciendo data-collection…");
      await onSetDataCollectionDocuments(
        userPhone,
        LEGALIZATIONTYPES.travel,
        state,
        StartObjectTravel,
        ""
      );
      console.log("[startFlow] Data-collection listo.");

      const authUser = (await state.get("authUser")) as any | undefined;
      const fullName = authUser
        ? `${(authUser.name || "").trim()} ${(authUser.lastName || "").trim()}`.trim()
        : "";

      let selectedTrip = (await state.get("selectedTrip")) as any | undefined;
      const selectedTripId = (await state.get("selectedTripId")) as string | number | undefined;

      if (!selectedTrip && selectedTripId) {
        const trips = ((await state.get("userTrips")) as any[] | undefined) ?? [];
        selectedTrip = trips.find((t) => String(t?.id) === String(selectedTripId));
        if (selectedTrip) {
          await state.update({ selectedTrip });
        }
      }

      console.log("[startFlow] selectedTrip:", selectedTrip);

      const header = fullName ? `Hola ${fullName},` : "Hola,";
      const tripInfo = selectedTrip
        ? [
            "",
            "✅ *Solicitud seleccionada:*",
            `• Destino: ${selectedTrip?.destinationCity ?? "-"}`,
            `• Motivo: ${selectedTrip?.reasonTrip ?? "-"}`,
            `• Fechas: ${toDate(selectedTrip?.departure)} → ${toDate(selectedTrip?.return)}`
          ].join("\n")
        : selectedTripId
        ? `\n✅ *Solicitud seleccionada:* #${selectedTripId}`
        : "";

      const composed = [header, tripInfo, "", ...START_FLOW].join("\n");
      await flowDynamic([{ body: composed }]);

      await setBotDataInit(context, state);
      await state.update({ __currentFlow: "start" });
    } catch (error) {
      console.error("[startFlow] Error:", error);
    }
  }
);

/**
 * Flow que lista las solicitudes activas y pasa al router de espera.
 * (NO envía prompt aquí para no disparar validación de inmediato)
 */
const tripSelectFlow = addKeyword<Provider, Database>(EVENTS.ACTION)
  .addAction(async (_context, { state, flowDynamic, gotoFlow }) => {
    try {
      // Limpiar selección previa de viaje antes de mostrar la lista
      await state.update({
        selectedTrip: undefined,
        selectedTripId: undefined,
        __currentFlow: undefined,
        __awaitingTripSelect: false
      });

      console.log("[tripSelectFlow] >>> Entramos al flow de selección de viaje.");
      await flowDynamic([{ body: "🔎 Consultando tus solicitudes activas..." }]);

      const authUser = (await state.get("authUser")) as any | undefined;
      console.log("[tripSelectFlow] authUser:", authUser);
      // Implementación original (correcta) para obtener la cédula del usuario autenticado:
      const cedula = String(
        (authUser && (authUser.document || authUser.cedula)) ||
          (await state.get("document")) ||
          ""
      ).trim();
      // ===== MODO PRUEBAS =====
      // const cedula = "24682468"; 
      // ==================================================================
      if (!cedula) {
        await flowDynamic("No pude identificar tu usuario luego del inicio de sesión. Intenta nuevamente.");
        return;
      }

      const tripsResp = await fetchUserTrips(cedula);
      console.log("[tripSelectFlow] Respuesta fetchUserTrips:", tripsResp);
      if (!tripsResp?.ok) {
        await flowDynamic("No pude obtener tus solicitudes de viaje en este momento. Intenta nuevamente.");
        return;
      }

      const data = tripsResp.data ?? {};
      const rawSolicitudes = Array.isArray(data?.solicitudes) ? data.solicitudes : [];
      const activeTrips = mapSolicitudesToTrips(rawSolicitudes);

      if (!activeTrips.length) {
        await flowDynamic("No encontré solicitudes de viaje *activas* asociadas a tu usuario.");
        // Limpiar selección y usuario para forzar autenticación en el siguiente ciclo
        await state.update({
          selectedTrip: undefined,
          selectedTripId: undefined,
          __currentFlow: undefined,
          __awaitingTripSelect: false,
          authUser: undefined
        });
        return gotoFlow(authFlow);
      }

      await state.update({
        userTrips: activeTrips,
        selectedUserId: authUser?.id,
        __awaitingTripSelect: true,
        __currentFlow: "tripSelectWait",
      });

      // Enviar SOLO la lista aquí. El prompt se envía en el router (con capture).
      await flowDynamic([{ body: buildTripsMessage(activeTrips) }]);

      return gotoFlow(tripSelectWaitFlow);
    } catch (error) {
      console.error("[tripSelectFlow] Error listando viajes:", error);
      await flowDynamic("Ocurrió un error listando tus solicitudes de viaje. Por favor, intenta de nuevo.");
    }
  });

/**
 * Router que ESPERA el siguiente mensaje del usuario y procesa la selección.
 * Usamos addAnswer(..., { capture:true }) para que no se ejecute hasta que el usuario responda.
 */
const tripSelectWaitFlow = addKeyword<Provider, Database>(EVENTS.ACTION)
  .addAnswer(
    "✍️ Responde con el *número* de la lista que deseas legalizar.",
    { capture: true },
    async (context, { state, flowDynamic, gotoFlow }) => {
      const body = (context.body || "").trim();
      console.log("[tripSelectWaitFlow] Mensaje capturado:", body);

      const awaiting = !!(await state.get("__awaitingTripSelect"));
      if (!awaiting) {
        console.log("[tripSelectWaitFlow] No estamos esperando selección. Ignoro.");
        return;
      }

      const trips = (await state.get("userTrips")) as any[] | undefined;
      if (!trips || !trips.length) {
        await flowDynamic("No hay solicitudes disponibles en este momento.");
        await state.update({ __awaitingTripSelect: false, __currentFlow: undefined });
        return;
      }

      if (!/^\d+$/.test(body)) {
        await flowDynamic("Por favor, responde con un número válido (1, 2, 3…).");
        await flowDynamic([{ body: buildTripsMessage(trips) }]);
        return;
      }

      const index = Number(body) - 1;
      if (index < 0 || index >= trips.length) {
        await flowDynamic(`Número inválido. Debe estar entre *1* y *${trips.length}*.`);
        await flowDynamic([{ body: buildTripsMessage(trips) }]);
        return;
      }

      const chosen = trips[index];
      const userId = (await state.get("selectedUserId")) as number | string | undefined;

      await state.update({
        selectedTripId: (chosen?.id as string) || undefined,
        selectedTrip: chosen,
        selectedUserId: userId,
        __awaitingTripSelect: false,
        __currentFlow: "start",
      });

      // const summary = [
      //   "🧾 *Solicitud seleccionada:*",
      //   `• Destino: ${chosen?.destinationCity ?? "-"}`,
      //   `• Motivo: ${chosen?.reasonTrip ?? "-"}`,
      //   `• Fechas: ${toDate(chosen?.departure)} → ${toDate(chosen?.return)}`,
      //   "",
      //   "Perfecto, continuemos con el proceso de legalización…",
      // ].join("\n");

      // await flowDynamic([{ body: summary }]);
      return gotoFlow(startFlow);
    }
  );

/**
 * Flow de autenticación con guards.
 */
const authFlow = addKeyword<Provider, Database>(EVENTS.WELCOME)
  .addAction(async (_context, { state, gotoFlow }) => {
    const awaitingTrip = !!(await state.get("__awaitingTripSelect"));
    const currentFlow = (await state.get("__currentFlow")) as string | undefined;
  const authed = !!(await state.get("authUser"));
  const selectedId = (await state.get("selectedTripId")) as string | number | undefined;

    // Si el usuario está autenticado pero NO tiene viaje seleccionado, ir a tripSelectFlow
    if (authed && !selectedId) {
      return gotoFlow(tripSelectFlow);
    }
    // Si está esperando selección, ir al router de espera
    if (awaitingTrip || currentFlow === "tripSelectWait") {
      return gotoFlow(tripSelectWaitFlow);
    }
    // Si está autenticado y ya tiene viaje seleccionado, ir a startFlow
    if (authed && selectedId) {
      return gotoFlow(startFlow);
    }
  })
  .addAnswer(
    AUTH_FLOW.WELCOME_AUTH,
    { capture: true },
    async (context, { state, flowDynamic, gotoFlow }) => {
      const document = (context.body ?? "").trim();
      if (!/^\d+$/.test(document)) {
        await flowDynamic(AUTH_FLOW.INVALID_DOCUMENT);
        return;
      }

      const rawFrom = context.from || "";
      const phone = (rawFrom || "").replace(/\D/g, "").slice(-10);

      try {
        await state.update({ document });
        const result = await loginBot(document, phone);
        const { ok, data } = result || {};
        if (!ok) {
          await flowDynamic("No pudimos validar tus datos en este momento. Intenta nuevamente.");
          return;
        }

        if (data && typeof data.code === "number" && data.code === 1) {
          await flowDynamic(data.message || "El celular no coincide.");
          return;
        }

        const userPayload = data?.data && data?.status === 200 ? data.data : data;
        if (!userPayload || !userPayload.id || !userPayload.document) {
          await flowDynamic("No pudimos validar tus datos en este momento. Intenta nuevamente.");
          return;
        }

        await state.update({
          authUser: userPayload,
          __awaitingTripSelect: false,
          __currentFlow: "tripSelect",
        });
        return gotoFlow(tripSelectFlow);
      } catch (error: any) {
        await flowDynamic("Ocurrió un error validando tu información. Intenta nuevamente.");
      }
    }
  );

export { authFlow, startFlow, tripSelectFlow, tripSelectWaitFlow };

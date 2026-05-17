type Ship = {
  mmsi: number;
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
};

const API_KEY = "d6e88660749521c57d894b4b8df17ff391f4ac6f";
const WS_URL = "wss://stream.aisstream.io/v0/stream";
const ADRIATIC_BBOX = [[[39.5, 12.0], [45.8, 20.5]]];

const RECONNECT_DELAYS = [3000, 5000, 10000, 20000, 30000]; // exponential-ish backoff

let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempts = 0;
let destroyed = false; // флаг — не reconnectuvaj ako e namerno zatvoreno

function scheduleReconnect(onShipUpdate: (ship: Ship) => void) {
  if (destroyed) return;
  if (reconnectAttempts >= RECONNECT_DELAYS.length) {
    console.warn("AIS: max reconnect attempts reached, giving up.");
    return;
  }

  const delay = RECONNECT_DELAYS[reconnectAttempts];
  reconnectAttempts++;
  console.log(`AIS: reconnecting in ${delay / 1000}s (attempt ${reconnectAttempts})...`);

  reconnectTimer = setTimeout(() => {
    if (!destroyed) connectAISStream(onShipUpdate);
  }, delay);
}

export function disconnectAISStream() {
  destroyed = true;
  reconnectAttempts = 0;

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  if (socket) {
    // Затвори тивко — не триgeruvaj onclose reconnect
    socket.onclose = null;
    socket.onerror = null;
    socket.close();
    socket = null;
  }
}

export function connectAISStream(onShipUpdate: (ship: Ship) => void) {
  destroyed = false;

  if (socket) return;

  console.log("🔌 Connecting to AIS stream...");
  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    reconnectAttempts = 0;
    console.log("✅ AIS connected");
    socket?.send(
      JSON.stringify({
        APIKey: API_KEY,
        BoundingBoxes: ADRIATIC_BBOX,
        FilterMessageTypes: [
          "PositionReport",
          "StandardClassBPositionReport",
        ],
      })
    );
  };

  socket.onmessage = async (event: MessageEvent) => {
    try {
      let raw: string;
      if (typeof event.data === "string") {
        raw = event.data;
      } else if (event.data instanceof Blob) {
        raw = await event.data.text();
      } else {
        return;
      }

      const data = JSON.parse(raw);

      const position =
        data?.Message?.PositionReport ??
        data?.Message?.StandardClassBPositionReport;

      if (!position) return;

      const {
        Latitude: latitude,
        Longitude: longitude,
        Cog: heading,
        Sog: speed,
      } = position;

      if (latitude == null || longitude == null) return;

      const mmsi = data?.MetaData?.MMSI;
      if (!mmsi) return;

      onShipUpdate({
        mmsi,
        latitude,
        longitude,
        heading: heading ?? 0,
        speed: speed ?? 0,
      });
    } catch (e) {
      // Тивко — parse грешки не се критични
    }
  };

  socket.onerror = () => {
    // НЕ логирај event директно — { isTrusted: true } е бескорисно
    // Грешката ќе се обработи во onclose
    console.warn("AIS: connection error, waiting for close event...");
  };

  socket.onclose = (e) => {
    socket = null;

    if (destroyed) return; // намерно затворено, не reconnectuvaj

    // Код 1000 = нормално затворање, 1001 = browser/tab одење
    if (e.code === 1000 || e.code === 1001) {
      console.log("AIS: connection closed normally.");
      return;
    }

    console.warn(`AIS: closed (code ${e.code}) — scheduling reconnect...`);
    scheduleReconnect(onShipUpdate);
  };
}
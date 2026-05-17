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

let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempts = 0;

function scheduleReconnect(onShipUpdate: (ship: Ship) => void) {
  if (reconnectTimer) return;

  reconnectAttempts++;
  const delay = Math.min(3000 * Math.pow(2, reconnectAttempts - 1), 30000);
  console.log(`⏳ AIS reconnecting in ${delay / 1000}s (attempt ${reconnectAttempts})`);

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    socket = null;
    connectAISStream(onShipUpdate);
  }, delay);
}

export function disconnectAISStream() {
  reconnectAttempts = 0;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  socket?.close();
  socket = null;
}

export function connectAISStream(onShipUpdate: (ship: Ship) => void) {
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
      // Fix: event.data is a string in browser/RN, not a Blob
      let raw: string;
      if (typeof event.data === "string") {
        raw = event.data;
      } else if (event.data instanceof Blob) {
        raw = await event.data.text();
      } else {
        console.warn("AIS: unexpected data type", typeof event.data);
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
      console.warn("AIS parse error:", e);
    }
  };

  socket.onerror = (e) => {
    console.error("AIS socket error:", e);
    socket?.close();
  };

  socket.onclose = (e) => {
    console.warn(`AIS closed — code: ${e.code}, reason: ${e.reason}`);
    socket = null;
    scheduleReconnect(onShipUpdate);
  };
}
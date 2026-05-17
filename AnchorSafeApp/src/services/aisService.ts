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

function scheduleReconnect(onShipUpdate: (ship: Ship) => void) {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    socket = null;
    connectAISStream(onShipUpdate);
  }, 3000);
}

export function connectAISStream(onShipUpdate: (ship: Ship) => void) {
  if (socket) return;

  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    socket?.send(JSON.stringify({
      APIKey: API_KEY,
      BoundingBoxes: ADRIATIC_BBOX,
      FilterMessageTypes: ["PositionReport", "StandardClassBPositionReport"],
    }));
  };

  socket.onmessage = async (event: MessageEvent) => {
    try {
      const data = JSON.parse(await event.data.text());
      const position =
        data?.Message?.PositionReport ??
        data?.Message?.StandardClassBPositionReport;

      if (!position) return;

      const { Latitude: latitude, Longitude: longitude, Cog: heading, Sog: speed } = position;

      if (!latitude || !longitude) return;

      onShipUpdate({
        mmsi: data?.MetaData?.MMSI,
        latitude,
        longitude,
        heading: heading ?? 0,
        speed: speed ?? 0,
      });
    } catch {
    }
  };

  socket.onerror = () => {
    socket?.close();
  };

  socket.onclose = () => {
    socket = null;
    scheduleReconnect(onShipUpdate);
  };
}

export function disconnectAISStream() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  socket?.close();
  socket = null;
}
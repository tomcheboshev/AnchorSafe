import React, { useState, useEffect } from 'react';
import { loadCachedShips, upsertShip } from '../services/shipCacheService';

import {
  fetchRestrictedZones,
} from "../services/marineZoneService";

import {
  uploadZonesToFirestore,
  loadZonesFromFirestore,
} from "../services/zoneService";

import { Ionicons } from "@expo/vector-icons";
import BottomNav from "../components/ui/BottomNav";
import { connectAISStream, disconnectAISStream } from "../services/aisService";
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Animated, Platform,
} from 'react-native';

const IS_WEB = Platform.OS === 'web';

const C = {
  primary: '#1A6FA8',
  white: '#FFF',
  safe: '#34C759',
  danger: '#FF3B30',
  caution: '#FFCC00',
  text: '#0D1B2A',
  sub: '#6B7C93',
  sos: '#FF3B30',
};

const zoneColor = (type: string) =>
  type === 'safe' ? C.safe : type === 'danger' ? C.danger : C.caution;

// ─── Leaflet Map ──────────────────────────────────────────────────────────────

function LeafletMap({
  selectedZoneId,
  onZonePress,
  zones,
  iframeRef,
}: {
  selectedZoneId: string;
  onZonePress: (id: string) => void;
  zones: any[];
  iframeRef: any;
}) {

  useEffect(() => {
    if (!IS_WEB) return;
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'zonePress') onZonePress(e.data.id);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onZonePress]);

  useEffect(() => {
    if (!IS_WEB || !iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage({ type: 'selectZone', id: selectedZoneId }, '*');
  }, [selectedZoneId]);

  // Re-send zones to iframe whenever they change (after Firestore load)
  useEffect(() => {
    if (!IS_WEB || !iframeRef.current?.contentWindow || zones.length === 0) return;
    iframeRef.current.contentWindow.postMessage({ type: 'loadZones', zones: zones.map((z: any) => ({ id: z.id, coords: z.coords, color: z.color })) }, '*');
  }, [zones]);

  const html = React.useMemo(() => `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
<style>*{margin:0;padding:0}html,body,#map{width:100%;height:100%}</style>
</head><body><div id="map"></div><script>
var map = L.map('map', { center:[45.549,13.7276], zoom:14, zoomControl:false, attributionControl:false });
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom:19 }).addTo(map);

var polys = {};
var selectedId = '';
var shipMarkers = {};

function loadZones(zones) {
  Object.values(polys).forEach(function(p) { map.removeLayer(p); });
  polys = {};
  zones.forEach(function(z) {
    var poly = L.polygon(z.coords, { color:z.color, fillColor:z.color, fillOpacity:0.22, weight:2, opacity:0.65 }).addTo(map);
    poly.on('click', function() { window.parent.postMessage({ type:'zonePress', id:z.id }, '*'); });
    polys[z.id] = poly;
  });
}

var userIcon = L.divIcon({
  html: '<div style="width:14px;height:14px;background:#1A6FA8;border-radius:50%;border:3px solid white;box-shadow:0 0 0 3px rgba(26,111,168,0.3);"></div>',
  iconSize: [14,14], iconAnchor: [7,7], className: ''
});
L.marker([45.549, 13.7276], { icon: userIcon }).addTo(map);

function makeShipIcon(heading) {
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">'
    + '<g transform="rotate(' + (heading || 0) + ',14,14)">'
    + '<polygon points="14,2 20,22 14,18 8,22" fill="#1A6FA8" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>'
    + '</g></svg>';
  return L.divIcon({
    html: '<div style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4));">' + svg + '</div>',
    iconSize: [28,28], iconAnchor: [14,14], className: ''
  });
}

function makePopup(s) {
  return '<div style="font-family:sans-serif;min-width:160px;padding:4px 0;">'
    + '<b style="color:#1A6FA8;font-size:13px;">MMSI: ' + s.mmsi + '</b><br/>'
    + '<span style="color:#555;font-size:12px;">Speed: ' + s.speed.toFixed(1) + ' kn &nbsp;|&nbsp; HDG: ' + s.heading + '°</span>'
    + '</div>';
}

window.addEventListener('message', function(e) {
  var msg = e.data;
  if (!msg) return;

  if (msg.type === 'loadZones') {
    loadZones(msg.zones);
  }

  if (msg.type === 'shipUpdate') {
    var s = msg.ship;
    if (shipMarkers[s.mmsi]) {
      shipMarkers[s.mmsi].setLatLng([s.latitude, s.longitude]);
      shipMarkers[s.mmsi].setIcon(makeShipIcon(s.heading));
    } else {
      shipMarkers[s.mmsi] = L.marker([s.latitude, s.longitude], { icon: makeShipIcon(s.heading) })
        .addTo(map)
        .bindPopup(makePopup(s));
    }
  }

if (msg.type === 'flyTo') {

  map.flyTo(
    [msg.lat, msg.lng],
    14,
    {
      duration: 2,
    }
  );
}

if (msg.type === 'selectZone') {

  if (polys[selectedId]) {
    polys[selectedId].setStyle({
      weight: 2,
      opacity: 0.65
    });
  }

  selectedId = msg.id;

  if (polys[selectedId]) {
    polys[selectedId].setStyle({
      weight: 3,
      opacity: 1
    });
  }
}
});
<\/script></body></html>`, []);

  if (!IS_WEB) return null;
  return (
    <iframe
      ref={iframeRef}
      srcDoc={html}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' } as any}
      sandbox="allow-scripts"
    />
  );
}

// ─── Atoms ────────────────────────────────────────────────────────────────────

function ZoneIcon({ type }: { type: string }) {
  const bg = zoneColor(type);
  return (
    <View style={[s.zoneIconWrap, { backgroundColor: bg + '22' }]}>
      <View style={[s.zoneIconInner, { backgroundColor: bg }]}>
        <Text style={s.zoneIconText}>{type === 'safe' ? '✓' : type === 'danger' ? '!' : '~'}</Text>
      </View>
    </View>
  );
}

function Chip({ icon, value }: { icon: string; value: string }) {
  return (
    <View style={s.chip}>
      <Text style={s.chipIcon}>{icon}</Text>
      <Text style={s.chipVal}>{value}</Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MapScreen({ setActiveScreen }: any) {
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState(false);

    const iframeRef =
  React.useRef<HTMLIFrameElement>(
    null
  );

  const [zones, setZones] = useState<any[]>([]);


  const filteredZones =
  zones.filter((z: any) =>
    z.name
      ?.toLowerCase()
      .includes(
        search.toLowerCase()
      )
  );



  const [selectedId, setSelectedId] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  const cardAnim = React.useRef(new Animated.Value(0)).current;
  const sosAnim = React.useRef(new Animated.Value(1)).current;

  const zone = zones.find((z: any) => z.id === selectedId) ?? zones[0];
  const zc = zone ? zoneColor(zone.type) : C.primary;

  // Load zones from Firestore only
// Load zones — прво од Firestore, API само ако е празно
  useEffect(() => {
    async function loadZones() {
      try {
        setLoading(true);

        // Чекај прво Firestore (брзо)
        const cached = await loadZonesFromFirestore();

        if (cached.length > 0) {
          // Имаме кеш — прикажи веднаш
          // НЕ правиме background refresh — тоа повикуваше fetchRestrictedZones()
          // кое праќаше 100+ барања до open-meteo одеднаш → 429
          setZones(cached);
          setSelectedId(cached[0].id);
          setLoading(false);
        } else {
          // Прв пат — нема кеш, мора да земе од API
          const apiZones = await fetchRestrictedZones();
          await uploadZonesToFirestore(apiZones);
          const firestoreZones = await loadZonesFromFirestore();
          setZones(firestoreZones);
          if (firestoreZones.length > 0) {
            setSelectedId(firestoreZones[0].id);
          }
          setLoading(false);
        }
      } catch (error) {
        console.log("Zones Error:", error);
        setLoading(false);
      }
    }

    loadZones();
  }, []);

  // AIS ship stream
  useEffect(() => {
    // Cached ships работи на сите платформи
    loadCachedShips().then((cached) => {
      if (IS_WEB) {
        const iframe = document.querySelector('iframe') as HTMLIFrameElement;
        cached.forEach((ship) => {
          iframe?.contentWindow?.postMessage({ type: 'shipUpdate', ship }, '*');
        });
      }
    });
 
    // AIS WebSocket не работи од браузер (CORS/firewall блокада)
    // Само на React Native (мобилен)
    if (IS_WEB) return;
 
    connectAISStream((ship) => {
      upsertShip(ship);
    });
 
    return () => disconnectAISStream();
  }, []); 

  // SOS pulse animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(sosAnim, { toValue: 1.1, duration: 850, useNativeDriver: false }),
        Animated.timing(sosAnim, { toValue: 1, duration: 850, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  // Card expand animation
  useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: expanded ? 1 : 0,
      useNativeDriver: false,
      tension: 55,
      friction: 10,
    }).start();
  }, [expanded]);

  const cardH = cardAnim.interpolate({ inputRange: [0, 1], outputRange: [96, 228] });

const selectZone = (
  id: string
) => {

  setSelectedId(id);

  const zone =
    zones.find(
      (z: any) => z.id === id
    );

  if (!zone) return;

  const coords =
    zone.coords;

  if (!coords?.length) return;

  const centerLat =
    coords.reduce(
      (
        sum: number,
        c: number[]
      ) => sum + c[0],
      0
    ) / coords.length;

  const centerLng =
    coords.reduce(
      (
        sum: number,
        c: number[]
      ) => sum + c[1],
      0
    ) / coords.length;

  iframeRef.current
  ?.contentWindow
  ?.postMessage(
    {
      type: "flyTo",
      lat: centerLat,
      lng: centerLng,
    },
    "*"
  );
};


  return (
    <View style={s.root}>
<LeafletMap
  selectedZoneId={selectedId}
  onZonePress={selectZone}
  zones={zones}
  iframeRef={iframeRef}
/>

      <View style={s.header}>
        <View style={s.headerRow}>
          <View style={s.headerLeft}>
            <Ionicons name="boat-outline" size={32} color={C.primary} />
            <Text style={s.headerTitle}>AnchorSafe</Text>
          </View>
        </View>
        <View style={s.searchWrap}>
          <View style={[s.searchBar, focused && s.searchFocused]}>
            <Ionicons name="search" size={18} color={C.sub} />
<TextInput
  style={s.searchInput}
  placeholder="Search zones, ports, or marinas"
  placeholderTextColor={C.sub}
  value={search}
  onChangeText={setSearch}

  onSubmitEditing={() => {

    if (
      filteredZones.length > 0
    ) {

      selectZone(
        filteredZones[0].id
      );
    }

  }}

  onFocus={() => setFocused(true)}
  onBlur={() => setFocused(false)}
/>
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Text style={{ color: C.sub, fontSize: 13 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <Animated.View style={[s.sosWrap, { transform: [{ scale: sosAnim }] }]}>
        <TouchableOpacity style={s.sosBtn} activeOpacity={0.85}>
          <View style={s.sosBadge}>
            <Text style={s.sosBadgeTxt}>SOS</Text>
          </View>
          <Ionicons name="warning" size={24} color={C.white} />
        </TouchableOpacity>
      </Animated.View>

      {loading ? (
        <View style={s.loadingWrap}>
          <Text style={s.loadingTxt}>Loading zones…</Text>
        </View>
      ) : zone ? (
        <View style={s.bottom}>
          <TouchableOpacity activeOpacity={0.97} onPress={() => setExpanded(v => !v)}>
            <Animated.View style={[s.card, { minHeight: cardH }]}>
              <View style={s.cardRow}>
                <ZoneIcon type={zone.type} />
                <View style={{ flex: 1 }}>
                  <Text style={s.cardTitle}>
                    {zone.type === 'safe' ? 'Safe Zone' : zone.type === 'danger' ? 'Danger Zone' : 'Caution Zone'}: {zone.name}
                  </Text>
                  <Text style={s.cardSub}>{zone.subtitle}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <Chip icon="🌡" value={zone.temp} />
                  <Chip icon="💨" value={zone.wind} />
                </View>
              </View>

              {expanded && (
                <View style={{ marginTop: 12 }}>
                  <View style={[s.divider, { backgroundColor: zc + '44' }]} />
                  <View style={s.stats}>
                    {[
                      { label: 'Status', val: zone.type.toUpperCase(), badge: true },
                      { label: 'Temp', val: zone.temp + 'C' },
                      { label: 'Wind', val: zone.wind },
                      { label: 'Bed', val: zone.subtitle.split(' • ')[0] },
                    ].map((st, i) => (
                      <View key={i} style={s.statItem}>
                        <Text style={s.statLabel}>{st.label}</Text>
                        {st.badge ? (
                          <View style={[s.statBadge, { backgroundColor: zc + '22' }]}>
                            <Text style={[s.statBadgeTxt, { color: zc }]}>{st.val}</Text>
                          </View>
                        ) : (
                          <Text style={s.statVal}>{st.val}</Text>
                        )}
                      </View>
                    ))}
                  </View>
                  <View style={s.actions}>
                    <TouchableOpacity style={[s.actionBtn, { backgroundColor: zc }]}>
                      <Text style={s.actionBtnTxt}>Set Anchor Here</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.actionOutline, { borderColor: C.primary }]}>
                      <Text style={[s.actionOutlineTxt, { color: C.primary }]}>View Details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              <View style={s.pill} />
            </Animated.View>
          </TouchableOpacity>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 8 }}
            contentContainerStyle={{ paddingHorizontal: 14, gap: 8 }}
          >
            {filteredZones.map((z: any) => {
              const active = z.id === selectedId;
              const col = zoneColor(z.type);
              return (
                <TouchableOpacity
                  key={z.id}
                  style={[s.zonePill, active && { backgroundColor: col, borderColor: col }]}
                  onPress={() => selectZone(z.id)}
                >
                  <View style={[s.zoneDot, { backgroundColor: active ? '#fff' : col }]} />
                  <Text style={[s.zonePillTxt, { color: active ? '#fff' : C.text }]}>{z.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      <BottomNav activeTab="map" setActiveScreen={setActiveScreen} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a1628' },

  header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: 'rgba(236,241,247,0.96)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: C.primary },
  searchWrap: { paddingHorizontal: 16, paddingBottom: 12, backgroundColor: 'rgba(236,241,247,0.96)' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.88)', borderRadius: 16,
    paddingHorizontal: 14, height: 46,
    borderWidth: 1.5, borderColor: 'transparent',
    boxShadow: '0px 2px 8px rgba(0,0,0,0.10)',
    elevation: 4,
  },
  searchFocused: {  backgroundColor: '#fff' },
  searchInput: { flex: 1, fontSize: 15, color: C.text },

  sosWrap: { position: 'absolute', right: 16, bottom: 220, zIndex: 20 },
  sosBtn: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: C.sos,
    justifyContent: 'center', alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(255,59,48,0.5)',
    elevation: 10,
  },
  sosBadge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: '#fff', borderRadius: 8,
    paddingHorizontal: 5, paddingVertical: 2,
    borderWidth: 1.5, borderColor: C.sos,
  },
  sosBadgeTxt: { fontSize: 9, fontWeight: '800', color: C.sos, letterSpacing: 0.5 },

  loadingWrap: {
    position: 'absolute', bottom: 120, left: 0, right: 0,
    alignItems: 'center', zIndex: 10,
  },
  loadingTxt: {
    color: '#fff', fontSize: 14, fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 16,
    paddingVertical: 8, borderRadius: 20,
  },

  bottom: { position: 'absolute', bottom: 76, left: 0, right: 0, zIndex: 10 },
  card: {
    marginHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 20, paddingTop: 16, paddingHorizontal: 16, paddingBottom: 16,
    boxShadow: '0px -2px 16px rgba(0,0,0,0.12)',
    elevation: 12,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: C.text, letterSpacing: -0.2 },
  cardSub: { fontSize: 12, color: C.sub, marginTop: 2 },
  pill: { width: 36, height: 4, backgroundColor: 'rgba(0,0,0,0.12)', borderRadius: 2, alignSelf: 'center', marginTop: 14 },

  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(26,111,168,0.08)', borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 5,
  },
  chipIcon: { fontSize: 12 },
  chipVal: { fontSize: 12, fontWeight: '700', color: C.primary },

  zoneIconWrap: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  zoneIconInner: { width: 28, height: 28, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  zoneIconText: { fontSize: 14, fontWeight: '800', color: '#fff' },

  divider: { height: 1, marginBottom: 14, borderRadius: 1 },
  stats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statItem: { alignItems: 'center', gap: 4 },
  statLabel: { fontSize: 10, color: C.sub, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  statVal: { fontSize: 14, fontWeight: '700', color: C.text },
  statBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  statBadgeTxt: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  actionBtnTxt: { fontSize: 14, fontWeight: '700', color: '#fff' },
  actionOutline: { flex: 1, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },
  actionOutlineTxt: { fontSize: 14, fontWeight: '700' },

  zonePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.08)',
  },
  zoneDot: { width: 7, height: 7, borderRadius: 4 },
  zonePillTxt: { fontSize: 13, fontWeight: '600' },
});
import React, { useState, useEffect } from 'react';
import BottomNav from "../components/ui/BottomNav";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const IS_WEB = Platform.OS === 'web';

// ─── Data ─────────────────────────────────────────────────────────────────────

const ZONES = [
  {
    id: 'z1',
    name: 'Blue Lagoon',
    type: 'safe',
    subtitle: 'Sandy Bed • 12.5m Depth',
    temp: '24°',
    wind: '8kt',
    color: '#34C759',
    fillColor: 'rgba(52,199,89,0.25)',
    coords: [
      [35.884, 14.336], [35.891, 14.338], [35.893, 14.347],
      [35.887, 14.352], [35.882, 14.345],
    ],
  },
  {
    id: 'z2',
    name: 'Rocky Shoals',
    type: 'danger',
    subtitle: 'Rock Bed • 2.1m Depth',
    temp: '22°',
    wind: '14kt',
    color: '#FF3B30',
    fillColor: 'rgba(255,59,48,0.22)',
    coords: [
      [35.889, 14.348], [35.893, 14.350], [35.895, 14.358],
      [35.891, 14.362], [35.886, 14.354],
    ],
  },
  {
    id: 'z3',
    name: 'South Cove',
    type: 'caution',
    subtitle: 'Mixed Bed • 6.8m Depth',
    temp: '23°',
    wind: '11kt',
    color: '#FFCC00',
    fillColor: 'rgba(255,204,0,0.22)',
    coords: [
      [35.881, 14.351], [35.885, 14.355], [35.887, 14.363],
      [35.882, 14.368], [35.878, 14.360],
    ],
  },
];

const C = {
  primary: '#1A6FA8',
  safe: '#34C759',
  danger: '#FF3B30',
  caution: '#FFCC00',
  text: '#0D1B2A',
  sub: '#6B7C93',
  sos: '#FF3B30',
};

// ─── Leaflet Map via iframe (Web only) ───────────────────────────────────────

function LeafletMap({ selectedZoneId, onZonePress }: {
  selectedZoneId: string;
  onZonePress: (id: string) => void;
}) {
  useEffect(() => {
    if (!IS_WEB) return;
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'zonePress') onZonePress(e.data.id);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onZonePress]);

  const zonesJson = JSON.stringify(
    ZONES.map(z => ({ id: z.id, coords: z.coords, color: z.color }))
  );

  const html = `<!DOCTYPE html><html><head>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"/>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
  <style>*{margin:0;padding:0}html,body,#map{width:100%;height:100%}</style>
  </head><body><div id="map"></div><script>
  var map=L.map('map',{center:[35.887,14.350],zoom:14,zoomControl:false,attributionControl:false});
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:19}).addTo(map);
  var zones=${zonesJson};
  var selected='${selectedZoneId}';
  zones.forEach(function(z){
    var poly=L.polygon(z.coords,{color:z.color,fillColor:z.color,fillOpacity:0.22,weight:selected===z.id?3:2,opacity:selected===z.id?1:0.65}).addTo(map);
    poly.on('click',function(){window.parent.postMessage({type:'zonePress',id:z.id},'*');});
  });
  var ai=L.divIcon({html:'<div style="background:rgba(255,255,255,0.95);border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 3px 8px rgba(0,0,0,0.25);">⚓</div>',iconSize:[36,36],iconAnchor:[18,18],className:''});
  L.marker([35.889,14.343],{icon:ai}).addTo(map);
  L.marker([35.892,14.355],{icon:ai}).addTo(map);
  var ui=L.divIcon({html:'<div style="width:14px;height:14px;background:#1A6FA8;border-radius:50%;border:3px solid white;box-shadow:0 0 0 3px rgba(26,111,168,0.3);"></div>',iconSize:[14,14],iconAnchor:[7,7],className:''});
  L.marker([35.883,14.341],{icon:ui}).addTo(map);
  </script></body></html>`;

  if (!IS_WEB) return null;
  return (
    <iframe
      srcDoc={html}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' } as any}
      sandbox="allow-scripts allow-same-origin"
    />
  );
}

// ─── UI Atoms ─────────────────────────────────────────────────────────────────

function ZoneIcon({ type }: { type: string }) {
  const bg = type === 'safe' ? C.safe : type === 'danger' ? C.danger : C.caution;
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

export default function MapScreen({
  setActiveScreen,
}: any) {
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState(false);
  const [activeTab, setActiveTab] = useState('map');
  const [selectedId, setSelectedId] = useState('z1');
  const [expanded, setExpanded] = useState(false);

  const cardAnim = React.useRef(new Animated.Value(0)).current;
  const sosAnim = React.useRef(new Animated.Value(1)).current;

  const zone = ZONES.find(z => z.id === selectedId) ?? ZONES[0];
  const zc = zone.type === 'safe' ? C.safe : zone.type === 'danger' ? C.danger : C.caution;

  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(sosAnim, { toValue: 1.1, duration: 850, useNativeDriver: true }),
        Animated.timing(sosAnim, { toValue: 1, duration: 850, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: expanded ? 1 : 0,
      useNativeDriver: false,
      tension: 55, friction: 10,
    }).start();
  }, [expanded]);

  const cardH = cardAnim.interpolate({ inputRange: [0, 1], outputRange: [96, 228] });

  const TABS = [
    { key: 'map', label: 'Map', icon: '🗺' },
    { key: 'zones', label: 'Zones', icon: '⬡' },
    { key: 'alerts', label: 'Alerts', icon: '🔔' },
    { key: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <View style={s.root}>
      {/* MAP */}
      <LeafletMap
        selectedZoneId={selectedId}
        onZonePress={id => { setSelectedId(id); setExpanded(false); }}
      />

      {/* HEADER */}
      <View style={s.header}>
        <View style={s.headerRow}>
          <View style={s.headerLeft}>
            <Text style={s.headerAnchor}>⚓</Text>
            <Text style={s.headerTitle}>AnchorSafe</Text>
          </View>
          <TouchableOpacity style={s.headerBtn}>
            <Text style={{ fontSize: 17 }}>🔍</Text>
          </TouchableOpacity>
        </View>
        <View style={s.searchWrap}>
          <View style={[s.searchBar, focused && s.searchFocused]}>
            <Text style={{ fontSize: 14, color: C.sub }}>🔍</Text>
            <TextInput
              style={s.searchInput}
              placeholder="Search zones, ports, or marinas"
              placeholderTextColor={C.sub}
              value={search}
              onChangeText={setSearch}
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

      {/* MAP CONTROLS */}
      <View style={s.mapControls}>
        {['◎', '＋', '－'].map((icon, i) => (
          <TouchableOpacity key={i} style={s.mapBtn}>
            <Text style={s.mapBtnTxt}>{icon}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* SOS */}
      <Animated.View style={[s.sosWrap, { transform: [{ scale: sosAnim }] }]}>
        <TouchableOpacity style={s.sosBtn} activeOpacity={0.85}>
          <View style={s.sosBadge}>
            <Text style={s.sosBadgeTxt}>SOS</Text>
          </View>
          <Text style={{ fontSize: 24, color: '#fff' }}>⚓</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* BOTTOM */}
      <View style={s.bottom}>
        {/* Zone Card */}
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

        {/* Zone Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 8 }}
          contentContainerStyle={{ paddingHorizontal: 14, gap: 8 }}
        >
          {ZONES.map(z => {
            const active = z.id === selectedId;
            const col = z.type === 'safe' ? C.safe : z.type === 'danger' ? C.danger : C.caution;
            return (
              <TouchableOpacity
                key={z.id}
                style={[s.zonePill, active && { backgroundColor: col, borderColor: col }]}
                onPress={() => { setSelectedId(z.id); setExpanded(false); }}
              >
                <View style={[s.zoneDot, { backgroundColor: active ? '#fff' : col }]} />
                <Text style={[s.zonePillTxt, { color: active ? '#fff' : C.text }]}>{z.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* TAB BAR */}

          <BottomNav
            activeTab="map"
            setActiveScreen={setActiveScreen}
            />

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a1628' },

  header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 50, paddingBottom: 10,
    backgroundColor: 'rgba(236,241,247,0.96)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerAnchor: { fontSize: 20, color: C.primary },
  headerTitle: {
    fontSize: 22, fontWeight: '700', color: C.primary,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  headerBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center', alignItems: 'center',
  },
  searchWrap: {
    paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: 'rgba(236,241,247,0.96)',
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.88)', borderRadius: 16,
    paddingHorizontal: 14, height: 46,
    borderWidth: 1.5, borderColor: 'transparent',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10, shadowRadius: 8, elevation: 4,
  },
  searchFocused: { borderColor: C.primary, backgroundColor: '#fff' },
  searchInput: { flex: 1, fontSize: 15, color: C.text },

  mapControls: {
    position: 'absolute', right: 16, top: '42%', gap: 8, zIndex: 5,
  },
  mapBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 6, elevation: 4,
  },
  mapBtnTxt: { fontSize: 20, color: C.primary, fontWeight: '300' },

  sosWrap: { position: 'absolute', right: 16, bottom: 220, zIndex: 20 },
  sosBtn: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: C.sos,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: C.sos, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 12, elevation: 10,
  },
  sosBadge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: '#fff', borderRadius: 8,
    paddingHorizontal: 5, paddingVertical: 2,
    borderWidth: 1.5, borderColor: C.sos,
  },
  sosBadgeTxt: { fontSize: 9, fontWeight: '800', color: C.sos, letterSpacing: 0.5 },

  bottom: { position: 'absolute', bottom: 76, left: 0, right: 0, zIndex: 10 },

  card: {
    marginHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 20, paddingTop: 16, paddingHorizontal: 16, paddingBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12, shadowRadius: 16, elevation: 12,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: C.text, letterSpacing: -0.2 },
  cardSub: { fontSize: 12, color: C.sub, marginTop: 2 },
  pill: {
    width: 36, height: 4, backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: 2, alignSelf: 'center', marginTop: 14,
  },

  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(26,111,168,0.08)', borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 5,
  },
  chipIcon: { fontSize: 12 },
  chipVal: { fontSize: 12, fontWeight: '700', color: C.primary },

  zoneIconWrap: {
    width: 44, height: 44, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  zoneIconInner: {
    width: 28, height: 28, borderRadius: 9,
    justifyContent: 'center', alignItems: 'center',
  },
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

  tabBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)',
    paddingBottom: Platform.OS === 'ios' ? 20 : 6, zIndex: 20,
  },
  tabItem: { flex: 1, alignItems: 'center', paddingTop: 10, paddingBottom: 4, gap: 3, position: 'relative' },
  tabDot: { position: 'absolute', top: 0, width: 24, height: 3, borderRadius: 2, backgroundColor: C.primary },
  tabIcon: { fontSize: 20 },
  tabLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.1 },
});
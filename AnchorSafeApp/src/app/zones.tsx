import React, { useRef, useEffect, useState } from 'react';
import { Ionicons } from "@expo/vector-icons";
import BottomNav from "../components/ui/BottomNav";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  Image,
  StatusBar,
} from 'react-native';

const { width } = Dimensions.get('window');

// ─── Design Tokens ────────────────────────────────────────────────────────────

const C = {
  primary:       '#005ab3',
  primaryLight:  '#0073e0',
  safe:          '#2ECC71',
  danger:        '#FF3B30',
  warning:       '#F4D03F',
  surface:       '#f9f9ff',
  surfaceCard:   'rgba(255,255,255,0.72)',
  background:    '#F4F9FC',
  text:          '#181c23',
  textSub:       '#414754',
  outline:       '#717786',
  outlineVar:    '#c0c6d6',
  secondary:     '#476083',
  border:        'rgba(255,255,255,0.32)',
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const ZONE = {
  name: 'Blue Lagoon',
  status: 'safe',
  statusLabel: 'Safe for Anchoring',
  updatedAgo: 'Verified update 12 minutes ago',
  distance: '1.2 nm',
  depth: '4–8m',
  seabed: 'Sand',
  envTitle: 'Environmental Impact',
  envBody:
    'The Blue Lagoon is home to critical Seagrass Meadows (Posidonia oceanica) and diverse coral formations. These ecosystems act as carbon sinks and provide essential nurseries for local fish populations.',
  permitted: 'Swimming, snorkeling, and anchoring on designated sand patches.',
  prohibited: 'Commercial fishing, spearfishing, and high-speed transit (>5kt).',
};


// ─── Glass Card ───────────────────────────────────────────────────────────────

function GlassCard({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[s.glassCard, style]}>{children}</View>;
}

// ─── Stat Chip ────────────────────────────────────────────────────────────────

function StatChip({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <GlassCard style={s.statChip}>
      <Ionicons
  name={icon as any}
  size={20}
  color={C.primary}
/>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={s.statValue}>{value}</Text>
    </GlassCard>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ZoneDetailScreen({
    setActiveScreen,
    }: any) {
  const [activeTab, setActiveTab] = useState('zones');

  // Staggered entry animations
  const fadeHeader  = useRef(new Animated.Value(0)).current;
  const fadeMap     = useRef(new Animated.Value(0)).current;
  const fadeBadge   = useRef(new Animated.Value(0)).current;
  const fadeStats   = useRef(new Animated.Value(0)).current;
  const fadeEnv     = useRef(new Animated.Value(0)).current;
  const fadeRegs    = useRef(new Animated.Value(0)).current;
  const fadeBtn     = useRef(new Animated.Value(0)).current;
  const slideBtn    = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const stagger = (anim: Animated.Value, delay: number, slide?: Animated.Value) => {
      const anims: Animated.CompositeAnimation[] = [
        Animated.timing(anim, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      ];
      if (slide) {
        anims.push(
          Animated.timing(slide, { toValue: 0, duration: 400, delay, useNativeDriver: true })
        );
      }
      return Animated.parallel(anims);
    };

    Animated.stagger(80, [
      stagger(fadeHeader, 0),
      stagger(fadeMap, 0),
      stagger(fadeBadge, 0),
      stagger(fadeStats, 0),
      stagger(fadeEnv, 0),
      stagger(fadeRegs, 0),
      stagger(fadeBtn, 0, slideBtn),
    ]).start();
  }, []);

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <Animated.View style={[s.header, { opacity: fadeHeader }]}>
        <Text style={s.headerTitle}>{ZONE.name}</Text>
      </Animated.View>

      {/* SCROLL CONTENT */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* MAP PREVIEW */}
        <Animated.View style={[s.mapWrap, { opacity: fadeMap }]}>
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAU7YQSEQgsVQpYj3lIoJrTDh7-n8MWwuCzhO_Ag7w0i6OYrt6tsTsMwM_1qCnj4GdlqlSPKDn7fpMrz_iTLGMc7_gdTqlkQQ7rvV2FyzE6dCaR3eCB07joTbEC_5R1yX-HpTRYYFYUci3AVUa6juUrpztjkiUU6ldkIhma2eLGwnrFiUG2UT3pa_ODzU8ZP1FvZp__kmER_V1SkXUvl-PMwW9Tq251YO65jBDGy1Dw6rZ-rjhhkOcmqJ6QGJtpUbgX3BjHjQyfpLVk',
            }}
            style={s.mapImg}
            resizeMode="cover"
          />
          {/* GPS Chip */}
          <View style={s.gpsBadge}>
            <Text style={s.gpsIcon}>✓</Text>
            <Text style={s.gpsText}>GPS Active</Text>
          </View>
        </Animated.View>

        {/* STATUS BADGE */}
        <Animated.View style={[s.statusSection, { opacity: fadeBadge }]}>
          <View style={s.statusBadge}>
            <Text style={s.statusLabel}>{ZONE.statusLabel}</Text>
          </View>
          <Text style={s.statusSub}>{ZONE.updatedAgo}</Text>
        </Animated.View>

        {/* STATS ROW */}
        <Animated.View style={[s.statsRow, { opacity: fadeStats }]}>
          <StatChip icon="boat-outline" label="Distance" value={ZONE.distance} />
          <StatChip icon="water-outline" label="Depth"    value={ZONE.depth}    />
          <StatChip icon="location-outline" label="Seabed"   value={ZONE.seabed}   />
        </Animated.View>

        {/* ENVIRONMENTAL IMPACT */}
        <Animated.View style={{ opacity: fadeEnv }}>
          <GlassCard style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionIcon}></Text>
              <Text style={s.sectionTitle}>Environmental Impact</Text>
            </View>

            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGNkTNdeqVGswB0XNpCm_xyp3BsJHszJSSIdjb5Yrx6W33_R54uJ2LwdoWJkkfQxMASyWi_iHBLgyURCk0I_d0Mw5brrrE7hcOAQMmP_pvnqub5vtC97LRRNNtC5z51wWBA_-pi7kHEGGdbZmr-esvYAFDN_OUZ83jOWJ0XGafmEHC-xhvN2eglrgCUdVeRfAI10HF1J-eAqvxoQKBqQ7nLgfDfsMULBZawn36XXXONDShKUdBf4nkETLrcRMc7AeYABhY-aeaMY4',
              }}
              style={s.envImg}
              resizeMode="cover"
            />

            <Text style={s.envBody}>
              The Blue Lagoon is home to critical{' '}
              <Text style={s.envBold}>Seagrass Meadows</Text>
              {' '}(Posidonia oceanica) and diverse coral formations. These ecosystems act as
              carbon sinks and provide essential nurseries for local fish populations.
            </Text>
          </GlassCard>
        </Animated.View>

        {/* REGULATIONS */}
        <Animated.View style={{ opacity: fadeRegs }}>
          <GlassCard style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionIcon}></Text>
              <Text style={s.sectionTitle}>Regulations</Text>
            </View>

            {/* Permitted */}
            <View style={[s.regRow, { backgroundColor: C.safe + '12' }]}>
              <View style={[s.regIconWrap, { backgroundColor: C.safe + '22' }]}>
                <Text style={[s.regIcon, { color: C.safe }]}>✓</Text>
              </View>
              <View style={s.regText}>
                <Text style={s.regTitle}>Permitted Activities</Text>
                <Text style={s.regSub}>{ZONE.permitted}</Text>
              </View>
            </View>

            {/* Prohibited */}
            <View style={[s.regRow, { backgroundColor: C.danger + '0D', marginTop: 10 }]}>
              <View style={[s.regIconWrap, { backgroundColor: C.danger + '22' }]}>
                <Text style={[s.regIcon, { color: C.danger }]}>✕</Text>
              </View>
              <View style={s.regText}>
                <Text style={s.regTitle}>Prohibited Activities</Text>
                <Text style={s.regSub}>{ZONE.prohibited}</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* NAVIGATE BUTTON */}
        <Animated.View
          style={[
            s.btnWrap,
            {
              opacity: fadeBtn,
              transform: [{ translateY: slideBtn }],
            },
          ]}
        >
          <TouchableOpacity
            style={s.navBtn}
            activeOpacity={0.88}
          >
            <Text style={s.navBtnText}>Navigate to Zone</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* TAB BAR */}

          <BottomNav
            activeTab="zones"
            setActiveScreen={setActiveScreen}
            />

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const HEADER_H = Platform.OS === 'ios' ? 100 : 72;

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.background,
  },

  // Header
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(249,249,255,0.82)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.outlineVar,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(192,198,214,0.22)',
  },
  headerBtnIcon: {
    fontSize: 17,
    color: C.primary,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: C.primary,
    letterSpacing: -0.4,
  },

  // Scroll
  scroll: {
    flex: 1,
    marginTop: HEADER_H,
  },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 110,
    gap: 14,
  },

  // Map preview
  mapWrap: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: C.outlineVar + '44',
  },
  mapImg: {
    width: '100%',
    height: '100%',
  },
  gpsBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.32)',
  },
  gpsIcon: {
    fontSize: 13,
    color: C.safe,
    fontWeight: '700',
  },
  gpsText: {
    fontSize: 13,
    fontWeight: '500',
    color: C.text,
  },

  // Status badge
  statusSection: {
    alignItems: 'center',
    paddingVertical: 6,
    gap: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.safe + '18',
    borderWidth: 1,
    borderColor: C.safe + '44',
    borderRadius: 100,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  statusAnchor: {
    fontSize: 20,
    color: C.safe,
  },
  statusLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: C.safe,
  },
  statusSub: {
    fontSize: 13,
    color: C.outline,
    fontWeight: '500',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    gap: 3,
  },
  statIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: C.text,
  },

  // Glass card
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.70)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.32)',
    padding: 16,
    overflow: 'hidden',
  },

  // Section
  section: {
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionIcon: {
    fontSize: 20,
    color: C.primary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: C.text,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-medium',
  },

  // Env image
  envImg: {
    width: '100%',
    height: 120,
    borderRadius: 14,
    backgroundColor: C.outlineVar + '44',
  },
  envBody: {
    fontSize: 15,
    lineHeight: 23,
    color: C.textSub,
  },
  envBold: {
    fontWeight: '700',
    color: C.text,
  },

  // Regulations
  regRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    padding: 12,
    borderRadius: 14,
  },
  regIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  regIcon: {
    fontSize: 15,
    fontWeight: '800',
  },
  regText: {
    flex: 1,
    gap: 3,
  },
  regTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: C.text,
  },
  regSub: {
    fontSize: 14,
    color: C.textSub,
    lineHeight: 20,
  },

  // Navigate button
  btnWrap: {
    paddingTop: 6,
  },
  navBtn: {
    backgroundColor: C.primary,
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 8,
  },
  navBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.2,
  },

  // Tab Bar
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(249,249,255,0.92)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.outlineVar,
    paddingBottom: Platform.OS === 'ios' ? 22 : 8,
    zIndex: 50,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
    gap: 3,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: 0,
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: C.primary,
  },
  tabIcon: {
    fontSize: 20,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
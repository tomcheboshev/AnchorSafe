import React, { useRef, useEffect, useState } from 'react';
import { Modal } from "react-native"
import { Ionicons } from "@expo/vector-icons";
import { getWeather } from "../services/weatherService";
import BottomNav from "../components/ui/BottomNav";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
  StatusBar,
} from 'react-native';

// ─── Tokens ───────────────────────────────────────────────────────────────────

const C = {
  primary:   '#005ab3',
  danger:    '#FF3B30',
  warning:   '#F4D03F',
  safe:      '#2ECC71',
  secondary: '#476083',
  surface:   '#f9f9ff',
  bg:        '#F4F9FC',
  text:      '#181c23',
  textSub:   '#414754',
  outline:   '#717786',
  outlineVar:'#c0c6d6',
  white:     '#ffffff',
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const CRITICAL = [
  {
    id: 'c1',
    icon: 'warning-outline',
    title: 'Restricted Marine Area',
    sub: 'Habitat Protection • 1.2 nm',
    time: '2 mins ago',
    body: 'Vessel is approaching a high-sensitivity conservation zone. Immediate course correction required to avoid fines and environmental impact.',
    action: 'View on Map',
  },
  {
    id: 'c2',
    icon: 'shield-checkmark-outline',
    title: 'Submerged Obstruction',
    sub: 'Danger Zone • 0.5 nm',
    time: '15 mins ago',
    body: 'Uncharted debris reported at shallow depths. Reduce speed and maintain visual watch.',
    action: 'Navigate Around',
  },
];

const WEATHER = [
  {
    id: 'w1',
    icon: 'cloudy-night-outline',
    title: 'High Wind Advisory',
    sub: 'Cannes Coastal Sector',
    time: '1 hour ago',
    body: '25kt+ gusts expected. Sea state likely to transition to \'Moderate\' within 2 hours. Secure loose deck gear.',
    action: 'View Details',
  },
];

const NOTICES = [
  {
    id: 'n1',
    icon: 'boat-outline',
    title: 'Port de Cannes',
    sub: 'Mooring Availability',
    time: '3 hours ago',
    body: 'Temporary visitor moorings available at Quay St. Pierre for vessels under 15m. Max stay 24h.',
    cta: 'Reserve Spot',
    ctaPrimary: true,
  },
  {
    id: 'n2',
    icon: 'sync-outline',
    title: 'System Update',
    sub: 'Map Version 4.2.0',
    time: '5 hours ago',
    body: 'New chart data for the Lérins Islands has been downloaded and applied.',
    cta: null,
    ctaPrimary: false,
  },
];


  

// ─── Alert Card ───────────────────────────────────────────────────────────────

function AlertCard({
  icon,
  title,
  sub,
  time,
  body,
  action,
  onAction,
  accentColor,
  cta,
  ctaPrimary,
  delay,
  onDismiss,
}: {
  icon: string;
  title: string;
  sub: string;
  time: string;
  body: string;
  action?: string;
  accentColor: string;
  cta?: string | null;
  ctaPrimary?: boolean;
  delay: number;
  onDismiss?: () => void;
  onAction?: () => void;
}) {
  const fade  = useRef(new Animated.Value(0)).current;
  const slideX = useRef(new Animated.Value(-16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 380, delay, useNativeDriver: true }),
      Animated.timing(slideX,{ toValue: 0, duration: 380, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[s.card, { opacity: fade, transform: [{ translateX: slideX }] }]}>
      {/* Left accent bar */}
      {accentColor !== C.primary && (
        <View style={[s.accentBar, { backgroundColor: accentColor }]} />
      )}

      {/* Card content */}
      <View style={s.cardInner}>
        {/* Row top */}
        <View style={s.cardTop}>
          <View style={s.cardLeft}>
            <View style={[s.iconCircle, { backgroundColor: accentColor + '18' }]}>
              <Ionicons
                name={icon as any}
                size={20}
                color={accentColor}
                />
            </View>
            <View style={s.cardTitles}>
              <Text style={s.cardTitle}>{title}</Text>
              <Text style={s.cardSub}>{sub}</Text>
            </View>
          </View>
          <Text style={s.cardTime}>{time}</Text>
        </View>

        {/* Body */}
        <Text style={s.cardBody}>{body}</Text>

        {/* Actions */}
        <View style={s.cardActions}>
          {action && (
            <TouchableOpacity style={s.linkBtn}
  onPress={onAction}>
              <Text style={[s.linkBtnText, { color: C.primary }]}>{action} →</Text>
            </TouchableOpacity>
          )}
          {cta && ctaPrimary && (
            <TouchableOpacity style={s.ctaBtn}>
              <Text style={s.ctaBtnText}>{cta}</Text>
            </TouchableOpacity>
          )}
          {accentColor === C.danger && (
<TouchableOpacity
  style={s.dismissBtn}
  onPress={onDismiss}
                
                >
              <Text style={s.dismissText}>Dismiss</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
  color,
  badge,
}: {
  icon: string;
  title: string;
  color: string;
  badge?: string;
}) {
  return (
    <View style={s.sectionHeader}>
      <View style={s.sectionLeft}>
        <Ionicons
            name={icon as any}
            size={24}
            color={color}
            />
        <Text style={[s.sectionTitle, { color: color === C.danger ? C.danger : C.text }]}>
          {title}
        </Text>
      </View>
      {badge && (
        <View style={[s.badge, { backgroundColor: color + '18', borderColor: color + '33' }]}>
          <Text style={[s.badgeText, { color }]}>{badge}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AlertsScreen({
  setActiveScreen,
}: any) {

    const [weatherData, setWeatherData] =
  useState<any>(null);

const [showWeatherModal, setShowWeatherModal] =
  useState(false);

  const [criticalAlerts, setCriticalAlerts] =
  useState(CRITICAL);

  const sosAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(sosAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
        Animated.timing(sosAnim, { toValue: 1,   duration: 800, useNativeDriver: true }),
      ])
    ).start();
      loadWeather();

  }, []);

const loadWeather = async () => {
  try {
    const data = await getWeather();

    console.log("WEATHER DATA:", data);

    setWeatherData(data);
  } catch (error) {
    console.log("Weather error:", error);
  }
};

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.headerTitle}>Alerts</Text>
        </View>
      </View>

      {/* SCROLL */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Critical ── */}
        <View style={s.section}>
          <SectionHeader icon="alert-circle-outline" title="Critical Alerts" color={C.danger} badge="2 Active" />
          {criticalAlerts.map((item, i) => (
            <AlertCard
              key={item.id}
              icon={item.icon}
              title={item.title}
              sub={item.sub}
              time={item.time}
              body={item.body}
              action={item.action}
              accentColor={C.danger}
              delay={i * 80}
              onDismiss={() =>
  setCriticalAlerts(prev =>
    prev.filter(alert => alert.id !== item.id)
  )
}
onAction={() =>
  setActiveScreen("map")
}
            />
          ))}
        </View>

        {/* ── Weather ── */}
        <View style={s.section}>
          <SectionHeader icon="thunderstorm-outline" title="Weather Warnings" color={C.warning} />
          {WEATHER.map((item, i) => (
            <AlertCard
              key={item.id}
              icon={item.icon}
              title={item.title}
              sub={item.sub}
              time={item.time}
                body={
                weatherData &&
                weatherData.weather &&
                weatherData.main &&
                weatherData.wind
                    ? `${weatherData.weather[0]?.description}. Wind speed: ${weatherData.wind?.speed} m/s. Temperature: ${weatherData.main?.temp}°C`
                    : "Loading weather data..."
                }
              action={item.action}
              accentColor={C.warning}
              delay={160 + i * 80}
              onAction={() =>
  setShowWeatherModal(true)
}
            />
          ))}
        </View>

        {/* ── Notices ── */}
        <View style={s.section}>
          <SectionHeader icon="information-circle-outline" title="General Notices" color={C.primary} />
          {NOTICES.map((item, i) => (
            <AlertCard
              key={item.id}
              icon={item.icon}
              title={item.title}
              sub={item.sub}
              time={item.time}
              body={item.body}
              accentColor={C.primary}
              cta={item.cta}
              ctaPrimary={item.ctaPrimary}
              delay={280 + i * 80}
            />
          ))}
        </View>
      </ScrollView>

          <Modal
  visible={showWeatherModal}
  transparent={true}
  animationType="fade"
>
  <View
    style={{
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.7)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    }}
  >
    <View
      style={{
        width: "100%",
        backgroundColor: "#0F172A",
        borderRadius: 30,
        padding: 25,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 24,
            fontWeight: "bold",
          }}
        >
          Weather Details
        </Text>

        <Text style={{ fontSize: 42 }}>
          🌤️
        </Text>
      </View>

      <Text
        style={{
          color: "white",
          fontSize: 60,
          fontWeight: "bold",
          marginTop: 20,
        }}
      >
        {weatherData?.main?.temp
          ? `${Math.round(weatherData.main.temp)}°`
          : "--°"}
      </Text>

      <Text
        style={{
          color: "#CBD5E1",
          fontSize: 18,
          marginTop: 5,
          textTransform: "capitalize",
        }}
      >
        {weatherData?.weather?.[0]?.description || "Loading..."}
      </Text>

      <View style={{ marginTop: 30 }}>
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.08)",
            padding: 16,
            borderRadius: 18,
            marginBottom: 14,
          }}
        >
          <Text style={{ color: "#94A3B8" }}>
            Wind Speed
          </Text>

          <Text
            style={{
              color: "white",
              fontSize: 20,
              fontWeight: "700",
              marginTop: 5,
            }}
          >
            💨 {weatherData?.wind?.speed || 0} m/s
          </Text>
        </View>

        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.08)",
            padding: 16,
            borderRadius: 18,
            marginBottom: 14,
          }}
        >
          <Text style={{ color: "#94A3B8" }}>
            Humidity
          </Text>

          <Text
            style={{
              color: "white",
              fontSize: 20,
              fontWeight: "700",
              marginTop: 5,
            }}
          >
            💧 {weatherData?.main?.humidity || 0}%
          </Text>
        </View>

        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.08)",
            padding: 16,
            borderRadius: 18,
          }}
        >
          <Text style={{ color: "#94A3B8" }}>
            Feels Like
          </Text>

          <Text
            style={{
              color: "white",
              fontSize: 20,
              fontWeight: "700",
              marginTop: 5,
            }}
          >
            🌡{" "}
            {weatherData?.main?.feels_like
              ? `${Math.round(weatherData.main.feels_like)}°`
              : "--°"}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => setShowWeatherModal(false)}
        style={{
          backgroundColor: "#2563EB",
          paddingVertical: 16,
          borderRadius: 18,
          marginTop: 30,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "white",
            fontWeight: "700",
            fontSize: 16,
          }}
        >
          Close
        </Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>


      {/* SOS FAB */}
      <Animated.View style={[s.sosWrap, { transform: [{ scale: sosAnim }] }]}>
        <TouchableOpacity style={s.sosBtn} activeOpacity={0.85}>
          <View style={s.sosBadge}>
            <Text style={s.sosBadgeTxt}>SOS</Text>
          </View>
          <Ionicons
            name="warning"
            size={24}
            color={C.white}
            />
        </TouchableOpacity>
      </Animated.View>

      {/* TAB BAR */}

          <BottomNav
            activeTab="alerts"
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
    backgroundColor: C.bg,
  },

  // Header
  header: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.75)',
    backdropFilter: 'blur(12px)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.outlineVar,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAnchor: {
    fontSize: 20,
    color: C.primary,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: C.primary,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 4,
  },
  headerBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(192,198,214,0.22)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerBtnIcon: {
    fontSize: 16,
    color: C.textSub,
  },

  // Scroll
  scroll: {
    flex: 1,
    marginTop: HEADER_H,
  },
  scrollContent: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 120,
    gap: 8,
  },

  // Section
  section: {
    gap: 10,
    paddingTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionIcon: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-medium',
  },
  badge: {
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Card
  card: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 20,
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  accentBar: {
    width: 4,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  cardInner: {
    flex: 1,
    padding: 16,
    gap: 10,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 40, height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 18,
  },
  cardTitles: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
    letterSpacing: -0.2,
  },
  cardSub: {
    fontSize: 12,
    fontWeight: '500',
    color: C.outline,
  },
  cardTime: {
    fontSize: 12,
    color: C.outline,
    fontWeight: '500',
    marginLeft: 8,
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 21,
    color: C.textSub,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 2,
  },
  linkBtn: {
    paddingVertical: 2,
  },
  linkBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dismissBtn: {
    paddingVertical: 2,
  },
  dismissText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.outline,
  },
  ctaBtn: {
    backgroundColor: C.primary,
    borderRadius: 100,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  ctaBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.white,
  },

  // SOS
  sosWrap: {
    position: 'absolute',
    right: 16,
    bottom: 90,
    zIndex: 60,
  },
  sosBtn: {
    width: 56, height: 56,
    borderRadius: 28,
    backgroundColor: C.danger,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: C.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 10,
  },
  sosBadge: {
    position: 'absolute',
    top: -4, right: -4,
    backgroundColor: C.white,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderWidth: 1.5,
    borderColor: C.danger,
  },
  sosBadgeTxt: {
    fontSize: 9,
    fontWeight: '800',
    color: C.danger,
    letterSpacing: 0.5,
  },

  // Tab bar
  tabBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(249,249,255,0.94)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.outlineVar,
    paddingBottom: Platform.OS === 'ios' ? 22 : 8,
    zIndex: 50,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
    gap: 3,
    position: 'relative',
  },
  tabDot: {
    position: 'absolute',
    top: 0,
    width: 28, height: 3,
    borderRadius: 2,
    backgroundColor: C.primary,
  },
  tabIcon: { fontSize: 20 },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
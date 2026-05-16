    import React, { useState } from 'react';
    import { Ionicons } from "@expo/vector-icons";
    import BottomNav from "../components/ui/BottomNav";
    import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Switch,
    Image,
    StyleSheet,
    StatusBar,
    SafeAreaView,
    Platform,
    } from 'react-native';

    // ─── Colour tokens (matching original design) ────────────────────────────────
    const C = {
    primary:             '#005ab3',
    secondary:           '#476083',
    background:          '#F4F9FC',
    surface:             '#f9f9ff',
    surfaceLowest:       '#ffffff',
    surfaceVariant:      '#e0e2ed',
    surfaceContainerHigh:'#e5e8f2',
    outline:             '#717786',
    outlineVariant:      '#c0c6d6',
    onSurface:           '#181c23',
    onSurfaceVariant:    '#414754',
    dangerRed:           '#FF3B30',
    safeGreen:           '#2ECC71',
    warningYellow:       '#F4D03F',
    primaryFixed:        '#d6e3ff',
    primaryFixedDim:     '#aac7ff',
    };

    // ─── Reusable: Section Header ─────────────────────────────────────────────────
    const SectionHeader = ({ title }: any) => (
    <Text style={styles.sectionHeader}>
        {title.toUpperCase()}
    </Text>
    );

    const Card = ({ children }: any) => (
    <View style={styles.card}>
        {children}
    </View>
    );

    const ToggleRow = ({
    icon,
    label,
    value,
    onChange,
    isLast,
    }: any) => (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
        <View style={styles.rowLeft}>
        <Text style={styles.rowLabel}>{label}</Text>
        </View>

        <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{
            false: C.surfaceVariant,
            true: C.primary,
        }}
        thumbColor={
            Platform.OS === "android"
            ? value
                ? C.primaryFixedDim
                : "#f4f3f4"
            : undefined
        }
        ios_backgroundColor={C.surfaceVariant}
        />
    </View>
    );

    const ArrowRow = ({
    icon,
    label,
    value,
    iconColor,
    isLast,
    onPress,
    externalLink,
    }: any) => (
    <TouchableOpacity
        style={[styles.row, !isLast && styles.rowBorder]}
        onPress={onPress}
        activeOpacity={0.65}
    >
        <View style={styles.rowLeft}>
        {icon ? (
            <Text
            style={[
                styles.icon,
                iconColor && { color: iconColor },
            ]}
            >
            {icon}
            </Text>
        ) : null}

        <Text style={styles.rowLabel}>
            {label}
        </Text>
        </View>

        <View style={styles.rowRight}>
        {value ? (
            <Text style={styles.rowValue}>
            {value}
            </Text>
        ) : null}

        <Ionicons
            name={
                externalLink
                ? "open-outline"
                : "chevron-forward"
            }
            size={18}
            color={C.outline}
            />
                    </View>
    </TouchableOpacity>
    );

    // ─── Main Screen ──────────────────────────────────────────────────────────────
    export default function SettingsScreen({
    setActiveScreen,
    }: any) {
    // Navigation prefs
    const [showDepth,    setShowDepth]    = useState(true);
    const [autoReroute,  setAutoReroute]  = useState(false);

    // Notifications
    const [proximity,    setProximity]    = useState(true);
    const [weather,      setWeather]      = useState(true);
    const [envNotices,   setEnvNotices]   = useState(false);


    return (
        <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={C.surface} />

        {/* ── Top App Bar ── */}
        <View style={styles.topBar}>
            <View style={styles.topBarLeft}>
            <Text style={styles.screenTitle}>Profile Settings</Text>
            </View>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons
  name="search"
  size={22}
  color={C.primary}
/>
            </TouchableOpacity>
        </View>

        {/* ── Scrollable Content ── */}
        <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* Profile Card */}
            <View style={styles.profileCard}>
            <Image
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwJ-c0GknTB0YWIltKhbh6_4XurelAigH7fEbMYsleyX01xo2h3jyoGjZtWpQ1DjZCXtQJqvEnaAVNvZoQJ9cdLLWnHaYIFkUa5jmggTbuuPkLC_cPgLtpj3mscXWhPQgyF2_OS1q6MX_8YDqTCcEh1SsAbyIT-FDUQp-NSq7fO0TPHFhpSbSG9z0mvohvL9bF5lSam4Zu_sBouLqIAI1DgGrVFQph5UE-Q-AQTsvP88AtZIAETVtiIn8Uxal-zafR8ZMWs781RfE' }}
                style={styles.avatar}
            />
            <View>
                <Text style={styles.profileName}>Captain James Hook</Text>
                <Text style={styles.profileSub}>Ocean Voyager Pro Member</Text>
            </View>
            </View>

            {/* ── Navigation Preferences ── */}
            <SectionHeader title="Navigation Preferences" />
            <Card>
            <ToggleRow
                label="Show Depth Contours"
                value={showDepth}
                onChange={setShowDepth}
            />
            <ToggleRow
                label="Automatic Rerouting"
                value={autoReroute}
                onChange={setAutoReroute}
            />
            <ArrowRow
                label="Units of Measure"
                value="Nautical Miles"
                isLast
            />
            </Card>

            {/* ── Notifications ── */}
            <SectionHeader title="Notifications" />
            <Card>
            <ToggleRow
                label="Proximity Alerts"
                value={proximity}
                onChange={setProximity}
            />
            <ToggleRow
                label="Weather Warnings"
                value={weather}
                onChange={setWeather}
            />
            <ToggleRow
                label="Environmental Notices"
                value={envNotices}
                onChange={setEnvNotices}
                isLast
            />
            </Card>

            {/* ── Safety ── */}
            <SectionHeader title="Safety" />
            <Card>
            <ArrowRow
                label="Manage Emergency Contacts"
            />
            <ArrowRow
                label="Vessel Information"
                isLast
            />
            </Card>

            {/* ── About & Support ── */}
            <SectionHeader title="About & Support" />
            <Card>
            <ArrowRow label="Privacy Policy"  externalLink />
            <ArrowRow label="Terms of Service" externalLink />
            <ArrowRow label="Support"/>
            </Card>

            {/* Version info */}
            <View style={styles.versionBlock}>
            <Text style={styles.versionApp}>AnchorSafe App</Text>
            <Text style={styles.versionNum}>v1.2.4</Text>
            </View>
        </ScrollView>

        {/* ── Bottom Navigation Bar ── */}

            <BottomNav
            activeTab="profile"
            setActiveScreen={setActiveScreen}
            />

        </SafeAreaView>
    );
    }

    // ─── Styles ───────────────────────────────────────────────────────────────────
    const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: C.background,
        paddingBottom: 40
    },

    // Top bar
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: C.surface + 'CC',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: C.outlineVariant,
    },
    topBarLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBtn: {
        padding: 6,
    },
    topIcon: {
        fontSize: 20,
    },
    screenTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: C.primary,
        letterSpacing: -0.3,
    },

    // Scroll
    scroll: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingBottom: 32,
        gap: 8,
    },

    // Profile card
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        backgroundColor: C.surfaceLowest,
        borderRadius: 20,
        padding: 16,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: C.primaryFixed,
    },
    profileName: {
        fontSize: 18,
        fontWeight: '600',
        color: C.secondary,
        marginBottom: 2,
    },
    profileSub: {
        fontSize: 13,
        color: C.outline,
    },

    // Section header
    sectionHeader: {
        fontSize: 13,
        fontWeight: '700',
        color: C.primary,
        letterSpacing: 1.1,
        paddingHorizontal: 4,
        marginTop: 12,
        marginBottom: 4,
    },

    // Card
    card: {
        backgroundColor: C.surfaceLowest,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
        marginBottom: 4,
    },

    // Row
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    rowBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: C.surfaceVariant,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        flex: 1,
    },
    rowRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    icon: {
        fontSize: 20,
        color: C.secondary,
    },
    rowLabel: {
        fontSize: 15,
        color: C.onSurface,
        fontWeight: '400',
    },
    rowValue: {
        fontSize: 13,
        color: C.primary,
        fontWeight: '600',
    },

    // Version
    versionBlock: {
        alignItems: 'center',
        paddingVertical: 24,
        gap: 2,
    },
    versionApp: {
        fontSize: 13,
        color: C.outline,
    },
    versionNum: {
        fontSize: 13,
        color: C.outlineVariant,
        fontWeight: '700',
    },

    // Bottom nav
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        paddingBottom: Platform.OS === 'ios' ? 20 : 10,
        backgroundColor: C.surface + 'E8',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: C.outlineVariant,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 16,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    navTab: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        paddingHorizontal: 12,
        position: 'relative',
    },
    navIcon: {
        fontSize: 22,
        opacity: 0.55,
    },
    navLabel: {
        fontSize: 11,
        color: C.secondary,
        fontWeight: '500',
    },
    navLabelActive: {
        color: C.primary,
        fontWeight: '700',
    },
    navIndicator: {
        position: 'absolute',
        top: -10,
        width: 24,
        height: 3,
        borderRadius: 2,
        backgroundColor: C.primary,
    },
    });
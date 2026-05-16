import React from "react";
import {
  Ionicons,
} from "@expo/vector-icons";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";

const C = {
  primary: "#005ab3",
  secondary: "#476083",
  outlineVar: "#c0c6d6",
};

const TABS = [
  {
    key: "map",
    label: "Map",
    icon: "map-outline",
    activeIcon: "map",
  },
  {
    key: "zones",
    label: "Zones",
    icon: "layers-outline",
    activeIcon: "layers",
  },
  {
    key: "alerts",
    label: "Alerts",
    icon: "notifications-outline",
    activeIcon: "notifications",
  },
  {
    key: "profile",
    label: "Profile",
    icon: "person-outline",
    activeIcon: "person",
  },
] as const;

export default function BottomNav({
  activeTab,
  setActiveScreen,
}: any) {
  return (
    <View style={s.tabBar}>
      {TABS.map((tab) => {
        const active = tab.key === activeTab;

        return (
          <TouchableOpacity
            key={tab.key}
            style={s.tabItem}
            onPress={() =>
              setActiveScreen(tab.key)
            }
          >
            {active && (
              <View style={s.tabDot} />
            )}

            <Ionicons
            name={
                active
                ? tab.activeIcon
                : tab.icon
            }
            size={22}
            color={
                active
                ? C.primary
                : C.secondary
            }
            />

            <Text
              style={[
                s.tabLabel,
                {
                  color: active
                    ? C.primary
                    : C.secondary,
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,

    flexDirection: "row",

    backgroundColor:
      "rgba(249,249,255,0.94)",

    borderTopWidth:
      StyleSheet.hairlineWidth,

    borderTopColor: C.outlineVar,

    paddingBottom:
      Platform.OS === "ios" ? 22 : 8,

    zIndex: 50,

    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 10,
  },

  tabItem: {
    flex: 1,

    alignItems: "center",

    paddingTop: 10,
    paddingBottom: 4,

    gap: 3,

    position: "relative",
  },

  tabDot: {
    position: "absolute",
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
    fontWeight: "600",
    letterSpacing: 0.1,
  },
});
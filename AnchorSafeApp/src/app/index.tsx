import { useState } from "react";

import MapScreen from "./map";
import ZonesScreen from "./zones";
import AlertsScreen from "./alerts";
import ProfileScreen from "./profile";
import SupportScreen from "./support";
import EmergencyContactsScreen from "./emergencyContacts";

export default function Home() {
  const [activeScreen, setActiveScreen] =
    useState("map");

  if (activeScreen === "zones") {
    return (
      <ZonesScreen
        setActiveScreen={setActiveScreen}
      />
    );
  }

  if (activeScreen === "alerts") {
    return (
      <AlertsScreen
        setActiveScreen={setActiveScreen}
      />
    );
  }

  if (activeScreen === "profile") {
  return (
    <ProfileScreen
      setActiveScreen={setActiveScreen}
    />
  );
}

if (activeScreen === "support") {
  return (
    <SupportScreen
      setActiveScreen={setActiveScreen}
    />
  );
}

if (activeScreen === "emergencyContacts") {
  return (
    <EmergencyContactsScreen
      setActiveScreen={setActiveScreen}
    />
  );
}

  return (
    <MapScreen
      setActiveScreen={setActiveScreen}
    />
  );
}
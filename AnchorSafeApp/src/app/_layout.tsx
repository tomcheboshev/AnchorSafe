import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Font from 'expo-font';
import { useEffect, useState } from "react";
import { View, Text } from "react-native";



export default function Layout()
{

  const [fontsloaded, setFontsLoaded] = useState(false);

  useEffect(() =>  {
    async function loadFonts() {
        await Font.loadAsync(Ionicons.font);
        setFontsLoaded(true);
    }
    loadFonts();
  }, [])

  if(!fontsloaded){
    return <View><Text>Loading...</Text></View>
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
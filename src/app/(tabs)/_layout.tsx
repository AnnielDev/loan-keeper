import { Icon } from "@/components/general/Icon";
import { TabBarBackground } from "@/components/tab-bar/TabBarBackground";
import { TabBarButton } from "@/components/tab-bar/TabBarButton";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#6B7280",
        tabBarButton: (props) => <TabBarButton {...props} />,
        tabBarBackground: () => <TabBarBackground />,
        tabBarStyle: {
          position: "absolute",
          height: 50,
          bottom: 10,
          borderRadius: 32,
          borderTopWidth: 0,
          paddingTop: 5,
          margin: 20,
          overflow: "hidden",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon family="Octicons" name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="customers"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon
              family="MaterialCommunityIcons"
              name="account-multiple-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="loans"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon
              family="MaterialCommunityIcons"
              name="cash-multiple"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="schedule"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon
              family="MaterialCommunityIcons"
              name="calendar-month-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon
              family="Ionicons"
              name="settings-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

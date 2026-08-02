import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function SignUp() {
  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <Text>Sign Up</Text>
    </SafeAreaView>
  );
}

import { useTranslation } from "react-i18next";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ScheduleTabScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView edges={["top"]}>
      <Text>{t("tabs.schedule")}</Text>
    </SafeAreaView>
  );
}

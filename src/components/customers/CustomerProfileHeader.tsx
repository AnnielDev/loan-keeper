import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

import { Icon } from "@/components/general/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { useAppTheme } from "@/hooks/useAppTheme";

type CustomerProfileHeaderProps = {
  avatarUrl: string | null;
  fullName: string;
  documentId: string;
};

export function CustomerProfileHeader({ avatarUrl, fullName, documentId }: CustomerProfileHeaderProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  return (
    <View style={styles.row}>
      <Avatar uri={avatarUrl} name={fullName} size={80} />
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
          {fullName}
        </Text>
        <View style={[styles.idPill, { backgroundColor: colors.surface }]}>
          <Icon family="Ionicons" name="finger-print-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.idText, { color: colors.textSecondary }]} numberOfLines={1}>
            {t("customerDetail.idPrefix")} {documentId}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  info: {
    flex: 1,
    gap: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
  },
  idPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  idText: {
    fontSize: 12,
    fontWeight: "600",
  },
});

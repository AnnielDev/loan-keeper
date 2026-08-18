import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { Icon } from "@/components/general/Icon";
import { CircleIconButton } from "@/components/ui/CircleIconButton";
import { InfoRow } from "@/components/ui/InfoRow";
import { useAppTheme } from "@/hooks/useAppTheme";
import { formatLongDate } from "@/utils/format";

type CustomerContactCardProps = {
  phone: string | null;
  address: string | null;
  createdAt: string;
  onMessage: () => void;
  onOpenMap: () => void;
};

export function CustomerContactCard({
  phone,
  address,
  createdAt,
  onMessage,
  onOpenMap,
}: CustomerContactCardProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();

  const rows = [
    phone
      ? {
          key: "phone",
          icon: <Icon family="Ionicons" name="call-outline" size={18} color={colors.textSecondary} />,
          label: t("customerDetail.contact.phone"),
          value: phone,
          trailing: (
            <CircleIconButton
              icon={<Icon family="Ionicons" name="chatbubble-outline" size={18} color={colors.primary} />}
              onPress={onMessage}
            />
          ),
        }
      : null,
    address
      ? {
          key: "address",
          icon: <Icon family="Ionicons" name="location-outline" size={18} color={colors.textSecondary} />,
          label: t("customerDetail.contact.address"),
          value: address,
          trailing: (
            <CircleIconButton
              tone="neutral"
              icon={<Icon family="Ionicons" name="map-outline" size={18} color={colors.text} />}
              onPress={onOpenMap}
            />
          ),
        }
      : null,
    {
      key: "since",
      icon: <Icon family="Ionicons" name="calendar-outline" size={18} color={colors.textSecondary} />,
      label: t("customerDetail.contact.customerSince"),
      value: formatLongDate(createdAt, i18n.language),
      trailing: null,
    },
  ].filter((row): row is NonNullable<typeof row> => row !== null);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      {rows.map((row, index) => (
        <View
          key={row.key}
          style={index > 0 && { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth }}
        >
          <InfoRow icon={row.icon} label={row.label} value={row.value} trailing={row.trailing} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    paddingHorizontal: 16,
  },
});

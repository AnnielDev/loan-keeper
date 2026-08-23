import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { Icon } from "@/components/general/Icon";
import { InfoRow } from "@/components/ui/InfoRow";
import { useAppTheme } from "@/hooks/useAppTheme";
import { formatCurrency } from "@/utils/format";

type CustomerFinancialCardProps = {
  occupation: string | null;
  monthlyIncome: number | null;
  currency: string;
};

export function CustomerFinancialCard({ occupation, monthlyIncome, currency }: CustomerFinancialCardProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();

  const rows = [
    occupation
      ? {
          key: "occupation",
          icon: <Icon family="Ionicons" name="briefcase-outline" size={18} color={colors.textSecondary} />,
          label: t("customerDetail.financial.occupation"),
          value: occupation,
        }
      : null,
    monthlyIncome
      ? {
          key: "monthlyIncome",
          icon: <Icon family="Ionicons" name="cash-outline" size={18} color={colors.textSecondary} />,
          label: t("customerDetail.financial.monthlyIncome"),
          value: formatCurrency(monthlyIncome, currency, i18n.language),
        }
      : null,
  ].filter((row): row is NonNullable<typeof row> => row !== null);

  if (rows.length === 0) return null;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      {rows.map((row, index) => (
        <View
          key={row.key}
          style={index > 0 && { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth }}
        >
          <InfoRow icon={row.icon} label={row.label} value={row.value} />
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

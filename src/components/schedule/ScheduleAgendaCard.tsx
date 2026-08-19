import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

import { Icon } from "@/components/general/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PrimaryButton, type PrimaryButtonTone } from "@/components/ui/PrimaryButton";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthStore } from "@/store/auth";
import type { ScheduleEvent } from "@/types/schedule";
import { formatCurrency } from "@/utils/format";

type ScheduleAgendaCardProps = {
  event: ScheduleEvent;
  onAction: () => void;
};

const BADGE_TONE: Record<ScheduleEvent["status"], BadgeTone> = {
  overdue: "danger",
  today: "danger",
  upcoming: "primary",
  completed: "success",
};

const ACTION_TONE: Record<ScheduleEvent["status"], PrimaryButtonTone> = {
  overdue: "danger",
  today: "danger",
  upcoming: "primary",
  completed: "primary",
};

export function ScheduleAgendaCard({ event, onAction }: ScheduleAgendaCardProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const currency = useAuthStore((state) => state.user?.currency ?? "USD");

  const statusLabel = t(`schedule.status.${event.status}`);
  const actionLabel = event.status === "upcoming" ? t("schedule.actions.register") : t("schedule.actions.collect");

  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        <Avatar uri={event.avatarUrl} name={event.customerName} size={44} />
        <View style={styles.identity}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {event.customerName}
          </Text>
          <Text style={[styles.loanCode, { color: colors.textSecondary }]}>#{event.loanCode}</Text>
        </View>
        <Badge tone={BADGE_TONE[event.status]} label={statusLabel} />
      </View>

      <View style={styles.bottomRow}>
        <View>
          <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>
            {t("schedule.amountDue")}
          </Text>
          <Text style={[styles.amount, { color: colors.text }]}>
            {formatCurrency(event.amount, currency, i18n.language)}
          </Text>
        </View>

        {event.status !== "completed" ? (
          <View style={styles.actionButton}>
            <PrimaryButton
              tone={ACTION_TONE[event.status]}
              label={actionLabel}
              icon={<Icon family="Ionicons" name="card-outline" size={16} color={colors.onPrimary} />}
              onPress={onAction}
            />
          </View>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  identity: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
  },
  loanCode: {
    fontSize: 12,
    fontWeight: "500",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },
  amountLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  amount: {
    fontSize: 20,
    fontWeight: "700",
  },
  actionButton: {
    minWidth: 120,
  },
});

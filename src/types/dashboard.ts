export type DueStatus = "upcoming" | "today" | "overdue";

export type MonthlyIncomePoint = {
  month: string;
  amount: number;
};

export type UpcomingDueDate = {
  customerId: string;
  customerName: string;
  avatarUrl: string | null;
  amount: number;
  dueDate: string;
  daysUntilDue: number;
  status: DueStatus;
};

export type DashboardResponse = {
  pendingToday: number;
  balance: number;
  totalLoaned: {
    amount: number;
    growthPercentage: number;
  };
  collected: {
    amount: number;
  };
  pending: {
    amount: number;
  };
  stats: {
    customers: number;
    active: number;
    overdue: number;
  };
  monthlyIncome: MonthlyIncomePoint[];
  upcomingDueDates: UpcomingDueDate[];
};

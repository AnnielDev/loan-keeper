export type ScheduleEventStatus = "upcoming" | "today" | "overdue" | "completed";

export type ScheduleEvent = {
  installmentId: string;
  loanId: string;
  loanCode: string;
  customerId: string;
  customerName: string;
  avatarUrl: string | null;
  amount: number;
  dueDate: string;
  daysUntilDue: number;
  status: ScheduleEventStatus;
};

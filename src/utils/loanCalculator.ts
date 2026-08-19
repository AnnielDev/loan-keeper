import type { InterestType, PaymentFrequency } from "@/types/loan";

export type LoanCalculationInput = {
  principal: number;
  interestRate: number;
  interestType: InterestType;
  installmentsCount: number;
  frequency: PaymentFrequency;
  startDate: Date;
};

export type LoanInstallmentPreview = {
  dueDate: Date;
  amount: number;
};

export type LoanCalculation = {
  totalInterest: number;
  totalAmount: number;
  installmentAmount: number;
  installments: LoanInstallmentPreview[];
};

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function calculateTotalInterest(input: LoanCalculationInput): number {
  if (input.interestType === "compound") {
    const compounded =
      input.principal * Math.pow(1 + input.interestRate / 100, input.installmentsCount);
    return round(compounded - input.principal);
  }

  return round(input.principal * (input.interestRate / 100));
}

function addPeriods(startDate: Date, frequency: PaymentFrequency, periods: number): Date {
  const date = new Date(startDate);
  if (frequency === "weekly") {
    date.setDate(date.getDate() + periods * 7);
  } else if (frequency === "biweekly") {
    date.setDate(date.getDate() + periods * 14);
  } else if (frequency === "every_2_months") {
    date.setMonth(date.getMonth() + periods * 2);
  } else if (frequency === "every_3_months") {
    date.setMonth(date.getMonth() + periods * 3);
  } else {
    date.setMonth(date.getMonth() + periods);
  }
  return date;
}

/** Mirrors LoansService's server-side math so the "estimated summary" preview
 * matches what the API will actually persist on submit. */
export function calculateLoan(input: LoanCalculationInput): LoanCalculation {
  const count = Math.max(Math.trunc(input.installmentsCount) || 0, 0);
  const totalInterest = calculateTotalInterest(input);
  const totalAmount = round(input.principal + totalInterest);

  if (count === 0) {
    return { totalInterest, totalAmount, installmentAmount: 0, installments: [] };
  }

  const baseAmount = round(totalAmount / count);
  const installments = Array.from({ length: count }, (_, index) => {
    const isLast = index === count - 1;
    const amount = isLast ? round(totalAmount - baseAmount * (count - 1)) : baseAmount;
    return { dueDate: addPeriods(input.startDate, input.frequency, index + 1), amount };
  });

  return { totalInterest, totalAmount, installmentAmount: baseAmount, installments };
}

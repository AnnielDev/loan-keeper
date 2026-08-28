import type { InterestType, PaymentFrequency } from "@/types/loan";

export type LoanCalculationInput = {
  principal: number;
  interestRate: number;
  interestType: InterestType;
  installmentsCount: number;
  frequency: PaymentFrequency;
  startDate: Date;
  collectionDate: Date;
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

export type AmortizationRow = {
  period: number;
  dueDate: Date;
  startingBalance: number;
  interest: number;
  principalPaid: number;
  installment: number;
  endingBalance: number;
};

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Cuota fija de una amortización francesa (interés compuesto sobre saldo insoluto). */
function calculateCompoundInstallment(principal: number, rate: number, n: number): number {
  if (n <= 0) return 0;
  if (rate === 0) return round(principal / n);
  const growth = Math.pow(1 + rate, n);
  return round((principal * rate * growth) / (growth - 1));
}

function monthsPerFrequency(frequency: PaymentFrequency): number {
  if (frequency === "every_2_months") return 2;
  if (frequency === "every_3_months") return 3;
  return 1;
}

function calculateTotalInterest(input: LoanCalculationInput): number {
  const rate = (input.interestRate / 100) * monthsPerFrequency(input.frequency);
  const n = input.installmentsCount;

  if (input.interestType === "compound") {
    if (n <= 0) return 0;
    const installment = calculateCompoundInstallment(input.principal, rate, n);
    return round(installment * n - input.principal);
  }

  return round(input.principal * rate * n);
}

function addPeriods(startDate: Date, frequency: PaymentFrequency, periods: number): Date {
  const date = new Date(startDate);
  date.setMonth(date.getMonth() + periods * monthsPerFrequency(frequency));
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

  const rate = (input.interestRate / 100) * monthsPerFrequency(input.frequency);

  // Para "compound" usamos la cuota fija de la amortización francesa directamente,
  // en vez de derivarla de totalAmount / count, para evitar descuadres de redondeo.
  const baseAmount =
    input.interestType === "compound"
      ? calculateCompoundInstallment(input.principal, rate, count)
      : round(totalAmount / count);

  const installments = Array.from({ length: count }, (_, index) => {
    const isLast = index === count - 1;
    const amount = isLast ? round(totalAmount - baseAmount * (count - 1)) : baseAmount;
    return { dueDate: addPeriods(input.collectionDate, input.frequency, index), amount };
  });

  return { totalInterest, totalAmount, installmentAmount: baseAmount, installments };
}

/** Tabla de amortización mes a mes (interés compuesto / saldo insoluto). */
export function calculateCompoundAmortizationSchedule(
  input: LoanCalculationInput
): AmortizationRow[] {
  const rate = (input.interestRate / 100) * monthsPerFrequency(input.frequency);
  const n = Math.max(Math.trunc(input.installmentsCount) || 0, 0);
  if (n === 0) return [];

  const installment = calculateCompoundInstallment(input.principal, rate, n);
  let balance = input.principal;
  const rows: AmortizationRow[] = [];

  for (let period = 1; period <= n; period++) {
    const interest = round(balance * rate);
    const isLast = period === n;
    // En la última cuota, el capital amortizado es exactamente lo que queda de saldo,
    // para que endingBalance cierre en 0.00 sin residuos por acumulación de redondeo.
    const principalPaid = isLast ? round(balance) : round(installment - interest);
    const endingBalance = isLast ? 0 : round(balance - principalPaid);

    rows.push({
      period,
      dueDate: addPeriods(input.collectionDate, input.frequency, period - 1),
      startingBalance: round(balance),
      interest,
      principalPaid,
      installment: isLast ? round(interest + principalPaid) : installment,
      endingBalance,
    });

    balance = endingBalance;
  }

  return rows;
}

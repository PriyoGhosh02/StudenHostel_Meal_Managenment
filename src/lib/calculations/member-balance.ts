/**
 * Calculate member balance: Total Deposits - (Meal Cost + Individual Expenses + Shared Expenses)
 */
export function calculateMemberBalance(params: {
  totalDeposited: number;
  mealCost: number;
  individualExpenses: number;
  sharedExpenses: number;
}): {
  totalDebit: number;
  netBalance: number;
  status: "surplus" | "due" | "settled";
} {
  const totalDebit = Number(
    (params.mealCost + params.individualExpenses + params.sharedExpenses).toFixed(2)
  );
  const netBalance = Number((params.totalDeposited - totalDebit).toFixed(2));

  let status: "surplus" | "due" | "settled" = "settled";
  if (netBalance > 0) status = "surplus";
  else if (netBalance < 0) status = "due";

  return {
    totalDebit,
    netBalance,
    status,
  };
}

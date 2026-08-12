/**
 * Calculate the current meal rate: Total Bazaar Expense / Total Consumed Meals
 */
export function calculateMealRate(totalBazaarExpense: number, totalMeals: number): number {
  if (!totalMeals || totalMeals <= 0) return 0;
  return Number((totalBazaarExpense / totalMeals).toFixed(2));
}

/**
 * Calculate individual member meal cost
 */
export function calculateMemberMealCost(memberMeals: number, mealRate: number): number {
  return Number((memberMeals * mealRate).toFixed(2));
}

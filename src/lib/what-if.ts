/**
 * What-if calculator — NEW-24.
 *
 * Pure: given a category's last-12-months spend and a target percent cut,
 * project the yearly saving.
 */
export type WhatIfInput = {
  monthlyAvgPaise: number;
  cutPercent: number;          // 0..100
  monthsAhead: number;
};

export type WhatIfResult = {
  savingsPaise: number;
  newMonthlyPaise: number;
};

export function whatIf(input: WhatIfInput): WhatIfResult {
  const newMonthly = Math.round((input.monthlyAvgPaise * (100 - input.cutPercent)) / 100);
  const monthlySaving = input.monthlyAvgPaise - newMonthly;
  return {
    savingsPaise: monthlySaving * input.monthsAhead,
    newMonthlyPaise: newMonthly,
  };
}

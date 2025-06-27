// src/utils/medicineUtils.jsx

import { parseISO, differenceInDays, isValid } from "date-fns";

/**
 * Evaluates the status of a medicine based on its expiry date and stock.
 *
 * @param {Object} med - Medicine object.
 * @param {number} expiryThreshold - Number of days to consider as "expiring soon".
 * @returns {Object} - Status flags: { expired, expiringSoon, lowStock, ok }
 */
export function getStatusFlags(med, expiryThreshold = 30) {
  if (!med) return {};

  const today = new Date();
  const expiryDate = med.expiry ? parseISO(med.expiry) : null;
  const daysToExpiry =
    expiryDate && isValid(expiryDate)
      ? differenceInDays(expiryDate, today)
      : null;

  const expired = daysToExpiry !== null && daysToExpiry < 0;
  const expiringSoon =
    daysToExpiry !== null && daysToExpiry <= expiryThreshold && daysToExpiry >= 0;
  const lowStock = med.stock <= med.reorderLevel;
  const ok = !expired && !expiringSoon && !lowStock;

  return { expired, expiringSoon, lowStock, ok };
}

/**
 * Summarizes all medicines into stock health categories.
 *
 * @param {Array} medicines - Array of medicine objects.
 * @param {number} expiryThreshold - Days to consider "expiring soon".
 * @returns {Object} - Summary object: { expired, expiringSoon, lowStock, ok }
 */
export function getStockSummary(medicines, expiryThreshold = 30) {
  const summary = {
    expired: 0,
    expiringSoon: 0,
    lowStock: 0,
    ok: 0,
  };

  medicines.forEach((med) => {
    const status = getStatusFlags(med, expiryThreshold);
    if (status.expired) summary.expired += 1;
    else if (status.expiringSoon) summary.expiringSoon += 1;
    else if (status.lowStock) summary.lowStock += 1;
    else summary.ok += 1;
  });

  return summary;
}
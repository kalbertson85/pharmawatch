// utils/notifications.js

import { parseISO, differenceInDays, isValid } from "date-fns";

const EXPIRY_SOON_DAYS = 7;

export function getMedicineAlerts(medicines) {
  const now = new Date();
  const expired = [];
  const expiringSoon = [];
  const lowStock = [];

  for (const med of medicines) {
    const expiryDate = med.expiry ? parseISO(med.expiry) : null;
    const daysToExpiry =
      expiryDate && isValid(expiryDate)
        ? differenceInDays(expiryDate, now)
        : null;

    if (daysToExpiry !== null && daysToExpiry < 0) {
      expired.push(med);
    } else if (
      daysToExpiry !== null &&
      daysToExpiry >= 0 &&
      daysToExpiry <= EXPIRY_SOON_DAYS
    ) {
      expiringSoon.push(med);
    }

    if (med.stock <= med.reorderLevel) {
      lowStock.push(med);
    }
  }

  return {
    expired,
    expiringSoon,
    lowStock,
  };
}
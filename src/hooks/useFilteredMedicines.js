import { useMemo } from "react";
import { parseISO, isValid, differenceInDays } from "date-fns";

const expiryThreshold = 30; // days for "expiring soon" status

export default function useFilteredMedicines({
  medicines,
  searchTerm,
  filterCountry,
  filterDistrict,
  filterChiefdom,
  filterFacility,
  filterStatus,
}) {
  return useMemo(() => {
    const search = searchTerm.toLowerCase();

    return medicines.filter((med) => {
      if (
        search &&
        !(
          med.name?.toLowerCase().includes(search) ||
          med.batchNumber?.toLowerCase().includes(search) ||
          med.facility?.toLowerCase().includes(search)
        )
      ) {
        return false;
      }

      if (filterCountry && med.country !== filterCountry) return false;
      if (filterDistrict && med.district !== filterDistrict) return false;
      if (filterChiefdom && med.chiefdom !== filterChiefdom) return false;
      if (filterFacility && med.facility !== filterFacility) return false;

      if (filterStatus) {
        const expiryDate = med.expiry ? parseISO(med.expiry) : null;
        const daysToExpiry =
          expiryDate && isValid(expiryDate)
            ? differenceInDays(expiryDate, new Date())
            : null;

        const expired = daysToExpiry !== null && daysToExpiry < 0;
        const closeToExpiry =
          daysToExpiry !== null &&
          daysToExpiry <= expiryThreshold &&
          daysToExpiry >= 0;
        const lowStock = med.stock <= med.reorderLevel;

        switch (filterStatus) {
          case "expired":
            if (!expired) return false;
            break;
          case "expiringSoon":
            if (!closeToExpiry) return false;
            break;
          case "lowStock":
            if (!lowStock) return false;
            break;
          case "ok":
            if (expired || closeToExpiry || lowStock) return false;
            break;
          default:
            break;
        }
      }

      return true;
    });
  }, [
    medicines,
    searchTerm,
    filterCountry,
    filterDistrict,
    filterChiefdom,
    filterFacility,
    filterStatus,
  ]);
}
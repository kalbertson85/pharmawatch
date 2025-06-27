import { useMemo } from "react";

const useFilteredMedicines = ({
  medicines,
  searchTerm,
  filterCountry,
  filterDistrict,
  filterChiefdom,
  filterFacility,
  filterStatus,
}) => {
  return useMemo(() => {
    return medicines.filter((med) => {
      if (
        searchTerm &&
        !med.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !med.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false;
      if (filterCountry && med.country !== filterCountry) return false;
      if (filterDistrict && med.district !== filterDistrict) return false;
      if (filterChiefdom && med.chiefdom !== filterChiefdom) return false;
      if (filterFacility && med.facility !== filterFacility) return false;
      if (filterStatus && med.status !== filterStatus) return false;
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
};

export default useFilteredMedicines;
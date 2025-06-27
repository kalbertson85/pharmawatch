import React from "react";
import { Input, Button, Tooltip } from "@dhis2/ui";
import {
  HiOutlineExclamationCircle,
  HiCheckCircle,
} from "react-icons/hi";
import { parseISO, isValid, differenceInDays } from "date-fns";
import { hasRole } from "../utils/roleUtils";

const expiryThreshold = 30;

const MedicineRow = ({
  med,
  index,
  isEditing,
  editForm,
  onEditClick,
  onCancelClick,
  onChange,
  onSaveClick,
  onDeleteClick,
  user,
}) => {
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

  const statusIcons = [];
  if (expired)
    statusIcons.push(
      <Tooltip
        content="This medicine is past its expiry date."
        key="expired"
      >
        <HiOutlineExclamationCircle className="text-dhis2-red" />
      </Tooltip>
    );
  else if (closeToExpiry)
    statusIcons.push(
      <Tooltip
        content={`Will expire in ${daysToExpiry} day${daysToExpiry !== 1 ? "s" : ""}.`}
        key="expiringSoon"
      >
        <HiOutlineExclamationCircle className="text-yellow-700" />
      </Tooltip>
    );
  if (lowStock)
    statusIcons.push(
      <Tooltip
        content={`Stock is low (${med.stock}), reorder level is ${med.reorderLevel}.`}
        key="lowStock"
      >
        <HiOutlineExclamationCircle className="text-yellow-600" />
      </Tooltip>
    );
  if (statusIcons.length === 0)
    statusIcons.push(
      <Tooltip content="No issues with expiry or stock." key="ok">
        <HiCheckCircle className="text-dhis2-green" />
      </Tooltip>
    );

  return (
    <tr
      className={`${
        expired
          ? "bg-dhis2-red-light text-dhis2-red-dark border border-dhis2-red-dark"
          : closeToExpiry
          ? "bg-yellow-100 text-yellow-800"
          : lowStock
          ? "bg-dhis2-yellow-light text-dhis2-text border border-yellow-400"
          : "bg-dhis2-green text-white"
      }`}
    >
      <td className="px-2 py-1 whitespace-nowrap max-w-[140px]">
        {isEditing ? (
          <Input
            name="name"
            value={editForm.name}
            onChange={onChange}
            disabled={!hasRole(user, "admin")}
            dense
            aria-label="Edit medicine name"
          />
        ) : (
          med.name
        )}
      </td>

      <td className="px-2 py-1 whitespace-nowrap max-w-[120px]">
        {isEditing ? (
          <Input
            name="batchNumber"
            value={editForm.batchNumber}
            onChange={onChange}
            disabled={!hasRole(user, "admin")}
            dense
            aria-label="Edit batch number"
          />
        ) : (
          med.batchNumber
        )}
      </td>

      <td className="px-2 py-1 whitespace-nowrap max-w-[110px]">
        {isEditing ? (
          <Input
            name="expiry"
            type="date"
            value={editForm.expiry || ""}
            onChange={onChange}
            disabled={!hasRole(user, "admin")}
            dense
            aria-label="Edit expiry date"
          />
        ) : (
          med.expiry
        )}
      </td>

      <td className="px-2 py-1 whitespace-nowrap max-w-[80px] text-right">
        {isEditing ? (
          <Input
            name="stock"
            type="number"
            value={editForm.stock}
            onChange={onChange}
            disabled={!hasRole(user, "admin")}
            dense
            aria-label="Edit stock"
            min={0}
          />
        ) : (
          med.stock
        )}
      </td>

      <td className="px-2 py-1 whitespace-nowrap max-w-[80px] text-right">
        {isEditing ? (
          <Input
            name="reorderLevel"
            type="number"
            value={editForm.reorderLevel}
            onChange={onChange}
            disabled={!hasRole(user, "admin")}
            dense
            aria-label="Edit reorder level"
            min={0}
          />
        ) : (
          med.reorderLevel
        )}
      </td>

      <td className="px-2 py-1 whitespace-nowrap max-w-[120px]">
        {isEditing ? (
          <Input
            name="country"
            value={editForm.country}
            onChange={onChange}
            disabled={!hasRole(user, "admin")}
            dense
            aria-label="Edit country"
          />
        ) : (
          med.country
        )}
      </td>

      <td className="px-2 py-1 whitespace-nowrap max-w-[120px]">
        {isEditing ? (
          <Input
            name="district"
            value={editForm.district}
            onChange={onChange}
            disabled={!hasRole(user, "admin")}
            dense
            aria-label="Edit district"
          />
        ) : (
          med.district
        )}
      </td>

      <td className="px-2 py-1 whitespace-nowrap max-w-[120px]">
        {isEditing ? (
          <Input
            name="chiefdom"
            value={editForm.chiefdom}
            onChange={onChange}
            disabled={!hasRole(user, "admin")}
            dense
            aria-label="Edit chiefdom"
          />
        ) : (
          med.chiefdom
        )}
      </td>

      <td className="px-2 py-1 whitespace-nowrap max-w-[120px]">
        {isEditing ? (
          <Input
            name="facility"
            value={editForm.facility}
            onChange={onChange}
            disabled={!hasRole(user, "admin")}
            dense
            aria-label="Edit facility"
          />
        ) : (
          med.facility
        )}
      </td>

      <td className="px-2 py-1 whitespace-nowrap max-w-[60px] text-center">
        <div className="flex justify-center gap-1 text-lg">{statusIcons}</div>
      </td>

      <td className="px-2 py-1 whitespace-nowrap max-w-[110px]">
        {isEditing ? (
          <>
            <Button small onClick={onSaveClick} primary aria-label="Save changes">
              Save
            </Button>
            <Button
              small
              onClick={onCancelClick}
              secondary
              aria-label="Cancel editing"
              className="ml-1"
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            {hasRole(user, "admin") && (
              <>
                <Button
                  small
                  onClick={() => onEditClick(index)}
                  secondary
                  aria-label={`Edit medicine ${med.name}`}
                >
                  Edit
                </Button>
                <Button
                  small
                  onClick={() => onDeleteClick(index)}
                  destructive
                  aria-label={`Delete medicine ${med.name}`}
                  className="ml-1"
                >
                  Delete
                </Button>
              </>
            )}
          </>
        )}
      </td>
    </tr>
  );
};

export default MedicineRow;
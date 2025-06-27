import React from "react";

const statusTooltips = {
  low: "Low Stock",
  expired: "Expired",
  outOfStock: "Out of Stock",
};

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
  // Determine status flags
  const isExpired = (() => {
    if (!med.expiry) return false;
    const expiryDate = new Date(med.expiry);
    return expiryDate < new Date();
  })();

  const isLowStock = med.stock <= med.reorderLevel && med.stock > 0;
  const isOutOfStock = med.stock === 0;

  // Compose status icons with tooltips
  const statusItems = [];
  if (isExpired) statusItems.push({ key: "E", title: statusTooltips.expired });
  if (isOutOfStock) statusItems.push({ key: "O", title: statusTooltips.outOfStock });
  if (isLowStock) statusItems.push({ key: "L", title: statusTooltips.low });

  return (
    <tr className="text-sm">
      {/* Name */}
      <td className="px-2 py-1">{isEditing ? (
        <input
          name="name"
          value={editForm.name}
          onChange={onChange}
          className="w-full border border-gray-300 rounded px-1 py-0.5 text-sm"
        />
      ) : (
        med.name
      )}</td>

      {/* Batch Number */}
      <td className="px-2 py-1">{isEditing ? (
        <input
          name="batchNumber"
          value={editForm.batchNumber}
          onChange={onChange}
          className="w-full border border-gray-300 rounded px-1 py-0.5 text-sm"
        />
      ) : (
        med.batchNumber
      )}</td>

      {/* Expiry */}
      <td className="px-2 py-1">{isEditing ? (
        <input
          type="date"
          name="expiry"
          value={editForm.expiry}
          onChange={onChange}
          className="w-full border border-gray-300 rounded px-1 py-0.5 text-sm"
        />
      ) : (
        med.expiry
      )}</td>

      {/* Stock */}
      <td className="px-2 py-1 text-right">{isEditing ? (
        <input
          type="number"
          name="stock"
          value={editForm.stock}
          onChange={onChange}
          min={0}
          className="w-16 border border-gray-300 rounded px-1 py-0.5 text-sm text-right"
        />
      ) : (
        med.stock
      )}</td>

      {/* Reorder Level */}
      <td className="px-2 py-1 text-right">{isEditing ? (
        <input
          type="number"
          name="reorderLevel"
          value={editForm.reorderLevel}
          onChange={onChange}
          min={0}
          className="w-16 border border-gray-300 rounded px-1 py-0.5 text-sm text-right"
        />
      ) : (
        med.reorderLevel
      )}</td>

      {/* Country */}
      <td className="px-2 py-1">{isEditing ? (
        <input
          name="country"
          value={editForm.country}
          onChange={onChange}
          className="w-full border border-gray-300 rounded px-1 py-0.5 text-sm"
        />
      ) : (
        med.country
      )}</td>

      {/* District */}
      <td className="px-2 py-1">{isEditing ? (
        <input
          name="district"
          value={editForm.district}
          onChange={onChange}
          className="w-full border border-gray-300 rounded px-1 py-0.5 text-sm"
        />
      ) : (
        med.district
      )}</td>

      {/* Chiefdom */}
      <td className="px-2 py-1">{isEditing ? (
        <input
          name="chiefdom"
          value={editForm.chiefdom}
          onChange={onChange}
          className="w-full border border-gray-300 rounded px-1 py-0.5 text-sm"
        />
      ) : (
        med.chiefdom
      )}</td>

      {/* Facility */}
      <td className="px-2 py-1">{isEditing ? (
        <input
          name="facility"
          value={editForm.facility}
          onChange={onChange}
          className="w-full border border-gray-300 rounded px-1 py-0.5 text-sm"
        />
      ) : (
        med.facility
      )}</td>

      {/* Status */}
      <td className="px-2 py-1 text-center space-x-1">
        {!isEditing && statusItems.length > 0 && statusItems.map(({ key, title }) => (
          <span
            key={key}
            title={title}
            className="inline-block font-bold text-xs text-red-600 cursor-help select-none"
            style={{ userSelect: "none" }}
          >
            {key}
          </span>
        ))}
      </td>

      {/* Actions */}
      <td className="px-2 py-1">
        {isEditing ? (
          <>
            <button
              onClick={onSaveClick}
              className="mr-2 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
            >
              Save
            </button>
            <button
              onClick={onCancelClick}
              className="px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onEditClick(index)}
              className="mr-2 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
              disabled={!med.canEdit}
              title={med.canEdit ? "Edit" : "No permission to edit"}
            >
              Edit
            </button>
            <button
              onClick={() => onDeleteClick(index)}
              className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
              disabled={!med.canDelete}
              title={med.canDelete ? "Delete" : "No permission to delete"}
            >
              Delete
            </button>
          </>
        )}
      </td>
    </tr>
  );
};

export default MedicineRow;
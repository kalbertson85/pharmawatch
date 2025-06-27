// src/components/LogoutButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as AlertDialog from "@radix-ui/react-alert-dialog";

const LogoutButton = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleConfirmLogout = () => {
    if (onLogout) onLogout();
    toast.success("Logged out successfully.");
    navigate("/");
  };

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <button
          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
          aria-label="Logout"
          title="Logout"
        >
          Logout
        </button>
      </AlertDialog.Trigger>

      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black bg-opacity-30" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 w-96 max-w-full -translate-x-1/2 -translate-y-1/2 rounded bg-white p-6 shadow-lg">
          <AlertDialog.Title className="text-lg font-semibold mb-2">
            Confirm Logout
          </AlertDialog.Title>
          <AlertDialog.Description className="mb-6 text-gray-700">
            Are you sure you want to logout?
          </AlertDialog.Description>

          <div className="flex justify-end space-x-4">
            <AlertDialog.Cancel asChild>
              <button className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                Cancel
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleConfirmLogout}
              >
                Logout
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

export default LogoutButton;
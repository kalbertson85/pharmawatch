import React from "react";
import { Modal, Button } from "@dhis2/ui";

const ConfirmModal = ({ open, title, message, onConfirm, onCancel }) => {
  return (
    <Modal open={open} onClose={onCancel} position="middle" large>
      <Modal.Title>{title}</Modal.Title>
      <Modal.Content>
        <p>{message}</p>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={onCancel} secondary>
          Cancel
        </Button>
        <Button onClick={onConfirm} destructive>
          Confirm
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default ConfirmModal;
// RequestModal.tsx
import React from "react";
import { Button } from "@/components/ui/button";

interface Request {
  id: string;
  name: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
}

interface RequestModalProps {
  newRequest: Request;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  saveRequest: () => void;
  closeModal: () => void;
}

export const RequestModal: React.FC<RequestModalProps> = ({
  newRequest,
  handleInputChange,
  saveRequest,
  closeModal,
}) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Add New Request</h3>
        <input
          type="text"
          name="name"
          placeholder="Request Name"
          value={newRequest.name}
          onChange={handleInputChange}
          className="input"
        />
        <input
          type="text"
          name="method"
          placeholder="Method (GET, POST, etc.)"
          value={newRequest.method}
          onChange={handleInputChange}
          className="input"
        />
        <input
          type="text"
          name="url"
          placeholder="URL"
          value={newRequest.url}
          onChange={handleInputChange}
          className="input"
        />
        <textarea
          name="body"
          placeholder="Request Body"
          value={newRequest.body}
          onChange={handleInputChange}
          className="textarea"
        />
        <div className="modal-actions">
          <Button onClick={saveRequest}>Save</Button>
          <Button onClick={closeModal}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};
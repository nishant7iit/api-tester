// CollectionCard.tsx
import React from "react";
import { Card } from "@/components/ui/card";

interface Request {
  id: string;
  name: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
}

interface Collection {
  id: string;
  name: string;
  requests: Request[];
}

interface CollectionCardProps {
  collection: Collection;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({ collection }) => {
  return (
    <Card key={collection.id} className="mb-4 p-4">
      <h3 className="font-bold">{collection.name}</h3>
      <div className="collapsible">
        <input type="checkbox" id={`collapsible-${collection.id}`} className="hidden" />
        <label htmlFor={`collapsible-${collection.id}`} className="cursor-pointer text-blue-500">
          View Requests
        </label>
        <div className="collapsible-content">
          <ul>
            {collection.requests.map((req) => (
              <li key={req.id} className="text-sm">
                <p className="font-semibold">{req.method} {req.url}</p>
                <p className="text-xs text-gray-500">{req.body || "No Body"}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};
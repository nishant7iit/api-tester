// CollectionsHistory.tsx
import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
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

import { CollectionCard } from "./CollectionCard";
import { RequestModal } from "./RequestModal";

export function CollectionsHistory() {
    
    const [collections, setCollections] = useState<Collection[]>([]);
    
    const handleDragEnd = (result: any) => {
        if (!result.destination) return;
    
        const reorderedCollections = Array.from(collections);
        const [removed] = reorderedCollections.splice(result.source.index, 1);
        reorderedCollections.splice(result.destination.index, 0, removed);
    
        setCollections(reorderedCollections);
    };
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [newRequest, setNewRequest] = useState<Request>({
        id: "",
        name: "",
        method: "GET",
        url: "",
        headers: {},
        body: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewRequest((prev) => ({ ...prev, [name]: value }));
    };

    const saveRequest = () => {
        console.log("Saving request:", newRequest);
        if (!selectedCollectionId) {
            alert("Please select a collection first.");
            return;
        }
        const requestWithId = { ...newRequest, id: Date.now().toString() };
        addRequestToCollection(requestWithId);
        setShowRequestModal(false);
        setNewRequest({ id: "", name: "", method: "GET", url: "", headers: {}, body: "" });
    };
    const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

    const addRequestToCollection = (request: Request) => {
        console.log("Adding request to collection:", request, "Collection ID:", selectedCollectionId);
        if (!selectedCollectionId) {
            alert("Please select a collection first.");
            return;
        }
        setCollections((prevCollections) =>
            prevCollections.map((collection) =>
                collection.id === selectedCollectionId
                    ? { ...collection, requests: [...collection.requests, request] }
                    : collection
            )
        );
    };
  const [history, setHistory] = useState<Request[]>([]);
  const [activeTab, setActiveTab] = useState("collections");

  const addCollection = () => {
    const newCollection: Collection = {
      id: Date.now().toString(),
      name: `New Collection ${collections.length + 1}`,
      requests: [],
    };
    setCollections([...collections, newCollection]);
  };

  const addRequestToHistory = (request: Request) => {
      console.log("Adding request to history:", request);
      setHistory([request, ...history.slice(0, 49)]); // Limit history to 50 entries
  };

  
  const exportCollections = () => {
      try {
          const dataStr = JSON.stringify(collections, null, 2);
          const blob = new Blob([dataStr], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "collections.json";
          link.click();
          URL.revokeObjectURL(url);
          alert("Collections exported successfully!");
      } catch {
          alert("Failed to export collections.");
      }
  };

  const importCollections = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
              try {
                  const importedCollections = JSON.parse(e.target?.result as string);
                  const mergedCollections = importedCollections.map((imported: Collection) => {
                      const existing = collections.find((col) => col.id === imported.id);
                      return existing
                          ? { ...imported, id: `${imported.id}-${Date.now()}` } // Generate new ID for duplicates
                          : imported;
                  });
                  setCollections((prev) => [...prev, ...mergedCollections]);
                  alert("Collections imported successfully!");
              } catch {
                  alert("Invalid JSON file");
              }
          };
          reader.readAsText(file);
          event.target.value = ""; // Reset file input
      }
  };

  return (
    <div className="gradient-card rounded-lg p-6 space-y-6">
      <Tabs defaultValue="collections" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="collections" onClick={() => setActiveTab("collections")}>
            Collections
          </TabsTrigger>
          <TabsTrigger value="history" onClick={() => setActiveTab("history")}>
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="collections">
          <div className="flex justify-between items-center mb-4">
              <Button onClick={addCollection} aria-label="Add Collection">Add Collection</Button>
              <div className="flex gap-2 items-center">
                  <select
                      className="border rounded p-2"
                      value={selectedCollectionId || ""}
                      onChange={(e) => setSelectedCollectionId(e.target.value)}
                  >
                      <option value="" disabled>
                          Select Collection
                      </option>
                      {collections.map((collection) => (
                          <option key={collection.id} value={collection.id}>
                              {collection.name}
                          </option>
                      ))}
                  </select>
                  <Button onClick={() => setShowRequestModal(true)}>
                      Add Request to Collection
                  </Button>
                  {showRequestModal && (
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
                                  <Button onClick={() => setShowRequestModal(false)}>Cancel</Button>
                              </div>
                          </div>
                      </div>
                  )}
              </div>
            <div className="flex gap-2">
              <Button onClick={exportCollections}>Export</Button>
              <Input type="file" accept="application/json" onChange={importCollections} />
            </div>
          </div>
          <ScrollArea className="h-64">
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="collections">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                            {collections.map((collection, index) => (
                                <Draggable key={collection.id} draggableId={collection.id} index={index}>
                                    {(provided) => (
                                        <Card
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className="mb-4 p-4"
                                        >
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
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="history">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Request History</h3>
            <Button onClick={() => setHistory([])} className="text-red-500">
              Clear History
            </Button>
          </div>
          <ScrollArea className="h-64">
            {history.length > 0 ? (
              history.map((req, index) => (
                <Card key={index} className="mb-4 p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold">{req.method} {req.url}</p>
                      <p className="text-sm text-gray-500">{req.body || "No Body"}</p>
                    </div>
                    <Button
                      onClick={() =>
                        setHistory((prev) => prev.filter((_, i) => i !== index))
                      }
                      className="text-red-500"
                    >
                      Remove
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-gray-500 text-center">No history available.</p>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
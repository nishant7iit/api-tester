import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronRight } from "lucide-react";

interface Request {
  id: string;
  name: string;
  method: string;
  url: string;
  timestamp?: Date;
}

interface Collection {
  id: string;
  name: string;
  requests: Request[];
  expanded: boolean;
}

const mockCollections: Collection[] = [
  {
    id: "1",
    name: "JSONPlaceholder API",
    expanded: true,
    requests: [
      { id: "1", name: "Get all posts", method: "GET", url: "https://jsonplaceholder.typicode.com/posts" },
      { id: "2", name: "Get post by ID", method: "GET", url: "https://jsonplaceholder.typicode.com/posts/1" },
      { id: "3", name: "Create new post", method: "POST", url: "https://jsonplaceholder.typicode.com/posts" },
    ]
  },
  {
    id: "2", 
    name: "User Management",
    expanded: false,
    requests: [
      { id: "4", name: "Get users", method: "GET", url: "https://jsonplaceholder.typicode.com/users" },
      { id: "5", name: "Update user", method: "PUT", url: "https://jsonplaceholder.typicode.com/users/1" },
    ]
  }
];

const recentRequests: Request[] = [
  { id: "r1", name: "Get posts", method: "GET", url: "https://jsonplaceholder.typicode.com/posts", timestamp: new Date() },
  { id: "r2", name: "Get users", method: "GET", url: "https://jsonplaceholder.typicode.com/users", timestamp: new Date(Date.now() - 3600000) },
];

interface SidebarProps {
  onSelectRequest: (request: Request) => void;
}

export function Sidebar({ onSelectRequest }: SidebarProps) {
  const [collections, setCollections] = useState(mockCollections);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"collections" | "history">("collections");

  const toggleCollection = (id: string) => {
    setCollections(prev =>
      prev.map(col =>
        col.id === id ? { ...col, expanded: !col.expanded } : col
      )
    );
  };

  return (
    <aside className="w-72 bg-muted h-full flex flex-col border-r">
      <div className="p-4 border-b">
        <input
          className="w-full px-3 py-2 rounded border"
          placeholder="Search requests..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="flex gap-2 px-4 py-2">
        <button
          className={`flex-1 py-1 rounded ${activeTab === "collections" ? "bg-background font-bold" : "bg-transparent"}`}
          onClick={() => setActiveTab("collections")}
        >
          Collections
        </button>
        <button
          className={`flex-1 py-1 rounded ${activeTab === "history" ? "bg-background font-bold" : "bg-transparent"}`}
          onClick={() => setActiveTab("history")}
        >
          History
        </button>
      </div>
      <ScrollArea className="flex-1 px-2">
        {activeTab === "collections" && (
          <div>
            {collections.map(col => (
              <div key={col.id} className="mb-2">
                <button
                  className="flex items-center w-full px-2 py-1 rounded hover:bg-accent"
                  onClick={() => toggleCollection(col.id)}
                >
                  {col.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <span className="ml-2 font-semibold">{col.name}</span>
                </button>
                {col.expanded && (
                  <div className="ml-6 mt-1">
                    {col.requests.map(req => (
                      <div
                        key={req.id}
                        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-primary/10 cursor-pointer"
                        onClick={() => onSelectRequest(req)}
                      >
                        <Badge variant="outline" className="text-xs">{req.method}</Badge>
                        <span className="truncate">{req.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {activeTab === "history" && (
          <div>
            {recentRequests.map(req => (
              <div
                key={req.id}
                className="flex items-center gap-2 px-2 py-1 rounded hover:bg-primary/10 cursor-pointer"
                onClick={() => onSelectRequest(req)}
              >
                <Badge variant="outline" className="text-xs">{req.method}</Badge>
                <span className="truncate">{req.name}</span>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Folder, History, Plus, ChevronDown, ChevronRight } from "lucide-react";

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

interface SidebarProps {
  onSelectRequest: (request: Request) => void;
}

export function Sidebar({ onSelectRequest }: SidebarProps) {
  const [collections, setCollections] = useState(mockCollections);
  const [history, setHistory] = useState<Request[]>([]);

  useEffect(() => {
    const storedHistory = localStorage.getItem("requestHistory");
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  const toggleCollection = (id: string) => {
    setCollections(prev =>
      prev.map(col =>
        col.id === id ? { ...col, expanded: !col.expanded } : col
      )
    );
  };

  return (
    <aside className="w-72 bg-gray-50 dark:bg-gray-800 h-full flex flex-col border-r border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold">API Tester</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Collections</h3>
            <button className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
              <Plus size={16} />
            </button>
          </div>
          {collections.map(col => (
            <div key={col.id} className="mb-1">
              <button
                className="flex items-center w-full px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={() => toggleCollection(col.id)}
              >
                {col.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <Folder size={16} className="mx-2" />
                <span>{col.name}</span>
              </button>
              {col.expanded && (
                <div className="pl-8 mt-1 space-y-1">
                  {col.requests.map(req => (
                    <div
                      key={req.id}
                      className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer"
                      onClick={() => onSelectRequest(req)}
                    >
                      <span className={`w-12 text-center text-xs font-semibold ${
                        req.method === 'GET' ? 'text-green-500' :
                        req.method === 'POST' ? 'text-blue-500' :
                        req.method === 'PUT' ? 'text-yellow-500' :
                        'text-red-500'
                      }`}>{req.method}</span>
                      <span className="truncate">{req.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">History</h3>
          {history.map(req => (
            <div
              key={req.id}
              className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
              onClick={() => onSelectRequest(req)}
            >
              <History size={16} className="text-gray-500" />
              <span className={`w-12 text-center text-xs font-semibold ${
                req.method === 'GET' ? 'text-green-500' :
                req.method === 'POST' ? 'text-blue-500' :
                req.method === 'PUT' ? 'text-yellow-500' :
                'text-red-500'
              }`}>{req.method}</span>
              <span className="truncate">{req.url}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
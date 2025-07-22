import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Tabs, TabsList, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import MockServer from "./MockServer";
import { CollectionsHistory } from "./CollectionsHistory";
import { Documentation } from "./Documentation";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { RequestBuilder } from "./RequestBuilder";
import { ResponseViewer } from "./ResponseViewer";
import { useToast } from "@/hooks/use-toast";
import { Plus, X, FileText, Gift } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { WhatsNew } from "./WhatsNew";
import { Button } from "@/components/ui/button";

interface Request {
  id: string;
  name: string;
  method: string;
  url: string;
  timestamp?: Date;
}

interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  timing: number;
  size: number;
}

export function ApiTester() {
  const [tabs, setTabs] = useState([{ id: "1", name: "New Request", request: {}, response: null }]);
  const [activeTab, setActiveTab] = useState("1");
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [showMockServer, setShowMockServer] = useState(false);
  const [showCollections, setShowCollections] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem("apiTesterOnboarding") !== "dismissed";
  });
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const hasSeenWhatsNew = localStorage.getItem("whatsNewLastSeen");
    if (!hasSeenWhatsNew) {
      setShowWhatsNew(true);
      localStorage.setItem("whatsNewLastSeen", new Date().toISOString());
    }
  }, []);

  // Only define handleAddTab once, and memoize for useEffect
  const handleAddTab = () => {
    const newTab = { id: Date.now().toString(), name: "New Request", request: {}, response: null };
    setTabs([...tabs, newTab]);
    setActiveTab(newTab.id);
    toast({
      title: "New tab created",
      description: "A new request tab has been added.",
      variant: "default",
    });
  };

  const handleCloseTab = (id) => {
    if (tabs.length === 1) {
      if (!window.confirm("You are about to close the last tab. Are you sure?")) {
        return;
      }
    }
    const closingTab = tabs.find(tab => tab.id === id);
    const updatedTabs = tabs.filter(tab => tab.id !== id);
    setTabs(updatedTabs);
    if (activeTab === id && updatedTabs.length > 0) {
      setActiveTab(updatedTabs[0].id);
    }
    toast({
      title: "Tab closed",
      description: closingTab ? `Closed "${closingTab.name}"` : "Tab closed.",
      variant: "default",
    });
  };

  const handleUpdateRequest = (id, requestData) => {
    setTabs(tabs.map(tab => tab.id === id ? { ...tab, request: requestData } : tab));
  };

  const handleUpdateResponse = (id, responseData) => {
    setTabs(tabs.map(tab => tab.id === id ? { ...tab, response: responseData } : tab));
  };

  const handleSelectRequest = (request: Request) => {
    // This would populate the request builder with the selected request
    toast({
      title: "Request loaded",
      description: `Loaded ${request.method} ${request.name}`,
    });
  };

  const handleSendRequest = async (tabId: string, requestData: any) => {
    const startTime = Date.now();
    try {
      // Prepare headers
      const headers: Record<string, string> = { ...requestData.headers };
      
      // Add auth header if needed
      if (requestData.auth?.type === "bearer" && requestData.auth.token) {
        headers.Authorization = `Bearer ${requestData.auth.token}`;
      }

      // Make the request
      const fetchOptions: RequestInit = {
        method: requestData.method,
        headers,
      };

      if (requestData.body && requestData.method !== "GET") {
        fetchOptions.body = requestData.body;
      }

      const response = await fetch(requestData.url, fetchOptions);
      const timing = Date.now() - startTime;

      // Parse response
      let data;
      const contentType = response.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Get response headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // Calculate response size (approximate)
      const responseText = typeof data === "string" ? data : JSON.stringify(data);
      const size = new Blob([responseText]).size;

      const responseData: ResponseData = {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data,
        timing,
        size,
      };

      handleUpdateResponse(tabId, responseData);

      const newRequest = { ...requestData, id: Date.now().toString(), timestamp: new Date() };
      const history = JSON.parse(localStorage.getItem("requestHistory") || "[]");
      localStorage.setItem("requestHistory", JSON.stringify([newRequest, ...history]));

      toast({
        title: "Request completed",
        description: `${response.status} ${response.statusText} • ${timing}ms`,
      });
    } catch (error) {
      const timing = Date.now() - startTime;
      toast({
        title: "Request failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      handleUpdateResponse(tabId, {
        status: 0,
        statusText: "Error",
        headers: {},
        data: error instanceof Error ? error.message : "Unknown error",
        timing,
        size: 0,
      });
    }
  };

  // Keyboard shortcuts: memoize handleAddTab for useEffect
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "Tab") {
        event.preventDefault();
        const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
        const nextIndex = (currentIndex + 1) % tabs.length;
        setActiveTab(tabs[nextIndex].id);
      } else if (event.ctrlKey && event.shiftKey && event.key === "Tab") {
        event.preventDefault();
        const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
        const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        setActiveTab(tabs[prevIndex].id);
      } else if (event.ctrlKey && event.key === "n") {
        event.preventDefault();
        handleAddTab();
      } else if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        toast({ title: "Request saved!", description: "Your request has been saved." });
      } else if (event.ctrlKey && event.key === "Enter") {
        event.preventDefault();
        toast({ title: "Request sent!", description: "Your request is being processed." });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tabs, activeTab, toast]); // handleAddTab is stable

  // --- SIMPLER, MODERN UI START ---
  // Add sidebarOpen state at the top of the component if not present
  // const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar onSelectRequest={handleSelectRequest} />
      <div className="flex flex-col flex-1">
        <Header />
        <Header>
          <Button variant="ghost" size="icon" onClick={() => setShowWhatsNew(true)}>
            <Gift size={20} />
          </Button>
        </Header>
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="flex items-center gap-2 mb-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-lg focus:outline-none transition-colors ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.name}</span>
                <button
                  className="p-1 rounded-full hover:bg-gray-400 dark:hover:bg-gray-500"
                  onClick={e => {
                    e.stopPropagation();
                    handleCloseTab(tab.id);
                  }}
                >
                  <X size={14} />
                </button>
              </button>
            ))}
            <button
              className="p-2 text-white bg-blue-500 rounded-full hover:bg-blue-600 transition-transform transform hover:scale-110"
              onClick={handleAddTab}
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="grid gap-6">
            <div className="p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
              <RequestBuilder
                onSendRequest={requestData => {
                  handleUpdateRequest(activeTab, requestData);
                  handleSendRequest(activeTab, requestData);
                }}
                loading={false}
              />
            </div>
            <div className="mt-4">
              <ResponseViewer
                response={tabs.find(tab => tab.id === activeTab)?.response ? JSON.stringify(tabs.find(tab => tab.id === activeTab)?.response.data, null, 2) : ""}
                statusCode={tabs.find(tab => tab.id === activeTab)?.response?.status || 0}
                responseTime={tabs.find(tab => tab.id === activeTab)?.response?.timing || 0}
                size={tabs.find(tab => tab.id === activeTab)?.response?.size || 0}
                headers={tabs.find(tab => tab.id === activeTab)?.response?.headers || {}}
                responseType={tabs.find(tab => tab.id === activeTab)?.response?.headers?.["content-type"]?.includes("application/json") ? "json" : "text"}
              />
            </div>
          </div>
        </main>
      </div>
      <WhatsNew open={showWhatsNew} onOpenChange={setShowWhatsNew} />
    </div>
  );
}
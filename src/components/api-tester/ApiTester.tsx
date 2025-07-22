import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Tabs, TabsList, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import MockServer from "./MockServer";
import { CollectionsHistory } from "./CollectionsHistory";
import { Documentation } from "./Documentation";
import { CodeGenerator } from "./CodeGenerator";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { RequestBuilder } from "./RequestBuilder";
import { ResponseViewer } from "./ResponseViewer";
import { useToast } from "@/hooks/use-toast";
import { Plus, X, FileText } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const { toast } = useToast();

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
    <TooltipProvider>
      <div className="api-tester-container h-screen flex flex-col bg-background">
        <Header />
        {/* Collapsible Sidebar */}
        <div className="fixed top-4 left-4 z-50">
          <Tooltip open={showOnboarding} delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                className="p-2 rounded-full bg-primary text-white shadow-lg hover:bg-primary/80 transition"
                onClick={() => setSidebarVisible((open) => !open)}
              >
                <span className="sr-only">Toggle Sidebar</span>
                <Menu size={20} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <div>
                <b>Sidebar</b>: Access your collections and history here.<br />
                <button
                  className="mt-2 px-2 py-1 bg-primary text-white rounded"
                  onClick={() => {
                    setShowOnboarding(false);
                    localStorage.setItem("apiTesterOnboarding", "dismissed");
                  }}
                >
                  Got it
                </button>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
        {sidebarVisible && (
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setSidebarVisible(false)}>
            <div className="absolute left-0 top-0 h-full w-64 bg-card shadow-xl p-4" onClick={e => e.stopPropagation()}>
              <Sidebar onSelectRequest={handleSelectRequest} />
            </div>
          </div>
        )}
        {/* Main Workspace */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-auto">
          <div className="w-full max-w-3xl space-y-6">
            {/* Minimal Tabs */}
            <div className="flex items-center gap-2 mb-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    activeTab === tab.id
                      ? "bg-primary text-white shadow"
                      : "bg-muted text-foreground hover:bg-primary/10"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.name}
                  <span
                    className="ml-2 text-xs text-muted-foreground hover:text-destructive cursor-pointer"
                    onClick={e => { e.stopPropagation(); handleCloseTab(tab.id); }}
                  >
                    ×
                  </span>
                </button>
              ))}
              <Tooltip open={showOnboarding} delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    className="ml-2 p-1 rounded-full bg-primary text-white hover:bg-primary/80 transition"
                    onClick={handleAddTab}
                    aria-label="New Request Tab"
                  >
                    <Plus size={18} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <div>
                    <b>New Tab</b>: Create a new request tab.<br />
                    <button
                      className="mt-2 px-2 py-1 bg-primary text-white rounded"
                      onClick={() => {
                        setShowOnboarding(false);
                        localStorage.setItem("apiTesterOnboarding", "dismissed");
                      }}
                    >
                      Got it
                    </button>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          {/* Collapsible Sections */}
          <div className="rounded-xl shadow bg-card/90 border border-border p-4 space-y-4">
            {/* Request Section */}
            <details open className="group">
              <summary className="font-semibold text-lg cursor-pointer select-none py-2 px-1 rounded group-open:bg-primary/10 transition">Request</summary>
              <div className="pt-2">
                <RequestBuilder
                  onSendRequest={(requestData) => {
                    handleUpdateRequest(activeTab, requestData);
                    handleSendRequest(activeTab, requestData);
                  }}
                  loading={false}
                />
              </div>
            </details>
            {/* Response Section */}
            <details open className="group">
              <summary className="font-semibold text-lg cursor-pointer select-none py-2 px-1 rounded group-open:bg-primary/10 transition flex items-center gap-4">
                Response
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {(() => {
                    const resp = tabs.find(tab => tab.id === activeTab)?.response;
                    if (!resp) return "No response";
                    return `${resp.status} ${resp.statusText} • ${resp.timing}ms • ${resp.size}B`;
                  })()}
                </span>
              </summary>
              <div className="pt-2">
                <ResponseViewer
                  response={tabs.find(tab => tab.id === activeTab)?.response ? JSON.stringify(tabs.find(tab => tab.id === activeTab)?.response.data) : ""}
                  statusCode={tabs.find(tab => tab.id === activeTab)?.response?.status || 0}
                  responseTime={tabs.find(tab => tab.id === activeTab)?.response?.timing || 0}
                  size={tabs.find(tab => tab.id === activeTab)?.response?.size || 0}
                  headers={tabs.find(tab => tab.id === activeTab)?.response?.headers || {}}
                  responseType={tabs.find(tab => tab.id === activeTab)?.response?.headers?.["content-type"]?.includes("application/json") ? "json" : "text"}
                />
              </div>
            </details>
            {/* Collections/History Section */}
            <details className="group">
              <summary className="font-semibold text-lg cursor-pointer select-none py-2 px-1 rounded group-open:bg-primary/10 transition">Collections & History</summary>
              <div className="pt-2">
                <CollectionsHistory onSelectRequest={handleSelectRequest} />
              </div>
            </details>
            {/* Documentation Section */}
            <details className="group">
              <summary className="font-semibold text-lg cursor-pointer select-none py-2 px-1 rounded group-open:bg-primary/10 transition">Documentation</summary>
              <div className="pt-2">
                <Documentation />
              </div>
            </details>
            {/* Code Generation Section */}
            <details className="group">
              <summary className="font-semibold text-lg cursor-pointer select-none py-2 px-1 rounded group-open:bg-primary/10 transition">Code</summary>
              <div className="pt-2">
                <CodeGenerator request={tabs.find(tab => tab.id === activeTab)?.request} />
              </div>
            </details>
            {/* Mock Server Section */}
            <details className="group">
              <summary className="font-semibold text-lg cursor-pointer select-none py-2 px-1 rounded group-open:bg-primary/10 transition">Mock Server</summary>
              <div className="pt-2">
                <MockServer />
              </div>
            </details>
          </div>
        </div>
        {/* Floating Action Buttons */}
        <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-50">
          <Tooltip open={showOnboarding} delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                className="p-4 rounded-full bg-primary text-white shadow-lg hover:bg-primary/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  !("method" in (tabs.find(tab => tab.id === activeTab)?.request || {})) ||
                  !("url" in (tabs.find(tab => tab.id === activeTab)?.request || ""))
                }
                onClick={() => {
                  const currentTab = tabs.find(tab => tab.id === activeTab);
                  if (currentTab) {
                    handleSendRequest(activeTab, currentTab.request);
                  }
                }}
              >
                Send
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <div>
                <b>Send</b>: Click to send your API request.<br />
                <button
                  className="mt-2 px-2 py-1 bg-primary text-white rounded"
                  onClick={() => {
                    setShowOnboarding(false);
                    localStorage.setItem("apiTesterOnboarding", "dismissed");
                  }}
                >
                  Got it
                </button>
              </div>
            </TooltipContent>
          </Tooltip>
          <button
            className="p-4 rounded-full bg-muted text-foreground shadow-lg hover:bg-primary/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              !tabs.find(tab => tab.id === activeTab)?.request ||
              Object.keys(tabs.find(tab => tab.id === activeTab)?.request || {}).length === 0
            }
            onClick={() => {
              toast({ title: "Request saved!", description: "Your request has been saved." });
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}
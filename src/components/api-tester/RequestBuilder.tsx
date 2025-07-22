import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Play, Plus, X } from "lucide-react";

const HTTP_METHODS = [
  { value: "GET", label: "GET", className: "method-get" },
  { value: "POST", label: "POST", className: "method-post" },
  { value: "PUT", label: "PUT", className: "method-put" },
  { value: "PATCH", label: "PATCH", className: "method-patch" },
  { value: "DELETE", label: "DELETE", className: "method-delete" },
];

interface KeyValue {
  key: string;
  value: string;
}

interface RequestBuilderProps {
  onSendRequest: (request: any) => void;
  onSaveRequest?: (request: any) => void;
  loading?: boolean;
}

export function RequestBuilder({ onSendRequest, onSaveRequest, loading }: RequestBuilderProps): JSX.Element {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/posts");
  const [headers, setHeaders] = useState<KeyValue[]>([
    { key: "Content-Type", value: "application/json" }
  ]);
  const [params, setParams] = useState<KeyValue[]>([]);
  const [body, setBody] = useState("");
  const [auth, setAuth] = useState({ type: "none", token: "" });

  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const updateHeader = (index: number, field: keyof KeyValue, value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const addParam = () => {
    setParams([...params, { key: "", value: "" }]);
  };

  const updateParam = (index: number, field: keyof KeyValue, value: string) => {
    const newParams = [...params];
    newParams[index][field] = value;
    setParams(newParams);
  };

  const removeParam = (index: number) => {
    setParams(params.filter((_, i) => i !== index));
  };

  const buildUrlWithParams = () => {
    const baseUrl = url.split("?")[0];
    const searchParams = new URLSearchParams();
    params.forEach(param => {
      if (param.key) {
        searchParams.append(param.key, param.value);
      }
    });
    const paramString = searchParams.toString();
    return paramString ? `${baseUrl}?${paramString}` : baseUrl;
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(url.split("?")[1]);
    const newParams: KeyValue[] = [];
    urlParams.forEach((value, key) => {
      newParams.push({ key, value });
    });
    setParams(newParams);
  }, [url]);

  const handleSend = () => {
    const finalUrl = buildUrlWithParams();
    const requestData = {
      method,
      url: finalUrl,
      headers: headers.reduce((acc, h) => {
        if (h.key && h.value) acc[h.key] = h.value;
        return acc;
      }, {} as Record<string, string>),
      body: method !== "GET" ? body : undefined,
      auth
    };
    onSendRequest(requestData);
    if (onSaveRequest) {
        onSaveRequest(requestData);
    }
  }

  const selectedMethod = HTTP_METHODS.find(m => m.value === method) || HTTP_METHODS[0];

  return (
    <div className="gradient-card rounded-lg p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HTTP_METHODS.map((method) => (
              <SelectItem key={method.value} value={method.value}>
                <Badge className={`${method.className} text-xs px-2 py-1`}>
                  {method.label}
                </Badge>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Enter request URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="font-mono text-sm"
          />
          <Button 
            onClick={handleSend} 
            disabled={!url || loading}
            className="gap-2 min-w-24"
          >
            <Play className="h-4 w-4" />
            {loading ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="headers" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="headers">Headers</TabsTrigger>
          <TabsTrigger value="body">Body</TabsTrigger>
          <TabsTrigger value="auth">Auth</TabsTrigger>
          <TabsTrigger value="params">Params</TabsTrigger>
        </TabsList>

        <TabsContent value="headers" className="space-y-4">
          <div className="space-y-2">
            {headers.map((header, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  placeholder="Header name"
                  value={header.key}
                  onChange={(e) => updateHeader(index, "key", e.target.value)}
                  className="font-mono text-sm"
                />
                <Input
                  placeholder="Header value"
                  value={header.value}
                  onChange={(e) => updateHeader(index, "value", e.target.value)}
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeHeader(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={addHeader} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Header
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="body" className="space-y-4">
          <div className="space-y-2">
            <Label>Request Body</Label>
            <Textarea
              placeholder="Enter request body (JSON, XML, etc.)"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-32 font-mono text-sm code-editor"
              disabled={method === "GET"}
            />
            {method === "GET" && (
              <p className="text-xs text-muted-foreground">
                GET requests don't support request body
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="auth" className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Authentication Type</Label>
              <Select value={auth.type} onValueChange={(value) => setAuth({ ...auth, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Auth</SelectItem>
                  <SelectItem value="bearer">Bearer Token</SelectItem>
                  <SelectItem value="basic">Basic Auth</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {auth.type === "bearer" && (
              <div className="space-y-2">
                <Label>Bearer Token</Label>
                <Input
                  type="password"
                  placeholder="Enter bearer token"
                  value={auth.token}
                  onChange={(e) => setAuth({ ...auth, token: e.target.value })}
                  className="font-mono text-sm"
                />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="params" className="space-y-4">
          <div className="space-y-2">
            {params.map((param, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  placeholder="Param key"
                  value={param.key}
                  onChange={(e) => updateParam(index, "key", e.target.value)}
                  className="font-mono text-sm"
                />
                <Input
                  placeholder="Param value"
                  value={param.value}
                  onChange={(e) => updateParam(index, "value", e.target.value)}
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeParam(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={addParam} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Param
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
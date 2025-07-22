import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Play, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const HTTP_METHODS = [
  { value: "GET", label: "GET", className: "method-get" },
  { value: "POST", label: "POST", className: "method-post" },
  { value: "PUT", label: "PUT", className: "method-put" },
  { value: "PATCH", label: "PATCH", className: "method-patch" },
  { value: "DELETE", label: "DELETE", className: "method-delete" },
];

interface KeyValuePair {
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
  const [headers, setHeaders] = useState<KeyValuePair[]>([
    { key: "Content-Type", value: "application/json" }
  ]);
  const [params, setParams] = useState<KeyValuePair[]>([]);
  const [body, setBody] = useState("");
  const [auth, setAuth] = useState({ type: "none", token: "" });

  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const updateHeader = (index: number, field: keyof KeyValuePair, value: string) => {
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

  const updateParam = (index: number, field: keyof KeyValuePair, value: string) => {
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
    const newParams: KeyValuePair[] = [];
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
  };

  const handleSave = () => {
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
    if (onSaveRequest) {
      onSaveRequest(requestData);
    }
  };

  const generateCurlSnippet = () => {
    let curl = `curl --request ${method} \\\n  --url ${buildUrlWithParams()}`;

    for (const header of headers) {
      if (header.key && header.value) {
        curl += ` \\\n  --header '${header.key}: ${header.value}'`;
      }
    }

    if (auth.type === 'bearer' && auth.token) {
        curl += ` \\\n  --header 'Authorization: Bearer ${auth.token}'`;
    }

    if (body && method !== "GET") {
      curl += ` \\\n  --data '${body}'`;
    }

    return curl;
  };

  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard!",
      description: "The cURL command has been copied to your clipboard.",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HTTP_METHODS.map((method) => (
              <SelectItem key={method.value} value={method.value}>
                <Badge className={`${method.className} text-xs`}>
                  {method.label}
                </Badge>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Enter request URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 font-mono"
        />
        <Button onClick={handleSend} disabled={!url || loading}>
          <Play className="w-4 h-4 mr-2" />
          {loading ? "Sending..." : "Send"}
        </Button>
        <Button onClick={handleSave} variant="outline">
          Save
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            const curlCommand = generateCurlSnippet();
            copyToClipboard(curlCommand);
          }}
        >
          Copy as cURL
        </Button>
      </div>
      <Tabs defaultValue="params" className="w-full">
        <TabsList>
          <TabsTrigger value="params">Query Params</TabsTrigger>
          <TabsTrigger value="headers">Headers</TabsTrigger>
          <TabsTrigger value="body">Body</TabsTrigger>
          <TabsTrigger value="auth">Auth</TabsTrigger>
        </TabsList>
        <TabsContent value="params" className="mt-4">
          <div className="space-y-2">
            {params.map((param, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder="Key"
                  value={param.key}
                  onChange={(e) => updateParam(index, "key", e.target.value)}
                />
                <Input
                  placeholder="Value"
                  value={param.value}
                  onChange={(e) => updateParam(index, "value", e.target.value)}
                />
                <Button variant="ghost" size="icon" onClick={() => removeParam(index)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addParam}>
              <Plus className="w-4 h-4 mr-2" />
              Add Param
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="headers" className="mt-4">
          <div className="space-y-2">
            {headers.map((header, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder="Key"
                  value={header.key}
                  onChange={(e) => updateHeader(index, "key", e.target.value)}
                />
                <Input
                  placeholder="Value"
                  value={header.value}
                  onChange={(e) => updateHeader(index, "value", e.target.value)}
                />
                <Button variant="ghost" size="icon" onClick={() => removeHeader(index)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addHeader}>
              <Plus className="w-4 h-4 mr-2" />
              Add Header
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="body" className="mt-4">
          <div className="relative">
            <Textarea
              placeholder="Enter request body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="font-mono"
              rows={10}
              disabled={method === "GET"}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => setBody(JSON.stringify(JSON.parse(body), null, 2))}
            >
              Pretty
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="auth" className="mt-4">
          <div className="flex items-center gap-4">
            <Select value={auth.type} onValueChange={(type) => setAuth({ ...auth, type })}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Auth Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Auth</SelectItem>
                <SelectItem value="bearer">Bearer Token</SelectItem>
                <SelectItem value="basic">Basic Auth</SelectItem>
              </SelectContent>
            </Select>
            {auth.type === "bearer" && (
              <Input
                type="password"
                placeholder="Bearer Token"
                value={auth.token}
                onChange={(e) => setAuth({ ...auth, token: e.target.value })}
                className="flex-1"
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
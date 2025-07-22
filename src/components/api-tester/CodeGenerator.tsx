import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface RequestData {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
  auth?: {
    type: string;
    token?: string;
  };
}

interface CodeGeneratorProps {
  request: RequestData;
}

export function CodeGenerator({ request }: CodeGeneratorProps) {
  const { toast } = useToast();

  const generateCurlSnippet = () => {
    let curl = `curl --request ${request.method} \\\n  --url ${request.url}`;

    if (request.headers) {
      for (const [key, value] of Object.entries(request.headers)) {
        curl += ` \\\n  --header '${key}: ${value}'`;
      }
    }

    if (request.auth?.type === 'bearer' && request.auth.token) {
        curl += ` \\\n  --header 'Authorization: Bearer ${request.auth.token}'`;
    }

    if (request.body && request.method !== "GET") {
      curl += ` \\\n  --data '${request.body}'`;
    }

    return curl;
  };

  const generateFetchSnippet = () => {
    const headers = { ...request.headers };
    if (request.auth?.type === 'bearer' && request.auth.token) {
        headers['Authorization'] = `Bearer ${request.auth.token}`;
    }

    let fetchCode = `fetch('${request.url}', {\n`;
    fetchCode += `  method: '${request.method}',\n`;
    fetchCode += `  headers: ${JSON.stringify(headers, null, 2)},\n`;

    if (request.body && request.method !== "GET") {
      fetchCode += `  body: JSON.stringify(${request.body})\n`;
    }

    fetchCode += `})`;
    fetchCode += `.then(response => response.json())\n`;
    fetchCode += `.then(data => console.log(data))\n`;
    fetchCode += `.catch(error => console.error('Error:', error));`;

    return fetchCode;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard!",
      description: "The code snippet has been copied to your clipboard.",
    });
  };

  const curlSnippet = generateCurlSnippet();
  const fetchSnippet = generateFetchSnippet();

  return (
    <div className="mt-4">
      <Tabs defaultValue="curl">
        <TabsList>
          <TabsTrigger value="curl">cURL</TabsTrigger>
          <TabsTrigger value="fetch">Fetch</TabsTrigger>
        </TabsList>
        <TabsContent value="curl">
          <div className="relative">
            <SyntaxHighlighter language="bash" style={a11yDark} showLineNumbers>
              {curlSnippet}
            </SyntaxHighlighter>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => copyToClipboard(curlSnippet)}
            >
              Copy
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="fetch">
          <div className="relative">
            <SyntaxHighlighter language="javascript" style={a11yDark} showLineNumbers>
              {fetchSnippet}
            </SyntaxHighlighter>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => copyToClipboard(fetchSnippet)}
            >
              Copy
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

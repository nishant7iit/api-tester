import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CollectionsHistory } from "./CollectionsHistory";

interface ResponseViewerProps {
  statusCode: number;
  responseTime: number;
  size: number;
  response: string;
  headers: Record<string, string>;
  responseType: "json" | "xml" | "text";
}

export function ResponseViewer({
  statusCode,
  responseTime,
  size,
  response,
  headers,
  responseType,
}: ResponseViewerProps) {
  const [activeTab, setActiveTab] = useState("formatted");

  const downloadResponse = () => {
    console.log("Downloading response:", response);
    const blob = new Blob([response], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "response.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderFormattedResponse = () => {
    if (responseType === "json") {
      try {
        const formattedJson = JSON.stringify(JSON.parse(response), null, 2);
        return (
          <SyntaxHighlighter language="json" style={a11yDark} showLineNumbers>
            {formattedJson}
          </SyntaxHighlighter>
        );
      } catch {
        return <pre>Invalid JSON</pre>;
      }
    }
    return (
      <SyntaxHighlighter language={responseType} style={a11yDark} showLineNumbers>
        {response}
      </SyntaxHighlighter>
    );
  };

  const renderHeaders = () => (
    <Table>
      <thead>
        <tr>
          <th>Key</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(headers).map(([key, value]) => (
          <tr key={key}>
            <td>{key}</td>
            <td>{value}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <div>
      <div>
        <div className="gradient-card rounded-lg p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <p>Status Code: {statusCode}</p>
              <p>Response Time: {responseTime} ms</p>
              <p>Size: {size} bytes</p>
            </div>
            <Button onClick={downloadResponse}>Download Response</Button>
          </div>
          <Tabs defaultValue="formatted" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="formatted" onClick={() => setActiveTab("formatted")}>
                Formatted JSON
              </TabsTrigger>
              <TabsTrigger value="raw" onClick={() => setActiveTab("raw")}>
                Raw Response
              </TabsTrigger>
              <TabsTrigger value="headers" onClick={() => setActiveTab("headers")}>
                Headers
              </TabsTrigger>
            </TabsList>
            <TabsContent value="formatted">{renderFormattedResponse()}</TabsContent>
            <TabsContent value="raw">
              <pre>{response}</pre>
            </TabsContent>
            <TabsContent value="headers">{renderHeaders()}</TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
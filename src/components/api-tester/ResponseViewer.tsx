import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

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
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard!",
      description: "The response has been copied to your clipboard.",
    });
  };

  const renderFormattedResponse = () => {
    if (responseType === "json") {
      try {
        const formattedJson = JSON.stringify(JSON.parse(response), null, 2);
        return (
          <SyntaxHighlighter language="json" style={a11yDark} customStyle={{ margin: 0 }}>
            {formattedJson}
          </SyntaxHighlighter>
        );
      } catch {
        return <pre className="p-4 bg-gray-800 text-white rounded-b-lg">Invalid JSON</pre>;
      }
    }
    return (
      <SyntaxHighlighter language={responseType} style={a11yDark} customStyle={{ margin: 0 }}>
        {response}
      </SyntaxHighlighter>
    );
  };

  const renderHeaders = () => (
    <div className="p-4">
      <Table>
        <thead>
          <tr>
            <th className="text-left">Key</th>
            <th className="text-left">Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(headers).map(([key, value]) => (
            <tr key={key} className="border-b">
              <td className="py-2 font-mono">{key}</td>
              <td className="py-2 font-mono">{value}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Badge className={statusCode >= 200 && statusCode < 300 ? "bg-green-500" : "bg-red-500"}>
            {statusCode}
          </Badge>
          <span>{responseTime} ms</span>
          <span>{size} B</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(response)}>
          Copy
        </Button>
      </div>
      <Tabs defaultValue="body" className="w-full">
        <TabsList className="px-4">
          <TabsTrigger value="body">Body</TabsTrigger>
          <TabsTrigger value="headers">Headers</TabsTrigger>
        </TabsList>
        <TabsContent value="body">{renderFormattedResponse()}</TabsContent>
        <TabsContent value="headers">{renderHeaders()}</TabsContent>
      </Tabs>
    </div>
  );
}
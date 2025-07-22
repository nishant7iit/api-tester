// Documentation.tsx
import React from "react";

export function Documentation() {
  return (
    <div className="p-6 bg-background text-foreground">
      <h1 className="text-xl font-bold">API Testing Tool Documentation</h1>
      <p className="mt-4">
        Welcome to the API Testing Tool! Here you can find information on how to use the tool effectively.
      </p>
      <ul className="list-disc list-inside mt-4">
        <li>Request Builder: Create and send HTTP requests.</li>
        <li>Response Viewer: View and analyze server responses.</li>
        <li>Mock Server: Simulate server endpoints for testing.</li>
        <li>Collections: Organize and manage your API requests.</li>
      </ul>
    </div>
  );
}
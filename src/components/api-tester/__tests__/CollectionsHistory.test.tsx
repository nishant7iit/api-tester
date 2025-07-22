import React from "react";

// Mock window.alert
beforeAll(() => {
  window.alert = jest.fn();
});
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CollectionsHistory } from "../CollectionsHistory";

describe("CollectionsHistory Component", () => {
  it("should add a new collection", () => {
    render(<CollectionsHistory />);
    const addButton = screen.getByRole("button", { name: /Add Collection/i });
    fireEvent.click(addButton);
    expect(screen.getByText("New Collection 1")).toBeInTheDocument();
  });

  it("should save a request to history", () => {
    render(<CollectionsHistory />);
    const addCollectionButton = screen.getByRole("button", { name: /Add Collection/i });
    fireEvent.click(addCollectionButton);
    const mockRequest = {
      id: "1",
      name: "Test Request",
      method: "GET",
      url: "https://example.com",
      headers: {},
    };
    const addRequestToHistory = screen.getByText("Add Request to Collection");
    fireEvent.click(addRequestToHistory);
    const addRequestButton = screen.getByRole("button", { name: /Add Request to Collection/i });
    fireEvent.click(addRequestButton);

    const nameInput = screen.getByPlaceholderText("Request Name");
    const methodInput = screen.getByPlaceholderText("Method (GET, POST, etc.)");
    const urlInput = screen.getByPlaceholderText("URL");

    fireEvent.change(nameInput, { target: { value: "Test Request" } });
    fireEvent.change(methodInput, { target: { value: "GET" } });
    fireEvent.change(urlInput, { target: { value: "https://example.com" } });

    const saveButton = screen.getByRole("button", { name: /Save/i });
    fireEvent.click(saveButton);

    const historyEntry = screen.getByText((content, element) => {
      return element?.tagName === "P" && /GET https:\/\/example\.com/i.test(content);
    });
    expect(historyEntry).toBeInTheDocument();
  });
  it("should export collections as a JSON file", () => {
    const mockCollections = [
      {
        id: "1",
        name: "Collection 1",
        requests: [
          {
            id: "101",
            name: "Request 1",
            method: "GET",
            url: "https://example.com",
            headers: {},
          },
        ],
      },
    ];

    const { container } = render(<CollectionsHistory />);
    const exportButton = screen.getByRole("button", { name: /Export/i });

    // Mock URL.createObjectURL
    const mockCreateObjectURL = jest.fn();
    global.URL.createObjectURL = mockCreateObjectURL;

    fireEvent.click(exportButton);

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockCreateObjectURL.mock.calls[0][0]).toContain(
      JSON.stringify(mockCollections, null, 2)
    );
  });
  it("should import collections from a valid JSON file", () => {
    const mockFileContent = JSON.stringify([
      {
        id: "2",
        name: "Imported Collection",
        requests: [
          {
            id: "201",
            name: "Imported Request",
            method: "POST",
            url: "https://imported.com",
            headers: {},
          },
        ],
      },
    ]);

    const file = new File([mockFileContent], "collections.json", {
      type: "application/json",
    });

    render(<CollectionsHistory />);
    const fileInput = screen.getByLabelText(/import/i);

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByText("Imported Collection")).toBeInTheDocument();
  });

  it("should handle invalid JSON file during import", () => {
    const invalidFileContent = "Invalid JSON";

    const file = new File([invalidFileContent], "invalid.json", {
      type: "application/json",
    });

    render(<CollectionsHistory />);
    const fileInput = screen.getByLabelText(/import/i);

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(window.alert).toHaveBeenCalledWith("Invalid JSON file");
  });
  it("should populate RequestBuilder with saved collection details", () => {
    const mockRequest = {
      id: "1",
      name: "Test Request",
      method: "POST",
      url: "https://example.com",
      headers: { "Content-Type": "application/json" },
      body: '{"key":"value"}',
    };

    const mockOnSaveRequest = jest.fn();

    render(
      <>
        <CollectionsHistory />
      </>
    );

    // Simulate adding a collection
    const addCollectionButton = screen.getByRole("button", { name: /Add Collection/i });
    fireEvent.click(addCollectionButton);

    // Simulate saving a request to the collection
    const addRequestButton = screen.getByRole("button", { name: /Add Request to Collection/i });
    fireEvent.click(addRequestButton);

    const nameInput = screen.getByPlaceholderText("Request Name");
    const methodInput = screen.getByPlaceholderText("Method (GET, POST, etc.)");
    const urlInput = screen.getByPlaceholderText("URL");
    const bodyInput = screen.getByPlaceholderText("Enter request body (JSON, XML, etc.)");

    fireEvent.change(nameInput, { target: { value: mockRequest.name } });
    fireEvent.change(methodInput, { target: { value: mockRequest.method } });
    fireEvent.change(urlInput, { target: { value: mockRequest.url } });
    fireEvent.change(bodyInput, { target: { value: mockRequest.body } });

    const saveButton = screen.getByRole("button", { name: /Save/i });
    fireEvent.click(saveButton);

    // Verify that RequestBuilder received the saved request details
    expect(mockOnSaveRequest).toHaveBeenCalledWith(mockRequest);
  });
  it("should save a response from ResponseViewer into a collection", () => {
    const mockResponse = {
      id: "1",
      name: "Test Response",
      method: "GET",
      url: "https://example.com",
      headers: { "Content-Type": "application/json" },
      body: '{"key":"value"}',
    };

    render(<CollectionsHistory />);
    const addCollectionButton = screen.getByRole("button", { name: /Add Collection/i });
    fireEvent.click(addCollectionButton);

    const selectCollection = screen.getByRole("combobox");
    fireEvent.change(selectCollection, { target: { value: "1" } });

    const addRequestButton = screen.getByRole("button", { name: /Add Request to Collection/i });
    fireEvent.click(addRequestButton);

    const nameInput = screen.getByPlaceholderText("Request Name");
    const methodInput = screen.getByPlaceholderText("Method (GET, POST, etc.)");
    const urlInput = screen.getByPlaceholderText("URL");
    const bodyInput = screen.getByPlaceholderText("Request Body");

    fireEvent.change(nameInput, { target: { value: mockResponse.name } });
    fireEvent.change(methodInput, { target: { value: mockResponse.method } });
    fireEvent.change(urlInput, { target: { value: mockResponse.url } });
    fireEvent.change(bodyInput, { target: { value: mockResponse.body } });

    const saveButton = screen.getByRole("button", { name: /Save/i });
    fireEvent.click(saveButton);

    const savedRequest = screen.getByText((content, element) => {
      return element?.tagName === "P" && /GET https:\/\/example\.com/i.test(content);
    });

    expect(savedRequest).toBeInTheDocument();
  });
});
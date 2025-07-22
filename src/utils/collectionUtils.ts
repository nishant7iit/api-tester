export const exportCollectionsUtil = (collections: any[]) => {
    const dataStr = JSON.stringify(collections, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "collections.json";
    link.click();
    URL.revokeObjectURL(url);
};

export const importCollectionsUtil = (
    event: React.ChangeEvent<HTMLInputElement>,
    existingCollections: any[],
    setCollections: React.Dispatch<React.SetStateAction<any[]>>
) => {
    const file = event.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedCollections = JSON.parse(e.target?.result as string);
                const mergedCollections = importedCollections.map((imported: any) => {
                    const existing = existingCollections.find((col) => col.id === imported.id);
                    return existing
                        ? { ...imported, id: `${imported.id}-${Date.now()}` }
                        : imported;
                });
                setCollections((prev) => [...prev, ...mergedCollections]);
            } catch {
                throw new Error("Invalid JSON file");
            }
        };
        reader.readAsText(file);
        event.target.value = ""; // Reset file input
    }
};
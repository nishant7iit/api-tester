import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function WhatsNew({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>What's New!</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div>
            <h3 className="font-semibold">🚀 New Features</h3>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>"Pretty" button to format JSON in request and response bodies.</li>
              <li>"Copy as cURL" button to easily export requests.</li>
              <li>Request history is now saved to local storage.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">💅 UI Improvements</h3>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>Redesigned layout for a cleaner, more intuitive experience.</li>
              <li>Improved responsiveness for a better experience on all screen sizes.</li>
              <li>Added subtle animations for a smoother feel.</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

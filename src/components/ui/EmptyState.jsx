import { Button } from "@/components/ui/button";
import { FileX } from "lucide-react";

const EmptyState = ({ onClearFilters }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <FileX className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold">No students found</h3>
      <p className="text-sm text-muted-foreground mb-4">
        No students match your current filters.
      </p>
      <Button variant="outline" onClick={onClearFilters}>
        Clear Filters
      </Button>
    </div>
  );
};

export default EmptyState;
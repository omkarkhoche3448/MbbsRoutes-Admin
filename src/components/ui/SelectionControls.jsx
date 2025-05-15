import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const SelectionControls = ({
  selectedCount,
  totalCount,
  onClearSelections,
  onExport,
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <span className="ml-2 font-medium">
          {selectedCount} of {totalCount} selected
        </span>
        {selectedCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearSelections}
            className="ml-2"
          >
            Cancel All Selections
          </Button>
        )}
      </div>
      <Button
        onClick={onExport}
        disabled={selectedCount === 0}
        className="bg-green-600 hover:bg-green-700 text-white mr-10"
      >
        <Download className="mr-2 h-4 w-4" />
        Export Selected to Excel
      </Button>
    </div>
  );
};

export default SelectionControls;
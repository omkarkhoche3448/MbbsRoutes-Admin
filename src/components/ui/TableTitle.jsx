import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";

const TableTitle = ({ onRefresh, loading }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
      <CardTitle className="text-2xl font-bold">MBBS Students</CardTitle>
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        className="mt-2 sm:mt-0"
        disabled={loading}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
        Refresh
      </Button>
    </div>
  );
};

export default TableTitle;
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

const StudentTableHeader = ({ allSelected, onSelectAll }) => {
  return (
    <TableHeader>
      <TableRow className="bg-muted/50">
        <TableHead className="w-[50px] pl-4">
          <div className="flex items-center justify-center">
            <div
              className={`h-5 w-5 rounded-md border ${
                allSelected ? "bg-primary border-primary" : "border-input"
              } flex items-center justify-center cursor-pointer`}
              onClick={onSelectAll}
            >
              {allSelected && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3 w-3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          </div>
        </TableHead>
        <TableHead className="w-[200px]">Name</TableHead>
        <TableHead className="w-[120px]">Contact</TableHead>
        <TableHead className="w-[120px]">State</TableHead>
        <TableHead className="w-[120px]">District</TableHead>
        <TableHead className="w-[120px]">Interested In</TableHead>
        <TableHead className="w-[100px]">NEET Score</TableHead>
        <TableHead className="w-[120px]">Preferred Country</TableHead>
        <TableHead className="w-[150px]">Selected Counsellor</TableHead>
        <TableHead className="w-[120px]">Call Status</TableHead>
        <TableHead className="w-[120px]">Called By</TableHead>
        <TableHead className="w-[100px]">Submitted</TableHead>
        <TableHead className="w-[80px]">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default StudentTableHeader;
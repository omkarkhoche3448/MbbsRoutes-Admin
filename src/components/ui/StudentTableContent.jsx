import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MessageSquare, MoreVertical, Phone } from "lucide-react";
import { format } from "date-fns";
import CallStatusBadge from "./CallStatusBadge";
import { useEffect } from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const StudentTableContent = ({
    filteredStudents,
    selectedStudentsSet,
    onSelectAll,
    onSelectStudent,
    onOpenCallStatus,
    onOpenCallNotes,
    currentPage, 
}) => {
    useEffect(() => {
        window.scrollTo({ top: 300, behavior: "smooth" });
    }, [currentPage]);

    const allSelected =
        filteredStudents.length > 0 &&
        filteredStudents.every((student) =>
            selectedStudentsSet.includes(student._id)
        );

    return (
        <div className="rounded-xl border shadow-lg overflow-hidden bg-white">
            <ScrollArea className="w-full">
                <div className="min-w-[1200px]">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-100 hover:bg-slate-200/80">
                                <TableCell className="w-14 pl-4 sticky left-0 bg-slate-100">
                                    <div className="flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={(e) => onSelectAll(e)}
                                            className="h-4 w-4 rounded border-gray-300 cursor-pointer hover:border-primary"
                                        />
                                    </div>
                                </TableCell>
                                <TableCell className="w-48 font-semibold text-slate-700">Name</TableCell>
                                <TableCell className="w-36 font-semibold text-slate-700">Contact</TableCell>
                                <TableCell className="w-36 font-semibold text-slate-700">State</TableCell>
                                <TableCell className="w-36 font-semibold text-slate-700">District</TableCell>
                                <TableCell className="w-32 font-semibold text-slate-700">Interested In</TableCell>
                                <TableCell className="w-28 font-semibold text-slate-700">NEET Score</TableCell>
                                <TableCell className="w-36 font-semibold text-slate-700">Preferred Country</TableCell>
                                <TableCell className="w-44 font-semibold text-slate-700">Selected Counsellor</TableCell>
                                <TableCell className="w-32 font-semibold text-slate-700">Call Status</TableCell>
                                <TableCell className="w-28 font-semibold text-slate-700">Called By</TableCell>
                                <TableCell className="w-28 font-semibold text-slate-700">Submitted</TableCell>
                                <TableCell className="w-20 font-semibold text-slate-700 text-center">Actions</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStudents.map((student) => (
                                <TableRow
                                    key={student._id}
                                    className="hover:bg-slate-50 transition-colors border-b"
                                >
                                    <TableCell className="pl-4 sticky left-0 bg-white">
                                        <div className="flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedStudentsSet.includes(student._id)}
                                                onChange={(e) => onSelectStudent(student._id, e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300 cursor-pointer hover:border-primary"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-slate-900">
                                        {student.name.length > 25 ? (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        {`${student.name.slice(0, 25)}...`}
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{student.name}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        ) : (
                                            student.name
                                        )}
                                    </TableCell>
                                    <TableCell className="text-blue-600 hover:text-blue-800">{student.contact}</TableCell>
                                    <TableCell className="text-slate-600">{student.state}</TableCell>
                                    <TableCell className="text-slate-600">{student.district}</TableCell>
                                    <TableCell>
                                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                            {student.interestedIn === "MBBS From Abroad"
                                                ? "Abroad"
                                                : student.interestedIn === "MBBS From Private College"
                                                    ? "Private College"
                                                    : student.interestedIn}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-medium text-slate-900">{student.neetScore || "N/A"}</TableCell>
                                    <TableCell>
                                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                                            {student.preferredCountry === "No Idea/ Want More Information"
                                                ? "Seeking Guidance"
                                                : student.preferredCountry}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`${!student.preferredCounsellor ? 'text-slate-400 italic' : 'text-slate-600'}`}>
                                            {student.preferredCounsellor || "Not Assigned"}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <CallStatusBadge status={student.callStatus || "NOT_CALLED"} />
                                    </TableCell>
                                    <TableCell>
                                        {student.calledBy ? (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                                            {`${student.calledBy.slice(0, 6)}...`}
                                                        </span>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className="text-white">{student.calledBy}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        ) : <div className="flex items-center ml-5">{"-"}</div>}
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-slate-600">
                                            {student.submittedAt
                                                ? format(new Date(student.submittedAt), "dd/MM/yyyy")
                                                : "-"}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 hover:bg-slate-100 rounded-full"
                                                    >
                                                        <MoreVertical className="h-4 w-4 text-slate-600" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="end"
                                                    className="w-48 shadow-lg rounded-lg border-slate-200"
                                                >
                                                    <DropdownMenuItem
                                                        onClick={() => onOpenCallStatus(student)}
                                                        className="cursor-pointer hover:bg-slate-50 focus:bg-slate-50"
                                                    >
                                                        <Phone className="mr-2 h-4 w-4 text-blue-600" />
                                                        <span className="text-slate-700">Update Call Status</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => onOpenCallNotes(student)}
                                                        className="cursor-pointer hover:bg-slate-50 focus:bg-slate-50"
                                                    >
                                                        <MessageSquare className="mr-2 h-4 w-4 text-green-600" />
                                                        <span className="text-slate-700">View Call Notes</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </ScrollArea>
        </div>
    );
};

export default StudentTableContent;


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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MessageSquare, MoreVertical, Phone } from "lucide-react";
import { format } from "date-fns";
import CallStatusBadge from "./CallStatusBadge";

const StudentTableContent = ({
    filteredStudents,
    selectedStudentsSet,
    onSelectAll,
    onSelectStudent,
    onOpenCallStatus,
    onOpenCallNotes,
}) => {
    const allSelected =
        filteredStudents.length > 0 &&
        filteredStudents.every((student) =>
            selectedStudentsSet.includes(student._id)
        );

    return (
        <div className="rounded-md border overflow-hidden">
            <ScrollArea className="w-full">
                <div className="min-w-[1000px]">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableCell className="w-[50px] pl-4">
                                    <div className="flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={(e) => onSelectAll(e)}
                                            className="h-4 w-4 rounded border-gray-300"
                                        />
                                    </div>
                                </TableCell>
                                <TableCell className="w-[200px]">Name</TableCell>
                                <TableCell className="w-[120px]">Contact</TableCell>
                                <TableCell className="w-[120px]">State</TableCell>
                                <TableCell className="w-[120px]">District</TableCell>
                                <TableCell className="w-[120px]">Interested In</TableCell>
                                <TableCell className="w-[100px]">NEET Score</TableCell>
                                <TableCell className="w-[120px]">Preferred Country</TableCell>
                                <TableCell className="w-[150px]">Selected Counsellor</TableCell>
                                <TableCell className="w-[120px]">Call Status</TableCell>
                                <TableCell className="w-[120px]">Called By</TableCell>
                                <TableCell className="w-[100px]">Submitted</TableCell>
                                <TableCell className="w-[80px]">Actions</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStudents.map((student) => (
                                <TableRow key={student._id}>
                                    <TableCell className="pl-4">
                                        <div className="flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedStudentsSet.includes(student._id)}
                                                onChange={(e) =>
                                                    onSelectStudent(student._id, e.target.checked)
                                                }
                                                className="h-4 w-4 rounded border-gray-300"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell>{student.contact}</TableCell>
                                    <TableCell>{student.state}</TableCell>
                                    <TableCell>{student.district}</TableCell>
                                    <TableCell>
                                        {student.interestedIn === "MBBS From Abroad" 
                                            ? "Abroad"
                                            : student.interestedIn === "MBBS From Private College"
                                            ? "Private College"
                                            : student.interestedIn}
                                    </TableCell>
                                    <TableCell>{student.neetScore}</TableCell>
                                    <TableCell>
                                        {student.preferredCountry === "No Idea/ Want More Information"
                                            ? "Seeking Guidance"
                                            : student.preferredCountry}
                                    </TableCell>
                                    <TableCell>
                                        {student.preferredCounsellor || "Not Assigned"}
                                    </TableCell>
                                    <TableCell>
                                        <CallStatusBadge status={student.callStatus || "NOT_CALLED"} />
                                    </TableCell>
                                    <TableCell>{student.calledBy ? student.calledBy.slice(0, 6) : "-"}</TableCell>
                                    <TableCell>
                                        {student.submittedAt
                                            ? format(new Date(student.submittedAt), "dd/MM/yyyy")
                                            : "-"}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onOpenCallStatus(student)}>
                                                    <Phone className="mr-2 h-4 w-4" />
                                                    Update Call Status
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onOpenCallNotes(student)}>
                                                    <MessageSquare className="mr-2 h-4 w-4" />
                                                    View Call Notes
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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


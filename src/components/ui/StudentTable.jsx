import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Eye,
  FileBarChart,
  Filter,
  GraduationCap,
  Info,
  MoreVertical,
  Phone,
  PhoneCall,
  PhoneMissed,
  RefreshCw,
  Search,
  Users2,
  MessageSquare,
  Download,
} from "lucide-react";
import { CallStatusDialog } from "./CallStatusDialog";
import { CallNotesDialog } from "./CallNotesDialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import ExcelJS from "exceljs";
import { useAuth } from "@clerk/clerk-react";
import {
  preferredCountries,
  indianStates,
  districtsByState,
  callStatusOptions,
  interestedInOptions,
} from "@/utils/constant";
import {
  fetchStudents,
  setSelectedStudent,
  clearSelectedStudent,
  setFilter,
  clearFilters,
  selectStudent,
  deselectStudent,
  selectAllStudents,
  clearSelectedStudents,
  updateStudentCallStatus,
} from "@/redux/slices/studentsSlice";

const StudentTable = () => {
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const { toast } = useToast();

  // Get data from Redux store
  const {
    data: students = [],
    loading,
    error,
    filters,
    selectedStudents: selectedStudentsSet,
    stats,
    selectedStudent,
  } = useSelector((state) => state.students);

  const [isCallStatusDialogOpen, setIsCallStatusDialogOpen] = useState(false);
  const [isCallNotesDialogOpen, setIsCallNotesDialogOpen] = useState(false);

  // Refresh students data
  const handleRefresh = useCallback(async () => {
    try {
      const token = await getToken();
      if (token) {
        dispatch(fetchStudents({ token }));
      } else {
        toast({
          title: "Error",
          description: "No authentication token available",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to refresh students data",
        variant: "destructive",
      });
    }
  }, [dispatch, getToken, toast]);

  // Set default call status if not present
  const studentsWithDefaultStatus = useMemo(() => {
    if (!Array.isArray(students)) {
      console.error("Invalid students data format:", students);
      return [];
    }
    return students.map((student) => ({
      ...student,
      callStatus: student.callStatus || "NOT_CALLED",
      lastCalledAt: student.lastCalledAt || null,
      callNotes: student.callNotes || "",
    }));
  }, [students]);

  const getCallStatusBadge = (status) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 hover:bg-green-500/30">
            Completed
          </Badge>
        );
      case "NO_RESPONSE":
        return (
          <Badge variant="destructive" className="hover:bg-destructive/90">
            No Response
          </Badge>
        );
      case "CALLBACK_REQUESTED":
        return (
          <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-400 hover:bg-blue-500/30">
            Callback Requested
          </Badge>
        );
      case "CALLED":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/30">
            Called
          </Badge>
        );
      case "MISSED":
        return (
          <Badge variant="destructive" className="hover:bg-destructive/90">
            Missed
          </Badge>
        );
      case "DEAD_LEADS":
        return (
          <Badge className="bg-gray-500/20 text-gray-700 dark:text-gray-400 hover:bg-gray-500/30">
            Dead Leads
          </Badge>
        );
      case "SCHEDULED":
        return (
          <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-400 hover:bg-blue-500/30">
            Scheduled
          </Badge>
        );
      case "GOING_ABROAD":
        return (
          <Badge className="bg-purple-500/20 text-purple-700 dark:text-purple-400 hover:bg-purple-500/30">
            Going Abroad
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="hover:bg-muted">
            Not Called
          </Badge>
        );
    }
  };

  const getCallStatusIcon = (status) => {
    switch (status) {
      case "COMPLETED":
        return <PhoneCall className="h-4 w-4 text-green-500" />;
      case "NO_RESPONSE":
        return <PhoneMissed className="h-4 w-4 text-red-500" />;
      case "CALLBACK_REQUESTED":
        return <Phone className="h-4 w-4 text-blue-500" />;
      case "CALLED":
        return <Phone className="h-4 w-4 text-yellow-500" />;
      case "MISSED":
        return <PhoneMissed className="h-4 w-4 text-red-500" />;
      case "DEAD_LEADS":
        return <Phone className="h-4 w-4 text-gray-500" />;
      case "SCHEDULED":
        return <Phone className="h-4 w-4 text-blue-500" />;
      case "GOING_ABROAD":
        return <Phone className="h-4 w-4 text-purple-500" />;
      default:
        return <Phone className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleOpenCallStatusDialog = (student) => {
    dispatch(setSelectedStudent(student));
    setIsCallStatusDialogOpen(true);
  };

  const handleOpenCallNotesDialog = (student) => {
    dispatch(setSelectedStudent(student));
    setIsCallNotesDialogOpen(true);
  };

  const handleCallStatusUpdated = async () => {
    try {
      const token = await getToken();
      if (token) {
        // Just refresh the data instead of trying to update a specific student
        dispatch(fetchStudents({ token }));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to refresh student data",
        variant: "destructive",
      });
    }
  };

  // Filter students based on Redux filters
  const filteredStudents = useMemo(() => {
    return studentsWithDefaultStatus.filter((student) => {
      const matchesSearch =
        student.name
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase()) ||
        student.contact.includes(filters.searchQuery);
      const matchesState =
        filters.stateFilter === "all" || student.state === filters.stateFilter;
      const matchesDistrict =
        filters.districtFilter === "all" ||
        student.district === filters.districtFilter;
      const matchesCountry =
        filters.countryFilter === "all" ||
        student.preferredCountry === filters.countryFilter;
      const matchesCallStatus =
        filters.callStatusFilter === "all" ||
        student.callStatus === filters.callStatusFilter;
      const matchesCounsellor =
        filters.counsellorFilter === "all" ||
        student.preferredCounsellor === filters.counsellorFilter;
      const matchesInterestedIn =
        filters.interestedInFilter === "all" ||
        student.interestedIn === filters.interestedInFilter;
      const matchesCalledBy =
        filters.calledByFilter === "all" ||
        student.calledBy === filters.calledByFilter;
      const matchesDate =
        !filters.dateFilter ||
        format(new Date(student.submittedAt), "yyyy-MM-dd") ===
          format(new Date(filters.dateFilter), "yyyy-MM-dd");

      return (
        matchesSearch &&
        matchesState &&
        matchesDistrict &&
        matchesCountry &&
        matchesCallStatus &&
        matchesCounsellor &&
        matchesDate &&
        matchesInterestedIn &&
        matchesCalledBy
      );
    });
  }, [studentsWithDefaultStatus, filters]);

  const getUniqueCounsellors = useCallback(() => {
    if (!students.length) return [];
    const counsellors = students
      .map((student) => student.preferredCounsellor)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index);
    return counsellors;
  }, [students]);

  // Get unique callers (people who made calls)
  const getUniqueCallers = useCallback(() => {
    if (!students.length) return [];
    const callers = students
      .map((student) => student.calledBy)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index);
    return callers;
  }, [students]);

  // Handle select all checkbox
  const handleSelectAll = useCallback(
    (e) => {
      if (e.target.checked) {
        dispatch(
          selectAllStudents(filteredStudents.map((student) => student._id))
        );
      } else {
        dispatch(clearSelectedStudents());
      }
    },
    [dispatch, filteredStudents]
  );

  // Handle individual student selection
  const handleSelectStudent = useCallback(
    (studentId, checked) => {
      if (checked) {
        dispatch(selectStudent(studentId));
      } else {
        dispatch(deselectStudent(studentId));
      }
    },
    [dispatch]
  );

  // Clear all selections
  const clearSelections = useCallback(() => {
    dispatch(clearSelectedStudents());
  }, [dispatch]);

  // Handle filter changes
  const handleFilterChange = useCallback(
    (filterName, value) => {
      dispatch(setFilter({ filterName, value }));
    },
    [dispatch]
  );

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  // Export to Excel
  const exportToExcel = async () => {
    const studentsToExport = filteredStudents.filter((student) =>
      selectedStudentsSet.includes(student._id)
    );

    if (studentsToExport.length === 0) {
      toast({
        title: "No students selected",
        description: "Please select at least one student to export",
        variant: "destructive",
      });
      return;
    }

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Students");

    // Define columns
    worksheet.columns = [
      { header: "ID", key: "id", width: 28 },
      { header: "Name", key: "name", width: 20 },
      { header: "Contact", key: "contact", width: 15 },
      { header: "State", key: "state", width: 15 },
      { header: "District", key: "district", width: 15 },
      { header: "Interested In", key: "interestedIn", width: 15 },
      { header: "NEET Score", key: "neetScore", width: 12 },
      { header: "Preferred Country", key: "preferredCountry", width: 18 },
      { header: "Preferred Counsellor", key: "preferredCounsellor", width: 20 },
      { header: "Call Status", key: "callStatus", width: 15 },
      { header: "Called By", key: "calledBy", width: 20 },
      { header: "Last Called At", key: "lastCalledAt", width: 20 },
      { header: "Call Notes", key: "callNotes", width: 30 },
      { header: "Submitted At", key: "submittedAt", width: 20 },
    ];

    // Add data rows
    studentsToExport.forEach((student) => {
      worksheet.addRow({
        id: student._id,
        name: student.name || "",
        contact: student.contact || "",
        state: student.state || "",
        district: student.district || "",
        interestedIn: student.interestedIn || "",
        neetScore: student.neetScore ? student.neetScore.toString() : "",
        preferredCountry:
          student.preferredCountry === "No Idea/ Want More Information"
            ? "Seeking Guidance"
            : student.preferredCountry || "",
        preferredCounsellor: student.preferredCounsellor || "Not Assigned",
        callStatus: student.callStatus || "NOT_CALLED",
        calledBy: student.calledBy || "",
        lastCalledAt: student.lastCalledAt
          ? new Date(student.lastCalledAt).toLocaleString()
          : "",
        callNotes: student.callNotes || "",
        submittedAt: student.submittedAt
          ? new Date(student.submittedAt).toLocaleString()
          : "",
      });
    });

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    try {
      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // Create blob and download
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `students_export_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `Successfully exported ${studentsToExport.length} students`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export students data",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <Info className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to fetch or decrypt students data: {error}
        </AlertDescription>
      </Alert>
    );
  }

  // Check if all filtered students are selected
  const allSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((student) =>
      selectedStudentsSet.includes(student._id)
    );

  return (
    <div className="space-y-6">
      {/* Call Status Dialog */}
      <CallStatusDialog
        isOpen={isCallStatusDialogOpen}
        onClose={() => setIsCallStatusDialogOpen(false)}
        student={selectedStudent}
        onStatusUpdated={handleCallStatusUpdated}
      />

      {/* Call Notes Dialog */}
      <CallNotesDialog
        isOpen={isCallNotesDialogOpen}
        onClose={() => setIsCallNotesDialogOpen(false)}
        student={selectedStudent}
      />

      {/* Export button and selection counter */}
      <div className="flex justify-between items-center">
        <div>
          <span className="ml-2 font-medium">
            {selectedStudentsSet.length} of {filteredStudents.length} selected
          </span>
          {selectedStudentsSet.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelections}
              className="ml-2"
            >
              Cancel All Selections
            </Button>
          )}
        </div>
        <Button
          onClick={exportToExcel}
          disabled={selectedStudentsSet.length === 0}
          className="bg-green-600 hover:bg-green-700 text-white mr-10"
        >
          <Download className="mr-2 h-4 w-4" />
          Export Selected to Excel
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Registered students</p>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average NEET Score
            </CardTitle>
            <FileBarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgNeetScore}</div>
            <p className="text-xs text-muted-foreground">Points</p>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Country</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.topCountry}</div>
            <p className="text-xs text-muted-foreground">Most preferred</p>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New This Month
            </CardTitle>
            <Users2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Recent registrations
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <CardTitle className="text-2xl font-bold">MBBS Students</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="mt-2 sm:mt-0"
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>

          <div className="flex flex-col space-y-4 mt-4">
            <div className="relative w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or contact..."
                className="pl-8 w-full"
                value={filters.searchQuery}
                onChange={(e) =>
                  handleFilterChange("searchQuery", e.target.value)
                }
              />
            </div>

            <div className="flex flex-nowrap overflow-x-auto gap-2 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-6">
              <div className="min-w-[160px] sm:min-w-0">
                <Select
                  value={filters.stateFilter}
                  onValueChange={(value) =>
                    handleFilterChange("stateFilter", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    {Object.keys(districtsByState).map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-[160px] sm:min-w-0">
                <Select
                  value={filters.districtFilter}
                  onValueChange={(value) =>
                    handleFilterChange("districtFilter", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by District" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Districts</SelectItem>
                    {filters.stateFilter !== "all" &&
                    districtsByState[filters.stateFilter]
                      ? districtsByState[filters.stateFilter].map(
                          (district) => (
                            <SelectItem key={district} value={district}>
                              {district}
                            </SelectItem>
                          )
                        )
                      : null}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-[160px] sm:min-w-0">
                <Select
                  value={filters.countryFilter}
                  onValueChange={(value) =>
                    handleFilterChange("countryFilter", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {preferredCountries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-[160px] sm:min-w-0">
                <Select
                  value={filters.callStatusFilter}
                  onValueChange={(value) =>
                    handleFilterChange("callStatusFilter", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by Call Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All </SelectItem>
                    {callStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-[160px] sm:min-w-0">
                <Select
                  value={filters.counsellorFilter}
                  onValueChange={(value) =>
                    handleFilterChange("counsellorFilter", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by Counsellor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Counsellors</SelectItem>
                    {getUniqueCounsellors().map((counsellor) => (
                      <SelectItem key={counsellor} value={counsellor}>
                        {counsellor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-[160px] sm:min-w-0">
                <Select
                  value={filters.interestedInFilter}
                  onValueChange={(value) =>
                    handleFilterChange("interestedInFilter", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by Interest" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Interests</SelectItem>
                    {interestedInOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-[160px] sm:min-w-0">
                <Select
                  value={filters.calledByFilter}
                  onValueChange={(value) =>
                    handleFilterChange("calledByFilter", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by Caller" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Callers</SelectItem>
                    {getUniqueCallers().map((caller) => (
                      <SelectItem key={caller} value={caller}>
                        {caller}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-[160px] sm:min-w-0">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Filter className="mr-2 h-4 w-4" />
                      {filters.dateFilter
                        ? format(new Date(filters.dateFilter), "PPP")
                        : "Filter by Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        filters.dateFilter
                          ? new Date(filters.dateFilter)
                          : undefined
                      }
                      onSelect={(date) =>
                        handleFilterChange("dateFilter", date)
                      }
                      initialFocus
                    />
                    {filters.dateFilter && (
                      <div className="p-2 border-t border-border">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFilterChange("dateFilter", null)}
                          className="w-full"
                        >
                          Clear Date
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Info className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                No students match your filters
              </p>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              {/* Add this div to show the count of filtered students */}
              <div className="p-2 bg-muted/30 border-b flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium">{filteredStudents.length}</span>{" "}
                  of <span className="font-medium">{students.length}</span>{" "}
                  students
                </span>
                {(filters.searchQuery ||
                  filters.stateFilter !== "all" ||
                  filters.districtFilter !== "all" ||
                  filters.countryFilter !== "all" ||
                  filters.callStatusFilter !== "all" ||
                  filters.counsellorFilter !== "all" ||
                  filters.interestedInFilter !== "all" ||
                  filters.calledByFilter !== "all" ||
                  filters.dateFilter) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="text-xs"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
              <ScrollArea className="w-full">
                <div className="min-w-[1000px]">
                  {" "}
                  {/* Minimum width to prevent squishing */}
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[50px] pl-4">
                          <div className="flex items-center justify-center">
                            <div
                              className={`h-5 w-5 rounded-md border ${
                                allSelected
                                  ? "bg-primary border-primary"
                                  : "border-input"
                              } flex items-center justify-center cursor-pointer`}
                              onClick={() => {
                                if (allSelected) {
                                  dispatch(clearSelectedStudents());
                                } else {
                                  dispatch(
                                    selectAllStudents(
                                      filteredStudents.map(
                                        (student) => student._id
                                      )
                                    )
                                  );
                                }
                              }}
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
                        <TableHead className="w-[120px]">
                          Interested In
                        </TableHead>
                        <TableHead className="w-[100px]">NEET Score</TableHead>
                        <TableHead className="w-[120px]">
                          Preferred Country
                        </TableHead>
                        <TableHead className="w-[150px]">
                          Selected Counsellor
                        </TableHead>
                        <TableHead className="w-[120px]">Call Status</TableHead>
                        <TableHead className="w-[120px]">Called By</TableHead>
                        <TableHead className="w-[100px]">Submitted</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => {
                        const isSelected = selectedStudentsSet.includes(
                          student._id
                        );
                        return (
                          <TableRow
                            key={student._id}
                            className={`transition-colors hover:bg-muted/50 ${
                              isSelected ? "bg-primary/5" : ""
                            }`}
                          >
                            <TableCell className="pl-4">
                              <div className="flex items-center justify-center">
                                <div
                                  className={`h-5 w-5 rounded-md border ${
                                    isSelected
                                      ? "bg-primary border-primary"
                                      : "border-input"
                                  } flex items-center justify-center cursor-pointer`}
                                  onClick={() =>
                                    handleSelectStudent(
                                      student._id,
                                      !isSelected
                                    )
                                  }
                                >
                                  {isSelected && (
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
                            </TableCell>
                            <TableCell className="font-medium">
                              {student.name}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {student.contact}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {student.state}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {student.district}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {student.interestedIn === "MBBS From Abroad"
                                ? "Abroad"
                                : student.interestedIn ===
                                  "MBBS From Private College"
                                ? "Private College"
                                : student.interestedIn}
                            </TableCell>
                            <TableCell>
                              {student.neetScore
                                ? student.neetScore.toString()
                                : ""}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {student.preferredCountry ===
                              "No Idea/ Want More Information"
                                ? "Seeking Guidance"
                                : student.preferredCountry}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {student.preferredCounsellor || "Not Assigned"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {getCallStatusIcon(student.callStatus)}
                                {getCallStatusBadge(student.callStatus)}
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {student.calledBy || "-"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {new Date(
                                student.submittedAt
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleOpenCallStatusDialog(student)
                                    }
                                  >
                                    <PhoneCall className="mr-2 h-4 w-4 text-green-500" />
                                    Update Call Status
                                  </DropdownMenuItem>
                                  {student.callNotes && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleOpenCallNotesDialog(student)
                                      }
                                    >
                                      <MessageSquare className="mr-2 h-4 w-4 text-blue-500" />
                                      View Call Notes
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentTable;

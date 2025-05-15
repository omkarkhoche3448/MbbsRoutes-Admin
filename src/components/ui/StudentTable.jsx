import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import { useToast } from "@/hooks/use-toast";
import StudentStats from "./StudentStats";
import StudentFilters from "./StudentFilters";
import StudentTableHeader from "./StudentTableHeader";
import SelectionControls from "./SelectionControls";
import TableTitle from "./TableTitle";
import EmptyState from "./EmptyState";
import StudentTableContent from "./StudentTableContent";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Info, RefreshCw } from "lucide-react";
import { CallStatusDialog } from "./CallStatusDialog";
import { CallNotesDialog } from "./CallNotesDialog";
import { format } from "date-fns";
import ExcelJS from "exceljs";
import {
  preferredCountries,
  districtsByState,
  callStatusOptions,
  interestedInOptions,
} from "@/utils/constant";
import {
  fetchStudents,
  setSelectedStudent,
  setFilter,
  clearFilters,
  selectStudent,
  deselectStudent,
  selectAllStudents,
  clearSelectedStudents,
} from "@/redux/slices/studentsSlice";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const StudentTable = () => {
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const { toast } = useToast();

  // Update itemsPerPage to 50
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);

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

  // Calculate paginated students for the current page
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStudents, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => 
    Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage))
  , [filteredStudents.length, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

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
          selectAllStudents(paginatedStudents.map((student) => student._id))
        );
      } else {
        dispatch(clearSelectedStudents());
      }
    },
    [dispatch, paginatedStudents]
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
      link.download = `students_export_${new Date().toISOString().split("T")[0]
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

  // Check if all paginated students are selected (only the students on current page)
  const allSelected =
    paginatedStudents.length > 0 &&
    paginatedStudents.every((student) =>
      selectedStudentsSet.includes(student._id)
    );

  // Loading placeholder component
  const LoadingState = () => (
    <div className="flex items-center justify-center p-12">
      <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      <span className="ml-2 text-lg font-medium">Loading student data...</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <CallStatusDialog
        isOpen={isCallStatusDialogOpen}
        onClose={() => setIsCallStatusDialogOpen(false)}
        student={selectedStudent}
        onStatusUpdated={handleCallStatusUpdated}
      />

      <CallNotesDialog
        isOpen={isCallNotesDialogOpen}
        onClose={() => setIsCallNotesDialogOpen(false)}
        student={selectedStudent}
      />

      {/* Selection and Export Controls */}
      <SelectionControls
        selectedCount={selectedStudentsSet.length}
        totalCount={filteredStudents.length}
        onClearSelections={clearSelections}
        onExport={exportToExcel}
      />

      {/* Statistics Cards */}
      <StudentStats stats={stats} />

      <Card>
        <CardHeader>
          <TableTitle onRefresh={handleRefresh} loading={loading} />
          <StudentFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            districtsByState={districtsByState}
            preferredCountries={preferredCountries}
            callStatusOptions={callStatusOptions}
            getUniqueCounsellors={getUniqueCounsellors}
            getUniqueCallers={getUniqueCallers}
            interestedInOptions={interestedInOptions}
          />
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <LoadingState />
          ) : filteredStudents.length === 0 ? (
            <EmptyState onClearFilters={handleClearFilters} />
          ) : (
            <StudentTableContent
              filteredStudents={paginatedStudents}
              students={students}
              selectedStudentsSet={selectedStudentsSet}
              onSelectAll={handleSelectAll}
              onSelectStudent={handleSelectStudent}
              onClearFilters={handleClearFilters}
              onOpenCallStatus={handleOpenCallStatusDialog}
              onOpenCallNotes={handleOpenCallNotesDialog}
              allSelected={allSelected}
              currentPage={currentPage}
            />
          )}

          {totalPages > 1 && (
            <div className="flex justify-center py-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className={currentPage === 1 ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }).map((_, index) => {
                    const pageNumber = index + 1;
                    
                    // Show first page, last page, and pages around current page
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            onClick={() => setCurrentPage(pageNumber)}
                            isActive={currentPage === pageNumber}
                            className="cursor-pointer"
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    } 
                    // Show ellipsis for gaps
                    else if (
                      (pageNumber === 2 && currentPage > 3) ||
                      (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
                    ) {
                      return (
                        <PaginationItem key={`ellipsis-${pageNumber}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className={currentPage === totalPages ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
};

export default StudentTable;
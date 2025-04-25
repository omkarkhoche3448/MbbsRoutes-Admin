import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
  MessageSquare
} from "lucide-react"
import { CallStatusDialog } from "./CallStatusDialog"
import { CallNotesDialog } from "./CallNotesDialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { useQuery } from "@tanstack/react-query"
import { useFetchStudents } from "@/services/api"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  preferredCountries, 
  indianStates, 
  districtsByState,
  callStatusOptions,
  interestedInOptions
} from "@/utils/constant"

const StudentTable = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [callStatusFilter, setCallStatusFilter] = useState("all");
  const [counsellorFilter, setCounsellorFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(undefined);
  const [interestedInFilter, setInterestedInFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isCallStatusDialogOpen, setIsCallStatusDialogOpen] = useState(false);
  const [isCallNotesDialogOpen, setIsCallNotesDialogOpen] = useState(false);

  const fetchStudents = useFetchStudents(); 

  const { data: students = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['students'],
    queryFn: fetchStudents,
    refetchOnWindowFocus: false,
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch students data",
        variant: "destructive",
      });
    }
  });

  // Set default call status if not present
  const studentsWithDefaultStatus = students.map(student => {
    return {
      ...student,
      callStatus: student.callStatus || 'NOT_CALLED',
      lastCalledAt: student.lastCalledAt || null,
      callNotes: student.callNotes || ''
    };
  });

  // console.log('Students data:', students);
  // console.log('Loading state:', isFetching);
  // console.log('Error state:', isError);

  const calculateStatistics = () => {
    if (!students.length) return { totalStudents: 0, avgNeetScore: 0, newThisMonth: 0, topCountry: "N/A" };

    const totalStudents = students.length;
    const totalNeetScore = students.reduce((acc, student) => acc + Number(student.neetScore), 0);
    const avgNeetScore = Math.round(totalNeetScore / totalStudents);

    const now = new Date();
    const newThisMonth = students.filter(student => {
      const date = new Date(student.createdAt);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;

    // Updated top country calculation
    const countryCounts = {};
    students.forEach(student => {
      const country = student.preferredCountry === "No Idea/ Want More Information" ? "Seeking Guidance" : student.preferredCountry;
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    });

    const topCountry = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    return { totalStudents, avgNeetScore, newThisMonth, topCountry };
  };

  const stats = calculateStatistics();

  const getCallStatusBadge = (status) => {
    switch (status) {
      case "COMPLETED": return <Badge className="bg-green-500">Completed</Badge>;
      case "NO_RESPONSE": return <Badge variant="destructive">No Response</Badge>;
      case "CALLBACK_REQUESTED": return <Badge className="bg-blue-500">Callback Requested</Badge>;
      case "CALLED": return <Badge className="bg-yellow-500">Called</Badge>;
      default: return <Badge variant="outline">Not Called</Badge>;
    }
  };

  const getCallStatusIcon = (status) => {
    switch (status) {
      case "COMPLETED": return <PhoneCall className="h-4 w-4 text-green-500" />;
      case "NO_RESPONSE": return <PhoneMissed className="h-4 w-4 text-red-500" />;
      case "CALLBACK_REQUESTED": return <Phone className="h-4 w-4 text-blue-500" />;
      case "CALLED": return <Phone className="h-4 w-4 text-yellow-500" />;
      default: return <Phone className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleOpenCallStatusDialog = (student) => {
    setSelectedStudent(student);
    setIsCallStatusDialogOpen(true);
  };

  const handleOpenCallNotesDialog = (student) => {
    setSelectedStudent(student);
    setIsCallNotesDialogOpen(true);
  };

  const handleCallStatusUpdated = () => {
    // Refetch students data to get the updated call status
    refetch();
  };

  // Use the students array with default statuses for filtering
  const filteredStudents = studentsWithDefaultStatus.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.contact.includes(searchQuery);
    const matchesState = stateFilter === "all" || student.state === stateFilter;
    const matchesDistrict = districtFilter === "all" || student.district === districtFilter;
    const matchesCountry = countryFilter === "all" || student.preferredCountry === countryFilter;
    const matchesCallStatus = callStatusFilter === "all" || student.callStatus === callStatusFilter;
    const matchesCounsellor = counsellorFilter === "all" || student.preferredCounsellor === counsellorFilter;
    const matchesInterestedIn = interestedInFilter === "all" || student.interestedIn === interestedInFilter;
    const matchesDate = !dateFilter || format(new Date(student.submittedAt), 'yyyy-MM-dd') === format(dateFilter, 'yyyy-MM-dd');

    return matchesSearch && matchesState && matchesDistrict && matchesCountry && matchesCallStatus && matchesCounsellor && matchesDate && matchesInterestedIn;
  });

  const getUniqueCounsellors = () => {
    if (!students.length) return [];
    const counsellors = students
      .map(student => student.preferredCounsellor)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index);
    return counsellors;
  };

  if (isError) {
    return (
      <Alert variant="destructive">
        <Info className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to fetch or decrypt students data. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

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
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Registered students</p>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average NEET Score</CardTitle>
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
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <Users2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newThisMonth}</div>
            <p className="text-xs text-muted-foreground">Recent registrations</p>
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
              onClick={() => refetch()}
              className="mt-2 sm:mt-0"
              disabled={isFetching}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div className="flex flex-col space-y-4 mt-4">
            <div className="relative w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or contact..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-nowrap overflow-x-auto gap-2 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-6">
              <div className="min-w-[160px] sm:min-w-0">
                <Select value={stateFilter} onValueChange={(value) => {
                  setStateFilter(value);
                  setDistrictFilter("all");
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    {Object.keys(districtsByState).map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-[160px] sm:min-w-0">
                <Select value={districtFilter} onValueChange={setDistrictFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by District" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Districts</SelectItem>
                    {stateFilter !== "all" && districtsByState[stateFilter] ? 
                      districtsByState[stateFilter].map((district) => (
                        <SelectItem key={district} value={district}>{district}</SelectItem>
                      )) : 
                      null
                    }
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-[160px] sm:min-w-0">
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {preferredCountries.map((country) => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-[160px] sm:min-w-0">
                <Select value={callStatusFilter} onValueChange={setCallStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by Call Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {callStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-[160px] sm:min-w-0">
                <Select value={counsellorFilter} onValueChange={setCounsellorFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by Counsellor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Counsellors</SelectItem>
                    {getUniqueCounsellors().map((counsellor) => (
                      <SelectItem key={counsellor} value={counsellor}>{counsellor}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-[160px] sm:min-w-0">
                <Select value={interestedInFilter} onValueChange={setInterestedInFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by Interest" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Interests</SelectItem>
                    {interestedInOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-[160px] sm:min-w-0">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <Filter className="mr-2 h-4 w-4" />
                      {dateFilter ? format(dateFilter, "PPP") : "Filter by Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFilter}
                      onSelect={setDateFilter}
                      initialFocus
                    />
                    {dateFilter && (
                      <div className="p-2 border-t border-border">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDateFilter(undefined)}
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
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Info className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No students match your filters</p>
              <Button variant="outline" onClick={() => {
                setSearchQuery("");
                setStateFilter("all");
                setDistrictFilter("all");
                setCountryFilter("all");
                setCallStatusFilter("all");
                setCounsellorFilter("all");
                setInterestedInFilter("all");
                setDateFilter(undefined);
              }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              {/* Add this div to show the count of filtered students */}
              <div className="p-2 bg-muted/20 border-b flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">{filteredStudents.length}</span> of <span className="font-medium">{students.length}</span> students
                </span>
                {(searchQuery || stateFilter !== "all" || districtFilter !== "all" ||
                  countryFilter !== "all" || callStatusFilter !== "all" || counsellorFilter !== "all" || 
                  interestedInFilter !== "all" || dateFilter) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchQuery("");
                        setStateFilter("all");
                        setDistrictFilter("all");
                        setCountryFilter("all");
                        setCallStatusFilter("all");
                        setCounsellorFilter("all");
                        setInterestedInFilter("all");
                        setDateFilter(undefined);
                      }}
                      className="text-xs"
                    >
                      Clear Filters
                    </Button>
                  )}
              </div>
              <ScrollArea className="w-full">
                <div className="min-w-[1000px]"> {/* Minimum width to prevent squishing */}
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[200px]">Name</TableHead>
                        <TableHead className="w-[120px]">Contact</TableHead>
                        <TableHead className="w-[120px]">State</TableHead>
                        <TableHead className="w-[120px]">District</TableHead>
                        <TableHead className="w-[120px]">Interested In</TableHead>
                        <TableHead className="w-[100px]">NEET Score</TableHead>
                        <TableHead className="w-[120px]">Preferred Country</TableHead>
                        <TableHead className="w-[150px]">Selected Counsellor</TableHead>
                        <TableHead className="w-[120px]">Call Status</TableHead>
                        <TableHead className="w-[100px]">Submitted</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student._id}>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell className="whitespace-nowrap">{student.contact}</TableCell>
                          <TableCell className="whitespace-nowrap">{student.state}</TableCell>
                          <TableCell className="whitespace-nowrap">{student.district}</TableCell>
                          <TableCell className="whitespace-nowrap">{student.interestedIn}</TableCell>
                          <TableCell>{student.neetScore}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {student.preferredCountry === "No Idea/ Want More Information"
                              ? "Seeking Guidance"
                              : student.preferredCountry}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{student.preferredCounsellor || 'Not Assigned'}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getCallStatusIcon(student.callStatus)}
                              {getCallStatusBadge(student.callStatus)}
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {new Date(student.submittedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleOpenCallStatusDialog(student)}>
                                  <PhoneCall className="mr-2 h-4 w-4 text-green-500" />
                                  Update Call Status
                                </DropdownMenuItem>
                                {student.callNotes && (
                                  <DropdownMenuItem onClick={() => handleOpenCallNotesDialog(student)}>
                                    <MessageSquare className="mr-2 h-4 w-4 text-blue-500" />
                                    View Call Notes
                                  </DropdownMenuItem>
                                )}
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default StudentTable

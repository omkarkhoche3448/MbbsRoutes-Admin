import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth, useUser } from "@clerk/clerk-react";
import { fetchAdminConsultations } from "@/redux/slices/callReportsSlice";
import { fetchStudents } from "@/redux/slices/studentsSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ConsultationsTable from './ConsultationsTable';
import { AdminFilter } from './AdminFilter';
import { DateFilter } from './DateFilter';
import { ExcelExporter } from './ExcelExporter';

export function AdminCallReport() {
  const dispatch = useDispatch();
  const { user } = useUser();
  const { getToken } = useAuth();
  const { toast } = useToast();
  
  // State for date filtering
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  
  // Get data from Redux store
  const { 
    stats,
    loading,
    error
  } = useSelector(state => state.callReports);
  
  // Get students stats from Redux store
  const { stats: studentsStats, loading: studentsLoading } = useSelector(state => state.students);

  // Fetch consultations and students data
  const handleRefresh = async () => {
    try {
      const token = await getToken();
      if (token) {
        dispatch(fetchAdminConsultations({ token }));
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
        description: error.message || "Failed to refresh data",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  // Generate a consistent color based on caller name
  const getCallerColor = (callerName) => {
    if (!callerName) return "bg-gray-200";
    
    // Simple hash function to generate a consistent color
    const hash = callerName.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    // List of tailwind colors for badges
    const colors = [
      "bg-red-100 text-red-800",
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-yellow-100 text-yellow-800",
      "bg-purple-100 text-purple-800",
      "bg-pink-100 text-pink-800",
      "bg-indigo-100 text-indigo-800",
      "bg-teal-100 text-teal-800"
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <h1 className="text-2xl font-bold">Call Reports</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="mt-2 sm:mt-0"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button 
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={handleRefresh}
          >
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Call Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="col-span-1">
                <p className="text-sm font-medium">Total Consultations</p>
                <p className="text-2xl font-bold">{stats.totalCalls}</p>
              </div>
              <div className="col-span-1">
                <p className="text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <div className="col-span-1">
                <p className="text-sm font-medium">Scheduled</p>
                <p className="text-2xl font-bold">{stats.scheduled}</p>
              </div>
              <div className="col-span-1">
                <p className="text-sm font-medium">Not Called</p>
                <p className="text-2xl font-bold">{stats.notCalled}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1">
                <p className="text-sm font-medium">Missed</p>
                <p className="text-2xl font-bold">{stats.missed}</p>
              </div>
              <div className="col-span-1">
                <p className="text-sm font-medium">Dead Leads</p>
                <p className="text-2xl font-bold">{stats.deadLeads}</p>
              </div>
              <div className="col-span-1">
                <p className="text-sm font-medium">Going Abroad</p>
                <p className="text-2xl font-bold">{stats.goingAbroad}</p>
              </div>
              <div className="col-span-1">
                <p className="text-sm font-medium">Total Students</p>
                <p className="text-2xl font-bold">{studentsStats.totalStudents}</p>
              </div>
            </div>
            
            {stats.uniqueCallers.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Team Members</p>
                <div className="flex flex-wrap gap-2">
                  {stats.uniqueCallers.map(caller => (
                    <div key={caller} className="flex items-center gap-2">
                      <Avatar className={`h-6 w-6 ${getCallerColor(caller)}`}>
                        <AvatarFallback>{getInitials(caller)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{caller}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AdminFilter />
        <DateFilter 
          onDateChange={(start, end) => {
            setStartDate(start);
            setEndDate(end);
          }}
        />
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Consultations</h2>
        <div className="flex items-center space-x-2">
          <ExcelExporter 
            startDate={startDate ? startDate.toISOString() : null} 
            endDate={endDate ? endDate.toISOString() : null} 
          />
        </div>
      </div>
      
      <ConsultationsTable />
    </div>
  );
}

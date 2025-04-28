import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStudents, updateStats } from "../redux/slices/studentsSlice";
import StudentTable from "../components/ui/StudentTable";
import DashboardLayout from "@/components/ui/DashboardLayout";
import { useAuth } from "@clerk/clerk-react";
import { RefreshCw } from "lucide-react";

const StudentsPage = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.students);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        if (token) {
          await dispatch(fetchStudents({ token }));
        } else {
          console.error("No token available");
        }
      } catch (error) {
        console.error("Error fetching token:", error);
      }
    };
    fetchData();
  }, [dispatch, getToken]);

  if (loading && !error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading student data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <StudentTable />
    </DashboardLayout>
  );
};

export default StudentsPage;

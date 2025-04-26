import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import ExcelJS from 'exceljs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

const StudentTable = ({ students, districts }) => {
  const [selectedStudents, setSelectedStudents] = useState([]);
  
  // Reset selected students when students data changes
  useEffect(() => {
    setSelectedStudents([]);
  }, [students]);

  if (!Array.isArray(students)) {
    console.error('Students prop is not an array:', students);
    return <div>Error: Invalid data format</div>;
  }

  if (students.length === 0) {
    return <div>No students found</div>;
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudents(students.map(student => student._id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId, checked) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  const exportToExcel = async () => {
    // Filter only selected students
    const studentsToExport = students.filter(student => 
      selectedStudents.includes(student._id)
    );
    
    if (studentsToExport.length === 0) {
      alert('Please select at least one student to export');
      return;
    }

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Students');
    
    // Define columns
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Contact', key: 'contact', width: 15 },
      { header: 'State', key: 'state', width: 15 },
      { header: 'District', key: 'district', width: 15 },
      { header: 'Interested In', key: 'interestedIn', width: 20 },
      { header: 'NEET Score', key: 'neetScore', width: 12 },
      { header: 'Preferred Country', key: 'preferredCountry', width: 20 },
      { header: 'Preferred Counsellor', key: 'preferredCounsellor', width: 20 },
      { header: 'Created At', key: 'createdAt', width: 15 }
    ];
    
    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Add data rows
    studentsToExport.forEach(student => {
      worksheet.addRow({
        name: student.name || '',
        email: student.email || '',
        contact: student.contact || '',
        state: student.state || '',
        district: student.district || '',
        interestedIn: student.interestedIn || '',
        neetScore: student.neetScore || '',
        preferredCountry: student.preferredCountry || '',
        preferredCounsellor: student.preferredCounsellor || '',
        createdAt: student.createdAt ? new Date(student.createdAt).toLocaleDateString() : ''
      });
    });
    
    // Generate Excel file and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'selected_students.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="mr-2 font-medium">
            {selectedStudents.length} of {students.length} selected
          </span>
        </div>
        <Button 
          onClick={exportToExcel} 
          disabled={selectedStudents.length === 0}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Export Selected to Excel
        </Button>
      </div>

      <div className="rounded-md border">
        <div className="p-2 bg-muted/20 border-b">
          <span className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{students.length}</span> students
          </span>
        </div>
        <ScrollArea className="w-full">
          <div className="min-w-[1000px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedStudents.length === students.length && students.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedStudents(students.map(student => student._id));
                        } else {
                          setSelectedStudents([]);
                        }
                      }}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Interested In</TableHead>
                  <TableHead>NEET Score</TableHead>
                  <TableHead>Preferred Country</TableHead>
                  <TableHead>Selected Counsellor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedStudents.includes(student._id)}
                        onCheckedChange={(checked) => handleSelectStudent(student._id, checked)}
                        aria-label={`Select ${student.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.contact}</TableCell>
                    <TableCell>{student.state}</TableCell>
                    <TableCell>{student.district}</TableCell>
                    <TableCell>{student.interestedIn}</TableCell>
                    <TableCell>{student.neetScore}</TableCell>
                    <TableCell>
                      {student.preferredCountry === "No Idea/ Want More Information"
                        ? "Seeking Guidance"
                        : student.preferredCountry}
                    </TableCell>
                    <TableCell>{student.selectedCounsellor || 'Not Assigned'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default StudentTable;
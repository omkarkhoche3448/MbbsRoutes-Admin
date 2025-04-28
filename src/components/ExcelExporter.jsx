import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download } from 'lucide-react';
import ExcelJS from 'exceljs';

export const ExcelExporter = ({ startDate, endDate }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Get consultations and selected admins from Redux store
  const { 
    consultations,
    selectedAdmins
  } = useSelector(state => state.callReports);
  
  // Filter consultations based on selected admins
  const filteredConsultations = consultations.filter(
    consultation => selectedAdmins.length === 0 || 
    (consultation.calledBy && selectedAdmins.includes(consultation.calledBy))
  );
  
  const exportToExcel = async () => {
    setLoading(true);
    try {
      if (filteredConsultations.length === 0) {
        toast({
          title: "No consultations to export",
          description: "There are no consultations matching your filters",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      // Create a new workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Consultations');
      
      // Define columns
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 28 },
        { header: 'Name', key: 'name', width: 20 },
        { header: 'Contact', key: 'contact', width: 15 },
        { header: 'State', key: 'state', width: 15 },
        { header: 'District', key: 'district', width: 15 },
        { header: 'Interested In', key: 'interestedIn', width: 15 },
        { header: 'NEET Score', key: 'neetScore', width: 12 },
        { header: 'Preferred Country', key: 'preferredCountry', width: 18 },
        { header: 'Preferred Counsellor', key: 'preferredCounsellor', width: 20 },
        { header: 'Call Status', key: 'callStatus', width: 15 },
        { header: 'Called By', key: 'calledBy', width: 20 },
        { header: 'Last Called At', key: 'lastCalledAt', width: 20 },
        { header: 'Call Notes', key: 'callNotes', width: 30 },
        { header: 'Submitted At', key: 'submittedAt', width: 20 },
      ];
      
      // Add data rows
      filteredConsultations.forEach(consultation => {
        worksheet.addRow({
          id: consultation._id,
          name: consultation.name || '',
          contact: consultation.contact || '',
          state: consultation.state || '',
          district: consultation.district || '',
          interestedIn: consultation.interestedIn || '',
          neetScore: consultation.neetScore ? consultation.neetScore.toString() : '',
          preferredCountry: consultation.preferredCountry === "No Idea/ Want More Information" 
            ? "Seeking Guidance" 
            : (consultation.preferredCountry || ''),
          preferredCounsellor: consultation.preferredCounsellor || 'Not Assigned',
          callStatus: consultation.callStatus || 'NOT_CALLED',
          calledBy: consultation.calledBy || '',
          lastCalledAt: consultation.lastCalledAt ? new Date(consultation.lastCalledAt).toLocaleString() : '',
          callNotes: consultation.callNotes || '',
          submittedAt: consultation.submittedAt ? new Date(consultation.submittedAt).toLocaleString() : ''
        });
      });
      
      // Style the header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      
      try {
        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer();
        
        // Create blob and download
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Create filename with date range if provided
        let filename = 'consultations';
        if (startDate && endDate) {
          const startDateStr = new Date(startDate).toISOString().split('T')[0];
          const endDateStr = new Date(endDate).toISOString().split('T')[0];
          filename += `_${startDateStr}_to_${endDateStr}`;
        } else {
          filename += `_${new Date().toISOString().split('T')[0]}`;
        }
        
        link.download = `${filename}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Success",
          description: `Successfully exported ${filteredConsultations.length} consultations`,
        });
      } catch (error) {
        console.error("Error generating Excel file:", error);
        toast({
          title: "Export Failed",
          description: "Failed to generate Excel file",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export consultations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Button 
      onClick={exportToExcel}
      disabled={loading}
      className="bg-primary hover:bg-primary/90 text-primary-foreground"
    >
      <Download className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      Export to Excel
    </Button>
  );
};

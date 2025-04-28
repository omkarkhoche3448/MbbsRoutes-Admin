import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAuth } from '@clerk/clerk-react';
import { fetchAdminConsultations } from '@/redux/slices/callReportsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const DateFilter = ({ onDateChange }) => {
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const { toast } = useToast();
  
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateFilterType, setDateFilterType] = useState('none');
  
  // Predefined date ranges
  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'lastWeek', label: 'Last Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'custom', label: 'Custom Range' }
  ];
  
  const handleDateRangeChange = (value) => {
    let start = null;
    let end = null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (value) {
      case 'today':
        start = new Date(today);
        end = new Date(today);
        break;
      case 'yesterday':
        start = new Date(today);
        start.setDate(start.getDate() - 1);
        end = new Date(start);
        break;
      case 'thisWeek':
        start = new Date(today);
        start.setDate(start.getDate() - start.getDay()); // Start of week (Sunday)
        end = new Date(today);
        break;
      case 'lastWeek':
        start = new Date(today);
        start.setDate(start.getDate() - start.getDay() - 7); // Start of last week
        end = new Date(start);
        end.setDate(end.getDate() + 6); // End of last week
        break;
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today);
        break;
      case 'lastMonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'custom':
        // Keep current custom dates if they exist
        start = startDate;
        end = endDate;
        break;
      default:
        // 'none' or any other value
        start = null;
        end = null;
        break;
    }
    
    setDateFilterType(value);
    setStartDate(start);
    setEndDate(end);
    
    if (onDateChange) onDateChange(start, end);
    
    if (value !== 'custom' && value !== 'none') {
      applyDateFilter(start, end);
    }
  };
  
  const applyDateFilter = async (start, end) => {
    try {
      const token = await getToken();
      if (token) {
        dispatch(fetchAdminConsultations({ 
          token,
          startDate: start ? start.toISOString() : null,
          endDate: end ? end.toISOString() : null
        }));
        
        toast({
          title: "Filter Applied",
          description: "Consultations filtered by selected date range",
        });
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
        description: error.message || "Failed to apply date filter",
        variant: "destructive",
      });
    }
  };
  
  const handleApplyCustomFilter = () => {
    if (startDate && endDate) {
      applyDateFilter(startDate, endDate);
    } else {
      toast({
        title: "Warning",
        description: "Please select both start and end dates",
        variant: "destructive",
      });
    }
  };
  
  const handleClearFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setDateFilterType('none');
    
    if (onDateChange) onDateChange(null, null);
    
    applyDateFilter(null, null);
  };
  
  // Get display text for the current date filter
  const getDateFilterText = () => {
    if (dateFilterType === 'none') {
      return "Filter by Date";
    } else if (dateFilterType === 'custom') {
      if (startDate && endDate) {
        return `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`;
      } else if (startDate) {
        return `From ${format(startDate, "MMM d, yyyy")}`;
      } else if (endDate) {
        return `Until ${format(endDate, "MMM d, yyyy")}`;
      } else {
        return "Custom Range";
      }
    } else {
      const range = dateRanges.find(r => r.value === dateFilterType);
      return range ? range.label : "Filter by Date";
    }
  };
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Filter by Date</CardTitle>
      </CardHeader>
      <CardContent>
        <Select 
          value={dateFilterType}
          onValueChange={handleDateRangeChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by date">
              <div className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {getDateFilterText()}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Date Filter</SelectItem>
            {dateRanges.map(range => (
              <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {dateFilterType === 'custom' && (
          <div className="mt-4">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        if (onDateChange) onDateChange(date, endDate);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        setEndDate(date);
                        if (onDateChange) onDateChange(startDate, date);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleClearFilter}>
                Clear
              </Button>
              <Button onClick={handleApplyCustomFilter}>
                Apply Filter
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

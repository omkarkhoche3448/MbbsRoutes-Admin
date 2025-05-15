import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

const StudentFilters = ({
  filters,
  onFilterChange,
  districtsByState,
  preferredCountries,
  callStatusOptions,
  getUniqueCounsellors,
  getUniqueCallers,
  interestedInOptions,
}) => {
  return (
    <div className="flex flex-col space-y-4 mt-4">
      <div className="flex items-center gap-4 w-full">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or contact..."
            className="pl-8 w-full"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange("searchQuery", e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => {
            // Clear all filters
            onFilterChange("searchQuery", "");
            onFilterChange("stateFilter", "all");
            onFilterChange("districtFilter", "all");
            onFilterChange("countryFilter", "all");
            onFilterChange("callStatusFilter", "all");
            onFilterChange("counsellorFilter", "all");
            onFilterChange("calledByFilter", "all");
            onFilterChange("interestedInFilter", "all");
            onFilterChange("dateFilter", null);
          }}
        >
          Clear Filters
        </Button>
      </div>

      <div className="flex flex-nowrap overflow-x-auto gap-2 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-8">
        {/* State Filter - existing */}
        <FilterSelect
          value={filters.stateFilter}
          onValueChange={(value) => onFilterChange("stateFilter", value)}
          placeholder="Filter by State"
          options={Object.keys(districtsByState)}
          allLabel="All States"
        />

        {/* District Filter - existing */}
        <FilterSelect
          value={filters.districtFilter}
          onValueChange={(value) => onFilterChange("districtFilter", value)}
          placeholder="Filter by District"
          options={
            filters.stateFilter !== "all"
              ? districtsByState[filters.stateFilter] || []
              : []
          }
          allLabel="All Districts"
        />

        {/* Preferred Country Filter */}
        <FilterSelect
          value={filters.countryFilter}
          onValueChange={(value) => onFilterChange("countryFilter", value)}
          placeholder="Filter by Country"
          options={preferredCountries}
          allLabel="All Countries"
        />

        {/* Call Status Filter */}
        <FilterSelect
          value={filters.callStatusFilter}
          onValueChange={(value) => onFilterChange("callStatusFilter", value)}
          placeholder="Filter by Status"
          options={callStatusOptions}
          allLabel="All Statuses"
        />

        {/* Counsellor Filter */}
        <FilterSelect
          value={filters.counsellorFilter}
          onValueChange={(value) => onFilterChange("counsellorFilter", value)}
          placeholder="Filter by Counsellor"
          options={getUniqueCounsellors()}
          allLabel="All Counsellors"
        />

        {/* Called By Filter */}
        <FilterSelect
          value={filters.calledByFilter}
          onValueChange={(value) => onFilterChange("calledByFilter", value)}
          placeholder="Filter by Caller"
          options={getUniqueCallers()}
          allLabel="All Callers"
        />

        {/* Interested In Filter */}
        <FilterSelect
          value={filters.interestedInFilter}
          onValueChange={(value) => onFilterChange("interestedInFilter", value)}
          placeholder="Filter by Interest"
          options={interestedInOptions}
          allLabel="All Interests"
        />

        {/* Date Filter - existing */}
        <DateFilter
          dateFilter={filters.dateFilter}
          onFilterChange={onFilterChange}
        />
      </div>
    </div>
  );
};

const FilterSelect = ({
  value,
  onValueChange,
  placeholder,
  options,
  allLabel,
}) => {
  return (
    <div className="min-w-[160px] sm:min-w-0">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem key="all" value="all">
            {allLabel}
          </SelectItem>
          {options.map((option) => (
            <SelectItem 
              key={typeof option === 'object' ? option.value || option.id : String(option)} 
              value={typeof option === 'object' ? option.value || option.id : option}
            >
              {typeof option === 'object' ? option.label || option.name : option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

const DateFilter = ({ dateFilter, onFilterChange }) => {
  return (
    <div className="min-w-[160px] sm:min-w-0">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <Filter className="mr-2 h-4 w-4" />
            {dateFilter ? format(new Date(dateFilter), "PPP") : "Filter by Date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateFilter ? new Date(dateFilter) : undefined}
            onSelect={(date) => onFilterChange("dateFilter", date)}
            initialFocus
          />
          {dateFilter && (
            <div className="p-2 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFilterChange("dateFilter", null)}
                className="w-full"
              >
                Clear Date
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default StudentFilters;
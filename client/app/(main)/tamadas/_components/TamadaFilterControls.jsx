"use client";

import { Check, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

export const TamadaFilterControls = ({
  filters,
  currentFilters,
  onFilterChange,
  onClearFilter,
}) => {
  const { name, city, language, stomachSize, priceRange } = currentFilters;

  const filterSections = [
    {
      id: "name",
      title: "სახელი",
      options: filters.names?.map((name) => ({ value: name, label: name })),
      currentValue: name,
      onChange: (value) => onFilterChange("name", value),
    },
    {
      id: "city",
      title: "ქალაქი",
      options: filters.cities?.map((type) => ({ value: type, label: type })),
      currentValue: city,
      onChange: (value) => onFilterChange("city", value),
    },
    {
      id: "language",
      title: "ენა",
      options: filters.languages?.map((type) => ({ value: type, label: type })),
      currentValue: language,
      onChange: (value) => onFilterChange("language", value),
    },
    {
      id: "stomachSize",
      title: "ღიპის ზომა",
      options: filters.stomachSizes?.map((type) => ({
        value: type,
        label: type,
      })),
      currentValue: stomachSize,
      onChange: (value) => onFilterChange("stomachSize", value),
    },
  ];

  return (
    <div className="space-y-6">
      
      <div className="space-y-4">
        <h3 className="font-medium">ფასი</h3>
        <div className="px-2">
          <Slider
            min={filters.priceRange.min}
            max={filters.priceRange.max}
            step={100}
            value={priceRange}
            onValueChange={(value) => onFilterChange("priceRange", value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="font-medium text-sm">$ {priceRange[0]}</div>
          <div className="font-medium text-sm">$ {priceRange[1]}</div>
        </div>
      </div>

    
      {filterSections.map((section) => (
        <div key={section.id} className="space-y-3">
          <h4 className="text-sm font-medium flex justify-between">
            <span>{section.title}</span>
            {section.currentValue && (
              <button
                className="text-xs text-gray-600 flex items-center"
                onClick={() => onClearFilter(section.id)}
              >
                <X className="mr-1 h-3 w-3" />
                Clear
              </button>
            )}
          </h4>
          <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
            {section.options.map((option) => (
              <Badge
                key={option.value}
                variant={
                  section.currentValue === option.value ? "default" : "outline"
                }
                className={`cursor-pointer px-3 py-1 ${
                  section.currentValue === option.value
                    ? "bg-blue-100 hover:bg-blue-200 text-blue-900 border-blue-200"
                    : "bg-white hover:bg-gray-100 text-gray-700"
                }`}
                onClick={() => {
                  section.onChange(
                    section.currentValue === option.value ? "" : option.value
                  );
                }}
              >
                {option.label}
                {section.currentValue === option.value && (
                  <Check className="ml-1 h-3 w-3 inline" />
                )}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
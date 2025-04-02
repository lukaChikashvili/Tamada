"use client"
import { useState, useEffect } from "react"; 
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from '@/components/ui/select';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter, Sliders, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback } from 'react';

const TamadaFilters = ({ filters }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentName = searchParams.get("name") || "";
  const currentCity = searchParams.get("city") || "";
  const currentLanguage = searchParams.get("language") || "";
  const currentStomachSize = searchParams.get("stomachSize") || "";
  const currentMinPrice = searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")) : filters.priceRange.min;
  const currentMaxPrice = searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")) : filters.priceRange.max;
  const currentSortBy = searchParams.get("sortBy") || "newest";

  // ✅ Add useState for priceRange
  const [name, setName] = useState(currentName);
  const [city, setCity] = useState(currentCity);
  const [language, setLanguage] = useState(currentLanguage);
  const [stomach, setStomach] = useState(currentStomachSize);
  const [priceRange, setPriceRange] = useState([currentMinPrice, currentMaxPrice]); // ✅ Now priceRange is defined
  const [sortBy, setSortBy] = useState(currentSortBy);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    setName(currentName);
    setCity(currentCity);
    setLanguage(currentLanguage);
    setStomach(currentStomachSize);
    setPriceRange([currentMinPrice, currentMaxPrice]);
    setSortBy(currentSortBy);
  }, [
    currentName,
    currentCity,
    currentLanguage,
    currentStomachSize,
    currentMinPrice,
    currentMaxPrice,
    currentSortBy,
  ]);

  const activeFilterCount = [
    name,
    city,
    language,
    stomach,
    currentMinPrice > filters.priceRange.min || currentMaxPrice < filters.priceRange.max,
  ].filter(Boolean).length;

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();

    if (name) params.set("name", name);
    if (language) params.set("language", language);
    if (city) params.set("city", city);
    if (stomach) params.set("stomachSize", stomach);
    if (priceRange[0] > filters.priceRange.min) params.set("minPrice", priceRange[0].toString());
    if (priceRange[1] < filters.priceRange.max) params.set("maxPrice", priceRange[1].toString());
    if (sortBy !== "newest") params.set("sortBy", sortBy);

    const search = searchParams.get("search");
    const page = searchParams.get("page");
    if (search) params.set("search", search);
    if (page && page !== "1") params.set("page", page);

    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;

    router.push(url);
    setIsSheetOpen(false);
  }, [name, city, language, stomach, priceRange, sortBy, pathname, searchParams, filters.priceRange.min, filters.priceRange.max]);

  return (
    <div>
      <div className="flex lg:flex-col justify-between gap-4">
        {/* Mobile Filters */}
        <div className="lg:hidden mb-4">
          <div className="flex items-center">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>

                <div className="py-6">
                  {/* Replace CarFilterControls with your filter components */}
                </div>

                <SheetFooter className="sm:justify-between flex-row pt-2 border-t space-x-4 mt-auto">
                  <Button type="button" variant="outline" className="flex-1">
                    Reset
                  </Button>
                  <Button type="button" className="flex-1">
                    Show Results
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <Select value={sortBy} onValueChange={(value) => { setSortBy(value); setTimeout(() => applyFilters(), 0); }}>
          <SelectTrigger className="w-[180px] lg:w-full">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {[
              { value: "newest", label: "Newest First" },
              { value: "priceAsc", label: "Price: Low to High" },
              { value: "priceDesc", label: "Price: High to Low" },
            ].map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Desktop Filters */}
        <div className="hidden lg:block sticky top-24">
          <div className="border rounded-lg overflow-hidden bg-white">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-medium flex items-center">
                <Sliders className="mr-2 h-4 w-4" />
                Filters
              </h3>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" className="h-8 text-sm text-gray-600">
                  <X className="mr-1 h-3 w-3" />
                  Clear All
                </Button>
              )}
            </div>

            <div className="p-4">
              {/* Replace CarFilterControls with your filter components */}
            </div>

            <div className="px-4 py-4 border-t">
              <Button onClick={applyFilters} className="w-full">
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TamadaFilters;

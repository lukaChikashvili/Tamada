"use client"
import { getTamadas } from '@/actions/carListing';
import TamadaCard from '@/components/TamadaCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import useFetch from '@/hooks/use-fetch';
import { Info } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation'
import TamadaListingLoading from './TamadaListingLoading';
import { useEffect, useState } from 'react';
import Link from 'next/link';


const TamadaListing = () => {
    
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 6;

  const { loading, fn: fetchTamadas, data: result, error} = useFetch(getTamadas);

  const search = searchParams.get("search") || "";
  const name = searchParams.get("name") || "";
  const city = searchParams.get("city") || "";
  const stomachSize = searchParams.get("stomachSize") || "";
  const language = searchParams.get("language") || "";
  const minPrice = searchParams.get("minPrice") || 0;
  const maxPrice = searchParams.get("maxPrice") || Number.MAX_SAFE_INTEGER;
  const sortBy = searchParams.get("sortBy") || "newest";
  const page = parseInt(searchParams.get("page") || "1");
  

  useEffect(() => {
    fetchTamadas({
      search,
      name,
      language,
      city,
      stomachSize,
      minPrice,
      maxPrice,
      sortBy,
      page,
      limit,
    });
  }, [
    search,
    name,
    city,
    language,
    stomachSize,
    minPrice,
    maxPrice,
    sortBy,
    page,
  ]);

  useEffect(() => {
    if (currentPage !== page) {
      const params = new URLSearchParams(searchParams);
      params.set("page", currentPage.toString());
      router.push(`?${params.toString()}`);
    }
  }, [currentPage, router, searchParams, page]);

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
  };

  const getPaginationUrl = (pageNum) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNum.toString());
    return `?${params.toString()}`;
  };

  if (loading && !result) {
    return <TamadaListingLoading />;
  }

  if (error || (result && !result.success)) {
    return (
      <Alert variant="destructive">
        <Info className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
         ვერ ჩამოიტვირთა თამადები
        </AlertDescription>
      </Alert>
    );
  }


  if (!result || !result.data) {
    return null;
  }

  const { data: tamadas, pagination } = result;

  


  if (tamadas.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 border rounded-lg bg-gray-50">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <Info className="h-8 w-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-medium mb-2">თამადა ვერ მოიძებნა</h3>
        <p className="text-gray-500 mb-6 max-w-md">
          ვერ ვიპოვეთ ისეთი თამადა, რომელიც თქვენს მიერ აღწერილ თამადას მიესადაგება
        </p>
        <Button variant="outline" asChild>
          <Link href="/tamadas">გაასუფთავე ყველა ფილტრი</Link>
        </Button>
      </div>
    );
  }


  const paginationItems = [];


  const visiblePageNumbers = [];

  visiblePageNumbers.push(1);

  for (
    let i = Math.max(2, page - 1);
    i <= Math.min(pagination.pages - 1, page + 1);
    i++
  ) {
    visiblePageNumbers.push(i);
  }

 
  if (pagination.pages > 1) {
    visiblePageNumbers.push(pagination.pages);
  }


  const uniquePageNumbers = [...new Set(visiblePageNumbers)].sort(
    (a, b) => a - b
  );

  let lastPageNumber = 0;
  uniquePageNumbers.forEach((pageNumber) => {
    if (pageNumber - lastPageNumber > 1) {
      
      paginationItems.push(
        <PaginationItem key={`ellipsis-${pageNumber}`}>
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    paginationItems.push(
      <PaginationItem key={pageNumber}>
        <PaginationLink
          href={getPaginationUrl(pageNumber)}
          isActive={pageNumber === page}
          onClick={(e) => {
            e.preventDefault();
            handlePageChange(pageNumber);
          }}
        >
          {pageNumber}
        </PaginationLink>
      </PaginationItem>
    );

    lastPageNumber = pageNumber;
  });




  return (
    <div>
  
    <div className="flex justify-between items-center mb-6">
      <p className="text-gray-600">
        ნაჩვენებია{" "}
        <span className="font-medium">
          {(page - 1) * limit + 1}-{Math.min(page * limit, pagination.total)}
        </span>{" "}
        -  <span className="font-medium">{pagination.total}</span> თამადიდან
      </p>
    </div>

    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tamadas.map((value) => (
        <TamadaCard key={value.id} value={value} />
      ))}
    </div>

    
    {pagination.pages > 1 && (
      <Pagination className="mt-10">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={getPaginationUrl(page - 1)}
              onClick={(e) => {
                e.preventDefault();
                if (page > 1) {
                  handlePageChange(page - 1);
                }
              }}
              className={page <= 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>

          {paginationItems}

          <PaginationItem>
            <PaginationNext
              href={getPaginationUrl(page + 1)}
              onClick={(e) => {
                e.preventDefault();
                if (page < pagination.pages) {
                  handlePageChange(page + 1);
                }
              }}
              className={
                page >= pagination.pages
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )}
  </div>
  )
}

export default TamadaListing

"use client";

import { deleteTamada, getTamada } from "@/actions/tamadas";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useFetch from "@/hooks/use-fetch";
import {  Eye, Loader2, MoreHorizontal, Plus, Search, Star, StarOff, Trash2, Wine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const TamadaList = () => {
  const [search, setSearch] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tamadaToDelete, setTamadaToDelete] = useState(null);

  const router = useRouter();

  const {
    loading: loadingTamadas,
    fn: fetchTamada,
    data: tamadasData,
    error: tamadaError,
  } = useFetch(getTamada);

  const {
    loading: deletingTamada,
    fn: deleteTamadaFn,
    data: deleteResult,
    error: deleteError,
  } = useFetch(deleteTamada);

  useEffect(() => {
    fetchTamada(search);
  }, [search]);

  useEffect(() => {
    if (tamadaError) {
      toast.error("Failed to load cars");
    }

    if (deleteError) {
      toast.error("Failed to delete car");
    }

   
  }, [tamadaError, deleteError]);

  useEffect(() => {
    if (deleteResult?.success) {
      toast.success("Tamada deleted successfully");
      fetchTamada(search);
    }

   
  }, [deleteResult,  search]);

  const handleDeleteTamada = async () => {
    if (!tamadaToDelete) return;

    await deleteTamadaFn(tamadaToDelete.id);
    setDeleteDialogOpen(false);
    setTamadaToDelete(null);
  };


  useEffect(() => {
    console.log("Fetched Tamadas Data:", tamadasData);
  }, [tamadasData]);

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
        <Button
          variant="destructive"
          onClick={() => router.push("/admin/tamadas/create")}
          className="flex items-center cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          დაამატე თამადა
        </Button>

        <form className="flex w-full sm:w-auto">
          <div className="relative flex-1 mt-6">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search Tamadas..."
              className="pl-9 w-full sm:w-60"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </form>
      </div>

      <Card className="mt-4">
        <CardContent className="p-0">
          {loadingTamadas && !tamadasData ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : tamadasData?.success && tamadasData?.data.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>სახელი და ქალაქი</TableHead>
                    <TableHead>წელი</TableHead>
                    <TableHead>ფასი</TableHead>
                    <TableHead>პრემიუმი</TableHead>
                    <TableHead className="text-right">მოქმედება</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tamadasData.data.map((tamada) => (
                    <TableRow key={tamada.id}>
                      <TableCell>
                        <div className="w-10 h-10 rounded-md overflow-hidden">
                          {tamada.images?.length > 0 ? (
                            <Image
                              src={tamada.images[0]}
                              alt={`${tamada.name} ${tamada.city}`}
                              height={40}
                              width={40}
                              className="w-full h-full object-cover"
                              priority
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <Wine className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {tamada.name} {tamada.city}
                      </TableCell>
                      <TableCell>{tamada.year}</TableCell>
                      <TableCell>{tamada.price}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-9 w-9"
                         
                           onClick={() => handleToggleFeatured(tamada)}
                          
                        >
                          {tamada.featured ? (
                            <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                          ) : (
                            <StarOff className="h-5 w-5 text-gray-400" />
                          )}
                        </Button>
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>მოქმედება</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => router.push(`/tamadas/${tamada.id}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              ნახვა
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                           
                           
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setTamadaToDelete(tamada);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              წაშლა
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>


                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No Tamadas found.
            </div>
          )}
        </CardContent>
      </Card>


      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>დაადასტურე წაშლა</DialogTitle>
            <DialogDescription>
              ნამდვილად გინდა წაშალო {tamadaToDelete?.name}{" "}
              {tamadaToDelete?.city} ({tamadaToDelete?.year})? ამ მოქმედებას უკან ვერ დააბრუნებ.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deletingTamada}
            >
              გაუქმება
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTamada}
              disabled={deletingTamada}
            >
              {deletingTamada ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  იშლება...
                </>
              ) : (
                "წაშალე თამადა"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TamadaList;

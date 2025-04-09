"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Save,
  Clock,
  Loader2,
  Users,
  Shield,
  UserX,
  CheckCircle,
  Search,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useFetch from "@/hooks/use-fetch";
import {
  getDealershipInfo,
  saveWorkingHours,
  getUsers,
  updateUserRole,
} from "@/actions/settings";


const DAYS = [
  { value: "MONDAY", label: "ორშაბათი" },
  { value: "TUESDAY", label: "სამშაბათი" },
  { value: "WEDNESDAY", label: "ოთხშაბათი" },
  { value: "THURSDAY", label: "ხუთშაბათი" },
  { value: "FRIDAY", label: "პარასკევი" },
  { value: "SATURDAY", label: "შაბათი" },
  { value: "SUNDAY", label: "კვირა" },
];

export const SettingsForm = () => {
  const [workingHours, setWorkingHours] = useState(
    DAYS.map((day) => ({
      dayOfWeek: day.value,
      openTime: "09:00",
      closeTime: "18:00",
      isOpen: day.value !== "SUNDAY",
    }))
  );

  const [userSearch, setUserSearch] = useState("");
  const [confirmAdminDialog, setConfirmAdminDialog] = useState(false);
  const [userToPromote, setUserToPromote] = useState(null);
  const [confirmRemoveDialog, setConfirmRemoveDialog] = useState(false);
  const [userToDemote, setUserToDemote] = useState(null);


  const {
    loading: fetchingSettings,
    fn: fetchDealershipInfo,
    data: settingsData,
    error: settingsError,
  } = useFetch(getDealershipInfo);

  const {
    loading: savingHours,
    fn: saveHours,
    data: saveResult,
    error: saveError,
  } = useFetch(saveWorkingHours);

  const {
    loading: fetchingUsers,
    fn: fetchUsers,
    data: usersData,
    error: usersError,
  } = useFetch(getUsers);

  const {
    loading: updatingRole,
    fn: updateRole,
    data: updateRoleResult,
    error: updateRoleError,
  } = useFetch(updateUserRole);


  useEffect(() => {
    fetchDealershipInfo();
    fetchUsers();
  }, []);


  useEffect(() => {
    if (settingsData?.success && settingsData.data) {
      const dealership = settingsData.data;

     
      if (dealership.workingHours.length > 0) {
        const mappedHours = DAYS.map((day) => {
          
          const hourData = dealership.workingHours.find(
            (h) => h.dayOfWeek === day.value
          );

          if (hourData) {
            return {
              dayOfWeek: hourData.dayOfWeek,
              openTime: hourData.openTime,
              closeTime: hourData.closeTime,
              isOpen: hourData.isOpen,
            };
          }

          
          return {
            dayOfWeek: day.value,
            openTime: "09:00",
            closeTime: "18:00",
            isOpen: day.value !== "SUNDAY",
          };
        });

        setWorkingHours(mappedHours);
      }
    }
  }, [settingsData]);

  
  useEffect(() => {
    if (settingsError) {
      toast.error("Failed to load dealership settings");
    }

    if (saveError) {
      toast.error(`Failed to save working hours: ${saveError.message}`);
    }

    if (usersError) {
      toast.error("Failed to load users");
    }

    if (updateRoleError) {
      toast.error(`Failed to update user role: ${updateRoleError.message}`);
    }
  }, [settingsError, saveError, usersError, updateRoleError]);


  useEffect(() => {
    if (saveResult?.success) {
      toast.success("Working hours saved successfully");
      fetchDealershipInfo();
    }

    if (updateRoleResult?.success) {
      toast.success("User role updated successfully");
      fetchUsers();
      setConfirmAdminDialog(false);
      setConfirmRemoveDialog(false);
    }
  }, [saveResult, updateRoleResult]);

  
  const handleWorkingHourChange = (index, field, value) => {
    const updatedHours = [...workingHours];
    updatedHours[index] = {
      ...updatedHours[index],
      [field]: value,
    };
    setWorkingHours(updatedHours);
  };

  const handleSaveHours = async () => {
    await saveHours(workingHours);
  };


  const handleMakeAdmin = async () => {
    if (!userToPromote) return;
    await updateRole(userToPromote.id, "ADMIN");
  };


  const handleRemoveAdmin = async () => {
    if (!userToDemote) return;
    await updateRole(userToDemote.id, "USER");
  };

  
  const filteredUsers = usersData?.success
    ? usersData.data.filter(
        (user) =>
          user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
          user.email.toLowerCase().includes(userSearch.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="hours">
        <TabsList>
          <TabsTrigger value="hours">
            <Clock className="h-4 w-4 mr-2" />
            სამუშაო საათები
          </TabsTrigger>
          <TabsTrigger value="admins">
            <Shield className="h-4 w-4 mr-2" />
            ადმინისტრატორები
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hours" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>სამუშაო საათები</CardTitle>
              <CardDescription>
               დააყენეთ სამუშაო დღეები
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {DAYS.map((day, index) => (
                  <div
                    key={day.value}
                    className="grid grid-cols-12 gap-4 items-center py-3 px-4 rounded-lg hover:bg-slate-50"
                  >
                    <div className="col-span-3 md:col-span-2">
                      <div className="font-medium">{day.label}</div>
                    </div>

                    <div className="col-span-9 md:col-span-2 flex items-center">
                      <Checkbox 
                        id={`is-open-${day.value}`}
                        checked={workingHours[index]?.isOpen}
                        onCheckedChange={(checked) => {
                          handleWorkingHourChange(index, "isOpen", checked);
                        }}
                      />
                      <Label
                        htmlFor={`is-open-${day.value}`}
                        className="ml-2 cursor-pointer"
                      >
                        {workingHours[index]?.isOpen ? "Open" : "Closed"}
                      </Label>
                    </div>

                    {workingHours[index]?.isOpen && (
                      <>
                        <div className="col-span-5 md:col-span-4">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            <Input
                              type="time"
                              value={workingHours[index]?.openTime}
                              onChange={(e) =>
                                handleWorkingHourChange(
                                  index,
                                  "openTime",
                                  e.target.value
                                )
                              }
                              className="text-sm"
                            />
                          </div>
                        </div>

                        <div className="text-center col-span-1">to</div>

                        <div className="col-span-5 md:col-span-3">
                          <Input
                            type="time"
                            value={workingHours[index]?.closeTime}
                            onChange={(e) =>
                              handleWorkingHourChange(
                                index,
                                "closeTime",
                                e.target.value
                              )
                            }
                            className="text-sm"
                          />
                        </div>
                      </>
                    )}

                    {!workingHours[index]?.isOpen && (
                      <div className="col-span-11 md:col-span-8 text-gray-500 italic text-sm">
                        დასვენების დღე
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <Button variant="destructive" onClick={handleSaveHours} disabled={savingHours}>
                  {savingHours ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ინახება...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      შეინახე სამუშაო საათები
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admins" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>ადმინისტრატორები</CardTitle>
              <CardDescription>
                მართე მომხმარებლები ადმინისტრატორის პრივილეგიებით
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="მოძებნე მომხმარებლები..."
                  className="pl-9 w-full"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>

              {fetchingUsers ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : usersData?.success && filteredUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>მომხმარებელი</TableHead>
                        <TableHead>ელ-ფოსტა</TableHead>
                        <TableHead>როლი</TableHead>
                        <TableHead className="text-right">მოქმედება</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                {user.imageUrl ? (
                                  <img
                                    src={user.imageUrl}
                                    alt={user.name || "User"}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Users className="h-4 w-4 text-gray-500" />
                                )}
                              </div>
                              <span>{user.name || "Unnamed User"}</span>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                user.role === "ADMIN"
                                  ? "bg-green-800"
                                  : "bg-gray-800"
                              }
                            >
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {user.role === "ADMIN" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600"
                                onClick={() => {
                                  setUserToDemote(user);
                                  setConfirmRemoveDialog(true);
                                }}
                                disabled={updatingRole}
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                 გააუქმე ადმინი
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setUserToPromote(user);
                                  setConfirmAdminDialog(true);
                                }}
                                disabled={updatingRole}
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                გახადე ადმინი
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    მომხმარებელი ვერ მოიძებნა
                  </h3>
                  <p className="text-gray-500">
                    {userSearch
                      ? "მომხმარებელი არ ემთხვევა შენს ძებნის კრიტერიუმებს"
                      : "მომხმარებლები არ არიან რეგისტრირებულები"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

       
          <Dialog
            open={confirmAdminDialog}
            onOpenChange={setConfirmAdminDialog}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>დაადასტურე რომ ხარ ადმინი</DialogTitle>
                <DialogDescription>
                  დარწმუნებული ხარ რომ გინდა მისცე ადმინისტრატორის უფლებები{" "}
                  {userToPromote?.name || userToPromote?.email}? ადმინისტრატორებს შეუძლიათ მართონ ყველაფერი
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setConfirmAdminDialog(false)}
                  disabled={updatingRole}
                >
                  გაუქმება
                </Button>
                <Button onClick={handleMakeAdmin} disabled={updatingRole}>
                  {updatingRole ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      დასტურდება...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      დადასტურება
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          
          <Dialog
            open={confirmRemoveDialog}
            onOpenChange={setConfirmRemoveDialog}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>მოაშორე ადმინის პრივილეგიები</DialogTitle>
                <DialogDescription>
                  ნამდვილად გსურს ადმინის პრივილეგიის გაუქმება?{" "}
                  {userToDemote?.name || userToDemote?.email}? ისინი ვერ მართავენ საიტს
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setConfirmRemoveDialog(false)}
                  disabled={updatingRole}
                >
                  გაუქმება
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRemoveAdmin}
                  disabled={updatingRole}
                >
                  {updatingRole ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      უქმდება...
                    </>
                  ) : (
                    "გააუქმე ადმინი"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
};
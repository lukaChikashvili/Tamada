"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useDropzone } from 'react-dropzone/';
import { Camera, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import useFetch from '@/hooks/use-fetch';
import { AddTamadaToDb, processTamadaImageWithAi } from '@/actions/tamadas';
import { useRouter } from 'next/navigation';

export const AddTamadaForm = () => {

    const languageTypes = ["ქართული", "ინგლისური", "რუსული", "მეგრული"];
    const nationality = ["ქართველი", "სომეხი", "რუსი", "სხვა"];
    const clothingStyle = ["ჩვეულებრივი", "შარვალ-კოსტუმი", "ჩოხა-ახალუხი", "ტიტველი"];
    const rating = ["ცნობილი", "ძაან ცნობილი", "მეტ-ნაკლებად ცნობილი", "კაციშვილი არ იცნობს", "ეგი ვინაა სიმონ?"];
    const eventTypes = ["ქელეხი", "ქორწილი", "დაბადების დღე", "ბოლო ზარი", "უბრალო შეკრება"];


    const [imageError, setImageError] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [uploadedAiImage, setUploadedAiImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const router = useRouter();
    
    const tamadaFormSchema = z.object({
        name: z.string().min(1, "სახელი აუცილებელია"),
        year: z.string().refine((val) => {
            const year = parseInt(val);
            return !isNaN(year) && year >= 1900 && year <= new Date().getFullYear() + 1;
          }, "წელი აუცილებელია"),
        price: z.string().min(1, "ფასი აუცილებელია"),
        drinks: z.number().min(1, "ჭიქები აუცილებელია"),
        city: z.string().min(1, "ქალაქი აუცილებელია"),
        language: z.string().min(1, "ენა აუცილებელია"),
        stomachSize: z.number().min(1, "ღიპის ზომა აუცილებელია"), 
        description: z.string().optional(), 
        humorLevel: z.number().min(1).max(10, "Humor level should be between 1 and 10").optional(),
        speechQuality: z.number().min(1).max(10, "Speech quality should be between 1 and 10"),
        nationality: z.string().min(1, "Nationality is required"),
        experienceYears: z.number().min(1, "Experience years are required"),
        clothingStyle: z.string().min(1, "Clothing style is required"), 
        popularityScore: z.string().min(0).max(100, "Popularity score should be between 0 and 100"),
        eventTypes:  z.string().min(1, "At least one event type is required"),
        featured: z.boolean().default(false),  
        


    });

    const onMultiImagesDrop = useCallback((acceptedFiles) => {
        const validFiles = acceptedFiles.filter((file) => {
          if (file.size > 5 * 1024 * 1024) {
            toast.error(`${file.name} exceeds 5MB limit and will be skipped`);
            return false;
          }
          return true;
        });
    
        if (validFiles.length === 0) return;

        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setUploadProgress(progress);
    
          if (progress >= 100) {
            clearInterval(interval);
    
            
            const newImages = [];
            validFiles.forEach((file) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                newImages.push(e.target.result);
    
                
                if (newImages.length === validFiles.length) {
                  setUploadedImages((prev) => [...prev, ...newImages]);
                  setUploadProgress(0);
                  setImageError("");
                  toast.success(
                    `Successfully uploaded ${validFiles.length} images`
                  );
                }
              };
              reader.readAsDataURL(file);
            });
          }
        }, 200);
      }, []);

      const {
        getRootProps: getMultiImageRootProps,
        getInputProps: getMultiImageInputProps,
      } = useDropzone({
        onDrop: onMultiImagesDrop,
        accept: {
          "image/*": [".jpeg", ".jpg", ".png", ".webp"],
        },
        multiple: true,
      });
        

      const {
        loading: addTamadaLoading,
        fn: addTamadafn,
        data: addTamadaResult,
      } = useFetch(AddTamadaToDb);

      useEffect(() => {
        if (addTamadaResult?.success) {
          toast.success("თამადა აიტვირთა წარმატებით");
          router.push("/admin/tamadas");
        }
      }, [addTamadaResult, router]);

      const onAiDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;
    
        if (file.size > 5 * 1024 * 1024) {
          toast.error("Image size should be less than 5MB");
          return;
        }
    
        setUploadedAiImage(file);
    
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      }, []);

      
      const { getRootProps: getAiRootProps, getInputProps: getAiInputProps } =
      useDropzone({
        onDrop: onAiDrop,
        accept: {
          "image/*": [".jpeg", ".jpg", ".png", ".webp"],
        },
        maxFiles: 1,
        multiple: false,
      });

      const {
        loading: processImageLoading,
        fn: processImageFn,
        data: processImageResult,
        error: processImageError,
      } = useFetch(processTamadaImageWithAi);
    
      const processWithAI = async () => {
        if (!uploadedAiImage) {
          toast.error("Please upload an image first");
          return;
        }
    
        await processImageFn(uploadedAiImage);
      };


      useEffect(() => {
        if (processImageError) {
          toast.error(processImageError.message || "Failed to upload car");
        }
      }, [processImageError]);
      

    
    


    const {
        register,
        setValue,
        getValues,
        formState: { errors },
        handleSubmit,
        watch,
    } = useForm({
        resolver: zodResolver(tamadaFormSchema)


    });


    

      // submit form
      const onSubmit = async ( data) => {
       

        const tamadaDatato = {
          ...data,
          year: parseInt(data.year),
          price: parseFloat(data.price),
          
        };
    
       
        await addTamadafn({
          tamadaDatato,
          images: uploadedImages,
        });
          console.log("🔥 onSubmit triggered with:", data);


      }

    const [activeTab, setActiveTab] = useState("ai");

    const removeImage = (index) => {
        setUploadedImages((prev) => prev.filter((_, i) => i !== index));
      };


      
      useEffect(() => {
        if (processImageResult?.success) {
            const tamadaDetails = processImageResult.data;
    
            setValue("name", tamadaDetails.name);
            setValue("year", tamadaDetails.year);
            setValue("price", tamadaDetails.price);
            setValue("drinks", tamadaDetails.drinks);
            setValue("city", tamadaDetails.city);
            setValue("language", tamadaDetails.language);
            setValue("stomachSize", tamadaDetails.stomachSize);
            setValue("description", tamadaDetails.description);
            setValue("humorLevel", tamadaDetails.humorLevel);
            setValue("speechQuality", tamadaDetails.speechQuality);
            setValue("nationality", tamadaDetails.nationality);
            setValue("experienceYears", tamadaDetails.experienceYears);
            setValue("clothingStyle", tamadaDetails.clothingStyle);
            setValue("popularityScore", tamadaDetails.popularityScore);
            setValue("eventTypes", tamadaDetails.eventTypes);
    
            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadedImages((prev) => [...prev, e.target.result]);
            };
            reader.readAsDataURL(uploadedAiImage);
    
            toast.success("წარმატებით გამოვიდა დეტალები", {
                description: `Detected ${tamadaDetails.year} ${tamadaDetails.city} ${tamadaDetails.clothingStyle} with ${Math.round(tamadaDetails.confidence * 100)}% confidence`,
            });
    
            setActiveTab("manual");
        }
    }, [processImageResult, setValue, uploadedAiImage]);
    

  return (
    <div>
            <Tabs
        defaultValue="ai"
        value = {activeTab}
        onValueChange={setActiveTab}
        className="mt-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">ხელით შეყვანა</TabsTrigger>
          <TabsTrigger value="ai">AI-ს დახმარებით</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="mt-6">
        <Card>
            <CardHeader>
              <CardTitle>თამადის დეტალები</CardTitle>
              <CardDescription>
               შეიყვანეთ იმ თამადის დეტალები, რომლებიც გსურთ რომ დაამატოთ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)}   className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">სახელი</Label>
                    <Input
                      id="name"
                      {...register("name")}
                      placeholder="e.g. ნუგზარი"
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* age */}
                  <div className="space-y-2">
                    <Label htmlFor="year">ასაკი</Label>
                    <Input
                      id="year"
                      {...register("year")}
                      placeholder="e.g. 56"
                      className={errors.year ? "border-red-500" : ""}
                    />
                    {errors.year && (
                      <p className="text-xs text-red-500">
                        {errors.year.message}
                      </p>
                    )}
                  </div>

                  {/* price */}
                  <div className="space-y-2">
                    <Label htmlFor="price">ფასი</Label>
                    <Input
                      id="price"
                      {...register("price")}
                      placeholder="e.g. 200 ლარი"
                      className={errors.price ? "border-red-500" : ""}
                    />
                    {errors.price && (
                      <p className="text-xs text-red-500">
                        {errors.price.message}
                      </p>
                    )}
                  </div>

                  {/* city */}
                  <div className="space-y-2">
                    <Label htmlFor="city">ქალაქი</Label>
                    <Input
                      id="city"
                      {...register("city")}
                      placeholder="e.g. ქუთაისი"
                      className={errors.city ? "border-red-500" : ""}
                    />
                    {errors.city && (
                      <p className="text-xs text-red-500">
                        {errors.city.message}
                      </p>
                    )}
                  </div>

                  {/* drinks */}
                  <div className="space-y-2">
                    <Label htmlFor="drinks">ჭიქის რაოდენობა</Label>
                    <Input
                      id="drinks"
                      {...register("drinks", { valueAsNumber: true })}
                      placeholder="e.g. 10"
                      className={errors.drinks ? "border-red-500" : ""}
                    />
                    {errors.drinks && (
                      <p className="text-xs text-red-500">
                        {errors.drinks.message}
                      </p>
                    )}
                  </div>

                  {/* stomachsize */}
                  <div className="space-y-2">
                    <Label htmlFor="stomachSize">ღიპის ზომა</Label>
                    <Input
                      id="stomachSize"
                      {...register("stomachSize", { valueAsNumber: true })}
                      placeholder="e.g. 50"
                      className={errors.stomachSize ? "border-red-500" : ""}
                    />
                    {errors.stomachSize && (
                      <p className="text-xs text-red-500">
                        {errors.stomachSize.message}
                      </p>
                    )}
                  </div>

                        {/* humorlevel */}
                        <div className="space-y-2">
                    <Label htmlFor="humorLevel">იუმორის დონე</Label>
                    <Input
                      id="humorLevel"
                      {...register("humorLevel", { valueAsNumber: true })}
                      placeholder="e.g. 8"
                      className={errors.humorLevel ? "border-red-500" : ""}
                    />
                    {errors.humorLevel && (
                      <p className="text-xs text-red-500">
                        {errors.humorLevel.message}
                      </p>
                    )}
                  </div>


                   {/* speechQuality */}
                   <div className="space-y-2">
                    <Label htmlFor="speechQuality">საუბრის ხარისხი</Label>
                    <Input
                      id="speechQuality"
                      {...register("speechQuality", { valueAsNumber: true })}
                      placeholder="e.g. 3"
                      className={errors.speechQuality ? "border-red-500" : ""}
                    />
                    {errors.speechQuality && (
                      <p className="text-xs text-red-500">
                        {errors.speechQuality.message}
                      </p>
                    )}
                  </div>


                        {/* experienceYears */}
                        <div className="space-y-2">
                    <Label htmlFor="experienceYears">გამოცდილება</Label>
                    <Input
                      id="experienceYears"
                      {...register("experienceYears", { valueAsNumber: true })}
                      placeholder="e.g. 3"
                      className={errors.experienceYears ? "border-red-500" : ""}
                    />
                    {errors.experienceYears && (
                      <p className="text-xs text-red-500">
                        {errors.experienceYears.message}
                      </p>
                    )}
                  </div>










                  {/* language */}
                  <div className="space-y-2">
                    <Label htmlFor="language">სასაუბრო ენა</Label>
                    <Select
                     {...register("language", { required: "ენა აუცილებელია" })}
                      onValueChange={(value) => setValue("language", value)}
                      defaultValue={getValues("language")}
                    >
                      <SelectTrigger
                        className={errors.language ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="აირჩიე სასაუბრო ენა..." />
                      </SelectTrigger>
                      <SelectContent>
                          {languageTypes.map((type) => {
                            return (
                                <SelectItem key = {type} value = {type}>
                                 {type}
                                </SelectItem>
                            )
                          })}
                      </SelectContent>
                    </Select>
                   
                  </div>

                  {/* nationality */}
                  <div className="space-y-2">
                    <Label htmlFor="nationality">ეროვნება</Label>
                    <Select
                     {...register("nationality", { required: "ენა აუცილებელია" })}
                      onValueChange={(value) => setValue("nationality", value)}
                      defaultValue={getValues("nationality")}
                    >
                      <SelectTrigger
                        className={errors.nationality ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="აირჩიეთ ეროვნება.." />
                      </SelectTrigger>
                      <SelectContent>
                        {nationality.map((type) => {
                            return (
                                <SelectItem key = {type} value = {type}>
                                 {type}
                                </SelectItem>
                            )
                          })}
                       
                      </SelectContent>
                    </Select>
                    
                  </div>

                  {/* clothing style */}
                  <div className="space-y-2">
                    <Label htmlFor="bodyType">ჩაცმის სტილი</Label>
                    <Select
                        {...register("clothinStyle", { required: "ენა აუცილებელია" })}
                      onValueChange={(value) => setValue("clothingStyle", value)}
                      defaultValue={getValues("clothingStyle")}
                    >
                      <SelectTrigger
                        className={errors.clothingStyle ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="აირჩიეთ ჩაცმის სტილი.." />
                      </SelectTrigger>
                      <SelectContent>
                      {clothingStyle.map((type) => {
                            return (
                                <SelectItem key = {type} value = {type}>
                                 {type}
                                </SelectItem>
                            )
                          })}
                      </SelectContent>
                    </Select>
                    {errors.bodyType && (
                      <p className="text-xs text-red-500">
                        {errors.bodyType.message}
                      </p>
                    )}
                  </div>

                  {/* humor level */}
                  

                  {/* popularityScore */}
                  <div className="space-y-2">
                    <Label htmlFor="popularityScore">პოპულარობის დონე</Label>
                    <Select
                     {...register("popularityScore", { required: "ენა აუცილებელია" })}
                      onValueChange={(value) => setValue("popularityScore", value)}
                      defaultValue={getValues("popularityScore")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="პოპულარობის დონე" />
                      </SelectTrigger>
                      <SelectContent>
                      {rating.map((type) => {
                            return (
                                <SelectItem key = {type} value = {type}>
                                 {type}
                                </SelectItem>
                            )
                          })}
                      </SelectContent>
                    </Select>
                    {errors.popularityScore && (
                      <p className="text-xs text-red-500">
                        {errors.popularityScore.message}
                      </p>
                    )}
                  </div>
                </div>


                {/* eventType */}
                <div className="space-y-2">
                    <Label htmlFor="eventTypes">ივენთის ტიპი</Label>
                    <Select
                     {...register("eventTypes", { required: "ენა აუცილებელია" })}
                      onValueChange={(value) => setValue("eventTypes", value)}
                      defaultValue={getValues("eventTypes")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="ჩაწერეთ ტიპი" />
                      </SelectTrigger>
                      <SelectContent>
                      {eventTypes.map((type) => {
                            return (
                                <SelectItem key = {type} value = {type}>
                                 {type}
                                </SelectItem>
                            )
                          })}
                      </SelectContent>
                    </Select>
                    {errors.eventTypes && (
                      <p className="text-xs text-red-500">
                        {errors.eventTypes.message}
                      </p>
                    )}
                  </div>
                



                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">აღწერა</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="ჩაწერე თამადის დეტალური აღწერა..."
                    className={`min-h-32 ${
                      errors.description ? "border-red-500" : ""
                    }`}
                  />
                  {errors.description && (
                    <p className="text-xs text-red-500">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Featured */}
                <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                  <Checkbox
                    id="featured"
                    
                    checked={watch("featured")}
                    onCheckedChange={(checked) => {
                      setValue("featured", checked);
                    }}
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="featured">მთავარი</Label>
                    <p className="text-sm text-gray-500">
                      ეს თამადები გამოჩნდებიან მთავარ გვერდზე
                    </p>
                  </div>
                </div>

                
                  
                <div>
                  <Label
                    htmlFor="images"
                    className={imageError ? "text-red-500" : ""}
                  >
                    სურათები{" "}
                    {imageError && <span className="text-red-500">*</span>}
                  </Label>
                  <div className="mt-2">
                    <div
                      {...getMultiImageRootProps()}
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition ${
                        imageError ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <input {...getMultiImageInputProps()} />
                      <div className="flex flex-col items-center justify-center">
                        <Upload className="h-12 w-12 text-gray-400 mb-3" />
                        <span className="text-sm text-gray-600">
                          Drag & drop or click to upload multiple images
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          (JPG, PNG, WebP, max 5MB each)
                        </span>
                      </div>
                    </div>
                    {imageError && (
                      <p className="text-xs text-red-500 mt-1">{imageError}</p>
                    )}
                    {uploadProgress > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>

                  {uploadedImages.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2">
                        Uploaded Images ({uploadedImages.length})
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {uploadedImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <Image
                              src={image}
                              alt={`Car image ${index + 1}`}
                              height={50}
                              width={50}
                              className="h-28 w-full object-cover rounded-md"
                              priority
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                
                  </div>

                  <button 
                  type="submit"
                  
                  className="w-full md:w-auto cursor-pointer"
                  disabled={addTamadaLoading}
                  
                  
                  
                >
                  {addTamadaLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ემატება თამადა...
                    </>
                  ) : (
                    "დაამატე თამადა"
                  )}
                </button>

              </form>
            </CardContent>
          </Card>
        </TabsContent>



        <TabsContent value="ai" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>ხელოვნური ინტელექტის დახმარება</CardTitle>
              <CardDescription>
                ატვირთე თამადის სურათი და AI თავად გამოიტანს დეტალებს
              </CardDescription>
            </CardHeader>
            <CardContent>
               <div className='space-y-6'>
               <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  {imagePreview ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={imagePreview}
                        alt="Tamada preview"
                        className="max-h-56 max-w-full object-contain mb-4"
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setImagePreview(null);
                            setUploadedAiImage(null);
                          }}
                        >
                          წაშლა
                        </Button>
                        <Button
                          onClick={processWithAI}
                          disabled={processImageLoading}
                          size="sm"
                          variant = "destructive"
                           className="cursor-pointer shadow-lg"
                        >
                          {processImageLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              დამუშავება...
                            </>
                          ) : (
                            <>
                              <Camera className="mr-2 h-4 w-4" />
                              დეტალების გამოტანა
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      {...getAiRootProps()}
                      className="cursor-pointer hover:bg-gray-50 transition"
                    >
                      <input {...getAiInputProps()} />
                      <div className="flex flex-col items-center justify-center">
                        <Camera className="h-12 w-12 text-gray-400 mb-3" />
                        <span className="text-sm text-gray-600">
                          Drag & drop or click to upload a car image
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          (JPG, PNG, WebP, max 5MB)
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {processImageLoading && (
                  <div className="bg-blue-50 text-blue-700 p-4 rounded-md flex items-center">
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    <div>
                      <p className="font-medium">სურათის ანალიზი...</p>
                      <p className="text-sm">
                        ხელოვნური ინტელექტი იღებს ინფორმაციას...
                      </p>
                    </div>
                  </div>
                )}

               

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">როგორ მუშაობს</h3>
                  <ol className="space-y-2 text-sm text-gray-600 list-decimal pl-4">
                    <li>ატვირთე ნათელი თამადის სურათი</li>
                    <li>დააჭირეთ "დეტალებს" რომ გამოიყენოთ AI</li>
                    <li>გადახედე ინფორმაციას</li>
                    <li>შეავსე გამოტოვებული დეტალები მანუალურად</li>
                    <li>დაამატე თამადა</li>
                  </ol>
                </div>

                <div className="bg-amber-50 p-4 rounded-md">
                  <h3 className="font-medium text-amber-800 mb-1">
                    რჩევები საუკეთესო შედეგისთვის
                  </h3>
                  <ul className="space-y-1 text-sm text-amber-700">
                    <li>• გამოიყენე ნათელი სურათები</li>
                    <li>• ცადე რომ გამოაჩინო მთელი სხეული</li>
                    <li>• რთული სახისთვის გამოიყენე სხვადასხვა რაკურსი</li>
                    <li>• ყოველთვის გადაამოწმე ინფორმაცია</li>
                  </ul>
                </div>
            
               </div>
            </CardContent>
            </Card>

            </TabsContent >

        </Tabs>
    </div>
  )
}


"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

const AddTamadaForm = () => {

    const languageTypes = ["ქართული", "ინგლისური", "რუსული", "მეგრული"];
    const nationality = ["ქართველი", "სომეხი", "რუსი", "სხვა"];
    const clothingStyle = ["ჩვეულებრივი", "შარვალ-კოსტუმი", "ჩოხა-ახალუხი", "ტიტველი"];
    const rating = ["ცნობილი", "ძაან ცნობილი", "მეტ-ნაკლებად ცნობილი", "კაციშვილი არ იცნობს", "ეგი ვინაა სიმონ?"];

    
    const tamadaFormSchema = z.object({
        name: z.string().min(1, "name is required"),
        year: z.string().refine((val) => {
            const year = parseInt(val);
            return !isNaN(year) && year >= 1900 && year <= new Date().getFullYear() + 1;
          }, "Valid year required"),
        price: z.string().min(1, "price is required"),
        drinks: z.number().min(1, "drinks is required"),
        city: z.string().min(1, "city is required"),
        language: z.string().min(1, "language is required"),
        stomachSize: z.number().min(1, "stomachSize is required"),
        features: z.string().optional(),  
        description: z.string().optional(), 
        humorLevel: z.number().min(1).max(10, "Humor level should be between 1 and 10"),
        speechQuality: z.number().min(1).max(10, "Speech quality should be between 1 and 10"),
        nationality: z.string().min(1, "Nationality is required"),
        experienceYears: z.number().min(1, "Experience years are required"),
        clothingStyle: z.string().min(1, "Clothing style is required"), 
        popularityScore: z.number().min(0).max(100, "Popularity score should be between 0 and 100"),
        eventTypes: z.array(z.string()).min(1, "At least one event type is required"),  
        alcoholTolerance: z.number().min(1).max(10, "Alcohol tolerance should be between 1 and 10"),
        awards: z.array(z.string()).optional(),  
        


    });

    const {
        register,
        setValue,
        getValues,
        formState: { errors },
        handleSubmit,
        watch,
    } = useForm({
        resolver: zodResolver(tamadaFormSchema)


    })

    const [activeTab, setActiveTab] = useState("ai");
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
              <form  className="space-y-6">
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
                    {errors.price && (
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
                      {...register("drinks")}
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
                      {...register("stomachSize")}
                      placeholder="e.g. 50"
                      className={errors.stomachSize ? "border-red-500" : ""}
                    />
                    {errors.stomachSize && (
                      <p className="text-xs text-red-500">
                        {errors.stomachSize.message}
                      </p>
                    )}
                  </div>

                  {/* language */}
                  <div className="space-y-2">
                    <Label htmlFor="language">სასაუბრო ენა</Label>
                    <Select
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
                  <div className="space-y-2">
                    <Label htmlFor="humorLevel">
                      იუმორის დონე{" "}
                      <span className="text-sm text-gray-500">(არჩევითი)</span>
                    </Label>
                    <Input
                      id="humorLevel"
                      {...register("humorLevel")}
                      placeholder="e.g. 5"
                    />
                  </div>

                  {/* popularityScore */}
                  <div className="space-y-2">
                    <Label htmlFor="popularityScore">პოპულარობის დონე</Label>
                    <Select
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
                  </div>
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

                
                  

                  

              </form>
            </CardContent>
          </Card>
        </TabsContent>

        </Tabs>
    </div>
  )
}

export default AddTamadaForm

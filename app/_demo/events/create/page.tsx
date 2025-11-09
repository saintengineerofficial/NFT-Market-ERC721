"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import dayjs from "dayjs"
import { createEvent } from "@/services/blockchain"
import { EventParams } from "@/lib/type.dt"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { ChangeEvent, useState } from "react";
import React from "react"

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  description: z.string().min(2, { message: "Description must be at least 2 characters" }),
  capacity: z.number().min(1, { message: "Capacity must be at least 1" }),
  ticketCost: z.number().min(0, { message: "Ticket cost must be 0 or greater" }),
  imageUrl: z.string().url({ message: "Please upload an image" }),
  startsAt: z.date({ message: "Please select a start date" }),
  endsAt: z.date({ message: "Please select an end date" }),
}).refine((data) => data.endsAt > data.startsAt, {
  message: "End date must be after start date",
  path: ["endsAt"],
})

const Page = () => {
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "test",
      description: "content.js:1 Uncaught (in promise) The message port closed before a response was received.",
      capacity: 100,
      ticketCost: 1,
      imageUrl: "",
      startsAt: new Date(),
      endsAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 24),
    },
  })

  const [uploading, setUploading] = useState(false);

  const uploadFile = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target?.files?.[0]) {
        alert("No file selected");
        return;
      }

      setUploading(true);
      const data = new FormData();
      data.set("file", e.target?.files?.[0]);
      const uploadRequest = await fetch("/api/files", {
        method: "POST",
        body: data,
      });
      const signedUrl = await uploadRequest.json();
      console.log("🚀 ~ uploadFile ~ signedUrl:", signedUrl)

      form.setValue("imageUrl", signedUrl); // 更新表单字段
      setUploading(false);
    } catch (e) {
      console.log(e);
      setUploading(false);
      alert("Trouble uploading file");
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values)
    const finalParams: EventParams = {
      ...values,
      startsAt: dayjs(values.startsAt).unix(),
      endsAt: dayjs(values.endsAt).unix(),
    }
    const loadingId = toast.loading("")
    try {
      const res = await createEvent(finalParams)
      console.log("🚀 ~ onSubmit ~ res:", res)
      toast.success("Event has been created")
      router.push("/")
    } catch (error) {
      console.log("🚀 ~ onSubmit ~ error:", error)
    } finally {
      toast.dismiss(loadingId)
    }
  }

  return (
    <Card className="container max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Create Event</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ticketCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TicketCost(ETH)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input type='file' disabled={uploading} onChange={uploadFile} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startsAt"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Time</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}>
                          {field.value ? (
                            <span>{dayjs(field.value).format("YYYY-MM-DD hh:mm:ss")}</span>
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={date => date < new Date("1900-01-01")}
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endsAt"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Time</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}>
                          {field.value ? (
                            <span>{dayjs(field.value).format("YYYY-MM-DD hh:mm:ss")}</span>
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={date => date < new Date("1900-01-01")}
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default Page

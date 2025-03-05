import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Session, insertSessionSchema } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Mic } from "lucide-react";
import { dutch } from "@/lib/dutch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function SessionList() {
  const [open, setOpen] = useState(false);
  const { data: sessions = [], isLoading } = useQuery<Session[]>({ 
    queryKey: ["/api/sessions"]
  });

  const form = useForm({
    resolver: zodResolver(insertSessionSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      workshopId: 1, // Temporary default
      notes: "",
    },
  });

  async function onSubmit(data: any) {
    try {
      await apiRequest("POST", "/api/sessions", data);
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error(error);
    }
  }

  if (isLoading) {
    return <div className="text-center">{dutch.common.loading}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{dutch.sessions.title}</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {dutch.sessions.new}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{dutch.sessions.new}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{dutch.sessions.date}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{dutch.sessions.notes}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">{dutch.common.save}</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sessions.map((session) => (
          <Link key={session.id} href={`/sessions/${session.id}`}>
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle>
                  {new Date(session.date).toLocaleDateString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {session.notes || "Geen notities"}
                </p>
                <Button variant="link" className="mt-4">
                  <Mic className="mr-2 h-4 w-4" />
                  Start Opname
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="text-center text-muted-foreground">
          {dutch.common.noData}
        </div>
      )}
    </div>
  );
}

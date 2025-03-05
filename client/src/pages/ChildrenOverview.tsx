import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Child, insertChildSchema } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Search } from "lucide-react";
import { dutch } from "@/lib/dutch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function ChildrenOverview() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const { data: children = [], isLoading } = useQuery<Child[]>({ 
    queryKey: ["/api/children"]
  });

  const form = useForm({
    resolver: zodResolver(insertChildSchema),
    defaultValues: {
      name: "",
      dateOfBirth: "",
      notes: "",
    },
  });

  const filteredChildren = children.filter((child) =>
    child.name.toLowerCase().includes(search.toLowerCase())
  );

  async function onSubmit(data: any) {
    try {
      await apiRequest("POST", "/api/children", data);
      queryClient.invalidateQueries({ queryKey: ["/api/children"] });
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
        <h1 className="text-3xl font-bold">Kinderen</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {dutch.children.new}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{dutch.children.new}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{dutch.children.name}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{dutch.children.dateOfBirth}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Toevoegen</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Zoek kinderen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredChildren.map((child) => (
          <Link key={child.id} href={`/children/${child.id}`}>
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle>{child.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Geboortedatum: {new Date(child.dateOfBirth).toLocaleDateString()}
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="link">Bekijk profiel</Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

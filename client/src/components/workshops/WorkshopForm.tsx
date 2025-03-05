import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { insertWorkshopSchema } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { dutch } from "@/lib/dutch";

interface WorkshopFormProps {
  onSuccess?: () => void;
}

export default function WorkshopForm({ onSuccess }: WorkshopFormProps) {
  const form = useForm({
    resolver: zodResolver(insertWorkshopSchema),
    defaultValues: {
      title: "",
      description: "",
      learningGoals: [],
      materials: [],
      status: "active",
    },
  });

  async function onSubmit(data: any) {
    try {
      await apiRequest("POST", "/api/workshops", {
        ...data,
        learningGoals: data.learningGoals.split(",").map((g: string) => g.trim()),
        materials: data.materials.split(",").map((m: string) => m.trim()),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/workshops"] });
      onSuccess?.();
      form.reset();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dutch.workshops.title}</FormLabel>
              <FormControl>
                <Input {...field} />
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
              <FormLabel>{dutch.workshops.description}</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="learningGoals"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dutch.workshops.learningGoals}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Voer leerdoelen in, gescheiden door komma's"
                  value={Array.isArray(field.value) ? field.value.join(", ") : field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="materials"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dutch.workshops.materials}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Voer materialen in, gescheiden door komma's"
                  value={Array.isArray(field.value) ? field.value.join(", ") : field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Opslaan</Button>
      </form>
    </Form>
  );
}

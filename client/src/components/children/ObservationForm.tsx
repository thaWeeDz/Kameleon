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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { insertObservationSchema } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { dutch } from "@/lib/dutch";

interface ObservationFormProps {
  childId: number;
}

const observationTypes = [
  "Sociaal-emotioneel",
  "Motoriek",
  "Taal",
  "Cognitief",
  "Creativiteit",
];

export default function ObservationForm({ childId }: ObservationFormProps) {
  const form = useForm({
    resolver: zodResolver(insertObservationSchema),
    defaultValues: {
      childId,
      date: new Date().toISOString().split("T")[0],
      type: "",
      content: "",
      learningGoals: [],
      images: [],
    },
  });

  async function onSubmit(data: any) {
    try {
      await apiRequest("POST", "/api/observations", {
        ...data,
        learningGoals: data.learningGoals.split(",").map((g: string) => g.trim()),
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/children/${childId}/observations`] 
      });
      form.reset({ ...form.getValues(), content: "", learningGoals: [] });
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dutch.observations.date}</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dutch.observations.type}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {observationTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dutch.observations.content}</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Observatie Toevoegen</Button>
      </form>
    </Form>
  );
}

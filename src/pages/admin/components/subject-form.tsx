import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  subjectSchema,
  type SubjectFormInput,
  type SubjectFormValues,
} from "@/lib/validation/subject.schema";
import { useApi } from "@/lib/api";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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

export function SubjectForm() {
  const navigate = useNavigate();
  const { post } = useApi();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<SubjectFormInput, unknown, SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      durationMonths: 1,
      fee: 0,
      isActive: true,
    },
  });

  const onSubmit = async (values: SubjectFormValues) => {
    try {
      setSubmitting(true);

      await post("/api/v1/subjects", {
        name: values.name,
        code: values.code,
        description: values.description || undefined,
        durationMonths: values.durationMonths,
        fee: values.fee,
        isActive: values.isActive,
      });

      toast.success("Subject created successfully");
      navigate("/admin/subjects");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create subject",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto max-w-3xl rounded-2xl">
      <CardHeader>
        <CardTitle>Create Subject</CardTitle>
        <CardDescription>Add a new subject.</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Web Development" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject Code</FormLabel>
                  <FormControl>
                    <Input placeholder="WD101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="durationMonths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (Months)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={
                          field.value === undefined ? "" : String(field.value)
                        }
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fee</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={
                          field.value === undefined ? "" : String(field.value)
                        }
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      placeholder="Write subject description..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-3 rounded-lg border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(!!checked)}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Active Subject</FormLabel>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/subjects")}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Create Subject"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

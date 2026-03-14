import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  subjectSchema,
  type SubjectFormValues,
} from "@/lib/validation/subject.schema";
import { useApi } from "@/lib/api";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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

interface MentorOption {
  id: number;
  mentorId: string;
  firstName: string;
  lastName: string;
  email: string;
  title?: string;
}

type MentorResponse = { content?: MentorOption[] } | MentorOption[];

export function SubjectForm() {
  const navigate = useNavigate();
  const { publicGet, post } = useApi();

  const [mentors, setMentors] = useState<MentorOption[]>([]);
  const [loadingMentors, setLoadingMentors] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: "",
      description: "",
      courseImageUrl: "",
      mentorId: "",
    },
  });

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const data = (await publicGet(
          "/api/v1/mentors?page=0&size=100",
        )) as MentorResponse;

        const mentorList = Array.isArray(data) ? data : (data.content ?? []);

        console.log("Mentor API response:", mentorList[0]);

        setMentors(mentorList.filter((m) => m?.id));
      } catch (error) {
        toast.error("Failed to load mentors", {
          description:
            "Could not reach the server. Check your connection and refresh.",
        });
      } finally {
        setLoadingMentors(false);
      }
    };

    fetchMentors();
  }, []);

  const onSubmit = async (values: SubjectFormValues) => {
    try {
      setSubmitting(true);

      const payload = {
        subjectName: values.name,
        description: values.description,
        ...(values.courseImageUrl
          ? { courseImageUrl: values.courseImageUrl }
          : {}),
        mentorId: parseInt(values.mentorId, 10),
      };

      console.log("Submitting payload:", payload);

      await post("/api/v1/subjects", payload);

      toast.success("Subject created", {
        description: `${values.name} was added successfully.`,
      });

      navigate("/admin/subjects");
    } catch (error) {
      toast.error("Failed to create subject", {
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getMentorLabel = (mentor: MentorOption) => {
    const name = [mentor.firstName, mentor.lastName].filter(Boolean).join(" ");
    return name || mentor.email || mentor.mentorId;
  };

  return (
    <Card className="mx-auto max-w-3xl rounded-2xl">
      <CardHeader>
        <CardTitle>Create Subject</CardTitle>
        <CardDescription>
          Add a new subject and assign a mentor.
        </CardDescription>
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
                    <Input placeholder="Full Stack Development" {...field} />
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
                    <Textarea
                      rows={5}
                      placeholder="Write a short subject description..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="courseImageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Course Image URL{" "}
                    <span className="text-muted-foreground text-sm">
                      (optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mentorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mentor</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={loadingMentors || mentors.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            loadingMentors
                              ? "Loading mentors..."
                              : mentors.length === 0
                                ? "No mentors available"
                                : "Select a mentor"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mentors.map((mentor) => (
                        <SelectItem key={mentor.id} value={String(mentor.id)}>
                          {getMentorLabel(mentor)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
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
              <Button type="submit" disabled={submitting || loadingMentors}>
                {submitting ? "Creating..." : "Create Subject"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

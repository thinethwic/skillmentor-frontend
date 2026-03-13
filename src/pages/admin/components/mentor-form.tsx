import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  mentorSchema,
  type MentorFormInput,
  type MentorFormValues,
} from "@/lib/validation/mentor.schema";

import { useApi } from "@/lib/api";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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

export function MentorForm() {
  const navigate = useNavigate();
  const { post } = useApi();

  const [submitting, setSubmitting] = useState(false);

  const form = useForm<MentorFormInput, unknown, MentorFormValues>({
    resolver: zodResolver(mentorSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      title: "",
      profession: "",
      company: "",
      experienceYears: 0,
      startYear: new Date().getFullYear(),
      bio: "",
      profileImageUrl: "",
      isCertified: false,
    },
  });

  const onSubmit = async (values: MentorFormValues) => {
    try {
      setSubmitting(true);

      const mentor = await post<{ id: number; mentorId?: string }>(
        "/api/v1/mentors",
        values,
      );

      toast.success("Mentor created successfully");

      if (mentor?.mentorId) {
        navigate(`/mentors/${mentor.mentorId}`);
      } else {
        navigate("/admin/mentors");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create mentor",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto max-w-3xl rounded-2xl">
      <CardHeader>
        <CardTitle>Create Mentor</CardTitle>
        <CardDescription>Add a new mentor profile</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* FIRST NAME / LAST NAME */}
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* EMAIL */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="mentor@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* PHONE / TITLE */}
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+94 77 1234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Senior Software Engineer"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* PROFESSION / COMPANY */}
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="profession"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profession</FormLabel>
                    <FormControl>
                      <Input placeholder="Software Engineering" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Google" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* EXPERIENCE / START YEAR */}
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="experienceYears"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience Years</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={
                          field.value === undefined ? "" : String(field.value)
                        }
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={
                          field.value === undefined ? "" : String(field.value)
                        }
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* PROFILE IMAGE */}
            <FormField
              control={form.control}
              name="profileImageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Image URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://image.com/photo.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* BIO */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write mentor bio..."
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* CERTIFIED */}
            <FormField
              control={form.control}
              name="isCertified"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 border rounded-lg p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(!!checked)}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Certified Mentor</FormLabel>
                </FormItem>
              )}
            />

            {/* BUTTONS */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/mentors")}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Create Mentor"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

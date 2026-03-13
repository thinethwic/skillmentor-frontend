import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Users, Plus, CheckCircle2, BadgeCheck } from "lucide-react";

import { useApi } from "@/lib/api";
import type { Mentor } from "@/types";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ─── Schema ───────────────────────────────────────────────────────────────────
// KEY FIX: isCertified uses z.boolean() without .default()
// Defaults belong in useForm({ defaultValues }), not in the Zod schema.
// Mixing .default() in the schema causes react-hook-form to infer
// the type as boolean | undefined which breaks the Control<T> generics.

const mentorSchema = z.object({
  mentorId: z.string().min(1, "Mentor ID is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  phoneNumber: z.string().optional().or(z.literal("")),
  title: z.string().optional().or(z.literal("")),
  profession: z.string().optional().or(z.literal("")),
  company: z.string().optional().or(z.literal("")),
  experienceYears: z.number().int().min(0).max(60).optional(),
  bio: z.string().max(2000).optional().or(z.literal("")),
  profileImageUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  isCertified: z.boolean(), // ← no .default() here
  startYear: z
    .number()
    .int()
    .min(1990)
    .max(new Date().getFullYear())
    .optional(),
});

type MentorFormValues = z.infer<typeof mentorSchema>;

// ─── Mentor card ──────────────────────────────────────────────────────────────

function MentorCard({ mentor }: { mentor: Mentor }) {
  return (
    <div className="flex items-start gap-4 rounded-xl border bg-card p-4 hover:border-primary/40 transition-colors">
      <Avatar className="h-12 w-12">
        <AvatarImage src={mentor.profileImageUrl} />
        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
          {mentor.firstName[0]}
          {mentor.lastName[0]}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">
            {mentor.firstName} {mentor.lastName}
          </p>
          {mentor.isCertified && (
            <BadgeCheck className="h-4 w-4 text-secondary shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {mentor.title ?? mentor.profession ?? "—"}
        </p>
        <p className="text-xs text-muted-foreground/70 truncate">
          {mentor.email}
        </p>
      </div>
      <Badge variant="outline" className="text-xs shrink-0">
        Mentor
      </Badge>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MentorsPage() {
  const { get, post } = useApi();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loadingMentors, setLoadingMentors] = useState(true);
  const [createdMentor, setCreatedMentor] = useState<Mentor | null>(null);

  const form = useForm<MentorFormValues>({
    resolver: zodResolver(mentorSchema),
    defaultValues: {
      mentorId: "",
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      title: "",
      profession: "",
      company: "",
      bio: "",
      profileImageUrl: "",
      isCertified: false, // ← default lives here
      experienceYears: undefined,
      startYear: undefined,
    },
  });

  const fetchMentors = () => {
    setLoadingMentors(true);
    get<Mentor[] | { content: Mentor[] }>("/api/v1/mentors")
      .then((data) => setMentors(Array.isArray(data) ? data : data.content))
      .catch(() => toast.error("Failed to load mentors"))
      .finally(() => setLoadingMentors(false));
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  const onSubmit = async (values: MentorFormValues) => {
    try {
      const created = await post<Mentor>("/api/v1/mentors", {
        ...values,
        phoneNumber: values.phoneNumber || undefined,
        title: values.title || undefined,
        profession: values.profession || undefined,
        company: values.company || undefined,
        bio: values.bio || undefined,
        profileImageUrl: values.profileImageUrl || undefined,
        experienceYears: values.experienceYears ?? undefined,
        startYear: values.startYear ?? undefined,
      });
      setCreatedMentor(created);
      toast.success("Mentor created", {
        description: `${created.firstName} ${created.lastName} has been added.`,
      });
      form.reset();
      fetchMentors();
    } catch (err: unknown) {
      toast.error("Failed to create mentor", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mentors</h1>
          <p className="text-sm text-muted-foreground">
            Manage and create mentor profiles
          </p>
        </div>
      </div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList>
          <TabsTrigger value="create">
            <Plus className="h-4 w-4 mr-2" />
            Create Mentor
          </TabsTrigger>
          <TabsTrigger value="list">
            <Users className="h-4 w-4 mr-2" />
            All Mentors ({mentors.length})
          </TabsTrigger>
        </TabsList>

        {/* ── Create tab ── */}
        <TabsContent value="create">
          {createdMentor ? (
            <Card className="max-w-md rounded-2xl border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">Mentor created!</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {createdMentor.firstName} {createdMentor.lastName} has
                      been added to the platform.
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCreatedMentor(null)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Create Another
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mx-auto max-w-3xl rounded-2xl">
              <CardHeader>
                <CardTitle>Create Mentor</CardTitle>
                <CardDescription>
                  Complete the form to add a new mentor.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    {/* Mentor ID */}
                    <FormField
                      control={form.control}
                      name="mentorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mentor ID</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. mentor-001" {...field} />
                          </FormControl>
                          <FormDescription className="text-xs">
                            A unique identifier for this mentor.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Row: First + Last name */}
                    <div className="grid grid-cols-2 gap-4">
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

                    {/* Email */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="jane@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Row: Phone + Title */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+1 555 000 0000" {...field} />
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

                    {/* Row: Profession + Company */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="profession"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Profession</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Software Engineering"
                                {...field}
                              />
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
                              <Input placeholder="Acme Corp" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Row: Experience Years + Start Year */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="experienceYears"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Experience (years)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                max={60}
                                placeholder="5"
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? undefined
                                      : Number(e.target.value),
                                  )
                                }
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
                                min={1990}
                                max={new Date().getFullYear()}
                                placeholder={String(new Date().getFullYear())}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? undefined
                                      : Number(e.target.value),
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Profile Image URL */}
                    <FormField
                      control={form.control}
                      name="profileImageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profile Image URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/avatar.jpg"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Bio */}
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={5}
                              placeholder="Write a short mentor bio..."
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            {(field.value ?? "").length}/2000
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Certified */}
                    <FormField
                      control={form.control}
                      name="isCertified"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center gap-3 rounded-lg border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div>
                            <FormLabel className="!mt-0">
                              Certified Mentor
                            </FormLabel>
                            <FormDescription className="text-xs mt-0.5">
                              Mark this mentor as officially certified on the
                              platform.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => form.reset()}
                      >
                        Reset
                      </Button>
                      <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                      >
                        {form.formState.isSubmitting && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Create Mentor
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── List tab ── */}
        <TabsContent value="list">
          {loadingMentors ? (
            <div className="flex items-center gap-2 text-muted-foreground py-8">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading mentors…</span>
            </div>
          ) : mentors.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No mentors found. Create one above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {mentors.map((m) => (
                <MentorCard key={m.id} mentor={m} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

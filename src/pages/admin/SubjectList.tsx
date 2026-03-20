import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Search,
  Plus,
  RefreshCw,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Pencil,
} from "lucide-react";

import { useApi } from "@/lib/api";
import type { AdminSubject } from "@/lib/api";
import {
  subjectSchema,
  type SubjectFormValues,
} from "@/lib/validation/subject.schema";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

interface MentorOption {
  id: number;
  mentorId: string;
  firstName: string;
  lastName: string;
  email: string;
}

type MentorResponse = { content?: MentorOption[] } | MentorOption[];

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

// ─── Component ────────────────────────────────────────────────────────────────

export default function SubjectsListPage() {
  const { publicGet, put } = useApi();
  const navigate = useNavigate();

  // ── Subjects state ─────────────────────────────────────────────────────────
  const [subjects, setSubjects] = useState<AdminSubject[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // ── Edit dialog state ──────────────────────────────────────────────────────
  const [editingSubject, setEditingSubject] = useState<AdminSubject | null>(
    null,
  );
  const [mentors, setMentors] = useState<MentorOption[]>([]);
  const [loadingMentors, setLoadingMentors] = useState(false);
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

  // ── Fetch subjects ─────────────────────────────────────────────────────────

  const fetchSubjects = useCallback(
    async (currentPage = page, size = pageSize) => {
      try {
        setLoading(true);
        const data = await publicGet<PageResponse<AdminSubject>>(
          `/api/v1/subjects?page=${currentPage}&size=${size}`,
        );
        setSubjects(data.content ?? []);
        setTotalElements(data.totalElements ?? 0);
        setTotalPages(data.totalPages ?? 0);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to load subjects",
        );
      } finally {
        setLoading(false);
      }
    },
    [page, pageSize],
  );

  useEffect(() => {
    fetchSubjects(page, pageSize);
  }, [page, pageSize]);

  // ── Fetch mentors (only when dialog opens) ─────────────────────────────────

  const fetchMentors = useCallback(async () => {
    if (mentors.length > 0) return; // already loaded
    try {
      setLoadingMentors(true);
      const data = (await publicGet(
        "/api/v1/mentors?page=0&size=100",
      )) as MentorResponse;
      const list = Array.isArray(data) ? data : (data.content ?? []);
      setMentors(list.filter((m) => m?.id));
    } catch {
      toast.error("Failed to load mentors");
    } finally {
      setLoadingMentors(false);
    }
  }, [mentors.length]);

  // ── Open edit dialog ───────────────────────────────────────────────────────

  const openEdit = (subject: AdminSubject) => {
    setEditingSubject(subject);
    form.reset({
      name: subject.subjectName ?? "",
      description: subject.description ?? "",
      courseImageUrl: subject.courseImageUrl ?? "",
      mentorId: subject.mentorId != null ? String(subject.mentorId) : "",
    });
    fetchMentors();
  };

  const closeEdit = () => {
    setEditingSubject(null);
    form.reset();
  };

  // ── Submit edit ────────────────────────────────────────────────────────────

  const onSubmit = async (values: SubjectFormValues) => {
    if (!editingSubject) return;
    try {
      setSubmitting(true);
      await put(`/api/v1/subjects/${editingSubject.id}`, {
        subjectName: values.name,
        description: values.description,
        courseImageUrl: values.courseImageUrl || null,
        mentorId: parseInt(values.mentorId, 10),
      });
      toast.success("Subject updated", {
        description: `${values.name} was updated successfully.`,
      });
      closeEdit();
      fetchSubjects(page, pageSize);
    } catch (err: any) {
      toast.error("Failed to update subject", {
        description:
          err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

  const getMentorLabel = ({
    firstName,
    lastName,
    email,
    mentorId,
  }: MentorOption) =>
    [firstName, lastName].filter(Boolean).join(" ") || email || mentorId;

  const filtered = subjects.filter((s) => {
    const q = search.toLowerCase();
    return (
      (s.subjectName ?? "").toLowerCase().includes(q) ||
      (s.description ?? "").toLowerCase().includes(q) ||
      (s.mentorName ?? "").toLowerCase().includes(q)
    );
  });

  const startItem = totalElements === 0 ? 0 : page * pageSize + 1;
  const endItem = Math.min((page + 1) * pageSize, totalElements);

  const pagePills = Array.from({ length: totalPages }, (_, i) => i)
    .filter((i) => i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1)
    .reduce<(number | "ellipsis")[]>((acc, i, idx, arr) => {
      if (idx > 0 && i - (arr[idx - 1] as number) > 1) acc.push("ellipsis");
      acc.push(i);
      return acc;
    }, []);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Subjects</CardTitle>
              <CardDescription>
                All available subjects on the platform.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchSubjects(page, pageSize)}
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/admin/subjects/create")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Subject
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, mentor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Count */}
          <p className="text-xs text-muted-foreground">
            {loading
              ? "Loading..."
              : `${totalElements} subject${totalElements !== 1 ? "s" : ""} total`}
          </p>

          {/* Table */}
          <div className="rounded-xl border bg-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Subject Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Mentor</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-16 text-center text-muted-foreground text-sm"
                    >
                      Loading subjects...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <BookOpen className="h-8 w-8 opacity-30" />
                        <span className="text-sm">No subjects found.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell>
                        <Avatar className="h-10 w-10 rounded-lg">
                          <AvatarImage
                            src={subject.courseImageUrl ?? undefined}
                            alt={subject.subjectName}
                            className="object-cover"
                          />
                          <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                            {(subject.subjectName ?? "S")
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {subject.subjectName ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs">
                        <span className="line-clamp-2">
                          {subject.description ?? "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage
                              src={subject.mentorProfileImageUrl ?? undefined}
                            />
                            <AvatarFallback className="bg-secondary/20 text-secondary-foreground text-xs">
                              {(subject.mentorName ?? "M")
                                .slice(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {subject.mentorName ?? "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => openEdit(subject)}
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Rows per page</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v));
                  setPage(0);
                }}
              >
                <SelectTrigger className="h-8 w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((s) => (
                    <SelectItem key={s} value={String(s)}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {totalElements === 0
                  ? "No results"
                  : `${startItem}–${endItem} of ${totalElements}`}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {pagePills.map((item, idx) =>
                  item === "ellipsis" ? (
                    <span
                      key={`e-${idx}`}
                      className="px-1 text-muted-foreground text-sm"
                    >
                      …
                    </span>
                  ) : (
                    <Button
                      key={item}
                      variant={page === item ? "default" : "outline"}
                      size="icon"
                      className="h-8 w-8 text-xs"
                      onClick={() => setPage(item as number)}
                      disabled={loading}
                    >
                      {(item as number) + 1}
                    </Button>
                  ),
                )}

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={page >= totalPages - 1 || loading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Edit Dialog ── */}
      <Dialog
        open={editingSubject !== null}
        onOpenChange={(open) => {
          if (!open) closeEdit();
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
            <DialogDescription>
              Update the details for{" "}
              <strong>{editingSubject?.subjectName}</strong>.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        rows={4}
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
                      value={field.value}
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

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={closeEdit}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting || loadingMentors}>
                  {submitting ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

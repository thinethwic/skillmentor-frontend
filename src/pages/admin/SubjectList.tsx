import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Search, Plus, RefreshCw, BookOpen } from "lucide-react";

import { useApi } from "@/lib/api";
import type { AdminSubject } from "@/lib/api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type SubjectsResponse =
  | AdminSubject[]
  | { content: AdminSubject[]; totalElements?: number };

export default function SubjectsListPage() {
  const { publicGet } = useApi();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState<AdminSubject[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await publicGet<SubjectsResponse>(
        "/api/v1/subjects?page=0&size=100",
      );
      setSubjects(Array.isArray(data) ? data : (data.content ?? []));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load subjects",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const filtered = subjects.filter((s) => {
    const q = search.toLowerCase();
    return (
      (s.subjectName ?? "").toLowerCase().includes(q) ||
      (s.description ?? "").toLowerCase().includes(q) ||
      (s.mentorName ?? "").toLowerCase().includes(q)
    );
  });

  return (
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
              onClick={fetchSubjects}
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
            : `${filtered.length} subject${filtered.length !== 1 ? "s" : ""} found`}
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
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-16 text-center text-muted-foreground text-sm"
                  >
                    Loading subjects...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <BookOpen className="h-8 w-8 opacity-30" />
                      <span className="text-sm">No subjects found.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((subject) => (
                  <TableRow key={subject.id}>
                    {/* Course Image */}
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

                    {/* Subject Name */}
                    <TableCell className="font-medium text-sm">
                      {subject.subjectName ?? "—"}
                    </TableCell>

                    {/* Description */}
                    <TableCell className="text-sm text-muted-foreground max-w-xs">
                      <span className="line-clamp-2">
                        {subject.description ?? "—"}
                      </span>
                    </TableCell>

                    {/* Mentor */}
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
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

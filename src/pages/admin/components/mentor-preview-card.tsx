import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { MentorFormValues } from "@/lib/validation/mentor.schema";

export function MentorPreviewCard({ values }: { values: MentorFormValues }) {
  const initials = `${values.firstName?.[0] || ""}${values.lastName?.[0] || ""}`;

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Mentor Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={values.profileImageUrl || ""} />
            <AvatarFallback>{initials || "M"}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">
              {values.firstName || "First"} {values.lastName || "Last"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {values.title || "No title added"}
            </p>
            {values.isCertified && <Badge className="mt-2">Certified</Badge>}
          </div>
        </div>

        <div className="space-y-1 text-sm">
          <p>
            <span className="font-medium">Email:</span> {values.email || "-"}
          </p>
          <p>
            <span className="font-medium">Profession:</span>{" "}
            {values.profession || "-"}
          </p>
          <p>
            <span className="font-medium">Company:</span>{" "}
            {values.company || "-"}
          </p>
          <p>
            <span className="font-medium">Experience:</span>{" "}
            {values.experienceYears ?? "-"} years
          </p>
          <p>
            <span className="font-medium">Start Year:</span>{" "}
            {values.startYear ?? "-"}
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          {values.bio || "Mentor bio preview will appear here."}
        </p>
      </CardContent>
    </Card>
  );
}

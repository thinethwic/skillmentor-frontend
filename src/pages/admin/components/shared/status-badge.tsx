import { Badge } from "@/components/ui/badge";

export function StatusBadge({ value }: { value: string }) {
  const variant =
    value === "completed"
      ? "default"
      : value === "confirmed"
        ? "secondary"
        : "outline";

  return <Badge variant={variant}>{value}</Badge>;
}

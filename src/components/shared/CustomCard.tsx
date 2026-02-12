import type { CardElement } from "@/types";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

import { ThumbsUp, GraduationCap, Briefcase, CalendarDays } from "lucide-react";

export default function CustomCard({
  cardProperties,
}: {
  cardProperties: CardElement;
}) {
  return (
    <Card className="w-full max-w-md bg-white text-black shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-2xl font-bold leading-snug">
            {cardProperties.title}
          </CardTitle>
          <div className="text-4xl">Image</div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <ThumbsUp className="h-4 w-4 text-black" />
            <span className="font-medium text-black">
              {cardProperties.positiveRate}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Briefcase className="h-4 w-4" />
            <span className="text-sm font-medium">
              {cardProperties.instructor}
            </span>
          </div>

          <div className="flex items-center gap-3 text-base text-gray-500">
            <Briefcase className="h-4 w-4" />
            <span>{cardProperties.roleLine}</span>
          </div>

          <div className="flex items-center gap-3 text-base text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>{cardProperties.tutorSince}</span>
          </div>
        </div>

        <CardDescription className="text-sm leading-relaxed text-black/80">
          {cardProperties.description}
        </CardDescription>

        <div>
          <p className="text-base font-semibold">Highlights</p>
          <div className="mt-3 rounded-lg bg-sky-50 px-4 py-3">
            <div className="flex items-center gap-3 text-sm">
              <GraduationCap className="h-4 w-4 text-black" />
              <span className="font-medium">
                {cardProperties.enrollments} Enrollments
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <GraduationCap className="h-4 w-4 text-black" />
              <span className="font-medium">
                {cardProperties.enrollments} Enrollments
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <Button className="w-full bg-black text-white hover:bg-black/90">
          Schedule a session
        </Button>
      </CardFooter>
    </Card>
  );
}

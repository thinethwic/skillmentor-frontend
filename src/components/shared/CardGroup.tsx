import CustomCard from "./CustomCard";
import type { CardElement } from "@/types";

export default function CardGroup({
  cardElements,
}: {
  cardElements: CardElement[];
}) {
  return (
    <div>
      <h1 className="text-5xl"> Shedule a Cell </h1>
      <div className="p-4 mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {cardElements.map((cardProperties, index) => {
          return <CustomCard key={index} cardProperties={cardProperties} />;
        })}

        {/* {cardElements.map((cardProperties, index) => {
          return <CustomCard key={index} cardProperties={cardProperties} />;
        })} */}
      </div>
    </div>
  );
}

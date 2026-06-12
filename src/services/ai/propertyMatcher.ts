import type { Property } from "@/lib/types";

export type MatchInput = {
  city?: string;
  district?: string;
  maxPrice?: number;
  bedrooms?: number;
};

export function matchProperties(properties: Property[], input: MatchInput) {
  return properties.filter((property) => {
    if (input.city && property.city.toLowerCase() !== input.city.toLowerCase()) return false;
    if (input.district && property.district.toLowerCase() !== input.district.toLowerCase()) return false;
    if (input.maxPrice && property.price > input.maxPrice) return false;
    if (input.bedrooms && property.bedrooms < input.bedrooms) return false;
    return property.status === "active";
  });
}

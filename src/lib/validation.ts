import { z } from "zod";

export const organizationSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  organizationType: z.enum(["solo_broker", "agency", "developer", "enterprise"]),
  phone: z.string().optional(),
  email: z.string().email().optional()
});

export const leadSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email().optional(),
  interest: z.string().min(3),
  brokerId: z.string().uuid().optional()
});

export const propertySchema = z.object({
  title: z.string().min(3),
  propertyType: z.enum(["house", "apartment", "land", "commercial"]),
  purpose: z.enum(["sale", "rent"]),
  price: z.coerce.number().nonnegative(),
  city: z.string().min(2),
  district: z.string().min(2),
  bedrooms: z.coerce.number().int().nonnegative(),
  bathrooms: z.coerce.number().int().nonnegative(),
  parkingSpaces: z.coerce.number().int().nonnegative(),
  area: z.coerce.number().nonnegative().optional()
});

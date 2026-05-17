import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const createLocationDto = z.object({
  locationName: z.string().min(1, "Location name is required"),
}).openapi("CreateLocation");

export const updateLocationDto = createLocationDto.partial().openapi("UpdateLocation");
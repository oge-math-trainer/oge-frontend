import { apiGet } from "./client";

export type Recommendation = {
  oge_number: number;
  subtype_code: string;
  title?: string;
  description?: string;
};

export function getRecommendations() {
  return apiGet<Recommendation[]>("/api/v1/progress/recommendations");
}
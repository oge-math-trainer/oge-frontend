import { apiGet } from "./client";

export type Recommendation = {
  oge_number: number;
  subtype_code: string;
  /** Уровень владения темой, от 0 до 1 (или 0 до 100 — зависит от бэка) */
  mastery_score: number;
  /** Текст рекомендации от ИИ */
  message?: string;
};

type RecommendationsResponse = {
  items: Recommendation[];
};

export async function getRecommendations(): Promise<Recommendation[]> {
  const response = await apiGet<RecommendationsResponse>(
    "/api/v1/progress/recommendations"
  );
  return response.items ?? [];
}
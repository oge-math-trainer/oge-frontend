import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { me } from "../api/auth";
import { getRecommendations, type Recommendation } from "../api/progress";
import "./ProfilePage.css";

type ProfileUser = {
  id: number;
  email: string;
};

// Человекочитаемые названия для предметных областей
const TOPIC_LABELS: Record<string, string> = {
  numbers_fractions: "Обыкновенные дроби",
  numbers_decimal: "Десятичные дроби",
  numbers_integers: "Целые числа",
  numberline_compare: "Числовая прямая",
  inequalities_simple: "Простейшие неравенства",
  algebra_powers: "Степени",
  algebra_roots: "Корни",
  algebra_formulas: "Формулы сокращённого умножения",
  algebra_fractions: "Алгебраические дроби",
  equations_linear: "Линейные уравнения",
  equations_quadratic: "Квадратные уравнения",
  equations_rational: "Дробно-рациональные уравнения",
  equations_system_linear: "Системы линейных уравнений",
  equations_system_mixed: "Смешанные системы",
  probability_classic: "Классическая вероятность",
  probability_tree: "Дерево вероятностей",
  graphs_linear: "Линейная функция",
  graphs_quadratic: "Квадратичная функция",
  graphs_inverse: "Обратная пропорциональность",
  graphs_transform: "Преобразования графиков",
  graphs_match: "Соответствие графика и формулы",
  formulas_subst: "Подстановка в формулу",
  formulas_units: "Перевод единиц",
  formulas_practical: "Практическая задача",
  ineq_linear: "Линейные неравенства",
  ineq_quadratic: "Квадратные неравенства",
  ineq_system: "Системы неравенств",
  ineq_rational: "Дробно-рациональные неравенства",
  progression_arithm: "Арифметическая прогрессия",
  progression_geom: "Геометрическая прогрессия",
  triangles_angles: "Углы треугольника",
  triangles_pythagor: "Теорема Пифагора",
  triangles_area: "Площадь треугольника",
  triangles_lines: "Замечательные линии",
  circle_elements: "Элементы окружности",
  circle_angles: "Вписанные и центральные углы",
  circle_tangents: "Касательные",
  circle_inscribed: "Вписанные и описанные окружности",
  circle_sector: "Площадь сектора и сегмента",
  quad_properties: "Свойства четырёхугольников",
  quad_trapezoid: "Трапеция",
  quad_area: "Площади четырёхугольников",
  quad_diagonals: "Диагонали четырёхугольников",
  grid_distance: "Расстояние на решётке",
  grid_pythagor: "Пифагор на решётке",
  grid_area: "Площадь на клетчатой бумаге",
  grid_midline: "Средняя линия на решётке",
  logic_angles: "Утверждения об углах и прямых",
  logic_triangles: "Утверждения о треугольниках",
  logic_quad: "Утверждения о четырёхугольниках",
  logic_circle: "Утверждения об окружности",
};

export function ProfilePage() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [weakTopics, setWeakTopics] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setIsLoading(true);
      setError("");

      try {
        const [meData, recs] = await Promise.all([
          me(),
          getRecommendations().catch(() => [] as Recommendation[]),
        ]);

        if (cancelled) return;

        setUser(meData);
        setWeakTopics(recs);
      } catch (err) {
        if (cancelled) return;
        console.error("Profile load error:", err);
        setError("Не удалось загрузить профиль. Попробуй обновить страницу.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <main className="profile-page">
        <section className="profile-card">
          <p className="profile-label">Личный кабинет</p>
          <h1>Загружаем профиль...</h1>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="profile-page">
        <section className="profile-card">
          <p className="profile-label">Личный кабинет</p>
          <h1>Что-то пошло не так</h1>
          <p className="profile-subtitle">{error}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <section className="profile-card">
        <p className="profile-label">Личный кабинет</p>

        <h1>Твой прогресс</h1>

        {user?.email && (
          <p className="profile-subtitle">{user.email}</p>
        )}

        <p className="profile-subtitle">
          Здесь видно, какие темы стоит потренировать.
        </p>

        {/* Слабые темы */}
        <div className="weak-topics">
          <h2>Слабые темы</h2>

          {weakTopics.length === 0 ? (
            <p className="profile-empty">
              Пока слабые темы не найдены. Сначала пройди диагностику или порешай задачи.
            </p>
          ) : (
            weakTopics.map((topic) => {
              const label =
                TOPIC_LABELS[topic.subtype_code] ?? topic.subtype_code;

              return (
                <div
                  className="topic-item"
                  key={`${topic.oge_number}-${topic.subtype_code}`}
                >
                  <div className="topic-header">
                    <span>
                      №{topic.oge_number} {label}
                    </span>
                  </div>

                  {topic.message && (
                    <p className="topic-description">{topic.message}</p>
                  )}
                </div>
              );
            })
          )}
        </div>

        <Link className="profile-training-link" to="/tasks">
          Продолжить тренировку
        </Link>
      </section>
    </main>
  );
}
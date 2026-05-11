import type { GraphData } from "../api/tasks";
import "./FunctionGraphs.css";

type FunctionGraphsProps = {
  graphs: GraphData[];
};

function getY(graph: GraphData, x: number) {
  const [a, b, c] = graph.coefficients;

  if (graph.type === "linear") {
    return a * x + b;
  }

  if (graph.type === "quadratic") {
    return a * x * x + b * x + c;
  }

  if (graph.type === "hyperbola") {
    if (x === 0) return null;
    return a / x;
  }

  return null;
}

function createPath(graph: GraphData, width: number, height: number) {
  const points: string[] = [];
  const steps = 240;

  for (let i = 0; i <= steps; i++) {
    const x =
      graph.x_min + ((graph.x_max - graph.x_min) * i) / steps;

    const y = getY(graph, x);

    if (y === null || !Number.isFinite(y)) {
      continue;
    }

    if (y < graph.y_min || y > graph.y_max) {
      continue;
    }

    const svgX =
      ((x - graph.x_min) / (graph.x_max - graph.x_min)) * width;

    const svgY =
      height -
      ((y - graph.y_min) / (graph.y_max - graph.y_min)) * height;

    points.push(`${svgX},${svgY}`);
  }

  return points.length > 1 ? `M ${points.join(" L ")}` : "";
}

export function FunctionGraphs({ graphs }: FunctionGraphsProps) {
  const width = 360;
  const height = 260;

  return (
    <div className="graphs-wrapper">
      {graphs.map((graph) => {
        const path = createPath(graph, width, height);

        return (
          <div className="graph-card" key={graph.id}>
            <p className="graph-title">График {graph.id}</p>

            <svg
              className="function-graph"
              viewBox={`0 0 ${width} ${height}`}
              role="img"
              aria-label={`График ${graph.id}`}
            >
              <line
                x1="0"
                y1={height / 2}
                x2={width}
                y2={height / 2}
                className="graph-axis"
              />
              <line
                x1={width / 2}
                y1="0"
                x2={width / 2}
                y2={height}
                className="graph-axis"
              />

              {path && <path d={path} className="graph-line" />}
            </svg>
          </div>
        );
      })}
    </div>
  );
}
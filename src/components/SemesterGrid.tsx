import { useDroppable } from "@dnd-kit/core";
import type { Semester } from "../domain/semester";
import type { Module } from "../domain/module";
import { ModuleCard } from "./ModuleCard";

type Props = {
  semesters: Semester[];
  modules: Record<string, Module>;
  categories: string[];
};

export function SemesterGrid({ semesters, modules, categories }: Props) {
  let cumulativeECTS = 0;

  return (
    <div className="semester-grid" style={{ width: "100%" }}>
      <div
        className="semester-row"
        style={{
          gridTemplateColumns: `180px repeat(${categories.length}, 1fr) 100px`,
          fontWeight: 600,
          background: "#f3f3f3",
          borderBottom: "2px solid #ccc"
        }}
      >
        <div className="semester-label">Semester</div>
        {categories.map((cat) => (
          <div key={cat} className="category-header">{cat}</div>
        ))}
        <div>Summe ECTS</div>
      </div>

      {semesters.map((semester) => {
        const semesterECTS = categories.reduce((sum, cat) => {
          const ids = semester.modulesByCategory[cat] ?? [];
          return sum + ids.reduce((modAcc, id) => modAcc + (modules[id]?.ects || 0), 0);
        }, 0);

        cumulativeECTS += semesterECTS;

        return (
          <div
            key={semester.id}
            className="semester-row"
            style={{ gridTemplateColumns: `180px repeat(${categories.length}, 1fr) 100px` }}
          >
            <div className="semester-label">{semester.label}</div>

            {categories.map((cat) => {
              const moduleIds = semester.modulesByCategory[cat] ?? [];
              return (
                <SemesterCell
                  key={cat}
                  semesterId={semester.id}
                  category={cat}
                  modules={moduleIds.map((id) => modules[id])}
                />
              );
            })}

            <div className="semester-cell" style={{ fontWeight: 600, background: "#f9f9f9" }}>
              {semesterECTS} ({cumulativeECTS})
            </div>
          </div>
        );
      })}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `180px repeat(${categories.length}, 1fr) 100px`,
          fontWeight: 700,
          background: "#eaeaea",
          padding: "8px",
          borderTop: "2px solid #ccc"
        }}
      >
        <div style={{ gridColumn: `1 / span ${categories.length + 2}` }}>
          Gesamt: {cumulativeECTS} ECTS
        </div>
      </div>
    </div>
  );
}

type CellProps = {
  semesterId: string;
  category: string;
  modules: Module[];
};

function SemesterCell({ semesterId, category, modules }: CellProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${semesterId}-${category}`,
    data: { semesterId, category }
  });

  return (
    <div
      ref={setNodeRef}
      className={`semester-cell ${isOver ? "is-over" : ""}`}
    >
      {modules.map((module) => (
        <ModuleCard key={module.id} module={module} semesterId={semesterId} category={category} />
      ))}
    </div>
  );
}

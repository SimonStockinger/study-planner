import { useDroppable } from "@dnd-kit/core";
import type { Semester } from "../domain/semester";
import type { Module } from "../domain/module";
import { ModuleCard } from "./ModuleCard";

type Props = {
  semester: Semester;
  modules: Record<string, Module>;
  categories: string[];
};

export function SemesterRow({ semester, modules, categories }: Props) {
  const semesterECTS = categories.reduce((sum, category) => {
    const moduleIds = semester.modulesByCategory[category] ?? [];
    return (
      sum +
      moduleIds.reduce((modAcc, id) => modAcc + (modules[id]?.ects || 0), 0)
    );
  }, 0);

  return (
    <div
      className="semester-row"
      style={{ gridTemplateColumns: `180px repeat(${categories.length}, 1fr) 100px` }}
    >
      <div className="semester-label">{semester.label}</div>

      {categories.map((category) => {
        const categoryModuleIds = semester.modulesByCategory[category] ?? [];
        const categoryModules = categoryModuleIds.map((id) => modules[id]);
        return (
          <SemesterCell
            key={category}
            semesterId={semester.id}
            category={category}
            modules={categoryModules}
          />
        );
      })}

      <div
        className="semester-cell"
        style={{ fontWeight: 600, background: "#f9f9f9", justifyContent: "center" }}
      >
        {semesterECTS} ECTS
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

import { useReducer, useState } from "react";
import { DndContext } from "@dnd-kit/core";
import { studyPlanReducer } from "../state/reducer";
import { initialState } from "../state/initialState";
import { SemesterGrid } from "./SemesterGrid";
import { exportStudyPlan } from "../persistence/exportStudyPlan";
import { importStudyPlan } from "../persistence/importStudyPlan";
import type { DragEndEvent } from "@dnd-kit/core";
import type { ModuleType } from "../domain/module";

export function StudyPlanner() {
  const [state, dispatch] = useReducer(studyPlanReducer, initialState);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [moduleName, setModuleName] = useState("");
  const [moduleECTS, setModuleECTS] = useState<number>(0);
  const [moduleType, setModuleType] = useState<ModuleType>("pflicht");
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!active.data.current || !over?.data.current) return;
    const { moduleId, from } = active.data.current as any;
    const to = over.data.current as any;

    dispatch({
      type: "MOVE_MODULE",
      moduleId,
      from,
      to
    });
  };

  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    dispatch({ type: "ADD_CATEGORY", category: newCategoryName.trim() });
    setNewCategoryName("");
  };

  const handleAddModule = () => {
    if (!moduleName || !selectedSemesterId || !selectedCategory) return;

    const id = `${moduleName}-${selectedSemesterId}-${selectedCategory}-${Date.now()}`;

    dispatch({
      type: "ADD_MODULE",
      module: {
        id,
        name: moduleName,
        ects: moduleECTS,
        type: moduleType,
        prerequisites: [],
        category: selectedCategory
      },
      semesterId: selectedSemesterId,
      category: selectedCategory
    });

    setModuleName("");
    setModuleECTS(0);
    setModuleType("pflicht");
    setSelectedSemesterId("");
    setSelectedCategory("");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const plan = await importStudyPlan(file);
      dispatch({ type: "LOAD_STUDY_PLAN", state: plan });
    } catch (err) {
      alert(err);
    }

    e.target.value = "";
  };

  return (
    <div>
      <h1>Study Planner</h1>
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
        <input type="file" accept="application/json" onChange={handleFileChange} />
          <button onClick={() => exportStudyPlan(state)}>Plan als JSON speichern</button>

        <button onClick={() => dispatch({ type: "ADD_SEMESTER" })}>
        Semester hinzufügen
        </button>
          <input
            type="text"
            placeholder="Neue Kategorie"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
        <button onClick={addCategory}>Kategorie hinzufügen</button>
      </div>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="Modul Name"
          value={moduleName}
          onChange={(e) => setModuleName(e.target.value)}
        />
        <input
          type="number"
          placeholder="ECTS"
          value={moduleECTS}
          onChange={(e) => setModuleECTS(Number(e.target.value))}
        />
        <select value={moduleType} onChange={(e) => setModuleType(e.target.value as ModuleType)}>
          <option value="pflicht">Pflicht</option>
          <option value="wahl">Wahl</option>
          <option value="projekt">Projekt</option>
          <option value="thesis">Thesis</option>
        </select>
        <select value={selectedSemesterId} onChange={(e) => setSelectedSemesterId(e.target.value)}>
          <option value="">Semester wählen</option>
          {state.semesters.map((sem) => (
            <option key={sem.id} value={sem.id}>
              {sem.label}
            </option>
          ))}
        </select>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">Kategorie wählen</option>
          {state.categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <button onClick={handleAddModule}>Modul hinzufügen</button>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <SemesterGrid
          semesters={state.semesters}
          modules={state.modules}
          categories={state.categories}
        />
      </DndContext>
    </div>
  );
}

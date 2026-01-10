import type { StudyPlanState } from "../domain/studyPlan";
import type { Action } from "./actions";

export function studyPlanReducer(
  state: StudyPlanState,
  action: Action
): StudyPlanState {
  switch (action.type) {
    case "ADD_SEMESTER": {
      const order = state.semesters.length + 1;
      return {
        ...state,
        semesters: [
          ...state.semesters,
          {
            id: crypto.randomUUID(),
            label: `Semester ${order}`,
            order,
            modulesByCategory: {}
          }
        ]
      };
    }

    case "ADD_CATEGORY": {
      const { category } = action;
      return {
        ...state,
        categories: [...state.categories, category]
      };
    }

    case "ADD_MODULE": {
  const { module, semesterId, category } = action;

  return {
    ...state,
    modules: {
      ...state.modules,
      [module.id]: module
    },
    semesters: state.semesters.map((s) =>
      s.id === semesterId
        ? {
            ...s,
            modulesByCategory: {
              ...s.modulesByCategory,
              [category]: [...(s.modulesByCategory[category] ?? []), module.id]
            }
          }
        : s
    )
  };
}


    case "MOVE_MODULE": {
  const { moduleId, to } = action;

  if (!to.semesterId || !to.category) return state;

  return {
    ...state,
    semesters: state.semesters.map((s) => {
      const cleanedModulesByCategory = Object.fromEntries(
        Object.entries(s.modulesByCategory).map(([cat, ids]) => [
          cat,
          ids.filter((id) => id !== moduleId)
        ])
      );

      if (s.id === to.semesterId) {
        cleanedModulesByCategory[to.category] = [
          ...(cleanedModulesByCategory[to.category] ?? []),
          moduleId
        ];
      }

      return {
        ...s,
        modulesByCategory: cleanedModulesByCategory
      };
    })
  };
}

    case "LOAD_STUDY_PLAN":
      return action.state;

    default:
      return state;
  }
}

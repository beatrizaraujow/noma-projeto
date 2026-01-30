"use client";

import { useState, useEffect } from "react";
import { LayoutGrid, List, Calendar, Clock } from "lucide-react";
import { Task } from "../types";

interface ViewSwitcherProps {
  tasks: Task[];
  projectId: string;
  ListViewComponent: React.ComponentType<{ tasks: Task[] }>;
  CalendarViewComponent: React.ComponentType<{ tasks: Task[] }>;
  TimelineViewComponent: React.ComponentType<{ tasks: Task[] }>;
  KanbanViewComponent: React.ComponentType<any>;
  kanbanProps?: any;
}

type ViewType = "kanban" | "list" | "calendar" | "timeline";

export default function ViewSwitcher({
  tasks,
  projectId,
  ListViewComponent,
  CalendarViewComponent,
  TimelineViewComponent,
  KanbanViewComponent,
  kanbanProps = {},
}: ViewSwitcherProps) {
  const [currentView, setCurrentView] = useState<ViewType>("kanban");

  // Carregar preferência salva
  useEffect(() => {
    const savedView = localStorage.getItem(`project-${projectId}-view`);
    if (savedView && ["kanban", "list", "calendar", "timeline"].includes(savedView)) {
      setCurrentView(savedView as ViewType);
    }
  }, [projectId]);

  // Salvar preferência
  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    localStorage.setItem(`project-${projectId}-view`, view);
  };

  const views = [
    { id: "kanban", label: "Kanban", icon: LayoutGrid },
    { id: "list", label: "Lista", icon: List },
    { id: "calendar", label: "Calendário", icon: Calendar },
    { id: "timeline", label: "Timeline", icon: Clock },
  ];

  return (
    <div className="space-y-4">
      {/* View Switcher Tabs */}
      <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200 w-fit">
        {views.map((view) => {
          const Icon = view.icon;
          const isActive = currentView === view.id;

          return (
            <button
              key={view.id}
              onClick={() => handleViewChange(view.id as ViewType)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all
                ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{view.label}</span>
            </button>
          );
        })}
      </div>

      {/* View Content */}
      <div className="mt-6">
        {currentView === "kanban" && <KanbanViewComponent {...kanbanProps} />}
        {currentView === "list" && <ListViewComponent tasks={tasks} />}
        {currentView === "calendar" && <CalendarViewComponent tasks={tasks} />}
        {currentView === "timeline" && <TimelineViewComponent tasks={tasks} />}
      </div>
    </div>
  );
}

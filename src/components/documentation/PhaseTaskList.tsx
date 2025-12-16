import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useUpdatePhaseTasks } from "@/hooks/ui/useProjectDocumentation";

interface Task {
  id: string;
  name: string;
  completed: boolean;
  description?: string;
}

interface PhaseTaskListProps {
  phaseId: string;
  tasks: Task[];
  readOnly?: boolean;
}

export const PhaseTaskList = ({ phaseId, tasks, readOnly = false }: PhaseTaskListProps) => {
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const [newTaskName, setNewTaskName] = useState("");
  const updateTasks = useUpdatePhaseTasks();

  const handleToggleTask = (taskId: string) => {
    const updatedTasks = localTasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setLocalTasks(updatedTasks);
    updateTasks.mutate({ phaseId, tasks: updatedTasks });
  };

  const handleAddTask = () => {
    if (!newTaskName.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      name: newTaskName,
      completed: false,
    };

    const updatedTasks = [...localTasks, newTask];
    setLocalTasks(updatedTasks);
    updateTasks.mutate({ phaseId, tasks: updatedTasks });
    setNewTaskName("");
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = localTasks.filter((task) => task.id !== taskId);
    setLocalTasks(updatedTasks);
    updateTasks.mutate({ phaseId, tasks: updatedTasks });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {localTasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 transition-colors group"
          >
            <Checkbox
              id={task.id}
              checked={task.completed}
              onCheckedChange={() => !readOnly && handleToggleTask(task.id)}
              disabled={readOnly}
            />
            <label
              htmlFor={task.id}
              className={`flex-1 text-sm cursor-pointer ${
                task.completed ? "line-through text-muted-foreground" : ""
              }`}
            >
              {task.name}
            </label>
            {!readOnly && (
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                onClick={() => handleDeleteTask(task.id)}
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {!readOnly && (
        <div className="flex gap-2">
          <Input
            placeholder="إضافة مهمة جديدة..."
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddTask()}
            className="text-sm"
          />
          <Button
            onClick={handleAddTask}
            size="sm"
            variant="outline"
            disabled={!newTaskName.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

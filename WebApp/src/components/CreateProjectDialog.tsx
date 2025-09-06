import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  name: string;
  description: string;
  priority: string;
  assignee: string;
  dueDate: string;
  status?: string;
}

interface CreateProjectDialogProps {
  onProjectCreated: (projectData: { name: string; description: string; tasks: Task[] }) => void;
}

export const CreateProjectDialog = ({ onProjectCreated }: CreateProjectDialogProps) => {
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const addTask = () => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      priority: "",
      assignee: "",
      dueDate: ""
    };
    setTasks([...tasks, newTask]);
  };

  const removeTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const updateTask = (taskId: string, field: keyof Task, value: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, [field]: value } : task
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Call the parent callback with project data
      onProjectCreated({
        name: projectName,
        description,
        tasks: tasks.map(task => ({ ...task, status: 'todo' })) as Task[]
      });
      
      setProjectName("");
      setDescription("");
      setTasks([]);
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error creating project",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="cosmic" className="gap-2">
          <Plus className="h-4 w-4" />
          Create Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto glass-card border border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="projectName" className="text-white">Project Name</Label>
            <Input
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description"
              rows={3}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60 resize-none"
            />
          </div>

          <Separator className="bg-white/20" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-white text-lg">Project Tasks</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTask}
                className="gap-2 border-white/20 text-white hover:bg-white/10"
              >
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </div>

            {tasks.length === 0 && (
              <p className="text-white/60 text-sm italic">No tasks added yet. Click "Add Task" to create your first task.</p>
            )}

            {tasks.map((task, index) => (
              <div key={task.id} className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-medium">Task {index + 1}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeTask(task.id)}
                    className="gap-2 border-red-500/20 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Task Name</Label>
                    <Input
                      value={task.name}
                      onChange={(e) => updateTask(task.id, 'name', e.target.value)}
                      placeholder="Enter task name"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white">Priority</Label>
                    <Select value={task.priority} onValueChange={(value) => updateTask(task.id, 'priority', value)}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-white/20">
                        <SelectItem value="low" className="text-white hover:bg-white/10">Low</SelectItem>
                        <SelectItem value="medium" className="text-white hover:bg-white/10">Medium</SelectItem>
                        <SelectItem value="high" className="text-white hover:bg-white/10">High</SelectItem>
                        <SelectItem value="urgent" className="text-white hover:bg-white/10">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Description</Label>
                  <Textarea
                    value={task.description}
                    onChange={(e) => updateTask(task.id, 'description', e.target.value)}
                    placeholder="Enter task description"
                    rows={2}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Assign to</Label>
                    <Select value={task.assignee} onValueChange={(value) => updateTask(task.id, 'assignee', value)}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-white/20">
                        <SelectItem value="john" className="text-white hover:bg-white/10">John Doe</SelectItem>
                        <SelectItem value="jane" className="text-white hover:bg-white/10">Jane Smith</SelectItem>
                        <SelectItem value="mike" className="text-white hover:bg-white/10">Mike Johnson</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Due Date</Label>
                    <div className="relative">
                      <Input
                        type="date"
                        value={task.dueDate}
                        onChange={(e) => updateTask(task.id, 'dueDate', e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      />
                      <Calendar className="absolute right-3 top-3 h-4 w-4 text-white/60 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="cosmic"
              disabled={loading || !projectName.trim()}
            >
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
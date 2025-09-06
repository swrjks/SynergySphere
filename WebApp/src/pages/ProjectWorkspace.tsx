import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Calendar, User, Flag, Trash2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ChatPopup } from "@/components/ChatPopup";
import { TeamMembersPopup } from "@/components/TeamMembersPopup";

interface Task {
  id: string;
  name: string;
  description: string;
  priority: string;
  assignees: string[];
  assignedBy: string;
  dueDate: string;
  status: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  tasks: Task[];
}

const ProjectWorkspace = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    priority: "",
    assignees: [] as string[],
    assignedBy: "",
    dueDate: "",
    status: "todo"
  });

  useEffect(() => {
    // Get projects from localStorage
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const currentProject = projects.find((p: Project) => p.id === projectId);
    if (currentProject) {
      setProject(currentProject);
    } else {
      toast({
        title: "Project not found",
        description: "The project you're looking for doesn't exist.",
        variant: "destructive",
      });
      navigate('/tasks');
    }
  }, [projectId, navigate, toast]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !newTask.name.trim()) return;

    const task: Task = {
      id: crypto.randomUUID(),
      ...newTask,
    };

    const updatedProject = {
      ...project,
      tasks: [...project.tasks, task]
    };

    // Update localStorage
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const updatedProjects = projects.map((p: Project) => 
      p.id === project.id ? updatedProject : p
    );
    localStorage.setItem('projects', JSON.stringify(updatedProjects));

    setProject(updatedProject);
    setNewTask({
      name: "",
      description: "",
      priority: "",
      assignees: [],
      assignedBy: "",
      dueDate: "",
      status: "todo"
    });
    setIsCreateTaskOpen(false);

    toast({
      title: "Task created successfully!",
      description: `Task "${task.name}" has been added to the project.`,
    });
  };

  const handleDeleteTask = (taskId: string) => {
    if (!project) return;

    const updatedProject = {
      ...project,
      tasks: project.tasks.filter(t => t.id !== taskId)
    };

    // Update localStorage
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const updatedProjects = projects.map((p: Project) => 
      p.id === project.id ? updatedProject : p
    );
    localStorage.setItem('projects', JSON.stringify(updatedProjects));

    setProject(updatedProject);
    toast({
      title: "Task deleted",
      description: "Task has been removed from the project.",
    });
  };

  const handleToggleTaskStatus = (taskId: string) => {
    if (!project) return;

    const task = project.tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedProject = {
      ...project,
      tasks: project.tasks.map(t => 
        t.id === taskId 
          ? { ...t, status: t.status === 'completed' ? 'todo' : 'completed' }
          : t
      )
    };

    // Update localStorage
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const updatedProjects = projects.map((p: Project) => 
      p.id === project.id ? updatedProject : p
    );
    localStorage.setItem('projects', JSON.stringify(updatedProjects));

    setProject(updatedProject);
    toast({
      title: task.status === 'completed' ? "Task marked as todo" : "Task completed!",
      description: `Task "${task.name}" status updated.`,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in-progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'todo': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (!project) {
    return (
      <Layout>
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-white mb-4">Loading project...</h1>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/tasks')}
              className="gap-2 border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Projects
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-white">{project.name}</h1>
                <TeamMembersPopup />
              </div>
              <p className="text-white/80">{project.description}</p>
            </div>
            <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
              <DialogTrigger asChild>
                <Button variant="cosmic" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] glass-card border border-white/20">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New Task</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateTask} className="space-y-4">
                   <div className="space-y-2">
                     <Label htmlFor="taskName" className="text-white">Task Name</Label>
                     <Input
                       id="taskName"
                       value={newTask.name}
                       onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                       placeholder="Enter task name"
                       required
                       className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label className="text-white">Project</Label>
                     <Input
                       value={project?.name || ''}
                       disabled
                       className="bg-white/5 border-white/10 text-white/60"
                     />
                   </div>
                  <div className="space-y-2">
                    <Label htmlFor="taskDescription" className="text-white">Description</Label>
                    <Textarea
                      id="taskDescription"
                      value={newTask.description}
                      onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                      placeholder="Enter task description"
                      rows={3}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60 resize-none"
                    />
                  </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <Label className="text-white">Priority</Label>
                       <Select value={newTask.priority} onValueChange={(value) => setNewTask({...newTask, priority: value})}>
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
                     <div className="space-y-2">
                       <Label className="text-white">Assigned By</Label>
                       <Select value={newTask.assignedBy} onValueChange={(value) => setNewTask({...newTask, assignedBy: value})}>
                         <SelectTrigger className="bg-white/10 border-white/20 text-white">
                           <SelectValue placeholder="Select who assigns" />
                         </SelectTrigger>
                         <SelectContent className="bg-slate-800 border-white/20">
                           <SelectItem value="john" className="text-white hover:bg-white/10">John Doe</SelectItem>
                           <SelectItem value="jane" className="text-white hover:bg-white/10">Jane Smith</SelectItem>
                           <SelectItem value="mike" className="text-white hover:bg-white/10">Mike Johnson</SelectItem>
                         </SelectContent>
                       </Select>
                     </div>
                   </div>
                   <div className="space-y-2">
                     <Label className="text-white">Assign To (Multiple)</Label>
                     <Select 
                       value="" 
                       onValueChange={(value) => {
                         if (value && !newTask.assignees.includes(value)) {
                           setNewTask({...newTask, assignees: [...newTask.assignees, value]});
                         }
                       }}
                     >
                       <SelectTrigger className="bg-white/10 border-white/20 text-white">
                         <SelectValue placeholder="Add assignees" />
                       </SelectTrigger>
                       <SelectContent className="bg-slate-800 border-white/20">
                         <SelectItem value="john" className="text-white hover:bg-white/10">John Doe</SelectItem>
                         <SelectItem value="jane" className="text-white hover:bg-white/10">Jane Smith</SelectItem>
                         <SelectItem value="mike" className="text-white hover:bg-white/10">Mike Johnson</SelectItem>
                       </SelectContent>
                     </Select>
                     {newTask.assignees.length > 0 && (
                       <div className="flex flex-wrap gap-2 mt-2">
                         {newTask.assignees.map((assignee) => (
                           <Badge key={assignee} className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                             {assignee}
                             <button
                               type="button"
                               onClick={() => setNewTask({
                                 ...newTask, 
                                 assignees: newTask.assignees.filter(a => a !== assignee)
                               })}
                               className="ml-1 hover:text-red-400"
                             >
                               ×
                             </button>
                           </Badge>
                         ))}
                       </div>
                     )}
                   </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate" className="text-white">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateTaskOpen(false)}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="cosmic"
                      disabled={!newTask.name.trim()}
                    >
                      Create Task
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Whiteboard Area */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">Whiteboard</h2>
            <Card className="glass-card border border-white/20 p-8 min-h-[300px] hover:border-white/30 transition-all">
              <div className="flex items-center justify-center h-full text-white/40">
                <p className="text-lg">Whiteboard area - Coming soon</p>
              </div>
            </Card>
          </div>

          {/* Task List */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">Tasks ({project.tasks.length})</h2>
            
            <Card className="glass-card border border-white/20 p-6 hover:border-white/30 transition-all">
              {project.tasks.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-white/40 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No tasks yet</h3>
                  <p className="text-white/60">Create your first task to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {project.tasks.map((task) => (
                    <Card key={task.id} className="glass-card border border-white/10 p-4 hover:border-white/20 transition-all aspect-square flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <button
                          onClick={() => handleToggleTaskStatus(task.id)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            task.status === 'completed' 
                              ? 'bg-green-500 border-green-500' 
                              : 'border-white/30 hover:border-white/50'
                          }`}
                        >
                          {task.status === 'completed' && <Check className="w-3 h-3 text-white" />}
                        </button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                          className="border-red-500/20 text-red-400 hover:bg-red-500/10 h-6 w-6 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <h3 className={`text-sm font-semibold text-white line-clamp-2 ${
                          task.status === 'completed' ? 'line-through opacity-60' : ''
                        }`}>
                          {task.name}
                        </h3>
                        {task.description && (
                          <p className="text-xs text-white/70 line-clamp-2">{task.description}</p>
                        )}
                      </div>
                      
                       <div className="mt-auto space-y-2">
                         <div className="flex items-center gap-2 text-xs">
                           {task.assignees.length > 0 && (
                             <div className="flex items-center gap-1 text-white/60">
                               <User className="w-3 h-3" />
                               <span className="truncate">{task.assignees.join(', ')}</span>
                             </div>
                           )}
                           {task.assignedBy && (
                             <div className="flex items-center gap-1 text-white/60">
                               <span className="text-xs">By: {task.assignedBy}</span>
                             </div>
                           )}
                         </div>
                        
                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-white/60">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1 flex-wrap">
                          {task.priority && (
                            <Badge className={`${getPriorityColor(task.priority)} text-xs py-0 px-1`}>
                              <Flag className="w-2 h-2 mr-1" />
                              {task.priority}
                            </Badge>
                          )}
                          <Badge className={`${getStatusColor(task.status)} text-xs py-0 px-1`}>
                            {task.status.replace('-', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>
          </div>
        </div>
        <ChatPopup />
      </Layout>
    );
};

export default ProjectWorkspace;
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FolderOpen, Trash2, Calendar, Users, CheckCircle2, Copy, Code } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  name: string;
  description: string;
  priority: string;
  assignee?: string;
  assignees?: string[];
  assignedBy?: string;
  dueDate: string;
  status?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  code: string;
  members?: string[];
  tasks: Task[];
}

interface ProjectListProps {
  projects: Project[];
  onDeleteProject: (projectId: string) => void;
}

export const ProjectList = ({ projects, onDeleteProject }: ProjectListProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const copyProjectCode = async (code: string, projectName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Code copied!",
        description: `Project code ${code} copied to clipboard.`,
      });
    } catch {
      toast({
        title: "Failed to copy",
        description: "Could not copy code to clipboard.",
        variant: "destructive",
      });
    }
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <FolderOpen className="w-16 h-16 text-white/40 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
        <p className="text-white/60">Create your first project to get started</p>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const calculateProgress = (tasks: Task[]) => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    return (completedTasks / tasks.length) * 100;
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Card 
          key={project.id} 
          className="glass-card border border-white/20 p-6 hover:border-white/30 transition-all cursor-pointer group"
          onClick={() => navigate(`/project/${project.id}`)}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
                <FolderOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">
                  {project.name}
                </h3>
                <div className="flex items-center gap-2">
                  <p className="text-white/60 text-sm">
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => copyProjectCode(project.code, project.name, e)}
                    className="h-6 px-2 gap-1 text-xs text-white/60 hover:text-white hover:bg-white/10"
                    title="Copy project code"
                  >
                    <Code className="w-3 h-3" />
                    {project.code}
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteProject(project.id);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity border-red-500/20 text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <p className="text-white/70 text-sm mb-4 line-clamp-2">
            {project.description || "No description provided"}
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-white/60">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="text-sm">{project.tasks.length} tasks</span>
              </div>
              {project.tasks.length > 0 && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400">
                    {project.tasks.filter(task => task.status === 'completed').length} completed
                  </span>
                </div>
              )}
            </div>
            
            {project.tasks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm font-medium">Progress</span>
                  <span className="text-white/60 text-sm">{Math.round(calculateProgress(project.tasks))}%</span>
                </div>
                <Progress value={calculateProgress(project.tasks)} className="h-2" />
              </div>
            )}

            {project.tasks.length > 0 && (
              <div className="space-y-2">
                <p className="text-white/80 text-sm font-medium">Recent Tasks:</p>
                {project.tasks.slice(0, 2).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white text-sm font-medium truncate">{task.name}</p>
                        {task.status === 'completed' && (
                          <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" />
                        )}
                      </div>
                      {(task.assignee || task.assignees?.length) && (
                        <p className="text-white/60 text-xs">
                          Assigned to {task.assignee || task.assignees?.join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {task.priority && (
                        <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </Badge>
                      )}
                      {task.dueDate && (
                        <div className="flex items-center gap-1 text-white/60">
                          <Calendar className="w-3 h-3" />
                          <span className="text-xs">{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {project.tasks.length > 2 && (
                  <p className="text-white/60 text-xs">
                    +{project.tasks.length - 2} more tasks
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
import { Search, Filter, ChevronDown, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TaskCard } from "./TaskCard";
import { useTasks } from "@/hooks/useTasks";

export const Dashboard = () => {
  const { tasks, getTasksByStatus } = useTasks();
  
  const inProgressTasks = getTasksByStatus('in-progress');
  const highPriorityTasks = tasks.filter(task => task.priority === 'high');
  
  return (
    <div className="flex-1 p-8 cosmic-scroll overflow-y-auto">
      {/* Professional Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Project Dashboard
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              Streamlined project management for enhanced team productivity
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button className="gap-2 glow-button">
              <Search className="w-4 h-4" />
              Quick Search
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="glass-card border-border/30 hover:shadow-glow transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-bold text-foreground">{tasks.length}</p>
                  <p className="text-xs text-accent flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    Active projects
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/30 hover:shadow-glow transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                  <p className="text-2xl font-bold text-foreground">{highPriorityTasks.length}</p>
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    Needs attention
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-destructive/20 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Refined Controls */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="default" className="gap-2 glass-card bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20">
            <Filter className="w-4 h-4" />
            All Tasks
            <ChevronDown className="w-4 h-4" />
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground transition-colors">
            In Progress
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground transition-colors">
            High Priority
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground transition-colors">
            Due Soon
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{tasks.length}</span> tasks
        </div>
      </div>

      {/* Enhanced Task Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {tasks.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground text-lg">No tasks found</p>
            <p className="text-sm text-muted-foreground mt-2">Create a project and add tasks to get started</p>
          </div>
        ) : (
          tasks.map((task, index) => (
            <div key={task.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <TaskCard 
                title={task.name}
                description={task.description}
                status={task.status}
                priority={task.priority}
                assignees={[{ 
                  name: task.assignee || "Unassigned", 
                  initials: (task.assignee || "UN").substring(0, 2).toUpperCase() 
                }]}
                dueDate={task.dueDate}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
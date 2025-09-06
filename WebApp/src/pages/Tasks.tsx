import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";
import { JoinProjectDialog } from "@/components/JoinProjectDialog";
import { ProjectList } from "@/components/ProjectList";
import { FolderPlus, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateProjectCode } from "@/lib/projectUtils";

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  code: string;
  members?: string[];
  tasks: Task[];
}

interface Task {
  id: string;
  name: string;
  description: string;
  priority: string;
  assignee: string;
  dueDate: string;
}

const Tasks = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const { toast } = useToast();

  // Load projects from localStorage on component mount
  useEffect(() => {
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  const handleProjectCreated = (projectData: { name: string; description: string; tasks: Task[] }) => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: projectData.name,
      description: projectData.description,
      createdAt: new Date().toISOString(),
      code: generateProjectCode(),
      members: ['current-user'], // Add creator as first member
      tasks: projectData.tasks,
    };

    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));

    toast({
      title: "Project created successfully!",
      description: `Project "${newProject.name}" has been created with code ${newProject.code}${newProject.tasks.length > 0 ? ` and ${newProject.tasks.length} task${newProject.tasks.length > 1 ? 's' : ''}` : ''}.`,
    });
  };

  const handleDeleteProject = (projectId: string) => {
    const updatedProjects = projects.filter(project => project.id !== projectId);
    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));

    toast({
      title: "Project deleted",
      description: "Project has been removed successfully.",
    });
  };
  return (
    <Layout>
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Project Management</h1>
            <p className="text-white/80">Create projects, manage tasks, and collaborate with your team</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Create Project Card */}
            <div className="glass-card border border-white/20 p-6 rounded-xl hover:border-white/30 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
                  <FolderPlus className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Create Project</h3>
              </div>
              <p className="text-white/70 mb-6">
                Start a new project and assign tasks to your team members immediately.
              </p>
              <CreateProjectDialog onProjectCreated={handleProjectCreated} />
            </div>

            {/* Join Project Card */}
            <div className="glass-card border border-white/20 p-6 rounded-xl hover:border-white/30 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Join Project</h3>
              </div>
              <p className="text-white/70 mb-6">
                Join an existing project using an invitation code from your team lead.
              </p>
              <JoinProjectDialog />
            </div>
          </div>

          {/* Projects List */}
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-white mb-6">Your Projects</h2>
            <ProjectList projects={projects} onDeleteProject={handleDeleteProject} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Tasks;
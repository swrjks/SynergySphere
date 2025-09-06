import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

export interface Task {
  id: string;
  name: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  dueDate: string;
  status: 'todo' | 'in-progress' | 'done';
  projectId: string;
  projectName: string;
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

interface TaskContextType {
  tasks: Task[];
  getAllTasks: () => Task[];
  getTasksByStatus: (status: 'todo' | 'in-progress' | 'done') => Task[];
  refreshTasks: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const refreshTasks = () => {
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      const projects: Project[] = JSON.parse(savedProjects);
      const allTasks: Task[] = [];

      projects.forEach(project => {
        project.tasks.forEach(task => {
          allTasks.push({
            ...task,
            status: task.status || 'todo', // Default status if not set
            projectId: project.id,
            projectName: project.name
          });
        });
      });

      setTasks(allTasks);
    }
  };

  useEffect(() => {
    refreshTasks();
    
    // Listen for localStorage changes
    const handleStorageChange = () => {
      refreshTasks();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const getAllTasks = () => tasks;

  const getTasksByStatus = (status: 'todo' | 'in-progress' | 'done') => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <TaskContext.Provider value={{ 
      tasks, 
      getAllTasks, 
      getTasksByStatus, 
      refreshTasks 
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
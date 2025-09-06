import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  status: 'todo' | 'in-progress' | 'completed';
  projectId: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  memberCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AppContextType {
  user: User | null;
  projects: Project[];
  tasks: Task[];
  currentProject: Project | null;
  login: (email: string, password: string) => void;
  logout: () => void;
  signup: (name: string, email: string, password: string) => void;
  createProject: (name: string, description: string) => void;
  setCurrentProject: (project: Project | null) => void;
  createTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const login = (email: string, password: string) => {
    // Simulate login - in real app, this would call your authentication API
    const mockUser: User = {
      id: '1',
      name: 'John Doe',
      email: email,
    };
    setUser(mockUser);
    
    // Load demo data
    const demoProjects: Project[] = [
      {
        id: '1',
        name: 'Website Redesign',
        description: 'Complete overhaul of company website',
        createdAt: new Date().toISOString(),
        memberCount: 5,
      },
      {
        id: '2',
        name: 'Mobile App Development',
        description: 'New mobile application for customers',
        createdAt: new Date().toISOString(),
        memberCount: 8,
      },
    ];
    
    const demoTasks: Task[] = [
      {
        id: '1',
        title: 'Design Homepage',
        description: 'Create wireframes and mockups for the new homepage',
        assignee: 'John Doe',
        dueDate: '2024-01-15',
        status: 'in-progress',
        projectId: '1',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Setup Authentication',
        description: 'Implement user login and registration system',
        assignee: 'Jane Smith',
        dueDate: '2024-01-20',
        status: 'todo',
        projectId: '2',
        createdAt: new Date().toISOString(),
      },
    ];
    
    setProjects(demoProjects);
    setTasks(demoTasks);
  };

  const logout = () => {
    setUser(null);
    setProjects([]);
    setTasks([]);
    setCurrentProject(null);
  };

  const signup = (name: string, email: string, password: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
    };
    setUser(newUser);
  };

  const createProject = (name: string, description: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      description,
      createdAt: new Date().toISOString(),
      memberCount: 1,
    };
    setProjects(prev => [...prev, newProject]);
  };

  const createTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        projects,
        tasks,
        currentProject,
        login,
        logout,
        signup,
        createProject,
        setCurrentProject,
        createTask,
        updateTask,
        deleteTask,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
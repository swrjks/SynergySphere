// Utility functions for project management

export const generateProjectCode = (): string => {
  // Generate a 6-character alphanumeric code
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const findProjectByCode = (code: string): any | null => {
  try {
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    return projects.find((project: any) => project.code === code.toUpperCase()) || null;
  } catch {
    return null;
  }
};

export const addUserToProject = (projectCode: string, userId: string = 'current-user'): boolean => {
  try {
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const projectIndex = projects.findIndex((project: any) => project.code === projectCode.toUpperCase());
    
    if (projectIndex === -1) return false;
    
    // Add user to project members if not already added
    if (!projects[projectIndex].members) {
      projects[projectIndex].members = [];
    }
    
    if (!projects[projectIndex].members.includes(userId)) {
      projects[projectIndex].members.push(userId);
    }
    
    localStorage.setItem('projects', JSON.stringify(projects));
    return true;
  } catch {
    return false;
  }
};
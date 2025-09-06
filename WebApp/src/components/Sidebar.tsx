import { Home, CheckSquare, MessageSquare, Activity, Calendar, Settings, LogOut, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: CheckSquare, label: "Tasks", href: "/tasks" },
  { icon: MessageSquare, label: "Messages", href: "/messages" },
  { icon: Activity, label: "Activity", href: "/activity" },
  { icon: Calendar, label: "Calendar", href: "/calendar" },
  { icon: Settings, label: "Options", href: "/options" },
];

export const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} h-screen glass-card border-r border-border/30 ${isCollapsed ? 'p-2' : 'p-5'} flex flex-col transition-all duration-300 ease-in-out relative`}>
      {/* Collapse Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-card-glass border border-border/30 p-0 shadow-md hover:shadow-glow transition-all duration-200"
      >
        {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </Button>

      {/* Logo */}
      <div className={`flex items-center gap-3 mb-8 mt-2 ${isCollapsed ? 'justify-center' : ''}`}>
        <div className="w-7 h-7 bg-gradient-primary rounded-md flex items-center justify-center shadow-glow overflow-hidden">
          <img 
            src="/lovable-uploads/1f7c44f0-9032-4511-b93e-628ee655f152.png" 
            alt="SynergySphere Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        {!isCollapsed && (
          <span className="font-semibold text-lg text-foreground">SynergySphere</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <Link key={item.label} to={item.href}>
              <Button
                variant={isActive ? "cosmic" : "ghost"}
                className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start px-3'} gap-3 h-10 ${
                  isActive 
                    ? "bg-gradient-primary text-white shadow-glow" 
                    : "text-muted-foreground hover:text-foreground hover:bg-card-glass/50"
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-border/30 pt-4 space-y-2">
        <Button 
          variant="ghost" 
          className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start px-3'} gap-3 h-10 text-muted-foreground hover:text-foreground hover:bg-card-glass/50`}
          title={isCollapsed ? "Settings" : undefined}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </Button>
        <Button 
          variant="ghost" 
          className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start px-3'} gap-3 h-10 text-muted-foreground hover:text-foreground hover:bg-card-glass/50 mb-4`}
          title={isCollapsed ? "Log out" : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>Log out</span>}
        </Button>
        
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center p-2' : 'p-3'} glass-card rounded-lg border border-border/30`}>
          <Avatar className="w-7 h-7 flex-shrink-0">
            <AvatarImage src="" />
            <AvatarFallback className="bg-gradient-primary text-white text-xs font-medium">👤</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">User Name</p>
              <p className="text-xs text-muted-foreground">user@example.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
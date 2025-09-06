import { Layout } from "@/components/Layout";
import { Activity as ActivityIcon, Clock, User, CheckSquare, FileText, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const Activity = () => {
  const activities = [
    {
      id: 1,
      user: "John Doe",
      action: "completed task",
      target: "User Authentication",
      time: "5 minutes ago",
      type: "task",
      icon: CheckSquare,
    },
    {
      id: 2,
      user: "Jane Smith",
      action: "created project",
      target: "Mobile App Redesign",
      time: "1 hour ago",
      type: "project",
      icon: FileText,
    },
    {
      id: 3,
      user: "Mike Johnson",
      action: "joined project",
      target: "Website Migration",
      time: "2 hours ago",
      type: "team",
      icon: Users,
    },
    {
      id: 4,
      user: "Sarah Wilson",
      action: "updated task",
      target: "Database Optimization",
      time: "3 hours ago",
      type: "task",
      icon: CheckSquare,
    },
    {
      id: 5,
      user: "Tom Brown",
      action: "added comment",
      target: "API Documentation",
      time: "4 hours ago",
      type: "comment",
      icon: FileText,
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "task": return "bg-blue-500/20 text-blue-300";
      case "project": return "bg-green-500/20 text-green-300";
      case "team": return "bg-purple-500/20 text-purple-300";
      case "comment": return "bg-orange-500/20 text-orange-300";
      default: return "bg-gray-500/20 text-gray-300";
    }
  };

  return (
    <Layout>
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <ActivityIcon className="w-8 h-8 text-white" />
            <h1 className="text-3xl font-bold text-white">Activity Feed</h1>
          </div>

          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="glass-card border border-white/20 p-6 rounded-xl">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-primary text-white text-sm">
                        {activity.user.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="w-4 h-4 text-white/70" />
                        <Badge className={`${getTypeColor(activity.type)} border-0 text-xs`}>
                          {activity.type}
                        </Badge>
                      </div>
                      
                      <p className="text-white mb-1">
                        <span className="font-medium">{activity.user}</span>
                        <span className="text-white/70"> {activity.action} </span>
                        <span className="font-medium">"{activity.target}"</span>
                      </p>
                      
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Clock className="w-3 h-3" />
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More */}
          <div className="text-center mt-8">
            <button className="text-white/70 hover:text-white transition-colors">
              Load more activities...
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Activity;
import { useState } from "react";
import { Users, Plus, Crown, User, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  avatar?: string;
  status: "online" | "offline" | "away";
}

export const TeamMembersPopup = () => {
  const [teamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com", 
      role: "owner",
      status: "online"
    },
    {
      id: "2",
      name: "Jane Smith", 
      email: "jane@example.com",
      role: "admin",
      status: "online"
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike@example.com", 
      role: "member",
      status: "away"
    },
    {
      id: "4",
      name: "Sarah Wilson",
      email: "sarah@example.com",
      role: "member", 
      status: "offline"
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500";
      case "away": return "bg-yellow-500"; 
      case "offline": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner": return <Crown className="w-3 h-3 text-yellow-400" />;
      case "admin": return <User className="w-3 h-3 text-blue-400" />;
      default: return null;
    }
  };

  const onlineMembers = teamMembers.filter(m => m.status === "online").length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 border-white/20 text-white hover:bg-white/10"
        >
          <Users className="w-4 h-4" />
          <span className="flex items-center gap-1">
            {teamMembers.length}
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            {onlineMembers}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 glass-card border border-white/20 p-0" align="start">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Team Members</h3>
            <Button size="sm" variant="cosmic" className="gap-1">
              <Plus className="w-3 h-3" />
              Invite
            </Button>
          </div>
          <p className="text-sm text-white/60 mt-1">
            {teamMembers.length} members • {onlineMembers} online
          </p>
        </div>
        
        <div className="max-h-80 overflow-y-auto cosmic-scroll">
          <div className="p-2">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="bg-gradient-primary text-white text-sm">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(member.status)} rounded-full border-2 border-background`}></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white truncate">{member.name}</p>
                    {getRoleIcon(member.role)}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-white/60 truncate">{member.email}</p>
                    {member.role !== "member" && (
                      <Badge 
                        variant="outline" 
                        className="text-xs px-1 py-0 h-4 border-white/20 text-white/80"
                      >
                        {member.role}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  <div className={`w-2 h-2 ${getStatusColor(member.status)} rounded-full`}></div>
                  <span className="text-xs text-white/60 capitalize">{member.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-white/10">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-white/80 hover:bg-white/5">
            <Mail className="w-4 h-4" />
            Manage team settings
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
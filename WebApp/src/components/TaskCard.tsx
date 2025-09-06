import { MoreHorizontal, Paperclip, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface TaskCardProps {
  title: string;
  description: string;
  progress?: number;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  assignees: Array<{ name: string; avatar?: string; initials: string }>;
  hasAttachment?: boolean;
  dueDate?: string;
}

export const TaskCard = ({ 
  title, 
  description, 
  progress, 
  status, 
  priority, 
  assignees, 
  hasAttachment,
  dueDate 
}: TaskCardProps) => {
  const statusColors = {
    todo: "bg-muted/50",
    "in-progress": "bg-gradient-primary",
    done: "bg-gradient-to-r from-green-500 to-emerald-500"
  };

  return (
    <div className="glass-card p-4 rounded-xl hover:shadow-glow transition-all duration-300 cursor-pointer group border border-border/30">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
        </div>
        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0">
          <MoreHorizontal className="w-3 h-3" />
        </Button>
      </div>

      {/* Content */}
      <h3 className="font-medium text-foreground mb-2 text-sm leading-tight">{title}</h3>
      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{description}</p>

      {/* Progress */}
      {progress !== undefined && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-muted-foreground">Progress</span>
            <span className="text-xs font-medium text-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Assignees */}
          <div className="flex -space-x-1.5">
            {assignees.slice(0, 3).map((assignee, index) => (
              <Avatar key={index} className="w-5 h-5 border border-card">
                <AvatarImage src={assignee.avatar} />
                <AvatarFallback className="text-[8px] bg-gradient-primary text-white font-medium">
                  {assignee.initials}
                </AvatarFallback>
              </Avatar>
            ))}
            {assignees.length > 3 && (
              <div className="w-5 h-5 rounded-full bg-muted border border-card flex items-center justify-center">
                <span className="text-[8px] font-medium">+{assignees.length - 3}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-muted-foreground">
          {hasAttachment && <Paperclip className="w-3 h-3" />}
          {dueDate && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span className="text-[10px]">{dueDate}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
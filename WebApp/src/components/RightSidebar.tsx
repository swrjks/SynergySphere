import { Plus, Edit3, FileText, MoreHorizontal, Folder, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { CalendarWidget } from "./CalendarWidget";

export const RightSidebar = () => {
  return (
    <div className="w-72 h-screen p-5 space-y-5 border-l border-border/30">
      {/* Calendar Widget */}
      <CalendarWidget />

      {/* Activity */}
      <div className="glass-card p-4 rounded-xl border border-border/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-sm text-foreground">Activity</h3>
          <Button variant="cosmic" size="sm" className="h-6 px-2 text-[10px] shadow-glow">
            Get the report
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <Avatar className="w-5 h-5">
              <AvatarFallback className="text-[8px] bg-gradient-primary text-white">JD</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-xs">
              <p className="text-muted-foreground">
                <span className="text-foreground font-medium">John</span> completed task
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">2 hours ago</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Avatar className="w-5 h-5">
              <AvatarFallback className="text-[8px] bg-accent text-white">SM</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-xs">
              <p className="text-muted-foreground">
                <span className="text-foreground font-medium">Sarah</span> uploaded files
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">4 hours ago</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/30">
            <div className="h-12 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg flex items-center justify-center border border-primary/20">
              <div className="text-center">
                <Progress value={67} className="w-16 h-1 mb-1" />
                <span className="text-[10px] text-muted-foreground">Project Progress</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { findProjectByCode, addUserToProject } from "@/lib/projectUtils";

export const JoinProjectDialog = () => {
  const [open, setOpen] = useState(false);
  const [projectCode, setProjectCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const project = findProjectByCode(projectCode);
      
      if (!project) {
        toast({
          title: "Project not found",
          description: "No project found with that code. Please check and try again.",
          variant: "destructive",
        });
        return;
      }
      
      const success = addUserToProject(projectCode);
      
      if (success) {
        toast({
          title: "Successfully joined project!",
          description: `You have joined "${project.name}" (${projectCode}).`,
        });
        setProjectCode("");
        setOpen(false);
        // Refresh the page to show the new project
        window.location.reload();
      } else {
        toast({
          title: "Failed to join project",
          description: "An error occurred while joining the project.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error joining project",
        description: "Please check the project code and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-white/20 text-white hover:bg-white/10">
          <UserPlus className="h-4 w-4" />
          Join Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] glass-card border border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white">Join Existing Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="projectCode" className="text-white">Project Code</Label>
            <div className="relative">
              <Input
                id="projectCode"
                value={projectCode}
                onChange={(e) => setProjectCode(e.target.value)}
                placeholder="Enter project invitation code"
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 pl-10"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-white/60" />
            </div>
            <p className="text-sm text-white/60">
              Ask your team lead for the project invitation code
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="cosmic"
              disabled={loading || !projectCode.trim()}
            >
              {loading ? "Joining..." : "Join Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
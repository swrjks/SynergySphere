import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const CreateTaskDialog = () => {
  const [open, setOpen] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // TODO: Add Supabase task creation logic here
      toast({
        title: "Task created successfully!",
        description: `Task "${taskName}" has been created.`,
      });
      setTaskName("");
      setDescription("");
      setPriority("");
      setAssignee("");
      setDueDate("");
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error creating task",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-white/20 text-white hover:bg-white/10">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] glass-card border border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="taskName" className="text-white">Task Name</Label>
            <Input
              id="taskName"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="Enter task name"
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taskDescription" className="text-white">Description</Label>
            <Textarea
              id="taskDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              rows={3}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/20">
                  <SelectItem value="low" className="text-white hover:bg-white/10">Low</SelectItem>
                  <SelectItem value="medium" className="text-white hover:bg-white/10">Medium</SelectItem>
                  <SelectItem value="high" className="text-white hover:bg-white/10">High</SelectItem>
                  <SelectItem value="urgent" className="text-white hover:bg-white/10">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white">Assign to</Label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/20">
                  <SelectItem value="john" className="text-white hover:bg-white/10">John Doe</SelectItem>
                  <SelectItem value="jane" className="text-white hover:bg-white/10">Jane Smith</SelectItem>
                  <SelectItem value="mike" className="text-white hover:bg-white/10">Mike Johnson</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-white">Due Date</Label>
            <div className="relative">
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
              <Calendar className="absolute right-3 top-3 h-4 w-4 text-white/60 pointer-events-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
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
              disabled={loading || !taskName.trim()}
            >
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
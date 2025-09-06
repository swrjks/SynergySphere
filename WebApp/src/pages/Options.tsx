import { Layout } from "@/components/Layout";
import { Settings, User, Bell, Shield, Palette, Globe, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Options = () => {
  return (
    <Layout>
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Settings className="w-8 h-8 text-white" />
            <h1 className="text-3xl font-bold text-white">Settings</h1>
          </div>

          <div className="space-y-6">
            {/* Profile Settings */}
            <div className="glass-card border border-white/20 p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-5 h-5 text-white" />
                <h2 className="text-xl font-semibold text-white">Profile</h2>
              </div>
              
              <div className="flex items-center gap-6 mb-6">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="bg-gradient-primary text-white text-lg">👤</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    Change Photo
                  </Button>
                  <Button variant="ghost" className="text-white/70 hover:text-white">
                    Remove Photo
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Full Name</Label>
                  <Input 
                    defaultValue="John Doe" 
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Email</Label>
                  <Input 
                    defaultValue="john@example.com" 
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Job Title</Label>
                  <Input 
                    defaultValue="Project Manager" 
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Department</Label>
                  <Select defaultValue="engineering">
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20">
                      <SelectItem value="engineering" className="text-white hover:bg-white/10">Engineering</SelectItem>
                      <SelectItem value="design" className="text-white hover:bg-white/10">Design</SelectItem>
                      <SelectItem value="marketing" className="text-white hover:bg-white/10">Marketing</SelectItem>
                      <SelectItem value="sales" className="text-white hover:bg-white/10">Sales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="glass-card border border-white/20 p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-5 h-5 text-white" />
                <h2 className="text-xl font-semibold text-white">Notifications</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Email Notifications</p>
                    <p className="text-white/70 text-sm">Receive updates via email</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Task Assignments</p>
                    <p className="text-white/70 text-sm">Get notified when assigned to tasks</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Project Updates</p>
                    <p className="text-white/70 text-sm">Receive project status updates</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Team Messages</p>
                    <p className="text-white/70 text-sm">Get notified of new messages</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div className="glass-card border border-white/20 p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-6">
                <Palette className="w-5 h-5 text-white" />
                <h2 className="text-xl font-semibold text-white">Appearance</h2>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Theme</Label>
                  <Select defaultValue="dark">
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20">
                      <SelectItem value="dark" className="text-white hover:bg-white/10">Dark</SelectItem>
                      <SelectItem value="light" className="text-white hover:bg-white/10">Light</SelectItem>
                      <SelectItem value="auto" className="text-white hover:bg-white/10">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20">
                      <SelectItem value="en" className="text-white hover:bg-white/10">English</SelectItem>
                      <SelectItem value="es" className="text-white hover:bg-white/10">Spanish</SelectItem>
                      <SelectItem value="fr" className="text-white hover:bg-white/10">French</SelectItem>
                      <SelectItem value="de" className="text-white hover:bg-white/10">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="glass-card border border-white/20 p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-5 h-5 text-white" />
                <h2 className="text-xl font-semibold text-white">Security</h2>
              </div>
              
              <div className="space-y-4">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Change Password
                </Button>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Enable Two-Factor Authentication
                </Button>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  View Login History
                </Button>
              </div>
            </div>

            {/* Data & Privacy */}
            <div className="glass-card border border-white/20 p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-6">
                <Download className="w-5 h-5 text-white" />
                <h2 className="text-xl font-semibold text-white">Data & Privacy</h2>
              </div>
              
              <div className="space-y-4">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Export My Data
                </Button>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Delete Account
                </Button>
              </div>
            </div>

            {/* Save Changes */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Cancel
              </Button>
              <Button variant="cosmic">
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Options;
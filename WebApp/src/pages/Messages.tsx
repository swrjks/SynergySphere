import { Layout } from "@/components/Layout";
import { MessageSquare, Send, Search, Phone, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Messages = () => {
  const conversations = [
    { id: 1, name: "John Doe", lastMessage: "Hey, how's the project going?", time: "2m ago", unread: 2 },
    { id: 2, name: "Jane Smith", lastMessage: "Can we schedule a meeting?", time: "1h ago", unread: 0 },
    { id: 3, name: "Team Alpha", lastMessage: "Updated the requirements doc", time: "3h ago", unread: 1 },
  ];

  return (
    <Layout>
      <div className="flex-1 flex">
        {/* Conversations List */}
        <div className="w-80 glass-card border-r border-white/20 p-4">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-6 h-6 text-white" />
            <h2 className="text-xl font-semibold text-white">Messages</h2>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 w-4 h-4 text-white/60" />
            <Input 
              placeholder="Search conversations..." 
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60 pl-10"
            />
          </div>

          <div className="space-y-2">
            {conversations.map((conv) => (
              <div key={conv.id} className="p-3 rounded-lg hover:bg-white/10 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gradient-primary text-white text-sm">
                      {conv.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-white text-sm">{conv.name}</p>
                      <span className="text-xs text-white/60">{conv.time}</span>
                    </div>
                    <p className="text-sm text-white/70 truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && (
                    <div className="w-5 h-5 bg-gradient-primary rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-medium">{conv.unread}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-white/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-gradient-primary text-white">JD</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-white">John Doe</p>
                <p className="text-sm text-white/60">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <Video className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            <div className="flex justify-start">
              <div className="bg-white/10 rounded-lg p-3 max-w-xs">
                <p className="text-white text-sm">Hey, how's the project going?</p>
                <span className="text-xs text-white/60 mt-1 block">2:30 PM</span>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-gradient-primary rounded-lg p-3 max-w-xs">
                <p className="text-white text-sm">Going well! Just finished the user interface mockups.</p>
                <span className="text-xs text-white/80 mt-1 block">2:32 PM</span>
              </div>
            </div>
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-white/20">
            <div className="flex items-center gap-3">
              <Input 
                placeholder="Type a message..." 
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
              <Button variant="cosmic" size="sm">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
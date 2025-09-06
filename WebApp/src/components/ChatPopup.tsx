import { useState } from "react";
import { MessageSquare, Send, X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  avatar?: string;
}

export const ChatPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "John Doe",
      content: "Hey team, how's the project coming along?",
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: "2", 
      sender: "Jane Smith",
      content: "Making good progress on the UI components!",
      timestamp: new Date(Date.now() - 1800000),
    },
    {
      id: "3",
      sender: "Mike Johnson", 
      content: "Backend API is almost ready for testing",
      timestamp: new Date(Date.now() - 900000),
    }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: Message = {
      id: crypto.randomUUID(),
      sender: "You",
      content: newMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button 
          variant="cosmic" 
          size="sm" 
          className="gap-2 fixed right-4 bottom-4 z-50 shadow-glow hover:shadow-glow"
        >
          <MessageSquare className="w-4 h-4" />
          Chat
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[80vh] max-w-md ml-auto mr-4 rounded-t-lg glass-card border border-white/20">
        <DrawerHeader className="border-b border-white/10">
          <DrawerTitle className="text-white flex items-center gap-2">
            <Users className="w-4 h-4" />
            Team Chat
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="flex flex-col h-full p-4">
          <ScrollArea className="flex-1 cosmic-scroll">
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex gap-3 ${message.sender === "You" ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={message.avatar} />
                    <AvatarFallback className="bg-gradient-primary text-white text-xs">
                      {message.sender.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex flex-col space-y-1 max-w-[70%] ${
                    message.sender === "You" ? "items-end" : "items-start"
                  }`}>
                    <div className={`rounded-lg px-3 py-2 ${
                      message.sender === "You"
                        ? "bg-primary text-primary-foreground"
                        : "glass-card border border-white/10"
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <span className="text-xs text-white/60">
                      {message.sender !== "You" && `${message.sender} • `}
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <form onSubmit={handleSendMessage} className="flex gap-2 mt-4 pt-4 border-t border-white/10">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
            <Button type="submit" size="sm" variant="cosmic" className="flex-shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
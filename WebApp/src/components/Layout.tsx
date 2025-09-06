import { Sidebar } from "@/components/Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-cosmic flex">
      <Sidebar />
      {children}
    </div>
  );
};
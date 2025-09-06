import { Layout } from "@/components/Layout";
import { Dashboard } from "@/components/Dashboard";
import { RightSidebar } from "@/components/RightSidebar";

const Index = () => {
  return (
    <Layout>
      <Dashboard />
      <RightSidebar />
    </Layout>
  );
};

export default Index;

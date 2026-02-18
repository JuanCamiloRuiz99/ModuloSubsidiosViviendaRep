import type { ReactNode } from "react";
import { useSelector } from "react-redux";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import type { RootState } from "../../../../../app/store";

interface Props {
  children: ReactNode;
  centerContent?: boolean;
}

function MainLayout({ children, centerContent = true }: Props) {
  const { user } = useSelector((state: RootState) => state.auth);
  const showSidebar = !!user;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <div className="flex flex-1">
        {showSidebar && <Sidebar />}
        <main
          className={`flex flex-1 py-10 ${
            centerContent ? "justify-center items-center" : "px-6"
          }`}
        >
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default MainLayout;

import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface Props {
  children: ReactNode;
}

function MainLayout({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex flex-1 justify-center items-center py-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;

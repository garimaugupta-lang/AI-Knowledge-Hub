import { Routes, Route } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { Browse } from "./pages/Browse";
import { Upload } from "./pages/Upload";

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={<Browse />} />
          <Route path="/upload" element={<Upload />} />
        </Routes>
      </main>
    </div>
  );
}

import { useState } from "react";
import { PanelLeft } from "lucide-react";
import Sidebar from "../components/Sidebar";
import ExcalidrawWrapper from "../components/ExcalidrawWrapper";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

const Dashboard = () => {
  const [mode, setMode] = useState<"diary" | "notes">("notes");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden relative">
      {sidebarOpen ? (
        <Sidebar
          mode={mode}
          setMode={setMode}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          excalidrawAPI={excalidrawAPI}
          onClose={() => setSidebarOpen(false)}
        />
      ) : (
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute top-4 left-[60px] z-50 w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-300 shadow-sm hover:bg-gray-50 text-gray-800 transition"
          title="Show Sidebar"
        >
          <PanelLeft size={18} strokeWidth={2} />
        </button>
      )}

      <div className="flex-1 relative">
        <ExcalidrawWrapper
          mode={mode}
          selectedId={selectedId}
          selectedDate={selectedDate}
          onAPIReady={setExcalidrawAPI}
        />
      </div>
    </div>
  );
};

export default Dashboard;
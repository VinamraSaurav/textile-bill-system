import Body from "./Body";
import { Navbar } from "../custom/Navbar";
import { Sidebar } from "../custom/Sidebar";

export default function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Navbar />
      <Sidebar />
      <Body />
    </div>
  );
}
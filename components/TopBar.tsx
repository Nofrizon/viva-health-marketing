// components/TopBar.tsx
import { Search, UserCircle } from 'lucide-react';

const TopBar = () => {
  return (
    <header className="bg-white p-4 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-2 border rounded-full p-2 w-full max-w-xs bg-gray-50">
        <Search className="h-5 w-5 text-gray-400" />
        <input type="search" placeholder="Search for projects, tasks..." className="bg-transparent outline-none w-full text-sm" />
      </div>
      <div className="flex items-center gap-2">
        <UserCircle className="h-8 w-8 text-gray-500" />
        <span className="text-sm font-medium">User Profile</span>
      </div>
    </header>
  );
};

export default TopBar;
import { FileCheck2 } from 'lucide-react';
import { DarkModeToggle } from './DarkModeToggle';

export function AppHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-primary/10 rounded-md">
          <FileCheck2 className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-primary/90">
          Charter Party Generator
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <DarkModeToggle />
      </div>
    </header>
  );
}

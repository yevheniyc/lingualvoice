'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mic, Users, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const navigation = [
  { name: 'TTS', href: '/', icon: Mic },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Translated', href: '/translated', icon: History },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-[250px] flex-col bg-gray-50 dark:bg-gray-900">
      <div className="flex h-16 items-center justify-between px-6">
        <h1 className="text-xl font-bold">LingualVoice</h1>
        <ThemeToggle />
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium',
                isActive
                  ? 'bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-white'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5',
                  isActive
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-300'
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
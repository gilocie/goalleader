
import { Facebook, Instagram, Twitter } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="sticky bottom-0 z-10 border-t bg-green-800 text-white p-6">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-gray-300">
          © {new Date().getFullYear()} GoalLeader. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="#"
            className="text-sm text-gray-300 hover:text-white"
          >
            Privacy Policy
          </Link>
          <Link
            href="#"
            className="text-sm text-gray-300 hover:text-white"
          >
            Terms of Service
          </Link>
          <div className="flex items-center gap-2">
            <Link href="#" className="text-gray-300 hover:text-white">
              <Facebook className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-gray-300 hover:text-white">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-gray-300 hover:text-white">
              <Instagram className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

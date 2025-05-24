'use client';

import Link from 'next/link';

interface NavButtonParams {
  pageName: string;
  href: string;  // Changed from 'to' to 'href' to match Next.js Link props
  onClick?: () => void;
}

export default function NavButton({ pageName, href, onClick }: NavButtonParams) {
  return (
    <div>
      <Link href={href}>
        <button className="next-button" onClick={onClick}>{pageName}</button>
      </Link>
    </div>
  );
}
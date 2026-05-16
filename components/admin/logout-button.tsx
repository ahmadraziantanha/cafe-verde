'use client';

import type { ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  className?: string;
}

export function LogoutButton({ children, className }: Props) {
  async function logout() {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    window.location.href = '/admin/login';
  }
  return (
    <button type="button" onClick={logout} className={className ?? 'hover:text-forest'}>
      {children ?? 'Sign out'}
    </button>
  );
}

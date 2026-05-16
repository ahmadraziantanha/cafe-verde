import { AdminSidebar, AdminTopbar } from '@/components/admin/sidebar';

// Auth is enforced in middleware.ts. This layout only wraps the protected
// admin pages (orders, menu); /admin/login lives outside this group.

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-slate-50/70 text-charcoal">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

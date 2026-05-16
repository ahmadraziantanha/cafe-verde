import { ClipboardList, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { OrdersTable } from '@/components/admin/orders-table';
import { StatCard } from '@/components/admin/stat-card';
import { supabaseAdmin } from '@/lib/supabase/server';
import { formatUSD } from '@/lib/format';
import type { Order } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const metadata = { title: 'Orders · Admin', robots: { index: false, follow: false } };

async function getOrders(): Promise<Order[]> {
  const { data } = await supabaseAdmin()
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  return (data ?? []) as Order[];
}

function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export default async function AdminOrdersPage() {
  const orders = await getOrders();
  const today = startOfToday();
  const todays = orders.filter((o) => new Date(o.created_at).getTime() >= today);
  const todaysRevenue = todays.reduce((s, o) => s + Number(o.total), 0);
  const pending = orders.filter((o) => o.status !== 'delivered');
  const avgOrder = todays.length > 0 ? todaysRevenue / todays.length : 0;

  return (
    <div className="max-w-[1320px] mx-auto px-6 lg:px-10 py-8 lg:py-10">
      {/* Page header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-[0.16em]">Dashboard</p>
          <h1 className="font-serif text-3xl lg:text-[34px] tracking-tightest text-charcoal mt-1.5">Orders</h1>
        </div>
        <p className="text-[13px] text-slate-500">
          Live · auto-refreshes on action · showing latest 100
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mt-7">
        <StatCard
          label="Today's orders"
          value={todays.length}
          hint={todays.length === 0 ? 'No orders yet today' : `${todays.length === 1 ? 'order' : 'orders'} since midnight`}
          icon={<ClipboardList className="h-4 w-4" strokeWidth={1.75} />}
          accent="forest"
        />
        <StatCard
          label="Today's revenue"
          value={formatUSD(todaysRevenue)}
          hint="Gross, all order types"
          icon={<DollarSign className="h-4 w-4" strokeWidth={1.75} />}
          accent="forest"
        />
        <StatCard
          label="Pending"
          value={pending.length}
          hint={pending.length === 0 ? 'All clear' : 'Not yet delivered'}
          icon={<Clock className="h-4 w-4" strokeWidth={1.75} />}
          accent="amber"
        />
        <StatCard
          label="Avg order"
          value={formatUSD(avgOrder)}
          hint="Today's average ticket"
          icon={<TrendingUp className="h-4 w-4" strokeWidth={1.75} />}
          accent="blue"
        />
      </div>

      {/* Orders table */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-charcoal">Recent orders</h2>
          <p className="text-[12.5px] text-slate-500">
            {pending.length} pending · {orders.length - pending.length} delivered
          </p>
        </div>
        <OrdersTable orders={orders} />
      </div>
    </div>
  );
}

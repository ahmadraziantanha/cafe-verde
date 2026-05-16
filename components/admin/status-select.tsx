'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { updateOrderStatus } from '@/actions/update-order-status';
import { ORDER_STATUSES, type OrderStatus } from '@/lib/supabase/types';

const LABEL: Record<OrderStatus, string> = {
  new: 'New',
  preparing: 'Preparing',
  ready: 'Ready',
  delivered: 'Delivered',
};

export function StatusSelect({ orderId, initial }: { orderId: string; initial: OrderStatus }) {
  const [value, setValue] = useState<OrderStatus>(initial);
  const [pending, startTransition] = useTransition();

  function onChange(next: string) {
    const status = next as OrderStatus;
    setValue(status);
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, status);
      if (!res.ok) {
        toast.error(res.error ?? 'Could not update status.');
        setValue(initial);
      } else {
        toast.success(`Updated to ${LABEL[status]}`);
      }
    });
  }

  return (
    <Select value={value} onValueChange={onChange} disabled={pending}>
      <SelectTrigger className="w-[160px] h-9 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ORDER_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>{LABEL[s]}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

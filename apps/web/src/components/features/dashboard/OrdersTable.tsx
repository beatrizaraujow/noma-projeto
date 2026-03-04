'use client';

import React from 'react';
import { Badge } from '@/components/common';
import { MoreHorizontal, Download, Filter } from 'lucide-react';

interface Order {
  id: string;
  customer: string;
  order: string;
  cost: string;
  dueDate: string;
  deliveryStatus: 'Completed' | 'Pending' | 'Cancelled' | 'Processing';
  payment: string;
}

interface OrdersTableProps {
  orders?: Order[];
  title?: string;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({ 
  orders = defaultOrders,
  title = 'Orders List'
}) => {
  const getStatusVariant = (status: Order['deliveryStatus']) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Cancelled':
        return 'error';
      default:
        return 'info';
    }
  };

  return (
    <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-white text-lg font-semibold">{title}</h2>
          <Badge variant="info" size="sm">
            {orders.length} orders
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-[#25252b] rounded-lg transition-colors text-gray-400 hover:text-white">
            <Filter size={18} />
          </button>
          <button className="p-2 hover:bg-[#25252b] rounded-lg transition-colors text-gray-400 hover:text-white">
            <Download size={18} />
          </button>
          <button className="p-2 hover:bg-[#25252b] rounded-lg transition-colors text-gray-400 hover:text-white">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left py-3 px-4 text-gray-400 text-xs font-medium uppercase tracking-wider">
                Order ID
              </th>
              <th className="text-left py-3 px-4 text-gray-400 text-xs font-medium uppercase tracking-wider">
                Cliente
              </th>
              <th className="text-left py-3 px-4 text-gray-400 text-xs font-medium uppercase tracking-wider">
                Pedido
              </th>
              <th className="text-left py-3 px-4 text-gray-400 text-xs font-medium uppercase tracking-wider">
                Custo
              </th>
              <th className="text-left py-3 px-4 text-gray-400 text-xs font-medium uppercase tracking-wider">
                Data de Vencimento
              </th>
              <th className="text-left py-3 px-4 text-gray-400 text-xs font-medium uppercase tracking-wider">
                Status de Entrega
              </th>
              <th className="text-left py-3 px-4 text-gray-400 text-xs font-medium uppercase tracking-wider">
                Pagamento
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr 
                key={order.id}
                className="border-b border-gray-800 hover:bg-[#25252b] transition-colors"
              >
                <td className="py-4 px-4 text-white text-sm font-medium">
                  {order.id}
                </td>
                <td className="py-4 px-4 text-gray-300 text-sm">
                  {order.customer}
                </td>
                <td className="py-4 px-4 text-gray-300 text-sm">
                  {order.order}
                </td>
                <td className="py-4 px-4 text-white text-sm font-semibold">
                  {order.cost}
                </td>
                <td className="py-4 px-4 text-gray-400 text-sm">
                  {order.dueDate}
                </td>
                <td className="py-4 px-4">
                  <Badge variant={getStatusVariant(order.deliveryStatus)}>
                    {order.deliveryStatus}
                  </Badge>
                </td>
                <td className="py-4 px-4 text-gray-300 text-sm">
                  {order.payment}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const defaultOrders: Order[] = [
  {
    id: 'AM20281',
    customer: 'Olivera Kalman',
    order: 'Numeral 6-Digit',
    cost: '$4,65',
    dueDate: '01 Sep, 2024',
    deliveryStatus: 'Completed',
    payment: 'Credit Card'
  },
  {
    id: 'NXL20281',
    customer: 'Kenna Kennan',
    order: 'Male 6-Digit',
    cost: '$4,99',
    dueDate: '07 Sep, 2024',
    deliveryStatus: 'Pending',
    payment: 'Paypal'
  },
];

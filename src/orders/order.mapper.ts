import { Order } from '@prisma/client';

type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

function parseItems(items: Order['items']): OrderItem[] {
  return Array.isArray(items) ? (items as OrderItem[]) : [];
}

export function mapOrder(order: Order) {
  const items = parseItems(order.items);

  return {
    id: order.orderNumber,
    userId: order.userId,
    items,
    subtotal: order.subtotal,
    deliveryTotal: order.deliveryTotal,
    total: order.total,
    paymentMethod: order.paymentMethod,
    customer: {
      fullName: order.customerName,
      email: order.customerEmail,
      phone: order.customerPhone,
      address: order.customerAddress,
      city: order.customerCity,
      notes: order.customerNotes ?? '',
    },
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

export function mapOrderForAdmin(order: Order) {
  const mapped = mapOrder(order);
  const createdAt = order.createdAt;

  return {
    id: mapped.id,
    customer: mapped.customer.fullName,
    email: mapped.customer.email,
    phone: mapped.customer.phone,
    address: mapped.customer.address,
    city: mapped.customer.city,
    notes: mapped.customer.notes,
    total: mapped.total,
    subtotal: mapped.subtotal,
    deliveryTotal: mapped.deliveryTotal,
    items: mapped.items,
    itemCount: mapped.items.length,
    status: mapped.status,
    payment: mapped.paymentMethod,
    date: createdAt.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    createdAt: mapped.createdAt,
    updatedAt: mapped.updatedAt,
    userId: mapped.userId,
  };
}

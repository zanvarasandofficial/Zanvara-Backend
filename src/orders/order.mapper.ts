import { Order } from '@prisma/client';
import {
  getLineOnlineAdvanceAmount,
  getPaymentCollectionStatus,
  getPaymentRemaining,
  getRequiredOnlinePercent,
} from './order-payment.util';

type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  fulfillmentType?: string;
  expectedShipAt?: string | null;
  expectedShipNote?: string | null;
  deliveryOptionId?: string;
  deliveryLabel?: string;
  deliveryCharge?: number;
  deliveryEta?: string;
  onlinePaymentPercent?: number;
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
    onlinePaymentDue: order.onlinePaymentDue ?? 0,
    balanceOnDelivery: order.balanceOnDelivery ?? order.total,
    onlinePaymentReceived: order.onlinePaymentReceived ?? 0,
    onlinePaymentNote: order.onlinePaymentNote ?? '',
    onlinePaymentRecordedAt: order.onlinePaymentRecordedAt?.toISOString() ?? null,
    balancePaymentReceived: order.balancePaymentReceived ?? 0,
    balancePaymentNote: order.balancePaymentNote ?? '',
    balancePaymentRecordedAt: order.balancePaymentRecordedAt?.toISOString() ?? null,
    customer: {
      fullName: order.customerName,
      email: order.customerEmail,
      phone: order.customerPhone,
      address: order.customerAddress,
      city: order.customerCity,
      country: order.shippingCountry ?? '',
      notes: order.customerNotes ?? '',
    },
    status: order.status,
    fulfillmentKind: order.fulfillmentKind ?? 'standard',
    displayCurrency: order.displayCurrency ?? 'PKR',
    exchangeRate: order.exchangeRate ?? null,
    customerCountry: order.customerCountry ?? null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

function formatAdminDateTime(value: Date) {
  return value.toLocaleString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function mapAdminPaymentSummary(order: Order, mapped: ReturnType<typeof mapOrder>) {
  const onlinePaymentDue = mapped.onlinePaymentDue ?? 0;
  const onlinePaymentReceived = mapped.onlinePaymentReceived ?? 0;
  const balanceOnDelivery = mapped.balanceOnDelivery ?? 0;
  const balancePaymentReceived = mapped.balancePaymentReceived ?? 0;

  return {
    onlinePaymentDue,
    onlinePaymentReceived,
    onlinePaymentNote: mapped.onlinePaymentNote ?? '',
    onlinePaymentRecordedAt: mapped.onlinePaymentRecordedAt,
    onlinePaymentRemaining: getPaymentRemaining(
      onlinePaymentDue,
      onlinePaymentReceived,
    ),
    onlinePaymentPercentRequired: getRequiredOnlinePercent(
      onlinePaymentDue,
      mapped.total,
    ),
    onlinePaymentStatus: getPaymentCollectionStatus(
      onlinePaymentDue,
      onlinePaymentReceived,
    ),
    balanceOnDelivery,
    balancePaymentReceived,
    balancePaymentNote: mapped.balancePaymentNote ?? '',
    balancePaymentRecordedAt: mapped.balancePaymentRecordedAt,
    balancePaymentRemaining: getPaymentRemaining(
      balanceOnDelivery,
      balancePaymentReceived,
    ),
    balancePaymentStatus: getPaymentCollectionStatus(
      balanceOnDelivery,
      balancePaymentReceived,
    ),
    items: mapped.items.map((item) => ({
      ...item,
      onlineAdvanceAmount: getLineOnlineAdvanceAmount(item),
    })),
  };
}

export function mapOrderForAdmin(order: Order) {
  const mapped = mapOrder(order);
  const payment = mapAdminPaymentSummary(order, mapped);
  const createdAt = order.createdAt;
  const updatedAt = order.updatedAt;

  return {
    id: mapped.id,
    customer: mapped.customer.fullName,
    email: mapped.customer.email,
    phone: mapped.customer.phone,
    address: mapped.customer.address,
    city: mapped.customer.city,
    country: mapped.customer.country,
    notes: mapped.customer.notes,
    customerDetails: mapped.customer,
    total: mapped.total,
    subtotal: mapped.subtotal,
    deliveryTotal: mapped.deliveryTotal,
    onlinePaymentDue: payment.onlinePaymentDue,
    onlinePaymentReceived: payment.onlinePaymentReceived,
    onlinePaymentNote: payment.onlinePaymentNote,
    onlinePaymentRecordedAt: payment.onlinePaymentRecordedAt,
    onlinePaymentRemaining: payment.onlinePaymentRemaining,
    onlinePaymentPercentRequired: payment.onlinePaymentPercentRequired,
    onlinePaymentStatus: payment.onlinePaymentStatus,
    balanceOnDelivery: payment.balanceOnDelivery,
    balancePaymentReceived: payment.balancePaymentReceived,
    balancePaymentNote: payment.balancePaymentNote,
    balancePaymentRecordedAt: payment.balancePaymentRecordedAt,
    balancePaymentRemaining: payment.balancePaymentRemaining,
    balancePaymentStatus: payment.balancePaymentStatus,
    items: payment.items,
    itemCount: mapped.items.length,
    status: mapped.status,
    fulfillmentKind: mapped.fulfillmentKind,
    payment: mapped.paymentMethod,
    paymentMethod: mapped.paymentMethod,
    displayCurrency: mapped.displayCurrency,
    exchangeRate: mapped.exchangeRate,
    customerCountry: mapped.customerCountry,
    date: createdAt.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    createdAt: mapped.createdAt,
    updatedAt: mapped.updatedAt,
    createdAtDisplay: formatAdminDateTime(createdAt),
    updatedAtDisplay: formatAdminDateTime(updatedAt),
    userId: mapped.userId,
  };
}

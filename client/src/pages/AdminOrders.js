import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminOrders, updateOrderStatus } from '../redux/adminSlice';
import { ShoppingBag, Search, Filter, Calendar, CreditCard, Truck, CheckCircle, XCircle, FileText, Printer, X } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';
import { formatINR } from '../utils/currency';
import { getProductImage } from '../utils/productImage';
export const AdminOrders = () => {
  const dispatch = useDispatch();
  const {
    orders,
    loading
  } = useSelector(state => state.admin);

  // Local state for search, filter & pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Invoice Modal State
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  useEffect(() => {
    dispatch(fetchAdminOrders());
  }, [dispatch]);

  // Handle status update
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await dispatch(updateOrderStatus({
        orderId,
        orderStatus: newStatus
      })).unwrap();
      toast.success(`Order status updated to "${newStatus}"`);
    } catch (err) {
      toast.error(err || 'Failed to update order status');
    }
  };

  // Filter and search logic
  const filteredOrders = orders.filter(order => {
    const customerName = order.customer?.name?.toLowerCase() || '';
    const customerEmail = order.customer?.email?.toLowerCase() || '';
    const orderId = order._id?.toLowerCase() || '';
    const matchesSearch = customerName.includes(searchTerm.toLowerCase()) || customerEmail.includes(searchTerm.toLowerCase()) || orderId.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || order.orderStatus === statusFilter;
    const matchesPayment = paymentFilter === 'All' || order.paymentStatus === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Status badges color map
  const getStatusBadgeClass = status => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'shipped':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'processing':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'placed':
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-8"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    className: "text-3xl font-extrabold tracking-tight"
  }, "Order Fulfillment Center"), /*#__PURE__*/React.createElement("p", {
    className: "text-text-muted mt-2 font-semibold"
  }, "Track customer product orders, update shipping statuses, and print official order invoices.")), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-4 gap-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass-card bg-bg-primary p-5 rounded-2xl border border-border flex items-center gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-3 bg-primary/10 text-primary rounded-xl"
  }, /*#__PURE__*/React.createElement(ShoppingBag, {
    size: 20
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "text-[10px] font-black uppercase text-text-muted"
  }, "Total Orders"), /*#__PURE__*/React.createElement("p", {
    className: "text-2xl font-black text-text-main mt-0.5"
  }, orders.length))), /*#__PURE__*/React.createElement("div", {
    className: "glass-card bg-bg-primary p-5 rounded-2xl border border-border flex items-center gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-3 bg-amber-500/10 text-amber-500 rounded-xl"
  }, /*#__PURE__*/React.createElement(Truck, {
    size: 20
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "text-[10px] font-black uppercase text-text-muted"
  }, "Pending Delivery"), /*#__PURE__*/React.createElement("p", {
    className: "text-2xl font-black text-text-main mt-0.5"
  }, orders.filter(o => ['placed', 'processing', 'shipped'].includes(o.orderStatus)).length))), /*#__PURE__*/React.createElement("div", {
    className: "glass-card bg-bg-primary p-5 rounded-2xl border border-border flex items-center gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-3 bg-green-500/10 text-green-500 rounded-xl"
  }, /*#__PURE__*/React.createElement(CheckCircle, {
    size: 20
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "text-[10px] font-black uppercase text-text-muted"
  }, "Delivered"), /*#__PURE__*/React.createElement("p", {
    className: "text-2xl font-black text-text-main mt-0.5"
  }, orders.filter(o => o.orderStatus === 'delivered').length))), /*#__PURE__*/React.createElement("div", {
    className: "glass-card bg-bg-primary p-5 rounded-2xl border border-border flex items-center gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-3 bg-red-500/10 text-red-500 rounded-xl"
  }, /*#__PURE__*/React.createElement(XCircle, {
    size: 20
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "text-[10px] font-black uppercase text-text-muted"
  }, "Cancelled"), /*#__PURE__*/React.createElement("p", {
    className: "text-2xl font-black text-text-main mt-0.5"
  }, orders.filter(o => o.orderStatus === 'cancelled').length)))), /*#__PURE__*/React.createElement("div", {
    className: "glass-card bg-bg-primary p-5 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row md:items-center gap-4 justify-between"
  }, /*#__PURE__*/React.createElement("div", {
    className: "relative flex-1"
  }, /*#__PURE__*/React.createElement("span", {
    className: "absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted pointer-events-none"
  }, /*#__PURE__*/React.createElement(Search, {
    size: 14
  })), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Search by customer name, email, or Order ID...",
    value: searchTerm,
    onChange: e => {
      setSearchTerm(e.target.value);
      setCurrentPage(1);
    },
    className: "w-full bg-bg-secondary text-text-main text-xs pl-9 pr-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all font-semibold"
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 bg-bg-secondary border border-border px-3 py-2 rounded-xl text-xs font-semibold"
  }, /*#__PURE__*/React.createElement(Filter, {
    size: 12,
    className: "text-text-muted"
  }), /*#__PURE__*/React.createElement("select", {
    value: statusFilter,
    onChange: e => {
      setStatusFilter(e.target.value);
      setCurrentPage(1);
    },
    className: "bg-transparent focus:outline-none text-text-main cursor-pointer"
  }, /*#__PURE__*/React.createElement("option", {
    value: "All"
  }, "All Shipping States"), /*#__PURE__*/React.createElement("option", {
    value: "placed"
  }, "Placed"), /*#__PURE__*/React.createElement("option", {
    value: "processing"
  }, "Processing"), /*#__PURE__*/React.createElement("option", {
    value: "shipped"
  }, "Shipped"), /*#__PURE__*/React.createElement("option", {
    value: "delivered"
  }, "Delivered"), /*#__PURE__*/React.createElement("option", {
    value: "cancelled"
  }, "Cancelled"))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 bg-bg-secondary border border-border px-3 py-2 rounded-xl text-xs font-semibold"
  }, /*#__PURE__*/React.createElement(CreditCard, {
    size: 12,
    className: "text-text-muted"
  }), /*#__PURE__*/React.createElement("select", {
    value: paymentFilter,
    onChange: e => {
      setPaymentFilter(e.target.value);
      setCurrentPage(1);
    },
    className: "bg-transparent focus:outline-none text-text-main cursor-pointer"
  }, /*#__PURE__*/React.createElement("option", {
    value: "All"
  }, "All Payment States"), /*#__PURE__*/React.createElement("option", {
    value: "unpaid"
  }, "Unpaid"), /*#__PURE__*/React.createElement("option", {
    value: "paid"
  }, "Paid"), /*#__PURE__*/React.createElement("option", {
    value: "failed"
  }, "Failed"))))), /*#__PURE__*/React.createElement("div", {
    className: "glass-card bg-bg-primary rounded-2xl border border-border shadow-lg p-6"
  }, loading ? /*#__PURE__*/React.createElement(Skeleton.Table, {
    cols: 8,
    rows: 6
  }) : filteredOrders.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "text-center py-16"
  }, /*#__PURE__*/React.createElement(ShoppingBag, {
    size: 48,
    className: "mx-auto text-text-muted mb-4"
  }), /*#__PURE__*/React.createElement("h3", {
    className: "text-base font-extrabold text-text-main"
  }, "No Matches Located"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-text-muted mt-2 max-w-sm mx-auto font-semibold"
  }, "We couldn't find any orders matching your active search terms or filtering parameters.")) : /*#__PURE__*/React.createElement("div", {
    className: "overflow-x-auto w-full"
  }, /*#__PURE__*/React.createElement("table", {
    className: "w-full text-left border-collapse"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    className: "border-b border-border/80 text-xxs text-text-muted uppercase font-black tracking-wider"
  }, /*#__PURE__*/React.createElement("th", {
    className: "pb-3.5 pl-2"
  }, "Order Info"), /*#__PURE__*/React.createElement("th", {
    className: "pb-3.5"
  }, "Customer Details"), /*#__PURE__*/React.createElement("th", {
    className: "pb-3.5"
  }, "Grand Total"), /*#__PURE__*/React.createElement("th", {
    className: "pb-3.5"
  }, "Payment Method"), /*#__PURE__*/React.createElement("th", {
    className: "pb-3.5"
  }, "Payment Status"), /*#__PURE__*/React.createElement("th", {
    className: "pb-3.5"
  }, "Shipping Status"), /*#__PURE__*/React.createElement("th", {
    className: "pb-3.5 text-center"
  }, "Invoice & Details"), /*#__PURE__*/React.createElement("th", {
    className: "pb-3.5 text-right pr-4"
  }, "Order Date"))), /*#__PURE__*/React.createElement("tbody", {
    className: "divide-y divide-border/50 text-xs font-semibold"
  }, paginatedOrders.map(order => /*#__PURE__*/React.createElement("tr", {
    key: order._id,
    className: "hover:bg-bg-secondary/40 transition-colors"
  }, /*#__PURE__*/React.createElement("td", {
    className: "py-4 pl-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-text-main font-black block tracking-tight"
  }, "#", order._id.slice(-8).toUpperCase()), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-text-muted block mt-0.5 uppercase tracking-wide"
  }, order.items?.length || 0, " Products")), /*#__PURE__*/React.createElement("td", {
    className: "py-4"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-text-main font-extrabold block"
  }, order.customer?.name || 'Customer Account'), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-text-muted block mt-0.5"
  }, order.customer?.email)), /*#__PURE__*/React.createElement("td", {
    className: "py-4 font-black text-primary text-sm"
  }, formatINR(order.totals?.grandTotal || order.totalPrice || 0)), /*#__PURE__*/React.createElement("td", {
    className: "py-4"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-text-main uppercase font-bold text-[10px] bg-bg-secondary px-2.5 py-1 rounded border border-border"
  }, order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod === 'qr' ? 'UPI QR Proof' : 'Stripe Online')), /*#__PURE__*/React.createElement("td", {
    className: "py-4"
  }, /*#__PURE__*/React.createElement("span", {
    className: `inline-flex items-center text-[10px] font-black uppercase px-2 py-0.5 rounded ${order.paymentStatus === 'paid' ? 'bg-green-500/10 text-green-500' : order.paymentStatus === 'failed' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`
  }, order.paymentStatus || 'unpaid')), /*#__PURE__*/React.createElement("td", {
    className: "py-4"
  }, /*#__PURE__*/React.createElement("select", {
    value: order.orderStatus,
    onChange: e => handleStatusChange(order._id, e.target.value),
    className: `text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg border focus:outline-none cursor-pointer tracking-wider ${getStatusBadgeClass(order.orderStatus)}`
  }, /*#__PURE__*/React.createElement("option", {
    value: "placed"
  }, "Placed"), /*#__PURE__*/React.createElement("option", {
    value: "processing"
  }, "Processing"), /*#__PURE__*/React.createElement("option", {
    value: "shipped"
  }, "Shipped"), /*#__PURE__*/React.createElement("option", {
    value: "delivered"
  }, "Delivered"), /*#__PURE__*/React.createElement("option", {
    value: "cancelled"
  }, "Cancelled"))), /*#__PURE__*/React.createElement("td", {
    className: "py-4 text-center"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setSelectedOrder(order);
      setInvoiceModalOpen(true);
    },
    className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white text-xs font-black transition-all border border-primary/20 cursor-pointer"
  }, /*#__PURE__*/React.createElement(FileText, {
    size: 13
  }), " View Invoice")), /*#__PURE__*/React.createElement("td", {
    className: "py-4 text-right pr-4 text-[10px] text-text-muted"
  }, /*#__PURE__*/React.createElement("span", {
    className: "flex items-center justify-end gap-1"
  }, /*#__PURE__*/React.createElement(Calendar, {
    size: 12,
    className: "text-primary"
  }), new Date(order.createdAt).toLocaleDateString()))))))), totalPages > 1 && /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-end gap-2 pt-6 border-t border-border/50 mt-4"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-bold text-text-muted mr-3"
  }, "Page ", currentPage, " of ", totalPages), /*#__PURE__*/React.createElement("button", {
    onClick: () => setCurrentPage(prev => Math.max(1, prev - 1)),
    disabled: currentPage === 1,
    className: "px-3 py-1.5 bg-bg-secondary hover:bg-border text-text-muted hover:text-text-main border border-border rounded-xl text-xxs font-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
  }, "Previous"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setCurrentPage(prev => Math.min(totalPages, prev + 1)),
    disabled: currentPage === totalPages,
    className: "px-3 py-1.5 bg-bg-secondary hover:bg-border text-text-muted hover:text-text-main border border-border rounded-xl text-xxs font-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
  }, "Next"))), invoiceModalOpen && selectedOrder && /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 overflow-y-auto"
  }, /*#__PURE__*/React.createElement("div", {
    className: "printable-invoice bg-bg-primary rounded-3xl border border-border p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center pb-4 border-b border-border"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement(FileText, {
    size: 20,
    className: "text-primary"
  }), /*#__PURE__*/React.createElement("h3", {
    className: "text-lg font-extrabold text-text-main"
  }, "SparkCare Official Order Invoice")), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-text-muted font-semibold mt-0.5"
  }, "Order #", selectedOrder._id, " • Placed on ", selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString() : 'Today')), /*#__PURE__*/React.createElement("button", {
    onClick: () => setInvoiceModalOpen(false),
    className: "p-2 rounded-xl bg-bg-secondary hover:bg-border text-text-muted hover:text-text-main transition-all cursor-pointer"
  }, /*#__PURE__*/React.createElement(X, {
    size: 20
  }))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-4 p-4 rounded-2xl bg-bg-secondary/70 border border-border/60 text-xs font-semibold"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "text-[10px] font-black uppercase text-text-muted"
  }, "Customer Account"), /*#__PURE__*/React.createElement("p", {
    className: "font-extrabold text-text-main mt-1"
  }, selectedOrder.customer?.name || 'Guest Client'), /*#__PURE__*/React.createElement("p", {
    className: "text-text-muted"
  }, selectedOrder.customer?.email), /*#__PURE__*/React.createElement("p", {
    className: "text-text-muted"
  }, selectedOrder.customer?.phoneNumber || 'No phone recorded')), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "text-[10px] font-black uppercase text-text-muted"
  }, "Shipping Destination"), selectedOrder.shippingAddress ? /*#__PURE__*/React.createElement("p", {
    className: "font-bold text-text-main mt-1"
  }, selectedOrder.shippingAddress.street, ", ", selectedOrder.shippingAddress.city, ", ", selectedOrder.shippingAddress.state, " - ", selectedOrder.shippingAddress.zipCode) : /*#__PURE__*/React.createElement("p", {
    className: "text-text-muted mt-1"
  }, "Standard Delivery"))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-3"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-xs font-black uppercase tracking-wider text-text-muted"
  }, "Itemized Product Breakdown"), /*#__PURE__*/React.createElement("div", {
    className: "divide-y divide-border/60 border border-border rounded-2xl overflow-hidden bg-bg-secondary/40"
  }, (selectedOrder.items || selectedOrder.orderItems || []).map((item, idx) => {
    const productObj = typeof item.product === 'object' ? item.product : null;
    const name = productObj?.name || item.name || 'Electrical Hardware Product';
    const price = item.unitPrice || productObj?.price || item.price || 0;
    const qty = item.quantity || 1;
    return /*#__PURE__*/React.createElement("div", {
      key: idx,
      className: "p-3.5 flex justify-between items-center text-xs"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-3 min-w-0"
    }, /*#__PURE__*/React.createElement("img", {
      src: getProductImage(productObj || item),
      alt: name,
      className: "w-10 h-10 rounded-lg object-cover bg-bg-primary flex-shrink-0 border border-border"
    }), /*#__PURE__*/React.createElement("div", {
      className: "min-w-0"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "font-extrabold text-text-main truncate"
    }, name), /*#__PURE__*/React.createElement("p", {
      className: "text-[10px] text-text-muted"
    }, formatINR(price), " × ", qty))), /*#__PURE__*/React.createElement("span", {
      className: "font-black text-text-main shrink-0"
    }, formatINR(price * qty)));
  }))), /*#__PURE__*/React.createElement("div", {
    className: "p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-2 text-xs font-bold"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between text-text-muted"
  }, /*#__PURE__*/React.createElement("span", null, "Items Subtotal"), /*#__PURE__*/React.createElement("span", null, formatINR(selectedOrder.totals?.subtotal || selectedOrder.totalPrice || 0))), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between text-text-muted"
  }, /*#__PURE__*/React.createElement("span", null, "Configured Tax (8%)"), /*#__PURE__*/React.createElement("span", null, formatINR(selectedOrder.totals?.tax || 0))), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between text-text-muted"
  }, /*#__PURE__*/React.createElement("span", null, "Shipping Fee"), /*#__PURE__*/React.createElement("span", null, selectedOrder.totals?.shippingFee === 0 ? 'FREE' : formatINR(selectedOrder.totals?.shippingFee || 0))), selectedOrder.totals?.discount > 0 && /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between text-green-500"
  }, /*#__PURE__*/React.createElement("span", null, "Coupon Discount Applied"), /*#__PURE__*/React.createElement("span", null, "-", formatINR(selectedOrder.totals.discount))), /*#__PURE__*/React.createElement("div", {
    className: "pt-2 border-t border-primary/20 flex justify-between text-sm font-black text-text-main"
  }, /*#__PURE__*/React.createElement("span", null, "Grand Total Amount"), /*#__PURE__*/React.createElement("span", {
    className: "text-primary"
  }, formatINR(selectedOrder.totals?.grandTotal || selectedOrder.totalPrice || 0)))), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center pt-2 no-print"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-text-muted font-semibold"
  }, "SparkCare Enterprise Fulfillment • Official Invoice"), /*#__PURE__*/React.createElement("button", {
    onClick: () => window.print(),
    className: "px-5 py-2.5 bg-primary text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-2 hover:bg-primary-light cursor-pointer"
  }, /*#__PURE__*/React.createElement(Printer, {
    size: 16
  }), " Print Official Invoice")))));
};
export default AdminOrders;
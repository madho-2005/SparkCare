import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Wrench, User, Lock, Star, MapPin, Calendar, Upload, Printer, Heart, Tag, Copy, Eye, LogOut, Plus, Trash2, Package, Truck, ChevronRight, Sparkles, ArrowRight, X, FileText, Clock, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { formatINR } from '../utils/currency';
import { getProductImage } from '../utils/productImage';
import { logoutUser, updateUserInState } from '../redux/authSlice';
import { fetchWishlist, toggleWishlistProduct } from '../redux/wishlistSlice';
import { addToCart } from '../redux/cartSlice';
import { Skeleton } from '../components/ui/Skeleton';
const COUPON_GRADIENTS = [
  'from-blue-600 to-indigo-700',
  'from-emerald-600 to-teal-700',
  'from-amber-500 to-orange-600',
  'from-purple-600 to-pink-600'
];
export const UserAccountPage = () => {
  const {
    user
  } = useSelector(state => state.auth);
  const {
    wishlistProducts,
    loading: wishlistLoading
  } = useSelector(state => state.wishlist);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryTab = searchParams.get('tab');

  // Tab state: 'orders' | 'bookings' | 'wishlist' | 'coupons' | 'addresses' | 'recentlyViewed' | 'profile'
  const [tabState, setTabState] = useState('orders');
  const activeTab = queryTab || tabState;
  const setActiveTab = (tab) => setTabState(tab);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState('all');

  // Bookings State
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingFilter, setBookingFilter] = useState('all');

  // Coupons State
  const [coupons, setCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(true);
  const [couponsError, setCouponsError] = useState(null);

  // Addresses State
  const [savedAddresses, setSavedAddresses] = useState(() => user?.addresses || []);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    label: 'Home',
    isDefault: false
  });

  // Profile Form State
  const [profileForm, setProfileForm] = useState(() => ({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    street: user?.addresses?.[0]?.street || '',
    city: user?.addresses?.[0]?.city || '',
    state: user?.addresses?.[0]?.state || '',
    zipCode: user?.addresses?.[0]?.zipCode || ''
  }));
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Recently Viewed Products State — namespaced per user to prevent cross-account leakage
  const [recentlyViewed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`recentlyViewed_${user?._id || 'guest'}`) || '[]');
    } catch {
      return [];
    }
  });

  // QR Proof Upload Modal State
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrOrderId, setQrOrderId] = useState(null);
  const [qrScreenshot, setQrScreenshot] = useState(null);
  const [qrTxnId, setQrTxnId] = useState('');
  const [qrUploading, setQrUploading] = useState(false);

  // Order Details & Invoice Modal State
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Fetch Wishlist when wishlist tab opens
  useEffect(() => {
    if (activeTab === 'wishlist') {
      dispatch(fetchWishlist());
    }
  }, [activeTab, dispatch]);
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await api.get('/orders/my-orders');
      if (res.data?.data) {
        setOrders(res.data.data);
      }
    } catch {
      toast.error('Failed to load order history');
    } finally {
      setOrdersLoading(false);
    }
  };
  useEffect(() => {
    let isMounted = true;

    // Safe removal of obsolete fake/mock coupon keys from browser storage
    try {
      localStorage.removeItem('sparkcare_demo_coupons');
      localStorage.removeItem('mockCoupons');
      localStorage.removeItem('fakeCoupons');
      localStorage.removeItem('coupons_cache');
      sessionStorage.removeItem('sparkcare_demo_coupons');
    } catch {
      // Ignore storage access errors
    }

    const loadData = async () => {
      setOrdersLoading(true);
      setBookingsLoading(true);
      setCouponsLoading(true);
      setCouponsError(null);
      try {
        const [ordersRes, bookingsRes, couponsRes] = await Promise.allSettled([
          api.get('/orders/my-orders'),
          api.get('/bookings'),
          api.get('/coupons')
        ]);
        if (isMounted) {
          // Orders: server field is 'customer'
          if (ordersRes.status === 'fulfilled') {
            const rawOrders = ordersRes.value?.data?.data;
            if (rawOrders) {
              const arr = Array.isArray(rawOrders) ? rawOrders : [];
              setOrders(arr);
            }
          }
          // Bookings: server field is 'customer'
          if (bookingsRes.status === 'fulfilled') {
            const rawBookings = bookingsRes.value?.data?.data;
            if (rawBookings) {
              const arr = Array.isArray(rawBookings) ? rawBookings : [];
              setBookings(arr);
            }
          }
          // Active Coupons from database
          if (couponsRes.status === 'fulfilled') {
            const rawCoupons = couponsRes.value?.data?.data;
            if (rawCoupons) {
              const arr = Array.isArray(rawCoupons) ? rawCoupons : [];
              setCoupons(arr);
              setCouponsError(null);
            }
          } else {
            setCouponsError('Unable to load coupons. Please try again.');
          }
        }
      } catch {
        if (isMounted) {
          setCouponsError('Unable to load coupons. Please try again.');
        }
      } finally {
        if (isMounted) {
          setOrdersLoading(false);
          setBookingsLoading(false);
          setCouponsLoading(false);
        }
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    try {
      // Clear per-user recently viewed data before logging out so the next user won't see it
      if (user?._id) {
        localStorage.removeItem(`recentlyViewed_${user._id}`);
      }
      // Also clear the old shared key for backward compatibility
      localStorage.removeItem('recentlyViewed');

      await dispatch(logoutUser());
      toast.success('Successfully logged out');
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  // Copy coupon code to clipboard
  const handleCopyCoupon = code => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon "${code}" copied to clipboard!`);
  };

  // Save profile updates
  const handleSaveProfile = async e => {
    e.preventDefault();
    if (!profileForm.name || !profileForm.phoneNumber) {
      toast.error('Name and Phone Number are required');
      return;
    }
    setProfileSaving(true);
    try {
      const payload = {
        name: profileForm.name,
        phoneNumber: profileForm.phoneNumber,
        addresses: [{
          street: profileForm.street,
          city: profileForm.city,
          state: profileForm.state,
          zipCode: profileForm.zipCode,
          isDefault: true
        }]
      };
      const res = await api.patch('/auth/profile', payload);
      const updatedUser = res.data?.data?.user || payload;
      dispatch(updateUserInState(updatedUser));
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  // Save password updates
  const handleSavePassword = async e => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('Please enter your current and new password');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setPasswordSaving(true);
    try {
      await api.patch('/auth/profile', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed');
    } finally {
      setPasswordSaving(false);
    }
  };

  // Add New Saved Address
  const handleAddAddress = async e => {
    e.preventDefault();
    if (!addressForm.street || !addressForm.city || !addressForm.zipCode) {
      toast.error('Street, City, and Zip Code are required');
      return;
    }
    const newAddrs = [...savedAddresses, addressForm];
    setSavedAddresses(newAddrs);
    setAddressModalOpen(false);
    try {
      await api.patch('/auth/profile', {
        addresses: newAddrs
      });
      dispatch(updateUserInState({
        addresses: newAddrs
      }));
      toast.success('New address added successfully!');
      setAddressForm({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        label: 'Home',
        isDefault: false
      });
    } catch {
      toast.error('Failed to save address to cloud server');
    }
  };

  // Delete Address
  const handleDeleteAddress = async index => {
    const updated = savedAddresses.filter((_, i) => i !== index);
    setSavedAddresses(updated);
    try {
      await api.patch('/auth/profile', {
        addresses: updated
      });
      dispatch(updateUserInState({
        addresses: updated
      }));
      toast.success('Address removed');
    } catch {
      toast.error('Failed to update addresses');
    }
  };

  // QR Proof File Upload
  const handleQrUploadSubmit = async e => {
    e.preventDefault();
    if (!qrScreenshot) {
      toast.error('Please attach a screenshot of your transaction receipt');
      return;
    }
    setQrUploading(true);
    const formData = new FormData();
    formData.append('screenshot', qrScreenshot);
    if (qrTxnId) formData.append('transactionId', qrTxnId);
    try {
      await api.post(`/orders/${qrOrderId}/pay-qr`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Payment proof uploaded successfully! Under admin review.');
      setQrModalOpen(false);
      setQrScreenshot(null);
      setQrTxnId('');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload QR receipt');
    } finally {
      setQrUploading(false);
    }
  };

  // Submit Review
  const handleSubmitReview = async e => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      toast.error('Please type a short review message');
      return;
    }
    setReviewSubmitting(true);
    try {
      if (reviewTarget.type === 'product') {
        await api.post(`/products/${reviewTarget.id}/reviews`, {
          rating: reviewRating,
          comment: reviewComment
        });
      } else {
        await api.post(`/services/${reviewTarget.id}/reviews`, {
          rating: reviewRating,
          comment: reviewComment
        });
      }
      toast.success('Thank you! Your verified review has been published.');
      setReviewModalOpen(false);
      setReviewComment('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Review submission failed');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Filtered Orders array normalization
  const normalizedOrders = (Array.isArray(orders) ? orders : []).map(o => {
    if (typeof o === 'string') {
      return {
        _id: o,
        orderStatus: 'placed',
        paymentMethod: 'cod',
        paymentStatus: 'unpaid',
        totals: {
          grandTotal: 0
        },
        items: [],
        createdAt: new Date().toISOString()
      };
    }
    return o;
  });
  const filteredOrders = normalizedOrders.filter(o => {
    if (!o) return false;
    if (orderFilter === 'all') return true;
    const status = (o.orderStatus || '').toLowerCase();
    const payStatus = (o.paymentStatus || o.paymentInfo?.status || '').toLowerCase();
    const filter = orderFilter.toLowerCase();
    return status === filter || payStatus === filter || status.includes(filter);
  });

  // Filtered Bookings
  const filteredBookings = (Array.isArray(bookings) ? bookings : []).filter(b => {
    if (!b) return false;
    if (bookingFilter === 'all') return true;
    const status = (b.bookingStatus || b.status || '').toLowerCase();
    const filter = bookingFilter.toLowerCase();
    return status === filter || status.includes(filter);
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "py-10 bg-bg-secondary min-h-screen relative overflow-hidden"
  }, /*#__PURE__*/React.createElement("div", {
    className: "absolute top-10 left-[-5%] w-[450px] h-[450px] rounded-full bg-primary/5 blur-[120px] pointer-events-none"
  }), /*#__PURE__*/React.createElement("div", {
    className: "absolute bottom-20 right-[-5%] w-[450px] h-[450px] rounded-full bg-secondary/5 blur-[120px] pointer-events-none"
  }), /*#__PURE__*/React.createElement("div", {
    className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass-card bg-bg-primary rounded-3xl p-6 sm:p-8 border border-border shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-2xl font-extrabold shadow-lg shadow-primary/20 flex-shrink-0"
  }, user?.name ? user.name.charAt(0).toUpperCase() : 'U'), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "text-2xl sm:text-3xl font-extrabold tracking-tight text-text-main"
  }, user?.name || 'SparkCare Member'), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
  }, user?.role || 'Customer')), /*#__PURE__*/React.createElement("p", {
    className: "text-xs sm:text-sm font-semibold text-text-muted mt-1 flex items-center gap-3"
  }, /*#__PURE__*/React.createElement("span", null, "📧 ", user?.email), user?.phoneNumber && /*#__PURE__*/React.createElement("span", null, "• 📞 ", user.phoneNumber)))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3 self-stretch md:self-auto justify-end"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleLogout,
    className: "px-5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all text-xs font-extrabold flex items-center gap-2 border border-red-500/20 shadow-sm cursor-pointer active:scale-95"
  }, /*#__PURE__*/React.createElement(LogOut, {
    size: 16
  }), " Sign Out"))), /*#__PURE__*/React.createElement("div", {
    className: "grid lg:grid-cols-4 gap-8 items-start"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lg:col-span-1 glass-card p-4 rounded-3xl border border-border shadow-md space-y-2 sticky top-24"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-[10px] font-black text-text-muted uppercase tracking-widest px-4 py-2"
  }, "Dashboard Navigation"), [{
    id: 'orders',
    label: 'Order Tracking & History',
    icon: Package,
    badge: normalizedOrders.length
  }, {
    id: 'bookings',
    label: 'Service Bookings',
    icon: Wrench,
    badge: bookings.length
  }, {
    id: 'wishlist',
    label: 'Saved Wishlist',
    icon: Heart,
    badge: wishlistProducts.length
  }, {
    id: 'coupons',
    label: 'Coupons & Offers',
    icon: Tag,
    badge: coupons.length
  }, {
    id: 'addresses',
    label: 'Saved Addresses',
    icon: MapPin,
    badge: savedAddresses.length
  }, {
    id: 'recentlyViewed',
    label: 'Recently Viewed',
    icon: Eye,
    badge: recentlyViewed.length
  }, {
    id: 'profile',
    label: 'Profile & Security',
    icon: User
  }].map(tab => {
    const Icon = tab.icon;
    const isActive = activeTab === tab.id;
    return /*#__PURE__*/React.createElement("button", {
      key: tab.id,
      onClick: () => setActiveTab(tab.id),
      className: `w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-extrabold transition-all border ${isActive ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' : 'bg-transparent text-text-muted hover:text-text-main hover:bg-bg-secondary border-transparent'}`
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-3"
    }, /*#__PURE__*/React.createElement(Icon, {
      size: 16
    }), /*#__PURE__*/React.createElement("span", null, tab.label)), tab.badge !== undefined && tab.badge > 0 && /*#__PURE__*/React.createElement("span", {
      className: `text-[10px] font-black px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-bg-secondary text-primary border border-border'}`
    }, tab.badge));
  }), /*#__PURE__*/React.createElement("div", {
    className: "pt-4 border-t border-border/60 mt-4"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleLogout,
    className: "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-black text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white transition-all border border-red-500/20 cursor-pointer"
  }, /*#__PURE__*/React.createElement(LogOut, {
    size: 16
  }), " Sign Out of Account"))), /*#__PURE__*/React.createElement("div", {
    className: "lg:col-span-3 space-y-6"
  }, activeTab === 'orders' && /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-xl font-extrabold text-text-main tracking-tight flex items-center gap-2"
  }, /*#__PURE__*/React.createElement(Package, {
    size: 20,
    className: "text-primary"
  }), " Orders & Real-Time Tracking"), /*#__PURE__*/React.createElement("p", {
    className: "text-text-muted text-xs font-semibold mt-1"
  }, "View full product items, live shipping progress, or print detailed order invoices.")), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1.5 flex-wrap"
  }, ['all', 'placed', 'processing', 'shipped', 'delivered'].map(f => /*#__PURE__*/React.createElement("button", {
    key: f,
    onClick: () => setOrderFilter(f),
    className: `px-3 py-1.5 rounded-xl text-[10px] font-black transition-all border capitalize ${orderFilter === f ? 'bg-primary text-white border-primary' : 'bg-bg-primary text-text-muted hover:text-text-main border-border'}`
  }, f)))), ordersLoading ? /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement(Skeleton.Card, null), /*#__PURE__*/React.createElement(Skeleton.Card, null)) : filteredOrders.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "text-center py-16 glass-card rounded-3xl border border-border"
  }, /*#__PURE__*/React.createElement(ShoppingBag, {
    size: 44,
    className: "mx-auto text-text-muted mb-3"
  }), /*#__PURE__*/React.createElement("h3", {
    className: "text-base font-bold text-text-main"
  }, "No Orders Found"), /*#__PURE__*/React.createElement("p", {
    className: "text-text-muted text-xs mt-1"
  }, "You haven't placed any orders matching this filter yet."), /*#__PURE__*/React.createElement(Link, {
    to: "/products",
    className: "mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md"
  }, "Browse E-Store ", /*#__PURE__*/React.createElement(ArrowRight, {
    size: 14
  }))) : /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, filteredOrders.map(order => {
    const orderId = order._id || order.id || 'ORDER';
    const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) : 'Recent';
    const orderStatusStr = (order.orderStatus || 'placed').toLowerCase();
    const trackingSteps = ['Placed', 'Processing', 'Dispatched', 'Delivered'];
    const currentStatusIndex = orderStatusStr === 'delivered' ? 3 : orderStatusStr === 'shipped' || orderStatusStr === 'dispatched' ? 2 : orderStatusStr === 'processing' ? 1 : 0;
    const grandTotal = order.totals?.grandTotal || order.totalPrice || order.grandTotal || 0;
    const itemsList = order.items || order.orderItems || [];
    const payMethod = (order.paymentMethod || order.paymentInfo?.method || 'COD').toUpperCase();
    const payStatus = (order.paymentStatus || order.paymentInfo?.status || 'unpaid').toUpperCase();
    return /*#__PURE__*/React.createElement("div", {
      key: orderId,
      className: "glass-card bg-bg-primary rounded-3xl p-6 border border-border shadow-md space-y-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-border/60 gap-4"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-xs font-black text-primary uppercase"
    }, "Order ID:"), /*#__PURE__*/React.createElement("span", {
      className: "text-xs font-mono font-bold text-text-main"
    }, "#", orderId.slice(-8)), /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20"
    }, "TRK-", orderId.slice(-6).toUpperCase())), /*#__PURE__*/React.createElement("p", {
      className: "text-[11px] text-text-muted font-semibold mt-1"
    }, "Placed on ", orderDate)), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-3"
    }, /*#__PURE__*/React.createElement("span", {
      className: `text-[10px] font-black uppercase px-3 py-1 rounded-full border ${orderStatusStr === 'delivered' ? 'bg-green-500/10 text-green-500 border-green-500/20' : orderStatusStr === 'shipped' || orderStatusStr === 'dispatched' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`
    }, orderStatusStr), /*#__PURE__*/React.createElement("span", {
      className: "text-base font-black text-text-main"
    }, formatINR(grandTotal)))), /*#__PURE__*/React.createElement("div", {
      className: "bg-bg-secondary p-4 sm:p-5 rounded-2xl border border-border/70 space-y-3"
    }, /*#__PURE__*/React.createElement("p", {
      className: "text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1.5"
    }, /*#__PURE__*/React.createElement(Truck, {
      size: 14,
      className: "text-primary"
    }), " Live Order Tracking Status"), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-4 gap-2 relative pt-2"
    }, trackingSteps.map((stepName, idx) => {
      const isDone = idx <= currentStatusIndex;
      const isCurrent = idx === currentStatusIndex;
      return /*#__PURE__*/React.createElement("div", {
        key: stepName,
        className: "flex flex-col items-center text-center relative z-10"
      }, /*#__PURE__*/React.createElement("div", {
        className: `w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${isDone ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-bg-primary text-text-muted border border-border'} ${isCurrent ? 'ring-4 ring-primary/20 scale-110' : ''}`
      }, isDone ? '✓' : idx + 1), /*#__PURE__*/React.createElement("span", {
        className: `text-[9px] sm:text-[10px] font-bold mt-2 leading-tight ${isCurrent ? 'text-primary font-black' : isDone ? 'text-text-main' : 'text-text-muted'}`
      }, stepName));
    }))), /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, /*#__PURE__*/React.createElement("p", {
      className: "text-[10px] font-black text-text-muted uppercase tracking-widest"
    }, "Ordered Products (", itemsList.length, ")"), itemsList.map((item, idx) => {
      const productObj = typeof item.product === 'object' ? item.product : null;
      const productId = productObj?._id || item.product || item._id;
      const name = productObj?.name || item.name || 'Electrical Item';
      const price = item.unitPrice || productObj?.price || item.price || 0;
      const qty = item.quantity || 1;
      const itemImage = getProductImage(productObj || item);
      const brand = productObj?.brand || productObj?.category || 'Certified';
      return /*#__PURE__*/React.createElement("div", {
        key: idx,
        className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-2xl bg-bg-secondary/60 border border-border/50"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-3 min-w-0"
      }, /*#__PURE__*/React.createElement("img", {
        src: itemImage,
        alt: name,
        className: "w-14 h-14 rounded-xl object-cover bg-bg-primary border border-border flex-shrink-0"
      }), /*#__PURE__*/React.createElement("div", {
        className: "min-w-0"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-2"
      }, /*#__PURE__*/React.createElement("h4", {
        className: "text-xs font-extrabold text-text-main truncate"
      }, name), /*#__PURE__*/React.createElement("span", {
        className: "text-[9px] font-black uppercase bg-primary/10 text-primary px-2 py-0.5 rounded"
      }, brand)), /*#__PURE__*/React.createElement("p", {
        className: "text-[11px] text-text-muted font-semibold mt-1"
      }, "Quantity: ", /*#__PURE__*/React.createElement("strong", {
        className: "text-text-main"
      }, qty), " × ", formatINR(price)))), /*#__PURE__*/React.createElement("div", {
        className: "flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/40"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-xs font-black text-text-main"
      }, formatINR(price * qty)), productId && /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-2"
      }, /*#__PURE__*/React.createElement(Link, {
        to: `/products/${productId}`,
        className: "px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white text-[10px] font-black transition-all flex items-center gap-1 border border-primary/20"
      }, /*#__PURE__*/React.createElement(Eye, {
        size: 12
      }), " View"), /*#__PURE__*/React.createElement("button", {
        onClick: () => {
          setReviewTarget({ type: 'product', id: productId });
          setReviewModalOpen(true);
        },
        className: "px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white text-[10px] font-black transition-all flex items-center gap-1 border border-amber-500/20 cursor-pointer"
      }, /*#__PURE__*/React.createElement(Star, {
        size: 12
      }), " Review"))));
    })), /*#__PURE__*/React.createElement("div", {
      className: "flex flex-wrap items-center justify-between pt-4 border-t border-border/60 gap-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-xs font-semibold text-text-muted space-y-0.5"
    }, /*#__PURE__*/React.createElement("div", null, "Payment Method: ", /*#__PURE__*/React.createElement("strong", {
      className: "text-text-main font-black"
    }, payMethod), " (", payStatus, ")"), order.shippingAddress && /*#__PURE__*/React.createElement("div", {
      className: "text-[10px]"
    }, "📍 Deliver to: ", order.shippingAddress.street, ", ", order.shippingAddress.city)), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2"
    }, payMethod === 'QR' && payStatus !== 'PAID' && /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        setQrOrderId(orderId);
        setQrModalOpen(true);
      },
      className: "px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
    }, /*#__PURE__*/React.createElement(Upload, {
      size: 14
    }), " Upload QR Screenshot"), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        setSelectedInvoiceOrder(order);
        setInvoiceModalOpen(true);
      },
      className: "px-4 py-2 rounded-xl bg-primary text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-primary/20 hover:bg-primary-light active:scale-95 transition-all cursor-pointer"
    }, /*#__PURE__*/React.createElement(FileText, {
      size: 14
    }), " View Order Details & Invoice"))));
  }))), activeTab === 'bookings' && /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-xl font-extrabold text-text-main tracking-tight flex items-center gap-2"
  }, /*#__PURE__*/React.createElement(Wrench, {
    size: 20,
    className: "text-primary"
  }), " Electrician Service Bookings"), /*#__PURE__*/React.createElement("p", {
    className: "text-text-muted text-xs font-semibold mt-1"
  }, "Manage your scheduled home electrician appointments and service statuses.")), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1.5 flex-wrap"
  }, ['all', 'pending_assignment', 'scheduled', 'completed', 'cancelled'].map(f => /*#__PURE__*/React.createElement("button", {
    key: f,
    onClick: () => setBookingFilter(f),
    className: `px-3 py-1.5 rounded-xl text-[10px] font-black transition-all border capitalize ${bookingFilter === f ? 'bg-primary text-white border-primary' : 'bg-bg-primary text-text-muted hover:text-text-main border-border'}`
  }, f.replace('_', ' '))))), bookingsLoading ? /*#__PURE__*/React.createElement(Skeleton.Card, null) : filteredBookings.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "text-center py-16 glass-card rounded-3xl border border-border"
  }, /*#__PURE__*/React.createElement(Wrench, {
    size: 44,
    className: "mx-auto text-text-muted mb-3"
  }), /*#__PURE__*/React.createElement("h3", {
    className: "text-base font-bold text-text-main"
  }, "No Service Bookings"), /*#__PURE__*/React.createElement("p", {
    className: "text-text-muted text-xs mt-1"
  }, "You haven't scheduled any electrical services yet."), /*#__PURE__*/React.createElement(Link, {
    to: "/services",
    className: "mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md"
  }, "Browse Services ", /*#__PURE__*/React.createElement(ArrowRight, {
    size: 14
  }))) : /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 gap-6"
  }, filteredBookings.map(b => {
    const serviceObj = typeof b.service === 'object' ? b.service : null;
    const serviceTitle = serviceObj?.title || serviceObj?.name || 'Electrical Service';
    const statusStr = b.bookingStatus || b.status || 'scheduled';
    return /*#__PURE__*/React.createElement("div", {
      key: b._id,
      className: "glass-card bg-bg-primary rounded-3xl p-6 border border-border shadow-md flex flex-col justify-between space-y-4"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "flex items-start justify-between gap-3"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] font-black uppercase text-primary bg-primary/10 px-2.5 py-0.5 rounded border border-primary/20"
    }, serviceObj?.category || 'Electrical'), /*#__PURE__*/React.createElement("h3", {
      className: "text-base font-black text-text-main mt-2"
    }, serviceTitle)), /*#__PURE__*/React.createElement("span", {
      className: `text-[10px] font-black uppercase px-3 py-1 rounded-full border ${statusStr === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : statusStr === 'scheduled' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`
    }, statusStr.replace('_', ' '))), /*#__PURE__*/React.createElement("div", {
      className: "mt-4 space-y-2 text-xs font-semibold text-text-muted bg-bg-secondary p-3 rounded-2xl border border-border/50"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2"
    }, /*#__PURE__*/React.createElement(Calendar, {
      size: 14,
      className: "text-primary"
    }), /*#__PURE__*/React.createElement("span", null, "Date: ", /*#__PURE__*/React.createElement("strong", null, b.scheduledDate ? new Date(b.scheduledDate).toLocaleDateString() : 'TBD'))), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2"
    }, /*#__PURE__*/React.createElement(Clock, {
      size: 14,
      className: "text-primary"
    }), /*#__PURE__*/React.createElement("span", null, "Slot: ", /*#__PURE__*/React.createElement("strong", null, b.timeSlot || '08:00 - 11:00'))), b.address && /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2"
    }, /*#__PURE__*/React.createElement(MapPin, {
      size: 14,
      className: "text-primary"
    }), /*#__PURE__*/React.createElement("span", {
      className: "truncate"
    }, "Address: ", b.address.street, ", ", b.address.city)))), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between pt-3 border-t border-border/60"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
      className: "text-[10px] text-text-muted font-bold"
    }, "Service Fee"), /*#__PURE__*/React.createElement("p", {
      className: "text-base font-black text-text-main"
    }, formatINR(b.totalPrice || 0))), /*#__PURE__*/React.createElement(Link, {
      to: "/services",
      className: "px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white text-xs font-extrabold transition-all border border-primary/20"
    }, "Book Another Service")));
  }))), activeTab === 'wishlist' && /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-xl font-extrabold text-text-main tracking-tight flex items-center gap-2"
  }, /*#__PURE__*/React.createElement(Heart, {
    size: 20,
    className: "text-primary"
  }), " Your Saved Wishlist"), /*#__PURE__*/React.createElement("p", {
    className: "text-text-muted text-xs font-semibold mt-1"
  }, "Keep track of items you want to buy later or move directly to cart.")), wishlistLoading ? /*#__PURE__*/React.createElement(Skeleton.Card, null) : (Array.isArray(wishlistProducts) ? wishlistProducts : []).length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "text-center py-16 glass-card rounded-3xl border border-border"
  }, /*#__PURE__*/React.createElement(Heart, {
    size: 44,
    className: "mx-auto text-text-muted mb-3"
  }), /*#__PURE__*/React.createElement("h3", {
    className: "text-base font-bold text-text-main"
  }, "Your Wishlist is Empty"), /*#__PURE__*/React.createElement("p", {
    className: "text-text-muted text-xs mt-1"
  }, "Explore our e-store catalog to save your favorite products."), /*#__PURE__*/React.createElement(Link, {
    to: "/products",
    className: "mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md"
  }, "Explore Products ", /*#__PURE__*/React.createElement(ArrowRight, {
    size: 14
  }))) : /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
  }, (Array.isArray(wishlistProducts) ? wishlistProducts : []).map(p => /*#__PURE__*/React.createElement("div", {
    key: p._id,
    className: "glass-card bg-bg-primary rounded-3xl p-4 border border-border shadow-md flex flex-col justify-between group"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "h-40 rounded-2xl overflow-hidden bg-bg-secondary relative mb-3"
  }, /*#__PURE__*/React.createElement("img", {
    src: getProductImage(p),
    alt: p.name,
    className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
  }), /*#__PURE__*/React.createElement("span", {
    className: "absolute bottom-2 left-2 bg-primary/90 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow"
  }, p.brand || p.category), /*#__PURE__*/React.createElement("button", {
    onClick: () => dispatch(toggleWishlistProduct(p._id)),
    className: "absolute top-2 right-2 p-2 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
  }, /*#__PURE__*/React.createElement(Trash2, {
    size: 14
  }))), /*#__PURE__*/React.createElement("h4", {
    className: "text-xs font-extrabold text-text-main line-clamp-1"
  }, p.name), /*#__PURE__*/React.createElement("p", {
    className: "text-sm font-black text-text-main mt-1"
  }, formatINR(p.price))), /*#__PURE__*/React.createElement("div", {
    className: "pt-3 mt-3 border-t border-border/60 flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      dispatch(addToCart({
        product: p._id,
        name: p.name,
        price: p.price,
        image: getProductImage(p),
        stock: p.stockCount || 10,
        quantity: 1
      }));
      toast.success(`Added "${p.name}" to cart`);
    },
    className: "flex-1 py-2 rounded-xl bg-primary text-white text-xs font-extrabold flex items-center justify-center gap-1 shadow-sm"
  }, /*#__PURE__*/React.createElement(ShoppingBag, {
    size: 14
  }), " Add to Cart"), /*#__PURE__*/React.createElement(Link, {
    to: `/products/${p._id}`,
    className: "p-2 rounded-xl bg-bg-secondary hover:bg-border text-text-main transition-all border border-border"
  }, /*#__PURE__*/React.createElement(Eye, {
    size: 16
  }))))))),
  activeTab === 'coupons' && /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-xl font-extrabold text-text-main tracking-tight flex items-center gap-2"
  }, /*#__PURE__*/React.createElement(Tag, {
    size: 20,
    className: "text-primary"
  }), " Active Promotional Coupons & Vouchers"), /*#__PURE__*/React.createElement("p", {
    className: "text-text-muted text-xs font-semibold mt-1"
  }, "Copy any promo code below to apply instant discounts during checkout.")), couponsLoading ? /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-xs font-semibold text-text-muted animate-pulse"
  }, "Loading available coupons..."), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 gap-6"
  }, [1, 2].map(i => /*#__PURE__*/React.createElement(Skeleton, {
    key: i,
    className: "h-48 rounded-3xl"
  })))) : couponsError ? /*#__PURE__*/React.createElement("div", {
    className: "text-center py-16 glass-card rounded-3xl border border-red-500/20 bg-red-500/5"
  }, /*#__PURE__*/React.createElement(AlertTriangle, {
    size: 44,
    className: "mx-auto text-red-500 mb-3"
  }), /*#__PURE__*/React.createElement("h3", {
    className: "text-base font-bold text-text-main"
  }, "Unable to load coupons. Please try again."), /*#__PURE__*/React.createElement("p", {
    className: "text-text-muted text-xs mt-1"
  }, "Please check your connection or refresh the page.")) : coupons.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "text-center py-16 glass-card rounded-3xl border border-border"
  }, /*#__PURE__*/React.createElement(Tag, {
    size: 44,
    className: "mx-auto text-text-muted mb-3"
  }), /*#__PURE__*/React.createElement("h3", {
    className: "text-base font-bold text-text-main"
  }, "No coupons available right now."), /*#__PURE__*/React.createElement("p", {
    className: "text-text-muted text-xs mt-1"
  }, "Check back later for new offers.")) : /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 gap-6"
  }, coupons.map((coupon, idx) => {
    const bgGradient = COUPON_GRADIENTS[idx % COUPON_GRADIENTS.length];
    const discountText = coupon.discountType === 'percentage'
      ? `${coupon.discountValue}% OFF`
      : `${formatINR(coupon.discountValue)} OFF`;

    const validTillText = coupon.expiryDate
      ? new Date(coupon.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'No Expiry';

    const minSpend = coupon.minPurchaseAmount || 0;
    const cardTitle = coupon.description || (coupon.discountType === 'percentage' ? `${coupon.discountValue}% Off Promo Offer` : `Flat ₹${coupon.discountValue} Discount`);

    return /*#__PURE__*/React.createElement("div", {
      key: coupon._id,
      className: `rounded-3xl p-6 bg-gradient-to-br ${bgGradient} text-white shadow-xl relative overflow-hidden flex flex-col justify-between space-y-4`
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-start"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20"
    }, "Active Offer"), /*#__PURE__*/React.createElement("h3", {
      className: "text-2xl font-black mt-2 tracking-tight"
    }, discountText), /*#__PURE__*/React.createElement("h4", {
      className: "text-xs font-bold opacity-90 mt-1"
    }, cardTitle)), /*#__PURE__*/React.createElement(Sparkles, {
      size: 24,
      className: "text-white/40"
    })), /*#__PURE__*/React.createElement("p", {
      className: "text-xs font-medium opacity-90 leading-relaxed"
    }, `Apply code "${coupon.code}" at checkout on qualifying items.`), /*#__PURE__*/React.createElement("div", {
      className: "pt-4 border-t border-white/20 flex items-center justify-between"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-[10px] opacity-80 font-bold"
    }, /*#__PURE__*/React.createElement("span", null, "Min Spend: ", formatINR(minSpend)), " \u2022 ", /*#__PURE__*/React.createElement("span", null, "Expires: ", validTillText)), /*#__PURE__*/React.createElement("button", {
      onClick: () => handleCopyCoupon(coupon.code),
      className: "px-3.5 py-1.5 rounded-xl bg-white text-slate-900 font-black text-xs hover:bg-slate-100 transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
    }, /*#__PURE__*/React.createElement(Copy, {
      size: 13
    }), " ", coupon.code)));
  }))),
  activeTab === 'addresses' && /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-xl font-extrabold text-text-main tracking-tight flex items-center gap-2"
  }, /*#__PURE__*/React.createElement(MapPin, {
    size: 20,
    className: "text-primary"
  }), " Saved Delivery Addresses"), /*#__PURE__*/React.createElement("p", {
    className: "text-text-muted text-xs font-semibold mt-1"
  }, "Manage your saved shipping addresses for faster product and service checkout.")), /*#__PURE__*/React.createElement("button", {
    onClick: () => setAddressModalOpen(true),
    className: "px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-2 shadow-md hover:bg-primary-light transition-all"
  }, /*#__PURE__*/React.createElement(Plus, {
    size: 16
  }), " Add Address")), savedAddresses.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "text-center py-16 glass-card rounded-3xl border border-border"
  }, /*#__PURE__*/React.createElement(MapPin, {
    size: 44,
    className: "mx-auto text-text-muted mb-3"
  }), /*#__PURE__*/React.createElement("h3", {
    className: "text-base font-bold text-text-main"
  }, "No Saved Addresses"), /*#__PURE__*/React.createElement("p", {
    className: "text-text-muted text-xs mt-1"
  }, "Add a delivery address to speed up your future orders.")) : /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 gap-6"
  }, savedAddresses.map((addr, idx) => /*#__PURE__*/React.createElement("div", {
    key: idx,
    className: "glass-card bg-bg-primary rounded-3xl p-6 border border-border shadow-md flex flex-col justify-between space-y-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center mb-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-black uppercase text-primary bg-primary/10 px-2.5 py-0.5 rounded border border-primary/20"
  }, addr.label || 'Saved Location'), addr.isDefault && /*#__PURE__*/React.createElement("span", {
    className: "text-[9px] font-black text-green-500 bg-green-500/10 px-2 py-0.5 rounded"
  }, "Default Address")), /*#__PURE__*/React.createElement("p", {
    className: "text-sm font-extrabold text-text-main mt-1"
  }, addr.street), /*#__PURE__*/React.createElement("p", {
    className: "text-xs font-semibold text-text-muted mt-0.5"
  }, addr.city, ", ", addr.state, " - ", addr.zipCode)), /*#__PURE__*/React.createElement("div", {
    className: "pt-3 border-t border-border/60 flex justify-end"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => handleDeleteAddress(idx),
    className: "text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1"
  }, /*#__PURE__*/React.createElement(Trash2, {
    size: 14
  }), " Remove Address")))))), activeTab === 'recentlyViewed' && /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-xl font-extrabold text-text-main tracking-tight flex items-center gap-2"
  }, /*#__PURE__*/React.createElement(Eye, {
    size: 20,
    className: "text-primary"
  }), " Recently Viewed Products"), /*#__PURE__*/React.createElement("p", {
    className: "text-text-muted text-xs font-semibold mt-1"
  }, "Products you've recently browsed in the SparkCare store.")), recentlyViewed.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "text-center py-16 glass-card rounded-3xl border border-border"
  }, /*#__PURE__*/React.createElement(Eye, {
    size: 44,
    className: "mx-auto text-text-muted mb-3"
  }), /*#__PURE__*/React.createElement("h3", {
    className: "text-base font-bold text-text-main"
  }, "No Recently Viewed Products"), /*#__PURE__*/React.createElement("p", {
    className: "text-text-muted text-xs mt-1"
  }, "Items you view in the product catalog will appear here automatically.")) : /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
  }, recentlyViewed.map(p => /*#__PURE__*/React.createElement(Link, {
    key: p._id,
    to: `/products/${p._id}`,
    className: "glass-card bg-bg-primary rounded-3xl p-4 border border-border shadow-md hover:shadow-xl transition-all flex flex-col justify-between group"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "h-40 rounded-2xl overflow-hidden bg-bg-secondary relative mb-3"
  }, /*#__PURE__*/React.createElement("img", {
    src: getProductImage(p),
    alt: p.name,
    className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
  }), /*#__PURE__*/React.createElement("span", {
    className: "absolute bottom-2 left-2 bg-primary/90 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow"
  }, p.brand || p.category)), /*#__PURE__*/React.createElement("h4", {
    className: "text-xs font-extrabold text-text-main line-clamp-1 group-hover:text-primary transition-colors"
  }, p.name), /*#__PURE__*/React.createElement("p", {
    className: "text-sm font-black text-text-main mt-1"
  }, formatINR(p.price))), /*#__PURE__*/React.createElement("div", {
    className: "pt-3 mt-3 border-t border-border/60 flex items-center justify-between text-xs font-bold text-primary"
  }, /*#__PURE__*/React.createElement("span", null, "View Product Details"), /*#__PURE__*/React.createElement(ChevronRight, {
    size: 14
  })))))), activeTab === 'profile' && /*#__PURE__*/React.createElement("div", {
    className: "space-y-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass-card bg-bg-primary rounded-3xl p-6 sm:p-8 border border-border shadow-md space-y-6"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-lg font-extrabold text-text-main flex items-center gap-2"
  }, /*#__PURE__*/React.createElement(User, {
    size: 18,
    className: "text-primary"
  }), " Edit Personal Details"), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSaveProfile,
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 gap-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold text-text-muted uppercase mb-1"
  }, "Full Name *"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    required: true,
    value: profileForm.name,
    onChange: e => setProfileForm({
      ...profileForm,
      name: e.target.value
    }),
    className: "w-full bg-bg-secondary border border-border rounded-xl p-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 text-text-main"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold text-text-muted uppercase mb-1"
  }, "Phone Number *"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    required: true,
    value: profileForm.phoneNumber,
    onChange: e => setProfileForm({
      ...profileForm,
      phoneNumber: e.target.value
    }),
    className: "w-full bg-bg-secondary border border-border rounded-xl p-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 text-text-main"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "pt-2"
  }, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold text-text-muted uppercase mb-1"
  }, "Street Address"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: profileForm.street,
    onChange: e => setProfileForm({
      ...profileForm,
      street: e.target.value
    }),
    className: "w-full bg-bg-secondary border border-border rounded-xl p-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 text-text-main"
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-3 gap-3"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold text-text-muted uppercase mb-1"
  }, "City"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: profileForm.city,
    onChange: e => setProfileForm({
      ...profileForm,
      city: e.target.value
    }),
    className: "w-full bg-bg-secondary border border-border rounded-xl p-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 text-text-main"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold text-text-muted uppercase mb-1"
  }, "State"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: profileForm.state,
    onChange: e => setProfileForm({
      ...profileForm,
      state: e.target.value
    }),
    className: "w-full bg-bg-secondary border border-border rounded-xl p-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 text-text-main"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold text-text-muted uppercase mb-1"
  }, "Zip Code"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: profileForm.zipCode,
    onChange: e => setProfileForm({
      ...profileForm,
      zipCode: e.target.value
    }),
    className: "w-full bg-bg-secondary border border-border rounded-xl p-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 text-text-main"
  }))), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: profileSaving,
    className: "px-6 py-3 bg-primary text-white font-extrabold rounded-xl text-xs shadow-md shadow-primary/20 hover:bg-primary-light transition-all disabled:opacity-50"
  }, profileSaving ? 'Saving...' : 'Save Profile Changes'))), /*#__PURE__*/React.createElement("div", {
    className: "glass-card bg-bg-primary rounded-3xl p-6 sm:p-8 border border-border shadow-md space-y-6"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-lg font-extrabold text-text-main flex items-center gap-2"
  }, /*#__PURE__*/React.createElement(Lock, {
    size: 18,
    className: "text-primary"
  }), " Change Password"), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSavePassword,
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold text-text-muted uppercase mb-1"
  }, "Current Password *"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    required: true,
    value: passwordForm.currentPassword,
    onChange: e => setPasswordForm({
      ...passwordForm,
      currentPassword: e.target.value
    }),
    className: "w-full bg-bg-secondary border border-border rounded-xl p-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 text-text-main"
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 gap-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold text-text-muted uppercase mb-1"
  }, "New Password *"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    required: true,
    value: passwordForm.newPassword,
    onChange: e => setPasswordForm({
      ...passwordForm,
      newPassword: e.target.value
    }),
    className: "w-full bg-bg-secondary border border-border rounded-xl p-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 text-text-main"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold text-text-muted uppercase mb-1"
  }, "Confirm New Password *"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    required: true,
    value: passwordForm.confirmPassword,
    onChange: e => setPasswordForm({
      ...passwordForm,
      confirmPassword: e.target.value
    }),
    className: "w-full bg-bg-secondary border border-border rounded-xl p-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 text-text-main"
  }))), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: passwordSaving,
    className: "px-6 py-3 bg-primary text-white font-extrabold rounded-xl text-xs shadow-md shadow-primary/20 hover:bg-primary-light transition-all disabled:opacity-50"
  }, passwordSaving ? 'Updating...' : 'Update Password'))))))), addressModalOpen && /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass-card bg-bg-primary rounded-3xl border border-border p-6 max-w-md w-full shadow-2xl space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center pb-3 border-b border-border"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-base font-extrabold text-text-main"
  }, "Add Shipping Address"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setAddressModalOpen(false),
    className: "text-text-muted hover:text-text-main"
  }, /*#__PURE__*/React.createElement(X, {
    size: 20
  }))), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleAddAddress,
    className: "space-y-3"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold text-text-muted uppercase mb-1"
  }, "Street Address *"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    required: true,
    value: addressForm.street,
    onChange: e => setAddressForm({
      ...addressForm,
      street: e.target.value
    }),
    className: "w-full bg-bg-secondary border border-border rounded-xl p-2.5 text-xs font-semibold text-text-main focus:outline-none"
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-3"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold text-text-muted uppercase mb-1"
  }, "City *"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    required: true,
    value: addressForm.city,
    onChange: e => setAddressForm({
      ...addressForm,
      city: e.target.value
    }),
    className: "w-full bg-bg-secondary border border-border rounded-xl p-2.5 text-xs font-semibold text-text-main focus:outline-none"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold text-text-muted uppercase mb-1"
  }, "State"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: addressForm.state,
    onChange: e => setAddressForm({
      ...addressForm,
      state: e.target.value
    }),
    className: "w-full bg-bg-secondary border border-border rounded-xl p-2.5 text-xs font-semibold text-text-main focus:outline-none"
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold text-text-muted uppercase mb-1"
  }, "Zip Code *"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    required: true,
    value: addressForm.zipCode,
    onChange: e => setAddressForm({
      ...addressForm,
      zipCode: e.target.value
    }),
    className: "w-full bg-bg-secondary border border-border rounded-xl p-2.5 text-xs font-semibold text-text-main focus:outline-none"
  })), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "w-full py-3 bg-primary text-white font-bold rounded-xl text-xs shadow-md mt-2"
  }, "Save New Address")))), invoiceModalOpen && selectedInvoiceOrder && /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
  }, /*#__PURE__*/React.createElement("div", {
    className: "printable-invoice glass-card bg-bg-primary rounded-3xl border border-border p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8"
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
  }, "Order #", selectedInvoiceOrder._id || selectedInvoiceOrder.id, " • Placed on ", selectedInvoiceOrder.createdAt ? new Date(selectedInvoiceOrder.createdAt).toLocaleDateString() : 'Today')), /*#__PURE__*/React.createElement("button", {
    onClick: () => setInvoiceModalOpen(false),
    className: "p-2 rounded-xl bg-bg-secondary hover:bg-border text-text-muted hover:text-text-main transition-all cursor-pointer"
  }, /*#__PURE__*/React.createElement(X, {
    size: 20
  }))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-4 p-4 rounded-2xl bg-bg-secondary/70 border border-border/60 text-xs font-semibold"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "text-[10px] font-black uppercase text-text-muted"
  }, "Billed To / Customer"), /*#__PURE__*/React.createElement("p", {
    className: "font-extrabold text-text-main mt-1"
  }, user?.name || 'Valued Customer'), /*#__PURE__*/React.createElement("p", {
    className: "text-text-muted"
  }, user?.email), /*#__PURE__*/React.createElement("p", {
    className: "text-text-muted"
  }, user?.phoneNumber)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "text-[10px] font-black uppercase text-text-muted"
  }, "Delivery Address"), selectedInvoiceOrder.shippingAddress ? /*#__PURE__*/React.createElement("p", {
    className: "font-bold text-text-main mt-1"
  }, selectedInvoiceOrder.shippingAddress.street, ", ", selectedInvoiceOrder.shippingAddress.city, ", ", selectedInvoiceOrder.shippingAddress.state, " - ", selectedInvoiceOrder.shippingAddress.zipCode) : /*#__PURE__*/React.createElement("p", {
    className: "text-text-muted mt-1"
  }, "Standard Delivery"))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-3"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-xs font-black uppercase tracking-wider text-text-muted"
  }, "Itemized Product Breakdown"), /*#__PURE__*/React.createElement("div", {
    className: "divide-y divide-border/60 border border-border rounded-2xl overflow-hidden bg-bg-secondary/40"
  }, (selectedInvoiceOrder.items || selectedInvoiceOrder.orderItems || []).map((item, idx) => {
    const productObj = typeof item.product === 'object' ? item.product : null;
    const name = productObj?.name || item.name || 'Electrical Hardware Item';
    const price = item.unitPrice || productObj?.price || item.price || 0;
    const qty = item.quantity || 1;
    const productId = productObj?._id || item.product || item._id;
    return /*#__PURE__*/React.createElement("div", {
      key: idx,
      className: "p-3.5 flex justify-between items-center text-xs"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-3 min-w-0"
    }, /*#__PURE__*/React.createElement("img", {
      src: getProductImage(productObj || item),
      alt: name,
      className: "w-10 h-10 rounded-lg object-cover bg-bg-primary flex-shrink-0"
    }), /*#__PURE__*/React.createElement("div", {
      className: "min-w-0"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "font-extrabold text-text-main truncate"
    }, name), /*#__PURE__*/React.createElement("p", {
      className: "text-[10px] text-text-muted"
    }, formatINR(price), " × ", qty), productId && /*#__PURE__*/React.createElement(Link, {
      to: `/products/${productId}`,
      onClick: () => setInvoiceModalOpen(false),
      className: "text-[10px] font-bold text-primary hover:underline flex items-center gap-1 mt-0.5"
    }, /*#__PURE__*/React.createElement(Eye, {
      size: 12
    }), " View Product Details →"))), /*#__PURE__*/React.createElement("span", {
      className: "font-black text-text-main shrink-0"
    }, formatINR(price * qty)));
  }))), /*#__PURE__*/React.createElement("div", {
    className: "p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-2 text-xs font-bold"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between text-text-muted"
  }, /*#__PURE__*/React.createElement("span", null, "Items Subtotal"), /*#__PURE__*/React.createElement("span", null, formatINR(selectedInvoiceOrder.totals?.subtotal || selectedInvoiceOrder.totalPrice || 0))), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between text-text-muted"
  }, /*#__PURE__*/React.createElement("span", null, "Configured Tax (8%)"), /*#__PURE__*/React.createElement("span", null, formatINR(selectedInvoiceOrder.totals?.tax || 0))), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between text-text-muted"
  }, /*#__PURE__*/React.createElement("span", null, "Shipping Fee"), /*#__PURE__*/React.createElement("span", null, selectedInvoiceOrder.totals?.shippingFee === 0 ? 'FREE' : formatINR(selectedInvoiceOrder.totals?.shippingFee || 0))), selectedInvoiceOrder.totals?.discount > 0 && /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between text-green-500"
  }, /*#__PURE__*/React.createElement("span", null, "Coupon Savings"), /*#__PURE__*/React.createElement("span", null, "-", formatINR(selectedInvoiceOrder.totals.discount))), /*#__PURE__*/React.createElement("div", {
    className: "pt-2 border-t border-primary/20 flex justify-between text-sm font-black text-text-main"
  }, /*#__PURE__*/React.createElement("span", null, "Grand Total Paid / Due"), /*#__PURE__*/React.createElement("span", {
    className: "text-primary"
  }, formatINR(selectedInvoiceOrder.totals?.grandTotal || selectedInvoiceOrder.totalPrice || 0)))), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center pt-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-text-muted font-semibold"
  }, "SparkCare Certified • Official Tax Invoice"), /*#__PURE__*/React.createElement("button", {
    onClick: () => window.print(),
    className: "px-5 py-2.5 bg-primary text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-2 hover:bg-primary-light cursor-pointer active:scale-95"
  }, /*#__PURE__*/React.createElement(Printer, {
    size: 16
  }), " Print Official Invoice")))), qrModalOpen && /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass-card bg-bg-primary rounded-3xl border border-border p-6 max-w-md w-full shadow-2xl space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center pb-3 border-b border-border"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-base font-extrabold text-text-main"
  }, "Upload QR Payment Proof"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setQrModalOpen(false),
    className: "text-text-muted hover:text-text-main"
  }, /*#__PURE__*/React.createElement(X, {
    size: 20
  }))), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleQrUploadSubmit,
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold text-text-muted uppercase mb-1"
  }, "Transaction Ref / UTR ID"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "e.g. 329104819401",
    value: qrTxnId,
    onChange: e => setQrTxnId(e.target.value),
    className: "w-full bg-bg-secondary border border-border rounded-xl p-2.5 text-xs font-semibold text-text-main focus:outline-none"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold text-text-muted uppercase mb-1"
  }, "Receipt Screenshot *"), /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    required: true,
    onChange: e => setQrScreenshot(e.target.files[0]),
    className: "w-full text-xs text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-primary file:text-white hover:file:bg-primary-light"
  })), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: qrUploading,
    className: "w-full py-3 bg-primary text-white font-bold rounded-xl text-xs shadow-md disabled:opacity-50"
  }, qrUploading ? 'Uploading Receipt...' : 'Submit Proof to Admin')))), reviewModalOpen && /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass-card bg-bg-primary rounded-3xl border border-border p-6 max-w-md w-full shadow-2xl space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center pb-3 border-b border-border"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-base font-extrabold text-text-main"
  }, "Write Verified Review"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setReviewModalOpen(false),
    className: "text-text-muted hover:text-text-main"
  }, /*#__PURE__*/React.createElement(X, {
    size: 20
  }))), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmitReview,
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold text-text-muted uppercase mb-1"
  }, "Rating"), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2"
  }, [1, 2, 3, 4, 5].map(star => /*#__PURE__*/React.createElement("button", {
    key: star,
    type: "button",
    onClick: () => setReviewRating(star),
    className: "p-1 cursor-pointer"
  }, /*#__PURE__*/React.createElement(Star, {
    size: 22,
    className: star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-text-muted'
  }))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold text-text-muted uppercase mb-1"
  }, "Review Message"), /*#__PURE__*/React.createElement("textarea", {
    rows: 4,
    required: true,
    placeholder: "Share your experience...",
    value: reviewComment,
    onChange: e => setReviewComment(e.target.value),
    className: "w-full bg-bg-secondary border border-border rounded-xl p-3 text-xs font-semibold text-text-main focus:outline-none"
  })), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: reviewSubmitting,
    className: "w-full py-3 bg-primary text-white font-bold rounded-xl text-xs shadow-md disabled:opacity-50"
  }, reviewSubmitting ? 'Submitting...' : 'Post Verified Review')))));
};
export default UserAccountPage;
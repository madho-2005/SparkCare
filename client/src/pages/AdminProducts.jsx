import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  toggleProductStatus,
  deleteAdminProduct,
} from '../redux/adminSlice';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle2,
  UploadCloud,
  X,
  Package,
  Layers,
  AlertTriangle,
  RefreshCw,
  Check,
  Star,
  Eye,
} from 'lucide-react';
import { formatINR } from '../utils/currency';
import { getProductImage } from '../utils/productImage';
import { Skeleton } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';

const CATEGORY_OPTIONS = [
  'Wires & Cables',
  'LED Lights',
  'Ceiling Fans',
  'Smart Devices',
  'Switches',
  'Extension Boards',
  'Electrical Safety Products',
];

const BRAND_SUGGESTIONS = [
  'Havells',
  'Polycab',
  'Wipro',
  'Philips',
  'Schneider',
  'Anchor',
  'Usha',
  'Crompton',
  'Orient',
  'Bajaj',
  'Syska',
  'Finolex',
  'RR Kabel',
  'Legrand',
  'GM',
  'Goldmedal',
  'V-Guard',
  'Honeywell',
  'Belkin',
  'TP-Link',
  'Ring',
];

export const AdminProducts = () => {
  const dispatch = useDispatch();
  const {
    products,
    productsTotal,
    productsTotalPages,
    productsCurrentPage,
    productsLoading,
    productActionLoading,
  } = useSelector((state) => state.admin);

  // Filters & query state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | null
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deactivateModalProduct, setDeactivateModalProduct] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    brand: '',
    category: CATEGORY_OPTIONS[0],
    subCategory: '',
    description: '',
    price: '',
    compareAtPrice: '',
    stockCount: '',
    status: 'active',
    isFeatured: false,
    tagsString: '',
    specifications: [{ key: '', value: '' }],
  });

  // Image Upload State
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImagePublicIds, setRemovedImagePublicIds] = useState([]);

  // Fetch products on query state changes
  useEffect(() => {
    dispatch(
      fetchAdminProducts({
        search: searchTerm,
        category: selectedCategory,
        status: selectedStatus,
        sort: selectedSort,
        page: currentPage,
        limit: 10,
      })
    );
  }, [dispatch, searchTerm, selectedCategory, selectedStatus, selectedSort, currentPage]);

  // Inventory stats metrics
  const stats = useMemo(() => {
    const total = productsTotal || products.length;
    const activeCount = products.filter((p) => p.status === 'active' || (p.isActive && p.status !== 'draft')).length;
    const draftCount = products.filter((p) => p.status === 'draft').length;
    const lowStockCount = products.filter((p) => p.stockCount <= 10).length;
    return { total, activeCount, draftCount, lowStockCount };
  }, [products, productsTotal]);

  // Reset & open create modal
  const handleOpenCreate = () => {
    setFormData({
      name: '',
      sku: '',
      brand: '',
      category: CATEGORY_OPTIONS[0],
      subCategory: '',
      description: '',
      price: '',
      compareAtPrice: '',
      stockCount: '50',
      status: 'active',
      isFeatured: false,
      tagsString: '',
      specifications: [{ key: '', value: '' }],
    });
    setSelectedFiles([]);
    setFilePreviews([]);
    setExistingImages([]);
    setRemovedImagePublicIds([]);
    setModalMode('create');
  };

  // Open edit modal with prefilled data
  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name || '',
      sku: product.sku || '',
      brand: product.brand || '',
      category: product.category || CATEGORY_OPTIONS[0],
      subCategory: product.subCategory || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      compareAtPrice: product.compareAtPrice ? product.compareAtPrice.toString() : '',
      stockCount: product.stockCount?.toString() || '0',
      status: product.status || (product.isActive ? 'active' : 'inactive'),
      isFeatured: product.isFeatured || false,
      tagsString: Array.isArray(product.tags) ? product.tags.join(', ') : '',
      specifications:
        product.specifications && product.specifications.length > 0
          ? product.specifications.map((s) => ({ key: s.key, value: s.value }))
          : [{ key: '', value: '' }],
    });
    setSelectedFiles([]);
    setFilePreviews([]);
    setExistingImages(product.images || []);
    setRemovedImagePublicIds([]);
    setModalMode('edit');
  };

  // Handle image file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const totalCount = existingImages.length - removedImagePublicIds.length + selectedFiles.length + files.length;
    if (totalCount > 5) {
      toast.error('You can attach a maximum of 5 images per product.');
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    // Generate local previews
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setFilePreviews((prev) => [...prev, ...newPreviews]);
  };

  // Remove freshly selected image
  const handleRemoveSelectedFile = (index) => {
    const updatedFiles = [...selectedFiles];
    updatedFiles.splice(index, 1);
    setSelectedFiles(updatedFiles);

    const updatedPreviews = [...filePreviews];
    URL.revokeObjectURL(updatedPreviews[index]);
    updatedPreviews.splice(index, 1);
    setFilePreviews(updatedPreviews);
  };

  // Mark existing Cloudinary image for removal
  const handleMarkExistingImageRemoved = (publicId) => {
    setRemovedImagePublicIds((prev) => [...prev, publicId]);
  };

  // Specification row management
  const handleAddSpecRow = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', value: '' }],
    }));
  };

  const handleSpecChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.specifications];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, specifications: updated };
    });
  };

  const handleRemoveSpecRow = (index) => {
    setFormData((prev) => {
      const updated = [...prev.specifications];
      updated.splice(index, 1);
      return {
        ...prev,
        specifications: updated.length > 0 ? updated : [{ key: '', value: '' }],
      };
    });
  };

  // Form submission (Create & Edit)
  const handleSubmit = async (e, overrideStatus = null) => {
    if (e) e.preventDefault();

    // Frontend Validations
    if (!formData.name.trim()) {
      toast.error('Product title is required.');
      return;
    }
    if (!formData.sku.trim()) {
      toast.error('SKU identifier is required.');
      return;
    }
    if (!formData.brand.trim()) {
      toast.error('Product manufacturer brand is required.');
      return;
    }
    if (!formData.category) {
      toast.error('Please select a valid category.');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Product description is required.');
      return;
    }

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error('Please enter a valid non-negative product price.');
      return;
    }

    const stockNum = parseInt(formData.stockCount);
    if (isNaN(stockNum) || stockNum < 0) {
      toast.error('Stock quantity must be a non-negative whole integer.');
      return;
    }

    const finalStatus = overrideStatus || formData.status;

    // Build FormData payload
    const submission = new FormData();
    submission.append('name', formData.name.trim());
    submission.append('sku', formData.sku.trim().toUpperCase());
    submission.append('brand', formData.brand.trim());
    submission.append('category', formData.category);
    if (formData.subCategory.trim()) {
      submission.append('subCategory', formData.subCategory.trim());
    }
    submission.append('description', formData.description.trim());
    submission.append('price', priceNum);
    if (formData.compareAtPrice && !isNaN(parseFloat(formData.compareAtPrice))) {
      submission.append('compareAtPrice', parseFloat(formData.compareAtPrice));
    }
    submission.append('stockCount', stockNum);
    submission.append('status', finalStatus);
    submission.append('isFeatured', formData.isFeatured);

    // Tags
    const tagsArray = formData.tagsString
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    submission.append('tags', JSON.stringify(tagsArray));

    // Specifications
    const cleanSpecs = formData.specifications.filter((s) => s.key.trim() && s.value.trim());
    submission.append('specifications', JSON.stringify(cleanSpecs));

    // Images
    selectedFiles.forEach((file) => {
      submission.append('images', file);
    });

    if (modalMode === 'edit') {
      submission.append('removedImages', JSON.stringify(removedImagePublicIds));
    }

    try {
      if (modalMode === 'create') {
        await dispatch(createAdminProduct(submission)).unwrap();
        setModalMode(null);
      } else if (modalMode === 'edit' && selectedProduct) {
        await dispatch(
          updateAdminProduct({
            id: selectedProduct._id,
            formData: submission,
          })
        ).unwrap();
        setModalMode(null);
      }
    } catch {
      // Error message is toasted by Redux thunk
    }
  };

  // Quick Status Toggle (e.g. Activate / Deactivate / Draft)
  const handleQuickStatusToggle = async (productId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await dispatch(toggleProductStatus({ id: productId, status: nextStatus }));
  };

  // Calculated discount badge helper
  const calculateDiscount = (p, cap) => {
    const price = parseFloat(p);
    const compare = parseFloat(cap);
    if (price && compare && compare > price) {
      return Math.round(((compare - price) / compare) * 100);
    }
    return 0;
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-main flex items-center gap-3">
            <Package className="text-primary" size={32} />
            Products Catalog & Inventory
          </h1>
          <p className="text-text-muted mt-1.5 font-semibold text-xs sm:text-sm">
            Publish items, upload Cloudinary assets, configure technical specs, and manage real-time inventory.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary-light text-white text-xs font-black shadow-lg shadow-primary/20 transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          Create New Product
        </button>
      </div>

      {/* Metrics Cards Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card bg-bg-primary p-4 rounded-2xl border border-border flex items-center gap-3.5">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <Package size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-text-muted tracking-wider">Total Products</p>
            <p className="text-xl font-black text-text-main mt-0.5">{stats.total}</p>
          </div>
        </div>

        <div className="glass-card bg-bg-primary p-4 rounded-2xl border border-border flex items-center gap-3.5">
          <div className="p-3 bg-green-500/10 text-green-500 rounded-xl">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-text-muted tracking-wider">Live & Active</p>
            <p className="text-xl font-black text-text-main mt-0.5">{stats.activeCount}</p>
          </div>
        </div>

        <div className="glass-card bg-bg-primary p-4 rounded-2xl border border-border flex items-center gap-3.5">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Layers size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-text-muted tracking-wider">Draft Items</p>
            <p className="text-xl font-black text-text-main mt-0.5">{stats.draftCount}</p>
          </div>
        </div>

        <div className="glass-card bg-bg-primary p-4 rounded-2xl border border-border flex items-center gap-3.5">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-text-muted tracking-wider">Low Stock (&le;10)</p>
            <p className="text-xl font-black text-text-main mt-0.5">{stats.lowStockCount}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card bg-bg-primary p-4 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row md:items-center gap-3.5 justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-muted pointer-events-none">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Search by Product title, SKU, Brand, or Category..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-bg-secondary text-text-main text-xs pl-9 pr-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all font-semibold"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter */}
          <div className="flex items-center gap-2 bg-bg-secondary border border-border px-3 py-2 rounded-xl text-xs font-semibold">
            <Filter size={12} className="text-text-muted" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent focus:outline-none text-text-main cursor-pointer"
            >
              <option value="All">All Categories</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-bg-secondary border border-border px-3 py-2 rounded-xl text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent focus:outline-none text-text-main cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="active">Active (Published)</option>
              <option value="draft">Draft</option>
              <option value="inactive">Inactive</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          {/* Sort Selection */}
          <div className="flex items-center gap-2 bg-bg-secondary border border-border px-3 py-2 rounded-xl text-xs font-semibold">
            <select
              value={selectedSort}
              onChange={(e) => {
                setSelectedSort(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent focus:outline-none text-text-main cursor-pointer"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="price_high">Price: High to Low</option>
              <option value="price_low">Price: Low to High</option>
              <option value="stock_low">Stock: Low to High</option>
              <option value="stock_high">Stock: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="glass-card bg-bg-primary rounded-2xl border border-border shadow-lg p-6">
        {productsLoading ? (
          <Skeleton.Table cols={7} rows={6} />
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <Package size={48} className="mx-auto text-text-muted mb-4 opacity-50" />
            <h3 className="text-base font-extrabold text-text-main">No Products Located</h3>
            <p className="text-xs text-text-muted mt-1.5 max-w-sm mx-auto font-semibold">
              No product catalog entries matched your active search query or filter settings.
            </p>
            <button
              onClick={handleOpenCreate}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
            >
              <Plus size={14} /> Add Product Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/80 text-xxs text-text-muted uppercase font-black tracking-wider">
                  <th className="pb-3.5 pl-2">Product Item</th>
                  <th className="pb-3.5">SKU Code</th>
                  <th className="pb-3.5">Category & Brand</th>
                  <th className="pb-3.5">Price & Compare</th>
                  <th className="pb-3.5">Inventory Stock</th>
                  <th className="pb-3.5 text-center">Lifecycle Status</th>
                  <th className="pb-3.5 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-xs font-semibold">
                {products.map((product) => {
                  const isLow = product.stockCount <= 10 && product.stockCount > 0;
                  const isOut = product.stockCount <= 0;
                  const isDraft = product.status === 'draft';
                  const isActive = product.status === 'active' || (product.isActive && !isDraft);

                  return (
                    <tr key={product._id} className="hover:bg-bg-secondary/40 transition-colors">
                      {/* Product Item Info */}
                      <td className="py-4 pl-2">
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <img
                            src={getProductImage(product)}
                            alt={product.name}
                            className="w-11 h-11 rounded-xl object-cover bg-bg-secondary border border-border flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-text-main truncate block">{product.name}</span>
                              {product.isFeatured && (
                                <span title="Featured Product" className="text-amber-400 shrink-0">
                                  <Star size={13} fill="currentColor" />
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-text-muted font-mono block mt-0.5 truncate">
                              ID: {product._id?.slice(-6)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* SKU Code */}
                      <td className="py-4 font-mono font-bold text-text-main text-[11px]">
                        <span className="bg-bg-secondary px-2.5 py-1 rounded border border-border uppercase">
                          {product.sku}
                        </span>
                      </td>

                      {/* Category & Brand */}
                      <td className="py-4">
                        <span className="text-text-main font-bold block">{product.category}</span>
                        <span className="text-[10px] text-text-muted block mt-0.5">{product.brand}</span>
                      </td>

                      {/* Pricing */}
                      <td className="py-4">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-black text-primary text-sm">{formatINR(product.price)}</span>
                          {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <span className="text-[10px] line-through text-text-muted">
                              {formatINR(product.compareAtPrice)}
                            </span>
                          )}
                        </div>
                        {calculateDiscount(product.price, product.compareAtPrice) > 0 && (
                          <span className="text-[9px] font-black text-green-600 uppercase">
                            {calculateDiscount(product.price, product.compareAtPrice)}% OFF
                          </span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                            isOut
                              ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                              : isLow
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              : 'bg-green-500/10 text-green-600 border border-green-500/20'
                          }`}
                        >
                          {isOut ? 'Out of Stock' : `${product.stockCount} in stock`}
                        </span>
                      </td>

                      {/* Status Toggle Badge */}
                      <td className="py-4 text-center">
                        <button
                          onClick={() => handleQuickStatusToggle(product._id, product.status || (product.isActive ? 'active' : 'inactive'))}
                          title="Click to toggle status"
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all cursor-pointer border ${
                            isActive
                              ? 'bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20'
                              : isDraft
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20'
                              : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-green-500' : isDraft ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                          ></span>
                          {product.status ? product.status.toUpperCase() : product.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 text-right pr-4">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all cursor-pointer"
                            title="Edit Product Details"
                          >
                            <Edit size={15} />
                          </button>

                          <Link
                            to={`/products/${product._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-text-muted hover:text-primary hover:bg-bg-secondary rounded-xl transition-all cursor-pointer inline-flex items-center justify-center"
                            title="View Product Details (opens in new tab)"
                          >
                            <Eye size={15} />
                          </Link>

                          <button
                            onClick={() => setDeactivateModalProduct(product)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                            title="Deactivate / Remove"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {productsTotalPages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-border/50 mt-4">
            <span className="text-[11px] font-bold text-text-muted">
              Showing page <strong className="text-text-main">{productsCurrentPage}</strong> of{' '}
              <strong className="text-text-main">{productsTotalPages}</strong> ({productsTotal} total products)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={productsCurrentPage === 1}
                className="px-3.5 py-1.5 bg-bg-secondary hover:bg-border text-text-muted hover:text-text-main border border-border rounded-xl text-xxs font-black transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(productsTotalPages, prev + 1))}
                disabled={productsCurrentPage === productsTotalPages}
                className="px-3.5 py-1.5 bg-bg-secondary hover:bg-border text-text-muted hover:text-text-main border border-border rounded-xl text-xxs font-black transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE & EDIT PRODUCT MODAL */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 overflow-y-auto">
          <div className="bg-bg-primary max-w-3xl w-full rounded-3xl border border-border p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <div>
                <h3 className="text-xl font-extrabold text-text-main flex items-center gap-2.5">
                  <Package size={22} className="text-primary" />
                  {modalMode === 'create' ? 'Create New Catalog Product' : `Edit Product — ${selectedProduct?.name}`}
                </h3>
                <p className="text-xs text-text-muted font-semibold mt-0.5">
                  Enter authoritative details, pricing, inventory stock, and Cloudinary media assets.
                </p>
              </div>
              <button
                onClick={() => setModalMode(null)}
                className="p-2 rounded-xl bg-bg-secondary hover:bg-border text-text-muted hover:text-text-main transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
              {/* Section 1: Basic Information */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  1. Basic Product Information
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="md:col-span-2">
                    <label className="block text-xxs font-black uppercase text-text-muted mb-1.5">
                      Product Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Havells 16A Double Pole MCB Circuit Breaker"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-bg-secondary border border-border rounded-xl p-3 text-xs font-semibold text-text-main focus:ring-2 focus:ring-primary/30 focus:outline-none"
                    />
                  </div>

                  {/* SKU */}
                  <div>
                    <label className="block text-xxs font-black uppercase text-text-muted mb-1.5">
                      SKU (Unique Code) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. HAV-MCB-16A"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                      className="w-full bg-bg-secondary border border-border rounded-xl p-3 text-xs font-mono font-bold text-text-main uppercase focus:ring-2 focus:ring-primary/30 focus:outline-none"
                    />
                  </div>

                  {/* Brand */}
                  <div>
                    <label className="block text-xxs font-black uppercase text-text-muted mb-1.5">
                      Brand / Manufacturer *
                    </label>
                    <input
                      type="text"
                      required
                      list="brand-list"
                      placeholder="e.g. Havells, Polycab, Wipro"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full bg-bg-secondary border border-border rounded-xl p-3 text-xs font-bold text-text-main focus:ring-2 focus:ring-primary/30 focus:outline-none"
                    />
                    <datalist id="brand-list">
                      {BRAND_SUGGESTIONS.map((b) => (
                        <option key={b} value={b} />
                      ))}
                    </datalist>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xxs font-black uppercase text-text-muted mb-1.5">
                      Main Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-bg-secondary border border-border rounded-xl p-3 text-xs font-bold text-text-main focus:ring-2 focus:ring-primary/30 focus:outline-none cursor-pointer"
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* SubCategory */}
                  <div>
                    <label className="block text-xxs font-black uppercase text-text-muted mb-1.5">
                      Sub-Category (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Circuit Breakers, Smart Lighting"
                      value={formData.subCategory}
                      onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                      className="w-full bg-bg-secondary border border-border rounded-xl p-3 text-xs font-semibold text-text-main focus:ring-2 focus:ring-primary/30 focus:outline-none"
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-xxs font-black uppercase text-text-muted mb-1.5">
                      Detailed Description *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Provide comprehensive electrical specifications, compatibility, and certifications..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-bg-secondary border border-border rounded-xl p-3 text-xs font-semibold text-text-main focus:ring-2 focus:ring-primary/30 focus:outline-none"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Section 2: Pricing & Stock Inventory */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h4 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  2. Pricing & Inventory Management
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Standard Price */}
                  <div>
                    <label className="block text-xxs font-black uppercase text-text-muted mb-1.5">
                      Selling Price (₹ INR) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="e.g. 450.00"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full bg-bg-secondary border border-border rounded-xl p-3 text-xs font-black text-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
                    />
                  </div>

                  {/* Compare Price */}
                  <div>
                    <label className="block text-xxs font-black uppercase text-text-muted mb-1.5">
                      Original / MRP (₹ INR)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g. 599.00"
                      value={formData.compareAtPrice}
                      onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                      className="w-full bg-bg-secondary border border-border rounded-xl p-3 text-xs font-bold text-text-muted focus:ring-2 focus:ring-primary/30 focus:outline-none"
                    />
                    {calculateDiscount(formData.price, formData.compareAtPrice) > 0 && (
                      <p className="text-[10px] text-green-600 font-black mt-1">
                        &rarr; {calculateDiscount(formData.price, formData.compareAtPrice)}% Discount Active
                      </p>
                    )}
                  </div>

                  {/* Stock Count */}
                  <div>
                    <label className="block text-xxs font-black uppercase text-text-muted mb-1.5">
                      Initial Stock Count *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      placeholder="e.g. 100"
                      value={formData.stockCount}
                      onChange={(e) => setFormData({ ...formData, stockCount: e.target.value })}
                      className="w-full bg-bg-secondary border border-border rounded-xl p-3 text-xs font-black text-text-main focus:ring-2 focus:ring-primary/30 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Product Images (Cloudinary Multi-Upload) */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    3. Product Images (Cloudinary Ingestion)
                  </h4>
                  <span className="text-[10px] font-bold text-text-muted">Max 5 Photos (PNG, JPEG, WEBP)</span>
                </div>

                {/* Existing Images (Edit Mode) */}
                {modalMode === 'edit' && existingImages.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xxs font-bold uppercase text-text-muted">Current Live Images:</p>
                    <div className="flex flex-wrap gap-3">
                      {existingImages.map((img) => {
                        const isMarked = removedImagePublicIds.includes(img.public_id);
                        return (
                          <div
                            key={img.public_id}
                            className={`relative group w-20 h-20 rounded-2xl overflow-hidden border ${
                              isMarked ? 'opacity-30 border-red-500' : 'border-border'
                            }`}
                          >
                            <img src={img.secure_url} alt="asset" className="w-full h-full object-cover" />
                            {!isMarked && (
                              <button
                                type="button"
                                onClick={() => handleMarkExistingImageRemoved(img.public_id)}
                                className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold text-xs cursor-pointer"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Upload Drag & Drop Trigger */}
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border hover:border-primary/50 bg-bg-secondary/50 rounded-2xl cursor-pointer transition-all p-4 text-center">
                  <UploadCloud size={28} className="text-primary mb-2" />
                  <span className="text-xs font-bold text-text-main">Click or drag photos to upload</span>
                  <span className="text-[10px] text-text-muted mt-0.5">High-resolution PNG, JPG or WEBP up to 5MB</span>
                  <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {/* Fresh Image Previews */}
                {filePreviews.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xxs font-bold uppercase text-text-muted">New Photos Staged For Upload:</p>
                    <div className="flex flex-wrap gap-3">
                      {filePreviews.map((preview, idx) => (
                        <div key={idx} className="relative group w-20 h-20 rounded-2xl overflow-hidden border border-primary/40">
                          <img src={preview} alt="staged" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveSelectedFile(idx)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white shadow-md cursor-pointer hover:scale-110 transition-transform"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Section 4: Specifications Key-Values */}
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    4. Technical Specifications
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddSpecRow}
                    className="text-xs font-black text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} /> Add Spec Field
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.specifications.map((spec, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Feature (e.g. Wattage, Voltage, Gauge)"
                        value={spec.key}
                        onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                        className="flex-1 bg-bg-secondary border border-border rounded-xl p-2.5 text-xs font-semibold text-text-main focus:ring-2 focus:ring-primary/30 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. 16 Amps, 240V, 1.5 sq mm)"
                        value={spec.value}
                        onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                        className="flex-1 bg-bg-secondary border border-border rounded-xl p-2.5 text-xs font-semibold text-text-main focus:ring-2 focus:ring-primary/30 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecRow(idx)}
                        className="p-2 text-text-muted hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 5: Lifecycle & Visibility Settings */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h4 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  5. Lifecycle & Visibility Options
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Status Selection */}
                  <div>
                    <label className="block text-xxs font-black uppercase text-text-muted mb-1.5">
                      Publish Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-bg-secondary border border-border rounded-xl p-3 text-xs font-bold text-text-main focus:ring-2 focus:ring-primary/30 focus:outline-none cursor-pointer"
                    >
                      <option value="active">Active (Visible & Purchasable in E-Store)</option>
                      <option value="draft">Draft (Private in Admin Panel only)</option>
                      <option value="inactive">Inactive (Hidden from Customers)</option>
                    </select>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-xxs font-black uppercase text-text-muted mb-1.5">
                      Tags (Comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="MCB, Electric, Havells, Copper"
                      value={formData.tagsString}
                      onChange={(e) => setFormData({ ...formData, tagsString: e.target.value })}
                      className="w-full bg-bg-secondary border border-border rounded-xl p-3 text-xs font-semibold text-text-main focus:ring-2 focus:ring-primary/30 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Featured Toggle */}
                <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-bg-secondary/60 border border-border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 text-primary rounded focus:ring-primary/30"
                  />
                  <div>
                    <span className="text-xs font-extrabold text-text-main block">Highlight as Featured Product</span>
                    <span className="text-[10px] text-text-muted">Displays this item on the homepage spotlight carousel.</span>
                  </div>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-border">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  disabled={productActionLoading}
                  className="px-5 py-3 rounded-xl bg-bg-secondary hover:bg-border text-text-muted hover:text-text-main text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>

                {modalMode === 'create' && (
                  <button
                    type="button"
                    disabled={productActionLoading}
                    onClick={(e) => handleSubmit(e, 'draft')}
                    className="px-5 py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 text-xs font-black transition-all cursor-pointer"
                  >
                    Save as Draft
                  </button>
                )}

                <button
                  type="submit"
                  disabled={productActionLoading}
                  className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-light text-white text-xs font-black shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {productActionLoading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Saving to Inventory...
                    </>
                  ) : modalMode === 'create' ? (
                    <>
                      <Check size={16} /> Publish to Store
                    </>
                  ) : (
                    <>
                      <Check size={16} /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION DEACTIVATE / DELETE MODAL */}
      {deactivateModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70">
          <div className="bg-bg-primary max-w-md w-full rounded-3xl border border-border p-6 shadow-2xl space-y-4">
            <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl w-fit">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-black text-text-main">
              Deactivate "{deactivateModalProduct.name}"?
            </h3>
            <p className="text-xs text-text-muted font-semibold leading-relaxed">
              This will hide the item from customer search, category listings, and prevent new checkouts. Historical customer orders and past purchase invoices containing this product will remain completely intact.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeactivateModalProduct(null)}
                className="px-4 py-2 bg-bg-secondary text-text-muted hover:text-text-main rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await dispatch(deleteAdminProduct(deactivateModalProduct._id));
                  setDeactivateModalProduct(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer"
              >
                Confirm Deactivation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;

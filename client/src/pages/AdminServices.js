import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash, Clock, PlusCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { formatINR } from '../utils/currency';

export const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Form inputs
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Installation');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [difficulty, setDifficulty] = useState('standard');

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await api.get('/services');
      const items = response.data?.data || [];
      const uniqueItems = Array.from(
        new Map(
          items
            .filter((s) => s && s._id)
            .map((s) => [String(s._id), s])
        ).values()
      );
      setServices(uniqueItems);
    } catch {
      toast.error('Failed to load services catalog from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    api.get('/services')
      .then((res) => {
        if (!isMounted) return;
        const items = res.data?.data || [];
        const uniqueItems = Array.from(
          new Map(
            items
              .filter((s) => s && s._id)
              .map((s) => [String(s._id), s])
          ).values()
        );
        setServices(uniqueItems);
      })
      .catch(() => {
        if (isMounted) toast.error('Failed to load services catalog from server.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!title.trim() || !price || !duration) {
      toast.error('Service title, base price, and duration are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || `${title.trim()} provided by certified electricians.`,
        category,
        basePrice: parseFloat(price),
        estimatedMinutes: parseInt(duration, 10),
        difficulty,
      };

      await api.post('/services', payload);

      toast.success(`Service "${title}" published successfully!`);
      setModalOpen(false);

      // Reset Form
      setTitle('');
      setDescription('');
      setPrice('');
      setDuration('');
      setDifficulty('standard');

      // Refresh catalog from server
      await fetchServices();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create service. Please check details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, servTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${servTitle}" from the catalog?`)) {
      return;
    }

    try {
      await api.delete(`/services/${id}`);
      setServices((prev) => prev.filter((s) => s._id !== id));
      toast.success(`Removed "${servTitle}" from catalog.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove service.');
    }
  };

  const uniqueServices = useMemo(() => {
    return Array.from(
      new Map(
        services
          .filter((s) => s && s._id)
          .map((s) => [String(s._id), s])
      ).values()
    );
  }, [services]);

  return (
    React.createElement("div", { className: "space-y-8" },
      React.createElement("div", { className: "flex justify-between items-center flex-wrap gap-4" },
        React.createElement("div", null,
          React.createElement("h1", { className: "text-3xl font-extrabold tracking-tight" }, "Services Catalog Admin"),
          React.createElement("p", { className: "text-text-muted mt-2 font-semibold" }, "Publish new professional repair catalogs or install programs.")
        ),
        React.createElement("div", { className: "flex items-center gap-3" },
          React.createElement("button", {
            onClick: fetchServices,
            className: "p-3 bg-bg-primary hover:bg-bg-secondary border border-border text-text-muted hover:text-text-main rounded-xl transition-all",
            title: "Refresh services list"
          }, React.createElement(RefreshCw, { size: 16, className: loading ? "animate-spin" : "" })),
          React.createElement("button", {
            onClick: () => setModalOpen(true),
            className: "px-5 py-3 bg-primary hover:bg-primary-light text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95 cursor-pointer"
          },
            React.createElement(Plus, { size: 16 }), " ", React.createElement("span", null, "Add New Service Offering")
          )
        )
      ),

      React.createElement("div", { className: "glass-card p-6 rounded-2xl border border-border shadow-lg" },
        loading ? (
          React.createElement("div", { className: "text-center py-12 text-text-muted text-sm font-semibold flex items-center justify-center gap-2" },
            React.createElement(RefreshCw, { size: 16, className: "animate-spin text-primary" }), " Loading services catalog..."
          )
        ) : uniqueServices.length === 0 ? (
          React.createElement("div", { className: "text-center py-12 text-text-muted text-sm font-semibold space-y-2" },
            React.createElement(AlertTriangle, { size: 36, className: "mx-auto text-secondary mb-2" }),
            React.createElement("p", null, "No services in catalog. Click 'Add New Service Offering' above.")
          )
        ) : (
          React.createElement("div", { className: "overflow-x-auto w-full" },
            React.createElement("table", { className: "w-full text-left border-collapse" },
              React.createElement("thead", null,
                React.createElement("tr", { className: "border-b border-border/80 text-xs text-text-muted uppercase font-black tracking-wider" },
                  React.createElement("th", { className: "pb-3.5 pl-2" }, "Service Title"),
                  React.createElement("th", { className: "pb-3.5" }, "Category"),
                  React.createElement("th", { className: "pb-3.5" }, "Base Quote Price"),
                  React.createElement("th", { className: "pb-3.5" }, "Estimated Duration"),
                  React.createElement("th", { className: "pb-3.5" }, "Difficulty"),
                  React.createElement("th", { className: "pb-3.5 text-right pr-4" }, "Actions")
                )
              ),
              React.createElement("tbody", { className: "divide-y divide-border/60 text-sm font-semibold" },
                uniqueServices.map((s) =>
                  React.createElement("tr", { key: s._id, className: "hover:bg-bg-secondary/40 transition-colors" },
                    React.createElement("td", { className: "py-4 pl-2 font-bold text-text-main" }, s.title),
                    React.createElement("td", { className: "py-4 text-xs font-bold text-primary" }, s.category),
                    React.createElement("td", { className: "py-4 font-black text-text-main" }, formatINR(s.basePrice)),
                    React.createElement("td", { className: "py-4 text-xs text-text-muted flex items-center gap-1 mt-3" },
                      React.createElement(Clock, { size: 14, className: "text-primary shrink-0" }), " ", s.durationEstimateMinutes || s.estimatedMinutes || 60, " mins"
                    ),
                    React.createElement("td", { className: "py-4 text-xs" },
                      React.createElement("span", {
                        className: `text-[10px] font-black uppercase px-2 py-0.5 rounded shadow ${
                          s.difficulty === 'complex' ? 'bg-red-500 text-white' :
                          s.difficulty === 'standard' ? 'bg-amber-500 text-white' : 'bg-green-500 text-white'
                        }`
                      }, s.difficulty || 'standard')
                    ),
                    React.createElement("td", { className: "py-4 text-right pr-4" },
                      React.createElement("button", {
                        onClick: () => handleDelete(s._id, s.title),
                        className: "p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer",
                        title: "Delete Service"
                      }, React.createElement(Trash, { size: 15 }))
                    )
                  )
                )
              )
            )
          )
        )
      ),

      modalOpen && React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4" },
        React.createElement("div", { className: "fixed inset-0 bg-slate-900/60 backdrop-blur-sm", onClick: () => !submitting && setModalOpen(false) }),
        React.createElement("div", { className: "glass-card bg-bg-primary max-w-md w-full rounded-2xl shadow-2xl p-6 relative z-10 border border-border" },
          React.createElement("h3", { className: "text-xl font-extrabold mb-5" }, "Append Service Catalog"),

          React.createElement("form", { onSubmit: handleCreate, className: "space-y-4" },
            React.createElement("div", null,
              React.createElement("label", { className: "block text-xs font-bold text-text-muted uppercase mb-1" }, "Service Title *"),
              React.createElement("input", {
                type: "text",
                required: true,
                placeholder: "e.g. Generator Transfer Switch setup",
                value: title,
                disabled: submitting,
                onChange: (e) => setTitle(e.target.value),
                className: "w-full bg-bg-secondary border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold text-text-main disabled:opacity-60"
              })
            ),

            React.createElement("div", null,
              React.createElement("label", { className: "block text-xs font-bold text-text-muted uppercase mb-1" }, "Description"),
              React.createElement("textarea", {
                rows: 2,
                placeholder: "Detailed service scope...",
                value: description,
                disabled: submitting,
                onChange: (e) => setDescription(e.target.value),
                className: "w-full bg-bg-secondary border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium text-text-main disabled:opacity-60"
              })
            ),

            React.createElement("div", { className: "grid grid-cols-2 gap-4" },
              React.createElement("div", null,
                React.createElement("label", { className: "block text-xs font-bold text-text-muted uppercase mb-1" }, "Category *"),
                React.createElement("select", {
                  value: category,
                  disabled: submitting,
                  onChange: (e) => setCategory(e.target.value),
                  className: "w-full bg-bg-secondary border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-bold text-text-main disabled:opacity-60"
                },
                  React.createElement("option", { value: "Installation" }, "Installation"),
                  React.createElement("option", { value: "Wiring" }, "Wiring"),
                  React.createElement("option", { value: "Repair" }, "Repair"),
                  React.createElement("option", { value: "Inspection" }, "Inspection")
                )
              ),
              React.createElement("div", null,
                React.createElement("label", { className: "block text-xs font-bold text-text-muted uppercase mb-1" }, "Difficulty *"),
                React.createElement("select", {
                  value: difficulty,
                  disabled: submitting,
                  onChange: (e) => setDifficulty(e.target.value),
                  className: "w-full bg-bg-secondary border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-bold text-text-main disabled:opacity-60"
                },
                  React.createElement("option", { value: "basic" }, "Basic"),
                  React.createElement("option", { value: "standard" }, "Standard"),
                  React.createElement("option", { value: "complex" }, "Complex")
                )
              )
            ),

            React.createElement("div", { className: "grid grid-cols-2 gap-4" },
              React.createElement("div", null,
                React.createElement("label", { className: "block text-xs font-bold text-text-muted uppercase mb-1" }, "Base Quote (₹) *"),
                React.createElement("input", {
                  type: "number",
                  required: true,
                  min: "1",
                  placeholder: "120",
                  value: price,
                  disabled: submitting,
                  onChange: (e) => setPrice(e.target.value),
                  className: "w-full bg-bg-secondary border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold text-text-main disabled:opacity-60"
                })
              ),
              React.createElement("div", null,
                React.createElement("label", { className: "block text-xs font-bold text-text-muted uppercase mb-1" }, "Duration (mins) *"),
                React.createElement("input", {
                  type: "number",
                  required: true,
                  min: "15",
                  placeholder: "90",
                  value: duration,
                  disabled: submitting,
                  onChange: (e) => setDuration(e.target.value),
                  className: "w-full bg-bg-secondary border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold text-text-main disabled:opacity-60"
                })
              )
            ),

            React.createElement("button", {
              type: "submit",
              disabled: submitting,
              className: "w-full bg-primary hover:bg-primary-light text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 transition-all text-sm mt-4 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            },
              submitting ? React.createElement(RefreshCw, { size: 15, className: "animate-spin" }) : React.createElement(PlusCircle, { size: 15 }),
              " ",
              React.createElement("span", null, submitting ? "Publishing Service..." : "Publish Service")
            )
          )
        )
      )
    )
  );
};

export default AdminServices;
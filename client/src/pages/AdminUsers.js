import React, { useState } from 'react';
import { User, Shield, Mail, Phone, Trash } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminUsers = () => {
  const [users, setUsers] = useState([
  { _id: 'u1', name: 'Alice Smith', email: 'alice@example.com', phoneNumber: '555-0199', role: 'user', isVerified: true },
  { _id: 'u3', name: 'Admin Master', email: 'admin@sparkcare.com', phoneNumber: '555-0100', role: 'admin', isVerified: true },
  { _id: 'u4', name: 'Bob Contractor', email: 'bob@example.com', phoneNumber: '555-0177', role: 'user', isVerified: false }]
  );

  const handleDelete = (id, name) => {
    if (name.includes('Admin')) {
      toast.error('Cannot remove root administrator account');
      return;
    }
    setUsers((prev) => prev.filter((u) => u._id !== id));
    toast.success(`User Account "${name}" terminated.`);
  };

  return (/*#__PURE__*/
    React.createElement("div", { className: "space-y-8" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("h1", { className: "text-3xl font-extrabold tracking-tight" }, "Active User Registry"), /*#__PURE__*/
    React.createElement("p", { className: "text-text-muted mt-2 font-semibold" }, "Audit client databases, service electricians, and operational access levels.")
    ), /*#__PURE__*/

    React.createElement("div", { className: "glass-card p-6 rounded-2xl border border-border shadow-lg" }, /*#__PURE__*/
    React.createElement("div", { className: "overflow-x-auto w-full" }, /*#__PURE__*/
    React.createElement("table", { className: "w-full text-left border-collapse" }, /*#__PURE__*/
    React.createElement("thead", null, /*#__PURE__*/
    React.createElement("tr", { className: "border-b border-border/80 text-xs text-text-muted uppercase font-black tracking-wider" }, /*#__PURE__*/
    React.createElement("th", { className: "pb-3.5 pl-2" }, "Name / Identity"), /*#__PURE__*/
    React.createElement("th", { className: "pb-3.5" }, "Email ID"), /*#__PURE__*/
    React.createElement("th", { className: "pb-3.5" }, "Phone Contact"), /*#__PURE__*/
    React.createElement("th", { className: "pb-3.5" }, "Authorization Role"), /*#__PURE__*/
    React.createElement("th", { className: "pb-3.5" }, "Verified Status"), /*#__PURE__*/
    React.createElement("th", { className: "pb-3.5 text-right pr-4" }, "Actions")
    )
    ), /*#__PURE__*/
    React.createElement("tbody", { className: "divide-y divide-border/60 text-sm font-semibold" },
    users.map((u) => /*#__PURE__*/
    React.createElement("tr", { key: u._id, className: "hover:bg-bg-secondary/40 transition-colors" }, /*#__PURE__*/
    React.createElement("td", { className: "py-4 pl-2 font-bold text-text-main flex items-center gap-2" }, /*#__PURE__*/
    React.createElement("div", { className: "w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold" },
    u.name[0].toUpperCase()
    ), /*#__PURE__*/
    React.createElement("span", null, u.name)
    ), /*#__PURE__*/
    React.createElement("td", { className: "py-4 text-xs text-text-muted" }, /*#__PURE__*/
    React.createElement("span", { className: "flex items-center gap-1" }, /*#__PURE__*/React.createElement(Mail, { size: 13, className: "text-primary" }), " ", u.email)
    ), /*#__PURE__*/
    React.createElement("td", { className: "py-4 text-xs text-text-muted" }, /*#__PURE__*/
    React.createElement("span", { className: "flex items-center gap-1" }, /*#__PURE__*/React.createElement(Phone, { size: 13, className: "text-primary" }), " ", u.phoneNumber)
    ), /*#__PURE__*/
    React.createElement("td", { className: "py-4" }, /*#__PURE__*/
    React.createElement("span", { className: `inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
      u.role === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-primary/10 text-primary border-primary/20'}` },

    u.role === 'admin' ? /*#__PURE__*/React.createElement(Shield, { size: 12 }) : /*#__PURE__*/React.createElement(User, { size: 12 }), /*#__PURE__*/
    React.createElement("span", { className: "ml-0.5" }, u.role)
    )
    ), /*#__PURE__*/
    React.createElement("td", { className: "py-4" }, /*#__PURE__*/
    React.createElement("span", { className: `text-xs font-bold ${u.isVerified ? 'text-green-500' : 'text-text-muted'}` },
    u.isVerified ? 'Verified Active' : 'Email Pending'
    )
    ), /*#__PURE__*/
    React.createElement("td", { className: "py-4 text-right pr-4" }, /*#__PURE__*/
    React.createElement("button", {
      onClick: () => handleDelete(u._id, u.name),
      className: "p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all",
      title: "Terminate User" }, /*#__PURE__*/

    React.createElement(Trash, { size: 15 })
    )
    )
    )
    )
    )
    )
    )
    )
    ));

};
export default AdminUsers;
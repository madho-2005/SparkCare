import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminUsers, deleteAdminUser, updateUserRole } from '../redux/adminSlice';
import { User as UserIcon, Shield, Mail, Phone, Trash2, Calendar, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminUsers = () => {
  const dispatch = useDispatch();
  const { users = [], loading } = useSelector((state) => state.admin);
  const currentAdmin = useSelector((state) => state.auth?.user);

  useEffect(() => {
    dispatch(fetchAdminUsers());
  }, [dispatch]);

  const handleDelete = (userId, name, role) => {
    if (role === 'admin') {
      toast.error('Cannot remove administrator accounts.');
      return;
    }
    if (currentAdmin && currentAdmin._id === userId) {
      toast.error('You cannot delete your own logged-in account.');
      return;
    }
    if (window.confirm(`Are you sure you want to terminate account "${name}"?`)) {
      dispatch(deleteAdminUser(userId));
    }
  };

  const handleToggleRole = (userId, currentRole, name) => {
    if (currentAdmin && currentAdmin._id === userId) {
      toast.error('You cannot change your own administrative role.');
      return;
    }
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    if (window.confirm(`Change role for "${name}" from ${currentRole.toUpperCase()} to ${nextRole.toUpperCase()}?`)) {
      dispatch(updateUserRole({ userId, role: nextRole }));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-main">Active User Registry</h1>
          <p className="text-text-muted mt-2 font-medium">
            Live database of registered customers and administrators stored in MongoDB ({users.length} total).
          </p>
        </div>
        <button
          onClick={() => dispatch(fetchAdminUsers())}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-secondary hover:bg-bg-secondary/80 border border-border text-sm font-semibold text-text-main transition-colors w-fit"
          title="Refresh user list"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-border shadow-lg">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/80 text-xs text-text-muted uppercase font-black tracking-wider">
                <th className="pb-3.5 pl-2">Name / Identity</th>
                <th className="pb-3.5">Email ID</th>
                <th className="pb-3.5">Phone Contact</th>
                <th className="pb-3.5">Authorization Role</th>
                <th className="pb-3.5">Registered</th>
                <th className="pb-3.5 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-sm font-semibold">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-muted">
                    <div className="inline-flex items-center gap-3">
                      <RefreshCw size={18} className="animate-spin text-primary" />
                      <span>Loading real users from database...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-muted font-normal">
                    No registered accounts found in the database.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isAdmin = u.role === 'admin';
                  const isSelf = currentAdmin && currentAdmin._id === u._id;
                  const initial = (u.name && u.name.trim().length > 0 ? u.name.trim()[0] : 'U').toUpperCase();
                  const registeredDate = u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'N/A';

                  return (
                    <tr key={u._id} className="hover:bg-bg-secondary/40 transition-colors">
                      <td className="py-4 pl-2 font-bold text-text-main">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                              isAdmin
                                ? 'bg-red-500/15 text-red-500 border border-red-500/30'
                                : 'bg-primary/10 text-primary border border-primary/20'
                            }`}
                          >
                            {initial}
                          </div>
                          <div>
                            <div className="font-bold flex items-center gap-2">
                              <span>{u.name || 'Anonymous User'}</span>
                              {isSelf && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-text-muted/70 font-mono">ID: {u._id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 text-xs text-text-muted">
                        <span className="flex items-center gap-1.5 font-mono">
                          <Mail size={13} className="text-primary shrink-0" />
                          <span className="text-text-main font-medium">{u.email}</span>
                        </span>
                      </td>

                      <td className="py-4 text-xs text-text-muted">
                        <span className="flex items-center gap-1.5">
                          <Phone size={13} className="text-primary shrink-0" />
                          <span>{u.phoneNumber || 'Not provided'}</span>
                        </span>
                      </td>

                      <td className="py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleRole(u._id, u.role, u.name)}
                          disabled={isSelf}
                          title={isSelf ? 'Cannot change own role' : `Click to change role to ${isAdmin ? 'user' : 'admin'}`}
                          className={`inline-flex items-center gap-1.5 text-[11px] font-black uppercase px-2.5 py-1 rounded-full border transition-all ${
                            isAdmin
                              ? 'bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20'
                              : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                          } ${isSelf ? 'cursor-default opacity-90' : 'cursor-pointer'}`}
                        >
                          {isAdmin ? <Shield size={12} /> : <UserIcon size={12} />}
                          <span>{u.role}</span>
                        </button>
                      </td>

                      <td className="py-4 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <Calendar size={13} className="text-text-muted/60" />
                          <span>{registeredDate}</span>
                        </span>
                      </td>

                      <td className="py-4 text-right pr-4">
                        {isAdmin || isSelf ? (
                          <span
                            className="p-2 text-text-muted/40 cursor-not-allowed inline-block"
                            title={isSelf ? 'Cannot delete your own account' : 'Admin accounts protected'}
                          >
                            <Trash2 size={16} />
                          </span>
                        ) : (
                          <button
                            onClick={() => handleDelete(u._id, u.name, u.role)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            title={`Terminate user account "${u.name}"`}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import userService from "../../services/user.service";
import { getErrorMessage } from "../../lib/http";

const STATUS_TABS = [
  { label: 'ALL USERS', value: '', type: 'status' },
  { label: 'ACTIVE', value: 'false', type: 'status' },
  { label: 'BLOCKED', value: 'true', type: 'status' },
];

const ROLE_TABS = [
  { label: 'ALL ROLES', value: '', type: 'role' },
  { label: 'USERS', value: 'user', type: 'role' },
  { label: 'ADMINS', value: 'admin', type: 'role' },
];

function UserInfo() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(""); // is_blocked (true/false)
  const [role, setRole] = useState("");
  const limit = 10;

  const fetchUsers = useCallback(async (p = 1, s = "") => {
    setLoading(true);
    try {
      const { users: rows, total: t, page: pg } = await userService.listUsers({
        page: p,
        limit,
        search: s || undefined,
        is_blocked: status || undefined,
        role: role || undefined,
      });
      setUsers(rows);
      setTotal(t);
      setPage(pg);
    } catch (e) {
      toast.error(getErrorMessage(e) || "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [status, role]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1, search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, status, role, fetchUsers]);

  const handleBlockToggle = async (user) => {
    try {
      if (user.is_blocked) {
        await userService.unblockUser(user.id);
        toast.success("User unblocked");
      } else {
        await userService.blockUser(user.id);
        toast.success("User blocked");
      }
      fetchUsers(page);
    } catch (e) {
      toast.error(getErrorMessage(e) || "Action failed");
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user ${user.email}?`)) return;
    try {
      await userService.deleteUser(user.id);
      toast.success("User deleted");
      fetchUsers(page);
    } catch (e) {
      toast.error(getErrorMessage(e) || "Delete failed");
    }
  };

  const displayedUsers = users; // Previously filtered by role !== admin, now controlled by role filter

  if (loading && !users.length) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-blue-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User management</h1>
            <p className="text-gray-600">Block, unblock, or remove customer accounts</p>
          </div>
          <div className="w-full md:w-80">
             <div className="relative">
                <input
                  type="text"
                  placeholder="Search user name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
             </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-6">
          {/* Status Tabs */}
          <div className="flex flex-wrap justify-start sm:justify-center gap-2 no-scrollbar overflow-x-auto pb-2">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.label}
                onClick={() => setStatus(tab.value)}
                className={`px-4 py-2 sm:px-6 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-200 border
                  ${status === tab.value
                    ? 'bg-gray-900 text-white border-gray-900 scale-105 shadow-lg shadow-gray-200'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-900 hover:text-gray-900'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Role Tabs */}
          <div className="flex flex-wrap justify-start sm:justify-center gap-2 no-scrollbar overflow-x-auto">
            {ROLE_TABS.map((tab) => (
              <button
                key={tab.label}
                onClick={() => setRole(tab.value)}
                className={`px-4 py-2 sm:px-6 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-200 border
                  ${role === tab.value
                    ? 'bg-gray-900 text-white border-gray-900 scale-105 shadow-lg shadow-gray-200'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-900 hover:text-gray-900'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
          <div className="hidden lg:grid grid-cols-12 px-6 py-4 bg-gray-100/50 border-b border-gray-200">
            <div className="col-span-3 font-medium text-gray-700 text-sm uppercase tracking-wide">
              User
            </div>
            <div className="col-span-3 font-medium text-gray-700 text-sm uppercase tracking-wide">
              Email
            </div>
            <div className="col-span-2 font-medium text-gray-700 text-sm uppercase tracking-wide text-center">
              Role
            </div>
            <div className="col-span-2 font-medium text-gray-700 text-sm uppercase tracking-wide text-center">
              Status
            </div>
            <div className="col-span-2 font-medium text-gray-700 text-sm uppercase tracking-wide text-center">
              Actions
            </div>
          </div>

          <div className="divide-y divide-gray-200/60">
            {displayedUsers.length > 0 ? (
              <>
                {/* Desktop View */}
                {displayedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="hidden lg:grid grid-cols-12 items-center px-6 py-4 hover:bg-gray-50/50"
                  >
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center border border-indigo-100">
                        <span className="text-indigo-600 font-bold text-sm">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">
                          Joined: {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                        </p>
                      </div>
                    </div>
                    <div className="col-span-3">
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest bg-gray-50 text-gray-600 border border-gray-200">
                        {user.role}
                      </span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span
                        className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${
                          user.is_blocked
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {user.is_blocked ? "Blocked" : "Active"}
                      </span>
                    </div>
                    <div className="col-span-2 flex justify-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleBlockToggle(user)}
                        className={`px-3 py-2 rounded-lg border text-xs font-bold uppercase tracking-widest transition-all ${
                          user.is_blocked
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                        }`}
                      >
                        {user.is_blocked ? "Unblock" : "Block"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(user)}
                        className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Mobile View */}
                <div className="lg:hidden divide-y">
                  {displayedUsers.map((user) => (
                    <div key={user.id} className="p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center border border-indigo-100">
                            <span className="text-indigo-600 font-bold text-sm">
                              {user.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500 italic">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border ${
                            user.is_blocked ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                          }`}>
                            {user.is_blocked ? "Blocked" : "Active"}
                          </span>
                          <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                            {user.role}
                          </span>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                         <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Join Date</p>
                         <p className="text-sm font-bold text-gray-700">
                            {user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { dateStyle: 'long' }) : "—"}
                         </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleBlockToggle(user)}
                          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition active:scale-95 ${
                            user.is_blocked
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100 active:bg-emerald-100"
                              : "bg-red-50 text-red-600 border-red-100 active:bg-red-100"
                          }`}
                        >
                          {user.is_blocked ? "Unblock Account" : "Block Account"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(user)}
                          className="w-12 h-12 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition active:scale-95"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">No users match your filters</div>
            )}
          </div>
        </div>

        {total > limit && (
          <div className="flex justify-center gap-4 mt-6">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => fetchUsers(page - 1, search)}
              className="px-4 py-2 border rounded-lg disabled:opacity-40 transition-all hover:border-gray-900 active:scale-95"
            >
              Previous
            </button>
            <span className="py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
              Page {page} · {total} total
            </span>
            <button
              type="button"
              disabled={page * limit >= total}
              onClick={() => fetchUsers(page + 1, search)}
              className="px-4 py-2 border rounded-lg disabled:opacity-40 transition-all hover:border-gray-900 active:scale-95"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserInfo;

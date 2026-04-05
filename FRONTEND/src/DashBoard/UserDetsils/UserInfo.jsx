import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import userService from "../../services/userService";
import { getErrorMessage } from "../../lib/http";

function UserInfo() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchUsers = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { users: rows, total: t, page: pg } = await userService.listUsers({
        page: p,
        limit,
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
  }, []);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

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

  const regularUsers = users.filter((u) => u.role !== "admin");

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User management</h1>
          <p className="text-gray-600">Block, unblock, or remove customer accounts</p>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <p className="text-2xl font-bold text-gray-900">{regularUsers.length}</p>
            <p className="text-gray-600 text-sm">Users on page</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <p className="text-2xl font-bold text-green-600">
              {regularUsers.filter((u) => !u.is_blocked).length}
            </p>
            <p className="text-gray-600 text-sm">Active (page)</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <p className="text-2xl font-bold text-red-600">
              {regularUsers.filter((u) => u.is_blocked).length}
            </p>
            <p className="text-gray-600 text-sm">Blocked (page)</p>
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
            {regularUsers.length > 0 ? (
              regularUsers.map((user) => (
                <div
                  key={user.id}
                  className="hidden lg:grid grid-cols-12 items-center px-6 py-4 hover:bg-gray-50/50"
                >
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">
                        Joined:{" "}
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString()
                          : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      {user.role}
                    </span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        user.is_blocked
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-green-50 text-green-700 border border-green-200"
                      }`}
                    >
                      {user.is_blocked ? "Blocked" : "Active"}
                    </span>
                  </div>
                  <div className="col-span-2 flex justify-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleBlockToggle(user)}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium ${
                        user.is_blocked
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {user.is_blocked ? "Unblock" : "Block"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(user)}
                      className="px-3 py-2 rounded-lg border text-sm text-gray-700 border-gray-200 hover:bg-gray-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">No users on this page</div>
            )}
          </div>

          <div className="lg:hidden divide-y">
            {regularUsers.map((user) => (
              <div key={user.id} className="p-4">
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => handleBlockToggle(user)}
                    className="flex-1 py-2 rounded-lg border text-sm"
                  >
                    {user.is_blocked ? "Unblock" : "Block"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(user)}
                    className="flex-1 py-2 rounded-lg border text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {total > limit && (
          <div className="flex justify-center gap-4 mt-6">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => fetchUsers(page - 1)}
              className="px-4 py-2 border rounded-lg disabled:opacity-40"
            >
              Previous
            </button>
            <span className="py-2 text-sm text-gray-600">
              Page {page} · {total} total
            </span>
            <button
              type="button"
              disabled={page * limit >= total}
              onClick={() => fetchUsers(page + 1)}
              className="px-4 py-2 border rounded-lg disabled:opacity-40"
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

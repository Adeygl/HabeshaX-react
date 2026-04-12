import React, { useEffect, useState } from "react";
import axios from "axios";

const API = axios.create({
  baseURL: "https://habeshaxnode-9821a8586656.herokuapp.com/api",
});

interface User {
  telegram_id: string;
  first_name: string;
  username: string;
  phone?: string;
  balance: number;
  total_orders: number;
  is_blocked: boolean;
  created_at: string;
}

const Support: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await API.get("/users", {
        params: { search },
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      let fetchedUsers = res.data.users || [];
      
      // Sort by balance (high to low by default)
      fetchedUsers = fetchedUsers.sort((a: User, b: User) => {
        return sortOrder === "desc" ? b.balance - a.balance : a.balance - b.balance;
      });
      
      setUsers(fetchedUsers);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = () => {
    const newOrder = sortOrder === "desc" ? "asc" : "desc";
    setSortOrder(newOrder);
    const sorted = [...users].sort((a, b) => {
      return newOrder === "desc" ? b.balance - a.balance : a.balance - b.balance;
    });
    setUsers(sorted);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-full overflow-x-hidden">
      <h1 className="text-xl md:text-2xl font-bold mb-4">Support / Users</h1>

      {/* SEARCH - Mobile Friendly */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          className="border p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search by ID, name, username or phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && fetchUsers()}
        />

        <button
          onClick={fetchUsers}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading users...</p>
        </div>
      )}

      {/* TABLE - Responsive */}
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="w-full text-sm md:text-base">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2 md:p-3">Telegram ID</th>
              <th className="p-2 md:p-3 hidden sm:table-cell">Name</th>
              <th className="p-2 md:p-3 hidden md:table-cell">Username</th>
              <th className="p-2 md:p-3 hidden lg:table-cell">Phone</th>
              <th 
                className="p-2 md:p-3 cursor-pointer hover:bg-gray-300 transition-colors"
                onClick={handleSort}
              >
                Balance {sortOrder === "desc" ? "↓" : "↑"}
              </th>
              <th className="p-2 md:p-3 hidden sm:table-cell">Orders</th>
              <th className="p-2 md:p-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 md:p-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.telegram_id} className="border-t hover:bg-gray-50 transition-colors">
                  {/* Mobile card view for small screens */}
                  <td className="p-2 md:p-3" data-label="Telegram ID">
                    <div className="sm:hidden">
                      <div className="font-semibold">{u.telegram_id}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {u.first_name && <div>Name: {u.first_name}</div>}
                        {u.username && <div>@{u.username}</div>}
                        {u.phone && <div>Phone: {u.phone}</div>}
                        <div>Orders: {u.total_orders}</div>
                      </div>
                    </div>
                    <div className="hidden sm:block">{u.telegram_id}</div>
                  </td>
                  
                  <td className="p-2 md:p-3 hidden sm:table-cell">
                    {u.first_name || "-"}
                  </td>
                  
                  <td className="p-2 md:p-3 hidden md:table-cell">
                    @{u.username || "-"}
                  </td>
                  
                  <td className="p-2 md:p-3 hidden lg:table-cell">
                    {u.phone || "-"}
                  </td>
                  
                  <td className="p-2 md:p-3 font-semibold">
                    {u.balance.toLocaleString()} ETB
                  </td>
                  
                  <td className="p-2 md:p-3 hidden sm:table-cell">
                    {u.total_orders}
                  </td>
                  
                  <td className="p-2 md:p-3">
                    {u.is_blocked ? (
                      <span className="text-red-600 font-medium">Blocked</span>
                    ) : (
                      <span className="text-green-600 font-medium">Active</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Cards for Mobile */}
      {!loading && users.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:hidden">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-xs text-gray-600">Total Users</div>
            <div className="text-lg font-bold">{users.length}</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-xs text-gray-600">Total Balance</div>
            <div className="text-lg font-bold">
              {users.reduce((sum, u) => sum + u.balance, 0).toLocaleString()} ETB
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;
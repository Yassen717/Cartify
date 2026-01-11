import { useEffect, useState } from 'react';
import { getAllUsers } from '../../services/admin.service';
import type { AdminUser } from '../../services/admin.service';
import toast from 'react-hot-toast';
import { FiSearch } from 'react-icons/fi';
import './UsersManagement.css';

const UsersManagement = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await getAllUsers(page, 10, search || undefined);
            setUsers(response.data.users);
            setTotalPages(response.data.pagination.totalPages);
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, search]);

    const getRoleBadgeClass = (role: string) => {
        return role === 'ADMIN' ? 'admin' : 'user';
    };

    return (
        <div className="users-management">
            <div className="users-header">
                <h1>Users</h1>
            </div>

            <div className="search-container">
                <FiSearch className="search-icon" />
                <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Orders</th>
                            <th>Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="users-loading">Loading...</td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="users-empty">No users found</td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id}>
                                    <td className="user-name">
                                        {user.firstName} {user.lastName}
                                    </td>
                                    <td className="user-email">
                                        {user.email}
                                    </td>
                                    <td>
                                        <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="order-count">
                                        {user._count.orders} orders
                                    </td>
                                    <td className="join-date">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="pagination">
                <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="pagination-btn"
                >
                    Previous
                </button>
                <span className="pagination-info">
                    Page {page} of {totalPages}
                </span>
                <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="pagination-btn"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default UsersManagement;

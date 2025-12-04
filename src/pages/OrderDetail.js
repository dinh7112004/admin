import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../config';
import { useAdminAuth } from '../../src/contexts/AdminAuthContext';
import './StyleWeb/OrderDetail.css';
import { StatisticsContext } from "../layouts/AdminLayout";
import { calculateOrderTotal } from '../utils/orderUtils';

// Trạng thái đơn hàng (map cho hiển thị)
const statusMap = {
    pending: 'Chờ xác nhận',
    payment_verified: 'Đã xác nhận thanh toán',
    confirmed: 'Đã xác nhận',
    processing: 'Đang xử lý',
    packing: 'Đang đóng gói',
    ready_to_ship: 'Sẵn sàng giao',
    picked_up: 'Đã lấy hàng',
    in_transit: 'Đang vận chuyển',
    out_for_delivery: 'Đang giao hàng',
    delivered: 'Đã giao hàng',
    completed: 'Hoàn thành',
    return_requested: 'Yêu cầu trả hàng',
    returning: 'Đang trả hàng',
    returned: 'Đã trả hàng',
    refund_pending: 'Chờ hoàn tiền',
    refunded: 'Đã hoàn tiền',
    cancelled: 'Đã hủy đơn',
};

// Trạng thái hợp lệ tiếp theo
const getAvailableStatusOptions = (currentStatus) => {
    // return full
    return [
        'pending',
        'payment_verified',
        'confirmed',
        'processing',
        'packing',
        'ready_to_ship',
        'picked_up',
        'in_transit',
        'out_for_delivery',
        'delivered',
        'completed',
        'return_requested',
        'returning',
        'returned',
        'refund_pending',
        'refunded',
        'cancelled',
    ]
};

export default function OrderDetail() {
    const { id } = useParams();
    const { adminToken } = useAdminAuth();
    const { triggerRefreshStatistics } = useContext(StatisticsContext);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newStatus, setNewStatus] = useState('');
    const [updating, setUpdating] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (adminToken) {
            fetchOrder();
        }
    }, [adminToken]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${BASE_URL}/api/orders/admin/orders/${id}`, {
                headers: { Authorization: `Bearer ${adminToken}` },
            });

            if (res.data.success) {
                setOrder(res.data.data);
                setNewStatus('');
            } else {
                alert("Không tìm thấy đơn hàng.");
                navigate('/orders');
            }
        } catch (err) {
            console.error("Lỗi khi tải đơn hàng:", err);
            alert("Không thể tải thông tin đơn hàng.");
            navigate('/orders');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (!newStatus || newStatus === order.status) return;

        try {
            setUpdating(true);
            const res = await axios.put(
                `${BASE_URL}/api/orders/${id}/status`,
                { status: newStatus },
                {
                    headers: { Authorization: `Bearer ${adminToken}` },
                }
            );
            if (res.data.success) {
                setOrder(res.data.data);
                alert("Cập nhật trạng thái thành công!");
                triggerRefreshStatistics();
            }
        } catch (err) {
            console.error("Lỗi cập nhật:", err);
            alert("Cập nhật thất bại.");
        } finally {
            setUpdating(false);
        }
    };

    const handleConfirmOrder = async () => {
        if (!window.confirm("Xác nhận đơn hàng này?")) return;

        try {
            setUpdating(true);
            const res = await axios.put(
                `${BASE_URL}/api/orders/${id}/status`,
                { status: 'confirmed' },
                {
                    headers: { Authorization: `Bearer ${adminToken}` },
                }
            );
            if (res.data.success) {
                setOrder(res.data.data);
                alert("Xác nhận đơn hàng thành công!");
                triggerRefreshStatistics();
            }
        } catch (err) {
            console.error("Lỗi xác nhận:", err);
            alert("Xác nhận thất bại.");
        } finally {
            setUpdating(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn huỷ đơn hàng này không?")) return;

        try {
            setUpdating(true);
            const res = await axios.put(
                `${BASE_URL}/api/orders/${id}/cancel`,
                {},
                {
                    headers: { Authorization: `Bearer ${adminToken}` },
                }
            );
            if (res.data.success) {
                setOrder(res.data.data);
                triggerRefreshStatistics();
                alert("Huỷ đơn hàng thành công!");
            }
        } catch (err) {
            console.error("Lỗi khi huỷ đơn hàng:", err);
            alert("Huỷ đơn hàng thất bại.");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="loading-message">Đang tải chi tiết đơn hàng...</div>;
    if (!order) return <div className="error-message">Không tìm thấy đơn hàng.</div>;

    const availableStatusOptions = getAvailableStatusOptions(order.status);

    // Calculate subtotal
    const subtotal = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

    // Calculate total - ALWAYS from items, never use total_amount
    const displayTotal = calculateOrderTotal(order);

    return (
        <div className="order-detail-page">
            <div className="order-detail-header">
                <h2>Chi tiết đơn hàng</h2>
                <button onClick={() => navigate('/orders')} className="back-button">
                    ← Quay lại danh sách
                </button>
            </div>

            {/* Quick Actions for Pending Orders */}
            {order.status === 'pending' && (
                <div className="quick-actions">
                    <button
                        onClick={handleConfirmOrder}
                        className="confirm-button"
                        disabled={updating}
                    >
                        {updating ? "Đang xử lý..." : "✓ Xác nhận đơn hàng"}
                    </button>
                    <button
                        onClick={handleCancelOrder}
                        className="cancel-button-quick"
                        disabled={updating}
                    >
                        {updating ? "Đang xử lý..." : "✗ Huỷ đơn hàng"}
                    </button>
                </div>
            )}

            {/* Order Information */}
            <div className="order-section">
                <h3>Thông tin đơn hàng</h3>
                <table className="order-table">
                    <tbody>
                        <tr>
                            <td><strong>Mã đơn</strong></td>
                            <td>{order.order_code || `#${order._id.slice(-6).toUpperCase()}`}</td>
                        </tr>
                        <tr>
                            <td><strong>Khách hàng</strong></td>
                            <td>{order.user_id?.full_name} ({order.user_id?.email})</td>
                        </tr>
                        <tr>
                            <td><strong>Ngày tạo</strong></td>
                            <td>{new Date(order.createdAt).toLocaleString('vi-VN')}</td>
                        </tr>
                        <tr>
                            <td><strong>Trạng thái</strong></td>
                            <td>
                                <span className={`status-label status-${order.status}`}>
                                    {statusMap[order.status]}
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td><strong>Phương thức thanh toán</strong></td>
                            <td>
                                <span className={`payment-tag ${order.payment_method === 'vnpay' ? 'online' : 'cod'}`}>
                                    {order.payment_method === 'cash' ? 'Thanh toán khi nhận hàng (COD)' :
                                        order.payment_method === 'vnpay' ? 'VNPay' : order.payment_method}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Shipping Address */}
            {order.address && (
                <div className="order-section">
                    <h3>Địa chỉ giao hàng</h3>
                    <table className="order-table">
                        <tbody>
                            <tr>
                                <td><strong>Người nhận</strong></td>
                                <td>{order.address.full_name}</td>
                            </tr>
                            <tr>
                                <td><strong>SĐT</strong></td>
                                <td>{order.address.phone_number}</td>
                            </tr>
                            <tr>
                                <td><strong>Địa chỉ</strong></td>
                                <td>
                                    {order.address.street}, {order.address.ward}, {order.address.district}, {order.address.province}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {/* Products */}
            <div className="order-section">
                <h3>Sản phẩm</h3>
                <table className="product-table">
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th>Đơn giá</th>
                            <th>Số lượng</th>
                            <th>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items?.map((item, index) => (
                            <tr key={index}>
                                <td>
                                    <div className="product-info">
                                        {item.product_id?.image && (
                                            <img
                                                src={item.product_id.image}
                                                alt={item.product_id?.name || item.name}
                                                className="product-thumbnail"
                                            />
                                        )}
                                        <div className="product-details">
                                            <div className="product-name">
                                                {item.product_id?.name || item.name || 'Không có tên'}
                                            </div>
                                            {(item.size || item.color) && (
                                                <div className="product-variants">
                                                    {item.size && <span className="variant-badge">Size: {item.size}</span>}
                                                    {item.color && <span className="variant-badge">Màu: {item.color}</span>}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td>{item.price.toLocaleString()} VND</td>
                                <td className="quantity-cell">x{item.quantity}</td>
                                <td className="amount-cell">{(item.price * item.quantity).toLocaleString()} VND</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Order Totals */}
            <div className="order-section">
                <h3>Tổng tiền</h3>
                <table className="totals-table">
                    <tbody>
                        <tr>
                            <td>Tạm tính ({order.items?.length || 0} sản phẩm)</td>
                            <td className="amount-cell">{subtotal.toLocaleString()} VND</td>
                        </tr>
                        <tr>
                            <td>Phí vận chuyển</td>
                            <td className="amount-cell">{(order.shipping_fee || 0).toLocaleString()} VND</td>
                        </tr>
                        <tr className="total-row">
                            <td><strong>Tổng cộng</strong></td>
                            <td className="amount-cell total-amount">
                                <strong>{displayTotal.toLocaleString()} VND</strong>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Status Update Section */}
            {availableStatusOptions.length > 0 && (
                <div className="order-section">
                    <h3>Cập nhật trạng thái</h3>
                    <div className="status-update-section">
                        <label>Thay đổi trạng thái đơn hàng:</label>
                        <div className="status-actions">
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="status-select"
                            >
                                <option value="">-- Chọn trạng thái --</option>
                                {availableStatusOptions.map((status) => (
                                    <option key={status} value={status}>
                                        {statusMap[status]}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleUpdateStatus}
                                disabled={updating || !newStatus || newStatus === order.status}
                                className="update-button"
                            >
                                {updating ? "Đang cập nhật..." : "Cập nhật trạng thái"}
                            </button>

                            {availableStatusOptions.includes("cancelled") && order.status !== 'pending' && (
                                <button
                                    onClick={handleCancelOrder}
                                    className="cancel-button"
                                    disabled={updating}
                                >
                                    {updating ? "Đang huỷ..." : "Huỷ đơn hàng"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

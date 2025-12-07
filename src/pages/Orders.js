import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config';
import { useAdminAuth } from '../../src/contexts/AdminAuthContext';
import './StyleWeb/OrderList.css';
import { Link } from 'react-router-dom';
import { calculateOrderTotal } from '../utils/orderUtils';

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

export default function OrderList() {
  const { adminToken } = useAdminAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    console.log("🔐 Token:", adminToken);
    if (adminToken) {
      fetchOrders();
    }
  }, [statusFilter, sortOrder, adminToken]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/orders/admin/orders`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        params: {
          status: statusFilter,
          sort: sortOrder,
        },
      });
      setOrders(res.data.data);
    } catch (err) {
      console.error('Lỗi khi tải đơn hàng:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-page">
      <h1>Đơn hàng</h1>

      {!adminToken ? (
        <div className="text-red-500 mt-4">Bạn chưa đăng nhập.</div>
      ) : (
        <>
          {/* Bộ lọc */}
          <div className="order-filters">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="payment_verified">Đã xác nhận thanh toán</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="processing">Đang xử lý</option>
              <option value="packing">Đang đóng gói</option>
              <option value="ready_to_ship">Sẵn sàng giao</option>
              <option value="picked_up">Đã lấy hàng</option>
              <option value="in_transit">Đang vận chuyển</option>
              <option value="out_for_delivery">Đang giao hàng</option>
              <option value="delivered">Đã giao hàng</option>
              <option value="completed">Hoàn thành</option>
              <option value="return_requested">Yêu cầu trả hàng</option>
              <option value="returning">Đang trả hàng</option>
              <option value="returned">Đã trả hàng</option>
              <option value="refund_pending">Chờ hoàn tiền</option>
              <option value="refunded">Đã hoàn tiền</option>
              <option value="cancelled">Đã hủy</option>
            </select>

            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="desc">Mới nhất</option>
              <option value="asc">Cũ nhất</option>
            </select>
            <button onClick={fetchOrders}>Làm mới</button>
          </div>

          {/* Bảng đơn hàng */}
          <div className="overflow-x-auto">
            <table className="order-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày đặt</th>
                  <th>Thanh toán</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">Đang tải đơn hàng...</td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-gray-500">
                      Không có đơn hàng nào.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id}>
                      <td className="text-blue-500 font-medium hover:underline cursor-pointer">
                        {order.order_code || `#${order._id.slice(-6).toUpperCase()}`}
                      </td>
                      <td>{order.user_id?.full_name || 'Ẩn danh'}</td>
                      <td>{calculateOrderTotal(order).toLocaleString()} VND</td>
                      <td>
                        <span className={`status-label status-${order.status}`}>
                          {statusMap[order.status] || 'Không rõ'}
                        </span>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleString()}</td>
                      <td>
                        <span className={`payment-tag ${order.payment_method === 'vnpay' ? 'online' : 'cod'}`}>
                          {order.payment_method === 'vnpay' ? 'ONLINE' : 'COD'}
                        </span>
                      </td>
                      <td>
                        <Link to={`/admin/orders/${order._id}`} className="order-action-btn">
                          Chi tiết
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

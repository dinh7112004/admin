import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../config';
import { useAdminAuth } from '../../src/contexts/AdminAuthContext';
import './StyleWeb/OrderDetail.css';
import { StatisticsContext } from "../layouts/AdminLayout";
// Tráº¡ng thÃ¡i Ä‘Æ¡n hÃ ng (map cho hiá»ƒn thá»‹)
const statusMap = {
    pending: 'Chá» xÃ¡c nháº­n',
    confirmed: 'ÄÃ£ xÃ¡c nháº­n',
    processing: 'Äang láº¥y hÃ ng',
    shipping: 'Äang giao hÃ ng',
    delivered: 'ÄÃ£ giao',
    cancelled: 'ÄÃ£ há»§y Ä‘Æ¡n',
};

// Tráº¡ng thÃ¡i há»£p lá»‡ tiáº¿p theo
const getAvailableStatusOptions = (currentStatus) => {
    switch (currentStatus) {
        case 'pending':
            return ['confirmed', 'cancelled'];
        case 'confirmed':
            return ['processing', 'cancelled'];
        case 'processing':
            return ['shipping', 'cancelled'];
        case 'shipping':
            return ['delivered'];
        default:
            return []; // delivered, cancelled â†’ khÃ´ng cho cáº­p nháº­t ná»¯a
    }
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
                setNewStatus(''); // Báº¯t Ä‘áº§u vá»›i tráº¡ng thÃ¡i rá»—ng
            } else {
                alert("KhÃ´ng tÃ¬m tháº¥y Ä‘Æ¡n hÃ ng.");
                navigate('/orders');
            }
        } catch (err) {
            console.error("Lá»—i khi táº£i Ä‘Æ¡n hÃ ng:", err);
            alert("KhÃ´ng thá»ƒ táº£i thÃ´ng tin Ä‘Æ¡n hÃ ng.");
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
                alert("Cáº­p nháº­t tráº¡ng thÃ¡i thÃ nh cÃ´ng!");
                triggerRefreshStatistics();
            }
        } catch (err) {
            console.error("Lá»—i cáº­p nháº­t:", err);
            alert("Cáº­p nháº­t tháº¥t báº¡i.");
        } finally {
            setUpdating(false);
        }
    };

    const handleConfirmOrder = async () => {
        if (!window.confirm("XÃ¡c nháº­n Ä‘Æ¡n hÃ ng nÃ y?")) return;

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
                alert("XÃ¡c nháº­n Ä‘Æ¡n hÃ ng thÃ nh cÃ´ng!");
                triggerRefreshStatistics();
            }
        } catch (err) {
            console.error("Lá»—i xÃ¡c nháº­n:", err);
            alert("XÃ¡c nháº­n tháº¥t báº¡i.");
        } finally {
            setUpdating(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!window.confirm("Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n huá»· Ä‘Æ¡n hÃ ng nÃ y khÃ´ng?")) return;

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
                alert("Huá»· Ä‘Æ¡n hÃ ng thÃ nh cÃ´ng!");
            }
        } catch (err) {
            console.error("Lá»—i khi huá»· Ä‘Æ¡n hÃ ng:", err);
            alert("Huá»· Ä‘Æ¡n hÃ ng tháº¥t báº¡i.");
        } finally {
            setUpdating(false);
        }
        <button onClick={() => navigate('/orders')} className="back-button">
            â† Quay láº¡i danh sÃ¡ch
        </button>
            </div >

        {/* Quick Actions for Pending Orders */ }
    {
        order.status === 'pending' && (
            <div className="quick-actions">
                <button
                    onClick={handleConfirmOrder}
                    className="confirm-button"
                    disabled={updating}
                >
                    {updating ? "Äang xá»­ lÃ½..." : "âœ“ XÃ¡c nháº­n Ä‘Æ¡n hÃ ng"}

// Helper function to calculate order total - ALWAYS calculate from items
export const calculateOrderTotal = (order) => {
    // Always calculate from items and shipping fee, never use total_amount
    const subtotal = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
    const shippingFee = order.shipping_fee || 0;
    return subtotal + shippingFee;
};

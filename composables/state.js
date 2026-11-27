export const cartItems = () => useState('shopping-cart', () => []);
export const currentOrder = () => useState('current-order', () => null);
export const pageInfo = () => useState('pageType', () => ({
    pageType: 'Home',
    curCategory: 0,
    searchQuery: '',
    lastId: '',
    category: { catid: 0, display_name: 'Tất cả sản phẩm' }
}));

export const goToShop = () => {
    pageInfo().value.pageType = 'Home';
};

export const goToCheckout = () => {
    pageInfo().value.pageType = 'Checkout';
};

export const goToPlaceOrder = (order = null) => {
    if (order) {
        currentOrder().value = order;
    }
    pageInfo().value.pageType = 'PlaceOrder';
};

export const goToOrderCompleted = (order = null) => {
    if (order) {
        currentOrder().value = order;
    }
    pageInfo().value.pageType = 'OrderCompleted';
};

export const clearCart = () => {
    cartItems().value = [];
};

export const formatToMoney = (num) => {
    const numeric = typeof num === 'number'
        ? num
        : Number(String(num ?? 0).replace(/[^\d.-]/g, ''));
    if (!Number.isFinite(numeric)) {
        return '0';
    }
    return Math.round(numeric).toLocaleString('vi-VN');
};

export const formatDateTime = (iso) => {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleString('vi-VN');
    } catch {
        return String(iso);
    }
};

export const generate_order_no = () => {
    return (Math.floor(100000 + Math.random() * 900000)).toString();
};

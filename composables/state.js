export const cartItems = () => useState('shopping-cart',() => []);
export const pageInfo = () => useState('pageType', () => {
    return {
        pageType: 'Home',
        curCategory: '101935',
        lastId: '',
        category: {}
    };
});
export const goToShop = () => {
    pageInfo().value.pageType = 'Home'
};

export const goToPlaceOrder = () => {
    pageInfo().value.pageType = 'PlaceOrder'
};

export const goToCheckout = () => {
    pageInfo().value.pageType = 'Checkout';
}

export const formatToMoney = (num) => {
    return num.toLocaleString('it-IT', {style: 'currency', currency: 'VND'})
        .replace('VND', '');
};
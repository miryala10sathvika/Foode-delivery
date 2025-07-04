import { createContext, use } from 'react';
export const StoreContext = createContext(null);
import React, { useState, useEffect } from 'react';
import Cart from '../pages/Cart/Cart';
import axios from 'axios';
const StoreContextProvider = (props) => {

    const [cartItems, setCartItems] = useState({});
    const url= 'http://localhost:4000';
    const [token, setToken] = useState(() => localStorage.getItem("token") || "");
     const [food_list,setFoodList] = useState([])

    const addToCart = async (itemId) => {
        if (!cartItems[itemId]) {
            setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
        }
        else {
            setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
        }
        if(token){
            await axios.post(`${url}/api/cart/add`, { itemId }, { headers: { token } })
        }
    };

    const removeFromCart = async (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
        if(token){
            await axios.post(`${url}/api/cart/remove`, { itemId }, { headers: { token } })
        }
    };
    const loadCartData = async (token) => {
        const response = await axios.post(`${url}/api/cart/get`, {}, { headers: { token } });
        console.log(response.data.cartData);
            // setCartItems(response.data.cartData);
            setCartItems(response.data.cartData || {});
    }
    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {  // Skip{} items with zero or negative quantity
                let itemInfo = food_list.find((product) => product._id === item);
                totalAmount += itemInfo.price * cartItems[item];
            }
        }
        return totalAmount;
    }

    const fetchFoodList = async ()=>{
        const response = await axios.get(`${url}/api/food/list`);
        setFoodList(response.data.data);
    }

    useEffect(() => {
    if (!token) {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
}, [cartItems, token]);

    useEffect(() => {
    async function loadData() {
        await fetchFoodList();
        if (localStorage.getItem("token")) {
            setToken(localStorage.getItem("token"));
            await loadCartData(localStorage.getItem("token"));
        }
    }
    loadData();
}, []);

    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        url,
        token,
        setToken
    }
    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
}

export default StoreContextProvider;
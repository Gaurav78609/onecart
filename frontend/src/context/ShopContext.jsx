import React, { createContext, useContext, useEffect, useState } from 'react'
import { authDataContext } from './authContext'
import axios from 'axios'
import { userDataContext } from './UserContext'
import { toast } from 'react-toastify'

export const shopDataContext = createContext()

function ShopContext({ children }) {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [cartItem, setCartItem] = useState({})
  const [loading, setLoading] = useState(false)

  const { serverUrl } = useContext(authDataContext)
  const { userData } = useContext(userDataContext)

  const currency = '₹'
  const delivery_fee = 40

  /* ---------------- PRODUCTS ---------------- */

  const getProducts = async () => {
    try {
      const result = await axios.get(serverUrl + '/api/product/list')
      setProducts(result.data)
    } catch (error) {
      console.log(error)
    }
  }

  /* ---------------- CART ---------------- */

  const getUserCart = async () => {
    try {
      const result = await axios.post(
        serverUrl + '/api/cart/get',
        {},
        { withCredentials: true }
      )
      setCartItem(result.data)
    } catch (error) {
      // ❌ not logged in → silent
      setCartItem({})
    }
  }

  const addtoCart = async (itemId, size) => {
    if (!size) {
      toast.error('Select Product Size')
      return
    }

    let cartData = structuredClone(cartItem)

    if (cartData[itemId]) {
      cartData[itemId][size] = (cartData[itemId][size] || 0) + 1
    } else {
      cartData[itemId] = { [size]: 1 }
    }

    setCartItem(cartData)

    if (userData) {
      try {
        setLoading(true)
        await axios.post(
          serverUrl + '/api/cart/add',
          { itemId, size },
          { withCredentials: true }
        )
        toast.success('Product Added')
      } catch (error) {
        toast.error('Add Cart Error')
      } finally {
        setLoading(false)
      }
    }
  }

  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItem)
    cartData[itemId][size] = quantity
    setCartItem(cartData)

    if (userData) {
      try {
        await axios.post(
          serverUrl + '/api/cart/update',
          { itemId, size, quantity },
          { withCredentials: true }
        )
      } catch (error) {
        console.log(error)
      }
    }
  }

  /* ---------------- HELPERS ---------------- */

  const getCartCount = () => {
    let total = 0
    for (const items in cartItem) {
      for (const size in cartItem[items]) {
        total += cartItem[items][size]
      }
    }
    return total
  }

  const getCartAmount = () => {
    let total = 0
    for (const items in cartItem) {
      const product = products.find(p => p._id === items)
      if (!product) continue
      for (const size in cartItem[items]) {
        total += product.price * cartItem[items][size]
      }
    }
    return total
  }

  /* ---------------- USE EFFECTS ---------------- */

  // products sabke liye
  useEffect(() => {
    getProducts()
  }, [])

  // 🔥 CART ONLY WHEN USER LOGGED IN
  useEffect(() => {
    if (userData) {
      getUserCart()
    } else {
      setCartItem({})
    }
  }, [userData])

  /* ---------------- CONTEXT VALUE ---------------- */

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItem,
    addtoCart,
    updateQuantity,
    getCartCount,
    getCartAmount,
    loading,
    setCartItem
  }

  return (
    <shopDataContext.Provider value={value}>
      {children}
    </shopDataContext.Provider>
  )
}

export default ShopContext

import Axios from "axios";
import { CART_ADD_ITEM } from "../constants/cartConstants";

export const addToCart = (productId, qty) => async (dispatch, getState) => {
  //getState and dispatch are redux thunk function that makes it possible to dispatch an action
  //and makes it possible to get the state of redux store

  //send ajax request to server to get the information about any product
  const { data } = await Axios.get(`/api/products/${productId}`);
  dispatch({
    type: CART_ADD_ITEM,
    payload: {
      name: data.name,
      image: data.image,
      price: data.price,
      countInStock: data.countInStock,
      product: data._id,
      qty,
    },
  });
  //store cart item in local localStorag
  //implemented getState to have access to state in redux store
  localStorage.setItem("cartItems", JSON.stringify(getState().cart.cartItems));
};

import { CART_ADD_ITEM, CART_REMOVE_ITEM } from "../constants/cartConstants";

export const cartReducer = (state = { cartItems: [] }, action) => {
  switch (action.type) {
    case CART_ADD_ITEM:
      const item = action.payload;
      //Note: product is the product_id
      const existItem = state.cartItems.find((x) => x.product === item.product);
      if (existItem) {
        return {
          ...state,
          cartItems: state.cartItems.map((x) =>
            //If product id that comes into the cart exist already, we don't return the existing product to avoid duplicate but rather take the new product(item=action.payload) else if no duplicate is found leave the existing product(x)
            //in the cart.
            x.product === existItem.product ? item : x
          ),
        };
      } else {
        //...state=means you won't change other property of cart
        //[...state.cartItems=item means update the cart using a square bracket to concatenate with the new item at the end of cart item]
        return { ...state, cartItems: [...state.cartItems, item] };
      }

    case CART_REMOVE_ITEM:
      return {
        ...state,
        cartItems: state.cartItems.filter((x) => x.product !== action.payload),
      };

    default:
      return state;
  }
};

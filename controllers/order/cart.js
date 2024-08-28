const Cart = require("../../model/order/cart");
const TryCatch = require("../../middleware/Trycatch");
const Product = require("../../model/Product/product");
const Coupon = require("../../model/coupan/coupan");



const RemoveCoupon = TryCatch(async (req, res) => {
  const userId = req.user.id;
  // Find the cart for the logged-in user
  let cart = await Cart.findOne({ userId , activecart: "true"});

  if (!cart) {
    return res.status(400).json({
      success: false,
      message: "Cart not found for the user.",
    });
  }

  try {
    // Remove coupon data from cart items
    for (const orderItem of cart.orderItems) {
      if (orderItem.Iscoupanapplie) {
        // Reset coupon-related fields
        orderItem.Iscoupanapplie = false;
        orderItem.Coupan = "";
        orderItem.CoupanDiscountPercentage = 0;
        orderItem.CoupanDiscountPrice = 0;
        orderItem.PorudctpricebeforeapplyCoupan =
          orderItem.quantity * orderItem.singleProductPrice;
      }
    }

    // Recalculate total prices after removing the coupon
    let totalPrice = 0;
    for (const orderItem of cart.orderItems) {
      // Update totalPrice based on singleProductPrice and quantity
      orderItem.totalPrice = orderItem.quantity * orderItem.singleProductPrice;
      totalPrice += orderItem.totalPrice;
    }

    const priceAfterAddingTax = totalPrice * 1.05;
    const totalPriceWithShipping = priceAfterAddingTax + cart.shippingPrice;

    // Update cart total prices
    cart.TotalProductPrice = totalPrice;
    cart.totalPrice = totalPriceWithShipping;
    cart.Iscoupanapplied = "false";

    // Save the updated cart
    await cart.save();

    // Send success response with updated cart
    res.status(200).json({
      success: true,
      message: "Coupon removed successfully.",
      cart,
    });
  } catch (error) {
    // Handle errors when removing coupon
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});
const addToCart = TryCatch(async (req, res, next) => {
  try {
    const { productId, quantity, shippingPrice, CoupanCode } = req.body;

    const product = await Product.findById(productId);
    if (!product || product.quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product is out of stock or does not exist.",
      });
    }

    // Check if user has an existing cart
    let cart = await Cart.findOne({ userId: req.user.id , activecart: "true" });

    if (!cart) {
      // If no cart exists, create a new one
      cart = new Cart({ userId: req.user.id, orderItems: [] });
    }

    // Check if the cart has orderItems array
    if (!cart.orderItems || !Array.isArray(cart.orderItems)) {
      cart.orderItems = [];
    }

    // Find the product in the cart
    const existingItemIndex = cart.orderItems.findIndex(
      (item) => item.productId.toString() === productId
    );
 
    if (existingItemIndex !== -1) {
      // If product exists, update the quantity
      cart.orderItems[existingItemIndex].quantity += quantity;
    } else {
      // If product doesn't exist, add it to the cart
      cart.orderItems.push({
        productId,
        quantity,
      });
    }

    // Save the updated cart
    await cart.save();

    // Calculate total price considering coupons
    const processedOrderItems = await calculateTotalPriceWithCoupons(
      cart.orderItems,
      CoupanCode
    );

    // Calculate total product price
    const totalProductPrice = processedOrderItems.reduce(
      (total, item) => total + item.totalPrice,
      0
    );

    // Calculate price after adding tax (5%) tax
    const priceAfterAddingTax = totalProductPrice * (1 + (18 / 100)) ;
    const totalPriceWithShipping = priceAfterAddingTax + shippingPrice;

    // Update the existing cart with new details
    cart.orderItems = processedOrderItems;
    cart.taxPrice = 1.05;
    cart.priceAfterAddingTax = priceAfterAddingTax;
    cart.TotalProductPrice = totalProductPrice;
    cart.totalPrice = totalPriceWithShipping;

    // Save the updated cart to the database
    await cart.save();

    // Send response with order details
    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

async function calculateTotalPriceWithCoupons(orderItems, CoupanCode) {
  const processedItems = [];
  let totalPrice = 0;
  let couponApplied = false;

  for (const orderItem of orderItems) {
    const product = await Product.findById(orderItem.productId);
    const itemTotalPrice = orderItem.quantity * product.price;
    let totalPriceBeforeCoupon = itemTotalPrice;

    if (CoupanCode) {
      const couponApplicable = await checkCouponApplicability(
        CoupanCode,
        product
      );

      if (couponApplicable) {
        const coupon = await Coupon.findOne({
          Coupancode: CoupanCode,
        });

        const couponDiscount =
          (coupon.discountPercentage / 100) * product.price;
        totalPriceBeforeCoupon -= couponDiscount;

        orderItem.Iscoupanapplie = true;
        orderItem.Coupan = CoupanCode;
        orderItem.CoupanDiscountPercentage = coupon.discountPercentage;
        orderItem.CoupanDiscountPrice = couponDiscount;
        orderItem.PorudctpricebeforeapplyCoupan = itemTotalPrice;

        couponApplied = true;

      }
    }

    totalPrice += totalPriceBeforeCoupon;

    processedItems.push({
      productId: product._id,
      quantity: orderItem.quantity,
      totalPrice: totalPriceBeforeCoupon,
      singleProductPrice: product.price,
      size: orderItem.size,
      Iscoupanapplie: orderItem.Iscoupanapplie || false,
      Coupan: orderItem.Coupan || "",
      CoupanDiscountPercentage: orderItem.CoupanDiscountPercentage || 0,
      CoupanDiscountPrice: orderItem.CoupanDiscountPrice || 0,
      PorudctpricebeforeapplyCoupan:
        orderItem.PorudctpricebeforeapplyCoupan || itemTotalPrice,
    });
  }

  if (CoupanCode && !couponApplied) {
    throw new Error("Coupon is not applicable to any product or category");
  }

  return processedItems;
}

const checkCouponApplicability = async (Reqcoupon, product) => {
  // Get coupon details
  const coupon = await Coupon.findOne({
    Coupancode: Reqcoupon,
    Isexpired: false,
  });
  if (!coupon) {
    throw new Error("Invalid or expired coupon code");
  }
  switch (coupon.coupanfor) {
    case "all":
      return true;
    case "product":
      return coupon.applicableProducts.includes(product._id);
    case "category":
      return coupon.applicableCategories.includes(product.category);
    case "minimumOrderValue":
      return false;
    default:
      return false;
  }
};

const ApplyCoupon = TryCatch(async (req, res) => {
  const { CoupanCode } = req.body;
  const userId = req.user.id;

  // Find the cart for the logged-in user
  let cart = await Cart.findOne({ userId , activecart: "true"});

  if (!cart) {
    return res.status(400).json({
      success: false,
      message: "Cart not found for the user.",
    });
  }

  try {
    // Check if the coupon code is applicable to the cart items
    const processedItems = await calculateTotalPriceWithCoupons(
      cart.orderItems,
      CoupanCode
    );

    // Update the cart with the processed items
    cart.orderItems = processedItems;

    // Calculate total product price
    const totalProductPrice = processedItems.reduce(
      (total, item) => total + item.totalPrice,
      0
    );

    // Calculate price after adding tax (5%) tax
    const priceAfterAddingTax = totalProductPrice * 1.05;

    // Update cart details
    cart.taxPrice = 1.05;
    cart.shippingPrice = 0; // Assuming shipping is free
    cart.totalPrice = priceAfterAddingTax;
    cart.Iscoupanapplied = true; // Assuming you want to mark if a coupon is applied

    // Save the updated cart
    await cart.save();

    // Send success response with updated cart
    res.status(200).json({
      success: true,
      message: "Coupon applied successfully.",
      cart,
    });
  } catch (error) {
    // Handle errors when applying coupon
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});



// get cart
const GetCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id , activecart: "true" })
    .populate({
      path: "orderItems",
      populate: {
        path: "productId",
        model: "product",
      },
    })

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Controller function to reduce the quantity of a product in the cart
const RemoveFromCart =TryCatch(async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id;

  try {
    // Find the cart for the logged-in user
    let cart = await Cart.findOne({ userId, activecart: "true"});

    if (!cart) {
      return res.status(400).json({
        success: false,
        message: "Cart not found for the user.",
      });
    }

    // Find the index of the product in the cart
    const productIndex = cart.orderItems.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "Product not found in the cart.",
      });
    }

    // Decrease the quantity of the product in the cart
    cart.orderItems[productIndex].quantity -= 1;

    // If quantity becomes zero, remove the product from the cart
    if (cart.orderItems[productIndex].quantity === 0) {
      cart.orderItems.splice(productIndex, 1);
    }

    // Recalculate cart details
    const processedItems = await calculateTotalPriceWithCoupons(cart.orderItems, null);
    const totalProductPrice = processedItems.reduce((total, item) => total + item.totalPrice, 0);
    const priceAfterAddingTax = totalProductPrice * 1.05;

    
    // Update cart details
    cart.orderItems = processedItems;
    cart.taxPrice = 1.05;
    cart.shippingPrice = 0; // Assuming shipping is free
    cart.totalPrice = priceAfterAddingTax;
    cart.Iscoupanapplied = false; // Reset to false because we're not applying a coupon here
    cart.TotalProductPrice = totalProductPrice;


    // Save the updated cart
    await cart.save();

    // Send success response with updated cart
    res.status(200).json({
      success: true,
      message: "Cart updated successfully.",
      cart,
    });
  } catch (error) {
    // Handle errors when updating cart
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
// export
module.exports = {
  addToCart,
  GetCart,
  RemoveFromCart,
  ApplyCoupon,
  RemoveCoupon,
};
// const Cart = require("../../model/order/cart");
// const TryCatch = require("../../middleware/Trycatch");
// const Product = require("../../model/Product/product");
// const Coupon = require("../../model/coupan/coupan");
// const NodeCache = require("node-cache");
// const cache = new NodeCache({ stdTTL: 600 }); // Cache TTL is set to 600 seconds (10 minutes)

// const RemoveCoupon = TryCatch(async (req, res) => {
//   const userId = req.user.id;
//   let cart = await Cart.findOne({ userId, activecart: "true" });

//   if (!cart) {
//     return res.status(400).json({
//       success: false,
//       message: "Cart not found for the user.",
//     });
//   }

//   try {
//     for (const orderItem of cart.orderItems) {
//       if (orderItem.Iscoupanapplie) {
//         orderItem.Iscoupanapplie = false;
//         orderItem.Coupan = "";
//         orderItem.CoupanDiscountPercentage = 0;
//         orderItem.CoupanDiscountPrice = 0;
//         orderItem.PorudctpricebeforeapplyCoupan = orderItem.quantity * orderItem.singleProductPrice;
//       }
//     }

//     let totalPrice = 0;
//     for (const orderItem of cart.orderItems) {
//       orderItem.totalPrice = orderItem.quantity * orderItem.singleProductPrice;
//       totalPrice += orderItem.totalPrice;
//     }

//     const priceAfterAddingTax = totalPrice * 1.05;
//     const totalPriceWithShipping = priceAfterAddingTax + cart.shippingPrice;

//     cart.TotalProductPrice = totalPrice;
//     cart.totalPrice = totalPriceWithShipping;
//     cart.Iscoupanapplied = "false";

//     await cart.save();

//     cache.del(`cart_${userId}`); // Invalidate cache

//     res.status(200).json({
//       success: true,
//       message: "Coupon removed successfully.",
//       cart,
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// const addToCart = TryCatch(async (req, res, next) => {
//   try {
//     const { productId, quantity, shippingPrice, CoupanCode } = req.body;
//     console.log("1")

//     const product = await Product.findById(productId);
//     console.log("2")
//     if (!product || product.quantity <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Product is out of stock or does not exist.",
//       });
//     }

//     let cart = await Cart.findOne({ userId: req.user.id, activecart: "true" });

//     if (!cart) {
//       cart = new Cart({ userId: req.user.id, orderItems: [] });
//     }

//     if (!cart.orderItems || !Array.isArray(cart.orderItems)) {
//       cart.orderItems = [];
//     }

//     const existingItemIndex = cart.orderItems.findIndex(
//       (item) => item.productId.toString() === productId
//     );

//     if (existingItemIndex !== -1) {
//       cart.orderItems[existingItemIndex].quantity += quantity;
//     } else {
//       cart.orderItems.push({
//         productId,
//         quantity,
//       });
//     }

//     await cart.save();

//     const processedOrderItems = await calculateTotalPriceWithCoupons(cart.orderItems, CoupanCode);

//     const totalProductPrice = processedOrderItems.reduce(
//       (total, item) => total + item.totalPrice,
//       0
//     );

//     const priceAfterAddingTax = totalProductPrice * (1 + 0.18);
//     const totalPriceWithShipping = priceAfterAddingTax + shippingPrice;

//     cart.orderItems = processedOrderItems;
//     cart.taxPrice = 1.05;
//     cart.priceAfterAddingTax = priceAfterAddingTax;
//     cart.TotalProductPrice = totalProductPrice;
//     cart.totalPrice = totalPriceWithShipping;

//     await cart.save();

//     cache.set(`cart_${req.user.id}`, cart); // Cache the updated cart

//     res.status(200).json({
//       success: true,
//       cart,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// async function calculateTotalPriceWithCoupons(orderItems, CoupanCode) {
//   const processedItems = [];
//   let totalPrice = 0;
//   let couponApplied = false;

//   for (const orderItem of orderItems) {
//     const product = await Product.findById(orderItem.productId);
//     const itemTotalPrice = orderItem.quantity * product.price;
//     let totalPriceBeforeCoupon = itemTotalPrice;

//     if (CoupanCode) {
//       const couponApplicable = await checkCouponApplicability(
//         CoupanCode,
//         product
//       );

//       if (couponApplicable) {
//         const coupon = await Coupon.findOne({
//           Coupancode: CoupanCode,
//         });

//         const couponDiscount =
//           (coupon.discountPercentage / 100) * product.price;
//         totalPriceBeforeCoupon -= couponDiscount;

//         orderItem.Iscoupanapplie = true;
//         orderItem.Coupan = CoupanCode;
//         orderItem.CoupanDiscountPercentage = coupon.discountPercentage;
//         orderItem.CoupanDiscountPrice = couponDiscount;
//         orderItem.PorudctpricebeforeapplyCoupan = itemTotalPrice;

//         couponApplied = true;

//       }
//     }

//     totalPrice += totalPriceBeforeCoupon;

//     processedItems.push({
//       productId: product._id,
//       quantity: orderItem.quantity,
//       totalPrice: totalPriceBeforeCoupon,
//       singleProductPrice: product.price,
//       size: orderItem.size,
//       Iscoupanapplie: orderItem.Iscoupanapplie || false,
//       Coupan: orderItem.Coupan || "",
//       CoupanDiscountPercentage: orderItem.CoupanDiscountPercentage || 0,
//       CoupanDiscountPrice: orderItem.CoupanDiscountPrice || 0,
//       PorudctpricebeforeapplyCoupan:
//         orderItem.PorudctpricebeforeapplyCoupan || itemTotalPrice,
//     });
//   }

//   if (CoupanCode && !couponApplied) {
//     throw new Error("Coupon is not applicable to any product or category");
//   }

//   return processedItems;
// }

// const checkCouponApplicability = async (Reqcoupon, product) => {
//   const coupon = await Coupon.findOne({
//     Coupancode: Reqcoupon,
//     Isexpired: false,
//   });
//   if (!coupon) {
//     throw new Error("Invalid or expired coupon code");
//   }
//   switch (coupon.coupanfor) {
//     case "all":
//       return true;
//     case "product":
//       return coupon.applicableProducts.includes(product._id);
//     case "category":
//       return coupon.applicableCategories.includes(product.category);
//     case "minimumOrderValue":
//       return false;
//     default:
//       return false;
//   }
// };

// const ApplyCoupon = TryCatch(async (req, res) => {
//   const { CoupanCode } = req.body;
//   const userId = req.user.id;

//   let cart = await Cart.findOne({ userId, activecart: "true" });

//   if (!cart) {
//     return res.status(400).json({
//       success: false,
//       message: "Cart not found for the user.",
//     });
//   }

//   try {
//     const processedItems = await calculateTotalPriceWithCoupons(
//       cart.orderItems,
//       CoupanCode
//     );

//     cart.orderItems = processedItems;

//     const totalProductPrice = processedItems.reduce(
//       (total, item) => total + item.totalPrice,
//       0
//     );

//     const priceAfterAddingTax = totalProductPrice * 1.05;

//     cart.taxPrice = 1.05;
//     cart.shippingPrice = 0;
//     cart.totalPrice = priceAfterAddingTax;
//     cart.Iscoupanapplied = true;

//     await cart.save();

//     cache.set(`cart_${userId}`, cart); // Cache the updated cart

//     res.status(200).json({
//       success: true,
//       message: "Coupon applied successfully.",
//       cart,
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// const GetCart = async (req, res) => {
//   try {
//     const cacheKey = `cart_${req.user.id}`;
//     const cachedData = cache.get(cacheKey);

//     if (cachedData) {
//       return res.status(200).json(cachedData);
//     }

//     const cart = await Cart.findOne({ userId: req.user.id, activecart: "true" })
//       .populate({
//         path: "orderItems",
//         populate: {
//           path: "productId",
//           model: "product",
//         },
//       });

//     if (!cart) {
//       return res.status(404).json({ message: "Cart not found" });
//     }

//     cache.set(cacheKey, cart); // Cache the cart

//     res.status(200).json(cart);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// const RemoveFromCart = TryCatch(async (req, res) => {
//   const { productId } = req.body;
//   const userId = req.user.id;

//   try {
//     let cart = await Cart.findOne({ userId, activecart: "true" });

//     if (!cart) {
//       return res.status(400).json({
//         success: false,
//         message: "Cart not found for the user.",
//       });
//     }

//     const productIndex = cart.orderItems.findIndex(
//       (item) => item.productId.toString() === productId
//     );

//     if (productIndex === -1) {
//       return res.status(400).json({
//         success: false,
//         message: "Product not found in the cart.",
//       });
//     }

//     cart.orderItems[productIndex].quantity -= 1;

//     if (cart.orderItems[productIndex].quantity === 0) {
//       cart.orderItems.splice(productIndex, 1);
//     }

//     const processedItems = await calculateTotalPriceWithCoupons(cart.orderItems, null);
//     const totalProductPrice = processedItems.reduce((total, item) => total + item.totalPrice, 0);
//     const priceAfterAddingTax = totalProductPrice * 1.05;

//     cart.orderItems = processedItems;
//     cart.taxPrice = 1.05;
//     cart.shippingPrice = 0;
//     cart.totalPrice = priceAfterAddingTax;
//     cart.Iscoupanapplied = false;
//     cart.TotalProductPrice = totalProductPrice;

//     await cart.save();

//     cache.set(`cart_${userId}`, cart); // Cache the updated cart

//     res.status(200).json({
//       success: true,
//       message: "Cart updated successfully.",
//       cart,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// });


// const updateCart = async (cartId, updateData) => {
//   const cart = await Cart.findByIdAndUpdate(cartId, updateData, { new: true });
//   if (!cart) {
//     throw new Error('Cart not found');
//   }

//   cache.set(`cart_${cartId}`, cart);

//   return cart;
// };

// const getCartById = async (cartId) => {
//   const cachedCart = cache.get(`cart_${cartId}`);
//   if (cachedCart) {
//     return cachedCart;
//   }

//   const cart = await Cart.findById(cartId).populate("orderItems.productId");
//   if (!cart) {
//     throw new Error('Cart not found');
//   }

//   cache.set(`cart_${cartId}`, cart);

//   return cart;
// };

// module.exports = {
//   addToCart,
//   GetCart,
//   RemoveFromCart,
//   ApplyCoupon,
//   RemoveCoupon,
//   updateCart,
//   getCartById,
// };

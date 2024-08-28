const SecondorderSchema = require("../../model/order/orders");
const TryCatch = require("../../middleware/Trycatch");
const Mail = require("../../utils/sendmail");
const Cart = require("../../model/order/cart");
const Product = require("../../model/Product/product");
const ApiFeatures = require("../../utils/apifeature");
const {
  createOrder,
} = require("../../controllers/order/shiprocket/shiprocket");

// const CreateSecondOrder = TryCatch(async (req, res, next) => {
//   const userId = req.user.id;
//   const { CartId, paymentMethod, shippingAddress } = req.body;

//   // Create the second order
//   const secondorder = await SecondorderSchema.create({ ...req.body, userId });

//   // Extract order items from the cart
//   const cart = await Cart.findById(CartId).populate("orderItems.productId");
//   if (!cart) {
//     return res.status(404).json({ success: false, message: "Cart not found" });
//   }

//   // Clear the complete cart
//   await Cart.findByIdAndUpdate(CartId, { activecart: "false" });

//   // Generate order data for Shiprocket
//   const orderData = {
//     order_id: secondorder._id.toString(),
//     order_date: new Date(),
//     pickup_location: "Primary", // Change as per your setup
//     billing_customer_name: req.user.name,
//     billing_last_name: "",
//     billing_address: shippingAddress.line1 || "",
//     billing_address_2: shippingAddress.line2 || "",
//     billing_city: shippingAddress.city || "",
//     billing_pincode: shippingAddress.zipCode || "",
//     billing_state: shippingAddress.state || "",
//     billing_country: "India",
//     billing_email: req.user.email,
//     billing_phone: req.user.phone,
//     shipping_is_billing: true,
//     order_items: cart.orderItems.map((item) => ({
//       name: item.productId.name,
//       sku: item.productId.sku || "",
//       units: item.quantity,
//       selling_price: item.productId.price,
//     })),
//     payment_method: paymentMethod === "COD" ? "COD" : "Prepaid",
//     sub_total: calculateOrderTotal(cart),
//     length: 10,
//     breadth: 15,
//     height: 20,
//     weight: 1.5,
//   };

//   // Create order in Shiprocket
//   const shiprocketOrder = await createOrder(orderData);

//   // Update product quantities and check for out of stock
//   const updatedProducts = [];
//   const lowQuantityProducts = [];
//   const outOfStockProducts = [];
//   for (const item of cart.orderItems) {
//     const product = item.productId;
//     const updatedQuantity = product.quantity - item.quantity;
//     const isOutOfStock = updatedQuantity <= 0 ? "true" : "false";

//     const updatedProduct = await Product.findByIdAndUpdate(
//       product._id,
//       { quantity: updatedQuantity, IsOutOfStock: isOutOfStock },
//       { new: true }
//     );
//     if (updatedQuantity < 20 && updatedQuantity > 1) {
//       lowQuantityProducts.push(updatedProduct);
//     }

//     if (updatedQuantity <= 0) {
//       outOfStockProducts.push(updatedProduct);
//     }
//     updatedProducts.push(updatedProduct);
//   }

//   // Send mail for low quantity products
//   if (lowQuantityProducts.length > 0) {
//     let lowQuantityMessage = "<p>Some products are running low on quantity. Please check your inventory:</p><ul>";
//     lowQuantityProducts.forEach(product => {
//       lowQuantityMessage += `<li>${product.name} : <br/> quantity : ${product.quantity} </li> <img loading="lazy" src="${product.thumbnail}" alt="${product.name}" style="max-width: 100px;">`;
//     });
//     lowQuantityMessage += "</ul>";

//     Mail(
//       "vaibhavrathorema@gmail.com",
//       "Low Product Quantity Alert",
//       lowQuantityMessage,
//       true
//     );
//   }

//   // Send mail for out of stock products
//   if (outOfStockProducts.length > 0) {
//     let outOfStockMessage = "<p>Some products are out of stock. Please update your inventory:</p><ul>";
//     outOfStockProducts.forEach(product => {
//       outOfStockMessage += `<li>${product.name}</li><img loading="lazy" src="${product.thumbnail}" alt="${product.name}" style="max-width: 100px;">`;
//     });
//     outOfStockMessage += "</ul>";

//     Mail(
//       "vaibhavrathorema@gmail.com",
//       "Out of Stock Products Alert",
//       outOfStockMessage,
//       true
//     );
//   }

//   res.status(201).json({
//     success: true,
//     message: "Order created successfully",
//     secondorder,
//     updatedProducts,
//     shiprocketOrder,
//   });
// });

// const CreateSecondOrder = TryCatch(async (req, res, next) => {
//   const userId = req.user.id;
//   const { CartId, paymentMethod, shippingAddress } = req.body;

//   // Create the second order
//   const secondorder = await SecondorderSchema.create({ ...req.body, userId });

//   // Extract order items from the cart
//   const cart = await Cart.findById(CartId).populate("orderItems.productId");
//   if (!cart) {
//     return res.status(404).json({ success: false, message: "Cart not found" });
//   }

//   // Clear the complete cart
//   await Cart.findByIdAndUpdate(CartId, { activecart: "false" });

//   // Send mail
//   const userEmail = req.user.email;
//   const orderDetails = generateOrderDetails(cart);
//   const orderSummary = generateOrderSummary(cart, shippingAddress, paymentMethod);
//   const orderTotal = calculateOrderTotal(cart);

//   const htmlContent = `
//     <html>
//       <head>
//         <style>
//           body {
//             font-family: Arial, sans-serif;
//             margin: 0;
//             padding: 0;
//             background-color: #f7f7f7;
//           }
//           .container {
//             max-width: 600px;
//             margin: 20px auto;
//             padding: 20px;
//             border: 1px solid #ddd;
//             border-radius: 10px;
//             background-color: #ffffff;
//             box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
//             position: relative;
//           }
//           .logo {
//             text-align: center;
//             margin-bottom: 20px;
//           }
//           .total {
//             position: absolute;
//             top: 20px;
//             right: 20px;
//             font-size: 20px;
//             font-weight: bold;
//             color: #28a745;
//           }
//           h1 {
//             text-align: center;
//             color: #333;
//           }
//           p {
//             color: #555;
//             line-height: 1.6;
//           }
//           .order-details, .order-summary {
//             margin-bottom: 20px;
//           }
//           .order-item {
//             border-bottom: 1px solid #ddd;
//             padding: 10px 0;
//             display: flex;
//             align-items: center;
//           }
//           .order-item img {
//             max-width: 100px;
//             margin-right: 20px;
//           }
//           .order-item-info {
//             flex: 1;
//           }
//           .order-summary h2 {
//             border-bottom: 2px solid #ddd;
//             padding-bottom: 10px;
//             color: #333;
//           }
//           .footer {
//             text-align: center;
//             padding: 10px;
//             border-top: 1px solid #ddd;
//             margin-top: 20px;
//             color: #888;
//           }
//           .footer a {
//             color: #28a745;
//             text-decoration: none;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="logo">
//             <img loading="lazy" src="https://res.cloudinary.com/dzvsrft15/image/upload/v1720110025/xirkf5pmblltczhjxdyq.png" alt="Logo">
//             <a href="https://sf-food.vercel.app" target="_blank" style="color: #28a745 ; " >www.skfoods.com</a>
//           </div>
//           <div class="total">Total: ₹${orderTotal}</div>
//           <h1>Order Confirmation</h1>
//           <p>Hi there,</p>
//           <p>Thank you for shopping with us! We are pleased to inform you that your order has been successfully placed. Below are the details of your order:</p>
//           <div class="order-details">
//             ${orderDetails}
//           </div>
//           <div class="order-summary">
//             ${orderSummary}
//           </div>
//           <p>If you have any questions or need further assistance, please feel free to contact our customer support team.</p>
//           <p>We hope you enjoy your purchase!</p>
//           <div class="footer">
//             <p>Thank you for shopping with us!</p>
//             <p>Follow us on <a href="https://www.facebook.com/skfoodsbyunitedgroup" target="_blank">Facebook</a> and <a href="https://www.instagram.com/skfoods_unitedgroup" target="_blank" >Instagram</a></p>
//             <p>&copy; 2024 SK FOOD. All rights reserved.</p>
//           </div>
//         </div>
//       </body>
//     </html>
//   `;

//   Mail(
//     userEmail,
//     "Order Placed Successfully",
//     htmlContent,
//     true
//   );

//   // Update product quantities and check for out of stock
//   const updatedProducts = [];
//   const lowQuantityProducts = [];
//   const outOfStockProducts = [];
//   for (const item of cart.orderItems) {
//     const product = item.productId;
//     const updatedQuantity = product.quantity - item.quantity;
//     const isOutOfStock = updatedQuantity <= 0 ? "true" : "false";

//     const updatedProduct = await Product.findByIdAndUpdate(
//       product._id,
//       { quantity: updatedQuantity, IsOutOfStock: isOutOfStock },
//       { new: true }
//     );
//     if (updatedQuantity < 20 && updatedQuantity > 1) {
//       lowQuantityProducts.push(updatedProduct);
//     }

//     if (updatedQuantity <= 0) {
//       outOfStockProducts.push(updatedProduct);
//     }
//     updatedProducts.push(updatedProduct);
//   }

//   // Send mail for low quantity products
//   if (lowQuantityProducts.length > 0) {
//     let lowQuantityMessage = "<p>Some products are running low on quantity. Please check your inventory:</p><ul>";
//     lowQuantityProducts.forEach(product => {
//       lowQuantityMessage += `<li>${product.name} : <br/> quantity : ${product.quantity} </li> <img loading="lazy" src="${product.thumbnail}" alt="${product.name}" style="max-width: 100px;">`;
//     });
//     lowQuantityMessage += "</ul>";

//     Mail(
//       "vaibhavrathorema@gmail.com",
//       "Low Product Quantity Alert",
//       lowQuantityMessage,
//       true
//     );
//   }

//   // Send mail for out of stock products
//   if (outOfStockProducts.length > 0) {
//     let outOfStockMessage = "<p>Some products are out of stock. Please update your inventory:</p><ul>";
//     outOfStockProducts.forEach(product => {
//       outOfStockMessage += `<li>${product.name}</li><img loading="lazy" src="${product.thumbnail}" alt="${product.name}" style="max-width: 100px;">`;
//     });
//     outOfStockMessage += "</ul>";

//     Mail(
//       "vaibhavrathorema@gmail.com",
//       "Out of Stock Products Alert",
//       outOfStockMessage,
//       true
//     );
//   }

//   res.status(201).json({
//     success: true,
//     message: "Order created successfully",
//     secondorder,
//     updatedProducts,
//   });
// });
const CreateSecondOrderSunday = TryCatch(async (req, res, next) => {
  const userId = req.user.id;
  const { CartId, paymentMethod, shippingAddress } = req.body;

  // Create the second order
  const secondorder = await SecondorderSchema.create({ ...req.body, userId });

  // Extract order items from the cart
  const cart = await Cart.findById(CartId).populate("orderItems.productId");
  if (!cart) {
    return res.status(404).json({ success: false, message: "Cart not found" });
  }

  // Clear the complete cart
  await Cart.findByIdAndUpdate(CartId, { activecart: "false" });

  // Send mail
  const userEmail = req.user.email;
  const orderDetails = generateOrderDetails(cart);
  const orderSummary = generateOrderSummary(
    cart,
    shippingAddress,
    paymentMethod
  );
  const orderTotal = calculateOrderTotal(cart);

  const htmlContent = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 10px;
            background-color: #ffffff;
          }
          .total {
            text-align: right;
            font-size: 24px;
            font-weight: bold;
            color: #000;
          }
          h1 {
            color: #b5651d;
            font-size: 24px;
          }
          p {
            color: #000;
            line-height: 1.6;
          }
          .order-details, .order-summary {
            margin-bottom: 20px;
          }
          .order-item {
            display: flex;
            align-items: center;
            padding: 10px 0;
          }
          .order-item img {
            max-width: 100px;
            margin-right: 20px;
          }
          .order-item-info {
            flex: 1;
          }
          .order-item-info h4 {
            margin: 0;
            font-size: 16px;
            color: #000;
          }
          .order-item-info p {
            margin: 5px 0;
            color: #555;
          }
          .order-summary h2 {
            font-size: 18px;
            color: #b5651d;
            margin-bottom: 10px;
          }
          .footer {
            text-align: center;
            padding: 10px;
            border-top: 1px solid #ddd;
            margin-top: 20px;
            color: #000;
          }
          .footer a {
            color: #000;
            text-decoration: none;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="total">Total: ₹${orderTotal}</div>
          <h1>Your Order Confirmation</h1>
          <p>Dear ${req.user.name},</p>
          <p>Thank you for shopping with us! We are pleased to inform you that your order has been successfully placed. Below are the details of your order:</p>
          <div class="order-details">
            ${orderDetails}
          </div>
          <div class="order-summary">
            <h2>Order Summary:</h2>
            <p>Payment Method: ${paymentMethod}</p>
            <p>Shipping Address: ${shippingAddress.name}</p>
            <p>${shippingAddress.address}</p>
            <p>${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.zip}</p>
            <p>${shippingAddress.country}</p>
          </div>
          <p>If you have any questions or need further assistance, please feel free to contact our customer support team.</p>
          <p>We hope you enjoy your purchase!</p>
          <div class="footer">
            <p>Thank you for shopping with us!</p>
            <p>Follow us on <a href="https://www.facebook.com/skfoodsbyunitedgroup" target="_blank">Facebook</a> and <a href="https://www.instagram.com/skfoods_unitedgroup" target="_blank" >Instagram</a></p>
            <p>&copy; 2024 SK FOOD. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  Mail(userEmail, "Order Placed Successfully", htmlContent, true);

  // Update product quantities and check for out of stock
  const updatedProducts = [];
  const lowQuantityProducts = [];
  const outOfStockProducts = [];
  for (const item of cart.orderItems) {
    const product = item.productId;
    const updatedQuantity = product.quantity - item.quantity;
    const isOutOfStock = updatedQuantity <= 0 ? "true" : "false";

    const updatedProduct = await Product.findByIdAndUpdate(
      product._id,
      { quantity: updatedQuantity, IsOutOfStock: isOutOfStock },
      { new: true }
    );
    if (updatedQuantity < 20 && updatedQuantity > 1) {
      lowQuantityProducts.push(updatedProduct);
    }

    if (updatedQuantity <= 0) {
      outOfStockProducts.push(updatedProduct);
    }
    updatedProducts.push(updatedProduct);
  }

  // Send mail for low quantity products
  if (lowQuantityProducts.length > 0) {
    let lowQuantityMessage =
      "<p>Some products are running low on quantity. Please check your inventory:</p><ul>";
    lowQuantityProducts.forEach((product) => {
      lowQuantityMessage += `<li>${product.name} : <br/> quantity : ${product.quantity} </li> <img loading="lazy" src="${product.thumbnail}" alt="${product.name}" style="max-width: 100px;">`;
    });
    lowQuantityMessage += "</ul>";

    Mail(
      "vaibhavrathorema@gmail.com",
      "Low Product Quantity Alert",
      lowQuantityMessage,
      true
    );
  }

  // Send mail for out of stock products
  if (outOfStockProducts.length > 0) {
    let outOfStockMessage =
      "<p>Some products are out of stock. Please update your inventory:</p><ul>";
    outOfStockProducts.forEach((product) => {
      outOfStockMessage += `<li>${product.name}</li><img loading="lazy" src="${product.thumbnail}" alt="${product.name}" style="max-width: 100px;">`;
    });
    outOfStockMessage += "</ul>";

    Mail(
      "vaibhavrathorema@gmail.com",
      "Out of Stock Products Alert",
      outOfStockMessage,
      true
    );
  }

  res.status(201).json({
    success: true,
    message: "Order created successfully",
    secondorder,
    updatedProducts,
  });
});
const CreateSecondOrder = TryCatch(async (req, res, next) => {
  const userId = req.user.id;
  const { CartId, paymentMethod, shippingAddress } = req.body;
  console.log("shippingAddress",shippingAddress);

  // Create the second order
  const secondorder = await SecondorderSchema.create({ ...req.body, userId });

  // Extract order items from the cart
  const cart = await Cart.findById(CartId).populate("orderItems.productId");
  if (!cart) {
    return res.status(404).json({ success: false, message: "Cart not found" });
  }

  // Clear the complete cart
  await Cart.findByIdAndUpdate(CartId, { activecart: "false" });

  // Send mail
  const userEmail = req.user.email;
  const orderDetails = generateOrderDetails(cart);
  const orderTotal = calculateOrderTotal(cart);

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Order Confirmation</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            border: 1px solid rgb(16, 16, 88);
            border-radius: 10px;
            background-color: #ffffff;
          }
          .total {
            text-align: right;
            font-size: 24px;
            font-weight: bold;
            color: #000;
          }
          h1 {
            color: #b5651d;
            font-size: 24px;
          }
          p {
            color: #000;
            line-height: 1.6;
          }
          .order-details,
          .order-summary {
            margin-bottom: 20px;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .order-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 10px;
            border: 1px solid black;
            border-radius: 10px;
          }
          .order-item img {
            max-width: 100px;
            margin-right: 20px;
          }
          .order-item-info {
            flex: 1;
          }
          .order-item-info h4 {
            margin: 0;
            font-size: 16px;
            color: #000;
          }
          .order-item-info p {
            margin: 5px 0;
            color: #555;
          }
          .enjoy-message{
            border-bottom: 2px solid #000000;
          }
          .footer {
            text-align: center;
            padding: 10px;
            border-top: 1px solid #ddd;
            margin-top: 20px;
            color: #000;
          }
          .footer a {
            color: #000;
            text-decoration: none;
            font-weight: bold;
          }
          .order-summary-bottom{
            display: flex;
            justify-content: space-between;
            gap: 50px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo" style="margin-top: -56%; margin-left: 20%; " >
            <img src="https://res.cloudinary.com/dtakusspm/image/upload/v1724484115/uffc8a6nzd13s0zfiik9.png" alt="SK Food Logo">
          </div>
          <div class="total">Total: ₹${orderTotal}</div>
          <h1>Your Order Confirmation</h1>
          <p>Dear ${req.user.firstName},</p>
          <p>
            Thank you for shopping with us! We are pleased to inform you that your
            order has been successfully placed. Below are the details of your order:
          </p>
          <div class="" style="display: flex; flex-direction: column; justify-content: space-between; gap: 10px;" >
              <div style="width: 80%;" >
              <h1>Order Details:</h1> <br/>
              </div>
              </div>
              <div  >
              ${orderDetails}
              </div>
          <div class="enjoy-message">
            <p>
              If you have any questions or need further assistance, please feel free
              to contact our customer support team.
            </p>
            <p>We hope you enjoy your purchase!</p>
          </div>
          <div style="display: flex; justify-content: space-between;  gap: 10px;" >
          <div class="" style="width: 80%;" >
            <div>
            <h1>Order Summary:</h1>
            </div>
            <div>
                  <div>Payment Method: ${paymentMethod}</div>
            </div>
            <div style="margin-top: 30px;" >Thank you for shopping with us! </div>
            <div>
              Follow us on <a
                      href="https://www.facebook.com/skfoodsbyunitedgroup"
                      target="_blank">Facebook</a> and <a
                      href="https://www.instagram.com/skfoods_unitedgroup"
                      target="_blank">Instagram</a>.
          
          </div>
              
          </div>
          <div style="width: 80%;" style="margin-top: 50px;" >
            <h1>Shipping Address:</h1>
            <div style="margin-bottom: 14px;">${shippingAddress.firstname} ${shippingAddress.lastname} </div>
            <div>${shippingAddress.address}</div>
            <div>${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.pincode}</div>
            <div>${shippingAddress.country}</div>
          </div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 40px;">
            <div style="width: 100%;" >© 2024 SK FOOD. All rights reserved.</div>
            <div style="width: 40%;" >
             <div>Best regards, </div>
              <div>
              SK Food Team</div>
            </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  Mail(userEmail, "Order Placed Successfully", htmlContent, true);

  // Update product quantities and check for out of stock
  const updatedProducts = [];
  const lowQuantityProducts = [];
  const outOfStockProducts = [];
  for (const item of cart.orderItems) {
    const product = item.productId;
    const updatedQuantity = product.quantity - item.quantity;
    const isOutOfStock = updatedQuantity <= 0 ? "true" : "false";

    const updatedProduct = await Product.findByIdAndUpdate(
      product._id,
      { quantity: updatedQuantity, IsOutOfStock: isOutOfStock },
      { new: true }
    );
    if (updatedQuantity < 20 && updatedQuantity > 1) {
      lowQuantityProducts.push(updatedProduct);
    }

    if (updatedQuantity <= 0) {
      outOfStockProducts.push(updatedProduct);
    }
    updatedProducts.push(updatedProduct);
  }

  // Send mail for low quantity products
  if (lowQuantityProducts.length > 0) {
    let lowQuantityMessage =
      "<p>Some products are running low on quantity. Please check your inventory:</p><ul>";
    lowQuantityProducts.forEach((product) => {
      lowQuantityMessage += `<li>${product.name} : <br/> quantity : ${product.quantity} </li> <img loading="lazy" src="${product.thumbnail}" alt="${product.name}" style="max-width: 100px;">`;
    });
    lowQuantityMessage += "</ul>";

    Mail(
      "vaibhavrathorema@gmail.com",
      "Low Product Quantity Alert",
      lowQuantityMessage,
      true
    );
  }

  // Send mail for out of stock products
  if (outOfStockProducts.length > 0) {
    let outOfStockMessage =
      "<p>Some products are out of stock. Please update your inventory:</p><ul>";
    outOfStockProducts.forEach((product) => {
      outOfStockMessage += `<li>${product.name}</li><img loading="lazy" src="${product.thumbnail}" alt="${product.name}" style="max-width: 100px;">`;
    });
    outOfStockMessage += "</ul>";

    Mail(
      "vaibhavrathorema@gmail.com",
      "Out of Stock Products Alert",
      outOfStockMessage,
      true
    );
  }

  res.status(201).json({
    success: true,
    message: "Order created successfully",
    secondorder,
    updatedProducts,
  });
});

function generateOrderDetails(cart) {
  let detailsHtml = "";
  cart.orderItems.forEach((item) => {
    detailsHtml += `
      <div class="order-item" style="display: flex; flex-direction: column; align-items: center; padding: 10px; border: 1x solid  rgba(60, 60, 60, 0.735); border-radius: 10px;  background-color: #f2f2f2; width: 100%; ">
        <img loading="lazy" src="${item.productId.thumbnail}" alt="${item.productId.name}" style="max-width: 100px; margin-right: 20px;">
        <div class="order-item-info" style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: space-between; width: 100%;  ">
        <div style="width: 100%;">
        <h4 style="margin: 0; font-size: 16px; color: #000;">${item.productId.name}</h4>
        <p style="margin: 5px 0; color: #555;">Quantity: ${item.quantity}</p>
        </div>
        <div style="width: 30%;" >
        <p style="margin: 5px 0; color: #555;">Price: ₹${item.singleProductPrice}</p>
        </div>
        </div>
      </div>
      <br/> 
    `;
  });
  return detailsHtml;
}

function calculateOrderTotal(cart) {
  return cart.orderItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
}

// const CreateSecondOrder = TryCatch(async (req, res, next) => {
//   const userId = req.user.id;
//   const { CartId, paymentMethod, shippingAddress } = req.body;

//   // Create the second order
//   const secondorder = await SecondorderSchema.create({ ...req.body, userId });

//   // Extract order items from the cart
//   const cart = await Cart.findById(CartId).populate("orderItems.productId");
//   if (!cart) {
//     return res.status(404).json({ success: false, message: "Cart not found" });
//   }

//   // Clear the complete cart
//   await Cart.findByIdAndUpdate(CartId, { activecart: "false" });

//   // Send mail
//   const userEmail = req.user.email;
//   const orderDetails = generateOrderDetails(cart);
//   const orderSummary = generateOrderSummary(cart, shippingAddress, paymentMethod);
//   const orderTotal = calculateOrderTotal(cart);

//   const htmlContent = `
//     <!DOCTYPE html>
//     <html lang="en">
//       <head>
//         <meta charset="UTF-8" />
//         <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//         <title>Order Confirmation</title>
//         <style>
//           body {
//             font-family: Arial, sans-serif;
//             margin: 0;
//             padding: 0;
//             background-color: #ffffff;
//           }
//           .container {
//             max-width: 600px;
//             margin: 20px auto;
//             padding: 20px;
//             border: 1px solid rgb(16, 16, 88);
//             border-radius: 10px;
//             background-color: #ffffff;
//           }
//           .total {
//             text-align: right;
//             font-size: 24px;
//             font-weight: bold;
//             color: #000;
//           }
//           h1 {
//             color: #b5651d;
//             font-size: 24px;
//           }
//           p {
//             color: #000;
//             line-height: 1.6;
//           }
//           .order-details,
//           .order-summary {
//             margin-bottom: 20px;
//             display: flex;
//             flex-direction: column;
//             gap: 10px;
//           }
//           .order-item {
//             display: flex;
//             align-items: center;
//             padding: 10px;
//             border: 1px solid rgba(60, 60, 60, 0.735);
//             border-radius: 10px;
//           }
//           .order-item img {
//             max-width: 100px;
//             margin-right: 20px;
//           }
//           .order-item-info {
//             flex: 1;
//           }
//           .order-item-info h4 {
//             margin: 0;
//             font-size: 16px;
//             color: #000;
//           }
//           .order-item-info p {
//             margin: 5px 0;
//             color: #555;
//           }
//           .enjoy-message {
//             border-bottom: 2px solid #000000;
//           }
//           .footer {
//             text-align: center;
//             padding: 10px;
//             border-top: 1px solid #ddd;
//             margin-top: 20px;
//             color: #000;
//           }
//           .footer a {
//             color: #000;
//             text-decoration: none;
//             font-weight: bold;
//           }
//           .order-summary-bottom {
//             display: flex;
//             justify-content: space-between;
//             gap: 50px;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="logo" style="margin-top: -16%; margin-left: 20%;">
//             <img src="https://res.cloudinary.com/dtakusspm/image/upload/v1724484115/uffc8a6nzd13s0zfiik9.png" alt="SK Food Logo">
//           </div>
//           <div class="total">Total: ₹${orderTotal}</div>
//           <h1>Your Order Confirmation</h1>
//           <p>Dear ${req.user.name},</p>
//           <p>Thank you for shopping with us! We are pleased to inform you that your order has been successfully placed. Below are the details of your order:</p>
//           <div class="order-details">
//             <h1>Order Details:</h1>
//             ${orderDetails}
//           </div>
//           <div class="enjoy-message">
//             <p>If you have any questions or need further assistance, please feel free to contact our customer support team.</p>
//             <p>We hope you enjoy your purchase!</p>
//           </div>
//           <div>
//             <h1>Order Summary:</h1>
//             <div class="order-summary-bottom">
//               <div style="width: 100%;">
//                 <div>Payment Method: ${paymentMethod}</div>
//                 <div style="margin-top: 30px; display: flex; flex-direction: column; gap: 7px;">
//                   <div>Thank you for shopping with us!</div>
//                   <div>Follow us on <a href="https://www.facebook.com/skfoodsbyunitedgroup" target="_blank">Facebook</a> and <a href="https://www.instagram.com/skfoods_unitedgroup" target="_blank">Instagram</a>.</div>
//                 </div>
//               </div>
//               <div style="width: 80%;">
//                 <p>Shipping Address:</p>
//                 <div style="margin-bottom: 14px;">${shippingAddress.name}</div>
//                 <div>${shippingAddress.address}<br>${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.zip}<br>${shippingAddress.country}</div>
//               </div>
//             </div>
//           </div>
//           <div style="display: flex; justify-content: space-between; margin-top: 40px;">
//             <div>© 2024 SK FOOD. All rights reserved.</div>
//             <br>Best regards,<br>SK Food Team</div>
//           </div>
//         </div>
//       </body>
//     </html>
//   `;

//   Mail(userEmail, "Order Placed Successfully", htmlContent, true);

//   // Update product quantities and check for out of stock
//   const updatedProducts = [];
//   const lowQuantityProducts = [];
//   const outOfStockProducts = [];
//   for (const item of cart.orderItems) {
//     const product = item.productId;
//     const updatedQuantity = product.quantity - item.quantity;
//     const isOutOfStock = updatedQuantity <= 0 ? "true" : "false";

//     const updatedProduct = await Product.findByIdAndUpdate(
//       product._id,
//       { quantity: updatedQuantity, IsOutOfStock: isOutOfStock },
//       { new: true }
//     );
//     if (updatedQuantity < 20 && updatedQuantity > 1) {
//       lowQuantityProducts.push(updatedProduct);
//     }

//     if (updatedQuantity <= 0) {
//       outOfStockProducts.push(updatedProduct);
//     }
//     updatedProducts.push(updatedProduct);
//   }

//   // Send mail for low quantity products
//   if (lowQuantityProducts.length > 0) {
//     let lowQuantityMessage = "<p>Some products are running low on quantity. Please check your inventory:</p><ul>";
//     lowQuantityProducts.forEach(product => {
//       lowQuantityMessage += `<li>${product.name} : <br/> quantity : ${product.quantity} </li> <img loading="lazy" src="${product.thumbnail}" alt="${product.name}" style="max-width: 100px;">`;
//     });
//     lowQuantityMessage += "</ul>";

//     Mail(
//       "vaibhavrathorema@gmail.com",
//       "Low Product Quantity Alert",
//       lowQuantityMessage,
//       true
//     );
//   }

//   // Send mail for out of stock products
//   if (outOfStockProducts.length > 0) {
//     let outOfStockMessage = "<p>Some products are out of stock. Please update your inventory:</p><ul>";
//     outOfStockProducts.forEach(product => {
//       outOfStockMessage += `<li>${product.name}</li><img loading="lazy" src="${product.thumbnail}" alt="${product.name}" style="max-width: 100px;">`;
//     });
//     outOfStockMessage += "</ul>";

//     Mail(
//       "vaibhavrathorema@gmail.com",
//       "Out of Stock Products Alert",
//       outOfStockMessage,
//       true
//     );
//   }

//   res.status(201).json({
//     success: true,
//     message: "Order created successfully",
//     secondorder,
//     updatedProducts,
//   });
// });

// function generateOrderDetails(cart) {
//   let detailsHtml = '<div class="order-details">';
//   cart.orderItems.forEach(item => {
//     detailsHtml += `
//       <div class="order-item">
//         <img loading="lazy" src="${item.productId.thumbnail}" alt="${item.productId.name}">
//         <div class="order-item-info">
//           <p><strong>${item.productId.name}</strong></p>
//           <p>Quantity: ${item.quantity}</p>
//           <p>Total Price: ${item.totalPrice}</p>
//         </div>
//       </div>
//     `;
//   });
//   detailsHtml += '</div>';
//   return detailsHtml;
// }

function generateOrderSummary(cart, shippingAddress, paymentMethod) {
  let summaryHtml = '<div class="order-summary">';
  summaryHtml += `
    <h2>Order Summary</h2>
    <p>Payment Method: ${paymentMethod}</p>
    <p>Shipping Address:</p>
    <p>${shippingAddress.firstname} ${shippingAddress.lastname}</p>
    <p>${shippingAddress.address}</p>
    <p>${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.country} - ${shippingAddress.pincode}</p>
  `;
  summaryHtml += "</div>";
  return summaryHtml;
}

function calculateOrderTotal(cart) {
  let total = 0;
  cart.orderItems.forEach((item) => {
    total += item.totalPrice;
  });
  return total;
}

// get my second order
const GetMySecondOrder = TryCatch(async (req, res, next) => {
  const data = await SecondorderSchema.find({ userId: req.user.id })
    // .populate("CartId")
    .populate({
      path: "CartId",
      populate: {
        path: "orderItems.productId",
        model: "product",
      },
    })
    .populate("shippingAddress")
    .populate("billingAddress")
    .populate("userId");

  const secondorders = data.reverse();

  res.status(200).json({
    success: true,
    message: "Orders fetched successfully",
    total: secondorders.length,
    secondorders,
  });
});

module.exports = GetMySecondOrder;

// get second order by id
const GetSecondOrderById = TryCatch(async (req, res, next) => {
  const secondorder = await SecondorderSchema.findById(req.params.id)
    .populate("CartId")
    .populate({
      path: "CartId",
      populate: {
        path: "orderItems.productId",
        model: "product",
      },
    })
    .populate("shippingAddress")
    .populate("billingAddress")
    .populate("userId");

  res.status(200).json({
    success: true,
    message: "Order fetched successfully vaibhaknknknknk",
    secondorder,
  });
});

// get all orders
const GetAllsecondOrders = TryCatch(async (req, res, next) => {
  const status = req.query.status || "Pending";
  const resultperpage = req.query.resultperpage || 10000;
  // Initialize ApiFeatures with the Order model query and the query string from the request
  const features = new ApiFeatures(SecondorderSchema.find(), req.query)
    // Apply search functionality if 'name' is provided in the query string
    .search()
    .filterByStatus(status)
    // Apply pagination with default limit of 10 items per page
    .paginate(resultperpage);

  // Execute the query with applied features
  const ALlOrders = await features.query
    // Populate necessary fields
    .populate("CartId")
    .populate({
      path: "CartId",
      populate: {
        path: "orderItems.productId",
        model: "product",
      },
    })
    .populate("shippingAddress")
    .populate("billingAddress")
    .populate("userId");

  const Orders = ALlOrders.reverse();

  // Send response
  res.status(200).json({
    success: true,
    count: Orders.length,
    Orders,
  });
});

// update order
const UpdateSecondOrder = TryCatch(async (req, res, next) => {
  // req.body.UpdateAt = Date.now();
  const secondorder = await SecondorderSchema.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  // UpdateAt
  res.status(200).json({
    success: true,
    message: "Order updated successfully",
    secondorder,
  });
});

// exports
module.exports = {
  CreateSecondOrder,
  GetMySecondOrder,
  GetSecondOrderById,
  GetAllsecondOrders,
  UpdateSecondOrder,
};

// const SecondorderSchema = require("../../model/order/orders");
// const TryCatch = require("../../middleware/Trycatch");
// const Mail = require("../../utils/sendmail");
// const Cart = require("../../model/order/cart");
// const Product = require("../../model/Product/product");
// const ApiFeatures = require("../../utils/apifeature");
// const NodeCache = require("node-cache");
// const cache = new NodeCache();
// const { updateProductQuantity } = require("../../model/Product/product");
// const { getCartById, updateCart } = require("../../model/order/cart");

// const CreateSecondOrder = TryCatch(async (req, res, next) => {
//   const userId = req.user.id;
//   const { CartId, paymentMethod, shippingAddress } = req.body;

//   const secondorder = await SecondorderSchema.create({ ...req.body, userId });

//   const cart = await getCartById(CartId);
//   if (!cart) {
//     return res.status(404).json({ success: false, message: "Cart not found" });
//   }

//   await updateCart(CartId, { activecart: "false" });

//   const userEmail = req.user.email;
//   const orderDetails = generateOrderDetails(cart);
//   const orderSummary = generateOrderSummary(cart, shippingAddress, paymentMethod);

//   const htmlContent = `
//     <html>
//       <head>
//         <style>
//           body {
//             font-family: Arial, sans-serif;
//             margin: 0;
//             padding: 0;
//           }
//           .container {
//             max-width: 600px;
//             margin: 20px auto;
//             padding: 20px;
//             border: 1px solid #ddd;
//             border-radius: 10px;
//           }
//           h1 {
//             text-align: center;
//             color: #333;
//           }
//           .order-details {
//             margin-bottom: 20px;
//           }
//           .order-item {
//             border-bottom: 1px solid #ddd;
//             padding: 10px 0;
//           }
//           .order-item img {
//             max-width: 100px;
//             vertical-align: middle;
//             margin-right: 10px;
//           }
//           .order-item-info {
//             display: inline-block;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <h1>Order Confirmation</h1>
//           <p>Hi there,</p>
//           <p>Your order has been successfully placed. Below are the details:</p>
//           <div class="order-details">
//             ${orderDetails}
//           </div>
//           <div class="order-summary">
//             ${orderSummary}
//           </div>
//           <p>Thank you for shopping with us!</p>
//         </div>
//       </body>
//     </html>
//   `;

//   Mail(
//     userEmail,
//     "Order Placed Successfully",
//     htmlContent,
//     true
//   );

//   const updatedProducts = [];
//   const lowQuantityProducts = [];
//   const outOfStockProducts = [];
//   for (const item of cart.orderItems) {
//     const updatedProduct = await updateProductQuantity(item.productId._id, item.quantity);
//     if (updatedProduct.quantity < 20 && updatedProduct.quantity > 1) {
//       lowQuantityProducts.push(updatedProduct);
//     }
//     if (updatedProduct.quantity <= 0) {
//       outOfStockProducts.push(updatedProduct);
//     }
//     updatedProducts.push(updatedProduct);
//   }

//   if (lowQuantityProducts.length > 0) {
//     let lowQuantityMessage = "<p>Some products are running low on quantity. Please check your inventory:</p><ul>";
//     lowQuantityProducts.forEach(product => {
//       lowQuantityMessage += `<li>${product.name} : <br/> quantity : ${product.quantity} </li> <img loading="lazy" src="${product.thumbnail}" alt="${product.name}" style="max-width: 100px;">`;
//     });
//     lowQuantityMessage += "</ul>";

//     Mail(
//       "vaibhavrathorema@gmail.com",
//       "Low Product Quantity Alert",
//       lowQuantityMessage,
//       true
//     );
//   }

//   if (outOfStockProducts.length > 0) {
//     let outOfStockMessage = "<p>Some products are out of stock. Please update your inventory:</p><ul>";
//     outOfStockProducts.forEach(product => {
//       outOfStockMessage += `<li>${product.name}</li><img loading="lazy" src="${product.thumbnail}" alt="${product.name}" style="max-width: 100px;">`;
//     });
//     outOfStockMessage += "</ul>";

//     Mail(
//       "vaibhavrathorema@gmail.com",
//       "Out of Stock Products Alert",
//       outOfStockMessage,
//       true
//     );
//   }

//   res.status(201).json({
//     success: true,
//     message: "Order created successfully",
//     secondorder,
//     updatedProducts,
//   });

//   cache.set(`order_${secondorder._id}`, secondorder);
// });

// const GetMySecondOrder = TryCatch(async (req, res, next) => {
//   const cacheKey = `my_orders_${req.user.id}`;
//   const cachedData = cache.get(cacheKey);

//   if (cachedData) {
//     return res.status(200).json({
//       success: true,
//       message: "Orders fetched successfully",
//       total: cachedData.length,
//       secondorders: cachedData,
//     });
//   }

//   const data = await SecondorderSchema.find({ userId: req.user.id })
//     .populate({
//       path: "CartId",
//       populate: {
//         path: "orderItems.productId",
//         model: "product",
//       },
//     })
//     .populate("shippingAddress")
//     .populate("billingAddress")
//     .populate("userId");

//   const secondorders = data.reverse();

//   res.status(200).json({
//     success: true,
//     message: "Orders fetched successfully",
//     total: secondorders.length,
//     secondorders,
//   });

//   cache.set(cacheKey, secondorders);
// });

// const GetSecondOrderById = TryCatch(async (req, res, next) => {
//   const cacheKey = `order_${req.params.id}`;
//   const cachedData = cache.get(cacheKey);

//   if (cachedData) {
//     return res.status(200).json({
//       success: true,
//       message: "Order fetched successfully",
//       secondorder: cachedData,
//     });
//   }

//   const secondorder = await SecondorderSchema.findById(req.params.id)
//     .populate("CartId")
//     .populate({
//       path: "CartId",
//       populate: {
//         path: "orderItems.productId",
//         model: "product",
//       },
//     })
//     .populate("shippingAddress")
//     .populate("billingAddress")
//     .populate("userId");

//   res.status(200).json({
//     success: true,
//     message: "Order fetched successfully",
//     secondorder,
//   });

//   cache.set(cacheKey, secondorder);
// });

// const GetAllsecondOrders = TryCatch(async (req, res, next) => {
//   const cacheKey = `all_orders_${req.query.status || "Pending"}_${req.query.resultperpage || 10}`;
//   const cachedData = cache.get(cacheKey);

//   if (cachedData) {
//     return res.status(200).json({
//       success: true,
//       count: cachedData.length,
//       Orders: cachedData,
//     });
//   }

//   const status = req.query.status || "Pending";
//   const resultperpage = req.query.resultperpage || 10;
//   const features = new ApiFeatures(SecondorderSchema.find(), req.query)
//     .search()
//     .filterByStatus(status)
//     .paginate(resultperpage);

//   const ALlOrders = await features.query
//     .populate("CartId")
//     .populate({
//       path: "CartId",
//       populate: {
//         path: "orderItems.productId",
//         model: "product",
//       },
//     })
//     .populate("shippingAddress")
//     .populate("billingAddress")
//     .populate("userId");

//   const Orders = ALlOrders.reverse();

//   res.status(200).json({
//     success: true,
//     count: Orders.length,
//     Orders,
//   });

//   cache.set(cacheKey, Orders);
// });

// const UpdateSecondOrder = TryCatch(async (req, res, next) => {
//   const secondorder = await SecondorderSchema.findByIdAndUpdate(
//     req.params.id,
//     req.body,
//     {
//       new: true,
//       runValidators: true,
//       useFindAndModify: false,
//     }
//   );

//   res.status(200).json({
//     success: true,
//     message: "Order updated successfully",
//     secondorder,
//   });

//   cache.set(`order_${req.params.id}`, secondorder);
// });

// module.exports = {
//   CreateSecondOrder,
//   GetMySecondOrder,
//   GetSecondOrderById,
//   GetAllsecondOrders,
//   UpdateSecondOrder,
// };

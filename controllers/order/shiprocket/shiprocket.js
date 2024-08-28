// // shiprocket.js
// const axios = require('axios');

// const SHIPROCKET_API_URL = 'https://apiv2.shiprocket.in/v1/external';
// const EMAIL = 'parampreet759@gmail.com';
// const PASSWORD = 'Param@28';

// let token = null;

// // Function to authenticate and get the token
// const authenticate = async () => {
//   try {
//     const response = await axios.post(`${SHIPROCKET_API_URL}/auth/login`, {
//       email: EMAIL,
//       password: PASSWORD,
//     });
//     token = response.data.token;
//   } catch (error) {
//     console.error('Error authenticating with Shiprocket:', error);
//   }
// };

// // Function to create an order in Shiprocket
// const createOrder = async (orderData) => {
//   try {
//     if (!token) await authenticate();

//     const response = await axios.post(`${SHIPROCKET_API_URL}/orders/create/adhoc`, orderData, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
// console.log(orderData , response )
//     // return response.data;
//   } catch (error) {
//     console.error('Error creating order with Shiprocket:', error);
//     throw error;
//   }
// };

// // Function to check order status
// const checkOrderStatus = async (orderId) => {
//   try {
//     if (!token) await authenticate();

//     const response = await axios.get(`${SHIPROCKET_API_URL}/orders/show/${orderId}`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     return response.data;
//   } catch (error) {
//     console.error('Error checking order status with Shiprocket:', error);
//     throw error;
//   }
// };

// // Export functions
// module.exports = {
//   createOrder,
//   checkOrderStatus,
// };

const axios = require('axios');

const SHIPROCKET_API_URL = 'https://apiv2.shiprocket.in/v1/external';
const EMAIL = 'vaibhvarathorema@gmail.com';
const PASSWORD = 'ZXY_Abc-123';

let token = null;  

// Function to authenticate and get the token
const authenticate = async () => {
  try {
    const response = await axios.post(`${SHIPROCKET_API_URL}/auth/login`, {
      email: EMAIL,
      password: PASSWORD,
    });
    console.log('Authenticated successfully. Token:', response.data.token); 
    token = response.data.token;
    console.log('Authenticated successfully. Token:', token);
  } catch (error) {
    console.error('Error authenticating with Shiprocket:', error);
  }
};

// Function to create an order in Shiprocket
const createOrder = async (orderData) => {
  try { 
    if (!token) await authenticate();

    // const response = await axios.post(`${SHIPROCKET_API_URL}/orders/create/adhoc`, orderData, {
    //   headers: {
    //     Authorization: `Bearer ${token}`,
    //   },
    // });
    
    // console.log('Order created successfully:', response.data);
    // return response.data;
    console.log('Order created successfully:', orderData);
  } catch (error) {
    console.error('Error creating order with Shiprocket:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Function to check order status
const checkOrderStatus = async (orderId) => {
  try {
    if (!token) await authenticate();

    const response = await axios.get(`${SHIPROCKET_API_URL}/orders/show/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error checking order status with Shiprocket:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Export functions
module.exports = {
  createOrder,
  checkOrderStatus,
};

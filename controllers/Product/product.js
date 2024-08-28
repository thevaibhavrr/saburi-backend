const Product = require("../../model/Product/product");
const Trycatch = require("../../middleware/Trycatch");
const ApiFeatures = require("../../utils/apifeature");
const NodeCache = require("node-cache");
const cache = new NodeCache();

// create product
const CreateProduct = Trycatch(async (req, res, next) => {
  const { price, discountPercentage, ProductSize } = req.body;
  if (req.body.discountPercentage) {
    // Calculate the discounted price
    const discountedPrice =
      price - price * (discountPercentage / 100).toFixed(2);

    const product = await Product.create({
      ...req.body,
      PriceAfterDiscount: discountedPrice,
    });
    // for (let Sizeproduct of ProductSize) {
    //   await ProductSize.create({
    //     ...Sizeproduct,
    //     productId: product._id,
    //   });
    // }
    res.status(201).json({
      success: true,
      product,
    });
  } else {
    const product = await Product.create(req.body);
    // for (let Sizeproduct of ProductSize) {
    //   await ProductSize.create({
    //     ...Sizeproduct,
    //     productId: product._id,
    //   });
    // }
    res.status(201).json({
      success: true,
      product,
    });
  }
});
const GetAllProducts = Trycatch(async (req, res, next) => {
  const perPageData = req.query.perPage;
  let { minPrice, maxPrice } = req.query;
  let category = req.query.category;
  let IsOutOfStock = req.query.IsOutOfStock;
  let productType = req.query.productType;
  const nameSearch = req.query.name;

  category = category ? category : "";
  IsOutOfStock = IsOutOfStock ? IsOutOfStock : "";

  // Ensure minPrice and maxPrice are numbers
  minPrice = minPrice ? Number(minPrice) : 0;
  maxPrice = maxPrice ? Number(maxPrice) : 1000000000;

  // result per page
  const resultPerPage = perPageData ? perPageData : 50;

  let features = new ApiFeatures(Product.find(), req.query)
    .search()
    .filterByPriceRange(minPrice, maxPrice)
    .filterByCategory(category)
    .filterByStock(IsOutOfStock);

  // Conditionally add filterByproductType
  if (productType) {
    features = features.filterByProductType(productType);
  }

  let totalProductsCount;
  let filter = {};

  if (nameSearch) {
    totalProductsCount = 0;
  } else {
    if (category) {
      filter.category = category;
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.PriceAfterDiscount = {
        ...(minPrice !== undefined && { $gte: minPrice }),
        ...(maxPrice !== undefined && { $lte: maxPrice }),
      };
    }

    if (Object.keys(filter).length > 0) {
      totalProductsCount = await Product.countDocuments(filter);
    } else {
      totalProductsCount = await Product.countDocuments();
    }

    features = features.paginate(resultPerPage);
  }

  features.query
    .select(
      "name price PriceAfterDiscount discountPercentage quantity thumbnail category IsOutOfStock productType description"
    )
    .populate("category");

  const Allproducts = await features.query;

  const products = Allproducts.reverse();

  res.status(200).json({
    resultPerPage,
    success: true,
    totalProducts: totalProductsCount,
    products,
  });
});

const GetAllProductsworksecondtoday = Trycatch(async (req, res, next) => {
  const perPageData = req.query.perPage;
  let { minPrice, maxPrice } = req.query;
  let category = req.query.category;
  let IsOutOfStock = req.query.IsOutOfStock;
  let productType = req.query.productType;
  const nameSearch = req.query.name;

  category = category ? category : "";
  IsOutOfStock = IsOutOfStock ? IsOutOfStock : "";

  // result per page
  const resultPerPage = perPageData ? perPageData : 50;
  // price
  minPrice = minPrice ? minPrice : 0;
  maxPrice = maxPrice ? maxPrice : 1000000000;

  let features = new ApiFeatures(Product.find(), req.query)
    .search()
    .filterByPriceRange(minPrice, maxPrice)
    .filterByCategory(category)
    .filterByStock(IsOutOfStock);

  // Conditionally add filterByproductType
  if (productType) {
    features = features.filterByProductType(productType);
  }

  let totalProductsCount;
  let filter = {};

  if (nameSearch) {
    totalProductsCount = 0;
  } else {
    if (category) {
      filter.category = category;
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.PriceAfterDiscount = {
        ...(minPrice !== undefined && { $gte: minPrice }),
        ...(maxPrice !== undefined && { $lte: maxPrice }),
      };
    }

    if (Object.keys(filter).length > 0) {
      totalProductsCount = await Product.countDocuments(filter);
    } else {
      totalProductsCount = await Product.countDocuments();
    }

    features = features.paginate(resultPerPage);
  }

  features.query
    .select(
      "name price PriceAfterDiscount discountPercentage quantity thumbnail category IsOutOfStock productType description"
    )
    .populate("category");

  const Allproducts = await features.query;

  const products = Allproducts.reverse();

  res.status(200).json({
    resultPerPage,
    success: true,
    totalProducts: totalProductsCount,
    products,
  });
});

const GetAllProductsworikinglastrsixtwntifor = Trycatch(
  async (req, res, next) => {
    const perPageData = req.query.perPage;
    let { minPrice, maxPrice } = req.query;
    let category = req.query.category;
    let IsOutOfStock = req.query.IsOutOfStock;
    let productType = req.query.productType;
    const nameSearch = req.query.name;

    category = category ? category : "";
    IsOutOfStock = IsOutOfStock ? IsOutOfStock : "";

    // result per page
    const resultPerPage = perPageData ? perPageData : 50;
    // price
    minPrice = minPrice ? minPrice : 0;
    maxPrice = maxPrice ? maxPrice : 1000000000;

    let features = new ApiFeatures(Product.find(), req.query)
      .search()
      .filterByPriceRange(minPrice, maxPrice)
      .filterByCategory(category)
      .filterByStock(IsOutOfStock);

    // Conditionally add filterByproductType
    if (productType) {
      features = features.filterByProductType(productType);
    }

    let totalProductsCount;

    if (nameSearch) {
      totalProductsCount = 0;
    } else if (category) {
      totalProductsCount = await Product.countDocuments({ category: category });
      features = features.paginate(resultPerPage);
    } else {
      totalProductsCount = await Product.countDocuments();
      features = features.paginate(resultPerPage);
    }

    features.query
      .select(
        "name price PriceAfterDiscount discountPercentage quantity thumbnail category IsOutOfStock productType description"
      )
      .populate("category");

    const Allproducts = await features.query;

    const products = Allproducts.reverse();

    res.status(200).json({
      resultPerPage,
      success: true,
      totalProducts: totalProductsCount,
      products,
    });
  }
);

const GetAllProductsWorkingSerach = Trycatch(async (req, res, next) => {
  const perPageData = req.query.perPage;
  let { minPrice, maxPrice } = req.query;
  let category = req.query.category;
  let IsOutOfStock = req.query.IsOutOfStock;
  let productType = req.query.productType;
  const nameSearch = req.query.name;

  category = category ? category : "";
  IsOutOfStock = IsOutOfStock ? IsOutOfStock : "";

  // result per page
  const resultPerPage = perPageData ? perPageData : 50;
  // price
  minPrice = minPrice ? minPrice : 0;
  maxPrice = maxPrice ? maxPrice : 1000000000;

  let features = new ApiFeatures(Product.find(), req.query)
    .search()
    .filterByPriceRange(minPrice, maxPrice)
    .filterByCategory(category)
    .filterByStock(IsOutOfStock);

  // Conditionally add filterByproductType
  if (productType) {
    features = features.filterByProductType(productType);
  }

  // Add pagination only if no search query is applied
  let totalProductsCount;
  if (!nameSearch) {
    features = features.paginate(resultPerPage);
    totalProductsCount = await Product.countDocuments();
  } else {
    totalProductsCount = 0;
  }

  features.query
    .select(
      "name price PriceAfterDiscount discountPercentage quantity thumbnail category IsOutOfStock productType description"
    )
    .populate("category");

  const Allproducts = await features.query;

  const products = Allproducts.reverse();

  res.status(200).json({
    resultPerPage,
    success: true,
    totalProducts: totalProductsCount,
    products,
  });
});

// get all products
const GetAllProductsWorking = Trycatch(async (req, res, next) => {
  const perPageData = req.query.perPage;
  let { minPrice, maxPrice } = req.query;
  let category = req.query.category;
  let IsOutOfStock = req.query.IsOutOfStock;
  let productType = req.query.productType;
  category = category ? category : "";
  IsOutOfStock = IsOutOfStock ? IsOutOfStock : "";
  // productType = productType ? productType : "Domestic";

  // result per page
  const resultPerPage = perPageData ? perPageData : 50;
  //   price
  minPrice = minPrice ? minPrice : 0;
  maxPrice = maxPrice ? maxPrice : 1000000000;
  let features = new ApiFeatures(Product.find(), req.query)
    .search()
    .paginate(resultPerPage)
    .filterByPriceRange(minPrice, maxPrice)
    .filterByCategory(category)
    .filterByStock(IsOutOfStock);

  // Conditionally add filterByproductType
  // if (productType) {
  //   features = features.filterByproductType(productType);
  // }

  // console.log("Allproducts-----------------",features);
  // features.query.populate("category");
  features.query
    .select(
      "name price PriceAfterDiscount discountPercentage quantity thumbnail category IsOutOfStock productType description"
    )
    .populate("category");

  const Allproducts = await features.query;

  const products = Allproducts.reverse();

  // count total products
  const totalProductsCount = await Product.countDocuments();
  // updateProductType()
  res.status(200).json({
    resultPerPage,
    success: true,
    totalProducts: totalProductsCount,
    products,
  });
});

// get single product
const GetSingleProduct = Trycatch(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate("category");
  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }
  res.status(200).json({
    success: true,
    product,
  });
});

const UpdateProduct = Trycatch(async (req, res, next) => {
  // Update the product
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  // Check if quantity is greater than 0
  if (updatedProduct.quantity > 0) {
    updatedProduct.IsOutOfStock = "false";
  } else {
    updatedProduct.IsOutOfStock = "true";
  }

  // Save the updated product with IsOutOfStock updated
  const product = await updatedProduct.save();

  res.status(200).json({
    success: true,
    product,
  });
});

const updateProductType = async () => {
  try {
    // Find all products that don't have the productType field
    const productsToUpdate = await Product.find({
      productType: { $exists: false },
    });

    // Update each product with the default value for productType
    const updatedProducts = await Promise.all(
      productsToUpdate.map(async (product) => {
        product.productType = "Domestic"; // Set default value for productType
        return await product.save(); // Save the updated product
      })
    );

    console.log("Products updated successfully:", updatedProducts.length);
  } catch (error) {
    console.error("Error updating products:", error);
  }
};

// delete product
const DeleteProduct = Trycatch(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }
  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

// exports
module.exports = {
  CreateProduct,
  GetAllProducts,
  GetSingleProduct,
  UpdateProduct,
  DeleteProduct,
};

// const Product = require("../../model/Product/product");
// const Trycatch = require("../../middleware/Trycatch");
// const ApiFeatures = require("../../utils/apifeature");
// const NodeCache = require("node-cache");
// const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

// // create product
// const CreateProduct = Trycatch(async (req, res, next) => {
//   if (req.body.discountPercentage) {
//     const { price, discountPercentage } = req.body;
//     const discountedPrice = price - price * (discountPercentage / 100).toFixed(2);

//     const product = await Product.create({
//       ...req.body,
//       PriceAfterDiscount: discountedPrice,
//     });
//     res.status(201).json({
//       success: true,
//       product,
//     });
//   } else {
//     const product = await Product.create(req.body);
//     res.status(201).json({
//       success: true,
//       product,
//     });
//   }
//   cache.del("allProducts"); // Invalidate cache
// });

// // get all products
// const GetAllProducts = Trycatch(async (req, res, next) => {
//   const cacheKey = `allProducts_${JSON.stringify(req.query)}`;
//   if (cache.has(cacheKey)) {
//     return res.status(200).json(cache.get(cacheKey));
//   }

//   const perPageData = req.query.perPage;
//   let { minPrice, maxPrice } = req.query;
//   let category = req.query.category;
//   let IsOutOfStock = req.query.IsOutOfStock;
//   let productType = req.query.productType;
//   category = category ? category : "";
//   IsOutOfStock = IsOutOfStock ? IsOutOfStock : "";

//   const resultPerPage = perPageData ? perPageData : 50;
//   minPrice = minPrice ? minPrice : 0;
//   maxPrice = maxPrice ? maxPrice : 1000000000;
//   let features = new ApiFeatures(Product.find(), req.query)
//     .search()
//     .paginate(resultPerPage)
//     .filterByPriceRange(minPrice, maxPrice)
//     .filterByCategory(category)
//     .filterByStock(IsOutOfStock);

//   features.query.populate("category");

//   const Allproducts = await features.query;
//   const products = Allproducts.reverse();

//   const totalProductsCount = await Product.countDocuments();
//   const response = {
//     resultPerPage,
//     success: true,
//     totalProducts: totalProductsCount,
//     products,
//   };

//   cache.set(cacheKey, response); // Cache the response
//   res.status(200).json(response);
// });

// // get single product
// const GetSingleProduct = Trycatch(async (req, res, next) => {
//   const cacheKey = `product_${req.params.id}`;
//   if (cache.has(cacheKey)) {
//     return res.status(200).json(cache.get(cacheKey));
//   }

//   const product = await Product.findById(req.params.id).populate("category");
//   if (!product) {
//     return res.status(404).json({
//       success: false,
//       message: "Product not found",
//     });
//   }
//   cache.set(cacheKey, { success: true, product }); // Cache the product
//   res.status(200).json({
//     success: true,
//     product,
//   });
// });

// // update product
// const UpdateProduct = Trycatch(async (req, res, next) => {
//   const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//     useFindAndModify: false,
//   });

//   if (updatedProduct.quantity > 0) {
//     updatedProduct.IsOutOfStock = "false";
//   } else {
//     updatedProduct.IsOutOfStock = "true";
//   }

//   const product = await updatedProduct.save();
//   cache.del(`product_${req.params.id}`); // Invalidate cache
//   cache.del("allProducts"); // Invalidate cache
//   res.status(200).json({
//     success: true,
//     product,
//   });
// });

// const updateProductType = async () => {
//   try {
//     const productsToUpdate = await Product.find({
//       productType: { $exists: false },
//     });

//     const updatedProducts = await Promise.all(
//       productsToUpdate.map(async (product) => {
//         product.productType = "Domestic";
//         return await product.save();
//       })
//     );

//     console.log("Products updated successfully:", updatedProducts.length);
//   } catch (error) {
//     console.error("Error updating products:", error);
//   }
// };

// // delete product
// const DeleteProduct = Trycatch(async (req, res, next) => {
//   const product = await Product.findByIdAndDelete(req.params.id);
//   if (!product) {
//     return res.status(404).json({
//       success: false,
//       message: "Product not found",
//     });
//   }
//   cache.del(`product_${req.params.id}`); // Invalidate cache
//   cache.del("allProducts"); // Invalidate cache
//   res.status(200).json({
//     success: true,
//     message: "Product deleted successfully",
//   });
// });

// const updateProductQuantity = async (productId, quantityChange) => {
//   const product = await Product.findById(productId);
//   if (!product) {
//     throw new Error('Product not found');
//   }

//   const updatedQuantity = product.quantity - quantityChange;
//   const isOutOfStock = updatedQuantity <= 0;

//   const updatedProduct = await Product.findByIdAndUpdate(
//     productId,
//     { quantity: updatedQuantity, IsOutOfStock: isOutOfStock },
//     { new: true }
//   );

//   cache.set(`product_${productId}`, updatedProduct);

//   return updatedProduct;
// };
// // exports
// module.exports = {
//   CreateProduct,
//   GetAllProducts,
//   GetSingleProduct,
//   UpdateProduct,
//   DeleteProduct,
//   updateProductQuantity
// };

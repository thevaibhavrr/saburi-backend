const Product = require("../../model/Product/product");
const ProductSize = require("../../model/Product/productsize");
const Trycatch = require("../../middleware/Trycatch");
const ApiFeatures = require("../../utils/apifeature");


const CreateProduct = Trycatch(async (req, res, next) => {
  const { price, discountPercentage, productSizes } = req.body;
  
  let product;
  if (discountPercentage) {
    const discountedPrice = (price - price * (discountPercentage / 100)).toFixed(2);
    product = await Product.create({
      ...req.body,
      PriceAfterDiscount: discountedPrice,
    });
  } else {
    product = await Product.create(req.body);
  }
  if (productSizes && productSizes.length > 0) {
    for (let size of productSizes) {
      const productSize = await ProductSize.create({
        ...size,
        productId: product._id,
      });
      
    }
  }

  res.status(201).json({
    success: true,
    product,
  });
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
    .filterByCategory(category)
    .filterByStock(IsOutOfStock);

  // Conditionally add filterByproductType
  if (productType) {
    features = features.filterByProductType(productType);
  }

  // Add filtering logic for first size's FinalPrice between 150 and 300
  const productSizeFilter = await ProductSize.aggregate([
    {
      $match: {
        FinalPrice: { $gte: minPrice, $lte: maxPrice }  // FinalPrice between 150 and 300
      }
    },
    {
      $group: {
        _id: "$productId", 
        firstSize: { $first: "$FinalPrice" }
      }
    }
  ]).then(results => results.map(result => result._id));

  // Ensure only products with a matching size are included
  features.query = features.query.where('_id').in(productSizeFilter);

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

  const products = await Promise.all(
    Allproducts.map(async (product) => {
      const size = await ProductSize.find({ productId: product._id });
      return { ...product._doc, size };
    })
  );


  res.status(200).json({
    resultPerPage,
    success: true,
    totalProducts: totalProductsCount,
    products: products.reverse(),
  });
});


// const GetAllProducts = Trycatch(async (req, res, next) => {
//   const perPageData = req.query.perPage;
//   let { minPrice, maxPrice } = req.query;
//   let category = req.query.category;
//   let IsOutOfStock = req.query.IsOutOfStock;
//   let productType = req.query.productType; 
//   const nameSearch = req.query.name;
//   category = category ? category : "";
//   IsOutOfStock = IsOutOfStock ? IsOutOfStock : "";

//   // Ensure minPrice and maxPrice are numbers
//   minPrice = minPrice ? Number(minPrice) : 0;
//   maxPrice = maxPrice ? Number(maxPrice) : 1000000000;

//   // result per page
//   const resultPerPage = perPageData ? perPageData : 50;  

//   let features = new ApiFeatures(Product.find(), req.query)
//     .search()
//     .filterByPriceRange(minPrice, maxPrice)
//     .filterByCategory(category)
//     .filterByStock(IsOutOfStock);

//   // Conditionally add filterByproductType
//   if (productType) {
//     features = features.filterByProductType(productType);
//   }

//   let totalProductsCount;
//   let filter = {};

//   if (nameSearch) {
//     totalProductsCount = 0; 
//   } else {
//     if (category) {
//       filter.category = category;
//     }
//     if (minPrice !== undefined || maxPrice !== undefined) {

//       filter.PriceAfterDiscount = {
//         ...(minPrice !== undefined && { $gte: minPrice }),
//         ...(maxPrice !== undefined && { $lte: maxPrice }),
//       };
//     } 

//     if (Object.keys(filter).length > 0) {
//       totalProductsCount = await Product.countDocuments(filter);
//     } else {
//       totalProductsCount = await Product.countDocuments();
//     }

//     features = features.paginate(resultPerPage);
//   }

//   features.query
//     .select(
//       "name price PriceAfterDiscount discountPercentage quantity thumbnail category IsOutOfStock productType description"
//     )
//     .populate("category");

//   const Allproducts = await features.query;

//   // const products = Allproducts.reverse();
//   const products = await Promise.all(
//     Allproducts.map(async (product) => {
//       const size  = await ProductSize.find({productId:product._id})

//       return { ...product._doc, size }
//     })
//   )

//   res.status(200).json({
//     resultPerPage,
//     success: true,
//     totalProducts: totalProductsCount,
//     products:products.reverse(),
//   });
// });



// get single product
const GetSingleProduct = Trycatch(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate("category");
  
  // find all size 
  const sizes = await ProductSize.find({ productId: product._id });

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }
  res.status(200).json({
    success: true,
    product, 
    sizes
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
  const productSizes = await ProductSize.find({ productId: updatedProduct._id });
  const allSizesOutOfStock = productSizes.every(size => size.IsOutOfStock === "true");

  updatedProduct.IsOutOfStock = allSizesOutOfStock ? "true" : "false";

  // Check if quantity is greater than 0
  // if (updatedProduct.quantity > 0) {
  //   updatedProduct.IsOutOfStock = "false";
  // } else {
  //   updatedProduct.IsOutOfStock = "true";
  // }

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

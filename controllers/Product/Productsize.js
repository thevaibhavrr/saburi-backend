const Productsize = require("../../model/Product/productsize") 
const Product = require("../../model/Product/product");
const Trycatch = require("../../middleware/Trycatch");
// update product
const UpdateProductsize = Trycatch(async (req, res, next) => {


    const productsize = await Productsize.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

    //   IsOutOfStock: {
    //     type: String,
    //     default: "false",
    // },

      // product quantity is more then 0 then  IsOutOfStock will be false
      if (productsize.quantity > 0) {
        productsize.IsOutOfStock = "false";
      }

      await productsize.save();

      res.status(200).json({
        success: true,
        productsize,
      });
});

// delete 
 const DeleteProductsize = Trycatch(async (req, res, next) => {
    const productsize = await Productsize.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      productsize,
    });
  });

module.exports = {UpdateProductsize,DeleteProductsize}

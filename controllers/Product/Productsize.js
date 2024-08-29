const Productsize = require("../../model/Product/productsize") 
const Product = require("../../model/Product/product")
const Trycatch = require("../../middleware/trycatch");
// update product
const UpdateProductsize = Trycatch(async (req, res, next) => {
    const productsize = await Productsize.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      res.status(200).json({
        success: true,
        productsize,
      });
});

module.exports = {UpdateProductsize}

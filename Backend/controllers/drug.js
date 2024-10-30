const Drug = require("../models/drug");

exports.getAll = async (req, res, next) => {
  try {
    const search = req.query.search || "";

    const drugs = await Drug.find({
      $or: [
        { productTradeName: { $regex: `.*${search}.*`, $options: "i" } },
        { innOfApi: { $regex: `.*${search}.*`, $options: "i" } },
        { apiStrengthPerDosage: { $regex: `.*${search}.*`, $options: "i" } },
        { dosageFormName: { $regex: `.*${search}.*`, $options: "i" } },
        { routesName: { $regex: `.*${search}.*`, $options: "i" } },
      ],
    }).limit(20);

    res.status(200).json(drugs);
  } catch (error) {
    console.log(
      "🚀 ~ file: product.js ~ line 169 ~ exports.getAll= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error fetching drugs",
    });
  }
};

exports.getAll2 = async (req, res, next) => {
  try {
    if (!req.query.search) {
      const drugs = await Drug.find({});

      res.status(200).json(drugs);
    } else {
      const drugs = await Drug.aggregate([
        {
          $search: {
            index: "posdrugsearch",
            autocomplete: {
              path: "searchField",
              query: `${req.query.search}`,
              // "fuzzy": {
              //   "maxEdits": 2
              // }
            },
          },
        },
        {
          $limit: 20,
        },
        {
          $project: {
            _id: 0,
            productTradeName: 1,
            innOfApi: 1,
            apiStrengthPerDosage: 1,
            dosageFormName: 1,
            routesName: 1,
          },
        },
      ]);

      return res.status(200).json(drugs);
    }
  } catch (error) {
    console.log(
      "🚀 ~ file: product.js ~ line 169 ~ exports.getAll= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error fetching drugs",
    });
  }
};

const User = require("../models/user");
const Search = require("../models/search");

exports.create = async (req, res, next) => {
    try {
        const { phoneNumber, productName } = req.body;

        if (!phoneNumber || !productName) {
            return res.status(400).json({
                code: 400,
                message: "Missing required fields",
            });
        }

        // const user = await User.findById(userId);
        // if (!user) {
        //     return res.status(400).json({
        //         code: 400,
        //         message: "User not found",
        //     });
        // }

        const search = new Search({
            // user: {
            //     firstName: user.firstName,
            //     lastName: user.lastName,
            //     email: user.email,
            //     phoneNumber: phoneNumber,
            // },
            productName,
            phoneNumber
        });

        await search.save();

        return res.status(201).json(search);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            code: 500,
            message: "Server error",
        });
    }
};

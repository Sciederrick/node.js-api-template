const User = require("./../../../mongo/models/users");

const model = {};

model.deleteMultipleUsers = async (arrayOfIds) => {
    return await User.deleteMany({ _id: { $in: arrayOfIds }});
};

module.exports = model;
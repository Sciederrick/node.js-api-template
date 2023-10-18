const { deleteMultipleUsers } = require("./../model/user.model");

const controller = {};

controller.deleteMultipleUsers = async (req, res, _) => {
    try {
        const { ids } = req.query;
        ids.forEach((id, index) => {
            if (typeof id != 'string' || id.trim().length == 0)  return res.status(400).json({
                message: "Invalid id format",
                status: 400
            });
            ids[index] = id.trim();
        });

        const deleted = await deleteMultipleUsers(ids);
        return res.status(200).json({
            message: "Resources deleted successfully",
            deleted: deleted?.deletedCount,
            status: 500
        });
        
    } catch(err) {
        console.error(err);
        return res.status(500).json({
            message: "Something went wrong",
            log: err,
            status: 500
        })
    }

};

module.exports = controller;
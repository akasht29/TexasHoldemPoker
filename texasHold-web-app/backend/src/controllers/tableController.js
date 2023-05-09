const tableModel = require('../models/table/tableModel');

const tableController = {};

tableController.createTable = (req, res, next) => {
  const { tableName } = req.body;
  tableModel.createTable(tableName)
    .then((tableId) => {
      res.status(200).json({ tableId });
    })
    .catch((err) => {
      next(err);
    });
};

/*

todo can join table to check for    return num_players < max_players;


};

*/



module.exports = tableController;

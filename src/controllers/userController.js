const { fetchUser } = require("../models/user");

const getList = async (req, res) => {
  const list = await fetchUser(userState.DB);

  return res.json({
    result: {
      data: list,
    },
  });
};

module.exports = {
  getList,
};

const dashboardService = require('../services/dashboard.service');

const getDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getDashboard(req.userId, req.userRole);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard };

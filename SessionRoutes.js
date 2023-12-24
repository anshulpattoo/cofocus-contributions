const Express = require("express");
const router = Express.Router();

const SessionGoogleCalController = require("./server/SessionGoogleCalController");

router.post("/bookSession", SessionGoogleCalController.scheduleGCalSession);

router.post("/cancelSession", SessionGoogleCalController.removeGCalSession);

module.exports = router;

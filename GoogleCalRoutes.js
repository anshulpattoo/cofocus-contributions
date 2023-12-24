const Express = require("express");


const UserGoogleCalController = require("./server/UserGoogleCalController")
const UserDataController = require("./database/UserDataController");

const router = Express.Router();


// Connect Cofocus user to their Google Calendar. 
router.post(
  "/googleCalendarConnect/:UID",
  UserGoogleCalController.startGCalConnection,
);

// Connect Cofocus user to their Google Calendar. 
router.post(
  "/gCalOn/:UID",
  UserGoogleCalController.setGoogleCalCredentials
);

// Disconnect Cofocus user from their Google Calendar. 
router.post(
  "/googleCalendarDisconnect/:UID",
  UserGoogleCalController.disconnectGCal
);

// Get user's Google Calendar authenticated state. 
router.get(
  "/googleCalAuthState/:UID", 
  UserDataController.getGoogleCalAuthState
); 

module.exports = router;

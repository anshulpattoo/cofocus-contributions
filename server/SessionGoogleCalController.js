const {
  initializeGCal,
  insertGCalEvent,
  deleteGCalEvent,
} = require("./UserGoogleCalController");
const UpcomingSessionDataController = require("../database/UpcomingSessionDataController");
const { getUserPropertyById } = require("../database/UserDataController");

// ================= HELPER FUNCTIONS ===================== \\

// Checks if Google Calendar is enabled given the user ID. Returns the corresponding property for that user.
/**@todo move away and change to generic function 'isIntegrationEnabled' */
async function checkGCalEnabled(userID) {
  const userCal = await getUserPropertyById(userID, "googleCalendar");
  if (userCal.googleCalendar.enabled === false) {
    return null;
  }
  console.log(userCal);
  return userCal;
}

const SessionGoogleCalController = {
  /**
   * Inserts event into Google Calendar for a single user who has booked a session. Assigns the event ID
   * for such user in the corresponding document of the upcomingSessions collection.
   * @param {Object} userInfo: contains user ID and user index as listed in the upcomingsessions document
   * @param {Number} sessionID
   * @param {Number} dateTimeMS
   * @returns
   */
  async scheduleGCalSession(userInfo, sessionID, dateTimeMS, location) {
    const userCal = await checkGCalEnabled(userInfo.userID);
    if (userCal === null) {
      console.log("User doesn't have Google Calendar enabled");
      return;
    }

    try {
      const calendar = await initializeGCal(userInfo.userID, userCal, location);

      if (!calendar) {
        throw new Error("Calendar failed to be initialized.");
      }

      const eventID = await insertGCalEvent(dateTimeMS, calendar);

      const result = await UpcomingSessionDataController.setGoogleCalEventID(
        { userIndex: userInfo.userIndex, eventID: eventID },
        sessionID
      );

      if (result.success) {
        console.log("Google Calendar event successfully scheduled.");
      } else {
        throw new Error("Google calendar event NOT successfully scheduled.");
      }
    } catch (err) {
      console.log("Error: ", err);
    }
  },

  /**
   * Deletes the event from user's Google calendar: passes event ID into database function
   * from userInfo.
   * @param {Object} userInfo: contains user ID and event ID.
   * @returns
   */
  async removeGCalSession(userInfo, location) {
    const userCal = await checkGCalEnabled(userInfo.userID);
    if (userCal === null) {
      console.log("User doesn't have Google Calendar enabled");
      return;
    }

    try {
      const calendar = await initializeGCal(userInfo.userID, userCal, location);

      if (!calendar) {
        throw new Error("Calendar failed to be initialized.");
      }

      await deleteGCalEvent(userInfo.eventID, calendar);
    } catch (err) {
      console.log("Error: ", err);
    }
  },
};

module.exports = SessionGoogleCalController;

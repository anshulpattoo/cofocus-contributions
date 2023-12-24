const db = require("../../mongo");
const collection = db.UpcomingSession;
const { ObjectID } = require("mongodb");

const UpcomingSessionDataController = {
  /**
   * Sets the Google Calendar event ID for a particular user in the upcomingsessions collection.
   * @param {Object} userInfo: contains eventID and userIndex (relevant index under users property)
   * @param {Number} sessionID
   * @returns {Object} with a single key 'success'
   */
  async setGoogleCalEventID(userInfo, sessionID) {
    try {
      await collection.updateOne(
        { _id: new ObjectID(sessionID) },
        {
          $set: {
            /**
             * Template strings cannot be used as property values. Thus, they are put into brackets.
             * More here: https://stackoverflow.com/questions/33194138/template-string-as-object-property-name.
             *  */
            [`users.${userInfo.userIndex}.metadata.googleCalEventID`]:
              userInfo.eventID,
          },
        }
      );
      return { success: true };
    } catch (error) {
      console.log("setGoogleCalEventIDs", error);
    }
    return { success: false };
  },
};

module.exports = UpcomingSessionDataController;

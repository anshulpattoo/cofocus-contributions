const db = require("../../mongo");
const collection = db.User;
const { ObjectID } = require("mongodb");


const UserDataController = {
  async getUserPropertyById(id, property) {
    const options = { projection: {} };
    options.projection[property] = 1;
    return await collection.findOne({ _id: new ObjectID(id) }, options);
  },
  /* ==================== GOOGLE CALENDAR INTEGRATION ==================== */

  // Possible change in this implementation.
  async disconnectGoogleCal(userID) {
    try {
      const query = { _id: new ObjectID(userID) };
      const user = await collection.updateOne(query, {
        $set: {
          "googleCalendar.refreshToken": undefined,
          "googleCalendar.accessToken": undefined,
          "googleCalendar.enabled": false,
        },
      });
      if (user.modifiedCount === 1) {
        console.log("@disconnectGoogleCal successful");
        return { success: true };
      }
    } catch (error) {
      console.error("@disconnectGoogleCal error: ", error);
    }
    return { success: false };
  },

  // Sets whether a Google Calendar is enabled or not.
  async setGoogleCal(userID, calEnabled) {
    try {
      const user = await collection.updateOne(
        { _id: new ObjectID(userID) },
        { $set: { "googleCalendar.enabled": calEnabled } }
      );
      if (user.modifiedCount === 1) {
        console.log("@setGoogleCal successful");
        return { success: true };
      }
    } catch (error) {
      console.error("@setGoogleCal error: ", error);
    }
    return { success: false };
  },

  /* Get user Google Calendar enabled state */
  async getGoogleCalAuthState(userID) {
    try {
      const options = { projection: { _id: 0, "googleCalendar.enabled": 1 } };
      const user = await collection.findOne(
        { _id: new ObjectID(userID) },
        options
      );
      console.log("@getGoogleCalAuthState successful", user);
      return { success: true, authState: user };
    } catch (error) {
      console.error("@getGoogleCalAuthState error: ", error);
    }
    return { success: false };
  },

  // Sets the Google Calendar tokens, which either may be strings or undefined.
  async setGoogleCalTokens(userID, tokens) {
    try {
      const user = await collection.updateOne(
        { _id: new ObjectID(userID) },
        {
          $set: {
            "googleCalendar.refreshToken": tokens.refresh_token,
            "googleCalendar.accessToken": tokens.access_token,
          },
        }
      );
      if (user.modifiedCount === 1) {
        console.log("@setGoogleCalTokens successful");
        return { success: true };
      }
    } catch (error) {
      console.error("@setGoogleCalTokens error: ", error);
    }
    return { success: false };
  },

  async updateGoogleCalAccessToken(userID, accessToken) {
    try {
      const user = await collection.updateOne(
        { _id: new ObjectID(userID) },
        { $set: { "googleCalendar.accessToken": accessToken } }
      );
      if (user.modifiedCount === 1) {
        console.log("@updateGoogleCalAccessToken successful");
        return { success: true };
      }
    } catch (error) {
      console.error("@updateGoogleCalAccessToken error: ", error);
    }
    return { success: false };
  },
};

module.exports = UserDataController;

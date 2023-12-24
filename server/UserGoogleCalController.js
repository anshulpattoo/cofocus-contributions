const {
  getUserPropertyById,
  setGoogleCal,
  setGoogleCalTokens,
  updateGoogleCalAccessToken,
} = require("../database/UserDataController");
const GoogleCalController = require("./GoogleCalController");

// ================= HELPER FUNCTIONS ===================== \\

// Returns milliseconds given hours, minutes, and seconds (all as Number objects).
function convertToMiliseconds(hours, minutes, seconds) {
  return (hours * 60 * 60 + minutes * 60 + seconds) * 1000;
}

// ================= EXPORTED OBJECT ===================== \\
const UserGoogleCalController = {
  /**
   * Connects user to Google in integrations section of app. This is a middleware function.
   *
   * When the user is not connected, we should not have any of their tokens.
   * In other words, the user document in users collection should be clear of any
   * Google Calendar data.
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async startGCalConnection(req, res) {
    const userCal = await getUserPropertyById(req.params.UID, "googleCalendar");
    await setGoogleCal(req.params.UID, true);
    console.log("User's Google Calendar information: " + userCal);
    const oAuth2Client = await GoogleCalController.initClient(null, req);

    if (!userCal.googleCalendar.accessToken) {
      const authUrl = await GoogleCalController.generateAuthUrl(
        oAuth2Client,
        req
      );
      console.log(
        "Client initiated and authorization URL generated: " + authUrl
      );

      return res.status(200).json({ success: true, authURL: authUrl });
    } else {
      // This else block should technically never run. It only runs if the user has existing tokens in our database.

      // Reset database information.
      console.log(
        "@UserGoogleCalController.startGCalConnection: User has existing tokens. Changing tokens in database..."
      );

      await setGoogleCalTokens(req.params.UID, {
        access_token: undefined,
        refresh_token: undefined,
      });
      await setGoogleCal(req.params.UID, false);

      // Stop the entire Google Calendar connection flow here.
      return res.status(200).json({ success: false, disconnected: false });
    }
  },

  async setGoogleCalCredentials(req, res) {
    const userID = req.params.UID;
    const code = req.query.authCode;

    console.log("Auth code retrieved: ", code);

    try {
      const oAuth2Client = await GoogleCalController.initClient(null, req);

      const result = await GoogleCalController.generateInitialTokens(
        oAuth2Client,
        code
      );

      if (!result) {
        return res.status(500).json({ success: false });
      }

      /* Save tokens to the database. */
      await setGoogleCalTokens(userID, result.tokens);

      const accessToken = result.tokens.access_token;
      const refreshToken = result.tokens.refresh_token;

      await GoogleCalController.setCredentials(
        oAuth2Client,
        refreshToken,
        accessToken
      );
      console.log(
        "Credentials have been set and Cofocus is now linked to user's Google Calendar."
      );

      return res.status(200).json({ success: true, tokens: result.tokens });
    } catch (error) {
      console.log("Error @setGoogleCalCredentials: ", error);
    }
  },

  /**
   * Disconnects user from Google Calendar: deletes existing Google Calendar events
   * and removes Google Calendar information in the database. This is a middleware function.
   * @param {Object} req
   * @param {Object} res
   * @param {Object} next
   */
  async disconnectGCal(req, res, next) {
    /**
     *
     * Delete any upcoming Google Calendar events user has with us.
     * This implementation is non-essential.
     *
     */
    const userID = req.params.UID;
    if (!userID) {
      return res.status(500).json({ success: false });
    }
    await setGoogleCalTokens(userID, {
      access_token: undefined,
      refresh_token: undefined,
    });
    await setGoogleCal(userID, false);
    res.status(200).json({ success: true }).end();
  },

  /**
   * Initializes calendar. Function is run on insertion of event or deletion of event solely if
   * Cofocus account is connected to Google.
   * @param {Number} userID
   * @returns calendar object.
   */
  async initializeGCal(userID, userCal, location) {
    var oAuth2Client = await GoogleCalController.initClient(location);

    const oldAccessToken = userCal.googleCalendar.accessToken;
    console.log("Old access token: " + oldAccessToken);
    const newAccessToken = await GoogleCalController.refreshAccessToken(
      userCal.googleCalendar.refreshToken
    );
    if (oldAccessToken !== newAccessToken && newAccessToken !== undefined) {
      console.log("Refresh of access token is successful: " + newAccessToken);
    }
    oAuth2Client = await GoogleCalController.setCredentials(
      oAuth2Client,
      userCal.googleCalendar.refreshToken,
      newAccessToken
    );
    console.log("Credentials are set.");
    updateGoogleCalAccessToken(userID, newAccessToken);

    const calendar = await GoogleCalController.initializeCalendar(oAuth2Client);

    return calendar;
  },

  /**
   * This function inserts an event into a user's Google Calendar given a Date object whose contents
   * follow UTC. Called after calling initializeGCal.
   * @param {Number} startDateTimeMS
   * @returns
   */
  async insertGCalEvent(startDateTimeMS, calendar) {
    const endDateTimeMS = startDateTimeMS + convertToMiliseconds(0, 50, 0); // Note that the 50-minute value is hard-coded.

    // Event details to be
    const event = {
      summary: "Cofocus Session",
      location: "https://www.cofocus.one",
      start: {
        dateTime: new Date(startDateTimeMS),
      },
      end: {
        dateTime: new Date(endDateTimeMS),
      },
      reminders: {
        useDefault: false,
        overrides: [
          // {
          //   method: "email",
          //   minutes: 5,
          // },
          {
            method: "popup",
            minutes: 5,
          },
        ],
      },
    };

    const response = await GoogleCalController.insertEvent(calendar, event);

    return response && response.data && response.data.id
      ? response.data.id
      : null;
  },

  /**
   * Deletes an event given the event ID for the particular user (after calling initializeGCal).
   * @param {Object} req
   * @param {Object} res
   * @param {*} eventID // NOTE: Will be added as a parameter.
   */
  async deleteGCalEvent(eventID, calendar) {
    console.log("Here is the event ID: ", eventID);
    var params = {
      calendarId: "primary",
      eventId: eventID,
    };

    await GoogleCalController.deleteEvent(params, calendar);
  },
};

module.exports = UserGoogleCalController;

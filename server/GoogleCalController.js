const { google } = require("googleapis");
const axios = require("axios");
const { OAuth2 } = google.auth;

const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];
/**
 * generateAuthUrl() and getInitialTokens() should only be called when the
 * user is connecting their Google account with Cofocus for the first time.
 *
 * For all subsequent "connects", refressAccessToken() must be called to refesh the
 * access token (i.e., generate a new access token). This will allow new
 * credentials to be set with oAuth2Client (setCredentials()), enabling us access to calendar.
 */
const GoogleCalController = {
  /**
   * Initializes the Google OAuth2 Client.
   * @returns {Object} OAuth2 client object.
   */
  async initClient(location, req) {
    console.log("LOC!!!!!", location, "req: ", req);
    let core_uri = "";
    if (location && location.protocol && location.hostname) {
      core_uri = `${location.protocol}://${location.hostname}`;
    } else if (req && req.protocol && req.headers && req.headers.origin) {
      core_uri = req.headers.origin;
    }

    try {
      return new OAuth2({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: `${core_uri}/account/settings/integrations`,
      });
    } catch (err) {
      console.log("Google Calendar API could not initiate client: " + err);
    }
  },

  /**
   * Generates authorization URL for user, given OAuth2Client object.
   * @param {Object} oAuth2Client.
   * @returns {String} authorization URL.
   */
  async generateAuthUrl(oAuth2Client, req) {
    console.log(
      "REQ2!!!!!",
      req.protocol,
      "REQ2 BODY: ",
      req.headers,
      "REQ2 HOSTNAME: ",
      req.headers.origin
    );
    if (!req || !req.headers || !req.headers.origin) {
      throw new Error("Request data missing.");
    }
    try {
      const authUrl = await oAuth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: SCOPES,
        redirect_uri: `${req.headers.origin}/account/settings/integrations`,
      });

      return authUrl;
    } catch (err) {
      console.log(
        "Google Calendar API could not generate authorization URL: " + err
      );
    }
  },

  /**
   * Returns refresh and access token given oAuth2Client object and authorization code.
   * @param {Object} oAuth2Client
   * @param {String} code
   * @returns tokens
   */
  async generateInitialTokens(oAuth2Client, code) {
    console.log("oAuth + code", oAuth2Client, code);
    try {
      const tokenObj = await oAuth2Client.getToken(code);
      console.log(
        "Here are the two tokens: " +
          tokenObj.tokens.access_token +
          "\n" +
          tokenObj.tokens.refresh_token
      );
      return tokenObj;
    } catch (err) {
      console.log(
        "Google Calendar API could not generate initial tokens: ",
        err
      );
    }
  },

  /**
   * Generates new access token given refresh token acquired from database.
   * @param {String} refreshToken
   * @returns {String} Access token.
   */
  async refreshAccessToken(refreshToken) {
    var post_data = {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    };

    try {
      const response = await axios.post(
        "https://oauth2.googleapis.com/token",
        post_data
      );
      return response.data.access_token;
    } catch (err) {
      console.log("POST request to refresh access token failed: " + err);
    }
  },

  /**
   * Sets credentials given the refresh token and access token.
   * @param {Object} oAuth2Client
   * @param {String} refreshToken
   * @param {String} accessToken
   * @returns {Object} oAuth2Client
   */
  async setCredentials(oAuth2Client, refreshToken, accessToken) {
    try {
      await oAuth2Client.setCredentials({
        refresh_token: refreshToken,
        access_token: accessToken,
      });
      return oAuth2Client;
    } catch (err) {
      console.log("Failed to set credentials: " + err);
    }
  },

  /**
   * Initializes Google Calendar given the oAuth2Client.
   * @param {Object} oAuth2Client
   * @returns {Object} calendar
   */
  async initializeCalendar(oAuth2Client) {
    try {
      const calendar = await google.calendar({
        version: "v3",
        auth: oAuth2Client,
      });
      return calendar;
    } catch (err) {
      console.log("Google Calendar API failed to initialize calendar: " + err);
    }
  },

  /**
   * Inserts event into user's Google Calendar given calendar and event objects.
   * @param {Object} calendar
   * @param {Object} event
   * @returns {Object} calendar
   */
  async insertEvent(calendar, event) {
    try {
      return await calendar.events.insert({
        calendarId: "primary",
        resource: event,
      });
    } catch (err) {
      console.log("Google Calendar API failed to insert event: " + err);
    }
  },

  /**
   * Deletes event from user's Google Calendar given params and calendar object. params consists of
   * calendarId and eventID.
   * @param {Object} params
   * @param {Object} calendar
   * @return
   */
  async deleteEvent(params, calendar) {
    try {
      await calendar.events.delete(params);
      console.log("Event has successfully been deleted.");
      return;
    } catch (err) {
      console.log("Google Calendar API failed to delete event: " + err);
    }
  },
};

module.exports = GoogleCalController;

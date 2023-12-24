import api from "../../api/cofocusAPI";

const GoogleCalAPI = {

  /******************** GOOGLE CALENDAR INTEGRATION ********************/

  /**
   * Gets the authorization URL and triggers the Google Calendar integration back-end flow.
   * @param {Object} userID
   * @returns result or null
   */
  async getGoogleCalAuthURL(userID) {
    // NOTE to Robert: There is an error that happens on a Vue page if null gets returned as a result.
    try {
      const result = await api.getResponseData({
        url: `/api/settings/googleCalendarConnect/${userID}`,
        method: "post",
        params: {
          UID: userID,
        },
        withCredentials: true,
      });

      if (result && result.success && result.authURL) {
        console.log("Authorization URL has been retrieved.");
      } else {
        // To current awareness, this else block only gets triggered if the user already has tokens in the database.
        throw new Error("Request failed to get Google Calendar Auth URL.");
      }

      return result;
    } catch (error) {
      console.log("@getGoogleCalAuthURL error: ", error);
    }
    return null; // *********** IMPORTANT: Vue.JS shows an error when result returned is null. ********//
  },

  /**
   * Makes a GET request to a back-end route specified in the setIntegrationCredentials function
   * in the UserGoogleCalController.js file.
   * @param {String} authCode
   * @returns Tokens.
   */
  async connectGoogleCalAfterAuthURL(userID, authCode) {
    console.log("@1, authCode: ", authCode);
    console.log("@2, userID: ", userID);
    if (!authCode || !userID) {
      return console.log("Information not provided for request.");
    }
    try {
      const result = await api.getResponseData({
        url: `/api/settings/gCalOn/${userID}`,
        method: "post",
        params: {
          authCode: authCode,
          UID: userID,
        },
        withCredentials: true,
      });
      console.log("@2, result: ", result);

      if (result && result.success && result.tokens) {
        console.log(result.tokens);
        console.log("Credentials have been set and Cofocus is now linked to user's Google Calendar.");
      } else {
        throw new Error("Request failed to connect to Google Calendar.");
      }

      return result;
    } catch (error) {
      console.error("@connectGoogleCalAfterAuthURL error: ", error);
    }
    return null;
  },

  /**
   * Disconnects Cofocus user from Google Calendar.
   * @param {String} userID
   * @returns result.
   */
  async disconnectGoogleCal(userID) {
    try {
      const result = await api.getResponseData({
        url: `/api/settings/googleCalendarDisconnect/${userID}`,
        method: "post",
        params: {
          UID: userID,
        },
        withCredentials: true,
      });

      if (result) {
        console.log("Google Calendar has been disconnected.");
      } else {
        throw new Error("Google Calendar failed to disconnect.");
      }

      return result;
    } catch (error) {
      console.log("@disconnectGoogleCal error: ", error);
    }
    return null; // *********** IMPORTANT: Vue.JS shows an error when result returned is null. ********//
  },

  /**
   * Gets the authorization URL and triggers the Google Calendar integration back-end flow.
   * @param {Object} userID
   * @returns result or null
   */
  async getGoogleCalAuthState(userID) {
    try {
      const result = await api.getResponseData({
        url: `/api/settings/googleCalAuthState/${userID}`,
        method: "get",
        params: {
          UID: userID,
        },
        withCredentials: true,
      });

      console.log("GA RESULT: ", result);
      if (result && result.success && result.authState && result.authState.googleCalendar && result.authState.googleCalendar.enabled) {
       console.log("integration successful")
      } else {
        // To current awareness, this else block only gets triggered if the user already has tokens in the database.
        throw new Error("Request failed to get Google Calendar Auth URL.");
      }

      return result;
    } catch (error) {
      console.log("@getGoogleCalAuthURL error: ", error);
    }
    return null; // *********** IMPORTANT: Vue.JS shows an error when result returned is null. ********//
  },

  /* The following functions will need to be developed later. Sorry, Robert! */

  // export async function getUserIntegrationsData(userID) {
  //   /** RESOLVE WITH DUMMY DATA: REMOVE START*/
  //   if (userID) {
  //     const integrations = [
  //       {
  //         app: "googleCalendar",
  //         connected: false,
  //       },
  //     ];
  //     store.dispatch("integrations/setAllIntegrationStates", integrations);
  //     return;
  //   }
  //   /** RETURN DUMMY DATA: REMOVE END */

  //   console.log("@getUserIntegrationsData: ", userID);
  //   try {
  //     const result = await api.getResponseData({
  //       url: `/api/users/${userID}/integrationsData`,
  //       method: "get",
  //       params: {
  //         UID: userID,
  //       },
  //       withCredentials: true,
  //     });
  //     console.log("@getUserIntegrationsData result: ", result);

  //     if (!result.success || !result.integrations) {
  //       throw new Error("Request failed to get user integrations data");
  //     }
  //     store.dispatch("integrations/setAllIntegrationStates", result.integrations);
  //   } catch (error) {
  //     console.error("@getUserIntegrationsData error: ", error);
  //   }
  //   return null;
  // }

  // async function updateUserIntegrationsData(userID, integrationsData) {
  //   console.log("@updateUserIntegrationsData: ", userID, integrationsData);
  //   try {
  //     const result = await api.getResponseData({
  //       url: `/api/users/${userID}/integrationsData`,
  //       method: "post",
  //       data: {
  //         integrationsData,
  //       },
  //       params: {
  //         UID: userID,
  //       },
  //       withCredentials: true,
  //     });
  //     console.log("@updateUserIntegrationsData result: ", result);

  //     if (!result.success) {
  //       throw new Error("Request failed to update integrations data");
  //     }
  //   } catch (error) {
  //     console.error("@updateUserIntegrationsData error: ", error);
  //   }
  // }
};

export default GoogleCalAPI;

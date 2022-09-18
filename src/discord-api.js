const baseUrl = "https://discord.com/api";

export class DiscordAPI {
  url;
  headers;
  appId;

  constructor(botToken, appId, version = "v10") {
    // https://discord.com/developers/docs/reference#authentication
    this.headers = {
      authorization: `Bot ${botToken}`,
      "content-type": "application/json;charset=UTF-8",
    };
    this.appId = appId;
    this.url = `${baseUrl}/${version}`;
  }

  // https://discord.com/developers/docs/interactions/receiving-and-responding#followup-messages
  async followUpMessage(token, params) {
    // /webhooks/<application_id>/<interaction_token>/messages/@original
    return this.request(`/webhooks/${this.appId}/${token}`, "POST", params);
  }

  async requestRaw(path, method, body) {
    let headers = { ...this.headers };

    body = JSON.stringify(body);

    const response = await fetch(this.url + path, {
      headers,
      method,
      body: body,
    });

    if (!response.ok) {
      let errorBody;
      try {
        const {
          error: { message },
        } = await response.json();
        errorBody = message;
      } catch {
        try {
          errorBody = await response.text();
        } catch {
          errorBody = "Failed to get body as text";
        }
      }

      throw new Error(
        `Discord API request failed: ${response.status} --- Error: ${errorBody}`,
      );
    }

    return response;
  }

  async request(path, method, body) {
    const response = await this.requestRaw(path, method, body);
    return response.json();
  }
}

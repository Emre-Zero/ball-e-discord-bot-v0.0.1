const baseUrl = "https://api.openai.com";

export class OpenAI {
  url;
  headers;

  constructor(apiKey, organizationId, version) {
    // https://beta.openai.com/docs/api-reference/authentication
    this.headers = {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json;charset=UTF-8",
    };

    if (organizationId) {
      this.headers["openai-organization"] = organizationId;
    }

    this.url = `${baseUrl}/${version}`;
  }

  // https://beta.openai.com/docs/api-reference/completions/create
  complete(model, options) {
    options.model = model;
    return this.request(`/completions`, "POST", options);
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
        `OpenAI API request failed: ${response.status} --- Message: ${errorBody}`,
      );
    }

    return response;
  }

  async request(path, method, body) {
    const response = await this.requestRaw(path, method, body);
    return response.json();
  }
}

const request = require("request");

const LINE_API_BASE_URL = "https://api.line.me/v2";

const getProfile = (profileAccessToken) => {
  const options = {
    url: `${LINE_API_BASE_URL}/profile`,
    headers: { Authorization: `Bearer ${profileAccessToken}` },
    json: true,
  };

  return new Promise((resolve, reject) => {
    request.get(options, (err, res, body) => {
      if (err) {
        reject(body);
        return;
      }
      resolve(body);
    });
  });
};

const options = (userId, memo) => {
  return {
    url: `${LINE_API_BASE_URL}/bot/message/push`,
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      Authorization: `Bearer ${process.env.MESSAGING_API_ACCESS_TOKEN}`,
    },
    body: {
      to: userId,
      messages: [{ type: "text", text: memo }],
    },
    json: true,
  };
};

const postMessage = async (userId, memo) => {
  return new Promise((resolve, reject) => {
    request.post(options(userId, memo), (err, res, body) => {
      if (err) {
        reject(body);
        return;
      }
      resolve(body);
    });
  });
};

module.exports = {
  getProfile,
  postMessage,
};

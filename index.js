"use strict";
const Alexa = require("ask-sdk-core");
const Line = require("./line");
const getProfile = Line.getProfile;
const postMessage = Line.postMessage;

const REQUEST = {
  intent: "IntentRequest",
  launch: "LaunchRequest",
  sessionEnd: "SessionEndedRequest",
};
const INTENT = {
  custom: "LineMemoIntent",
  help: "AMAZON.HelpIntent",
  cancel: "AMAZON.CancelIntent",
  stop: "AMAZON.StopIntent",
};

const CustomHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === REQUEST["intent"] &&
      request.intent.name === INTENT["custom"]
    );
  },
  async handle(handlerInput) {
    const token = handlerInput.requestEnvelope.session.user.accessToken;

    const memo = handlerInput.requestEnvelope.request.intent.slots.Memo.value;

    if (!memo) {
      return handlerInput.responseBuilder
        .speak("上手く聞き取れなかったのでもう一度教えて下さい")
        .reprompt("ほにゃららをメモしてと言ってみて下さい")
        .getResponse();
    }

    const profile = await getProfile(token);
    const userId = profile.userId;

    await postMessage(userId, memo);

    return handlerInput.responseBuilder
      .speak(`LINEに${memo}とメモしました`)
      .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === REQUEST["launch"] ||
      (request.type === REQUEST["intent"] &&
        request.intent.name === INTENT["help"])
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak("メモしたい内容を教えて下さい")
      .reprompt("ほにゃららをメモしてと言って下さい")
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === REQUEST["intent"] &&
      (request.intent.name === INTENT["cancel"] ||
        request.intent.name === INTENT["stop"])
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === REQUEST["sessionEnd"];
  },
  handle(handlerInput) {
    console.log(
      `セッションが以下の理由で終了しました: ${handlerInput.requestEnvelope.request.reason}`
    );

    return handlerInput.responseBuilder.getResponse();
  },
};

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    CustomHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .lambda();

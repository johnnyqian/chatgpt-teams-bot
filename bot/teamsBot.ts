import {
  TeamsActivityHandler,
  CardFactory,
  TurnContext,
} from "botbuilder";
import rawWelcomeCard from "./adaptiveCards/welcome.json" assert { type: "json" };
import { AdaptiveCards } from "@microsoft/adaptivecards-tools";
import { ChatGPTAPI } from 'chatgpt';
import config from "./config.js";

export class TeamsBot extends TeamsActivityHandler {

  constructor() {
    super();

    const api = new ChatGPTAPI({
      apiKey: config.openaiApiKey,
    });

    let parentMessageId;

    this.onMessage(async (context, next) => {
      console.log("Running with Message Activity.");

      let prompt = context.activity.text;
      const removedMentionText = TurnContext.removeRecipientMention(context.activity);
      if (removedMentionText) {
        // Remove the line break
        prompt = removedMentionText.toLowerCase().replace(/\n|\r/g, "").trim();
      }

      console.log("prompt: ", prompt);

      const response = await api.sendMessage(prompt, {
        parentMessageId
      });

      const reply = response.text;
      parentMessageId = response.id;

      console.log("reply: ", reply);

      await context.sendActivity(reply);

      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });

    this.onMembersAdded(async (context, next) => {
      // const membersAdded = context.activity.membersAdded;
      // for (let cnt = 0; cnt < membersAdded.length; cnt++) {
      //   if (membersAdded[cnt].id) {
      //     const card = AdaptiveCards.declareWithoutData(rawWelcomeCard).render();
      //     await context.sendActivity({ attachments: [CardFactory.adaptiveCard(card)] });
      //     break;
      //   }
      // }
      const welcomeMessage = "你好，欢迎体验ChatGPT聊天机器人，你可以输入你感兴趣的任何问题向我提问。";
      await context.sendActivity(welcomeMessage);
      await next();
    });
  }
}

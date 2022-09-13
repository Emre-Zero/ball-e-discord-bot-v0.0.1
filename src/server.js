/**
 * The core server that runs on a Cloudflare worker.
 */

import { Router } from 'itty-router';
import {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} from 'discord-interactions';
import { MAIN_COMMAND } from './commands.js';
import { OpenAI } from './openai-api.js';


class JsonResponse extends Response {
  constructor(body, init) {
    const jsonBody = JSON.stringify(body);
    init = init || {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    };
    super(jsonBody, init);
  }
}

const router = Router();

const items = {
  "taco": {
    "name": "Taco 🌮",
    "emoji": "🌮",
  },
  "doner": {
    "name": "Döner Kebab 🥙",
    "emoji": "🥙",
  },
  "cookie": {
    "name": "Cookie 🍪",
    "emoji": "🍪",
  },
  "beer": {
    "name": "Beer 🍺",
    "emoji": "🍺",
  },
};

/**
 * A simple :wave: hello page to verify the worker is working.
 */
router.get('/', (request, env) => {
  return new Response(`👋 ${env.DISCORD_APPLICATION_ID}`);
});

/**
 * Main route for all requests sent from Discord.  All incoming messages will
 * include a JSON payload described here:
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
router.post('/', async (request, env) => {
  const message = await request.json();
  console.log('message', message);
  if (message.type === InteractionType.PING) {
    // The `PING` message is used during the initial webhook handshake, and is
    // required to configure the webhook in the developer portal.
    console.log('Handling Ping request');
    return new JsonResponse({
      type: InteractionResponseType.PONG,
    });
  }

  if (message.type === InteractionType.APPLICATION_COMMAND) {
    // Most user commands will come as `APPLICATION_COMMAND`.
    switch (message.data.options[0].name.toLowerCase()) {
      case "thank": {
        console.log('Handling thank command');

        const options = message.data.options[0].options;

        const action = options[0].value;
        const itemKey = options[1].value;
        const itemName = items[itemKey].name;
        const itemEmoji = items[itemKey].emoji;
        const targetUserId = options[2].value;
        let targetName = message.data.resolved.users[targetUserId].username;
        const memberUserId = message.member.user.id;
        let memberName = message.member.user.username;

        const targetNickname = message.data.resolved.members[targetUserId].nick;
        const memberNickname = message.member.nick;

        targetName = targetNickname || targetName;
        memberName = memberNickname || memberName;

        const storageTargetKey = `item-score-${targetUserId}-${itemKey}`;
        const storageMemberKey = `item-score-${memberUserId}-${itemKey}`;

        // Get current score
        let currentScore = await env.KV_STORAGE.get(storageTargetKey);
        currentScore = parseFloat(currentScore) || 0;

        let currentMemberScore = await env.KV_STORAGE.get(storageMemberKey);
        currentMemberScore = parseFloat(currentMemberScore) || 0;

        // Determine new score
        const newScore =
          action === 'give'
            ? currentScore + 1
            : currentScore - 1;

        const newMemberScore =
          action === 'give'
            ? Math.max(currentMemberScore - 1, 0)
            : currentMemberScore + 1;

        const emoji = action === 'give' ? '' : '';
        const begin =
          action === 'give'
            ? `**${memberName}** gave a ${itemName} to **${targetName}** ${emoji}`
            : `**${memberName}** stole a ${itemName} from **${targetName}** ${emoji}`;

        console.log({
          targetUserId,
          action,
          itemKey,
          itemName,
          currentScore,
          newScore,
        })

        // Save new score
        await env.KV_STORAGE.put(storageTargetKey, newScore, {
          metadata: {
            userId: targetUserId
          },
        });

        if (action === 'steal') {
          await env.KV_STORAGE.put(storageMemberKey, newMemberScore, {
            metadata: {
              userId: memberUserId
            },
          });
        }

        // Return score
        return new JsonResponse({
          type: 4,
          data: {
            content: `${begin}`,
          },
        });
      }
      case "ai": {
        console.log('Handling AI command');

        const options = message.data.options[0].options;
        const prompt = options[0].value;

        const openAI = new OpenAI(
          env.OPENAI_API_KEY,
          env.OPENAI_ORG_ID,
          'v1'
        );

        const completion = await openAI.complete('text-davinci-002', {
          prompt: prompt,
          max_tokens: 150,
          temperature: 0.8,
          best_of: 1,
          stream: false,
          // stop: "\n"
        });

        console.log({
          prompt,
          completion
        })

        return new JsonResponse({
          type: 4,
          data: {
            content: ` ${completion?.choices[0]?.text}`,
          },
        });
      }
      default:
        console.error('Unknown Command');
        return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
    }
  }

  console.error('Unknown Type');
  return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
});
router.all('*', () => new Response('Not Found.', { status: 404 }));

export default {
  /**
   * Every request to a worker will start in the `fetch` method.
   * Verify the signature with the request, and dispatch to the router.
   * @param {*} request A Fetch Request object
   * @param {*} env A map of key/value pairs with env vars and secrets from the cloudflare env.
   * @returns
   */
  async fetch(request, env) {
    if (request.method === 'POST') {
      // Using the incoming headers, verify this request actually came from discord.
      const signature = request.headers.get('x-signature-ed25519');
      const timestamp = request.headers.get('x-signature-timestamp');
      console.log(signature, timestamp, env.DISCORD_PUBLIC_KEY);
      const body = await request.clone().arrayBuffer();
      const isValidRequest = verifyKey(
        body,
        signature,
        timestamp,
        env.DISCORD_PUBLIC_KEY
      );
      if (!isValidRequest) {
        console.error('Invalid Request');
        return new Response('Bad request signature.', { status: 401 });
      }
    }

    // Dispatch the request to the appropriate route
    return router.handle(request, env);
  },
};

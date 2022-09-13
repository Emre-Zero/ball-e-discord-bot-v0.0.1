/**
 * Share command metadata from a common spot to be used for both runtime
 * and registration.
 *
 * Docs: https://discord.com/developers/docs/interactions/application-commands
 */

/**
 * Command Option Types
 *
 * SUB_COMMAND    1
 * SUB_COMMAND_GROUP    2
 * STRING    3
 * INTEGER    4    Any integer between -2^53 and 2^53
 * BOOLEAN    5
 * USER    6
 * CHANNEL    7    Includes all channel types + categories
 * ROLE    8
 * MENTIONABLE    9    Includes users and roles
 * NUMBER    10    Any double between -2^53 and 2^53
 * ATTACHMENT    11    attachment object
 */

export const MAIN_COMMAND = {
  name: 'ball-e',
  description: 'Experiments',
  "options": [
    // OpenAI
    {
      "name": "ai",
      "description": "OpenAI API",
      "type": 1, // 1 is type SUB_COMMAND
      "options": [
        {
          "name": "prompt",
          "description": "Prompt completion",
          "type": 3, // 3 is type str
          "required": true,
        },
        {
          "name": "creativity",
          "description": "Creativity setting ([least] 0.0 - 1.0 [most])",
          "type": 10, // Decimal
          "required": false,
          "choices": [
            {
              "name": "High / 1.0",
              "value": 1
            },
            {
              "name": "Med / 0.5",
              "value": 0.5
            },
            {
              "name": "Low / 0.1",
              "value": 0
            },
          ]
        },
        {
          "name": "model",
          "description": "Choose AI model",
          "type": 3, // Str
          "required": false,
          "choices": [
            {
              "name": "text-davinci-002 (smartiest)",
              "value": "text-davinci-002",
            },
            {
              "name": "text-curie-001",
              "value": "text-curie-001",
            },
            {
              "name": "text-babbage-001",
              "value": "text-babbage-001",
            },
            {
              "name": "text-ada-001 (dummythicc)",
              "value": "text-ada-001",
            },
          ]
        }
      ]
    },
    // Fun cmd
    {
      "name": "thank",
      "description": "Give or take",
      "type": 1, // 1 is type SUB_COMMAND
      "options": [
        {
          "name": "action",
          "description": "Which action?",
          "type": 3, // 3 is type str
          "required": true,
          "choices": [
            {
              "name": "give",
              "value": "give"
            },
            {
              "name": "steal",
              "value": "steal"
            },
            {
              "name": "raid",
              "value": "raid"
            },
          ]
        },
        {
          "name": "item",
          "description": "Which item?",
          "type": 3, // 3 is type str
          "required": true,
          "choices": [
            {
              "name": "Taco 🌮",
              "value": "taco"
            },
            {
              "name": "Döner Kebab 🥙",
              "value": "doner"
            },
            {
              "name": "Cookie 🍪",
              "value": "cookie"
            },
            {
              "name": "Beer 🍺",
              "value": "beer"
            },
          ]
        },
        {
          "name": "user",
          "description": "For whom?",
          "type": 6, // 6 is type USER
          "required": true
        },
      ]
    },
  ],
};

/**
 * Share command metadata from a common spot to be used for both runtime
 * and registration.
 */

export const MAIN_COMMAND = {
  name: 'ball-e',
  description: 'Experiments',
  "options": [
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
        }
      ]
    }
  ],
};

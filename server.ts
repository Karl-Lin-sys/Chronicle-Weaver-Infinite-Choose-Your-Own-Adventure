import { localApiOnly } from './local-api-guard.mjs';
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use('/api', localApiOnly(() => port));
const port = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '20mb' }));

// Server-side Google GenAI initialization with User-Agent header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to determine model for text generation
function getStoryModel(mode?: string): string {
  if (mode === 'deep-lore') return 'gemini-3.1-pro-preview';
  if (mode === 'fast') return 'gemini-3.1-flash-lite';
  return 'gemini-3.5-flash';
}

/**
 * 1. POST /api/adventure/next-chapter
 * Generates the next chapter of the adventure based on previous narrative, character state,
 * inventory, quest, and player's choice or custom free-form action.
 */
app.post('/api/adventure/next-chapter', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      character,
      inventory,
      quest,
      recentHistory,
      choiceMade,
      storyGenre,
      artStyle,
      mode = 'standard',
      isPrologue = false,
      storyPrompt = '',
    } = req.body;

    const selectedModel = getStoryModel(mode);

    const systemPrompt = `You are an elite interactive storytelling engine and master dungeon master for an infinite choose-your-own-adventure game.
The story unfolds dynamically based on player choices—NEVER force a pre-set railroading outcome. Actions have genuine consequences.
Rules:
1. Narrative: Craft vivid, immersive, atmospheric prose (250-400 words) with visceral sensory details, high stakes, and meaningful dialogue or lore.
2. Choices: Provide 3 to 4 distinct, compelling, and mutually divergent actions the player can choose from next. Each must have an id, text, riskLevel ('safe' | 'moderate' | 'perilous'), and a brief tactical hint.
3. Inventory: Actively observe if the player obtains, uses, spends, crafts, or loses items.
   - If an item is gained or crafted, specify it in 'inventoryDelta.added' with name, type ('weapon'|'armor'|'consumable'|'relic'|'key'|'tool'|'lore'), quantity, description, rarity ('common'|'uncommon'|'rare'|'epic'|'legendary'), effect.
   - If an existing item is lost or consumed, list its id or name in 'inventoryDelta.removedIds', or update quantity in 'inventoryDelta.updated'.
4. Quest: Track the overarching main quest. If this turn advances, reveals a twist, or finishes a milestone, update 'questUpdate' with currentStep, progressPercentage (0-100), recentMilestone, and add any completed step to 'completedSteps'.
5. Health/Resolve/Status: If the player incurs physical danger, combat, or mental strain, adjust healthChange (-100 to +100) or resolveChange (-100 to +100), or apply/remove statusEffects (e.g. 'Poisoned', 'Exhausted', 'Blessed', 'Torch Bearer', 'Bleeding').
6. Dramatis Personae (NPCs): If a notable NPC is met, record them in 'charactersMetDelta.newCharacters' or update their attitude/notes.
7. Visual Consistency (Crucial): Create a 'sceneImagePrompt' for image generation.
   - Begin with the art style instruction: "${artStyle?.artStylePrefix || 'Dark fantasy oil painting with dramatic chiaroscuro'}"
   - Embed the persistent protagonist visual anchor: "${character?.visualAnchor || 'Weathered adventurer in travel-worn hooded tunic'}"
   - Describe the exact dramatic focal point and environment of this specific scene.
8. Output strictly conforming to the requested JSON schema.`;

    const userPromptContent = isPrologue
      ? `INITIALIZE NEW ADVENTURE:
Genre/Setting: ${storyGenre || 'Eldritch Grimdark Fantasy'}
Art Style: ${artStyle?.artStyleName || 'Dark Fantasy Oil Painting'}
Protagonist Name: ${character?.name || 'Kaelen'}
Protagonist Role/Background: ${character?.role || 'Exiled Spellblade'}
Persistent Appearance / Visual Anchor: ${character?.visualAnchor || 'Silver-eyed wanderer in tattered midnight-blue cloak with runic vambraces'}
Starting Premise/Seed: ${storyPrompt || 'The bells of the sunken cathedral toll for the first time in three hundred years.'}

Generate Chapter 1 prologue, opening situation, initial starter inventory items (2-3 items), opening quest, and 3-4 distinct choices.`
      : `CONTINUE ADVENTURE:
Genre: ${storyGenre}
Protagonist: ${character?.name} (${character?.role}) [HP: ${character?.health}/${character?.maxHealth}, Resolve: ${character?.resolve}/${character?.maxResolve}]
Active Status Effects: ${JSON.stringify(character?.statusEffects || [])}
Current Inventory: ${JSON.stringify((inventory || []).map((i: any) => `${i.name} (x${i.quantity})`))}
Current Quest: ${quest?.title} (Step: ${quest?.currentStep}, Progress: ${quest?.progressPercentage}%)
Recent Chapter Narrative Summaries:
${(recentHistory || []).map((h: any, i: number) => `Chapter ${h.chapterNumber || i + 1} Title: ${h.title}\nChoice made: ${h.choiceTaken || 'None'}\nOutcome: ${h.narrativeText?.slice(0, 200)}...`).join('\n\n')}

PLAYER CHOSE TO DO:
"${choiceMade}"

Simulate the immediate consequences of this decision. Advance the plot logically, update inventory/quests/status, and provide the next 3-4 choices and scene image prompt.`;

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: userPromptContent,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.85,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            chapterTitle: { type: Type.STRING },
            narrative: {
              type: Type.STRING,
              description: 'Vivid prose describing the scene outcome and situation (250-400 words)',
            },
            choices: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING },
                  riskLevel: {
                    type: Type.STRING,
                    description: "'safe' | 'moderate' | 'perilous'",
                  },
                  hint: { type: Type.STRING },
                  requiredItem: { type: Type.STRING },
                },
                required: ['id', 'text', 'riskLevel'],
              },
            },
            inventoryDelta: {
              type: Type.OBJECT,
              properties: {
                added: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      name: { type: Type.STRING },
                      type: { type: Type.STRING },
                      quantity: { type: Type.INTEGER },
                      description: { type: Type.STRING },
                      rarity: { type: Type.STRING },
                      effect: { type: Type.STRING },
                    },
                    required: ['id', 'name', 'type', 'quantity', 'description', 'rarity'],
                  },
                },
                removedIds: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                updated: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      quantity: { type: Type.INTEGER },
                      description: { type: Type.STRING },
                    },
                    required: ['id', 'quantity'],
                  },
                },
              },
            },
            questUpdate: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                currentStep: { type: Type.STRING },
                progressPercentage: { type: Type.INTEGER },
                addCompletedStep: { type: Type.STRING },
                recentMilestone: { type: Type.STRING },
              },
            },
            characterStatusDelta: {
              type: Type.OBJECT,
              properties: {
                healthChange: { type: Type.INTEGER },
                resolveChange: { type: Type.INTEGER },
                addedEffects: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                removedEffects: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
            },
            charactersMetDelta: {
              type: Type.OBJECT,
              properties: {
                newCharacters: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      name: { type: Type.STRING },
                      role: { type: Type.STRING },
                      attitude: { type: Type.STRING },
                      visualAnchor: { type: Type.STRING },
                      notes: { type: Type.STRING },
                    },
                    required: ['id', 'name', 'role', 'attitude', 'visualAnchor', 'notes'],
                  },
                },
              },
            },
            sceneImagePrompt: {
              type: Type.STRING,
              description:
                'Detailed prompt with art style prefix and character visual anchor for real-time consistent image generation',
            },
          },
          required: [
            'chapterTitle',
            'narrative',
            'choices',
            'sceneImagePrompt',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed, modelUsed: selectedModel });
  } catch (error: any) {
    console.error('Error generating chapter:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to generate adventure chapter',
    });
  }
});

/**
 * 2. POST /api/adventure/generate-image
 * Generates high-quality scene illustration using gemini-3-pro-image-preview.
 * Provides affordance for user to specify image size: 1K, 2K, or 4K!
 */
app.post('/api/adventure/generate-image', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      prompt,
      aspectRatio = '16:9',
      imageSize = '1K', // '1K' | '2K' | '4K'
    } = req.body;

    if (!prompt) {
      res.status(400).json({ success: false, error: 'Prompt is required' });
      return;
    }

    // gemini-3-pro-image-preview with imageSize: '1K' | '2K' | '4K'
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as '16:9' | '4:3' | '1:1',
          imageSize: imageSize as '1K' | '2K' | '4K',
        },
      },
    });

    let imageUrl = '';
    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mime};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageUrl) {
      throw new Error('No image data returned from model');
    }

    res.json({
      success: true,
      imageUrl,
      modelUsed: 'gemini-3-pro-image-preview',
      imageSize,
      aspectRatio,
    });
  } catch (error: any) {
    console.error('Error generating image:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to generate image',
      fallbackRequired: true,
    });
  }
});

/**
 * 3. POST /api/adventure/chat
 * Multi-turn Gemini chatbot interface for Game Master / Lorekeeper / Companion advice.
 * Maintains conversation history, scrollable thread, and system instruction for specific roles.
 * Supports model switching:
 * - gemini-3.1-pro-preview for complex tasks (deep lore, complex tactics, puzzles)
 * - gemini-3.5-flash for general tasks
 * - gemini-3.1-flash-lite for fast tasks
 */
app.post('/api/adventure/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      messages = [],
      role = 'dungeon_master', // 'dungeon_master' | 'companion' | 'lorekeeper'
      modelPreference = 'auto', // 'auto' | 'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite'
      gameContext,
    } = req.body;

    // Determine model
    let modelToUse = 'gemini-3.5-flash';
    if (modelPreference === 'gemini-3.1-pro-preview') {
      modelToUse = 'gemini-3.1-pro-preview';
    } else if (modelPreference === 'gemini-3.1-flash-lite') {
      modelToUse = 'gemini-3.1-flash-lite';
    } else if (modelPreference === 'gemini-3.5-flash') {
      modelToUse = 'gemini-3.5-flash';
    } else {
      // Auto: if message looks like a complex deep lore or tactical theory, use pro
      const lastMsg = messages[messages.length - 1]?.content || '';
      if (lastMsg.length > 300 || /lore|history|mythology|ancient|calculate|puzzle|strategy/i.test(lastMsg)) {
        modelToUse = 'gemini-3.1-pro-preview';
      } else if (lastMsg.length < 50 || /quick|short|yes|no|roll/i.test(lastMsg)) {
        modelToUse = 'gemini-3.1-flash-lite';
      } else {
        modelToUse = 'gemini-3.5-flash';
      }
    }

    let roleInstruction = '';
    if (role === 'companion') {
      roleInstruction = `You are the player's devoted in-world travel companion and familiar, traveling alongside them. Speak in character, share emotional reactions, give intuitive tactical suggestions, and stay loyal.`;
    } else if (role === 'lorekeeper') {
      roleInstruction = `You are the Ancient Lorekeeper and Scholar of the Archives. Answer historical questions, decipher glyphs, expound upon legendary relics, and illuminate the world's deep secrets with scholarly eloquence.`;
    } else {
      roleInstruction = `You are the Omniscient Dungeon Master and Rules Arbiter. Provide unbiased advice on game mechanics, assess hypothetical risk probabilities of daring moves, answer questions about the current surroundings, and encourage player agency without spoiling upcoming narrative surprises.`;
    }

    const contextSummary = gameContext
      ? `CURRENT ADVENTURE STATE:
Protagonist: ${gameContext.characterName} (${gameContext.characterRole}) [HP: ${gameContext.health}/${gameContext.maxHealth}]
Current Location/Chapter: ${gameContext.chapterTitle || 'Unknown'}
Active Quest: ${gameContext.questTitle} (Step: ${gameContext.questStep})
Inventory: ${gameContext.inventoryItems?.join(', ') || 'Empty'}
Current Scene Summary: ${gameContext.currentSceneNarrative?.slice(0, 300) || 'None'}`
      : '';

    const systemInstruction = `${roleInstruction}\n\n${contextSummary}\n\nKeep responses engaging, helpful, atmospheric, and under 250 words unless asked for an extensive history.`;

    // Convert messages to GenAI contents format
    const contents = messages.map((m: any) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: modelToUse,
      contents,
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });

    res.json({
      success: true,
      reply: response.text || '',
      modelUsed: modelToUse,
    });
  } catch (error: any) {
    console.error('Error in adventure chat:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Chatbot request failed',
    });
  }
});

/**
 * 4. POST /api/adventure/quick-actions (Low-Latency Response)
 * Powered by gemini-3.1-flash-lite for ultra-fast, witty or tactical action suggestions.
 */
app.post('/api/adventure/quick-actions', async (req: Request, res: Response): Promise<void> => {
  try {
    const { sceneText, inventory, character } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: `Based on this scene, inventory, and character, provide 3 punchy, creative, unexpected custom actions the player could attempt right now:
Scene: ${sceneText?.slice(0, 400)}
Character: ${character?.name} (${character?.role})
Inventory: ${(inventory || []).map((i: any) => i.name).join(', ')}

Return JSON array of 3 short action strings.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
    });

    const actions = JSON.parse(response.text || '[]');
    res.json({ success: true, actions, modelUsed: 'gemini-3.1-flash-lite' });
  } catch (error: any) {
    console.error('Error generating quick actions:', error);
    res.status(500).json({ success: false, error: error?.message });
  }
});

/**
 * 5. POST /api/adventure/inspect-item (Low-Latency Response)
 * Powered by gemini-3.1-flash-lite to inspect an inventory item in context of the active quest/scene.
 */
app.post('/api/adventure/inspect-item', async (req: Request, res: Response): Promise<void> => {
  try {
    const { item, currentScene } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: `Examine this item in the context of the adventurer's current surroundings:
Item: ${item.name} (${item.rarity} ${item.type})
Description: ${item.description}
Current Situation: ${currentScene?.slice(0, 300)}

Provide a 2-3 sentence atmospheric appraisal: What hidden details, tactical utility, or dormant magic does the adventurer notice?`,
    });

    res.json({
      success: true,
      appraisal: response.text || '',
      modelUsed: 'gemini-3.1-flash-lite',
    });
  } catch (error: any) {
    console.error('Error inspecting item:', error);
    res.status(500).json({ success: false, error: error?.message });
  }
});

/**
 * Vite integration
 */
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '127.0.0.1', () => {
    console.log(`Adventure server running at http://localhost:${port} in ${isProd ? 'production' : 'development'} mode`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CardInput, EvaluationResult, AppSettings, ComparisonResult } from "../types";

const constructSystemInstruction = (settings: AppSettings) => `
You are an advanced NBA trading card investment evaluation engine.
Your purpose is to objectively score basketball cards for long-term investment (10–15 year horizon) using a strict weighted scoring system.
The user lives in Iceland and buys primarily from eBay (often COMC).
Budget range per card: $${settings.budgetMin} - $${settings.budgetMax} (Flexible).
Primary strategy: ${settings.strategyText}

VISUAL EXTRACTION TASK:
- You MUST detect the bounding box of the card artifact within the image.
- If the image is a screenshot of an eBay listing, IGNORE the browser UI, text, and white space. Focus ONLY on the card image.
- If the card is Graded (PSA, BGS, SGC), the "card" includes the slab/case.
- If the card is Raw, identifying the edges of the card stock.
- Return the coordinates (ymin, xmin, ymax, xmax) on a scale of 0 to 1000.
- EXTRACT PRICE: Look for text indicating price (e.g., "$36.31"). Ignore shipping costs.

LICENSING KNOWLEDGE (CRITICAL):
- Starting from the 2025-26 season, TOPPS (Fanatics) is the EXCLUSIVE official licensed manufacturer for NBA trading cards. 
- 2025-26 Topps NBA cards (like Topps Chrome, Topps No Limit, etc.) are FULLY LICENSED. Do NOT flag them as "unlicensed" or "custom".
- For seasons 2009-10 through 2024-25, Panini was the official licensed manufacturer.
- Upper Deck and SkyBox hold licenses for specific legends but generally not the full current NBA roster post-2009.

SCORING SYSTEM (MAX = 50 BASE POINTS):
1. PLAYER TIER (0-10): 
   - 10 = ${settings.tiers.tier10}
   - 9 = ${settings.tiers.tier9}
   - 8 = ${settings.tiers.tier8}
   - 7 = ${settings.tiers.tier7}
   - 6 = ${settings.tiers.tier6}
   - 5 = Star but not historically elite
   - <5 = Speculative / role player.
2. RARITY (0-10): ${settings.rubric.rarity}
3. GRADING (0-11): ${settings.rubric.grading}
   - RAW CARD SPECIAL LOGIC:
     - If the card is RAW and looks Clean/Sharp AND is a High-Tier Player/Rare Card where grading could multiply value (Arbitrage Potential): Score 6, 7, or 8.
     - If the card is RAW but Low-Tier/Base where grading costs exceed added value (Junk Slab Risk): Score 2, 3, or 4.
4. ERA & SET (0-5): ${settings.rubric.era}
   - 2025+ Topps Licensed releases are Score 4-5 assets.
5. VALUE EFFICIENCY (0-10): Compare PRICE to tier/serial/grade.
   - Extract PRICE from the image.
   - IGNORE SHIPPING costs in value calculation.
   - If NO price is visible, ESTIMATE the market value.
   - Criteria: ${settings.rubric.value}
6. STRATEGY FIT (0-4): 4=Perfect fit, 3=Strong, 2=Neutral, 1=Weak.

VERDICT MAPPING:
45-50+ -> DEFINITE BUY
40-44 -> STRONG BUY
35-39 -> CONDITIONAL
30-34 -> PASS
<30 -> AVOID

SET KNOWLEDGE:
Identify the specific Set (e.g., Topps Chrome, Prizm, Optic, Select, NT) and Year. Provide knowledge about:
- General context (Is it flagship? Low end? High end? New Topps era?)
- Key Inserts to chase (e.g., Color Blast, Downtown, Kaboom, No Limit)
- Case Hits / SSP (e.g., Gold Vinyl, Black Finite, Superfractors, etc.)
`;

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    card_display_name: { type: Type.STRING, description: "Full structured name: Year Set Player Serial" },
    extracted_details: {
      type: Type.OBJECT,
      properties: {
        player: { type: Type.STRING },
        year: { type: Type.STRING },
        set: { type: Type.STRING },
        grade: { type: Type.STRING },
        detected_price: { type: Type.STRING, description: "The price found in image or 'Est. $X' if not found." }
      },
      required: ['player', 'year', 'set', 'grade', 'detected_price']
    },
    card_bounding_box: {
        type: Type.OBJECT,
        description: "The bounding box of the card/slab itself, excluding background/UI. 0-1000 scale.",
        properties: {
            ymin: { type: Type.NUMBER },
            xmin: { type: Type.NUMBER },
            ymax: { type: Type.NUMBER },
            xmax: { type: Type.NUMBER }
        },
        required: ['ymin', 'xmin', 'ymax', 'xmax']
    },
    player_tier_score: { type: Type.NUMBER },
    player_tier_reason: { type: Type.STRING, description: "Brief justification (max 8 words)" },
    rarity_score: { type: Type.NUMBER },
    rarity_reason: { type: Type.STRING, description: "Brief justification (max 8 words)" },
    grading_score: { type: Type.NUMBER },
    grading_reason: { type: Type.STRING, description: "Brief justification (max 8 words)" },
    era_score: { type: Type.NUMBER },
    era_reason: { type: Type.STRING, description: "Brief justification (max 8 words)" },
    value_efficiency_score: { type: Type.NUMBER },
    value_efficiency_reason: { type: Type.STRING, description: "Brief justification (max 8 words)" },
    strategy_fit_score: { type: Type.NUMBER },
    strategy_fit_reason: { type: Type.STRING, description: "Brief justification (max 8 words)" },
    total_score: { type: Type.NUMBER },
    verdict: { type: Type.STRING, enum: ['DEFINITE BUY', 'STRONG BUY', 'CONDITIONAL', 'PASS', 'AVOID'] },
    explanation: { type: Type.STRING },
    set_info: {
      type: Type.OBJECT,
      properties: {
        general_info: { type: Type.STRING, description: "Brief overview of the set identity (max 15 words)" },
        key_inserts: { type: Type.STRING, description: "Names of top 2-3 inserts in this set" },
        case_hits: { type: Type.STRING, description: "Names of case hits or SSPs in this set" }
      },
      required: ['general_info', 'key_inserts', 'case_hits']
    },
    advanced: {
      type: Type.OBJECT,
      properties: {
        liquidity: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
        liquidity_reason: { type: Type.STRING, description: "Brief reason (max 10 words)" },
        appreciation_probability: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
        appreciation_reason: { type: Type.STRING, description: "Brief reason (max 10 words)" },
        trade_up_potential: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
        trade_up_reason: { type: Type.STRING, description: "Brief reason (max 10 words)" }
      },
      required: ['liquidity', 'liquidity_reason', 'appreciation_probability', 'appreciation_reason', 'trade_up_potential', 'trade_up_reason']
    }
  },
  required: [
    'card_display_name', 'extracted_details', 'card_bounding_box',
    'player_tier_score', 'player_tier_reason',
    'rarity_score', 'rarity_reason',
    'grading_score', 'grading_reason',
    'era_score', 'era_reason',
    'value_efficiency_score', 'value_efficiency_reason',
    'strategy_fit_score', 'strategy_fit_reason',
    'total_score', 'verdict', 'explanation', 'set_info', 'advanced'
  ]
};

export const evaluateCard = async (input: CardInput, settings: AppSettings): Promise<EvaluationResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const parts: any[] = [];

  if (input.image) {
    const matches = input.image.match(/^data:(.+);base64,(.+)$/);
    if (matches) {
      parts.push({
        inlineData: {
          mimeType: matches[1],
          data: matches[2]
        }
      });
    }
  }

  let promptText = `
    Analyze this NBA Card image. 
    1. Identify Player, Year, Set, Serial, and Grade.
    2. DETECT THE BOUNDING BOX of the card. This is critical.
    3. LOOK FOR A PRICE (sticker, text, ebay UI).
       - IGNORE SHIPPING COSTS. Focus only on the item price.
    4. Note: If the card is 2025-26 Topps, it IS a fully licensed NBA product.
    5. Provide specific scores and a brief REASON (max 8 words) for each score.
    6. Provide Advanced Analysis: Liquidity, Appreciation, Trade Up.
    7. Provide Set Information: General context, top Inserts to chase, and Case Hits/SSPs for this specific set.
  `;

  if (input.additionalInfo) {
    promptText += `\n\nADDITIONAL USER CONTEXT: "${input.additionalInfo}"\nUse this context to assist with identification, price data, or condition assessment, but verify visually if possible.`;
  }

  parts.push({ text: promptText });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: parts },
      config: {
        systemInstruction: constructSystemInstruction(settings),
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.1, // Lower temperature for more factual consistency
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as EvaluationResult;
  } catch (error) {
    console.error("Evaluation failed:", error);
    throw error;
  }
};

const comparisonSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    winner_index: { type: Type.NUMBER },
    winner_card_name: { type: Type.STRING },
    winner_reason: { type: Type.STRING },
    ranking: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          rank: { type: Type.NUMBER },
          original_index: { type: Type.NUMBER },
          card_name: { type: Type.STRING },
          reason: { type: Type.STRING },
        },
        required: ['rank', 'original_index', 'card_name', 'reason']
      }
    },
    market_analysis: { type: Type.STRING }
  },
  required: ['winner_index', 'winner_card_name', 'winner_reason', 'ranking', 'market_analysis']
};

export const compareCards = async (results: EvaluationResult[], settings: AppSettings): Promise<ComparisonResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Summarize results for the comparison prompt
  const summary = results.map((r, i) => `
    Card Index: ${i}
    Name: ${r.card_display_name}
    Total Score: ${r.total_score}
    Verdict: ${r.verdict}
    Price Detected: ${r.extracted_details.detected_price}
    Liquidity: ${r.advanced.liquidity}
    Growth Potential: ${r.advanced.appreciation_probability}
  `).join('\n---\n');

  const promptText = `
    Compare the following NBA trading cards based on their evaluation results.
    Determine the SINGLE BEST investment option considering score, potential, and liquidity.
    
    CARDS:
    ${summary}

    Return a structured comparison with a clear winner and ranking.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: promptText }] },
      config: {
        systemInstruction: "You are an expert NBA card investment advisor. Compare the provided card evaluations and pick the winner.",
        responseMimeType: 'application/json',
        responseSchema: comparisonSchema,
        temperature: 0.2,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No comparison response from AI");
    
    return JSON.parse(text) as ComparisonResult;
  } catch (error) {
    console.error("Comparison failed:", error);
    throw error;
  }
};

export const startChat = (input: CardInput, result: EvaluationResult, settings: AppSettings) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const historyParts: any[] = [];
    
    if (input.image) {
        const matches = input.image.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
            historyParts.push({
                inlineData: {
                    mimeType: matches[1],
                    data: matches[2]
                }
            });
        }
    }
    
    historyParts.push({ text: `Analyze this card. Context provided by user: ${input.additionalInfo || 'None'}` });

    return ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
            systemInstruction: constructSystemInstruction(settings) + 
            "\n\nMODE: CONVERSATIONAL ANALYSIS.\n" +
            "You are now discussing the card you just analyzed with the user.\n" +
            "Be helpful, concise, and knowledgeable about the NBA market.\n" +
            "Answer questions about comparable sales, player potential, or specific card features.\n" +
            "Keep responses relatively short (under 100 words) unless detailed analysis is requested.",
        },
        history: [
            {
                role: 'user',
                parts: historyParts
            },
            {
                role: 'model',
                parts: [{ text: JSON.stringify(result) }]
            }
        ]
    });
};
export interface CardInput {
  image: string; // Base64
  additionalInfo?: string;
  id?: string; // Unique ID for batch tracking
}

export interface EvaluationResult {
  card_display_name: string;
  extracted_details: {
    player: string;
    year: string;
    set: string;
    grade: string;
    detected_price: string;
  };
  card_bounding_box: {
    ymin: number;
    xmin: number;
    ymax: number;
    xmax: number;
  };
  player_tier_score: number;
  player_tier_reason: string;
  rarity_score: number;
  rarity_reason: string;
  grading_score: number;
  grading_reason: string;
  era_score: number;
  era_reason: string;
  value_efficiency_score: number;
  value_efficiency_reason: string;
  strategy_fit_score: number;
  strategy_fit_reason: string;
  total_score: number;
  verdict: 'DEFINITE BUY' | 'STRONG BUY' | 'CONDITIONAL' | 'PASS' | 'AVOID';
  explanation: string;
  set_info: {
    general_info: string;
    key_inserts: string;
    case_hits: string;
  };
  advanced: {
    liquidity: string;
    liquidity_reason: string;
    appreciation_probability: string;
    appreciation_reason: string;
    trade_up_potential: string;
    trade_up_reason: string;
  };
}

export interface ComparisonResult {
  winner_index: number; // Index in the provided results array
  winner_card_name: string;
  winner_reason: string;
  ranking: {
    rank: number;
    original_index: number;
    card_name: string;
    reason: string;
  }[];
  market_analysis: string;
}

export interface AppSettings {
  budgetMin: number;
  budgetMax: number;
  strategyText: string;
  tiers: {
    tier10: string;
    tier9: string;
    tier8: string;
    tier7: string;
    tier6: string;
  };
  rubric: {
    rarity: string;
    grading: string;
    era: string;
    value: string;
  };
}

export const DEFAULT_SETTINGS: AppSettings = {
  budgetMin: 0,
  budgetMax: 500,
  strategyText: "Long-term hold, Legends + Established Stars + Promising Youth. Prefer numbered inserts, SSP, PSA 10/BGS 9.5+. Strong interest in 2009–2018 Panini era and 90s legends.",
  tiers: {
    tier10: "GOAT / Tier 1 All-Time (Jordan, LeBron, Kobe)",
    tier9: "Inner Circle Legend (Shaq, Bird, Duncan, Curry, Durant)",
    tier8: "Lock HOF Superstar",
    tier7: "Multi-time All-Star / Strong Legacy",
    tier6: "Hall of Famer but lower demand",
  },
  rubric: {
    rarity: "10=/5 or lower/True SSP, 9=/10, 8=/25, 7=/35-49, 6=/50-99, 5=/100-199, 4=SSP non-numbered, <3=Mass.",
    grading: "11=Black Label, 10=PSA 10/Gem, 9=Mint. RAW CARDS: 6-8 if High Potential (clean/valuable), 2-4 if Low Potential/Base.",
    era: "5=2009-2018 Prime Panini, 4=Strong Modern Licensed, 3=Mid-tier, 2=Weak/Overprinted, 1=Poor.",
    value: "10=Severely underpriced. 8-9=Strong. 6-7=Fair. 4-5=Overpriced. <3=Bad value.",
  }
};

export const SCORING_CRITERIA = {
  PLAYER_TIER: { max: 10, label: 'Player Tier' },
  RARITY: { max: 10, label: 'Rarity' },
  GRADING: { max: 11, label: 'Grading' },
  ERA: { max: 5, label: 'Era & Set' },
  VALUE: { max: 10, label: 'Value Efficiency' },
  STRATEGY: { max: 4, label: 'Strategy Fit' },
};
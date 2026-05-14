export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { withErrorHandler, validateBody, ok } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth-helpers";
import { aIDescribeSchema } from "@/lib/schemas";

const categoryPrompts: Record<string, string> = {
  "E-book": "a compelling book description", "Course": "a course landing page with learning outcomes",
  "Template": "a template description with time-savings", "Software": "a SaaS-style product description",
  "Design": "a design asset description", "Audio": "an audio product description", "Video": "a video course description",
};

const suggestedPrice: Record<string, { min: number; max: number; recommended: number }> = {
  "E-book": { min: 29, max: 199, recommended: 79 }, "Course": { min: 99, max: 999, recommended: 299 },
  "Template": { min: 19, max: 299, recommended: 99 }, "Software": { min: 49, max: 499, recommended: 199 },
  "Design": { min: 9, max: 199, recommended: 49 }, "Audio": { min: 19, max: 299, recommended: 79 },
  "Video": { min: 49, max: 599, recommended: 199 },
};

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const { title, category, keywords } = validateBody(aIDescribeSchema, await req.json());

  const descriptions = [
    `**${title}** — Your Complete Guide\n\nEverything from fundamentals to advanced techniques. Designed for both beginners and experienced professionals.\n\n**What you get:**\n- Step-by-step tutorials\n- Downloadable resources\n- Lifetime access with updates\n- 30-day money-back guarantee\n\nGet instant access today.`,
    `Introducing **${title}**\n\nWe've distilled the most effective strategies into one actionable package. Each section builds on the last.\n\n**Why choose this:**\n- Proven methodology\n- Practical exercises with solutions\n- Community access for Q&A\n- Regular content updates\n\nJoin thousands who've already transformed their skills.`,
    `**${title}** — The ultimate toolkit for modern creators.\n\n**Inside you'll discover:**\n- Battle-tested frameworks and templates\n- Case studies from successful practitioners\n- Implementation checklists\n- Bonus materials available nowhere else\n\nNo fluff, no theory — just actionable content that delivers results.`,
  ];

  const tags = category ? [category.toLowerCase(), ...(keywords ? keywords.split(",").map((k: string) => k.trim().toLowerCase()) : []), "digital-product", "download"].slice(0, 8).join(", ") : "";

  return ok({
    descriptions, tags, pricing: suggestedPrice[category] || { min: 9, max: 999, recommended: 99 },
    titleSuggestions: [`The Ultimate ${title}`, `${title}: Complete Guide`, `${title} Masterclass`, `Master ${title}`],
    tips: [
      "Products with detailed descriptions sell 3x more",
      "Include specific outcomes and benefits",
      `Optimal price range: ¥${(suggestedPrice[category] || { min: 9 }).min}-¥${(suggestedPrice[category] || { max: 999 }).max}`,
      "Add a money-back guarantee to reduce purchase anxiety",
    ],
  });
});

import { GoogleGenAI, Type } from "@google/genai";

async function getImageInlineData(imageInput?: string): Promise<{ mimeType: string; data: string } | null> {
  if (!imageInput) return null;
  try {
    if (imageInput.startsWith("http://") || imageInput.startsWith("https://")) {
      const response = await fetch(imageInput);
      if (!response.ok) return null;
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = response.headers.get("content-type") || "image/jpeg";
      return {
        mimeType: contentType.split(";")[0],
        data: buffer.toString("base64")
      };
    }
    const mimeType = imageInput.startsWith("data:") ? imageInput.split(";")[0].replace("data:", "") : "image/jpeg";
    const base64Data = imageInput.includes("base64,") ? imageInput.split("base64,")[1] : imageInput;
    if (!base64Data || base64Data.length < 20) return null;
    return { mimeType, data: base64Data };
  } catch (error) {
    console.warn("Unable to process image:", error);
    return null;
  }
}

const CANDIDATE_MODELS = ["gemini-3.5-flash", "gemini-3.5-flash-lite"];

async function generateWithModelFallback(ai: GoogleGenAI, params: any) {
  let lastError: any = null;
  const { model, ...restParams } = params;
  const modelsToTry = model ? [model, ...CANDIDATE_MODELS.filter((item) => item !== model)] : CANDIDATE_MODELS;

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({ ...restParams, model: modelName });
      return { response, modelUsed: modelName };
    } catch (error: any) {
      lastError = error;
      console.warn(`Gemini model ${modelName} failed:`, (error?.message || String(error)).slice(0, 200));
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw lastError;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { imageBase64, customPrompt, presetId } = body || {};

    if (!imageBase64 && !presetId) {
      return res.status(400).json({ success: false, error: "لم يتم إرسال صورة للتحليل." });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return res.status(500).json({ success: false, error: "مفتاح GEMINI_API_KEY غير موجود في البيئة." });
    }

    const ai = new GoogleGenAI({ apiKey });
    let targetImage = imageBase64;
    let targetPrompt = customPrompt || "";

    if (!targetImage && presetId) {
      const presets: Record<string, { url: string; prompt: string }> = {
        shirt: { url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800", prompt: "قميص قطني" },
        plastic: { url: "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=800", prompt: "عبوة بلاستيكية" },
        cardboard: { url: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800", prompt: "صندوق كرتوني" },
        electronics: { url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800", prompt: "جهاز إلكتروني" }
      };
      if (presets[presetId]) {
        targetImage = presets[presetId].url;
        if (!targetPrompt) targetPrompt = presets[presetId].prompt;
      }
    }

    const inlineData = await getImageInlineData(targetImage);
    if (!inlineData) {
      return res.status(400).json({ success: false, error: "تعذر قراءة الصورة. تأكد من صيغة الصورة." });
    }

    const systemInstruction = `
أنت خبير تدقيق وتحليل منتجات واقتصاد دائري استثماري. قم بفحص الصورة المرفقة بدقة متناهية واستخرج البيانات التالية بصيغة JSON حصرية:
1. productName: اسم المنتج الدقيق والمتخصص من واقع الصورة.
2. condition: حالة المنتج الواقعية الحقيقية بدقة.
3. material: الخامات والمواد المصنوع منها المنتج بدقة.
4. circularScore: مؤشر القرار الدائري الاستدامي من 100 بناءً على حالة المنتج الحقيقية.
5. metrics: حساب حقيقي ودقيق للمؤشرات (savedCo2, savedWater, landfillDiverted).
6. breakdown: نسب مئوية واقعية للمسارات المقترحة (reuse, repair, donation, recycling).
7. assessmentText: شرح وتوجيه تفصيلي واحترافي يوضح اسم المنتج ولماذا تم اختيار هذا المسار.
8. recommended_pathways: مسارات عملية مرتبة بحسب الأولوية (rank, badge, title, category, description, points, suitability).

جميع المخرجات باللغة العربية ومطابقة للمخطط بدون إيموجي.
`;

    const userText = targetPrompt
      ? `حلل الصورة المرفقة بصفتك خبير اقتصاد دائري. ملاحظة المستخدم: ${targetPrompt}`
      : `أنت خبير تدقيق وتحليل منتجات واقتصاد دائري استثماري. قم بفحص الصورة المرفقة واستخرج البيانات بصيغة JSON.`;

    const contents: any[] = [{ inlineData }, { text: userText }];

    const { response, modelUsed } = await generateWithModelFallback(ai, {
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productName: { type: Type.STRING },
            condition: { type: Type.STRING },
            material: { type: Type.STRING },
            circularScore: { type: Type.INTEGER },
            scoreLabel: { type: Type.STRING },
            assessmentText: { type: Type.STRING },
            recommended_action: { type: Type.STRING },
            metrics: {
              type: Type.OBJECT,
              properties: {
                savedCo2: { type: Type.STRING },
                savedWater: { type: Type.STRING },
                landfillDiverted: { type: Type.STRING }
              },
              required: ["savedCo2", "savedWater", "landfillDiverted"]
            },
            breakdown: {
              type: Type.OBJECT,
              properties: {
                reuse: { type: Type.INTEGER },
                repair: { type: Type.INTEGER },
                donation: { type: Type.INTEGER },
                recycling: { type: Type.INTEGER }
              },
              required: ["reuse", "repair", "donation", "recycling"]
            },
            recommended_pathways: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  rank: { type: Type.INTEGER },
                  badge: { type: Type.STRING },
                  title: { type: Type.STRING },
                  category: { type: Type.STRING },
                  description: { type: Type.STRING },
                  points: { type: Type.STRING },
                  suitability: { type: Type.STRING }
                },
                required: ["rank", "badge", "title", "category", "description", "points", "suitability"]
              }
            }
          },
          required: ["productName", "condition", "material", "circularScore", "metrics", "breakdown", "assessmentText", "recommended_pathways"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    const itemName = parsedData.productName || parsedData.product || "عنصر مفحوص";
    const pathways = Array.isArray(parsedData.recommended_pathways) ? parsedData.recommended_pathways : [];
    const circularScore = parsedData.circularScore ?? 85;
    const metrics = parsedData.metrics || { savedCo2: "2.5 كجم", savedWater: "600 لتر", landfillDiverted: "0.5 كجم" };
    const breakdown = parsedData.breakdown || { reuse: 80, repair: 60, donation: 70, recycling: 90 };
    const assessmentText = parsedData.assessmentText || "تحليل دقيق للاقتصاد الدائري والتوجيه البيئي.";

    return res.status(200).json({
      success: true,
      data: {
        ...parsedData,
        productName: itemName,
        product: itemName,
        condition: parsedData.condition || "مستعمل بحالة جيدة",
        material: parsedData.material || "مواد قابلة للتدوير",
        circularScore,
        scoreLabel: parsedData.scoreLabel || "تقييم استدامي ممتاز",
        environmentalImpact: assessmentText,
        assessmentText,
        metrics,
        quickStats: metrics,
        breakdown,
        scores: breakdown,
        recommended_action: parsedData.recommended_action || "recycling",
        pathways,
        recommended_pathways: pathways,
        isRealGeminiAnalysis: true,
        modelUsed
      },
      source: `gemini (${modelUsed})`
    });
  } catch (error: any) {
    console.error("Vercel Gemini analyze error:", error);
    return res.status(500).json({
      success: false,
      error: "تعذر إجراء التحليل بواسطة الذكاء الاصطناعي حالياً."
    });
  }
}

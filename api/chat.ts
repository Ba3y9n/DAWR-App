import { GoogleGenAI } from "@google/genai";

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
    const { question, productName } = body || {};
    const rawQ = String(question || "").trim();

    if (!rawQ) {
      return res.status(200).json({
        success: true,
        reply: "اكتبي سؤالك وسأساعدك في اختيار أفضل طريقة لإعادة الاستخدام أو الإصلاح أو التبرع أو التدوير."
      });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const { response } = await generateWithModelFallback(ai, {
          model: "gemini-3.5-flash",
          contents: `سؤال المستخدم:\n${rawQ}\n\nالعنصر:\n${productName || "غير محدد"}`,
          config: {
            systemInstruction: "أنت مساعد دَوْر الذكي في الاقتصاد الدائري. أجب بالعربية. كن واضحاً ومباشراً. لا تستخدم الإيموجي."
          }
        });

        const reply = response.text || "";
        if (reply.trim()) {
          return res.status(200).json({ success: true, reply: reply.trim() });
        }
      } catch (err) {
        console.warn("Vercel Gemini chat warning:", err);
      }
    }

    return res.status(200).json({
      success: true,
      reply: "افصلي المواد المختلفة أولاً، ثم اختاري إعادة الاستخدام أو الإصلاح قبل التدوير متى كان ذلك ممكناً."
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "تعذر تنفيذ المحادثة." });
  }
}

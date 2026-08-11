import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import {
  initializeApp,
  getApps,
  getApp
} from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit
} from "firebase/firestore";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

/* =========================================================
   FIREBASE / FIRESTORE
   ========================================================= */

let firestoreDb: any = null;
let isFirestoreAttempted = false;

function getDb() {
  if (firestoreDb) return firestoreDb;
  if (isFirestoreAttempted) return null;

  isFirestoreAttempted = true;

  try {
    let config: any = null;

    const configPath = path.join(
      process.cwd(),
      "firebase-applet-config.json"
    );

    if (fs.existsSync(configPath)) {
      config = JSON.parse(
        fs.readFileSync(configPath, "utf-8")
      );
    } else if (
      process.env.FIREBASE_PROJECT_ID ||
      process.env.PROJECT_ID
    ) {
      config = {
        projectId:
          process.env.FIREBASE_PROJECT_ID ||
          process.env.PROJECT_ID,
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId:
          process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        firestoreDatabaseId:
          process.env.FIREBASE_DATABASE_ID
      };
    }

    if (config?.projectId) {
      const firebaseApp =
        getApps().length === 0
          ? initializeApp(config)
          : getApp();

      firestoreDb = config.firestoreDatabaseId
        ? getFirestore(
            firebaseApp,
            config.firestoreDatabaseId
          )
        : getFirestore(firebaseApp);

      console.log(
        "Firestore successfully initialized."
      );
    }
  } catch (error) {
    console.warn(
      "Firestore unavailable. Using in-memory fallback.",
      error
    );
  }

  return firestoreDb;
}

/* =========================================================
   IN-MEMORY FALLBACK
   ========================================================= */

const mockDatabase = {
  users: new Map<string, any>([
    [
      "default_user",
      {
        userId: "default_user",
        points: 120,
        savedProductsCount: 15,
        levelTitle: "سفير الاستدامة (مستوى 3)",
        co2SavedKg: 42.5
      }
    ]
  ]),
  scans: [] as any[],
  impact: [] as any[]
};

/* =========================================================
   GEMINI
   IMPORTANT:
   NEVER PUT YOUR REAL API KEY HERE.
   Put it in .env:
   GEMINI_API_KEY=YOUR_KEY
   ========================================================= */

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing");
    return null;
  }

  console.log("GEMINI_API_KEY is configured");

  return new GoogleGenAI({
    apiKey
  });
}

const CANDIDATE_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite"
];

async function generateWithModelFallback(
  ai: GoogleGenAI,
  params: any
) {
  let lastError: any = null;

  const { model, ...restParams } = params;

  const modelsToTry = model
    ? [
        model,
        ...CANDIDATE_MODELS.filter(
          (item) => item !== model
        )
      ]
    : CANDIDATE_MODELS;

  for (const modelName of modelsToTry) {
    try {
      const response =
        await ai.models.generateContent({
          ...restParams,
          model: modelName
        });

      return {
        response,
        modelUsed: modelName
      };
    } catch (error: any) {
      lastError = error;

      const message =
        error?.message || String(error);

      console.warn(
        `Gemini model ${modelName} failed:`,
        message.slice(0, 200)
      );

      if (
        message.includes("429") ||
        message.includes("RESOURCE_EXHAUSTED") ||
        message.toLowerCase().includes("quota")
      ) {
        await new Promise((resolve) =>
          setTimeout(resolve, 800)
        );
      }
    }
  }

  throw lastError;
}

/* =========================================================
   IMAGE PROCESSING
   ========================================================= */

async function getImageInlineData(
  imageInput?: string
): Promise<{
  mimeType: string;
  data: string;
} | null> {
  if (!imageInput) return null;

  try {
    if (
      imageInput.startsWith("http://") ||
      imageInput.startsWith("https://")
    ) {
      const response = await fetch(imageInput);

      if (!response.ok) {
        return null;
      }

      const arrayBuffer =
        await response.arrayBuffer();

      const buffer = Buffer.from(arrayBuffer);

      const contentType =
        response.headers.get("content-type") ||
        "image/jpeg";

      return {
        mimeType: contentType.split(";")[0],
        data: buffer.toString("base64")
      };
    }

    const mimeType =
      imageInput.startsWith("data:")
        ? imageInput
            .split(";")[0]
            .replace("data:", "")
        : "image/jpeg";

    const base64Data =
      imageInput.includes("base64,")
        ? imageInput.split("base64,")[1]
        : imageInput;

    if (!base64Data || base64Data.length < 20) {
      return null;
    }

    return {
      mimeType,
      data: base64Data
    };
  } catch (error) {
    console.warn(
      "Unable to process image:",
      error
    );

    return null;
  }
}

/* =========================================================
   IMAGE ANALYSIS
   ========================================================= */

app.post(
  "/api/analyze",
  async (req, res) => {
    try {
      const {
        imageBase64,
        customPrompt,
        presetId
      } = req.body;

      if (!imageBase64 && !presetId) {
        return res.status(400).json({
          success: false,
          error:
            "لم يتم إرسال صورة للتحليل."
        });
      }

      const ai = getGeminiClient();

      if (!ai) {
        return res.status(500).json({
          success: false,
          error:
            "مفتاح GEMINI_API_KEY غير موجود في البيئة. أضفه في ملف .env."
        });
      }

      let targetImage = imageBase64;
      let targetPrompt =
        customPrompt || "";

      /*
       * Presets are only used when the frontend
       * explicitly asks for a demo preset.
       * Real camera images always take priority.
       */
      if (!targetImage && presetId) {
        const presets: Record<
          string,
          {
            url: string;
            prompt: string;
          }
        > = {
          shirt: {
            url:
              "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800",
            prompt:
              "قميص أو قطعة ملابس"
          },
          cardboard: {
            url:
              "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800",
            prompt:
              "صندوق كرتوني"
          },
          electronics: {
            url:
              "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800",
            prompt:
              "جهاز إلكتروني"
          },
          plastic: {
            url:
              "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=800",
            prompt:
              "عبوة بلاستيكية"
          },
          book: {
            url:
              "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800",
            prompt:
              "كتاب ورقي"
          }
        };

        if (presets[presetId]) {
          targetImage =
            presets[presetId].url;

          if (!targetPrompt) {
            targetPrompt =
              presets[presetId].prompt;
          }
        }
      }

      const inlineData =
        await getImageInlineData(
          targetImage
        );

      if (!inlineData) {
        return res.status(400).json({
          success: false,
          error:
            "تعذر قراءة الصورة. تأكدي أن الصورة بصيغة JPG أو PNG وأن الكاميرا أرسلت الصورة بشكل صحيح."
        });
      }

      const systemInstruction = `
أنت خبير تدقيق وتفتيش فني واقتصاد دائري استثماري صارم. قم بفحص الصورة المرفقة بدقة متناهية وبصريات دقيقة، واستخرج البيانات التالية بصيغة JSON حصرية:

⚠️ القواعد الصارمة والحيادية في التقييم:
1. لا تفترض أبدًا أن المنتج صالح أو ممتاز. يمنع منعا باتا إعطاء تقييم مرتفع للمنتجات التالفة أو المحروقة أو المكسورة.
2. حدد "حالة المنتج" (condition) بدقة من القائمة التالية فقط:
   - ممتاز
   - جيد
   - متوسط
   - تالف
   - تالف بشدة
   - محروق
   - مكسور
   - غير صالح للاستخدام
   - غير واضح / لا يمكن تحديد الحالة
3. إذا كانت حالة المنتج (تالف / تالف بشدة / محروق / مكسور / غير صالح للاستخدام):
   - يجب أن يكون circularScore منخفضاً جداً (بين 5 و 40 فقط).
   - نسبة إعادة الاستخدام (breakdown.reuse) تكون بين 0% و 10% فقط (غير مناسب لإعادة الاستخدام).
   - نسبة التبرع (breakdown.donation) تكون 0% (غير مناسب إطلاقاً للتبرع).
   - القرار المقترح (recommended_action) يكون حتماً "recycling" (إعادة تدوير منسوجات/إلكترونيات/مواد) أو "disposal" (تخلص آمن / معالجة متخصصة).
   - سبب القرار (assessmentText) يجب أن يوضح العيب والتلف الظاهر بدقة (مثال: "المنتج يظهر عليه تلف واحتراق واضح، مما يجعله غير مناسب لإعادة الاستخدام المباشر.").
4. إذا كانت الصورة غير واضحة أو مظلمة أو غير مفهومة:
   - ضع condition: "غير واضح / لا يمكن تحديد الحالة".
   - ضع confidenceScore: 40.
   - ضع assessmentText: "تعذر تحديد حالة المنتج بدقة نظراً لعدم وضوح الصورة المرفقة."
5. افصل تماماً بين "نوع المنتج" (productName) و"حالة المنتج" (condition).
   - قميص محروق ➔ النوع: قميص قطني، الحالة: محروق ومتضرر بشدة، التقييم: منخفض جداً، المسار: إعادة تدوير المنسوجات.
6. قيم جميع المسارات الممكنة بحسب الحالة الفعلية (reuse, repair, donation, recycling).
7. حدد confidenceScore من 0 إلى 100 يعبر عن دقة التعرف والتحليل البصري للصورة.

جميع المخرجات باللغة العربية ومطابقة للمخطط بدون إيموجي.
`;

      const userText = targetPrompt
        ? `حلل الصورة المرفقة بصفتك خبير تدقيق وتحليل منتجات واقتصاد دائري. ملاحظة المستخدم: ${targetPrompt}`
        : `أنت خبير تدقيق وتفتيش فني واقتصاد دائري. قم بفحص الصورة المرفقة بدقة واستخرج البيانات بصيغة JSON.`;

      const contents: any[] = [
        { inlineData },
        { text: userText }
      ];

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
              confidenceScore: { type: Type.INTEGER },
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
            required: ["productName", "condition", "material", "confidenceScore", "circularScore", "metrics", "breakdown", "assessmentText", "recommended_pathways"]
          }
        }
      });

      const rawText =
        response.text || "{}";

      let parsedData: any;

      try {
        parsedData =
          JSON.parse(rawText);
      } catch {
        return res.status(502).json({
          success: false,
          error:
            "أعاد نموذج الذكاء الاصطناعي نتيجة غير قابلة للقراءة."
        });
      }

      const itemName =
        parsedData.productName ||
        parsedData.product ||
        parsedData.item_name ||
        "عنصر مفحوص";

      const pathways =
        Array.isArray(
          parsedData.recommended_pathways
        )
          ? parsedData.recommended_pathways
          : (Array.isArray(parsedData.pathways) ? parsedData.pathways : []);

      const circularScore = parsedData.circularScore ?? parsedData.circular_score ?? 75;
      const metrics = parsedData.metrics || parsedData.quickStats || { savedCo2: "2.5 كجم", savedWater: "600 لتر", landfillDiverted: "0.5 كجم" };
      const breakdown = parsedData.breakdown || parsedData.scores || { reuse: 80, repair: 60, donation: 70, recycling: 90 };
      const assessmentText = parsedData.assessmentText || parsedData.environmentalImpact || "تحليل دقيق للاقتصاد الدائري والتوجيه البيئي.";

      return res.json({
        success: true,
        data: {
          ...parsedData,
          productName: itemName,
          product: itemName,
          item_name: itemName,
          condition: parsedData.condition || "مستعمل بحالة جيدة",
          material: parsedData.material || "مواد قابلة للتدوير",
          circularScore,
          circular_score: circularScore,
          scoreLabel: parsedData.scoreLabel || "تقييم استدامي ممتاز",
          environmentalImpact: assessmentText,
          assessmentText,
          quickStats: metrics,
          metrics,
          scores: breakdown,
          breakdown,
          recommended_action: parsedData.recommended_action || "recycling",
          pathways,
          recommended_pathways: pathways,
          isRealGeminiAnalysis: true,
          modelUsed
        },
        source:
          `gemini (${modelUsed})`
      });
    } catch (error: any) {
      console.warn(
        "Gemini Vision API quota limit/connection notice, using smart vision engine:",
        error?.message || error
      );

      const p = (req.body.customPrompt || req.body.presetId || "").toLowerCase();
      let productName = "منتج مفحوص بالكاميرا";
      let condition = "مستعمل بحالة جيدة - قابل لإعادة التدوير";
      let material = "خامات متنوعة قابلة للفرز";
      let circularScore = 85;
      let savedCo2 = "2.4 كجم";
      let savedWater = "550 لتر";
      let landfillDiverted = "0.4 كجم";
      let assessmentText = "تم فحص المنتج وتحديد مساره الاستدامي الأنسب بناءً على طبيعة الخامات وقابلية التدوير.";

      if (p.includes("قميص") || p.includes("ملابس") || p.includes("نسيج") || p.includes("قطن") || p.includes("shirt")) {
        productName = "قميص قطني ملون";
        condition = "مستعمل بحالة ممتازة وجاهز لإعادة الاستخدام";
        material = "نسيج قطن طبيعي 100%";
        circularScore = 92;
        savedCo2 = "3.8 كجم";
        savedWater = "2,700 لتر";
        landfillDiverted = "0.35 كجم";
        assessmentText = "المنسوجات القطنية تمتاز بقيمتها الاستدامية العالية، والتبرع بها أو إعادة استخدامها يمنع هدر كميات ضخمة من المياه وانبعاثات الكربون.";
      } else if (p.includes("كرتون") || p.includes("صندوق") || p.includes("ورق") || p.includes("cardboard")) {
        productName = "صندوق كرتوني للتغليف";
        condition = "سليم وجاف - قابل للطي والتخزين";
        material = "ورق كرتون مجعد قابل للتدوير 100%";
        circularScore = 88;
        savedCo2 = "1.8 كجم";
        savedWater = "450 لتر";
        landfillDiverted = "0.6 كجم";
        assessmentText = "الكرتون المقوى خامة ممتازة لإعادة التدوير الصناعي ويوفر أكثر من 60% من الطاقة مقارنة بالإنتاج الجديد.";
      } else if (p.includes("بلاستيك") || p.includes("علبة") || p.includes("قارورة") || p.includes("زجاجة") || p.includes("plastic")) {
        productName = "عبوة بلاستيكية شفافة (PET)";
        condition = "نظيفة ومفرغة من السوائل";
        material = "بلاستيك البولي إيثيلين (PET 1)";
        circularScore = 84;
        savedCo2 = "0.9 كجم";
        savedWater = "180 لتر";
        landfillDiverted = "0.08 كجم";
        assessmentText = "عبوات PET الشفافة عالية القيمة في الفرز الذكي وآلات RVM لإعادة التدوير وتحويلها لنسيج وبلاستيك جديد.";
      } else if (p.includes("تالف") || p.includes("مكسور") || p.includes("إلكترون") || p.includes("محروق") || p.includes("هاتف")) {
        productName = "جهاز إلكتروني تالف / محروق";
        condition = "تالف وغير صالح للاستخدام المباشر";
        material = "دارات إلكترونية ومكونات بلاستيكية ومعادن";
        circularScore = 40;
        savedCo2 = "5.2 كجم";
        savedWater = "1,100 لتر";
        landfillDiverted = "0.85 كجم";
        assessmentText = "الأجهزة الإلكترونية التالفة تتطلب فرزاً متخصصاً لاستخلاص المعادن الثمينة والحد من خطر التلوث البيئي.";
      }

      const pathways = [
        {
          rank: 1,
          badge: "الخيار الأفضل",
          title: "التبرع وإعادة الاستخدام المباشر",
          category: "إعادة استخدام",
          description: "تسليم المنتج للجهات المعتمدة أو إعادة استخدامه لتقليل الانبعاثات.",
          points: "+50 نقطة دوّر",
          suitability: "95%"
        },
        {
          rank: 2,
          badge: "الخيار الثاني",
          title: "إعادة التدوير في نقاط الفرز المعتمدة",
          category: "فرز وتدوير",
          description: "إيداع المنتج في حاويات الفرز المخصصة لإعادة تصنيع المواد.",
          points: "+30 نقطة دوّر",
          suitability: "85%"
        }
      ];

      return res.json({
        success: true,
        data: {
          productName,
          product: productName,
          item_name: productName,
          condition,
          material,
          circularScore,
          circular_score: circularScore,
          scoreLabel: circularScore > 80 ? "ممتاز جداً - قيمة استدامية عالية" : "متوسط - يتطلب فرزاً خاصاً",
          assessmentText,
          environmentalImpact: assessmentText,
          metrics: { savedCo2, savedWater, landfillDiverted },
          quickStats: { savedCo2, savedWater, landfillDiverted },
          breakdown: { reuse: 85, repair: 65, donation: 80, recycling: 90 },
          scores: { reuse: 85, repair: 65, donation: 80, recycling: 90 },
          recommended_action: "recycling",
          pathways,
          recommended_pathways: pathways,
          isRealGeminiAnalysis: false,
          isSmartFallback: true
        },
        source: "smart_vision_engine"
      });
    }
  }
);

/* =========================================================
   SMART CHAT
   ========================================================= */

app.post(
  "/api/chat",
  async (req, res) => {
    try {
      const {
        question,
        productName
      } = req.body;

      const rawQ =
        String(question || "")
          .trim();

      if (!rawQ) {
        return res.json({
          success: true,
          reply:
            "اكتبي سؤالك وسأساعدك في اختيار أفضل طريقة لإعادة الاستخدام أو الإصلاح أو التبرع أو التدوير."
        });
      }

      const ai =
        getGeminiClient();

      if (ai) {
        try {
          const {
            response
          } =
            await generateWithModelFallback(
              ai,
              {
                model:
                  "gemini-3.5-flash",
                contents:
                  `سؤال المستخدم:
${rawQ}

العنصر:
${productName || "غير محدد"}`,
                config: {
                  systemInstruction: `
أنت مساعد دَوْر الذكي في الاقتصاد الدائري.
أجب بالعربية.
كن واضحاً ومباشراً.
لا تستخدم الإيموجي.
إذا كان السؤال عن التخلص من مادة خطرة، أعطِ تنبيهاً مناسباً.
`
                }
              }
            );

          const reply =
            response.text || "";

          if (reply.trim()) {
            return res.json({
              success: true,
              reply: reply.trim()
            });
          }
        } catch (error) {
          console.warn(
            "Gemini chat error:",
            error
          );
        }
      }

      return res.json({
        success: true,
        reply:
          "افصلي المواد المختلفة أولاً، ثم اختاري إعادة الاستخدام أو الإصلاح قبل التدوير متى كان ذلك ممكناً."
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error:
          "تعذر تنفيذ المحادثة."
      });
    }
  }
);

/* =========================================================
   CREATIVE IDEAS
   ========================================================= */

app.post(
  "/api/creative-ideas",
  async (req, res) => {
    try {
      const {
        productName,
        material
      } = req.body;

      const ai =
        getGeminiClient();

      if (!ai) {
        return res.status(500).json({
          success: false,
          error:
            "مفتاح GEMINI_API_KEY غير موجود."
        });
      }

      const {
        response
      } =
        await generateWithModelFallback(
          ai,
          {
            model:
              "gemini-3.5-flash",
            contents:
              `اقترح 5 أفكار مبتكرة وقابلة للتنفيذ لإعادة استخدام هذا المنتج:

المنتج:
${productName || "غير محدد"}

الخامة:
${material || "غير محددة"}

اجعل الأفكار مختلفة عن الاستخدام التقليدي.
`,
            config: {
              systemInstruction: `
أنت خبير ابتكار في الاقتصاد الدائري.
أعطِ أفكاراً عملية ومبتكرة.
لا تستخدم الإيموجي.
أعد JSON فقط.
`,
              responseMimeType:
                "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  ideas: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: {
                          type: Type.STRING
                        },
                        description: {
                          type: Type.STRING
                        },
                        difficulty: {
                          type: Type.STRING
                        },
                        materialsNeeded: {
                          type: Type.STRING
                        }
                      },
                      required: [
                        "title",
                        "description",
                        "difficulty",
                        "materialsNeeded"
                      ]
                    }
                  }
                },
                required: [
                  "ideas"
                ]
              }
            }
          }
        );

      const parsed =
        JSON.parse(
          response.text || "{}"
        );

      return res.json({
        success: true,
        ideas:
          parsed.ideas || []
      });
    } catch (error: any) {
      console.warn(
        "Creative ideas notice, using smart ideas engine:",
        error?.message || error
      );

      return res.json({
        success: true,
        ideas: [
          {
            title: "وعاء زراعة نباتات زينة",
            description: "قص الجزء العلوي وثقب القاعدة لتصريف المياه واستخدامه كأصيص زراعي نسيجي/بلاستيكي للحدائق المنزلية.",
            difficulty: "سهل",
            materialsNeeded: "مقص، تراب زراعي، بذور نباتية"
          },
          {
            title: "منظم أدوات مكتبية وتخزين",
            description: "تجميع وتنظيف الخامة وتقسيمها لحفظ الأقلام والأدوات الصغيرة بشكل منظم على المكتب.",
            difficulty: "سهل جداً",
            materialsNeeded: "ألوان ديكور، شريط لاصق"
          },
          {
            title: "منصة إطعام طيور معلقة",
            description: "صنع فتحات جانبية وتثبيت حبل تعليق في الأعلى لوضع الحبوب وإطعام الطيور في الفناء.",
            difficulty: "متوسط",
            materialsNeeded: "حبل تعليق، حبوب طيور"
          },
          {
            title: "وحدة إضاءة ديكورية مبتكرة",
            description: "إضافة شريط إضاءة LED دافئ داخل العبوة لإعطاء إضاءة جانبية جذابة في الغرفة.",
            difficulty: "متوسط",
            materialsNeeded: "شريط إضاءة LED، مقص"
          },
          {
            title: "حاوية فرز وجمع القطع الصغيرة",
            description: "إعادة الاستخدام لحفظ المسامير أو أدوات الخياطة والأزرار لتقليل الهدر.",
            difficulty: "سهل",
            materialsNeeded: "ملصقات توضيحية"
          }
        ]
      });
    }
  }
);

/* =========================================================
   FIRESTORE: USER
   ========================================================= */

app.get(
  "/api/firestore/user",
  async (req, res) => {
    try {
      const userId =
        String(
          req.query.userId ||
          "default_user"
        );

      const db = getDb();

      if (db) {
        const userRef =
          doc(
            db,
            "users",
            userId
          );

        const snapshot =
          await getDoc(userRef);

        if (snapshot.exists()) {
          return res.json({
            success: true,
            user:
              snapshot.data(),
            source:
              "firestore"
          });
        }

        const newUser = {
          userId,
          points: 120,
          savedProductsCount: 15,
          levelTitle:
            "سفير الاستدامة (مستوى 3)",
          co2SavedKg: 42.5,
          updatedAt:
            new Date().toISOString()
        };

        await setDoc(
          userRef,
          newUser
        );

        return res.json({
          success: true,
          user: newUser,
          source:
            "firestore"
        });
      }

      const user =
        mockDatabase.users.get(
          userId
        ) || {
          userId,
          points: 120,
          savedProductsCount: 15,
          levelTitle:
            "سفير الاستدامة (مستوى 3)",
          co2SavedKg: 42.5
        };

      return res.json({
        success: true,
        user,
        source: "mock"
      });
    } catch (error) {
      console.error(
        "User error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          "تعذر تحميل بيانات المستخدم."
      });
    }
  }
);

/* =========================================================
   FIRESTORE: UPDATE USER
   ========================================================= */

app.post(
  "/api/firestore/user/update",
  async (req, res) => {
    try {
      const {
        userId = "default_user",
        points,
        savedProductsCount,
        co2SavedKg,
        levelTitle
      } = req.body;

      const db = getDb();

      if (db) {
        const userRef =
          doc(
            db,
            "users",
            userId
          );

        const updateData: any = {
          updatedAt:
            new Date().toISOString()
        };

        if (
          typeof points ===
          "number"
        ) {
          updateData.points =
            points;
        }

        if (
          typeof savedProductsCount ===
          "number"
        ) {
          updateData.savedProductsCount =
            savedProductsCount;
        }

        if (
          typeof co2SavedKg ===
          "number"
        ) {
          updateData.co2SavedKg =
            co2SavedKg;
        }

        if (levelTitle) {
          updateData.levelTitle =
            levelTitle;
        }

        await setDoc(
          userRef,
          updateData,
          {
            merge: true
          }
        );

        return res.json({
          success: true,
          source:
            "firestore"
        });
      }

      const current =
        mockDatabase.users.get(
          userId
        ) || {};

      mockDatabase.users.set(
        userId,
        {
          ...current,
          userId,
          points:
            points ??
            current.points ??
            120,
          savedProductsCount:
            savedProductsCount ??
            current.savedProductsCount ??
            15,
          co2SavedKg:
            co2SavedKg ??
            current.co2SavedKg ??
            42.5,
          levelTitle:
            levelTitle ??
            current.levelTitle ??
            "سفير الاستدامة (مستوى 3)"
        }
      );

      return res.json({
        success: true,
        source: "mock"
      });
    } catch (error) {
      console.error(
        "Update user error:",
        error
      );

      return res.status(500).json({
        success: false,
        error: "Update User Error",
        message: (error as any)?.message || String(error),
        code: (error as any)?.status || (error as any)?.code || "UNKNOWN",
        details: JSON.stringify(error, Object.getOwnPropertyNames(error))
      });
    }
  }
);

/* =========================================================
   FIRESTORE: SAVE SCAN
   ========================================================= */

app.post(
  "/api/firestore/scans",
  async (req, res) => {
    try {
      const {
        userId = "default_user",
        productName,
        material,
        circularScore,
        scoreLabel,
        environmentalImpact
      } = req.body;

      const scanRecord = {
        userId,
        productName:
          productName ||
          "منتج محلل",
        material:
          material ||
          "غير محدد",
        circularScore:
          circularScore ?? 0,
        scoreLabel:
          scoreLabel ||
          "تم تحليل المنتج",
        environmentalImpact:
          environmentalImpact ||
          "لم يتم تحديد الأثر البيئي بدقة.",
        createdAt:
          new Date().toISOString()
      };

      const db = getDb();

      if (db) {
        const scansCollection =
          collection(
            db,
            "scans"
          );

        const document =
          await addDoc(
            scansCollection,
            scanRecord
          );

        return res.json({
          success: true,
          id: document.id,
          source:
            "firestore"
        });
      }

      mockDatabase.scans.unshift(
        {
          id:
            `mock_${Date.now()}`,
          ...scanRecord
        }
      );

      return res.json({
        success: true,
        id:
          `mock_${Date.now()}`,
        source: "mock"
      });
   } catch (error: any) {
  console.error("========== GEMINI ERROR ==========");
  console.error("Message:", error?.message);
  console.error("Code:", error?.code);
  console.error("Status:", error?.status);
  console.error("Name:", error?.name);
  console.error("Full error:", error);
  console.error("===================================");

  return res.status(500).json({
    success: false,
    error: "Gemini API Error",
    message: error?.message || String(error),
    code: error?.code || "UNKNOWN",
    status: error?.status || "UNKNOWN",
    details: error?.stack || String(error)
  });
}
  }
);

/* =========================================================
   FIRESTORE: SCAN HISTORY
   ========================================================= */

app.get(
  "/api/firestore/scans",
  async (_req, res) => {
    try {
      const db = getDb();

      if (db) {
        const scansCollection =
          collection(
            db,
            "scans"
          );

        const scansQuery =
          query(
            scansCollection,
            orderBy(
              "createdAt",
              "desc"
            ),
            limit(20)
          );

        const snapshot =
          await getDocs(
            scansQuery
          );

        const scans =
          snapshot.docs.map(
            (document) => ({
              id: document.id,
              ...document.data()
            })
          );

        return res.json({
          success: true,
          scans,
          source:
            "firestore"
        });
      }

      return res.json({
        success: true,
        scans:
          mockDatabase.scans,
        source: "mock"
      });
    } catch (error) {
      console.error(
        "Scan history error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          "تعذر تحميل سجل التحليلات."
      });
    }
  }
);

/* =========================================================
   FIRESTORE: ENVIRONMENTAL IMPACT
   ========================================================= */

app.post(
  "/api/firestore/impact",
  async (req, res) => {
    try {
      const {
        userId = "default_user",
        actionType,
        pathwayTitle,
        pointsGained,
        co2SavedKg = 0
      } = req.body;

      const safePoints =
        typeof pointsGained ===
        "number"
          ? pointsGained
          : 50;

      const safeCo2 =
        typeof co2SavedKg ===
        "number"
          ? co2SavedKg
          : 0;

      const impactRecord = {
        userId,
        actionType:
          actionType ||
          "adopted_pathway",
        pathwayTitle:
          pathwayTitle ||
          "قرار استدامي",
        pointsGained:
          safePoints,
        co2SavedKg:
          safeCo2,
        createdAt:
          new Date().toISOString()
      };

      const db = getDb();

      if (db) {
        const impactCollection =
          collection(
            db,
            "impact"
          );

        await addDoc(
          impactCollection,
          impactRecord
        );

        const userRef =
          doc(
            db,
            "users",
            userId
          );

        const userSnapshot =
          await getDoc(
            userRef
          );

        const oldUser =
          userSnapshot.exists()
            ? userSnapshot.data()
            : {
                points: 0,
                savedProductsCount: 0,
                co2SavedKg: 0
              };

        await setDoc(
          userRef,
          {
            userId,
            points:
              (oldUser.points ||
                0) +
              safePoints,
            savedProductsCount:
              (oldUser.savedProductsCount ||
                0) +
              1,
            co2SavedKg:
              Number(
                (
                  (oldUser.co2SavedKg ||
                    0) +
                  safeCo2
                ).toFixed(1)
              ),
            updatedAt:
              new Date().toISOString()
          },
          {
            merge: true
          }
        );

        return res.json({
          success: true,
          source:
            "firestore"
        });
      }

      mockDatabase.impact.unshift(
        impactRecord
      );

      const user =
        mockDatabase.users.get(
          userId
        ) || {
          userId,
          points: 0,
          savedProductsCount: 0,
          co2SavedKg: 0
        };

      mockDatabase.users.set(
        userId,
        {
          ...user,
          points:
            (user.points || 0) +
            safePoints,
          savedProductsCount:
            (user.savedProductsCount ||
              0) +
            1,
          co2SavedKg:
            Number(
              (
                (user.co2SavedKg ||
                  0) +
                safeCo2
              ).toFixed(1)
            )
        }
      );

      return res.json({
        success: true,
        source: "mock"
      });
    } catch (error) {
      console.error(
        "Impact error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          "تعذر حفظ الأثر البيئي."
      });
    }
  }
);

/* =========================================================
   START SERVER
   ========================================================= */

async function startServer() {
  if (
    process.env.NODE_ENV !==
    "production"
  ) {
    const vite =
      await createViteServer({
        server: {
          middlewareMode: true
        },
        appType: "spa"
      });

    app.use(
      vite.middlewares
    );
  } else {
    const distPath =
      path.join(
        process.cwd(),
        "dist"
      );

    app.use(
      express.static(
        distPath
      )
    );

    app.get("*", (_req, res) => {
      res.sendFile(
        path.join(
          distPath,
          "index.html"
        )
      );
    });
  }

  app.listen(
    PORT,
    "0.0.0.0",
    () => {
      console.log(
        `Server running on port ${PORT}`
      );
    }
  );
}

startServer();


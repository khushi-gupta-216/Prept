import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs"
import { createRequire } from "module";
import { askAi } from "../services/openRouter.service.js";
import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";


export const analyzeResume = async (req, res) => {
 let filepath;
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume required" });
    }

    filepath = req.file.path;

    const fileBuffer = await fs.promises.readFile(filepath);
    const unit8Array = new Uint8Array(fileBuffer);
    const pdf = await pdfjsLib.getDocument({ data: unit8Array }).promise;
   
    let  resumeText = "";
    
for(let pageNum =1; pageNum <= pdf.numPages; pageNum++){
      const page = await pdf.getPage(pageNum);
      const Content = await page.getTextContent();
      const pageText = Content.items.map((item) => item.str).join(" ");
      resumeText += pageText + "\n";
    }

    resumeText = resumeText.replace(/\s+/g, " ").trim();

    // ✅ AI Prompt
    const messages = [
      {
        role: "system",
        content: `
Extract structured data from resume.

Rules:
- Return ONLY valid JSON
- No explanation
- Do NOT wrap in markdown

Format:
{
  "role": "string",
  "experience": "string",
  "projects": ["project1", "project2"],
  "skills": ["skill1", "skill2"]
}
        `,
      },
      {
        role: "user",
        content: resumeText,
      },
    ];

    // ✅ Call AI
    const aiResponse = await askAi(messages);

    const parsed = JSON.parse(aiResponse);
    fs.unlinkSync(filepath);
    res.json({
      role: parsed.role || "",
      experience: parsed.experience || "",
      projects: parsed.projects || [],
      skills: parsed.skills || [],
      resumeText,
    });

    
  } catch (error) {
    console.error("❌ Error:", error);

    return res.status(500).json({
     

      message: error.message,
    });

  } finally {
    // ✅ Safe cleanup
    if (filepath && fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  }
};

export const generateQuestion = async (req, res) => {
  try {
    let { role, experience, mode, resumeText, projects, skills } = req.body;

    // Trim inputs
   role = role?.trim();
    experience = experience?.trim();
    mode = mode?.trim();
    const user = await User.findById(req.userId)

    // Validation
    if (!role || !experience || !mode) {
      return res.status(400).json({
        message: "Role, Experience and Mode are required.",
      });
    }

    // Auth check
    if (!req.userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

  

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // Credits check
    const MIN_CREDITS = 50;

    if (user.credits < MIN_CREDITS) {
      return res.status(400).json({
        message: `Not enough credits. Minimum ${MIN_CREDITS} required.`,
      });
    }

    // Format inputs
    const projectText =
      Array.isArray(projects) && projects.length
        ? projects.join(", ")
        : "None";

    const skillsText =
      Array.isArray(skills) && skills.length
        ? skills.join(", ")
        : "None";

    const safeResume = resumeText?.trim() || "None";

    // User prompt
    const userPrompt = `
Role: ${role}
Experience: ${experience}
Interview Mode: ${mode}
Projects: ${projectText}
Skills: ${skillsText}
Resume: ${safeResume}
`;

    if (!userPrompt.trim()) {
      return res.status(400).json({
        message: "Prompt content is empty.",
      });
    }

    // AI messages
    const messages = [
      {
        role: "system",
        content: `
You are a real human interviewer conducting a professional interview.

Speak in simple, natural English as if you are directly talking to the candidate.

Generate exactly 5 interview questions.

Strict Rules:
- Each question must contain between 15 and 25 words.
- Each question must be a single complete sentence.
- Do NOT number them.
- Do NOT add explanations.
- Do NOT add extra text before or after.
- One question per line only.
- Keep language simple and conversational.
- Questions must feel practical and realistic.

Difficulty progression:
Question 1 → easy  
Question 2 → easy  
Question 3 → medium  
Question 4 → medium  
Question 5 → hard  

Make questions based on the candidate's role, experience, interview mode, projects, skills, and resume details.
        `,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ];

    // OpenAI call (make sure openai is configured)
    const aiResponse = await askAi(messages);

    const questionsArray = aiResponse
      .split("\n")
      .map((q) => q.trim())
      .filter((q) => q.length > 0)
      .slice(0, 5);

    if (questionsArray.length === 0) {
      return res.status(500).json({
       

        message: "AI failed to generate questions.",
      });
    }

    user.credits -= 50;
    await user.save();

    const interview = await Interview.create({
      userId: user._id,
      role,
      experience,
      mode,
      resumeText: safeResume,
      questions: questionsArray.map((q, index) => ({
        question: q,
        difficulty: ["easy", "easy", "medium", "medium", "hard"][index],
        timeLimit: [60, 60, 90, 90, 120][index],
      })),
    });

    res.json({
      interviewId: interview._id,
      creditsLeft: user.credits,
      userName: user.name,
      questions: interview.questions,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
     

      message: "Internal server error",
    });
  }
}; 

export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer, timeTaken } = req.body;
    const interview = await Interview.findById(interviewId);

    if (!interview) return res.status(404).json({ message: "Interview not found" });
    if (!interview.questions[questionIndex]) return res.status(400).json({ message: "Invalid question index" });

    const question = interview.questions[questionIndex];

    if (!answer) {
      question.feedback = "No answer provided.";
      question.score = 0;
      question.answer = "";
      await interview.save();
      return res.json({ feedback: question.feedback });
    }

    if (timeTaken > question.timeLimit) {
      question.feedback = "Time limit exceeded. No points awarded.";
      question.score = 0;
      question.answer = answer;
      await interview.save();
      return res.json({ feedback: question.feedback });
    }

    const messages = [
      {
        role: "system",
        content: `
You are a professional human interviewer evaluating a candidate's answer in a real interview.
Evaluate naturally and fairly, like a real person would.
Score 0-10 for:
1. Confidence
2. Communication
3. Correctness
finalScore = average (rounded). Feedback 10-15 words. Return JSON only:
{
  "confidence": number,
  "communication": number,
  "correctness": number,
  "finalScore": number,
  "feedback": "short human feedback"
}
        `
      },
      { role: "user", content: answer }
    ];

    const aiResponse = await askAi(messages);

    let confidence = 0;
    let communication = 0;
    let correctness = 0;
    let finalScore = 0;
    let feedback = "";

    try {
      const parsed = JSON.parse(aiResponse);

      // Coerce to numbers safely
      confidence = Number(parsed.confidence) || 0;
      communication = Number(parsed.communication) || 0;
      correctness = Number(parsed.correctness) || 0;

      // If finalScore missing or invalid, recalc
      finalScore = Number(parsed.finalScore);
      if (!finalScore || finalScore < 0) {
        finalScore = Math.round((confidence + communication + correctness) / 3);
      }

      feedback = parsed.feedback || "";

    } catch (e) {
      console.error("Parsing failed, using raw response:", e);

      feedback = aiResponse;

      // Optional: rough extraction of final score
      const match = aiResponse.match(/(\d+)\/10/);
      finalScore = match ? Number(match[1]) : 0;
    }

    // Save to DB
    question.feedback = feedback;
    question.score = finalScore;
    question.communication = communication;
    question.correctness = correctness;
    question.confidence = confidence;
    question.answer = answer;

    await interview.save();

    return res.status(200).json({ feedback, confidence, communication, correctness, finalScore });
  } catch (error) {
    console.log("BODY:", req.body);
    console.log("ERROR:", error);
    return res.status(500).json({ message: `Failed to submit answer: ${error.message || error}` });
  }
};


export const finishInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;

    // 🔍 Validate input
    if (!interviewId) {
      return res.status(400).json({ message: "Interview ID is required" });
    }

    // 🔎 Find interview
    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // ❌ Prevent duplicate completion
    if (interview.status === "completed") {
      return res.status(400).json({ message: "Interview already completed" });
    }

    // ⚠️ Ensure questions exist
    if (!interview.questions || interview.questions.length === 0) {
      return res.status(400).json({ message: "No questions found in interview" });
    }

    const totalQuestions = interview.questions.length;

    let totalScore = 0;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    // 🧠 Calculate totals safely
    interview.questions.forEach((q) => {
      totalScore += q.score || 0;
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    // 📊 Calculate averages
    const finalScore = totalScore / totalQuestions;
    const avgConfidence = totalConfidence / totalQuestions;
    const avgCommunication = totalCommunication / totalQuestions;
    const avgCorrectness = totalCorrectness / totalQuestions;

    // 💾 Save results
    interview.finalScore = Number(finalScore.toFixed(1));
    interview.status = "Completed"; // ✅ make sure schema allows this

    await interview.save();

    // 📤 Response
    return res.status(200).json({
      success: true,
      finalScore: Number(finalScore.toFixed(1)),
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),

      questionWiseScore: interview.questions.map((q) => ({
        question: q.question,
        score: q.score || 0,
        feedback: q.feedback || "No feedback",
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
      })),
    });

  } catch (error) {
    console.error("❌ FINISH INTERVIEW ERROR:", error);

    return res.status(500).json({
      message: "Failed to finish interview",
      error: error.message, // helpful for debugging
    });
  }
};


export const getMyInterviews = async (req, res) => {
  try {
    const interview = await Interview.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select("role experience mode finalScore status createdAt");

    return res.status(200).json(interview);
  } catch (error) {
    return res.status(500).json({ message: `Failed to find current user interview: ${error}` });
  }
};
export const getInterviewReport = async (req, res) => {
  try {
    const interview = await Interview.findById( req.params.id)
      if(!interview){
       return res.status(404).json({ message: `Interview not found` });
      }

       const totalQuestions = interview.questions.length;

    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    // 🧠 Calculate totals safely
    interview.questions.forEach((q) => {
        totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    // 📊 Calculate averages
     const avgConfidence = totalConfidence / totalQuestions;
    const avgCommunication = totalCommunication / totalQuestions;
    const avgCorrectness = totalCorrectness / totalQuestions;

     return res.json({
      finalScore:interview.finalScore || 0,
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      questionWiseScore: interview.questions,
     });
  } catch (error) {
    return res.status(500).json({ message: `Failed to find current user interview: ${error}` });
  }
};
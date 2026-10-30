import { GoogleGenAI } from '@google/genai';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

let genAI = null;
if (config.gemini.apiKey && !config.gemini.apiKey.includes('YOUR_GEMINI')) {
  try {
    genAI = new GoogleGenAI({ apiKey: config.gemini.apiKey });
    logger.info('[Gemini AI] Initialized Google GenAI SDK successfully.');
  } catch (err) {
    logger.warn('[Gemini AI] Failed to initialize Google GenAI SDK:', err.message);
  }
}

/**
 * Intelligent Rule-Based Fallback for Complaint Analysis
 */
export const ruleBasedComplaintAnalysis = (title, description, categoryHint = '') => {
  const text = `${title} ${description} ${categoryHint}`.toLowerCase();

  // 1. Determine Category
  let category = categoryHint || 'Other';
  if (/electric|wire|socket|switch|fan|light|power|shock|spark|mcb|plug|fuse|bulb/.test(text)) {
    category = 'Electrical';
  } else if (/tap|pipe|drain|leak|sink|flush|clog|faucet|sewage/.test(text)) {
    category = 'Plumbing';
  } else if (/water|tank|geyser|cooler|no water|drinking/.test(text)) {
    category = 'Water Supply';
  } else if (/bathroom|toilet|commode|shower|exhaust/.test(text)) {
    category = 'Bathroom Maintenance';
  } else if (/wifi|wi-fi|router|internet|lan|network|bandwidth|ping/.test(text)) {
    category = 'Internet / Wi-Fi';
  } else if (/bed|chair|table|cupboard|almirah|desk|drawer|furniture|cot/.test(text)) {
    category = 'Furniture';
  } else if (/clean|dust|garbage|dirty|smell|trash|sweep|mop/.test(text)) {
    category = 'Cleaning';
  } else if (/door|lock|key|window|curtain|hinge|wall|paint/.test(text)) {
    category = 'Room Maintenance';
  } else if (/cctv|fire|safety|balcony|railing|stair|lift|elevator/.test(text)) {
    category = 'Safety and Infrastructure';
  }

  // 2. Determine Priority
  let priority = 'Medium';
  let urgencyFlags = [];

  if (/shock|fire|spark|smoke|flood|burst|gas|danger|emergency|hazard|electrocute/.test(text)) {
    priority = 'Urgent';
    urgencyFlags.push('Safety Hazard Detected');
  } else if (/blackout|no water|broken lock|cannot enter|overflow|shattered|stinking/.test(text)) {
    priority = 'High';
    urgencyFlags.push('Essential Amenity Disrupted');
  } else if (/dust|paint|cleaning|handle loose|squeak|minor|faint/.test(text)) {
    priority = 'Low';
  } else {
    priority = 'Medium';
  }

  // 3. Recommended Specialization
  const specializationMap = {
    'Electrical': 'Electrician',
    'Plumbing': 'Plumber',
    'Water Supply': 'Plumber',
    'Bathroom Maintenance': 'Plumber / Sanitation',
    'Internet / Wi-Fi': 'Network / IT Specialist',
    'Furniture': 'Carpenter',
    'Cleaning': 'Housekeeping Staff',
    'Room Maintenance': 'General Maintenance / Carpenter',
    'Safety and Infrastructure': 'Facility Security & Safety Officer',
    'Other': 'General Maintenance',
  };
  const suggestedSpecialization = specializationMap[category] || 'General Maintenance';

  // 4. Concise Summary
  const summary = description.length > 90
    ? `${title.trim()}: ${description.slice(0, 85).trim()}...`
    : `${title.trim()} - ${description.trim()}`;

  return {
    category_suggested: category,
    priority_suggested: priority,
    suggested_specialization: suggestedSpecialization,
    summary,
    urgency_flags: urgencyFlags,
    confidence: 0.85,
    source: 'rule-based-engine',
  };
};

/**
 * AI Complaint Analysis using Gemini (with automatic rule-based fallback)
 */
export const analyzeComplaint = async (title, description, userCategory = '') => {
  if (!genAI) {
    return ruleBasedComplaintAnalysis(title, description, userCategory);
  }

  try {
    const prompt = `
You are the AI Chief Maintenance Officer for a modern university hostel.
Analyze the following student complaint and return a strictly valid JSON object.

Complaint Title: "${title}"
Complaint Description: "${description}"
User Selected Category: "${userCategory}"

Valid Categories:
- Electrical
- Plumbing
- Water Supply
- Bathroom Maintenance
- Internet / Wi-Fi
- Furniture
- Cleaning
- Room Maintenance
- Safety and Infrastructure
- Other

Valid Priorities:
- Low (cosmetic or minor inconvenience, e.g., paint peeling, loose drawer handle)
- Medium (functional issue but not hazardous, e.g., slow fan, single flickering light, slow wifi)
- High (major amenity loss, e.g., room door lock broken, water supply stopped, total room darkness)
- Urgent (immediate safety hazard or severe risk, e.g., spark, burning smell, live wire, water flooding, fire risk)

Technician Specializations:
- Electrician
- Plumber
- Network / IT Specialist
- Carpenter
- Housekeeping Staff
- Facility Maintenance

Response must be pure JSON with NO markdown code fences or backticks. Format:
{
  "category_suggested": "string",
  "priority_suggested": "Low" | "Medium" | "High" | "Urgent",
  "suggested_specialization": "string",
  "summary": "1 sentence concise executive summary under 20 words",
  "urgency_flags": ["flag1", "flag2"],
  "confidence": 0.95
}
`;

    const response = await genAI.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const responseText = response.text ? response.text.trim() : '';
    const cleanJson = responseText.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(cleanJson);

    return {
      category_suggested: parsed.category_suggested || userCategory || 'Other',
      priority_suggested: parsed.priority_suggested || 'Medium',
      suggested_specialization: parsed.suggested_specialization || 'General Maintenance',
      summary: parsed.summary || `${title}: ${description.slice(0, 80)}...`,
      urgency_flags: parsed.urgency_flags || [],
      confidence: parsed.confidence || 0.9,
      source: 'gemini-ai',
    };
  } catch (err) {
    logger.warn('[Gemini AI] API call failed, falling back to rule-based analysis:', err.message);
    return ruleBasedComplaintAnalysis(title, description, userCategory);
  }
};

/**
 * Duplicate Complaint Detection
 * Checks existing complaints in the same room/block for identical or highly similar issues.
 */
export const checkDuplicateComplaint = (newComplaint, existingComplaints) => {
  const matches = [];
  const newKeywords = `${newComplaint.title} ${newComplaint.description}`.toLowerCase().match(/\b\w{4,}\b/g) || [];

  for (const item of existingComplaints) {
    if (['Resolved', 'Verified/Closed'].includes(item.status)) continue;

    // Check same room or same block
    const isSameRoom = newComplaint.roomId && item.room_id && newComplaint.roomId === item.room_id;
    const isSameCategory = newComplaint.category && item.category && newComplaint.category === item.category;

    if (isSameRoom || isSameCategory) {
      const itemKeywords = `${item.title} ${item.description}`.toLowerCase().match(/\b\w{4,}\b/g) || [];
      const intersection = newKeywords.filter((w) => itemKeywords.includes(w));
      const score = intersection.length / Math.max(newKeywords.length, 1);

      if ((isSameRoom && isSameCategory) || score > 0.4) {
        matches.push({
          complaint_id: item.id,
          complaint_code: item.complaint_code,
          title: item.title,
          status: item.status,
          similarity_score: Math.min(Math.round(score * 100), 98),
          reason: isSameRoom
            ? `Active complaint already logged for Room with same category (${item.category}).`
            : `Similar complaint found with matching description keywords.`,
        });
      }
    }
  }

  return {
    is_potential_duplicate: matches.length > 0,
    matches,
  };
};

/**
 * AI Maintenance Assistant for Warden / Admins
 * Answers inquiries using actual database statistics and live context.
 */
export const askMaintenanceAssistant = async (question, liveContext) => {
  if (!genAI) {
    // Intelligent rule-based conversational assistant fallback
    const q = question.toLowerCase();
    const { totalComplaints = 0, pending = 0, inProgress = 0, resolved = 0, escalated = 0, topCategories = [], blockDistribution = {} } = liveContext;

    if (q.includes('overdue') || q.includes('escalat')) {
      return `Currently, there are **${escalated} escalated/overdue complaints** requiring urgent warden attention. The primary bottlenecks are in ${topCategories[0]?.category || 'Electrical'} maintenance. I recommend checking the Escalated tab immediately.`;
    }
    if (q.includes('block') || q.includes('hostel')) {
      const highestBlock = Object.entries(blockDistribution).sort((a, b) => b[1] - a[1])[0];
      return `Based on live records, Block **${highestBlock ? highestBlock[0] : 'A'}** has logged the highest complaint volume (${highestBlock ? highestBlock[1] : 0} complaints). Recommended action: Conduct a preventive inspection on this block's infrastructure.`;
    }
    if (q.includes('summary') || q.includes('status') || q.includes('overview') || q.includes('trend')) {
      return `Here is your current HostelCare snapshot:
- **Total Registered**: ${totalComplaints}
- **Pending/Unassigned**: ${pending}
- **In Progress**: ${inProgress}
- **Resolved**: ${resolved}
- **Escalated/Urgent**: ${escalated}
Top complaint driver is **${topCategories[0]?.category || 'Plumbing'}** with ${topCategories[0]?.count || 0} tickets. Technician allocation should prioritize this area.`;
    }

    return `HostelCare Assistant: We currently have ${totalComplaints} total complaints (${pending} pending, ${inProgress} in progress, ${resolved} resolved). The leading category is ${topCategories[0]?.category || 'Electrical'}. Let me know if you would like block-specific insights or technician workload recommendations!`;
  }

  try {
    const prompt = `
You are the AI Maintenance Director of HostelCare, an intelligent complaint management system for college hostels.
Answer the warden's question clearly, professionally, and concisely using the provided live database metrics.
Highlight key numbers in bold and give practical, proactive maintenance recommendations.

LIVE DATABASE CONTEXT:
${JSON.stringify(liveContext, null, 2)}

WARDEN'S QUESTION:
"${question}"

Provide a structured, helpful markdown response.
`;

    const response = await genAI.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return response.text || 'Unable to generate response at this time.';
  } catch (err) {
    logger.warn('[Gemini AI] Assistant query failed, fallback used:', err.message);
    return `HostelCare Maintenance Report: We are tracking ${liveContext.totalComplaints || 0} total tickets. ${liveContext.escalated || 0} tickets are escalated and ${liveContext.pending || 0} await technician assignment. Proactive inspection in Block ${Object.keys(liveContext.blockDistribution || {})[0] || 'A'} is recommended.`;
  }
};


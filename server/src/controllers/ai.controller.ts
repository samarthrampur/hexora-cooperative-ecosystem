import { Response } from 'express';
import prisma from '../prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

export const handleAIChat = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { prompt, workspace, context } = req.body;
    const userId = req.user?.id;
    const apiKey = process.env.GEMINI_API_KEY;

    let responseText = '';
    let mode: 'LIVE_GEMINI' | 'INTELLIGENT_DEMO' = 'INTELLIGENT_DEMO';

    if (apiKey && apiKey.trim().length > 0) {
      try {
        // Direct call to Gemini REST API
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are the HEXORA Ecosystem Intelligence Agent for the ${workspace || 'LMS'} workspace. 
Context: ${JSON.stringify(context || {})}
User query: ${prompt}`,
                    },
                  ],
                },
              ],
            }),
          }
        );

        const geminiData = await geminiRes.json();
        if (geminiData.candidates && geminiData.candidates[0]?.content?.parts[0]?.text) {
          responseText = geminiData.candidates[0].content.parts[0].text;
          mode = 'LIVE_GEMINI';
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, falling back to Intelligent Demo Engine:', geminiErr);
      }
    }

    if (!responseText) {
      // Deterministic Intelligent Demo Mode tailored to workspace context
      mode = 'INTELLIGENT_DEMO';
      const p = prompt.toLowerCase();

      if (workspace === 'LMS') {
        if (p.includes('course') || p.includes('recommend') || p.includes('learn')) {
          responseText = `Based on your capacity building profile, I recommend prioritizing:
1. **Financial Management for Cooperatives**: Master double-entry bookkeeping, audit compliance, and microfinance operations.
2. **Modern Sustainable Agritech**: Learn sensor-based irrigation and collective crop planning.
3. **Cooperative Governance & Bylaws**: Essential for statutory board compliance and AGM documentation.

Completing these will automatically earn you verified skill credentials that boost your match score in the Employment Ecosystem!`;
        } else if (p.includes('audit') || p.includes('finance')) {
          responseText = `In cooperative societies, statutory audits are governed by Section 17 of the Cooperative Societies Act. Key records you must maintain are:
- Day Book and General Ledger
- Member Share Register
- Loan Disbursement and Repayment Schedule
- Annual Profit & Loss Balance Sheet approved by the General Body.`;
        } else {
          responseText = `Hello! I am your HEXORA Learning Assistant. I can help clarify concepts from your current lessons, explain cooperative governance laws, recommend courses to close skill gaps, or test your readiness for the upcoming assessment. What would you like to explore?`;
        }
      } else if (workspace === 'ERP') {
        if (p.includes('meeting') || p.includes('quorum') || p.includes('agm')) {
          responseText = `To conduct a legally binding Cooperative Annual General Meeting (AGM):
- Notice must be issued at least 14 days in advance with the proposed agenda.
- The minimum quorum required is 1/5th of total registered active members.
- Decisions on dividend distributions and committee elections must be minuted with voting ratios and digitally archived in the Documents module.`;
        } else if (p.includes('attendance') || p.includes('hardware') || p.includes('biometric')) {
          responseText = `HEXORA supports automated attendance tracking via IoT biometric devices. 
Device synchronization happens through our secure API endpoint \`/api/hardware/attendance-sync\`. Fingerprint or RFID logs automatically register member check-in times and reflect in daily attendance reports.`;
        } else {
          responseText = `Welcome to the Cooperative ERP Intelligence Desk. I can assist you with optimizing department workflows, generating financial summary insights, auditing attendance trends, and preparing standardized meeting agendas. How may I assist your organization today?`;
        }
      } else {
        // Employment workspace
        if (p.includes('resume') || p.includes('cv') || p.includes('profile')) {
          responseText = `Here are 3 high-impact recommendations to elevate your job profile:
1. **Highlight Verified Skills**: Courses you completed in the LMS carry a "Verified by HEXORA" badge—feature these prominently.
2. **Quantify Operational Impact**: Instead of "managed cooperative stock", write "Managed inventory for 250+ member agricultural cooperative with zero discrepancy".
3. **Align with Active Job Listings**: Ensure keywords match current openings in Cooperative Accounting and Agritech Management.`;
        } else if (p.includes('match') || p.includes('job') || p.includes('gap')) {
          responseText = `Our AI match algorithm compares your registered skills and certified course completions against employer job requirements. 
When you have a skill gap, the system directly maps the missing competency to an actionable LMS course so you can upskill and immediately increase your match percentage!`;
        } else {
          responseText = `Welcome to the HEXORA Career Intelligence Assistant. I am here to help you discover relevant cooperative and agritech openings, optimize your resume for employer ATS filters, and analyze skill gaps. What career goals are you pursuing?`;
        }
      }
    }

    // Record interaction in database
    if (userId) {
      await prisma.aIInteraction.create({
        data: {
          userId,
          workspace: workspace || 'LMS',
          feature: 'CHATBOT',
          prompt,
          response: responseText,
        },
      });
    }

    res.json({
      response: responseText,
      mode,
      timestamp: new Date(),
    });
  } catch (error: any) {
    console.error('AIChat Error:', error);
    res.status(500).json({ error: 'Failed to process AI query.' });
  }
};

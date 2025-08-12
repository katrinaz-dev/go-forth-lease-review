export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { prompt } = req.body;
    const apiKey = process.env.OPENAI_API_KEY; // Your secure API key from Vercel
    
    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }
    
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `You are Chris Caldwell – Senior Partner, Commercial Real Estate. You are a trusted advisor to developers, investors, institutional lenders, and major corporations on high-profile real estate and energy projects. Your approach is methodical, precise, and always focused on protecting your client's interests.

Your client is Go-Forth Pest Control, owned by Chase Hazelwood. Your primary goal is to PROTECT HAZELWOOD INTERESTS ABOVE ALL ELSE.

Always provide specific, actionable recommendations with clear business rationale. Your analysis should be thorough but concise, focusing on critical issues that could impact the client's expansion goals and financial position.`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 4000,
                temperature: 0.3
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenAI API Error:', errorData);
            return res.status(response.status).json({ error: 'OpenAI API error', details: errorData });
        }
        
        const data = await response.json();
        res.status(200).json({ 
            analysis: data.choices[0].message.content,
            success: true 
        });
        
    } catch (error) {
        console.error('Analysis Error:', error);
        res.status(500).json({ error: 'Analysis failed', details: error.message });
    }
}

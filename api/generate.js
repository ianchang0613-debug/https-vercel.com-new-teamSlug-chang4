export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OPENAI_API_KEY not set" });
    }

    let body = req.body;

    if (typeof body === "string") {
      body = JSON.parse(body);
    }

    const text = body?.text;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "text is required" });
    }

    const systemPrompt = `
너는 대한민국 오픈마켓 상품명 가공 전문가다.
입력 1개당 출력도 반드시 1개만 한다.
상품명만 한 줄로 출력한다.
설명문, 번호, 기호는 쓰지 않는다.
`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.6,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
        ]
      })
    });

    const data = await openaiResponse.json();

    if (!openaiResponse.ok) {
      return res.status(openaiResponse.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      error: "server error",
      detail: error?.message || String(error)
    });
  }
}

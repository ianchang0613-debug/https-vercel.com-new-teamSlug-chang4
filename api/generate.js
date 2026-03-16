export default async function handler(req, res) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "OPENAI_API_KEY not set" });
    }

    const { text } = req.body || {};

    if (!text) {
      return res.status(400).json({ error: "text is required" });
    }

    const systemPrompt = `
const systemPrompt = `
너는 대한민국 오픈마켓 상품명 가공 전문가다.

규칙
- 상품명만 한 줄로 출력
- 설명문 금지
- 입력 1개당 출력 1개
- 50바이트 이상 65바이트 이하
- 같은 단어 3번 이상 금지
- 타겟 키워드 포함
- 사용 상황 키워드 포함
- 단일 상품일 경우 1EA, 1ea, 1P, 1p, 1개, 한개, 단품, 낱개 금지
- 금지어 포함 금지
- 조건이 맞지 않으면 삭제하지 말고 다시 작성
`;
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: text
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      error: "server error",
      detail: String(error)
    });
  }
}

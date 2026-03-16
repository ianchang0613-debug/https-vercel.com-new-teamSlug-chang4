export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "OPENAI_API_KEY not set" });
    }

    const { text } = req.body || {};

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "text is required" });
    }

    const systemPrompt = `
너는 대한민국 오픈마켓 상품명 가공 전문가다.

역할
- 원상품명과 이미지 링크를 참고해 검색형 상품명을 만든다.
- 상품명만 출력하고 설명은 하지 않는다.

반드시 지킬 규칙
- 입력 1개당 출력도 반드시 1개만 한다.
- 상품명만 한 줄로 출력한다.
- 설명문, 번호, 기호, 안내문을 쓰지 않는다.
- 타겟 키워드를 포함한다.
- 사용 상황 키워드를 포함한다.
- 핵심 키워드는 앞쪽에 배치한다.
- 원상품명과 동일하거나 지나치게 유사한 표현은 피한다.
- 같은 단어는 최대 2번까지만 허용한다.
- 같은 단어가 3번 이상 반복되면 다시 작성한다.
- 상품명은 엑셀 LENB 기준 50바이트 이상 65바이트 이하로 작성한다.
- 50바이트 미만 또는 65바이트 초과면 다시 작성한다.
- 조건을 만족하지 못한 상품명은 삭제하지 말고 다시 작성한다.
- 최종 결과 1개를 반드시 출력한다.

단일 수량 금지
- 단일 상품일 경우 1EA, 1ea, 1P, 1p, 1개, 한개, 단품, 낱개를 절대 포함하지 않는다.
- 위 표현이 들어가면 오답이며 제거 후 다시 작성한다.

금지 규칙
- 브랜드명, 제조사명, 모델명 금지
- 추천, 인기, 특가, 최고, 최대, 최초 같은 광고 표현 금지
- 특수문자 금지
- 의료 효능 오인 표현 금지
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.6,
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

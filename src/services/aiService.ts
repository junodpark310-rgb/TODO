export interface AiOrganizeResult {
  readonly organizedContent: string
  readonly extractedTasks: readonly string[]
}

export async function organizeNoteWithAi(
  apiKey: string,
  noteContent: string
): Promise<AiOrganizeResult> {
  if (!apiKey.trim()) {
    throw new Error('API 키가 설정되지 않았습니다. 설정에서 OpenAI API 키를 입력하세요.')
  }
  if (!noteContent.trim()) {
    throw new Error('메모 내용이 비어있습니다.')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: `당신은 메모 정리 전문가입니다. 사용자의 메모를 분석하여:
1. 메모 내용을 깔끔하게 정리 (핵심 포인트, 카테고리별 분류)
2. 실행 가능한 태스크(할 일) 항목 추출

반드시 아래 JSON 형식으로만 응답하세요:
{
  "organizedContent": "정리된 메모 내용 (마크다운 없이 일반 텍스트, 줄바꿈으로 구분)",
  "extractedTasks": ["태스크1", "태스크2", ...]
}

태스크가 없으면 extractedTasks를 빈 배열로 반환하세요.`,
        },
        {
          role: 'user',
          content: noteContent,
        },
      ],
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    if (response.status === 401) {
      throw new Error('API 키가 유효하지 않습니다. 설정에서 확인해주세요.')
    }
    throw new Error(`AI 요청 실패 (${response.status}): ${errorBody}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('AI 응답이 비어있습니다.')
  }

  try {
    const parsed = JSON.parse(content)
    return {
      organizedContent: parsed.organizedContent ?? noteContent,
      extractedTasks: Array.isArray(parsed.extractedTasks) ? parsed.extractedTasks : [],
    }
  } catch {
    throw new Error('AI 응답을 파싱할 수 없습니다.')
  }
}

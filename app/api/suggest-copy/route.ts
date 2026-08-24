import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

/**
 * 규칙 기반 제안(suggestInitial)이 채우지 못하는 TEXT 필드에만 쓰는 보조 카피 제안.
 *
 * 브랜드/메인 카피를 그대로 복사해도 되는 필드(타이틀 등)는 이미 클라이언트에서
 * 공짜로 채워진다. 여기 오는 건 CTA·서브 설명처럼 문맥에 맞는 새 문구가 필요한,
 * 규칙으로는 답이 안 나오는 경우다. 짧은 생성 작업이라 Sonnet 5 + low effort 로 충분하다.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: {
    brand?: string;
    mainCopy?: string;
    ctaText?: string;
    mediaName?: string;
    productName?: string;
    areaName?: string;
    specLabel?: string;
    maxChars?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
  }

  const { brand, mainCopy, ctaText, mediaName, productName, areaName, specLabel, maxChars } = body;
  if (!areaName) {
    return NextResponse.json({ error: '입력 항목 정보가 없습니다.' }, { status: 400 });
  }

  // SDK 는 키가 없으면 네트워크 요청 전 헤더 구성 단계에서 평범한 Error 를 던진다
  // (AuthenticationError 가 아니다 — 그건 실제로 401 응답을 받았을 때만 생긴다).
  // 배포 환경에 키를 아직 안 넣은 상태가 흔히 있을 상황이라 미리 걸러서 명확히 안내한다.
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'AI 제안을 쓰려면 서버에 ANTHROPIC_API_KEY 환경변수가 설정되어 있어야 합니다.' },
      { status: 503 }
    );
  }

  try {
    const client = new Anthropic();

    const limitLine = maxChars
      ? `반드시 공백 포함 ${maxChars}자 이내로 작성하세요. 절대 초과하지 마세요.`
      : '간결하게 한두 문장으로 작성하세요.';

    const response = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 1024,
      output_config: { effort: 'low' },
      system:
        '당신은 디지털 광고 카피라이터입니다. 주어진 브랜드·캠페인 정보와 매체 규격에 맞춰 ' +
        '광고 소재에 들어갈 문구를 하나만 제안하세요. 채울 항목이 CTA·행동 유도 버튼처럼 ' +
        '클릭을 유도하는 문구이고 "캠페인 CTA 문구"가 주어졌다면, 새로 만들지 말고 그 문구를 ' +
        '그대로 쓰거나 글자수 제한에 맞게 다듬어서만 쓰세요. 따옴표, 설명, 접두어 없이 문구 ' +
        `본문만 출력하세요. ${limitLine}`,
      messages: [
        {
          role: 'user',
          content: [
            brand ? `브랜드: ${brand}` : '',
            mainCopy ? `캠페인 메인 카피: ${mainCopy}` : '',
            ctaText ? `캠페인 CTA 문구(가능하면 이걸 그대로/다듬어서 쓰세요): ${ctaText}` : '',
            mediaName || productName ? `매체: ${[mediaName, productName].filter(Boolean).join(' / ')}` : '',
            `채울 항목: ${areaName}`,
            specLabel ? `항목 규격/제약: ${specLabel}` : '',
          ]
            .filter(Boolean)
            .join('\n'),
        },
      ],
    });

    const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text');
    const raw = textBlock?.text?.trim() ?? '';
    const suggestion = raw.replace(/^["'“”]+|["'“”]+$/g, '').trim();

    if (!suggestion) {
      return NextResponse.json({ error: 'AI가 문구를 만들지 못했습니다. 다시 시도해 주세요.' }, { status: 502 });
    }

    return NextResponse.json({
      suggestion,
      withinLimit: !maxChars || suggestion.length <= maxChars,
    });
  } catch (err) {
    console.error('AI 문구 제안 오류:', err);
    let message = 'AI 문구 제안 중 오류가 발생했습니다.';
    if (err instanceof Anthropic.AuthenticationError) {
      message = 'AI 제안을 쓰려면 서버에 ANTHROPIC_API_KEY 가 설정되어 있어야 합니다.';
    } else if (err instanceof Anthropic.RateLimitError) {
      message = '요청이 많아 잠시 후 다시 시도해 주세요.';
    } else if (err instanceof Anthropic.APIError) {
      message = `AI 제안 요청이 실패했습니다 (${err.status}).`;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

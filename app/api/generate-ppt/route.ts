import { NextRequest, NextResponse } from 'next/server';
import { generateGuidePpt } from '@/lib/ppt-generator';
import type { AssetRef, CampaignMeta, WorkItem } from '@/lib/campaign';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { meta, items, fixedAssetOverrides } = body as {
      meta: CampaignMeta;
      items: WorkItem[];
      fixedAssetOverrides?: Record<string, AssetRef>;
    };

    if (!items?.length) {
      return NextResponse.json({ error: '작업 항목이 없습니다.' }, { status: 400 });
    }

    const pptBuffer = await generateGuidePpt(meta, items, fixedAssetOverrides);
    const base64 = pptBuffer.toString('base64');

    return NextResponse.json({ pptBase64: base64 });
  } catch (err) {
    console.error('PPT generation error:', err);
    return NextResponse.json({ error: 'PPT 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

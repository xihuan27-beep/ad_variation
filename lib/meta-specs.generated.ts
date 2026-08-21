/**
 * 이 파일은 자동 생성됩니다. 직접 고치지 마세요.
 *
 * 원천: Meta 광고 가이드 PDF → data/meta-specs.json
 * 재생성: node tools/meta-extract.mjs <pdf...> > data/meta-specs.json
 *         node tools/build-meta-specs.mjs
 *
 * 게재위치 19건.
 */

import type { MediaProduct } from './spec-data';

export const META_PLACEMENT_PRODUCTS: MediaProduct[] = [
      {
        name: "인지도 — 슬라이드 (Audience Network 네이티브)",
        aliases: ["Audience Network 네이티브","Audience Network Native","Audience Network 네이티브 슬라이드","Audience Network Native 슬라이드"],
        areas: [
        { displayOrder: 1, areaName: "카드 이미지", areaType: "IMAGE", widthPx: 1080, heightPx: 1080, ratio: "1:1", maxFileSizeKb: 30720, formats: ["JPG","PNG"], specLabel: "1080 × 1080 px 이상 / 1:1 / 최대 30MB / JPG, PNG", isUserInput: false },
        { displayOrder: 2, areaName: "카드 동영상", areaType: "VIDEO", widthPx: 1080, heightPx: 1080, ratio: "1:1", maxDurationSec: 240, maxFileSizeKb: 4194304, formats: ["MP4","MOV","GIF"], specLabel: "1080 × 1080 px 이상 / 1:1 / 최대 4분 / 최대 4GB / MP4, MOV, GIF", isUserInput: false },
        { displayOrder: 3, areaName: "슬라이드 수", areaType: "TEXT", specLabel: "2~10개", isUserInput: true },
        { displayOrder: 4, areaName: "기본 문구", areaType: "TEXT", maxChars: 125, specLabel: "125자 권장", isUserInput: true },
        { displayOrder: 5, areaName: "제목", areaType: "TEXT", maxChars: 40, specLabel: "40자 권장", isUserInput: true },
        { displayOrder: 6, areaName: "설명", areaType: "TEXT", maxChars: 20, specLabel: "20자 권장", isUserInput: true },
        { displayOrder: 7, areaName: "랜딩 URL", areaType: "URL", specLabel: "필수", isUserInput: true },
        ],
      },
      {
        name: "인지도 — 슬라이드 (Audience Network 보상형 동영상)",
        aliases: ["Audience Network 보상형 동영상","Audience Network Rewarded Video","Audience Network 보상형 동영상 슬라이드","Audience Network Rewarded Video 슬라이드"],
        areas: [
        { displayOrder: 1, areaName: "카드 이미지", areaType: "IMAGE", widthPx: 1080, heightPx: 1080, ratio: "1:1", maxFileSizeKb: 30720, formats: ["JPG","PNG"], specLabel: "1080 × 1080 px 이상 / 1:1 / 최대 30MB / JPG, PNG", notes: "화면 비율 허용 범위 3%", isUserInput: false },
        { displayOrder: 2, areaName: "카드 동영상", areaType: "VIDEO", widthPx: 1080, heightPx: 1080, ratio: "1:1", maxDurationSec: 14400, maxFileSizeKb: 4194304, formats: ["MP4","MOV","GIF"], specLabel: "1080 × 1080 px 이상 / 1:1 / 최대 240분 / 최대 4GB / MP4, MOV, GIF", isUserInput: false },
        { displayOrder: 3, areaName: "슬라이드 수", areaType: "TEXT", specLabel: "2~10개", isUserInput: true },
        { displayOrder: 4, areaName: "기본 문구", areaType: "TEXT", maxChars: 80, specLabel: "80자 권장", isUserInput: true },
        { displayOrder: 5, areaName: "제목", areaType: "TEXT", maxChars: 20, specLabel: "20자 권장", isUserInput: true },
        { displayOrder: 6, areaName: "설명", areaType: "TEXT", maxChars: 18, specLabel: "18자 권장", isUserInput: true },
        { displayOrder: 7, areaName: "랜딩 URL", areaType: "URL", specLabel: "필수", isUserInput: true },
        ],
      },
      {
        name: "인지도 — 슬라이드 (Facebook 피드)",
        aliases: ["Facebook 피드","Facebook Feed","FB 피드","페이스북 피드","FB Feed","페이스북 Feed","Facebook 피드 슬라이드","Facebook Feed 슬라이드","FB 피드 슬라이드","페이스북 피드 슬라이드","FB Feed 슬라이드","페이스북 Feed 슬라이드"],
        areas: [
        { displayOrder: 1, areaName: "카드 이미지", areaType: "IMAGE", widthPx: 1080, heightPx: 1080, ratio: "1:1", maxFileSizeKb: 30720, formats: ["JPG","PNG"], specLabel: "1080 × 1080 px 이상 / 1:1 / 최대 30MB / JPG, PNG", notes: "화면 비율 허용 범위 3%", isUserInput: false },
        { displayOrder: 2, areaName: "카드 동영상", areaType: "VIDEO", widthPx: 1080, heightPx: 1080, ratio: "1:1", maxDurationSec: 14400, maxFileSizeKb: 4194304, formats: ["MP4","MOV","GIF"], specLabel: "1080 × 1080 px 이상 / 1:1 / 최대 240분 / 최대 4GB / MP4, MOV, GIF", isUserInput: false },
        { displayOrder: 3, areaName: "슬라이드 수", areaType: "TEXT", specLabel: "2~10개", isUserInput: true },
        { displayOrder: 4, areaName: "기본 문구", areaType: "TEXT", maxChars: 80, specLabel: "80자 권장", isUserInput: true },
        { displayOrder: 5, areaName: "제목", areaType: "TEXT", maxChars: 20, specLabel: "20자 권장", isUserInput: true },
        { displayOrder: 6, areaName: "설명", areaType: "TEXT", maxChars: 18, specLabel: "18자 권장", isUserInput: true },
        { displayOrder: 7, areaName: "랜딩 URL", areaType: "URL", specLabel: "필수", isUserInput: true },
        ],
      },
      {
        name: "인지도 — 슬라이드 (Facebook 그룹 피드)",
        aliases: ["Facebook 그룹 피드","Facebook Groups Feed","FB 그룹 피드","페이스북 그룹 피드","FB Groups Feed","페이스북 Groups Feed","Facebook 그룹 피드 슬라이드","Facebook Groups Feed 슬라이드","FB 그룹 피드 슬라이드","페이스북 그룹 피드 슬라이드","FB Groups Feed 슬라이드","페이스북 Groups Feed 슬라이드"],
        areas: [
        { displayOrder: 1, areaName: "카드 이미지", areaType: "IMAGE", widthPx: 1080, heightPx: 1080, ratio: "1:1", maxFileSizeKb: 30720, formats: ["JPG","PNG"], specLabel: "1080 × 1080 px 이상 / 1:1 / 최대 30MB / JPG, PNG", notes: "화면 비율 허용 범위 3%", isUserInput: false },
        { displayOrder: 2, areaName: "카드 동영상", areaType: "VIDEO", widthPx: 1080, heightPx: 1080, ratio: "1:1", maxDurationSec: 14400, maxFileSizeKb: 4194304, formats: ["MP4","MOV","GIF"], specLabel: "1080 × 1080 px 이상 / 1:1 / 최대 240분 / 최대 4GB / MP4, MOV, GIF", isUserInput: false },
        { displayOrder: 3, areaName: "슬라이드 수", areaType: "TEXT", specLabel: "2~10개", isUserInput: true },
        { displayOrder: 4, areaName: "기본 문구", areaType: "TEXT", maxChars: 80, specLabel: "80자 권장", isUserInput: true },
        { displayOrder: 5, areaName: "제목", areaType: "TEXT", maxChars: 20, specLabel: "20자 권장", isUserInput: true },
        { displayOrder: 6, areaName: "설명", areaType: "TEXT", maxChars: 18, specLabel: "18자 권장", isUserInput: true },
        { displayOrder: 7, areaName: "랜딩 URL", areaType: "URL", specLabel: "필수", isUserInput: true },
        ],
      },
      {
        name: "인지도 — 슬라이드 (Facebook 우측 칼럼)",
        aliases: ["Facebook 우측 칼럼","Facebook Right Hand Column","FB 우측 칼럼","페이스북 우측 칼럼","FB Right Hand Column","페이스북 Right Hand Column","Facebook 우측 칼럼 슬라이드","Facebook Right Hand Column 슬라이드","FB 우측 칼럼 슬라이드","페이스북 우측 칼럼 슬라이드","FB Right Hand Column 슬라이드","페이스북 Right Hand Column 슬라이드"],
        areas: [
        { displayOrder: 1, areaName: "카드 이미지", areaType: "IMAGE", widthPx: 1080, heightPx: 1080, ratio: "1:1", maxFileSizeKb: 30720, formats: ["JPG","PNG"], specLabel: "1080 × 1080 px 이상 / 1:1 / 최대 30MB / JPG, PNG", notes: "화면 비율 허용 범위 3%", isUserInput: false },
        { displayOrder: 2, areaName: "카드 동영상", areaType: "VIDEO", widthPx: 1080, heightPx: 1080, ratio: "1:1", maxDurationSec: 14400, maxFileSizeKb: 4194304, formats: ["MP4","MOV","GIF"], specLabel: "1080 × 1080 px 이상 / 1:1 / 최대 240분 / 최대 4GB / MP4, MOV, GIF", isUserInput: false },
        { displayOrder: 3, areaName: "슬라이드 수", areaType: "TEXT", specLabel: "2~10개", isUserInput: true },
        { displayOrder: 4, areaName: "제목", areaType: "TEXT", maxChars: 40, specLabel: "40자 권장", isUserInput: true },
        { displayOrder: 5, areaName: "랜딩 URL", areaType: "URL", specLabel: "필수", isUserInput: true },
        ],
      },
      {
        name: "인지도 — 슬라이드 (Instagram 탐색 홈)",
        aliases: ["Instagram 탐색 홈","Instagram Explore Home","IG 탐색 홈","인스타그램 탐색 홈","IG Explore Home","인스타그램 Explore Home","Instagram 탐색 홈 슬라이드","Instagram Explore Home 슬라이드","IG 탐색 홈 슬라이드","인스타그램 탐색 홈 슬라이드","IG Explore Home 슬라이드","인스타그램 Explore Home 슬라이드"],
        areas: [
        { displayOrder: 1, areaName: "카드 이미지", areaType: "IMAGE", widthPx: 1080, heightPx: 1080, ratio: "4:5", maxFileSizeKb: 30720, formats: ["JPG","PNG"], specLabel: "1080 × 1080 px 이상 / 4:5 / 최대 30MB / JPG, PNG", notes: "최소 너비 500px / 화면 비율 허용 범위 1%", isUserInput: false },
        { displayOrder: 2, areaName: "슬라이드 수", areaType: "TEXT", specLabel: "2~10개", isUserInput: true },
        { displayOrder: 3, areaName: "기본 문구", areaType: "TEXT", maxChars: 125, specLabel: "125자 권장", isUserInput: true },
        { displayOrder: 4, areaName: "제목", areaType: "TEXT", maxChars: 40, specLabel: "40자 권장", isUserInput: true },
        { displayOrder: 5, areaName: "랜딩 URL", areaType: "URL", specLabel: "필수", isUserInput: true },
        ],
      },
      {
        name: "인지도 — 슬라이드 (Instagram 릴스)",
        aliases: ["Instagram 릴스","Instagram Reels","IG 릴스","인스타그램 릴스","IG Reels","인스타그램 Reels","Instagram 릴스 슬라이드","Instagram Reels 슬라이드","IG 릴스 슬라이드","인스타그램 릴스 슬라이드","IG Reels 슬라이드","인스타그램 Reels 슬라이드"],
        areas: [
        { displayOrder: 1, areaName: "카드 이미지", areaType: "IMAGE", widthPx: 1080, heightPx: 1080, ratio: "9:16", maxFileSizeKb: 30720, formats: ["JPG","PNG"], specLabel: "1080 × 1080 px 이상 / 9:16 / 최대 30MB / JPG, PNG", notes: "화면 비율 허용 범위 1%", isUserInput: false },
        { displayOrder: 2, areaName: "슬라이드 수", areaType: "TEXT", specLabel: "2~10개", isUserInput: true },
        { displayOrder: 3, areaName: "랜딩 URL", areaType: "URL", specLabel: null, isUserInput: true },
        ],
      },
      {
        name: "인지도 — 슬라이드 (Messenger 스토리)",
        aliases: ["Messenger 스토리","Messenger Story","메신저 스토리","메신저 Story","Messenger 스토리 슬라이드","Messenger Story 슬라이드","메신저 스토리 슬라이드","메신저 Story 슬라이드"],
        areas: [
        { displayOrder: 1, areaName: "카드 이미지", areaType: "IMAGE", widthPx: 1080, heightPx: 1080, ratio: "1:1", maxFileSizeKb: 30720, formats: ["JPG","PNG"], specLabel: "1080 × 1080 px 이상 / 1:1 / 최대 30MB / JPG, PNG", notes: "화면 비율 허용 범위 3%", isUserInput: false },
        { displayOrder: 2, areaName: "카드 동영상", areaType: "VIDEO", widthPx: 1080, heightPx: 1080, ratio: "1:1", maxDurationSec: 14400, maxFileSizeKb: 4194304, formats: ["MP4","MOV","GIF"], specLabel: "1080 × 1080 px 이상 / 1:1 / 최대 240분 / 최대 4GB / MP4, MOV, GIF", isUserInput: false },
        { displayOrder: 3, areaName: "슬라이드 수", areaType: "TEXT", specLabel: "2~10개", isUserInput: true },
        { displayOrder: 4, areaName: "기본 문구", areaType: "TEXT", maxChars: 80, specLabel: "80자 권장", isUserInput: true },
        { displayOrder: 5, areaName: "제목", areaType: "TEXT", maxChars: 20, specLabel: "20자 권장", isUserInput: true },
        { displayOrder: 6, areaName: "설명", areaType: "TEXT", maxChars: 18, specLabel: "18자 권장", isUserInput: true },
        { displayOrder: 7, areaName: "랜딩 URL", areaType: "URL", specLabel: "필수", isUserInput: true },
        ],
      },
      {
        name: "인지도 — 컬렉션 (Facebook 릴스)",
        aliases: ["Facebook 릴스","Facebook Reels","FB 릴스","페이스북 릴스","FB Reels","페이스북 Reels","Facebook 릴스 컬렉션","Facebook Reels 컬렉션","FB 릴스 컬렉션","페이스북 릴스 컬렉션","FB Reels 컬렉션","페이스북 Reels 컬렉션"],
        areas: [
        { displayOrder: 1, areaName: "커버 이미지", areaType: "IMAGE", widthPx: 1080, heightPx: 1080, ratio: "9:16~1:1", maxFileSizeKb: 30720, formats: ["JPG","PNG"], specLabel: "1080 × 1080 px 이상 / 9:16~1:1 / 최대 30MB / JPG, PNG", isUserInput: false },
        { displayOrder: 2, areaName: "커버 동영상", areaType: "VIDEO", widthPx: 1080, heightPx: 1080, ratio: "9:16~1:1", maxFileSizeKb: 4194304, formats: ["MP4","MOV","GIF"], specLabel: "1080 × 1080 px 이상 / 9:16~1:1 / 최대 4GB / MP4, MOV, GIF", isUserInput: false },
        { displayOrder: 3, areaName: "인스턴트 경험", areaType: "TEXT", specLabel: "필수", isUserInput: true },
        { displayOrder: 4, areaName: "기본 문구", areaType: "TEXT", maxChars: 72, specLabel: "72자 권장", isUserInput: true },
        { displayOrder: 5, areaName: "제목", areaType: "TEXT", maxChars: 10, specLabel: "10자 권장", isUserInput: true },
        { displayOrder: 6, areaName: "랜딩 URL", areaType: "URL", specLabel: "필수", isUserInput: true },
        ],
      },
      {
        name: "인지도 — 컬렉션 (Facebook 피드)",
        aliases: ["Facebook 피드","Facebook Feed","FB 피드","페이스북 피드","FB Feed","페이스북 Feed","Facebook 피드 컬렉션","Facebook Feed 컬렉션","FB 피드 컬렉션","페이스북 피드 컬렉션","FB Feed 컬렉션","페이스북 Feed 컬렉션"],
        areas: [
        { displayOrder: 1, areaName: "커버 이미지", areaType: "IMAGE", widthPx: 1080, heightPx: 1080, ratio: "1.91:1~1:1", maxFileSizeKb: 30720, formats: ["JPG","PNG"], specLabel: "1080 × 1080 px 이상 / 1.91:1~1:1 / 최대 30MB / JPG, PNG", isUserInput: false },
        { displayOrder: 2, areaName: "커버 동영상", areaType: "VIDEO", widthPx: 1080, heightPx: 1080, ratio: "1.91:1~1:1", maxFileSizeKb: 4194304, formats: ["MP4","MOV","GIF"], specLabel: "1080 × 1080 px 이상 / 1.91:1~1:1 / 최대 4GB / MP4, MOV, GIF", isUserInput: false },
        { displayOrder: 3, areaName: "인스턴트 경험", areaType: "TEXT", specLabel: "필수", isUserInput: true },
        { displayOrder: 4, areaName: "기본 문구", areaType: "TEXT", maxChars: 125, specLabel: "125자 권장", isUserInput: true },
        { displayOrder: 5, areaName: "제목", areaType: "TEXT", maxChars: 40, specLabel: "40자 권장", isUserInput: true },
        { displayOrder: 6, areaName: "랜딩 URL", areaType: "URL", specLabel: "필수", isUserInput: true },
        ],
      },
      {
        name: "인지도 — 컬렉션 (Facebook 마켓플레이스)",
        aliases: ["Facebook 마켓플레이스","Facebook Marketplace","FB 마켓플레이스","페이스북 마켓플레이스","FB Marketplace","페이스북 Marketplace","Facebook 마켓플레이스 컬렉션","Facebook Marketplace 컬렉션","FB 마켓플레이스 컬렉션","페이스북 마켓플레이스 컬렉션","FB Marketplace 컬렉션","페이스북 Marketplace 컬렉션"],
        areas: [
        { displayOrder: 1, areaName: "커버 이미지", areaType: "IMAGE", widthPx: 1080, heightPx: 1080, ratio: "1:1", maxFileSizeKb: 30720, formats: ["JPG","PNG"], specLabel: "1080 × 1080 px 이상 / 1:1 / 최대 30MB / JPG, PNG", isUserInput: false },
        { displayOrder: 2, areaName: "인스턴트 경험", areaType: "TEXT", specLabel: "필수", isUserInput: true },
        { displayOrder: 3, areaName: "제목", areaType: "TEXT", maxChars: 25, specLabel: "25자 권장", isUserInput: true },
        { displayOrder: 4, areaName: "랜딩 URL", areaType: "URL", specLabel: null, isUserInput: true },
        ],
      },
      {
        name: "인지도 — 컬렉션 (Facebook 동영상 피드)",
        aliases: ["Facebook 동영상 피드","Facebook Video Feeds","FB 동영상 피드","페이스북 동영상 피드","FB Video Feeds","페이스북 Video Feeds","Facebook 동영상 피드 컬렉션","Facebook Video Feeds 컬렉션","FB 동영상 피드 컬렉션","페이스북 동영상 피드 컬렉션","FB Video Feeds 컬렉션","페이스북 Video Feeds 컬렉션"],
        areas: [
        { displayOrder: 1, areaName: "커버 이미지", areaType: "IMAGE", widthPx: 1080, heightPx: 1080, ratio: "1.91:1~1:1", maxFileSizeKb: 30720, formats: ["JPG","PNG"], specLabel: "1080 × 1080 px 이상 / 1.91:1~1:1 / 최대 30MB / JPG, PNG", isUserInput: false },
        { displayOrder: 2, areaName: "커버 동영상", areaType: "VIDEO", widthPx: 1080, heightPx: 1080, ratio: "1.91:1~1:1", maxFileSizeKb: 4194304, formats: ["MP4","MOV","GIF"], specLabel: "1080 × 1080 px 이상 / 1.91:1~1:1 / 최대 4GB / MP4, MOV, GIF", isUserInput: false },
        { displayOrder: 3, areaName: "인스턴트 경험", areaType: "TEXT", specLabel: "필수", isUserInput: true },
        { displayOrder: 4, areaName: "기본 문구", areaType: "TEXT", maxChars: 125, specLabel: "125자 권장", isUserInput: true },
        { displayOrder: 5, areaName: "제목", areaType: "TEXT", maxChars: 40, specLabel: "40자 권장", isUserInput: true },
        { displayOrder: 6, areaName: "랜딩 URL", areaType: "URL", specLabel: "필수", isUserInput: true },
        ],
      },
      {
        name: "인지도 — 컬렉션 (Instagram 탐색)",
        aliases: ["Instagram 탐색","Instagram Explore","IG 탐색","인스타그램 탐색","IG Explore","인스타그램 Explore","Instagram 탐색 컬렉션","Instagram Explore 컬렉션","IG 탐색 컬렉션","인스타그램 탐색 컬렉션","IG Explore 컬렉션","인스타그램 Explore 컬렉션"],
        areas: [
        { displayOrder: 1, areaName: "커버 이미지", areaType: "IMAGE", widthPx: 1080, heightPx: 1080, ratio: "9:16", maxFileSizeKb: 30720, formats: ["JPG","PNG"], specLabel: "1080 × 1080 px 이상 / 9:16 / 최대 30MB / JPG, PNG", isUserInput: false },
        { displayOrder: 2, areaName: "커버 동영상", areaType: "VIDEO", widthPx: 1080, heightPx: 1080, ratio: "9:16", maxFileSizeKb: 4194304, formats: ["MP4","MOV","GIF"], specLabel: "1080 × 1080 px 이상 / 9:16 / 최대 4GB / MP4, MOV, GIF", isUserInput: false },
        { displayOrder: 3, areaName: "인스턴트 경험", areaType: "TEXT", specLabel: "필수", isUserInput: true },
        { displayOrder: 4, areaName: "기본 문구", areaType: "TEXT", maxChars: 125, specLabel: "125자 권장", isUserInput: true },
        { displayOrder: 5, areaName: "제목", areaType: "TEXT", maxChars: 40, specLabel: "40자 권장", isUserInput: true },
        { displayOrder: 6, areaName: "랜딩 URL", areaType: "URL", specLabel: "필수", isUserInput: true },
        ],
      },
      {
        name: "인지도 — 컬렉션 (Instagram 피드)",
        aliases: ["Instagram 피드","Instagram Feed","IG 피드","인스타그램 피드","IG Feed","인스타그램 Feed","Instagram 피드 컬렉션","Instagram Feed 컬렉션","IG 피드 컬렉션","인스타그램 피드 컬렉션","IG Feed 컬렉션","인스타그램 Feed 컬렉션"],
        areas: [
        { displayOrder: 1, areaName: "커버 이미지", areaType: "IMAGE", widthPx: 1080, heightPx: 1080, ratio: "1.91:1~1:1", maxFileSizeKb: 30720, formats: ["JPG","PNG"], specLabel: "1080 × 1080 px 이상 / 1.91:1~1:1 / 최대 30MB / JPG, PNG", notes: "최소 너비 500px / 최소 높이 500px", isUserInput: false },
        { displayOrder: 2, areaName: "커버 동영상", areaType: "VIDEO", widthPx: 1080, heightPx: 1080, ratio: "1.91:1~1:1", maxFileSizeKb: 4194304, formats: ["MP4","MOV","GIF"], specLabel: "1080 × 1080 px 이상 / 1.91:1~1:1 / 최대 4GB / MP4, MOV, GIF", isUserInput: false },
        { displayOrder: 3, areaName: "인스턴트 경험", areaType: "TEXT", specLabel: "필수", isUserInput: true },
        { displayOrder: 4, areaName: "기본 문구", areaType: "TEXT", maxChars: 125, specLabel: "125자 권장", isUserInput: true },
        { displayOrder: 5, areaName: "제목", areaType: "TEXT", maxChars: 40, specLabel: "40자 권장", isUserInput: true },
        { displayOrder: 6, areaName: "랜딩 URL", areaType: "URL", specLabel: "필수", isUserInput: true },
        ],
      },
      {
        name: "인지도 — 컬렉션 (Instagram 릴스)",
        aliases: ["Instagram 릴스","Instagram Reels","IG 릴스","인스타그램 릴스","IG Reels","인스타그램 Reels","Instagram 릴스 컬렉션","Instagram Reels 컬렉션","IG 릴스 컬렉션","인스타그램 릴스 컬렉션","IG Reels 컬렉션","인스타그램 Reels 컬렉션"],
        areas: [
        { displayOrder: 1, areaName: "커버 이미지", areaType: "IMAGE", widthPx: 500, heightPx: 888, ratio: "9:16", maxFileSizeKb: 30720, formats: ["JPG","PNG"], specLabel: "500 × 888 px 이상 / 9:16 / 최대 30MB / JPG, PNG", isUserInput: false },
        { displayOrder: 2, areaName: "커버 동영상", areaType: "VIDEO", widthPx: 500, heightPx: 888, ratio: "9:16", maxFileSizeKb: 4194304, formats: ["MP4","MOV"], specLabel: "500 × 888 px 이상 / 9:16 / 최대 4GB / MP4, MOV", isUserInput: false },
        { displayOrder: 3, areaName: "인스턴트 경험", areaType: "TEXT", specLabel: "필수", isUserInput: true },
        { displayOrder: 4, areaName: "랜딩 URL", areaType: "URL", specLabel: null, isUserInput: true },
        ],
      },
      {
        name: "인지도 — 컬렉션 (Instagram 스토리)",
        aliases: ["Instagram 스토리","Instagram Story","IG 스토리","인스타그램 스토리","IG Story","인스타그램 Story","Instagram 스토리 컬렉션","Instagram Story 컬렉션","IG 스토리 컬렉션","인스타그램 스토리 컬렉션","IG Story 컬렉션","인스타그램 Story 컬렉션"],
        areas: [
        { displayOrder: 1, areaName: "커버 이미지", areaType: "IMAGE", widthPx: 1080, heightPx: 1080, ratio: "1.91:1~1:1", maxFileSizeKb: 30720, formats: ["JPG","PNG"], specLabel: "1080 × 1080 px 이상 / 1.91:1~1:1 / 최대 30MB / JPG, PNG", notes: "최소 너비 500px / 최소 높이 500px", isUserInput: false },
        { displayOrder: 2, areaName: "커버 동영상", areaType: "VIDEO", widthPx: 1080, heightPx: 1080, ratio: "1.91:1~1:1", maxFileSizeKb: 4194304, formats: ["MP4","MOV","GIF"], specLabel: "1080 × 1080 px 이상 / 1.91:1~1:1 / 최대 4GB / MP4, MOV, GIF", isUserInput: false },
        { displayOrder: 3, areaName: "인스턴트 경험", areaType: "TEXT", specLabel: "필수", isUserInput: true },
        { displayOrder: 4, areaName: "기본 문구", areaType: "TEXT", maxChars: 125, specLabel: "125자 권장", isUserInput: true },
        { displayOrder: 5, areaName: "랜딩 URL", areaType: "URL", specLabel: "필수", isUserInput: true },
        ],
      },
      {
        name: "인지도 — 이미지 (Facebook 피드)",
        aliases: ["Facebook 피드","Facebook Feed","FB 피드","페이스북 피드","FB Feed","페이스북 Feed","Facebook 피드 이미지","Facebook Feed 이미지","FB 피드 이미지","페이스북 피드 이미지","FB Feed 이미지","페이스북 Feed 이미지"],
        areas: [
        { displayOrder: 1, areaName: "이미지", areaType: "IMAGE", widthPx: 1440, heightPx: 1800, ratio: "4:5", maxFileSizeKb: 30720, formats: ["JPG","PNG"], specLabel: "1440 × 1800 px 이상 / 4:5 / 최대 30MB / JPG, PNG", notes: "최소 너비 600px / 최소 높이 750px / 화면 비율 허용 범위 3%", isUserInput: false },
        { displayOrder: 2, areaName: "기본 문구", areaType: "TEXT", maxChars: 150, specLabel: "150자 권장", isUserInput: true },
        { displayOrder: 3, areaName: "제목", areaType: "TEXT", maxChars: 27, specLabel: "27자 권장", isUserInput: true },
        { displayOrder: 4, areaName: "랜딩 URL", areaType: "URL", specLabel: null, isUserInput: true },
        ],
      },
      {
        name: "인지도 — 이미지 (Facebook 인스트림 동영상)",
        aliases: ["Facebook 인스트림 동영상","Facebook Instream Video","FB 인스트림 동영상","페이스북 인스트림 동영상","FB Instream Video","페이스북 Instream Video","Facebook 인스트림 동영상 이미지","Facebook Instream Video 이미지","FB 인스트림 동영상 이미지","페이스북 인스트림 동영상 이미지","FB Instream Video 이미지","페이스북 Instream Video 이미지"],
        areas: [
        { displayOrder: 1, areaName: "이미지", areaType: "IMAGE", widthPx: 1080, heightPx: 1080, ratio: "1.91:1~1:1", maxFileSizeKb: 30720, formats: ["JPG","PNG"], specLabel: "1080 × 1080 px 이상 / 1.91:1~1:1 / 최대 30MB / JPG, PNG", notes: "최소 너비 600px / 최소 높이 600px / 화면 비율 허용 범위 3%", isUserInput: false },
        { displayOrder: 2, areaName: "기본 문구", areaType: "TEXT", maxChars: 125, specLabel: "125자 권장", isUserInput: true },
        { displayOrder: 3, areaName: "제목", areaType: "TEXT", maxChars: 40, specLabel: "40자 권장", isUserInput: true },
        { displayOrder: 4, areaName: "설명", areaType: "TEXT", maxChars: 30, specLabel: "30자 권장", isUserInput: true },
        { displayOrder: 5, areaName: "랜딩 URL", areaType: "URL", specLabel: null, isUserInput: true },
        ],
      },
      {
        name: "인지도 — 동영상 (Facebook 피드)",
        aliases: ["Facebook 피드","Facebook Feed","FB 피드","페이스북 피드","FB Feed","페이스북 Feed","Facebook 피드 동영상","Facebook Feed 동영상","FB 피드 동영상","페이스북 피드 동영상","FB Feed 동영상","페이스북 Feed 동영상"],
        areas: [
        { displayOrder: 1, areaName: "이미지", areaType: "IMAGE", widthPx: 1440, heightPx: 1800, ratio: "4:5", maxFileSizeKb: 4194304, formats: ["MP4","MOV","GIF"], specLabel: "1440 × 1800 px 이상 / 4:5 / 최대 4096MB / MP4, MOV, GIF", notes: "최소 너비 120px / 최소 높이 120px", isUserInput: false },
        { displayOrder: 2, areaName: "기본 문구", areaType: "TEXT", maxChars: 150, specLabel: "150자 권장", isUserInput: true },
        { displayOrder: 3, areaName: "제목", areaType: "TEXT", maxChars: 27, specLabel: "27자 권장", isUserInput: true },
        { displayOrder: 4, areaName: "랜딩 URL", areaType: "URL", specLabel: null, isUserInput: true },
        ],
      },
];

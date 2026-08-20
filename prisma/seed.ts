/**
 * 마스터 스펙 시드 데이터
 *
 * 파란색 행 = isUserInput: false  → DB에서 자동으로 채워짐
 * 노란색 행 = isUserInput: true   → 캠페인마다 사용자가 입력
 *
 * 출처: Diageo JW Blue FY27 Q1 Campaign 제작 요청서 PPT (260807)
 *       + 매체 기획 엑셀 (Diageo_JW_Blue_FY27_Q1_Campaign_260728_1.xlsx)
 */

import { PrismaClient, AssetAreaType, ChangeType } from '@prisma/client';

const prisma = new PrismaClient();

const MEDIA_DATA = [
  // ═══════════════════════════════════════════════════
  // NAVER NOSP
  // ═══════════════════════════════════════════════════
  {
    mediaName: 'Naver NOSP',
    mediaAliases: ['네이버 NOSP', 'NAVER NOSP', '네이버'],
    products: [
      {
        name: 'Double Crown (Special DA 동영상 확장형 520 + Home Right Banner)',
        aliases: ['더블크라운', 'Double Crown', 'Naver_더블크라운'],
        areas: [
          // ── 파란색 행 (마스터 스펙) ──
          {
            displayOrder: 1,
            areaName: '9:16 메인 동영상',
            areaType: AssetAreaType.VIDEO,
            widthPx: 828,
            heightPx: 1472,
            ratio: '9:16',
            maxDurationSec: 6,
            formats: ['MP4', 'MOV', 'AVI'],
            specLabel: '828 * 1472 px (최대 6초) / MP4, MOV, AVI',
            isUserInput: false,
          },
          {
            displayOrder: 2,
            areaName: '9:16 정지컷 이미지',
            areaType: AssetAreaType.IMAGE,
            widthPx: 828,
            heightPx: 1472,
            ratio: '9:16',
            maxFileSizeKb: 300,
            formats: ['JPG', 'JPEG', 'PNG'],
            specLabel: '828 * 1472 px / 300kb 이하 / JPG, JPEG, PNG',
            isUserInput: false,
          },
          {
            displayOrder: 3,
            areaName: '광고주 로고',
            areaType: AssetAreaType.IMAGE,
            widthPx: 88,
            heightPx: 88,
            ratio: '1:1',
            maxFileSizeKb: 50,
            formats: ['JPG', 'JPEG', 'PNG'],
            specLabel: '88 * 88 px / 50kb 이하 / JPG, JPEG, PNG',
            isUserInput: false,
          },
          // ── 노란색 행 (캠페인 입력) ──
          {
            displayOrder: 4,
            areaName: '메인 텍스트 (버튼용)',
            areaType: AssetAreaType.TEXT,
            maxChars: 14,
            specLabel: '최대 14자, 띄어쓰기 포함',
            isUserInput: true,
          },
          {
            displayOrder: 5,
            areaName: '서브 텍스트 (버튼용)',
            areaType: AssetAreaType.TEXT,
            maxChars: 21,
            specLabel: '최대 21자, 띄어쓰기 포함',
            isUserInput: true,
          },
          {
            displayOrder: 6,
            areaName: '랜딩 URL',
            areaType: AssetAreaType.URL,
            specLabel: null,
            isUserInput: true,
          },
        ],
      },

      {
        name: 'Special DA_Exp_Video(520)',
        aliases: ['스페셜DA', 'Special DA', 'Naver_스페셜DA', 'Special DA_Exp_Video'],
        areas: [
          {
            displayOrder: 1,
            areaName: '이미지 영역 01 (누끼형 오브젝트)',
            areaType: AssetAreaType.IMAGE,
            widthPx: 750,
            heightPx: 220,
            maxFileSizeKb: 200,
            formats: ['PNG'],
            isTransparentBg: true,
            specLabel: '750 * 220 px / 누끼형 오브젝트 PNG / 최대 200KB',
            notes: 'PSD 참고. 투명 배경 처리된 이미지만 사용 가능',
            isUserInput: false,
          },
          {
            displayOrder: 2,
            areaName: '광고 문구 영역 (광고 메인 문구 + 광고주 로고)',
            areaType: AssetAreaType.IMAGE,
            widthPx: 1020,
            heightPx: 300,
            maxFileSizeKb: 200,
            formats: ['PNG'],
            isTransparentBg: true,
            needsDarkMode: true,
            specLabel: '1020 * 300 px / 투명 PNG / 최대 200KB',
            notes: '라이트 & 다크모드 버전 포함 2장 필요',
            isUserInput: false,
          },
          {
            displayOrder: 3,
            areaName: '동영상 소재 영역 — 확장 영상',
            areaType: AssetAreaType.VIDEO,
            widthPx: 1280,
            heightPx: 720,
            ratio: '16:9',
            maxDurationSec: 60,
            maxFileSizeKb: 1024 * 1024, // 1GB
            formats: ['AVI', 'MP4', 'WMV', 'MPG', 'MPEG'],
            specLabel: '16:9 / 1280 * 720 px / 최대 60초 / 1GB 이하 / AVI, MP4, WMV, MPG, MPEG',
            isUserInput: false,
          },
          {
            displayOrder: 4,
            areaName: '확장 영상 정지컷 이미지',
            areaType: AssetAreaType.IMAGE,
            widthPx: 1280,
            heightPx: 720,
            ratio: '16:9',
            maxFileSizeKb: 300,
            formats: ['JPG', 'PNG'],
            specLabel: '16:9 / 1280 * 720 px / 300KB 이하 / JPG, PNG',
            isUserInput: false,
          },
          {
            displayOrder: 5,
            areaName: '광고주 로고 이미지',
            areaType: AssetAreaType.IMAGE,
            widthPx: 300,
            heightPx: 300,
            ratio: '1:1',
            maxFileSizeKb: 150,
            formats: ['JPG', 'PNG'],
            specLabel: '300 * 300 px / 150kb 이하 / JPG, PNG',
            isUserInput: false,
          },
          {
            displayOrder: 6,
            areaName: '동영상 소재 영역 — 미리보기 영상',
            areaType: AssetAreaType.VIDEO,
            widthPx: 720,
            heightPx: 720,
            ratio: '1:1',
            maxDurationSec: 3,
            maxFileSizeKb: 10 * 1024, // 10MB
            formats: ['AVI', 'MP4', 'WMV', 'MPG', 'MPEG'],
            specLabel: '1:1 / 720 * 720 px / 최대 3초 / 10MB 이하',
            isUserInput: false,
          },
          {
            displayOrder: 7,
            areaName: '미리보기 영상 정지컷 이미지',
            areaType: AssetAreaType.IMAGE,
            widthPx: 720,
            heightPx: 720,
            ratio: '1:1',
            maxFileSizeKb: 300,
            formats: ['JPG', 'PNG'],
            specLabel: '1:1 / 720 * 720 px / 300KB 이하 / JPG, PNG',
            isUserInput: false,
          },
          // 노란색 행
          {
            displayOrder: 8,
            areaName: 'CTA 버튼 텍스트',
            areaType: AssetAreaType.TEXT,
            maxChars: 14,
            specLabel: '최대 14자',
            isUserInput: true,
          },
          {
            displayOrder: 9,
            areaName: '광고주 컬러',
            areaType: AssetAreaType.COLOR,
            specLabel: 'HEX 코드',
            isUserInput: true,
          },
          {
            displayOrder: 10,
            areaName: '랜딩 URL',
            areaType: AssetAreaType.URL,
            specLabel: null,
            isUserInput: true,
          },
        ],
      },

      {
        name: 'Timeboard_Exp_Video',
        aliases: ['타임보드', '타임보드(동영상형)', 'Naver_타임보드(동영상형)'],
        areas: [
          {
            displayOrder: 1,
            areaName: '❶ 와이드 커버 이미지',
            areaType: AssetAreaType.IMAGE,
            widthPx: 1952,
            heightPx: 520,
            maxFileSizeKb: 400,
            formats: ['JPG', 'JPEG', 'PNG'],
            specLabel: '1952 * 520 px / 400kb 이하 / JPG, JPEG, PNG',
            isUserInput: false,
          },
          {
            displayOrder: 2,
            areaName: '❷ 누끼형 오브젝트 이미지',
            areaType: AssetAreaType.IMAGE,
            widthPx: 440,
            heightPx: 200,
            maxFileSizeKb: 200,
            formats: ['PNG'],
            isTransparentBg: true,
            specLabel: '440 * 200 px / 200kb 이하 / 배경 투명 처리된 PNG만 사용',
            isUserInput: false,
          },
          {
            displayOrder: 3,
            areaName: '❸ 누끼형 타임보드 배너 이미지',
            areaType: AssetAreaType.IMAGE,
            widthPx: 1500,
            heightPx: 200,
            maxFileSizeKb: 200,
            formats: ['PNG'],
            isTransparentBg: true,
            needsDarkMode: true,
            specLabel: '1500 * 200 px / 200kb 이하 / 투명 PNG / 라이트 & 다크 2벌',
            isUserInput: false,
          },
          {
            displayOrder: 4,
            areaName: '❹ 미리보기 동영상',
            areaType: AssetAreaType.VIDEO,
            ratio: '16:9',
            maxDurationSec: 3,
            formats: ['AVI', 'MOV', 'MP4'],
            specLabel: '16:9 / 3초 고정 / AVI, MOV, MP4',
            isUserInput: false,
          },
          {
            displayOrder: 5,
            areaName: '❺ 누끼형 로고 이미지',
            areaType: AssetAreaType.IMAGE,
            widthPx: 288,
            heightPx: 160,
            maxFileSizeKb: 100,
            formats: ['PNG'],
            isTransparentBg: true,
            specLabel: '288 * 160 px / 100kb 이하 / 배경 투명 처리된 PNG만 사용',
            isUserInput: false,
          },
          {
            displayOrder: 6,
            areaName: '❻ 확장 후 동영상',
            areaType: AssetAreaType.VIDEO,
            ratio: '16:9',
            maxDurationSec: 600, // 최대 10분
            formats: ['AVI', 'MOV', 'MP4'],
            specLabel: '16:9 / 최대 10분 / AVI, MOV, MP4',
            isUserInput: false,
          },
          {
            displayOrder: 7,
            areaName: '❼ 확장 후 정지컷 이미지',
            areaType: AssetAreaType.IMAGE,
            widthPx: 1280,
            heightPx: 720,
            maxFileSizeKb: 400,
            formats: ['JPG', 'JPEG', 'PNG'],
            specLabel: '1280 * 720 px / 400kb 이하 / JPG, JPEG, PNG',
            isUserInput: false,
          },
        ],
      },

      {
        name: 'Main_Entertainment & Sports_Feed 1st_이미지형',
        aliases: ['엔터스포츠피드', '엔터 & 스포츠피드', 'Naver_엔터 & 스포츠피드'],
        areas: [
          {
            displayOrder: 1,
            areaName: '프로필 이미지',
            areaType: AssetAreaType.IMAGE,
            widthPx: 300,
            heightPx: 300,
            ratio: '1:1',
            maxFileSizeKb: 200,
            formats: ['JPG', 'JPEG', 'PNG'],
            specLabel: '300 * 300 px (1:1) / 200KB 이하 / JPG, JPEG, PNG (RGB)',
            isUserInput: false,
          },
          {
            displayOrder: 2,
            areaName: '광고 이미지',
            areaType: AssetAreaType.IMAGE,
            widthPx: 1200,
            heightPx: 1200,
            ratio: '1:1',
            maxFileSizeKb: 800,
            formats: ['JPG', 'JPEG', 'PNG'],
            specLabel: '1200 * 1200 px (1:1) 최소 3개 등록 필수 / 800KB 이하',
            notes: '최소 3개 등록 필수',
            isUserInput: false,
          },
          {
            displayOrder: 3,
            areaName: '로고 이미지',
            areaType: AssetAreaType.IMAGE,
            widthPx: 864,
            heightPx: 72,
            maxFileSizeKb: 600,
            formats: ['PNG'],
            isTransparentBg: true,
            specLabel: '864 * 72 px / 600KB 이하 / 투명 배경의 PNG (RGB)',
            isUserInput: false,
          },
          // 노란색 행
          {
            displayOrder: 4,
            areaName: '프로필 이름',
            areaType: AssetAreaType.TEXT,
            specLabel: null,
            isUserInput: true,
          },
          {
            displayOrder: 5,
            areaName: '광고 문구',
            areaType: AssetAreaType.TEXT,
            maxChars: 25,
            specLabel: '한줄당 25자 이내, 최대 2줄',
            isUserInput: true,
          },
          {
            displayOrder: 6,
            areaName: '배경 컬러',
            areaType: AssetAreaType.COLOR,
            specLabel: 'HEX 코드',
            isUserInput: true,
          },
          {
            displayOrder: 7,
            areaName: '행동 유도 버튼',
            areaType: AssetAreaType.TEXT,
            specLabel: null,
            isUserInput: true,
          },
          {
            displayOrder: 8,
            areaName: '랜딩 URL',
            areaType: AssetAreaType.URL,
            specLabel: null,
            isUserInput: true,
          },
          {
            displayOrder: 9,
            areaName: '고지문구',
            areaType: AssetAreaType.TEXT,
            specLabel: '주류 경고문구',
            isUserInput: true,
          },
        ],
      },

      {
        name: 'Main_Entertainment & Sports_Feed 1st_동영상형',
        aliases: ['엔터스포츠피드 동영상', '엔터피드 동영상'],
        areas: [
          {
            displayOrder: 1,
            areaName: '프로필 이미지',
            areaType: AssetAreaType.IMAGE,
            widthPx: 300,
            heightPx: 300,
            ratio: '1:1',
            maxFileSizeKb: 200,
            formats: ['JPG', 'JPEG', 'PNG'],
            specLabel: '300 * 300 px (1:1) / 200KB 이하 / JPG, JPEG, PNG (RGB)',
            isUserInput: false,
          },
          {
            displayOrder: 2,
            areaName: '광고 동영상',
            areaType: AssetAreaType.VIDEO,
            ratio: '1:1',
            maxFileSizeKb: 1024 * 1024, // 1GB
            formats: ['MP4', 'AVI', 'MOV', 'WMV'],
            specLabel: '최소 600 * 600 px (1:1) / 1GB 이하 / MP4, AVI, MOV, WMV',
            isUserInput: false,
          },
          {
            displayOrder: 3,
            areaName: '광고 스틸컷 이미지',
            areaType: AssetAreaType.IMAGE,
            widthPx: 1200,
            heightPx: 1200,
            ratio: '1:1',
            maxFileSizeKb: 800,
            formats: ['JPG', 'JPEG', 'PNG'],
            specLabel: '1200 * 1200 px / 800KB 이하 / JPG, JPEG, PNG (RGB)',
            isUserInput: false,
          },
          {
            displayOrder: 4,
            areaName: '로고 이미지',
            areaType: AssetAreaType.IMAGE,
            widthPx: 864,
            heightPx: 72,
            maxFileSizeKb: 600,
            formats: ['PNG'],
            isTransparentBg: true,
            specLabel: '864 * 72 px / 600KB 이하 / 투명 배경의 PNG (RGB)',
            isUserInput: false,
          },
          { displayOrder: 5, areaName: '프로필 이름', areaType: AssetAreaType.TEXT, specLabel: null, isUserInput: true },
          { displayOrder: 6, areaName: '광고 문구', areaType: AssetAreaType.TEXT, maxChars: 25, specLabel: '한줄당 25자 이내, 최대 2줄', isUserInput: true },
          { displayOrder: 7, areaName: '배경 컬러', areaType: AssetAreaType.COLOR, specLabel: 'HEX 코드', isUserInput: true },
          { displayOrder: 8, areaName: '행동 유도 버튼', areaType: AssetAreaType.TEXT, specLabel: null, isUserInput: true },
          { displayOrder: 9, areaName: '랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
          { displayOrder: 10, areaName: '고지문구', areaType: AssetAreaType.TEXT, specLabel: '주류 경고문구', isUserInput: true },
        ],
      },

      {
        name: 'Naver Brand Search_M_Premium (동영상형)',
        aliases: ['브랜드검색', '브랜드검색 프리미엄', 'Naver_브랜드검색(프리미엄형_동영상)', 'Brand Search_M_Premium'],
        areas: [
          // ── 파란색 행 ──
          { displayOrder: 1, areaName: '브랜딩 배너', areaType: AssetAreaType.IMAGE, widthPx: 786, heightPx: 184, maxFileSizeKb: 2048, formats: ['PNG'], isTransparentBg: true, specLabel: '786 * 184 px / 투명 PNG / 2MB 이내', notes: '텍스트 영역 418*96px / 최대 2줄', isUserInput: false },
          { displayOrder: 2, areaName: "프리뷰 동영상", areaType: AssetAreaType.VIDEO, ratio: '16:9', maxDurationSec: 7, maxFileSizeKb: 1024, formats: ['MP4', 'AVI', 'MOV', 'MKV', 'FLV'], specLabel: '16:9 / 1MB 이하 / 480P 이상 / 5초~6.5초 / MP4, AVI, MOV, MKV, FLV', isUserInput: false },
          { displayOrder: 3, areaName: '본편 동영상', areaType: AssetAreaType.VIDEO, ratio: '16:9', maxFileSizeKb: 80 * 1024, formats: ['MP4', 'AVI', 'MOV', 'MKV', 'FLV'], specLabel: '16:9 / 80MB 이하 / 480P 이상 / 5초~ / MP4, AVI, MOV, MKV, FLV', isUserInput: false },
          { displayOrder: 4, areaName: '스틸 이미지', areaType: AssetAreaType.IMAGE, widthPx: 754, heightPx: 424, maxFileSizeKb: 2048, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '754 * 424 px / JPG, JPEG, PNG / 2MB 이내', isUserInput: false },
          { displayOrder: 5, areaName: '다이나믹 썸네일 (3종)', areaType: AssetAreaType.IMAGE, widthPx: 240, heightPx: 240, maxFileSizeKb: 10240, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '240 * 240 px 이상 (비율유지) / JPG, JPEG, PNG / 10MB 이내', notes: '썸네일 3종 필수', isUserInput: false },
          // ── 노란색 행 ──
          { displayOrder: 6, areaName: '홈링크 (랜딩 URL)', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
          { displayOrder: 7, areaName: '브랜드 이벤트 문구 (새소식)', areaType: AssetAreaType.TEXT, maxChars: 18, specLabel: '최대 18자 이내', isUserInput: true },
          { displayOrder: 8, areaName: '브랜드 이벤트 랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
          { displayOrder: 9, areaName: '다이나믹 썸네일 하단 문구 (3종)', areaType: AssetAreaType.TEXT, maxChars: 7, specLabel: '각 1~7자 이내 / 3종 (팝업스토어, 인스타그램, 카톡선물하기 등)', isUserInput: true },
          { displayOrder: 10, areaName: '다이나믹 썸네일 랜딩 URL (3종)', areaType: AssetAreaType.URL, specLabel: '3개 각각 URL', isUserInput: true },
          { displayOrder: 11, areaName: '법적 고지문 (과음경고)', areaType: AssetAreaType.TEXT, specLabel: '지나친 음주는 뇌졸중, 기억력 손상이나 치매를 유발합니다. 임신 중 음주는 기형아 출생 위험을 높입니다.', isUserInput: true },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════
  // NAVER GFA
  // ═══════════════════════════════════════════════════
  {
    mediaName: 'Naver GFA',
    mediaAliases: ['NaverGFA', 'NAVER GFA', '네이버GFA', '네이버 GFA'],
    products: [
      {
        name: 'GFA Main+Sub_Image',
        aliases: ['GFA 이미지', 'GFA Main Sub Image', 'GFA_이미지'],
        areas: [
          { displayOrder: 1, areaName: '메인 이미지', areaType: AssetAreaType.IMAGE, widthPx: 1250, heightPx: 560, maxFileSizeKb: 250, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '1250 * 560 px / 50KB 이상~250KB 이하 / JPG, JPEG, PNG / RGB', notes: '여백 가이드 준수 필수 / 나눔고딕 또는 고딕계열 폰트 권장', isUserInput: false },
          { displayOrder: 2, areaName: '프로필 이미지', areaType: AssetAreaType.IMAGE, widthPx: 300, heightPx: 300, ratio: '1:1', maxFileSizeKb: 200, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '300 * 300 px / JPG, JPEG, PNG / RGB / 200KB 이하', isUserInput: false },
          // 노란색 행
          { displayOrder: 3, areaName: '광고 안내 문구 (시각장애인용)', areaType: AssetAreaType.TEXT, maxChars: 100, specLabel: '최대 100자', isUserInput: true },
          { displayOrder: 4, areaName: '행동 유도 문구 (최대 3종, 각 15자)', areaType: AssetAreaType.TEXT, maxChars: 15, specLabel: '각 15자 이내 / 최대 3종', isUserInput: true },
          { displayOrder: 5, areaName: '행동 유도 URL (최대 3종)', areaType: AssetAreaType.URL, specLabel: '3개 각각 URL', isUserInput: true },
        ],
      },
      {
        name: 'GFA Main+Sub_Video',
        aliases: ['GFA 동영상', 'GFA Main Sub Video', 'GFA_동영상'],
        areas: [
          { displayOrder: 1, areaName: '동영상 소재', areaType: AssetAreaType.VIDEO, ratio: '16:9', maxFileSizeKb: 1024 * 1024, formats: ['AVI', 'MP4', 'WMV', 'MPG', 'MPEG'], specLabel: '16:9 / 1GB 이하 / 5초~10분 / AVI, MP4, WMV, MPG, MPEG (사운드 필수)', isUserInput: false },
          { displayOrder: 2, areaName: '정지컷 이미지', areaType: AssetAreaType.IMAGE, widthPx: 1280, heightPx: 720, ratio: '16:9', maxFileSizeKb: 220, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '1280 * 720 px (16:9) / 최소 너비 600px 이상 / 220KB 이하 / JPG, JPEG, PNG (RGB)', isUserInput: false },
          { displayOrder: 3, areaName: '프로필 이미지', areaType: AssetAreaType.IMAGE, widthPx: 300, heightPx: 300, ratio: '1:1', maxFileSizeKb: 130, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '300 * 300 px (1:1) / 130KB 이하 / JPG, JPEG, PNG (RGB)', isUserInput: false },
          // 노란색 행
          { displayOrder: 4, areaName: '프로필 이름', areaType: AssetAreaType.TEXT, maxChars: 14, specLabel: '최대 14자', isUserInput: true },
          { displayOrder: 5, areaName: '캠페인 메시지', areaType: AssetAreaType.TEXT, maxChars: 40, specLabel: '최대 2줄 / 40자', isUserInput: true },
          { displayOrder: 6, areaName: '행동 유도 문구', areaType: AssetAreaType.TEXT, specLabel: null, isUserInput: true },
          { displayOrder: 7, areaName: '행동 유도 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
      {
        name: 'GFA Smart Channel',
        aliases: ['스마트채널', 'Smart Channel', 'GFA Smart Channel'],
        areas: [
          { displayOrder: 1, areaName: '이미지 소재 (160 사이즈형)', areaType: AssetAreaType.IMAGE, widthPx: 750, heightPx: 160, maxFileSizeKb: 150, formats: ['PNG'], isTransparentBg: true, specLabel: '750 * 160 px / 최대 150KB / PNG (투명 배경)', notes: '제작용 PSD 샘플 사용. 오브젝트 영역 최대 260*160px. 폰트: 산돌네오고딕/나눔바른고딕만 사용 가능', isUserInput: false },
          { displayOrder: 2, areaName: '이미지 소재 (200 사이즈형)', areaType: AssetAreaType.IMAGE, widthPx: 750, heightPx: 200, maxFileSizeKb: 150, formats: ['PNG'], isTransparentBg: true, specLabel: '750 * 200 px / 최대 150KB / PNG (투명 배경)', notes: '제작용 PSD 샘플 사용. 폰트 컬러: 메인카피(1행) #222222, 서브카피(2행) #666666', isUserInput: false },
          { displayOrder: 3, areaName: '랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
      {
        name: 'GFA FEED_Image',
        aliases: ['GFA 피드 이미지', 'GFA Feed Image'],
        areas: [
          { displayOrder: 1, areaName: '광고 이미지', areaType: AssetAreaType.IMAGE, widthPx: 1200, heightPx: 628, ratio: '16:9', maxFileSizeKb: 500, formats: ['JPG', 'JPEG', 'PNG'], specLabel: 'W1200 * H628 px (16:9) / 50KB 이상~500KB 이하 / JPG, JPEG, PNG (RGB)', isUserInput: false },
          { displayOrder: 2, areaName: '프로필 이미지', areaType: AssetAreaType.IMAGE, widthPx: 300, heightPx: 300, ratio: '1:1', maxFileSizeKb: 200, formats: ['JPG', 'JPEG', 'PNG'], specLabel: 'W300 * H300 px (1:1) / 200KB 이하 / JPG, JPEG, PNG (RGB)', isUserInput: false },
          // 노란색 행
          { displayOrder: 3, areaName: '프로필 이름', areaType: AssetAreaType.TEXT, maxChars: 19, specLabel: '최대 19자 (띄어쓰기 포함)', isUserInput: true },
          { displayOrder: 4, areaName: '광고 문구', areaType: AssetAreaType.TEXT, maxChars: 65, specLabel: '최대 65자 (띄어쓰기 포함)', isUserInput: true },
          { displayOrder: 5, areaName: '행동 유도 버튼', areaType: AssetAreaType.TEXT, specLabel: null, isUserInput: true },
          { displayOrder: 6, areaName: '랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
      {
        name: 'GFA FEED_Video',
        aliases: ['GFA 피드 동영상', 'GFA Feed Video'],
        areas: [
          { displayOrder: 1, areaName: '프로필 이미지', areaType: AssetAreaType.IMAGE, widthPx: 300, heightPx: 300, ratio: '1:1', maxFileSizeKb: 200, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '300 * 300 px (1:1) / 200kb 이하 / JPG, JPEG, PNG (RGB)', isUserInput: false },
          { displayOrder: 2, areaName: '광고 동영상', areaType: AssetAreaType.VIDEO, ratio: '1:1', specLabel: '최소 너비 600px 이상 / 5초 이상 최대 10분 / 1:1 또는 16:9', isUserInput: false },
          { displayOrder: 3, areaName: '프로필 이름', areaType: AssetAreaType.TEXT, specLabel: null, isUserInput: true },
          { displayOrder: 4, areaName: '광고 문구', areaType: AssetAreaType.TEXT, specLabel: null, isUserInput: true },
          { displayOrder: 5, areaName: '랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════
  // NAVER 성과형 네이티브 (M통합 / PC 성과형)
  // ═══════════════════════════════════════════════════
  {
    mediaName: 'Naver 성과형 네이티브',
    mediaAliases: ['네이버 성과형 네이티브', 'Naver Native DA', '네이버 네이티브', 'M통합 네이티브', 'PC 성과형 네이티브'],
    products: [
      {
        name: 'M통합 네이티브 DA',
        aliases: ['M네이티브', 'M통합네이티브', '모바일 네이티브 DA', 'M Native DA'],
        areas: [
          { displayOrder: 1, areaName: '썸네일 이미지', areaType: AssetAreaType.IMAGE, widthPx: 342, heightPx: 228, ratio: '1.5:1', maxFileSizeKb: 130, formats: ['PNG', 'JPG', 'JPEG'], specLabel: '342 × 228 px (1.5:1) / 10KB이상~130KB이하 / PNG-24, JPG, JPEG', isUserInput: false },
          { displayOrder: 2, areaName: '프로필 이미지', areaType: AssetAreaType.IMAGE, widthPx: 300, heightPx: 300, ratio: '1:1', maxFileSizeKb: 200, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '300 × 300 px (1:1) / 200KB이하 / JPG, JPEG, PNG', isUserInput: false },
          // 노란색 행
          { displayOrder: 3, areaName: '메인 카피', areaType: AssetAreaType.TEXT, maxChars: 20, specLabel: '최대 20자', isUserInput: true },
          { displayOrder: 4, areaName: '광고주명', areaType: AssetAreaType.TEXT, maxChars: 14, specLabel: '최대 14자 / 띄어쓰기 포함 (쌍따옴표·따옴표 사용 불가)', isUserInput: true },
          { displayOrder: 5, areaName: '서브 카피 (설명문구 3줄)', areaType: AssetAreaType.TEXT, maxChars: 36, specLabel: '3줄 / 줄당 최대 12자 / 총 36자', isUserInput: true },
          { displayOrder: 6, areaName: '랜딩 버튼', areaType: AssetAreaType.TEXT, specLabel: '15종 중 택1: 더 알아보기 / 지금 예약하기 / 문의하기 / 다운로드 / 지금 구매하기 / 가입하기 / 동영상 더보기 / 지금 신청하기 / 쿠폰 받기 / 지금 렌탈하기 / 지금 구경하기 / 계좌 개설하기 / 내보험료 확인 / 견적 요청하기 / 버튼 없음', isUserInput: true },
          { displayOrder: 7, areaName: '고지문구', areaType: AssetAreaType.TEXT, maxChars: 45, specLabel: '최대 45자 (금융·제약·건강기능식품 업종 필수)', isUserInput: true },
          { displayOrder: 8, areaName: '랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
      {
        name: '네이버 퍼포먼스 네트워크 (M)',
        aliases: ['퍼포먼스 네트워크', 'Naver Performance Network', '네이버 PF 네트워크', 'Naver PF Network'],
        areas: [
          { displayOrder: 1, areaName: '썸네일 이미지', areaType: AssetAreaType.IMAGE, widthPx: 342, heightPx: 228, ratio: '1.5:1', maxFileSizeKb: 130, formats: ['PNG', 'JPG', 'JPEG'], specLabel: '342 × 228 px (1.5:1) / 10KB이상~130KB이하 / PNG-24, JPG, JPEG', isUserInput: false },
          { displayOrder: 2, areaName: '프로필 이미지', areaType: AssetAreaType.IMAGE, widthPx: 300, heightPx: 300, ratio: '1:1', maxFileSizeKb: 200, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '300 × 300 px (1:1) / 200KB이하 / JPG, JPEG, PNG', isUserInput: false },
          // 노란색 행
          { displayOrder: 3, areaName: '메인 카피', areaType: AssetAreaType.TEXT, maxChars: 20, specLabel: '최대 20자', isUserInput: true },
          { displayOrder: 4, areaName: '광고주명', areaType: AssetAreaType.TEXT, maxChars: 14, specLabel: '최대 14자 / 띄어쓰기 포함', isUserInput: true },
          { displayOrder: 5, areaName: '서브 카피 (설명문구)', areaType: AssetAreaType.TEXT, maxChars: 12, specLabel: '1줄 / 최대 12자', isUserInput: true },
          { displayOrder: 6, areaName: '랜딩 버튼', areaType: AssetAreaType.TEXT, specLabel: '15종 중 택1: 더 알아보기 / 지금 예약하기 / 문의하기 / 다운로드 / 지금 구매하기 / 가입하기 / 동영상 더보기 / 지금 신청하기 / 쿠폰 받기 / 지금 렌탈하기 / 지금 구경하기 / 계좌 개설하기 / 내보험료 확인 / 견적 요청하기 / 버튼 없음', isUserInput: true },
          { displayOrder: 7, areaName: '고지문구', areaType: AssetAreaType.TEXT, maxChars: 45, specLabel: '최대 45자 (금융·제약·건강기능식품 업종 필수)', isUserInput: true },
          { displayOrder: 8, areaName: '랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
      {
        name: 'PC 네이티브 검색창하단',
        aliases: ['PC 검색창하단', 'PC Native 검색창하단', 'PC 네이티브 검색창'],
        areas: [
          { displayOrder: 1, areaName: '썸네일 이미지', areaType: AssetAreaType.IMAGE, widthPx: 342, heightPx: 228, ratio: '1.5:1', maxFileSizeKb: 130, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '342 × 228 px (1.5:1) / 10KB이상~130KB이하 / JPG, JPEG, PNG', isUserInput: false },
          { displayOrder: 2, areaName: '프로필 이미지', areaType: AssetAreaType.IMAGE, widthPx: 300, heightPx: 300, ratio: '1:1', maxFileSizeKb: 200, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '300 × 300 px (1:1) / 200KB이하 / JPG, JPEG, PNG', isUserInput: false },
          // 노란색 행
          { displayOrder: 3, areaName: '메인 카피', areaType: AssetAreaType.TEXT, maxChars: 20, specLabel: '최대 20자', isUserInput: true },
          { displayOrder: 4, areaName: '서브 카피 (PC배너형 긴 설명문구)', areaType: AssetAreaType.TEXT, maxChars: 28, specLabel: '최대 28자 (PC배너형 긴 설명문구1 노출)', isUserInput: true },
          { displayOrder: 5, areaName: '광고주명', areaType: AssetAreaType.TEXT, maxChars: 14, specLabel: '최대 14자 / 띄어쓰기 포함', isUserInput: true },
          { displayOrder: 6, areaName: '랜딩 버튼', areaType: AssetAreaType.TEXT, specLabel: '15종 중 택1', isUserInput: true },
          { displayOrder: 7, areaName: '고지문구', areaType: AssetAreaType.TEXT, maxChars: 45, specLabel: '최대 45자', isUserInput: true },
          { displayOrder: 8, areaName: '랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
      {
        name: 'PC 네이티브 로그인창하단',
        aliases: ['PC 로그인창하단', 'PC Native 로그인창하단', 'PC 로그인 네이티브'],
        areas: [
          { displayOrder: 1, areaName: '썸네일 이미지', areaType: AssetAreaType.IMAGE, widthPx: 342, heightPx: 228, ratio: '1.5:1', maxFileSizeKb: 130, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '342 × 228 px (1.5:1) / 10KB이상~130KB이하 / JPG, JPEG, PNG', isUserInput: false },
          { displayOrder: 2, areaName: '프로필 이미지', areaType: AssetAreaType.IMAGE, widthPx: 300, heightPx: 300, ratio: '1:1', maxFileSizeKb: 200, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '300 × 300 px (1:1) / 200KB이하 / JPG, JPEG, PNG', isUserInput: false },
          { displayOrder: 3, areaName: '메인 카피', areaType: AssetAreaType.TEXT, maxChars: 20, specLabel: '최대 20자', isUserInput: true },
          { displayOrder: 4, areaName: '서브 카피 (PC배너형 긴 설명문구)', areaType: AssetAreaType.TEXT, maxChars: 28, specLabel: '최대 28자 (PC배너형 긴 설명문구1 노출)', isUserInput: true },
          { displayOrder: 5, areaName: '광고주명', areaType: AssetAreaType.TEXT, maxChars: 14, specLabel: '최대 14자', isUserInput: true },
          { displayOrder: 6, areaName: '랜딩 버튼', areaType: AssetAreaType.TEXT, specLabel: '15종 중 택1', isUserInput: true },
          { displayOrder: 7, areaName: '고지문구', areaType: AssetAreaType.TEXT, maxChars: 45, specLabel: '최대 45자', isUserInput: true },
          { displayOrder: 8, areaName: '랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
      {
        name: 'PC 주제판 네이티브 가로타입',
        aliases: ['PC 주제판 가로', 'PC Native 주제판 가로', '주제판 가로타입'],
        areas: [
          { displayOrder: 1, areaName: '썸네일 이미지', areaType: AssetAreaType.IMAGE, widthPx: 342, heightPx: 228, ratio: '1.5:1', maxFileSizeKb: 130, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '342 × 228 px (1.5:1) / 10KB이상~130KB이하 / JPG, JPEG, PNG', isUserInput: false },
          { displayOrder: 2, areaName: '프로필 이미지', areaType: AssetAreaType.IMAGE, widthPx: 300, heightPx: 300, ratio: '1:1', maxFileSizeKb: 200, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '300 × 300 px (1:1) / 200KB이하 / JPG, JPEG, PNG', isUserInput: false },
          { displayOrder: 3, areaName: '메인 카피', areaType: AssetAreaType.TEXT, maxChars: 20, specLabel: '최대 20자', isUserInput: true },
          { displayOrder: 4, areaName: '서브 카피 (PC배너형 긴 설명문구)', areaType: AssetAreaType.TEXT, maxChars: 28, specLabel: '최대 28자 (PC배너형 긴 설명문구1 노출)', isUserInput: true },
          { displayOrder: 5, areaName: '광고주명', areaType: AssetAreaType.TEXT, maxChars: 14, specLabel: '최대 14자', isUserInput: true },
          { displayOrder: 6, areaName: '랜딩 버튼', areaType: AssetAreaType.TEXT, specLabel: '15종 중 택1', isUserInput: true },
          { displayOrder: 7, areaName: '고지문구', areaType: AssetAreaType.TEXT, maxChars: 45, specLabel: '최대 45자', isUserInput: true },
          { displayOrder: 8, areaName: '랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
      {
        name: 'PC 주제판 네이티브 세로타입',
        aliases: ['PC 주제판 세로', 'PC Native 주제판 세로', '주제판 세로타입'],
        areas: [
          { displayOrder: 1, areaName: '썸네일 이미지', areaType: AssetAreaType.IMAGE, widthPx: 342, heightPx: 228, ratio: '1.5:1', maxFileSizeKb: 130, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '342 × 228 px (1.5:1) / 10KB이상~130KB이하 / JPG, JPEG, PNG', isUserInput: false },
          { displayOrder: 2, areaName: '프로필 이미지', areaType: AssetAreaType.IMAGE, widthPx: 300, heightPx: 300, ratio: '1:1', maxFileSizeKb: 200, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '300 × 300 px (1:1) / 200KB이하 / JPG, JPEG, PNG', isUserInput: false },
          { displayOrder: 3, areaName: '메인 카피', areaType: AssetAreaType.TEXT, maxChars: 20, specLabel: '최대 20자', isUserInput: true },
          { displayOrder: 4, areaName: '서브 카피 (PC배너형 긴 설명문구)', areaType: AssetAreaType.TEXT, maxChars: 28, specLabel: '최대 28자 (PC배너형 긴 설명문구1 노출)', notes: '랜딩 버튼 없음 (세로타입 특성)', isUserInput: true },
          { displayOrder: 5, areaName: '광고주명', areaType: AssetAreaType.TEXT, maxChars: 14, specLabel: '최대 14자', isUserInput: true },
          { displayOrder: 6, areaName: '고지문구', areaType: AssetAreaType.TEXT, maxChars: 45, specLabel: '최대 45자', isUserInput: true },
          { displayOrder: 7, areaName: '랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
      {
        name: 'PC 네이티브 베이직타입',
        aliases: ['PC 베이직타입', 'PC Native 베이직', 'PC 네이티브 기본형'],
        areas: [
          { displayOrder: 1, areaName: '썸네일 이미지', areaType: AssetAreaType.IMAGE, widthPx: 342, heightPx: 228, ratio: '1.5:1', maxFileSizeKb: 130, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '342 × 228 px (1.5:1) / 10KB이상~130KB이하 / JPG, JPEG, PNG', isUserInput: false },
          { displayOrder: 2, areaName: '프로필 이미지', areaType: AssetAreaType.IMAGE, widthPx: 300, heightPx: 300, ratio: '1:1', maxFileSizeKb: 200, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '300 × 300 px (1:1) / 200KB이하 / JPG, JPEG, PNG', isUserInput: false },
          { displayOrder: 3, areaName: '메인 카피', areaType: AssetAreaType.TEXT, maxChars: 20, specLabel: '최대 20자', isUserInput: true },
          { displayOrder: 4, areaName: '서브 카피 (PC배너형 긴 설명문구)', areaType: AssetAreaType.TEXT, maxChars: 28, specLabel: '최대 28자 (PC배너형 긴 설명문구1 노출)', isUserInput: true },
          { displayOrder: 5, areaName: '광고주명', areaType: AssetAreaType.TEXT, maxChars: 14, specLabel: '최대 14자', isUserInput: true },
          { displayOrder: 6, areaName: '랜딩 버튼', areaType: AssetAreaType.TEXT, specLabel: '15종 중 택1', isUserInput: true },
          { displayOrder: 7, areaName: '고지문구', areaType: AssetAreaType.TEXT, maxChars: 45, specLabel: '최대 45자', isUserInput: true },
          { displayOrder: 8, areaName: '랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
      {
        name: 'PC 네이티브 기사 본문하단',
        aliases: ['PC 기사 본문하단', 'PC Native 기사본문하단', '기사 본문하단 네이티브'],
        areas: [
          { displayOrder: 1, areaName: '썸네일 이미지', areaType: AssetAreaType.IMAGE, widthPx: 342, heightPx: 228, ratio: '1.5:1', maxFileSizeKb: 130, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '342 × 228 px (1.5:1) / 10KB이상~130KB이하 / JPG, JPEG, PNG', isUserInput: false },
          { displayOrder: 2, areaName: '프로필 이미지', areaType: AssetAreaType.IMAGE, widthPx: 300, heightPx: 300, ratio: '1:1', maxFileSizeKb: 130, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '300 × 300 px (1:1) / 10KB이상~130KB이하 / JPG, JPEG, PNG', notes: '기사 본문하단은 프로필 이미지 용량 기준 상이 (200KB 아닌 130KB)', isUserInput: false },
          { displayOrder: 3, areaName: '메인 카피', areaType: AssetAreaType.TEXT, maxChars: 20, specLabel: '최대 20자', isUserInput: true },
          { displayOrder: 4, areaName: '서브 카피 1 (PC배너형 긴 설명문구1)', areaType: AssetAreaType.TEXT, maxChars: 28, specLabel: '최대 28자 (PC배너형 긴 설명문구1)', isUserInput: true },
          { displayOrder: 5, areaName: '서브 카피 2 (PC배너형 긴 설명문구2)', areaType: AssetAreaType.TEXT, maxChars: 28, specLabel: '최대 28자 (PC배너형 긴 설명문구2)', isUserInput: true },
          { displayOrder: 6, areaName: '광고주명', areaType: AssetAreaType.TEXT, maxChars: 14, specLabel: '최대 14자', isUserInput: true },
          { displayOrder: 7, areaName: '랜딩 버튼', areaType: AssetAreaType.TEXT, specLabel: '15종 중 택1', isUserInput: true },
          { displayOrder: 8, areaName: '고지문구', areaType: AssetAreaType.TEXT, maxChars: 45, specLabel: '최대 45자', isUserInput: true },
          { displayOrder: 9, areaName: '랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
      {
        name: '사이드박스',
        aliases: ['사이드박스 DA', 'Sidebar DA', 'PC 사이드박스', 'Sidebox'],
        areas: [
          { displayOrder: 1, areaName: '썸네일 이미지', areaType: AssetAreaType.IMAGE, widthPx: 342, heightPx: 228, ratio: '1.5:1', maxFileSizeKb: 130, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '342 × 228 px (1.5:1) / 10KB이상~130KB이하 / JPG, JPEG, PNG', isUserInput: false },
          { displayOrder: 2, areaName: '프로필 이미지', areaType: AssetAreaType.IMAGE, widthPx: 300, heightPx: 300, ratio: '1:1', maxFileSizeKb: 200, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '300 × 300 px (1:1) / 200KB이하 / JPG, JPEG, PNG', isUserInput: false },
          { displayOrder: 3, areaName: '메인 카피', areaType: AssetAreaType.TEXT, maxChars: 20, specLabel: '최대 20자', isUserInput: true },
          { displayOrder: 4, areaName: '서브 카피 (PC배너형 긴 설명문구)', areaType: AssetAreaType.TEXT, maxChars: 28, specLabel: '최대 28자 (PC배너형 긴 설명문구1 노출)', isUserInput: true },
          { displayOrder: 5, areaName: '광고주명', areaType: AssetAreaType.TEXT, maxChars: 14, specLabel: '최대 14자', isUserInput: true },
          { displayOrder: 6, areaName: '랜딩 버튼', areaType: AssetAreaType.TEXT, specLabel: '15종 중 택1', isUserInput: true },
          { displayOrder: 7, areaName: '고지문구', areaType: AssetAreaType.TEXT, maxChars: 45, specLabel: '최대 45자', isUserInput: true },
          { displayOrder: 8, areaName: '랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════
  // NAVER M 피드 광고
  // ═══════════════════════════════════════════════════
  {
    mediaName: 'Naver M 피드 광고',
    mediaAliases: ['네이버 피드', 'Naver Feed', 'M 피드', '네이버 M 피드', 'Naver M Feed'],
    products: [
      {
        name: 'M 피드 광고 이미지형',
        aliases: ['피드 이미지형', 'Feed Image', 'M Feed Image', '피드광고 이미지'],
        areas: [
          { displayOrder: 1, areaName: '프로필 이미지', areaType: AssetAreaType.IMAGE, widthPx: 300, heightPx: 300, ratio: '1:1', maxFileSizeKb: 200, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '300 × 300 px (1:1) / 200KB이하 / JPG, JPEG, PNG (RGB)', isUserInput: false },
          { displayOrder: 2, areaName: '광고 이미지 (1:1)', areaType: AssetAreaType.IMAGE, widthPx: 1200, heightPx: 1200, ratio: '1:1', maxFileSizeKb: 800, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '1200 × 1200 px (1:1) / 80KB이상~800KB이하 / JPG, JPEG, PNG (RGB)', notes: '1:1 또는 16:9 비율 중 선택', isUserInput: false },
          { displayOrder: 3, areaName: '광고 이미지 (16:9)', areaType: AssetAreaType.IMAGE, widthPx: 1200, heightPx: 628, ratio: '16:9', maxFileSizeKb: 500, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '1200 × 628 px (16:9) / 50KB이상~500KB이하 / JPG, JPEG, PNG (RGB)', notes: '1:1 또는 16:9 비율 중 선택', isUserInput: false },
          // 노란색 행
          { displayOrder: 4, areaName: '프로필 이름', areaType: AssetAreaType.TEXT, maxChars: 19, specLabel: '최대 19글자 (띄어쓰기 포함)', isUserInput: true },
          { displayOrder: 5, areaName: '광고 문구', areaType: AssetAreaType.TEXT, maxChars: 65, specLabel: '최대 65글자 (2줄 노출) / 소재 유형·게재 위치에 따라 일부 말줄임 가능', isUserInput: true },
          { displayOrder: 6, areaName: '행동 유도 버튼', areaType: AssetAreaType.TEXT, specLabel: '더 알아보기 등 레이블 선택 / 버튼없음 선택 시 미노출', isUserInput: true },
          { displayOrder: 7, areaName: '랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
      {
        name: 'M 피드 광고 동영상형',
        aliases: ['피드 동영상형', 'Feed Video', 'M Feed Video', '피드광고 동영상'],
        areas: [
          { displayOrder: 1, areaName: '프로필 이미지', areaType: AssetAreaType.IMAGE, widthPx: 300, heightPx: 300, ratio: '1:1', maxFileSizeKb: 200, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '300 × 300 px (1:1) / 200KB이하 / JPG, JPEG, PNG (RGB)', isUserInput: false },
          { displayOrder: 2, areaName: '광고 동영상', areaType: AssetAreaType.VIDEO, ratio: '1:1 또는 16:9', maxFileSizeKb: 1024 * 1024, formats: ['MP4', 'AVI', 'MOV', 'WMV'], specLabel: '최소 너비 600px이상 / 5초이상~최대 10분 (15~30초 권장) / 1:1 또는 16:9 / 1GB이하 / MP4, AVI, MOV, WMV', isUserInput: false },
          { displayOrder: 3, areaName: '스틸컷 이미지', areaType: AssetAreaType.IMAGE, ratio: '동영상과 동일 비율', maxFileSizeKb: 800, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '동영상과 동일 비율 (1:1 또는 16:9) / 800KB이하 / JPG, JPEG, PNG (RGB)', isUserInput: false },
          // 노란색 행
          { displayOrder: 4, areaName: '프로필 이름', areaType: AssetAreaType.TEXT, maxChars: 19, specLabel: '최대 19글자 (띄어쓰기 포함)', isUserInput: true },
          { displayOrder: 5, areaName: '광고 문구', areaType: AssetAreaType.TEXT, maxChars: 65, specLabel: '최대 65글자 (2줄 노출)', isUserInput: true },
          { displayOrder: 6, areaName: '행동 유도 버튼', areaType: AssetAreaType.TEXT, specLabel: '더 알아보기 등 레이블 선택', isUserInput: true },
          { displayOrder: 7, areaName: '랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
      {
        name: 'M 피드 광고 컬렉션형',
        aliases: ['피드 컬렉션형', 'Feed Collection', 'M Feed Collection', '피드광고 컬렉션'],
        areas: [
          // 공통 등록 소재 (파란색)
          { displayOrder: 1, areaName: '프로필 이미지', areaType: AssetAreaType.IMAGE, widthPx: 300, heightPx: 300, ratio: '1:1', maxFileSizeKb: 200, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '300 × 300 px (1:1) / 200KB이하 / JPG, JPEG, PNG (RGB)', isUserInput: false },
          // 상품별 등록 소재 (파란색)
          { displayOrder: 2, areaName: '광고 이미지 (상품별, 4~10장)', areaType: AssetAreaType.IMAGE, widthPx: 600, heightPx: 600, ratio: '1:1', maxFileSizeKb: 500, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '600 × 600 px (1:1) / 20KB이상~500KB이하 / JPG, JPEG, PNG (RGB) / 최소 4장~최대 10장 등록', isUserInput: false },
          { displayOrder: 3, areaName: '광고 동영상 (상품별, 선택)', areaType: AssetAreaType.VIDEO, ratio: '1:1', maxFileSizeKb: 1024 * 1024, formats: ['MP4', 'AVI', 'MOV', 'WMV'], specLabel: '최소 너비 600px이상 / 5초이상~최대 10분 (15~30초 권장) / 1:1 / 1GB이하 / MP4, AVI, MOV, WMV', notes: '이미지 또는 동영상 선택', isUserInput: false },
          { displayOrder: 4, areaName: '스틸컷 이미지 (동영상용)', areaType: AssetAreaType.IMAGE, ratio: '1:1', maxFileSizeKb: 500, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '최소 너비 600px (1:1) / 500KB이하 / JPG, JPEG, PNG (RGB)', notes: '동영상 사용 시 필수', isUserInput: false },
          // 노란색 행
          { displayOrder: 5, areaName: '프로필 이름', areaType: AssetAreaType.TEXT, maxChars: 19, specLabel: '최대 19글자 (띄어쓰기 포함)', isUserInput: true },
          { displayOrder: 6, areaName: '광고 문구', areaType: AssetAreaType.TEXT, maxChars: 65, specLabel: '최대 65글자', isUserInput: true },
          { displayOrder: 7, areaName: '상품 설명 문구 (상품별)', areaType: AssetAreaType.TEXT, maxChars: 28, specLabel: '상품별 최대 28글자', isUserInput: true },
          { displayOrder: 8, areaName: '상품 랜딩 URL (상품별)', areaType: AssetAreaType.URL, specLabel: '상품 클릭 시 랜딩 URL (상품별)', isUserInput: true },
          { displayOrder: 9, areaName: '행동 유도 버튼', areaType: AssetAreaType.TEXT, specLabel: '더 알아보기 등 레이블 선택', isUserInput: true },
          { displayOrder: 10, areaName: '스토어 랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
      {
        name: 'M 피드 광고 2:3 이미지형',
        aliases: ['피드 2:3 이미지형', 'Feed 2:3 Image', 'M Feed 2:3', '피드 세로형'],
        areas: [
          { displayOrder: 1, areaName: '프로필 이미지', areaType: AssetAreaType.IMAGE, widthPx: 300, heightPx: 300, ratio: '1:1', maxFileSizeKb: 200, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '300 × 300 px (1:1) / 200KB이하 / JPG, JPEG, PNG (RGB)', isUserInput: false },
          { displayOrder: 2, areaName: '광고 이미지 (2:3)', areaType: AssetAreaType.IMAGE, widthPx: 1200, heightPx: 1800, ratio: '2:3', maxFileSizeKb: 1229, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '1200 × 1800 px (2:3) / 100KB이상~1.2MB이하 / JPG, JPEG, PNG (RGB)', isUserInput: false },
          // 노란색 행
          { displayOrder: 3, areaName: '프로필 이름', areaType: AssetAreaType.TEXT, maxChars: 19, specLabel: '최대 19글자 (띄어쓰기 포함)', isUserInput: true },
          { displayOrder: 4, areaName: '광고 문구', areaType: AssetAreaType.TEXT, maxChars: 65, specLabel: '최대 65글자', isUserInput: true },
          { displayOrder: 5, areaName: '행동 유도 버튼', areaType: AssetAreaType.TEXT, specLabel: '더 알아보기 등 레이블 선택', isUserInput: true },
          { displayOrder: 6, areaName: '랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════
  // KAKAO MOBILITY
  // ═══════════════════════════════════════════════════
  {
    mediaName: 'Kakao Mobility',
    mediaAliases: ['카카오모빌리티', 'Kakao Mobility', '카카오T'],
    products: [
      {
        name: '홈 전면 팝업_CTA형',
        aliases: ['전면팝업', '카카오모빌리티 팝업', '홈 전면 팝업'],
        areas: [
          { displayOrder: 1, areaName: '팝업 이미지', areaType: AssetAreaType.IMAGE, widthPx: 624, heightPx: 454, maxFileSizeKb: 200, formats: ['PNG', 'JPG', 'JPEG'], specLabel: '624 × 454 px / PNG, JPG, JPEG / 200kb 이하', notes: '코너 라운드 처리는 시스템에서 구현', isUserInput: false },
          { displayOrder: 2, areaName: '팝업 영상 (3초)', areaType: AssetAreaType.VIDEO, widthPx: 1920, heightPx: 1080, ratio: '16:9', maxDurationSec: 3, maxFileSizeKb: 6 * 1024, formats: ['MP4'], specLabel: '1920 x 1080 px / mp4 / 6mb 이하 / h.264 / 29.97fps / 3초 이하 / 음소거', notes: '음소거 상태로 재생', isUserInput: false },
          { displayOrder: 3, areaName: 'CTA 버튼 (최대 2개)', areaType: AssetAreaType.TEXT, specLabel: null, isUserInput: true },
          { displayOrder: 4, areaName: '프로필 이름', areaType: AssetAreaType.TEXT, maxChars: 19, specLabel: '최대 19자, 띄어쓰기 포함', isUserInput: true },
          { displayOrder: 5, areaName: '랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
      {
        name: '스플래시_동영상형',
        aliases: ['스플래시', '카카오T 스플래시', '스플래시 동영상'],
        areas: [
          { displayOrder: 1, areaName: '로고 이미지', areaType: AssetAreaType.IMAGE, widthPx: 840, heightPx: 306, maxFileSizeKb: 210, formats: ['PNG'], isTransparentBg: true, specLabel: '840 x 306 px / 투명 PNG 1종 / 중앙정렬 / 210kb 이하', isUserInput: false },
          { displayOrder: 2, areaName: '영상', areaType: AssetAreaType.VIDEO, widthPx: 1920, heightPx: 1080, ratio: '16:9', maxDurationSec: 3, maxFileSizeKb: 6 * 1024, formats: ['MP4'], specLabel: '1920 x 1080 px / mp4 / 6mb 이하 / h.264 / 29.97fps / 3초 이하 / 음소거', isUserInput: false },
          { displayOrder: 3, areaName: '배경 색상값', areaType: AssetAreaType.COLOR, specLabel: 'HEX 코드 (화이트 #FFFFFF 불가)', isUserInput: true },
          { displayOrder: 4, areaName: '프로필 이름', areaType: AssetAreaType.TEXT, maxChars: 19, specLabel: '최대 19자, 띄어쓰기 포함', isUserInput: true },
        ],
      },
      {
        name: '택시 호출중 배너_동영상형',
        aliases: ['택시 호출중 배너', '택시배너 동영상'],
        areas: [
          { displayOrder: 1, areaName: '영상', areaType: AssetAreaType.VIDEO, widthPx: 1200, heightPx: 676, maxDurationSec: 6, maxFileSizeKb: 6 * 1024, formats: ['MP4'], specLabel: '1200 x 676 px / mp4 / 6mb 이하 / h.264 / 29.97fps / 6초 / 음소거', isUserInput: false },
          { displayOrder: 2, areaName: '랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
      {
        name: '택시 핀테마',
        aliases: ['핀테마', '카카오T 핀테마'],
        areas: [
          { displayOrder: 1, areaName: '승객핀', areaType: AssetAreaType.IMAGE, widthPx: 120, heightPx: 120, maxFileSizeKb: 20, formats: ['PNG'], isTransparentBg: true, specLabel: '120 × 120 px / 투명 PNG / 20kb 이하', isUserInput: false },
          { displayOrder: 2, areaName: '기사핀', areaType: AssetAreaType.IMAGE, widthPx: 120, heightPx: 120, maxFileSizeKb: 20, formats: ['PNG'], isTransparentBg: true, specLabel: '120 × 120 px / 투명 PNG / 20kb 이하', isUserInput: false },
          { displayOrder: 3, areaName: '배너 이미지 (오브젝트 우측형)', areaType: AssetAreaType.IMAGE, widthPx: 1029, heightPx: 258, maxFileSizeKb: 300, formats: ['PNG'], isTransparentBg: true, specLabel: '1029 × 258 px / 투명 PNG / 300kb 이하', isUserInput: false },
          { displayOrder: 4, areaName: '배너 배경 색상값', areaType: AssetAreaType.COLOR, specLabel: 'HEX 코드 (화이트 #FFFFFF 불가)', isUserInput: true },
          { displayOrder: 5, areaName: '배너 랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
      {
        name: '택시 탑승중 배너',
        aliases: ['탑승중 배너', '카카오T 탑승중'],
        areas: [
          { displayOrder: 1, areaName: '배너 이미지 (우측형)', areaType: AssetAreaType.IMAGE, widthPx: 1029, heightPx: 258, maxFileSizeKb: 300, formats: ['PNG'], isTransparentBg: true, specLabel: '1029 × 258 px / 투명 PNG / 300kb 이하', isUserInput: false },
          { displayOrder: 2, areaName: '배너 배경 색상값', areaType: AssetAreaType.COLOR, specLabel: 'HEX 코드 (화이트 #FFFFFF 불가)', isUserInput: true },
          { displayOrder: 3, areaName: '랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
      {
        name: '버티컬 팝업 배너',
        aliases: ['버티컬팝업', '카카오T 버티컬'],
        areas: [
          { displayOrder: 1, areaName: '배너 이미지', areaType: AssetAreaType.IMAGE, widthPx: 544, heightPx: 552, maxFileSizeKb: 300, formats: ['PNG'], specLabel: '544 × 552 px / PNG / 300kb 이하', notes: '코너 라운드 처리는 시스템에서 구현', isUserInput: false },
          { displayOrder: 2, areaName: '친구 공유 메시지 텍스트', areaType: AssetAreaType.TEXT, maxChars: 30, specLabel: '최대 30자', isUserInput: true },
          { displayOrder: 3, areaName: '랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
      {
        name: '대리 호출중 배너_동영상형',
        aliases: ['대리배너', '카카오T 대리', '대리 호출중 배너'],
        areas: [
          { displayOrder: 1, areaName: '영상', areaType: AssetAreaType.VIDEO, widthPx: 1200, heightPx: 600, maxDurationSec: 6, maxFileSizeKb: 6 * 1024, formats: ['MP4'], specLabel: '1200 x 600 px / mp4 / 6mb 이하 / h.264 / 29.97fps / 6초 / 음소거', isUserInput: false },
          { displayOrder: 2, areaName: '배경 색상값', areaType: AssetAreaType.COLOR, specLabel: 'HEX 코드 (화이트 #FFFFFF 불가)', isUserInput: true },
        ],
      },
      {
        name: '대리 핀테마',
        aliases: ['대리핀테마', '카카오T 대리핀테마', '대리 핀'],
        areas: [
          { displayOrder: 1, areaName: '승객핀', areaType: AssetAreaType.IMAGE, widthPx: 120, heightPx: 120, maxFileSizeKb: 20, formats: ['PNG'], isTransparentBg: true, specLabel: '120 × 120 px / 투명 PNG / 20kb 이하', isUserInput: false },
          { displayOrder: 2, areaName: '기사핀', areaType: AssetAreaType.IMAGE, widthPx: 120, heightPx: 120, maxFileSizeKb: 20, formats: ['PNG'], isTransparentBg: true, specLabel: '120 × 120 px / 투명 PNG / 20kb 이하', isUserInput: false },
          { displayOrder: 3, areaName: '배너 이미지 (오브젝트 우측형)', areaType: AssetAreaType.IMAGE, widthPx: 1029, heightPx: 258, maxFileSizeKb: 300, formats: ['PNG'], isTransparentBg: true, specLabel: '1029 × 258 px / 투명 PNG / 300kb 이하', isUserInput: false },
          { displayOrder: 4, areaName: '배너 배경 색상값', areaType: AssetAreaType.COLOR, specLabel: 'HEX 코드 (화이트 #FFFFFF 불가)', isUserInput: true },
          { displayOrder: 5, areaName: '배너 랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════
  // KAKAOMOMENT (카카오 비즈보드 / 디스플레이)
  // ═══════════════════════════════════════════════════
  {
    mediaName: 'Kakaomoment',
    mediaAliases: ['카카오모먼트', 'Kakao', '카카오', 'Kakaomoment'],
    products: [
      {
        name: 'Bizboard_Traffic_Image',
        aliases: ['비즈보드 이미지', 'Kakao Bizboard', '카카오비즈보드'],
        areas: [
          { displayOrder: 1, areaName: '배너 이미지 (썸네일 - 박스형)', areaType: AssetAreaType.IMAGE, widthPx: 1029, heightPx: 258, maxFileSizeKb: 300, formats: ['PNG'], isTransparentBg: true, specLabel: '1029 x 258 px / PNG-24, PNG-32 / 300KB 이하 / 배경 투명', isUserInput: false },
          { displayOrder: 2, areaName: '행동유도버튼', areaType: AssetAreaType.TEXT, specLabel: null, isUserInput: true },
          { displayOrder: 3, areaName: '랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
      {
        name: 'Bizboard_Traffic_Expandable',
        aliases: ['비즈보드 익스펜더블', 'Bizboard Expandable', 'KAKAO Bizboard Expandable'],
        areas: [
          { displayOrder: 1, areaName: '배너 이미지 (썸네일 - 박스형)', areaType: AssetAreaType.IMAGE, widthPx: 1029, heightPx: 258, maxFileSizeKb: 300, formats: ['PNG'], isTransparentBg: true, specLabel: '1029 x 258 px / PNG-24, PNG-32 / 300KB 이하 / 배경 투명', isUserInput: false },
          { displayOrder: 2, areaName: '익스펜더블 동영상', areaType: AssetAreaType.VIDEO, widthPx: 1280, heightPx: 720, ratio: '16:9', maxFileSizeKb: 1024 * 1024, formats: ['AVI', 'FLV', 'MP4'], specLabel: '1280x720 px 이상 / 16:9 / AVI, FLV, MP4 / 1GB 미만', isUserInput: false },
          { displayOrder: 3, areaName: '썸네일', areaType: AssetAreaType.IMAGE, widthPx: 1280, heightPx: 720, maxFileSizeKb: 500, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '1280 * 720 px / JPG, JPEG, PNG / 500KB 이하', isUserInput: false },
          { displayOrder: 4, areaName: '행동유도버튼', areaType: AssetAreaType.TEXT, specLabel: null, isUserInput: true },
          { displayOrder: 5, areaName: '랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
      {
        name: 'Display_Traffic_Image',
        aliases: ['카카오 디스플레이 이미지', 'Kakao Display Image'],
        areas: [
          { displayOrder: 1, areaName: '프로필 이미지', areaType: AssetAreaType.IMAGE, widthPx: 300, heightPx: 300, ratio: '1:1', maxFileSizeKb: 500, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '300x300 px 이상 (1:1) / 500KB / JPG, JPEG, PNG', isUserInput: false },
          { displayOrder: 2, areaName: '홍보 이미지 (2:1)', areaType: AssetAreaType.IMAGE, widthPx: 1200, heightPx: 600, ratio: '2:1', maxFileSizeKb: 500, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '1200x600 이상 (2:1) / 500KB / JPG, JPEG, PNG / 세이프존 준수', isUserInput: false },
          { displayOrder: 3, areaName: '프로필 이름', areaType: AssetAreaType.TEXT, specLabel: null, isUserInput: true },
          { displayOrder: 4, areaName: '타이틀', areaType: AssetAreaType.TEXT, maxChars: 25, specLabel: '최대 25자', isUserInput: true },
          { displayOrder: 5, areaName: '홍보문구', areaType: AssetAreaType.TEXT, maxChars: 45, specLabel: '최대 45자', isUserInput: true },
          { displayOrder: 6, areaName: '행동유도문구', areaType: AssetAreaType.TEXT, specLabel: null, isUserInput: true },
          { displayOrder: 7, areaName: '행동유도문구 색상', areaType: AssetAreaType.COLOR, specLabel: null, isUserInput: true },
          { displayOrder: 8, areaName: '랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
      {
        name: 'Display_Video',
        aliases: ['카카오 디스플레이 동영상', 'Kakao Display Video', 'KAKAO Video'],
        areas: [
          { displayOrder: 1, areaName: '홍보 동영상 (16:9)', areaType: AssetAreaType.VIDEO, widthPx: 1280, heightPx: 720, ratio: '16:9', maxFileSizeKb: 1024 * 1024, formats: ['AVI', 'FLV', 'MP4'], specLabel: '1280x720 px 이상 (16:9) / 1GB / 3초 이상 / AVI, FLV, MP4', isUserInput: false },
          { displayOrder: 2, areaName: '맞춤 썸네일', areaType: AssetAreaType.IMAGE, widthPx: 1280, heightPx: 720, ratio: '16:9', maxFileSizeKb: 500, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '1280x720 px 이상 (16:9) / 500KB / JPG, JPEG, PNG', isUserInput: false },
          { displayOrder: 3, areaName: '프로필 이미지', areaType: AssetAreaType.IMAGE, widthPx: 300, heightPx: 300, ratio: '1:1', maxFileSizeKb: 500, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '300x300 px 이상 (1:1) / 500KB / JPG, JPEG, PNG', isUserInput: false },
          { displayOrder: 4, areaName: '프로필 이름', areaType: AssetAreaType.TEXT, specLabel: null, isUserInput: true },
          { displayOrder: 5, areaName: '타이틀', areaType: AssetAreaType.TEXT, maxChars: 25, specLabel: '최대 25자', isUserInput: true },
          { displayOrder: 6, areaName: '홍보문구', areaType: AssetAreaType.TEXT, maxChars: 45, specLabel: '최대 45자', isUserInput: true },
          { displayOrder: 7, areaName: '행동유도문구', areaType: AssetAreaType.TEXT, specLabel: null, isUserInput: true },
          { displayOrder: 8, areaName: '랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════
  // KAKAO PAY
  // ═══════════════════════════════════════════════════
  {
    mediaName: 'Kakao Pay',
    mediaAliases: ['카카오페이', 'Kakaopay', '카카오 페이'],
    products: [
      {
        name: 'App Push',
        aliases: ['카카오페이 앱푸시', '카카오페이 App Push'],
        areas: [
          { displayOrder: 1, areaName: '키 비주얼 이미지', areaType: AssetAreaType.IMAGE, widthPx: 750, heightPx: 1624, maxFileSizeKb: 1024, formats: ['JPG', 'PNG'], specLabel: '750 x 1624px (세로 1624px 이상 권장) / JPG 또는 PNG / 전체 1MB', isUserInput: false },
          { displayOrder: 2, areaName: '버튼 텍스트', areaType: AssetAreaType.TEXT, maxChars: 12, specLabel: '최대 12자', isUserInput: true },
          { displayOrder: 3, areaName: '버튼 텍스트 컬러', areaType: AssetAreaType.COLOR, specLabel: 'HEX 코드', isUserInput: true },
          { displayOrder: 4, areaName: '버튼 컬러', areaType: AssetAreaType.COLOR, specLabel: 'HEX 코드', isUserInput: true },
          { displayOrder: 5, areaName: '버튼영역 배경 컬러', areaType: AssetAreaType.COLOR, specLabel: 'HEX 코드', isUserInput: true },
          { displayOrder: 6, areaName: '메인 카피', areaType: AssetAreaType.TEXT, maxChars: 20, specLabel: '최대 20자', isUserInput: true },
          { displayOrder: 7, areaName: '서브 카피', areaType: AssetAreaType.TEXT, maxChars: 25, specLabel: '최대 25자 / 최대 2줄 / 앞단에 (광고) 표기 필수', isUserInput: true },
          { displayOrder: 8, areaName: '랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════
  // TOSS
  // ═══════════════════════════════════════════════════
  {
    mediaName: 'Toss',
    mediaAliases: ['토스', 'toss'],
    products: [
      {
        name: 'Money Alerts (머니알림)',
        aliases: ['토스 머니알림', '머니알림', 'Toss Money Alerts'],
        areas: [
          { displayOrder: 1, areaName: '이벤트 이미지', areaType: AssetAreaType.IMAGE, widthPx: 1500, heightPx: 760, formats: ['JPG', 'PNG'], specLabel: '1500 * 760 px / JPG, PNG', notes: '가독성 위해 이미지 내 텍스트 최소화, 브랜드 로고는 상단 좌/우측 배치', isUserInput: false },
          { displayOrder: 2, areaName: '이벤트 메인 타이틀', areaType: AssetAreaType.TEXT, maxChars: 18, specLabel: '한 행당 최대 18자, 최소 2행 최대 3행 / \'~해요\'체 문장형', isUserInput: true },
          { displayOrder: 3, areaName: '혜택 리스트 (2줄형)', areaType: AssetAreaType.TEXT, maxChars: 20, specLabel: '혜택 조건: 공백포함 20자 / 혜택 내용: 18자 / 최대 6개', isUserInput: true },
          { displayOrder: 4, areaName: 'CTA 문구', areaType: AssetAreaType.TEXT, maxChars: 6, specLabel: '공백 포함 최대 6자', isUserInput: true },
          { displayOrder: 5, areaName: '랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
      {
        name: 'Display Image',
        aliases: ['토스 디스플레이', '토스 이미지', 'Toss Display'],
        areas: [
          { displayOrder: 1, areaName: '브랜드 로고', areaType: AssetAreaType.IMAGE, widthPx: 800, heightPx: 800, ratio: '1:1', maxFileSizeKb: 10240, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '1:1 비율 / 800*800px 이상 / 배경 있는 이미지 (누끼 불가)', notes: '안전 노출 영역 여백 가이드는 PSD 파일 참조', isUserInput: false },
          { displayOrder: 2, areaName: '정사각형 배너 이미지', areaType: AssetAreaType.IMAGE, widthPx: 1080, heightPx: 1080, ratio: '1:1', maxFileSizeKb: 10240, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '1:1 비율 / 1080*1080px 이상 / 10mb 이하', isUserInput: false },
          { displayOrder: 3, areaName: '세로형 배너 이미지', areaType: AssetAreaType.IMAGE, widthPx: 1080, heightPx: 1920, ratio: '9:16', maxFileSizeKb: 10240, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '9:16 비율 / 1080*1920px 이상 / 10mb 이하', isUserInput: false },
          { displayOrder: 4, areaName: '가로형 배너 이미지', areaType: AssetAreaType.IMAGE, widthPx: 1200, heightPx: 628, ratio: '16:9', maxFileSizeKb: 10240, formats: ['JPG', 'JPEG', 'PNG'], specLabel: '16:9 비율 / 1200*628px 이상 / 10mb 이하', isUserInput: false },
          { displayOrder: 5, areaName: '브랜드 명', areaType: AssetAreaType.TEXT, specLabel: null, isUserInput: true },
          { displayOrder: 6, areaName: '주요 텍스트', areaType: AssetAreaType.TEXT, maxChars: 28, specLabel: '최대 28자', isUserInput: true },
          { displayOrder: 7, areaName: '보조 텍스트', areaType: AssetAreaType.TEXT, maxChars: 18, specLabel: '최대 18자', isUserInput: true },
          { displayOrder: 8, areaName: 'CTA 문구', areaType: AssetAreaType.TEXT, specLabel: null, isUserInput: true },
          { displayOrder: 9, areaName: '랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════
  // TEADS
  // ═══════════════════════════════════════════════════
  {
    mediaName: 'Teads',
    mediaAliases: ['teads', 'Teads'],
    products: [
      {
        name: 'Teads Square Video',
        aliases: ['Teads 스퀘어 비디오', 'Square Video', 'Teads_Square Video'],
        areas: [
          { displayOrder: 1, areaName: '동영상', areaType: AssetAreaType.VIDEO, widthPx: 720, heightPx: 720, ratio: '1:1', maxDurationSec: 30, maxFileSizeKb: 50 * 1024, formats: ['MP4'], specLabel: '1:1 / 720x720px / 최대 30초 / 최대 50MB / .mp4', isUserInput: false },
          { displayOrder: 2, areaName: '로고', areaType: AssetAreaType.IMAGE, widthPx: 320, heightPx: 90, formats: ['PNG'], specLabel: '최대 320x90px / PNG', isUserInput: false },
          { displayOrder: 3, areaName: 'CTA 문구', areaType: AssetAreaType.TEXT, specLabel: null, isUserInput: true },
          { displayOrder: 4, areaName: '랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
      {
        name: 'Teads Performance Video',
        aliases: ['Teads 퍼포먼스 비디오', 'Performance Video'],
        areas: [
          { displayOrder: 1, areaName: '동영상', areaType: AssetAreaType.VIDEO, ratio: '16:9', maxDurationSec: 30, maxFileSizeKb: 50 * 1024, formats: ['MP4'], specLabel: '16:9 / 최대 30초 / 최대 50MB / .mp4', isUserInput: false },
          { displayOrder: 2, areaName: '브랜드 로고', areaType: AssetAreaType.IMAGE, widthPx: 170, heightPx: 170, formats: ['PNG'], specLabel: '170*170px / png', isUserInput: false },
          { displayOrder: 3, areaName: '브랜드명', areaType: AssetAreaType.TEXT, maxChars: 12, specLabel: '국문 최대 12자 (영문 최대 25자)', isUserInput: true },
          { displayOrder: 4, areaName: '헤드라인', areaType: AssetAreaType.TEXT, maxChars: 25, specLabel: '국문 최대 25자 (영문 최대 50자)', isUserInput: true },
          { displayOrder: 5, areaName: '설명', areaType: AssetAreaType.TEXT, maxChars: 70, specLabel: '최대 70자', isUserInput: true },
          { displayOrder: 6, areaName: 'CTA', areaType: AssetAreaType.TEXT, specLabel: null, isUserInput: true },
          { displayOrder: 7, areaName: '랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
      {
        name: 'Teads Square Display',
        aliases: ['Teads 스퀘어 디스플레이', 'Square Display'],
        areas: [
          { displayOrder: 1, areaName: '이미지', areaType: AssetAreaType.IMAGE, widthPx: 540, heightPx: 540, ratio: '1:1', maxFileSizeKb: 200, formats: ['JPG', 'PNG'], specLabel: '540x540 px (1:1) / jpg, png / 최대 200KB', isUserInput: false },
          { displayOrder: 2, areaName: '로고 이미지', areaType: AssetAreaType.IMAGE, widthPx: 320, heightPx: 90, formats: ['PNG'], specLabel: '320x90 px / png', isUserInput: false },
          { displayOrder: 3, areaName: 'CTA', areaType: AssetAreaType.TEXT, specLabel: null, isUserInput: true },
          { displayOrder: 4, areaName: '랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
      {
        name: 'Teads Performance Display',
        aliases: ['Teads 퍼포먼스 디스플레이', 'Performance Display'],
        areas: [
          { displayOrder: 1, areaName: '이미지', areaType: AssetAreaType.IMAGE, widthPx: 1200, heightPx: 627, ratio: '16:9', maxFileSizeKb: 200, formats: ['JPG', 'PNG'], specLabel: '최소 1200x627px / 16:9 / 최대 200KB / jpg, png', isUserInput: false },
          { displayOrder: 2, areaName: '브랜드 로고', areaType: AssetAreaType.IMAGE, widthPx: 170, heightPx: 170, formats: ['PNG'], specLabel: '170*170 px / png', isUserInput: false },
          { displayOrder: 3, areaName: '브랜드명', areaType: AssetAreaType.TEXT, maxChars: 12, specLabel: '국문 최대 12자 (영문 최대 25자)', isUserInput: true },
          { displayOrder: 4, areaName: '헤드라인', areaType: AssetAreaType.TEXT, maxChars: 25, specLabel: '국문 최대 25자 (영문 최대 50자)', isUserInput: true },
          { displayOrder: 5, areaName: '설명', areaType: AssetAreaType.TEXT, maxChars: 70, specLabel: '최대 70자', isUserInput: true },
          { displayOrder: 6, areaName: 'CTA', areaType: AssetAreaType.TEXT, specLabel: null, isUserInput: true },
          { displayOrder: 7, areaName: '랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════
  // META
  // ═══════════════════════════════════════════════════
  {
    mediaName: 'Meta',
    mediaAliases: ['메타', 'Facebook', 'Instagram', 'FB', 'IG', 'Meta'],
    products: [
      {
        name: 'Traffic & Reach — Video (Feed FB/IG)',
        aliases: ['메타 피드 동영상', 'Meta Feed Video', 'FBIG Feed Video', 'FB IG Feed'],
        areas: [
          { displayOrder: 1, areaName: '동영상 (1:1 FB Feed)', areaType: AssetAreaType.VIDEO, widthPx: 1440, heightPx: 1440, ratio: '1:1', maxFileSizeKb: 4 * 1024 * 1024, formats: ['MP4', 'MOV', 'GIF'], specLabel: '1:1 / 1440x1440px / MP4, MOV, GIF', notes: 'H.264 / 정사각형 픽셀 / 고정 프레임속도 / 128kbps 스테레오 AAC', isUserInput: false },
          { displayOrder: 2, areaName: '동영상 (9:16 IG Feed)', areaType: AssetAreaType.VIDEO, widthPx: 1080, heightPx: 1920, ratio: '9:16', maxFileSizeKb: 4 * 1024 * 1024, formats: ['MP4', 'MOV', 'GIF'], specLabel: '9:16 / 1080x1920px 이상 / MP4, MOV, GIF', isUserInput: false },
          { displayOrder: 3, areaName: '광고 제목', areaType: AssetAreaType.TEXT, specLabel: null, isUserInput: true },
          { displayOrder: 4, areaName: '기본 문구', areaType: AssetAreaType.TEXT, specLabel: null, isUserInput: true },
          { displayOrder: 5, areaName: '랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
      {
        name: 'Traffic & Reach — Video (Story/Reels FB/IG)',
        aliases: ['메타 스토리 동영상', 'Meta Story Video', 'FBIG Story Reels', 'Meta Reels'],
        areas: [
          { displayOrder: 1, areaName: '동영상 (9:16 Story/Reels)', areaType: AssetAreaType.VIDEO, widthPx: 1440, heightPx: 2560, ratio: '9:16', maxFileSizeKb: 4 * 1024 * 1024, formats: ['MP4', 'MOV', 'GIF'], specLabel: '9:16 / 1440x2560px 이상 / MP4, MOV, GIF', notes: '상단 14%, 하단 20% 안전영역 준수', isUserInput: false },
          { displayOrder: 2, areaName: '광고 제목', areaType: AssetAreaType.TEXT, specLabel: null, isUserInput: true },
          { displayOrder: 3, areaName: '기본 문구', areaType: AssetAreaType.TEXT, specLabel: null, isUserInput: true },
          { displayOrder: 4, areaName: '랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
      {
        name: 'Traffic & Reach & Engagement — Image (Feed FB/IG)',
        aliases: ['메타 피드 이미지', 'Meta Feed Image', 'FBIG Feed Image', 'Meta DA 이미지'],
        areas: [
          { displayOrder: 1, areaName: '이미지 (4:5 FB/IG Feed)', areaType: AssetAreaType.IMAGE, widthPx: 1440, heightPx: 1800, ratio: '4:5', maxFileSizeKb: 30 * 1024, formats: ['JPG', 'PNG'], specLabel: '4:5 / 1440x1800px 이상 / 최대 30MB / JPG, PNG', isUserInput: false },
          { displayOrder: 2, areaName: '광고 제목', areaType: AssetAreaType.TEXT, specLabel: null, isUserInput: true },
          { displayOrder: 3, areaName: '기본 문구', areaType: AssetAreaType.TEXT, specLabel: null, isUserInput: true },
          { displayOrder: 4, areaName: '랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
      {
        name: 'Traffic & Reach & Engagement — Image (Story FB/IG)',
        aliases: ['메타 스토리 이미지', 'Meta Story Image', 'FBIG Story Image'],
        areas: [
          { displayOrder: 1, areaName: '이미지 (9:16 Story)', areaType: AssetAreaType.IMAGE, widthPx: 1440, heightPx: 2560, ratio: '9:16', maxFileSizeKb: 30 * 1024, formats: ['JPG', 'PNG'], specLabel: '9:16 / 1440x2560px 이상 / 최대 30MB / JPG, PNG', notes: '상단 14%, 하단 20% 안전영역: 텍스트/로고 배치 금지', isUserInput: false },
          { displayOrder: 2, areaName: '광고 제목', areaType: AssetAreaType.TEXT, specLabel: null, isUserInput: true },
          { displayOrder: 3, areaName: '기본 문구', areaType: AssetAreaType.TEXT, specLabel: null, isUserInput: true },
          { displayOrder: 4, areaName: '랜딩 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════
  // YOUTUBE
  // ═══════════════════════════════════════════════════
  {
    mediaName: 'YouTube',
    mediaAliases: ['유튜브', 'Youtube', 'YouTube'],
    products: [
      {
        name: 'VRC 2.0',
        aliases: ['유튜브 VRC', 'Youtube VRC 2.0', 'YouTube VRC'],
        areas: [
          { displayOrder: 1, areaName: '동영상 소재 — 세로형', areaType: AssetAreaType.VIDEO, ratio: '9:16', specLabel: '세로형 (9:16) / 유튜브 채널 업로드 필요', notes: '공개 또는 일부공개 / 삽입 허용 설정 필수', isUserInput: false },
          { displayOrder: 2, areaName: '동영상 소재 — 가로형', areaType: AssetAreaType.VIDEO, ratio: '16:9', specLabel: '가로형 (16:9) / 유튜브 채널 업로드 필요', isUserInput: false },
          { displayOrder: 3, areaName: '동영상 URL', areaType: AssetAreaType.URL, specLabel: '광고주 유튜브 채널에 업로드 후 URL 전달', isUserInput: true },
          { displayOrder: 4, areaName: '최종 도착 URL', areaType: AssetAreaType.URL, specLabel: null, isUserInput: true },
          { displayOrder: 5, areaName: '클릭 유도문안', areaType: AssetAreaType.TEXT, maxChars: 5, specLabel: '1줄 / 한글 5자', isUserInput: true },
          { displayOrder: 6, areaName: '광고 제목', areaType: AssetAreaType.TEXT, maxChars: 15, specLabel: '1줄 / 한글 15자', isUserInput: true },
          { displayOrder: 7, areaName: '긴 광고 제목', areaType: AssetAreaType.TEXT, maxChars: 45, specLabel: '한글 45자', isUserInput: true },
          { displayOrder: 8, areaName: '설명 문구', areaType: AssetAreaType.TEXT, maxChars: 45, specLabel: '한글 45자', isUserInput: true },
        ],
      },
    ],
  },
];

// ─────────────────────────────────────────────
// Seed 실행
// ─────────────────────────────────────────────
async function main() {
  console.log('🌱 마스터 스펙 시드 시작...');

  for (const mediaData of MEDIA_DATA) {
    const media = await prisma.media.upsert({
      where: { name: mediaData.mediaName },
      update: { aliases: mediaData.mediaAliases },
      create: { name: mediaData.mediaName, aliases: mediaData.mediaAliases },
    });
    console.log(`✓ 매체: ${media.name}`);

    for (const productData of mediaData.products) {
      const product = await prisma.mediaProduct.upsert({
        where: { mediaId_name: { mediaId: media.id, name: productData.name } },
        update: { aliases: productData.aliases },
        create: { mediaId: media.id, name: productData.name, aliases: productData.aliases },
      });
      console.log(`  ✓ 상품: ${product.name} (영역 ${productData.areas.length}개)`);

      // 기존 영역 삭제 후 재생성 (순서 변경 대응)
      await prisma.assetArea.deleteMany({ where: { productId: product.id } });

      for (const area of productData.areas) {
        await prisma.assetArea.create({
          data: {
            productId: product.id,
            displayOrder: area.displayOrder,
            areaName: area.areaName,
            areaType: area.areaType,
            widthPx: (area as any).widthPx ?? null,
            heightPx: (area as any).heightPx ?? null,
            ratio: (area as any).ratio ?? null,
            maxFileSizeKb: (area as any).maxFileSizeKb ?? null,
            formats: (area as any).formats ?? [],
            maxDurationSec: (area as any).maxDurationSec ?? null,
            maxChars: (area as any).maxChars ?? null,
            isTransparentBg: (area as any).isTransparentBg ?? false,
            needsDarkMode: (area as any).needsDarkMode ?? false,
            specLabel: (area as any).specLabel ?? null,
            notes: (area as any).notes ?? null,
            isUserInput: area.isUserInput,
          },
        });
      }
    }
  }

  console.log('\n✅ 시드 완료!');
  console.log(`   총 매체: ${MEDIA_DATA.length}개`);
  console.log(`   총 상품: ${MEDIA_DATA.reduce((s, m) => s + m.products.length, 0)}개`);
  console.log(`   총 소재 영역: ${MEDIA_DATA.reduce((s, m) => s + m.products.reduce((ps, p) => ps + p.areas.length, 0), 0)}개`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

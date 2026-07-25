import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { NextConfig } from 'next';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const nextConfig: NextConfig = {
  // 워크스페이스 패키지는 TS 소스 그대로 참조한다(빌드 단계를 하나 줄이기 위해).
  // Next가 직접 트랜스파일하도록 명시해야 한다.
  transpilePackages: ['@tattoo/ui', '@tattoo/api-client', '@tattoo/contract'],

  // 파일 추적 루트를 리포지토리 루트로 올린다. apps/web 기준으로 두면
  // standalone 출력에서 packages/*가 빠져 런타임에 모듈을 못 찾는다.
  outputFileTracingRoot: repoRoot,

  typescript: {
    // 타입 오류를 빌드 실패로 취급한다. 기본값이지만 의도를 명시해 둔다.
    ignoreBuildErrors: false,
  },

  // Next 16에서 `eslint` 설정 키가 제거됐다. 린트는 별도 스크립트(pnpm lint)로 돌린다.
};

export default nextConfig;

import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

/**
 * eslint-config-next 16은 플랫 설정 배열(Linter.Config[])을 그대로 내보낸다.
 * FlatCompat으로 감싸면 순환 참조(Converting circular structure to JSON) 오류가 난다.
 *
 * core-web-vitals가 내부에서 base(index)를 포함하므로 따로 넣지 않는다.
 */
const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'],
  },
];

export default config;

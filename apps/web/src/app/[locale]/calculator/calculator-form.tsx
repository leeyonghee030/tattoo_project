'use client';

import type { CalculatorConfig } from '@tattoo/api-client';
import { Button, OptionItem, OptionList, StickyCta } from '@tattoo/ui';
import { RotateCcw } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { formatCurrency, getDictionary, type Locale } from '@/lib/i18n';

/**
 * 미니타투 계산기.
 *
 * 금액을 하단 고정 바에 계속 띄운다. 항목을 고를 때마다 숫자가 바뀌는 게 보여야
 * "무엇이 금액을 올리는지" 사용자가 스스로 파악한다. 결과를 맨 아래에만 두면
 * 스크롤해서 확인하고 다시 올라와야 해서 그 연결이 끊긴다.
 */
export function CalculatorForm({ locale, config }: { locale: Locale; config: CalculatorConfig }) {
  const dict = getDictionary(locale);

  // 항목 id → 선택한 옵션 id
  const [selected, setSelected] = React.useState<Record<number, number>>({});

  const total = React.useMemo(() => {
    return config.items.reduce((sum, item) => {
      const optionId = selected[item.id];
      if (optionId === undefined) return sum;
      const option = item.options.find((candidate) => candidate.id === optionId);
      return sum + (option?.amount ?? 0);
    }, config.baseAmount);
  }, [config, selected]);

  const allChosen = config.items.every((item) => selected[item.id] !== undefined);
  const hasAnyChoice = Object.keys(selected).length > 0;

  return (
    <div className="pb-cta">
      <div className="space-y-9">
        {config.items.map((item) => (
          <section key={item.id}>
            <h2 className="text-fg mb-3 text-sm font-semibold">{item.name}</h2>
            <OptionList
              value={selected[item.id] !== undefined ? String(selected[item.id]) : ''}
              onValueChange={(value) =>
                setSelected((prev) => ({ ...prev, [item.id]: Number(value) }))
              }
            >
              {item.options.map((option) => (
                <OptionItem
                  key={option.id}
                  value={String(option.id)}
                  label={option.label}
                  // 0원인 옵션에 '+0원'을 붙이면 시선만 끌고 정보가 없다.
                  trailing={
                    option.amount > 0 ? `+${formatCurrency(option.amount, locale)}` : undefined
                  }
                />
              ))}
            </OptionList>
          </section>
        ))}
      </div>

      <p className="bg-surface text-fg-muted mt-9 rounded-lg p-4 text-[0.8125rem] leading-relaxed">
        {config.disclaimer}
      </p>

      {hasAnyChoice && (
        <Button variant="link" className="mt-5" onClick={() => setSelected({})}>
          <RotateCcw size={13} />
          {dict.calculator.reset}
        </Button>
      )}

      <StickyCta
        summary={
          <div className="flex items-baseline justify-between">
            <span className="text-fg-muted text-[0.8125rem]">
              {dict.calculator.estimated}
              {!allChosen && <span className="text-fg-subtle ml-1">(항목 선택 중)</span>}
            </span>
            <span className="text-fg text-[1.25rem] leading-none font-bold" data-numeric>
              {formatCurrency(total, locale)}
            </span>
          </div>
        }
      >
        <Button size="xl" block asChild>
          <Link href={`/${locale}/custom`}>{dict.nav.custom}</Link>
        </Button>
      </StickyCta>
    </div>
  );
}

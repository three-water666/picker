import isVisible from 'rc-util/lib/Dom/isVisible';
import KeyCode from 'rc-util/lib/KeyCode';
import raf from 'rc-util/lib/raf';
import type { CustomFormat, PickerMode } from '../interface';

const scrollIds = new Map<HTMLElement, number>();

/** Trigger when element is visible in view */
export function waitElementReady(element: HTMLElement, callback: () => void): () => void {
  let id: number;

  function tryOrNextFrame() {
    if (isVisible(element)) {
      callback();
    } else {
      id = raf(() => {
        tryOrNextFrame();
      });
    }
  }

  tryOrNextFrame();

  return () => {
    raf.cancel(id);
  };
}

/* eslint-disable no-param-reassign */
export function scrollTo(element: HTMLElement, to: number, duration: number) {
  if (scrollIds.get(element)) {
    cancelAnimationFrame(scrollIds.get(element)!);
  }

  // jump to target if duration zero
  if (duration <= 0) {
    scrollIds.set(
      element,
      requestAnimationFrame(() => {
        element.scrollTop = to;
      }),
    );

    return;
  }
  const difference = to - element.scrollTop;
  const perTick = (difference / duration) * 10;

  scrollIds.set(
    element,
    requestAnimationFrame(() => {
      element.scrollTop += perTick;
      if (element.scrollTop !== to) {
        scrollTo(element, to, duration - 10);
      }
    }),
  );
}
/* eslint-enable */

export type KeyboardConfig = {
  onLeftRight?: ((diff: number) => void) | null;
  onCtrlLeftRight?: ((diff: number) => void) | null;
  onUpDown?: ((diff: number) => void) | null;
  onPageUpDown?: ((diff: number) => void) | null;
  onEnter?: (() => void) | null;
};
export function createKeyDownHandler(
  event: React.KeyboardEvent<HTMLElement>,
  { onLeftRight, onCtrlLeftRight, onUpDown, onPageUpDown, onEnter }: KeyboardConfig,
): boolean {
  const { which, ctrlKey, metaKey } = event;

  switch (which) {
    case KeyCode.LEFT:
      if (ctrlKey || metaKey) {
        if (onCtrlLeftRight) {
          onCtrlLeftRight(-1);
          return true;
        }
      } else if (onLeftRight) {
        onLeftRight(-1);
        return true;
      }
      /* istanbul ignore next */
      break;

    case KeyCode.RIGHT:
      if (ctrlKey || metaKey) {
        if (onCtrlLeftRight) {
          onCtrlLeftRight(1);
          return true;
        }
      } else if (onLeftRight) {
        onLeftRight(1);
        return true;
      }
      /* istanbul ignore next */
      break;

    case KeyCode.UP:
      if (onUpDown) {
        onUpDown(-1);
        return true;
      }
      /* istanbul ignore next */
      break;

    case KeyCode.DOWN:
      if (onUpDown) {
        onUpDown(1);
        return true;
      }
      /* istanbul ignore next */
      break;

    case KeyCode.PAGE_UP:
      if (onPageUpDown) {
        onPageUpDown(-1);
        return true;
      }
      /* istanbul ignore next */
      break;

    case KeyCode.PAGE_DOWN:
      if (onPageUpDown) {
        onPageUpDown(1);
        return true;
      }
      /* istanbul ignore next */
      break;

    case KeyCode.ENTER:
      if (onEnter) {
        onEnter();
        return true;
      }
      /* istanbul ignore next */
      break;
  }

  return false;
}

// ===================== Format =====================
export function getDefaultFormat<DateType>(
  format: string | CustomFormat<DateType> | (string | CustomFormat<DateType>)[] | undefined,
  picker: PickerMode | undefined,
  showTime: boolean | object | undefined,
  use12Hours: boolean | undefined,
) {
  let mergedFormat = format;
  if (!mergedFormat) {
    switch (picker) {
      case 'time':
        mergedFormat = use12Hours ? 'hh:mm:ss a' : 'HH:mm:ss';
        break;

      case 'week':
        mergedFormat = 'gggg-wo';
        break;

      case 'month':
        mergedFormat = 'YYYY-MM';
        break;

      case 'quarter':
        mergedFormat = 'YYYY-[Q]Q';
        break;

      case 'year':
        mergedFormat = 'YYYY';
        break;

      default:
        mergedFormat = showTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD';
    }
  }

  return mergedFormat;
}

// ====================== Mode ======================
export function elementsContains(
  elements: (HTMLElement | undefined | null)[],
  target: HTMLElement,
) {
  return elements.some((ele) => ele && ele.contains(target));
}

/**
 * 获取真正的placement
 * @param placement
 * @param rtl
 * @returns
 */
export function getRealPlacement(placement: string, rtl: boolean) {
  if (placement !== undefined) {
    return placement;
  }
  const tPlacement = rtl ? 'bottomRight' : 'bottomLeft';
  return tPlacement;
  return getRealPlacement001(
    {
      bottomLeft: {
        points: ['tl', 'bl'],
        offset: [0, 4],
        overflow: {
          adjustX: 1,
          adjustY: 1,
        },
      },
      bottomRight: {
        points: ['tr', 'br'],
        offset: [0, 4],
        overflow: {
          adjustX: 1,
          adjustY: 1,
        },
      },
      topLeft: {
        points: ['bl', 'tl'],
        offset: [0, -4],
        overflow: {
          adjustX: 0,
          adjustY: 1,
        },
      },
      topRight: {
        points: ['br', 'tr'],
        offset: [0, -4],
        overflow: {
          adjustX: 0,
          adjustY: 1,
        },
      },
    },
    tPlacement,
  );
}
function isPointsEq(a1: string[] = [], a2: string[] = []): boolean {
  return a1[0] === a2[0] && a1[1] === a2[1];
}

export function getRealPlacement001(builtinPlacements: any, tPlacement: any): string {
  const align = builtinPlacements[tPlacement];
  const { points } = align;

  const placements = Object.keys(builtinPlacements);

  for (let i = 0; i < placements.length; i += 1) {
    const placement = placements[i];
    if (isPointsEq(builtinPlacements[placement]?.points, points)) {
      console.log('11111placement', placement);
      return placement;
    }
  }
  console.log('11111placement', '');
  return '';
}

/**
 * 获取偏移CSS key值
 * @param placement
 * @param rtl
 * @returns
 */
export function getoffsetUnit(placement: string, rtl: boolean) {
  const realPlacement = getRealPlacement(placement, rtl);
  console.log('getoffsetUnit', placement, rtl, realPlacement);
  const placementRight = realPlacement?.toLowerCase().endsWith('right');
  let offsetUnit = placementRight ? 'insetInlineEnd' : 'insetInlineStart';
  if (rtl) {
    offsetUnit = ['insetInlineStart', 'insetInlineEnd'].find((unit) => unit !== offsetUnit);
  }
  return offsetUnit;
}

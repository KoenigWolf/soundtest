'use client';

import * as React from 'react';
import type { ToastActionElement, ToastProps } from '@/components/ui/toast';

// 定数
const TOAST_LIMIT = 1; // 表示するトーストの上限
const TOAST_REMOVE_DELAY = 1000000; // トースト自動削除までの遅延時間（ミリ秒）

// トーストの型定義：基本のToastPropsにIDなどを追加
type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

// トーストアクションの種類
const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
} as const;

// トーストID生成用カウンタ
let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

// Action 型定義：各種トースト操作に対応
type ActionType = typeof actionTypes;
type Action =
  | {
      type: ActionType['ADD_TOAST'];
      toast: ToasterToast;
    }
  | {
      type: ActionType['UPDATE_TOAST'];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType['DISMISS_TOAST'];
      toastId?: ToasterToast['id'];
    }
  | {
      type: ActionType['REMOVE_TOAST'];
      toastId?: ToasterToast['id'];
    };

// 状態の型定義：トーストの配列を管理
interface State {
  toasts: ToasterToast[];
}

// トースト削除タイムアウトの管理マップ
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

// 指定トーストIDの削除キューに追加
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) return;

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({ type: 'REMOVE_TOAST', toastId });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

// Reducer：状態とアクションに基づいて新状態を生成
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    // トースト追加：最新のトーストを先頭に配置し上限を適用
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    // トースト更新：指定IDのトーストの内容を更新
    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map(t =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    // トースト非表示：指定IDまたは全トーストを非表示にして削除キューに追加
    case 'DISMISS_TOAST': {
      const { toastId } = action;
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach(toast => addToRemoveQueue(toast.id));
      }
      return {
        ...state,
        toasts: state.toasts.map(t =>
          t.id === toastId || toastId === undefined
            ? { ...t, open: false }
            : t
        ),
      };
    }

    // トースト削除：指定IDのトーストを状態から除去
    case 'REMOVE_TOAST':
      if (action.toastId === undefined) {
        return { ...state, toasts: [] };
      }
      return {
        ...state,
        toasts: state.toasts.filter(t => t.id !== action.toastId),
      };

    default:
      return state;
  }
};

// 状態更新リスナー配列：状態変化時に呼ばれる
const listeners: Array<(state: State) => void> = [];

// グローバルな状態管理
let memoryState: State = { toasts: [] };

// dispatch 関数：アクションをReducerに渡し状態を更新、リスナーに通知
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach(listener => listener(memoryState));
}

// Toast関数用の型定義（ID以外）
type Toast = Omit<ToasterToast, 'id'>;

// トーストを表示し操作関数を返す
function toast({ ...props }: Toast) {
  const id = genId();

  // トースト内容の更新関数
  const update = (props: ToasterToast) =>
    dispatch({ type: 'UPDATE_TOAST', toast: { ...props, id } });
  // トースト非表示関数
  const dismiss = () =>
    dispatch({ type: 'DISMISS_TOAST', toastId: id });

  // 新規トースト追加
  dispatch({
    type: 'ADD_TOAST',
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: open => {
        if (!open) dismiss();
      },
    },
  });

  return { id, dismiss, update };
}

// useToast フック：コンポーネントからトースト状態と操作関数を利用可能にする
function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    // 状態更新リスナーに登録
    listeners.push(setState);
    return () => {
      // コンポーネントアンマウント時にリスナーから除去
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) =>
      dispatch({ type: 'DISMISS_TOAST', toastId }),
  };
}

export { useToast, toast };

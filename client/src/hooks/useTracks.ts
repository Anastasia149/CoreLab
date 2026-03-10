import { useMemo } from 'react';

export type Track = {
  icon: string;
  title: string;
};

export function useTracks(): Track[] {
  return useMemo(
    () => [
      { icon: 'logos:javascript', title: 'Front End разработчик' },
      { icon: 'logos:python', title: 'Python разработчик' },
      { icon: 'logos:apple', title: 'iOS разработчик' },
      { icon: 'simple-icons:uxdesign', title: 'UX/UI дизайнер' },
    ],
    []
  );
}

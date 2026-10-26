import Svg, {
  Circle,
  Ellipse,
  G,
  Path,
} from 'react-native-svg';

import { colors } from './postsTheme';

const paths = {
  menu: 'M4 6h16M4 12h16M4 18h16',

  plus: 'M12 4v16M4 12h16',

  close: 'm5 5 14 14M19 5 5 19',

  back: 'm14 5-7 7 7 7',

  chevron: 'm7 10 5 5 5-5',

  up: 'M12 3 3.5 11.5H8V21h8v-9.5h4.5L12 3Z',

  down: 'M12 21 3.5 12.5H8V3h8v9.5h4.5L12 21Z',

  comment:
    'M20.5 11.5a8.5 8.5 0 0 1-8.5 8.5 10 10 0 0 1-4-.9L3 21l1.6-5A8.5 8.5 0 1 1 20.5 11.5Z',

  image:
    'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm-2 13 6-6 6 6 3-3 3 3M15 7h.01',

  edit:
    'm15 4 5 5M4 15 15.5 3.5a2.8 2.8 0 0 1 4 4L8 19l-5 2 1-6Z',

  trash:
    'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7',

  popular: 'm8 16 8-8M8 8h8v8',

  news:
    'M5 5h15v15H5V5ZM5 9H2v11h3M9 9h7M9 13h7M9 17h4',

  discover:
    'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm3.5 5.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z',

  logout:
    'M9 4H3v16h6M8 12h13m-4-4 4 4-4 4',

  send: 'm12 4-7 7M12 4l7 7M12 4v16',
} as const;

export type PostIconName =
  | keyof typeof paths
  | 'more';

export default function PostIcon({
  name,
  size = 24,
  color = colors.text,
  filled = false,
}: {
  name: PostIconName;
  size?: number;
  color?: string;
  filled?: boolean;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
    >
      {name === 'more' ? (
        <G fill={color}>
          <Circle
            cx="5"
            cy="12"
            r="1.5"
          />

          <Circle
            cx="12"
            cy="12"
            r="1.5"
          />

          <Circle
            cx="19"
            cy="12"
            r="1.5"
          />
        </G>
      ) : (
        <G
          fill={
            filled
              ? color
              : 'none'
          }
          stroke={color}
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {name === 'popular' && (
            <Circle
              cx="12"
              cy="12"
              r="9"
            />
          )}

          <Path d={paths[name]} />
        </G>
      )}
    </Svg>
  );
}

/** Inline Snoo mark, so the requested Reddit logo also works offline. */
export function RedditLogo({
  size = 31,
}: {
  size?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      accessibilityLabel="Reddit logo"
    >
      <Circle
        cx="20"
        cy="20"
        r="20"
        fill="#ff4500"
      />

      <Path
        d="m20 16 2-8 7 1.7"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <Circle
        cx="29.8"
        cy="10"
        r="3.1"
        fill="white"
      />

      <Circle
        cx="7.8"
        cy="21"
        r="4"
        fill="white"
      />

      <Circle
        cx="32.2"
        cy="21"
        r="4"
        fill="white"
      />

      <Ellipse
        cx="20"
        cy="24"
        rx="13"
        ry="9.3"
        fill="white"
      />

      <Circle
        cx="14.5"
        cy="23"
        r="2.1"
        fill="#ff4500"
      />

      <Circle
        cx="25.5"
        cy="23"
        r="2.1"
        fill="#ff4500"
      />

      <Path
        d="M14.3 28c2.7 2.5 8.7 2.5 11.4 0"
        fill="none"
        stroke="#ff4500"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </Svg>
  );
}

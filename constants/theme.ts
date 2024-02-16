import { Dimensions } from 'react-native';

const { height, width } = Dimensions.get('window');

export const COLORS = {
    primary: '#100D40',
    secondary: '#FCA34D',
    tertiary: "#D6CDFE",
    blue: "#150B3D",
    white: "#FFFFFE",
    secondaryWhite: '#F7F7F7',
    tertiaryWhite: '#F2F2F2',
    black: "#707070",
    secondaryBlack: "#020614",
    gray: "#ECF0F4",
    secondaryGray: '#808080',
    red: "#FF0000",
    green: "#00BE00",
    tansparentPrimary: "rgba(0, 154, 118, .15)"
};

export const SIZES = {
    // Global SIZES
    base: 8,
    font: 14,
    radius: 30,
    padding: 8,
    padding2: 12,
    padding3: 16,

    // FONTS Sizes
    largeTitle: 50,
    h1: 36,
    h2: 22,
    h3: 16,
    h4: 14,
    body1: 30,
    body2: 20,
    body3: 16,
    body4: 14,

    // App Dimensions
    width,
    height,
};

export const FONTS = {
    largeTitle: { fontFamily: 'black', fontSize: SIZES.largeTitle, lineHeight: 55 },
    h1: { fontFamily: 'bold', fontSize: SIZES.h1, lineHeight: 36 },
    h2: { fontFamily: 'bold', fontSize: SIZES.h2, lineHeight: 30 },
    h3: { fontFamily: 'bold', fontSize: SIZES.h3, lineHeight: 22 },
    h4: { fontFamily: 'bold', fontSize: SIZES.h4, lineHeight: 20 },
    body1: { fontFamily: 'regular', fontSize: SIZES.body1, lineHeight: 36 },
    body2: { fontFamily: 'regular', fontSize: SIZES.body2, lineHeight: 30 },
    body3: { fontFamily: 'regular', fontSize: SIZES.body3, lineHeight: 22 },
    body4: { fontFamily: 'regular', fontSize: SIZES.body4, lineHeight: 20 },
};

interface Theme {
    COLORS: typeof COLORS;
    SIZES: typeof SIZES;
    FONTS: typeof FONTS;
}

const appTheme: Theme = { COLORS, SIZES, FONTS };

export default appTheme;
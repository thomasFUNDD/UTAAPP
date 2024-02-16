import { StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../constants';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 22,
  },
  illustration: {
    height: SIZES.width * 0.8,
    width: SIZES.width * 0.8,
  },
  titleContainer: {
    marginVertical: 18,
    alignItems: 'center',
  },
  title: {
    ...FONTS.h2,
    color: COLORS.primary,
    textAlign: "center"
  },
  subTitle: {
    ...FONTS.h3,
    color: COLORS.secondary,
    textAlign: "center",
    marginTop: 8
  },
  description: {
    ...FONTS.body3,
    color: COLORS.black,
    textAlign: 'center',
  },
  dotsContainer: {
    marginBottom: 20,
    marginTop: 8,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 22,
  },
  nextButton: {
    width: SIZES.width - 44,
    marginBottom: SIZES.padding,
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  skipButton: {
    width: SIZES.width - 44,
    marginBottom: SIZES.padding,
    backgroundColor: 'transparent',
    borderColor: COLORS.primary
  },
});

export default styles;
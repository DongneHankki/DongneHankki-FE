import { StyleSheet, Dimensions } from 'react-native';
import { globalTextStyles, FONTS } from './globalStyles';

export const common = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    alignItems: 'stretch',
    paddingTop: 32,
    paddingHorizontal: 10,
    width: '100%',
    minHeight: '100%',
  },
  contentWrapper: {
    paddingHorizontal: 24,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formWrapper: {
    paddingHorizontal: 24,
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  subtitle: {
    ...globalTextStyles.heading1,
    textAlign: 'center',
    marginBottom: 48,
    fontWeight: '400'
  },
  input: {
    backgroundColor: '#EDEDED',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 56,
    marginTop: 0,
    marginBottom: 5,
    fontFamily: FONTS.regular,
  },
  brownButton: {
    width: '100%',
    backgroundColor: '#2E1404',
    borderRadius: 15,
    paddingVertical: 20,
    alignItems: 'center',
    marginTop: 16,
    height: 80,
    justifyContent: 'center',
    marginBottom: 16,
  },
  brownButtonText: {
    ...globalTextStyles.button,
    color: '#fff',
    fontSize: 25,
  },
  errorMsg: {
    color: 'red',
    fontSize: 13,
    marginLeft: 4,
    margin: 0,
    fontFamily: FONTS.regular,
  },
  star: {
    color: '#FF0000',
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 1,
    height: 30,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
}); 
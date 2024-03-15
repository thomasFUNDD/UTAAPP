import * as Sentry from '@sentry/react-native';
import { ReactNativeTracing } from '@sentry/react-native';

Sentry.init({
  dsn: 'https://18de0fb4a36e721c583de945a2e16bc3@o4506915884630016.ingest.us.sentry.io/4506915885678592',
  release: '1.0.0',
  dist: '1.0.0',
  enableInExpoDevelopment: true,
  debug: true,
  integrations: [
    new ReactNativeTracing({
      tracingOrigins: ['localhost', /^\//, /^https:\/\//],
      tracesSampleRate: 1.0,
    }),
  ],
});

export default Sentry;
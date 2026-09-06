const { withAndroidManifest } = require('expo/config-plugins');

// The backend is plain http on the LAN, so release builds need cleartext.
module.exports = (config) =>
  withAndroidManifest(config, (c) => {
    c.modResults.manifest.application[0].$['android:usesCleartextTraffic'] = 'true';
    return c;
  });

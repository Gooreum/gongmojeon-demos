/* Public Firebase web config only (browser keys are public by design; the API key is
   restricted by HTTP referrer, and App Check is enforced on Firestore and AI Logic).
   Never put service-account keys, debug tokens or private keys in this file. */
window.SHAPE_FIREBASE = {
  enabled: true,
  config: {
    apiKey: 'AIzaSyBvFEb0TSHSIV3pURbFjrSPorXBzRROz54',
    authDomain: 'scam-shape-check-56l4d.firebaseapp.com',
    projectId: 'scam-shape-check-56l4d',
    storageBucket: 'scam-shape-check-56l4d.firebasestorage.app',
    messagingSenderId: '234523660034',
    appId: '1:234523660034:web:374062bf5f81726d883c1b'
  },
  appCheckSiteKey: '6LdxqSIuAAAAAOg87nad9uU5mG1gledzQxhcy6KL',
  model: 'gemini-3.5-flash-lite',
  sdkBase: './vendor/'
};

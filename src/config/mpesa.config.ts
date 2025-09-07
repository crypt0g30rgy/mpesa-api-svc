export default () => ({
  mpesa: {
    // env
    env: process.env.MPESA_ENV || 'sandbox', // sandbox | production
    baseUrl:
      process.env.MPESA_ENV === 'production'
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke',

    // Certs
    certPath:
      process.env.MPESA_ENV === 'production'
        ? process.env.MPESA_CERT_PROD
        : process.env.MPESA_CERT_SANDBOX,

    // CallBack
    timeoutUrl: process.env.MPESA_TIMEOUT_CALLBACK_URL,
    resultUrl: process.env.MPESA_RESULT_CALLBACK_URL,
    stkResultUrl: process.env.MPESA_STK_RESULT_CALLBACK_URL,

    // B2C config
    b2cConsumerKey: process.env.MPESA_B2C_CONSUMER_KEY,
    b2cConsumerSecret: process.env.MPESA_B2C_CONSUMER_SECRET,
    initiatorName: process.env.MPESA_INITIATOR_NAME,
    initiatorPassword: process.env.MPESA_INITIATOR_PASSWORD,
    b2cShortCode: process.env.MPESA_B2C_SHORTCODE,
    hardCodedCreds: process.env.MPESA_SECURITY_CREDENTIAL,

    // C2B config
    c2bConsumerKey: process.env.MPESA_C2B_CONSUMER_KEY,
    c2bConsumerSecret: process.env.MPESA_C2B_CONSUMER_SECRET,
    c2bShortCode: process.env.MPESA_C2B_SHORTCODE,
    commandId: process.env.MPESA_COMMAND_ID,
    passKey: process.env.MPESA_PASSKEY,
  },
});

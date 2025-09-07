import axios, { InternalAxiosRequestConfig } from 'axios';

export function setupAxiosRequestLogger() {
  if (process.env.NODE_ENV !== 'development') return;

  axios.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      console.log('=== Outgoing Axios Request ===');
      console.log('URL:', config.url);
      console.log('Method:', config.method);

      // Mask sensitive headers
      const safeHeaders = { ...config.headers };
      if (safeHeaders['Authorization']) {
        safeHeaders['Authorization'] = '****'; // mask auth token
      }
      if (safeHeaders['authorization']) {
        safeHeaders['authorization'] = '****'; // handle lowercase variant
      }

      console.log('Headers:', JSON.stringify(safeHeaders, null, 2));

      // Mask sensitive fields in body
      let safeData = config.data;
      if (safeData && typeof safeData === 'object') {
        safeData = { ...safeData };
        if ('SecurityCredential' in safeData)
          safeData.SecurityCredential = '****';
        if ('InitiatorPassword' in safeData)
          safeData.InitiatorPassword = '****';
        if ('Password' in safeData) safeData.Password = '****';
      }

      console.log('Body:', JSON.stringify(safeData, null, 2));
      console.log('=============================');

      return config;
    },
    (error) => {
      console.error('Axios request error:', error);
      return Promise.reject(error);
    },
  );
}

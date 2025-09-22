import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import https from 'https';

/**
 * HTTP client centralizado con interceptores de logging, timeout y manejo básico de errores.
 * Permite desacoplar el consumo de APIs externas (login, viajes, propinas, etc.).
 */
class HttpClient {
  private client: AxiosInstance;
  private insecureAgent = new https.Agent({ rejectUnauthorized: false });

  constructor(baseConfig?: AxiosRequestConfig) {
  // Forzar httpsAgent inseguro siempre (solo entorno local)
  const httpsAgent = new https.Agent({ rejectUnauthorized: false });

    this.client = axios.create({
      timeout: 15000,
      httpsAgent,
      ...baseConfig,
    });

    this.client.interceptors.request.use((config) => {
      const { method, url, data } = config;
  console.log(`[http] (insecure) ${method?.toUpperCase()} → ${url} | payload:`, data ?? null);
      return config;
    });

    this.client.interceptors.response.use(
      (resp: AxiosResponse) => {
        console.log(`[http] ← ${resp.status} ${resp.config.url}`);
        return resp;
      },
      async (error) => {
        const code = error?.code || '';
        const msg: string = error?.message || '';
        const isCertErr = code === 'DEPTH_ZERO_SELF_SIGNED_CERT' || /self[- ]signed certificate/i.test(msg);
        const insecureEnabled = process.env.LOCAL_INSECURE_TLS === '1' || process.env.ALLOW_INSECURE_SSL === '1';
        if (isCertErr && !insecureEnabled) {
          try {
            console.warn('[http] Cert self-signed detectado. Reintentando con httpsAgent inseguro SOLO para esta petición.');
            const cfg = error.config || {};
            cfg.httpsAgent = this.insecureAgent;
            return await this.client.request(cfg);
          } catch (e2) {
            console.error('[http] Reintento inseguro falló:', e2?.message);
          }
        }
        if (error.response) {
          console.error('[http] ERROR', error.response.status, error.config?.url, '| data:', error.response.data);
        } else {
          console.error('[http] ERROR', error.code, error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }
}

export const httpClient = new HttpClient();

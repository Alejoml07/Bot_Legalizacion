interface ApiConfig {

  loginUrl: string;

  userTripsUrl: string;

  addTipsUrl: string;

  upsertLegalizationUrl: string;

  upsertTransportUrl: string;
  
}

function readEnv(name: string, fallback?: string, required = false): string {

  const val = process.env[name] ?? fallback;

  if (required && !val) throw new Error(`Missing required env var: ${name}`);

  return val as string;

}

export const apiConfig: ApiConfig = {

  loginUrl: readEnv('AUTH_LOGIN_BOT_URL', 'https://localhost:5101/api/auth/login-bot'),

  userTripsUrl: readEnv('USER_TRIPS_URL', 'https://localhost:5101/api/userrequest/appsheet/solicitudes-by-cedula'),

  addTipsUrl: readEnv('ADD_TIPS_URL', 'https://localhost:5101/api/tips/add-tips'),

  upsertLegalizationUrl: readEnv('UPSERT_LEGALIZATION_URL', 'https://localhost:5101/api/billing/upsert-legalization'),

  upsertTransportUrl: readEnv('UPSERT_TRANSPORT_URL', 'https://localhost:5101/api/trips/upsert-transport')

};

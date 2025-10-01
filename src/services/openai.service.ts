// Stub OpenAI service to satisfy build when original file is missing.
// If you have a real implementation, replace this file with it.

export const callOpenAI = async (payload: any) => {
  // minimal stub: return a predictable shape
  return { ok: false, data: null };
};

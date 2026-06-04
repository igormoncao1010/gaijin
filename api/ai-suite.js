const { handleAiSuite } = require("./_lib/ai-core.cjs");

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    response.status(200).json(await handleAiSuite(request.body || {}));
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
};

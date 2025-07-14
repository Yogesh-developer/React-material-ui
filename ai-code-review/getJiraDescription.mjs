import axios from "axios";
import path from "path";
import { config } from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, "../.env") });

const { JIRA_EMAIL, JIRA_TOKEN, JIRA_DOMAIN } = process.env;

function extractTextFromADF(node) {
  if (!node) return "";

  if (Array.isArray(node)) {
    return node.map(extractTextFromADF).join("\n");
  }

  if (node.type === "text") {
    return node.text || "";
  }

  if (node.content) {
    return extractTextFromADF(node.content);
  }

  return "";
}

export const getJiraDetails = async (jiraID) => {
  const url = `https://${JIRA_DOMAIN}/rest/api/3/issue/${jiraID}`;
  const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_TOKEN}`).toString("base64");

  try {
    const res = await axios.get(url, {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
      },
    });

    const { summary, description } = res.data.fields;
    const title = summary;
    const descText = extractTextFromADF(description?.content);
    return ` ${title},
      ${descText}`;
  } catch (error) {
    console.error(`❌ Failed to fetch JIRA ${jiraID}:`, error.message);
    return "";
  }
};

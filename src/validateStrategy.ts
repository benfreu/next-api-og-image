import type { NextApiRequest, NextApiResponse } from "next";
import { STRATEGY_OPTIONS, StrategyOption } from "./types";

const validateStrategy = (
  strategy: StrategyOption,
  errorsInResponse: boolean,
  request: NextApiRequest,
  response: NextApiResponse
) => {
  const checks: Record<StrategyOption, () => void> = {
    body: () => {
      const {
        method,
        headers: { "content-type": contentType },
      } = request;

      if (method !== "POST" && contentType !== "application/json") {
        const message = `Strategy is set to \`body\` so parameters must be passed by POST request and JSON payload. Current method: ${method} and current content type: ${contentType}`;

        if (errorsInResponse) {
          response.json({ message });
        }

        throw new Error(message);
      }
    },
    query: () => {
      const { method } = request;

      if (method !== "GET") {
        const message = `Strategy is set to \`query\` so parameters must be passed by GET request and query params. Current method: ${method}`;

        if (errorsInResponse) {
          response.json({ message });
        }

        throw new Error(message);
      }
    },
  };
  const currentCheck = checks[strategy];

  if (!currentCheck) {
    throw new Error(
      `Unknown strategy provided. Possible values: ${STRATEGY_OPTIONS}`
    );
  }

  currentCheck();
};

export default validateStrategy;

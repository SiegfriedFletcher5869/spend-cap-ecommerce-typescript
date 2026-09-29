import { createServer } from "node:http";
import { handleCheckout, configureMonthlyCap } from "./checkout_service.ts";

const port = Number(process.env.PORT ?? 3000);
const remainingUsd = Number(process.env.REMAINING_USD ?? 500);

const server = createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/checkout") {
    let text = "";
    for await (const chunk of req) text += chunk;
    const result = await handleCheckout(JSON.parse(text || "{}"), remainingUsd);
    res.writeHead(result.status, { "content-type": "application/json" });
    res.end(JSON.stringify(result.body));
    return;
  }
  res.writeHead(404); res.end();
});

if (process.env.CONFIGURE_CAP === "true") await configureMonthlyCap(Number(process.env.MONTHLY_CAP_USD ?? 500));
server.listen(port, () => console.log(`checkout service listening on ${port}`));

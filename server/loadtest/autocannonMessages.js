const autocannon = require("autocannon");
const fs = require("fs");

const users = JSON.parse(
  fs.readFileSync("./loadtest/tokens.json", "utf8")
);

/* ===========================
   STRESS TEST SETTINGS
=========================== */

const CONNECTIONS = 1000;
const DURATION = 120; // seconds
const MESSAGE_SIZE = 1000; // chars

/* ===========================
   HELPERS
=========================== */

function randomUser() {
  return users[Math.floor(Math.random() * users.length)];
}

function randomPair() {
  let sender = randomUser();
  let receiver = randomUser();

  while (sender.userId === receiver.userId) {
    receiver = randomUser();
  }

  return { sender, receiver };
}

/* ===========================
   LOAD TEST
=========================== */

autocannon(
  {
    url: "http://localhost:8000/messages/give_message",

    connections: CONNECTIONS,
    pipelining: 1,
    duration: DURATION,

    method: "POST",

    setupClient(client) {
      const { sender, receiver } = randomPair();

      client.setBody(
        JSON.stringify({
          sender: sender.userId,
          receiver: receiver.username,
          content: "A".repeat(MESSAGE_SIZE)
        })
      );

      client.setHeaders({
        Cookie: `token_load=${sender.token}`,
        "Content-Type": "application/json"
      });
    }
  },

  (err, result) => {
    if (err) {
      console.error(err);
      return;
    }

    const accepted = result["2xx"] || 0;
    const failed = result.non2xx || 0;
    const sent = result.requests.total;

    const successRate =
      sent > 0 ? ((accepted / sent) * 100).toFixed(2) : "0.00";

    console.log("\n========== LOAD TEST REPORT ==========");
    console.log(`Duration           : ${result.duration.toFixed(2)} sec`);
    console.log(`Connections        : ${result.connections}`);
    console.log(`Message Size       : ${MESSAGE_SIZE} chars`);
    console.log(`Total Requests     : ${sent}`);
    console.log(`Accepted (2xx)     : ${accepted}`);
    console.log(`Failed             : ${failed}`);
    console.log(`Success Rate       : ${successRate}%`);
    console.log(`Req/sec            : ${result.requests.average.toFixed(2)}`);
    console.log(`Avg Latency        : ${result.latency.average.toFixed(2)} ms`);
    console.log(`P99 Latency        : ${result.latency.p99} ms`);
    console.log(`Max Latency        : ${result.latency.max} ms`);
    console.log("======================================\n");
  }
);
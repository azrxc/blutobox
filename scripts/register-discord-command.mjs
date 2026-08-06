// One-time setup script: registers the /share slash command with Discord.
// Run once after DISCORD_APPLICATION_ID and DISCORD_BOT_TOKEN are set:
//   node --env-file=.env.local scripts/register-discord-command.mjs

const applicationId = process.env.DISCORD_APPLICATION_ID;
const botToken = process.env.DISCORD_BOT_TOKEN;

if (!applicationId || !botToken) {
  console.error("Missing DISCORD_APPLICATION_ID or DISCORD_BOT_TOKEN in the environment.");
  process.exit(1);
}

const res = await fetch(`https://discord.com/api/v10/applications/${applicationId}/commands`, {
  method: "PUT",
  headers: {
    Authorization: `Bot ${botToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify([
    {
      name: "share",
      description: "Upload a file to Bluto Box and get a shareable link",
      options: [
        {
          name: "file",
          description: "The file to share",
          type: 11, // ATTACHMENT
          required: true,
        },
      ],
    },
  ]),
});

if (!res.ok) {
  console.error(`Failed to register command: ${res.status} ${await res.text()}`);
  process.exit(1);
}

console.log("Registered /share command successfully.");

const fetch = require("node-fetch");
const replyConfig = require("./replyConfig");
const errorMessage = require("../utilities/randomErrorMessage");

async function kanalCommand(ctx) {
  const args = ctx.state.command.args;
  if (args) {
    const res = await fetch(
      encodeURI(
        `http://api.eksicode.org/telegrams?name_contains=${
          args == "tümü" || "*" ? "" : args
        }`
      )
    );
    const channels = await res.json();
    if (channels.length) {
      ctx.replyWithMarkdown(
        `Sonuçlar:
                \n${channels.map(e => `[${e.name}](${e.link})\n`).join("")}`
      );
    } else {
      ctx.reply(
        `${errorMessage()} Hiç sonuç bulamadık. Hatalı yazmadığınızdan emin olup tekrar deneyebilirsiniz.`,
        replyConfig
      );
    }
  } else {
    ctx.reply("Kullanım: /kanal <sorgu|tümü>", replyConfig);
  }
}

module.exports = kanalCommand;

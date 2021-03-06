const fetch = require("node-fetch");
const { parse } = require("node-html-parser");
const apiAuth = require("../utilities/apiAuth");
const errorMessage = require("../utilities/randomErrorMessage");

async function kaynakCommand(ctx) {
	const link = ctx.state.command.args;
	if (!link.length) {
		return ctx.reply("Kullanım: /kaynak <link>");
	}
	const url = link.startsWith("http") ? link : "http://" + link;
	const loadingMessage = await ctx.reply("Kaynak ekleniyor...", {
		reply_to_message_id: ctx.message.message_id
	});
	let title = "";
	try {
    const titleFetch = await fetch(url);
    const contentType = titleFetch.headers.get("content-type");
		if (contentType.match("text\/html")) {
			const html = await titleFetch.text();
			title = parse(html).querySelector("title").text;
		} else {
      title = link
    }
	} catch(err) {
    console.error(err);
		ctx.telegram.deleteMessage(
			loadingMessage.chat.id,
			loadingMessage.message_id
		);
		return ctx.reply(
			`${errorMessage()} Bir hata oluştu. Lütfen geçerli bir bağlantı gönderdiğinizden emin olun.`,
			{ reply_to_message_id: ctx.message.message_id }
		);
	}
	const jwt = await apiAuth();
	const requestData = {
		doc_name: title,
		doc_creator_tg: ctx.from.id,
		doc_tg_ch: ctx.message.chat.id,
		doc_link: url
	};
	try {
		const req = await fetch("https://api.eksicode.org/kaynaklars", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: "Bearer " + jwt
			},
			body: JSON.stringify(requestData)
		});
		if (req.status == 200) {
			ctx.telegram.deleteMessage(
				loadingMessage.chat.id,
				loadingMessage.message_id
			);
			ctx.reply(
				"Kaynak başarıyla eklendi! Yönetici ekibimiz inceleyip onaylayacak.",
				{ reply_to_message_id: ctx.message.message_id }
			);
		}
	} catch {
		ctx.telegram.deleteMessage(
			loadingMessage.chat.id,
			loadingMessage.message_id
		);
		ctx.reply(
			`${errorMessage()} Bir hata oluştu. Lütfen daha sonra tekrar deneyin.`,
			{
				reply_to_message_id: ctx.message.message_id
			}
		);
	}
}

module.exports = {
	kaynakCommand
};

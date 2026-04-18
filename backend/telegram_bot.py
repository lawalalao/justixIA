import os
import json
import asyncio
import httpx
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    CallbackQueryHandler,
    ContextTypes,
    filters,
)

API_URL = os.environ.get("JUSTIXIA_API_URL", "http://localhost:8000")
TELEGRAM_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")

LANGS = {
    "🇫🇷 Français": "français",
    "🇬🇧 English": "anglais",
    "🇸🇦 العربية": "arabe",
    "🇷🇴 Română": "roumain",
    "🇵🇹 Português": "portugais",
    "🇪🇸 Español": "espagnol",
    "🇸🇳 Wolof": "wolof",
}


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [InlineKeyboardButton(lang, callback_data=f"lang:{code}")]
        for lang, code in LANGS.items()
    ]
    await update.message.reply_text(
        "👋 Bienvenue sur *JustiXia*\n\n"
        "Je t'aide à comprendre tes droits et à rédiger une réponse juridique.\n\n"
        "📌 *Comment ça marche :*\n"
        "1. Choisis ta langue\n"
        "2. Envoie une photo ou PDF de ton document\n"
        "3. Je t'explique tes droits et génère ta lettre\n\n"
        "Commence par choisir ta langue 👇",
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup(keyboard),
    )


async def lang_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    lang_code = query.data.split(":")[1]
    context.user_data["langue"] = lang_code
    await query.edit_message_text(
        f"✅ Langue sélectionnée : *{lang_code}*\n\n"
        "Envoie maintenant ton document :\n"
        "• 📷 Photo de la lettre\n"
        "• 📄 Fichier PDF\n"
        "• ✍️ Ou colle le texte directement",
        parse_mode="Markdown",
    )


async def handle_document(update: Update, context: ContextTypes.DEFAULT_TYPE):
    langue = context.user_data.get("langue", "français")
    msg = await update.message.reply_text("⏳ Analyse en cours... (30 secondes)")

    doc = update.message.document or (
        update.message.photo[-1] if update.message.photo else None
    )

    if not doc:
        await msg.edit_text("❌ Envoie une photo ou un PDF.")
        return

    file = await context.bot.get_file(doc.file_id if hasattr(doc, "file_id") else doc.file_id)
    file_bytes = await file.download_as_bytearray()

    if update.message.document:
        mime = update.message.document.mime_type or "application/octet-stream"
        filename = update.message.document.file_name or "document"
    else:
        mime = "image/jpeg"
        filename = "photo.jpg"

    async with httpx.AsyncClient(timeout=60) as http:
        resp = await http.post(
            f"{API_URL}/api/analyze",
            files={"file": (filename, bytes(file_bytes), mime)},
            data={"langue": langue},
        )

    if resp.status_code != 200:
        await msg.edit_text("❌ Erreur lors de l'analyse. Réessaie ou envoie le texte directement.")
        return

    result = resp.json()
    await msg.delete()
    await send_result(update, result)


async def handle_text(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text
    if text.startswith("/"):
        return

    langue = context.user_data.get("langue", "français")
    msg = await update.message.reply_text("⏳ Analyse en cours...")

    async with httpx.AsyncClient(timeout=60) as http:
        resp = await http.post(
            f"{API_URL}/api/analyze",
            data={"text": text, "langue": langue},
        )

    if resp.status_code != 200:
        await msg.edit_text("❌ Erreur lors de l'analyse.")
        return

    result = resp.json()
    await msg.delete()
    await send_result(update, result)


async def send_result(update: Update, result: dict):
    irregularites = result.get("irregularites", [])
    droits = result.get("droits", [])

    irr_text = "\n".join(
        f"🚨 *{i.get('article', '')}*  {i.get('description', '')}"
        for i in irregularites
    ) or "_Aucune irrégularité détectée_"

    droits_text = "\n".join(f"✅ {d}" for d in droits) or "_Voir analyse complète_"

    summary = (
        f"📋 *{result.get('type_document', 'Document')}*\n\n"
        f"{result.get('resume', '')}\n\n"
        f"*Irrégularités détectées :*\n{irr_text}\n\n"
        f"*Tes droits :*\n{droits_text}\n\n"
        f"⏰ *Délais :* {result.get('delais', 'À vérifier')}"
    )

    await update.message.reply_text(summary[:4096], parse_mode="Markdown")

    lettre = result.get("lettre", "")
    if lettre:
        await update.message.reply_text(
            f"📄 *Lettre de réponse générée :*\n\n{lettre[:3800]}",
            parse_mode="Markdown",
        )
        await update.message.reply_document(
            document=lettre.encode("utf-8"),
            filename="lettre_contestation.txt",
            caption="📎 Ta lettre  prête à envoyer.",
        )

    keyboard = [[InlineKeyboardButton("🔄 Analyser un autre document", callback_data="restart")]]
    await update.message.reply_text(
        "✨ Analyse terminée. Tu peux aussi utiliser l'app web sur justixia.com",
        reply_markup=InlineKeyboardMarkup(keyboard),
    )


async def restart_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    context.user_data.clear()
    await start(update, context)


def main():
    app = Application.builder().token(TELEGRAM_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CallbackQueryHandler(lang_callback, pattern=r"^lang:"))
    app.add_handler(CallbackQueryHandler(restart_callback, pattern=r"^restart$"))
    app.add_handler(MessageHandler(filters.Document.ALL | filters.PHOTO, handle_document))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_text))
    print("🤖 JustiXia Bot démarré")
    app.run_polling()


if __name__ == "__main__":
    main()

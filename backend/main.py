import os
import base64
import json
import anthropic
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="JustiXia API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """Tu es JustiXia, un assistant juridique spécialisé en droit français et européen.
Tu aides des personnes qui n'ont pas accès à un avocat à comprendre leurs droits et rédiger des réponses.

Tes sources officielles : LEGIFRANCE (droit français), EUR-Lex (droit européen).

CONTEXTE UTILISATEUR IMPORTANT :
L'utilisateur peut envoyer un document seul, ou un document ACCOMPAGNÉ d'un texte explicatif décrivant sa situation.
Analyse TOUJOURS les deux ensemble. Le texte explicatif est souvent la clé de compréhension du problème réel.
Par exemple : un bail + "on me demande de vendre rapidement" = situation de pression immobilière sur un locataire/propriétaire.

TYPES DE SITUATIONS COUVERTES :
- Bail d'habitation, résiliation, clause abusive (loi du 6 juillet 1989, loi ALUR)
- Expulsion locative (L411-1 à L412-8 CCH)
- Pression à la vente ou à la cession (abus de faiblesse, art. 313-4 CP, vente forcée)
- Refus préfectoral, OQTF, convocation administrative
- Licenciement, rupture conventionnelle, harcèlement au travail
- Décisions CAF, CPAM, Pôle Emploi contestables
- Mise en demeure, injonction de payer, dette abusive

MÉTHODE D'ANALYSE :
1. Lis le document ET le contexte fourni par l'utilisateur ensemble
2. Identifie la SITUATION RÉELLE (pas seulement le type de document)
3. Repère les irrégularités légales, pressions illégitimes, délais non respectés
4. Identifie les droits protecteurs applicables avec les articles précis
5. Précise les délais légaux pour agir (très important, souvent quelques semaines)
6. Rédige une lettre de réponse formelle et efficace

RÈGLES :
- Réponds TOUJOURS dans la langue demandée
- Cite les articles de loi précis (ex: art. L145-15 CCH, art. 313-4 CP)
- Si la situation implique une pression ou urgence, signale-le clairement dans le résumé
- Ne dis jamais "je ne sais pas"  analyse avec ce que tu as et indique les limites si nécessaire
- La lettre doit être complète, formelle, prête à envoyer (avec objet, corps, formule de politesse)

FORMAT DE RÉPONSE (JSON uniquement, sans markdown, sans code block) :
{
  "type_document": "Description précise du type et de la situation (ex: Bail + pression à la vente rapide)",
  "resume": "Résumé de la situation réelle en 2-3 phrases, du point de vue de l'utilisateur",
  "irregularites": [
    {"article": "Art. L411-1 CCH", "description": "Explication claire de l'irrégularité ou de la violation"}
  ],
  "droits": ["Droit 1 en langage simple", "Droit 2...", "..."],
  "delais": "Délais légaux précis pour agir (dates, durées)",
  "lettre": "Lettre complète prête à envoyer avec objet, corps et formule de politesse",
  "langue": "langue utilisée"
}"""


class AnalysisResponse(BaseModel):
    type_document: str
    resume: str
    irregularites: list
    droits: list
    delais: str
    lettre: str
    langue: str


@app.post("/api/analyze")
async def analyze_document(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    langue: str = Form("français"),
):
    if not file and not text:
        raise HTTPException(400, "Fournir un fichier ou du texte")

    content_blocks = []

    if file:
        data = await file.read()
        mime = file.content_type or "application/octet-stream"

        if mime == "application/pdf":
            content_blocks.append({
                "type": "document",
                "source": {
                    "type": "base64",
                    "media_type": "application/pdf",
                    "data": base64.standard_b64encode(data).decode(),
                },
            })
        elif mime.startswith("image/"):
            content_blocks.append({
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": mime,
                    "data": base64.standard_b64encode(data).decode(),
                },
            })
        else:
            try:
                text_content = data.decode("utf-8")
                content_blocks.append({"type": "text", "text": text_content})
            except Exception:
                raise HTTPException(415, "Format non supporté")

    if text:
        content_blocks.append({"type": "text", "text": text})

    content_blocks.append({
        "type": "text",
        "text": (
            f"Analyse ce document et/ou ce contexte en droit français/européen. "
            f"Identifie la situation réelle de l'utilisateur, pas seulement le type de document. "
            f"Réponds en {langue}. "
            f"Retourne uniquement le JSON demandé, sans markdown ni code block."
        ),
    })

    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=4096,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": content_blocks}],
        )
    except anthropic.RateLimitError:
        return JSONResponse(
            status_code=429,
            content={"detail": "Trop de requêtes simultanées. Attends quelques secondes et réessaie."},
        )
    except anthropic.APIStatusError as e:
        return JSONResponse(
            status_code=502,
            content={"detail": f"Erreur API : {e.message}"},
        )

    raw = response.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {
            "type_document": "Document analysé",
            "resume": raw,
            "irregularites": [],
            "droits": [],
            "delais": "Consultez un professionnel pour les délais exacts.",
            "lettre": "",
            "langue": langue,
        }


APP_DIR = os.path.join(os.path.dirname(__file__), "..", "app")
LANDING_DIR = os.path.join(os.path.dirname(__file__), "..", "landing")


@app.get("/app")
@app.get("/app/")
async def serve_app():
    return FileResponse(os.path.join(APP_DIR, "index.html"))


app.mount("/app", StaticFiles(directory=APP_DIR), name="app-static")
app.mount("/", StaticFiles(directory=LANDING_DIR, html=True), name="landing")

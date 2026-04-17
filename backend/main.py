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
Tu aides des personnes qui n'ont pas accès à un avocat à comprendre leurs droits et à rédiger des réponses.

Tes sources : LEGIFRANCE (droit français), EUR-Lex (droit européen).

Pour chaque document analysé, tu dois :
1. Identifier le TYPE de document (bail, avis d'expulsion, refus préfectoral, licenciement, etc.)
2. Lister les IRRÉGULARITÉS et violations de droits avec les articles de loi précis
3. Expliquer les DROITS de la personne en langage simple
4. Indiquer les DÉLAIS LÉGAUX à respecter pour contester
5. Rédiger une LETTRE DE RÉPONSE formelle, citant les articles de loi pertinents

Réponds TOUJOURS dans la langue demandée par l'utilisateur.
Sois précis sur les articles de loi (L412-1, R412-1, etc.).
Ton ton est humain, bienveillant, et accessible — jamais condescendant.

FORMAT DE RÉPONSE (JSON uniquement) :
{
  "type_document": "...",
  "resume": "...",
  "irregularites": [
    {"article": "Art. X", "description": "..."}
  ],
  "droits": ["...", "..."],
  "delais": "...",
  "lettre": "...",
  "langue": "..."
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
        "text": f"Analyse ce document en droit français/européen. Réponds en {langue}. Retourne uniquement le JSON demandé, sans markdown ni code block.",
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

import os
import base64
import json
import secrets
import anthropic
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

# ── Supabase (optionnel — activé si SUPABASE_URL est défini) ──────────────────
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

def get_supabase():
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise HTTPException(503, "Base de données non configurée. Ajoute SUPABASE_URL et SUPABASE_SERVICE_KEY.")
    from supabase import create_client
    return create_client(SUPABASE_URL, SUPABASE_KEY)

# ── Auth simple par token JWT-like ────────────────────────────────────────────
security = HTTPBearer(auto_error=False)
DASHBOARD_PASSWORD = os.environ.get("DASHBOARD_PASSWORD", "justixia2026")

# Tokens en mémoire (suffit pour hackathon — reset au redémarrage)
_tokens: dict[str, str] = {}

def require_auth(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials or credentials.credentials not in _tokens:
        raise HTTPException(401, "Non autorisé. Connecte-toi sur /dashboard/login.html")
    return _tokens[credentials.credentials]

# ── SYSTEM PROMPT ─────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """Tu es JustiXia, un assistant juridique spécialisé en droit français et européen.
Tu aides des personnes qui n'ont pas accès à un avocat à comprendre leurs droits et rédiger des réponses.

Tes sources officielles : LEGIFRANCE (droit français), EUR-Lex (droit européen).

CONTEXTE UTILISATEUR IMPORTANT :
L'utilisateur peut envoyer un document seul, ou un document ACCOMPAGNÉ d'un texte explicatif décrivant sa situation.
Analyse TOUJOURS les deux ensemble. Le texte explicatif est souvent la clé de compréhension du problème réel.

TYPES DE SITUATIONS COUVERTES :
- Bail d'habitation, résiliation, clause abusive (loi du 6 juillet 1989, loi ALUR)
- Expulsion locative (L411-1 à L412-8 CCH)
- Pression à la vente ou à la cession (abus de faiblesse, art. 313-4 CP)
- Refus préfectoral, OQTF, convocation administrative
- Licenciement, rupture conventionnelle, harcèlement au travail
- Décisions CAF, CPAM, Pôle Emploi contestables
- Mise en demeure, injonction de payer, dette abusive

MÉTHODE :
1. Lis le document ET le contexte fourni ensemble
2. Identifie la SITUATION RÉELLE (pas seulement le type de document)
3. Repère les irrégularités légales avec articles précis
4. Identifie les droits protecteurs applicables
5. Précise les délais légaux pour agir
6. Rédige une lettre de réponse formelle complète

RÈGLES :
- Réponds TOUJOURS dans la langue demandée
- Cite les articles de loi précis (ex: art. L145-15 CCH)
- La lettre doit être complète, formelle, prête à envoyer

FORMAT DE RÉPONSE (JSON uniquement, sans markdown) :
{
  "type_document": "Description précise du type et de la situation",
  "resume": "Résumé de la situation réelle en 2-3 phrases",
  "irregularites": [{"article": "Art. L411-1 CCH", "description": "Explication claire"}],
  "droits": ["Droit 1 en langage simple", "Droit 2..."],
  "delais": "Délais légaux précis pour agir",
  "lettre": "Lettre complète prête à envoyer avec objet, corps et formule de politesse",
  "langue": "langue utilisée"
}"""


# ── AUTH ──────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/api/auth/login")
async def login(body: LoginRequest):
    if body.password != DASHBOARD_PASSWORD:
        raise HTTPException(401, "Email ou mot de passe incorrect.")
    token = secrets.token_urlsafe(32)
    _tokens[token] = body.email
    return {"token": token, "email": body.email}

@app.post("/api/auth/logout")
async def logout(email: str = Depends(require_auth), credentials: HTTPAuthorizationCredentials = Depends(security)):
    _tokens.pop(credentials.credentials, None)
    return {"ok": True}


# ── ANALYSE ───────────────────────────────────────────────────────────────────

@app.post("/api/analyze")
async def analyze_document(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    langue: str = Form("français"),
    save: Optional[str] = Form(None),
    token: Optional[str] = Form(None),
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
                "source": {"type": "base64", "media_type": "application/pdf", "data": base64.standard_b64encode(data).decode()},
            })
        elif mime.startswith("image/"):
            content_blocks.append({
                "type": "image",
                "source": {"type": "base64", "media_type": mime, "data": base64.standard_b64encode(data).decode()},
            })
        else:
            try:
                content_blocks.append({"type": "text", "text": data.decode("utf-8")})
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
        return JSONResponse(status_code=429, content={"detail": "Trop de requêtes simultanées. Attends quelques secondes et réessaie."})
    except anthropic.APIStatusError as e:
        return JSONResponse(status_code=502, content={"detail": f"Erreur API : {e.message}"})

    raw = response.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]

    try:
        result = json.loads(raw)
    except json.JSONDecodeError:
        result = {
            "type_document": "Document analysé",
            "resume": raw,
            "irregularites": [],
            "droits": [],
            "delais": "Consultez un professionnel pour les délais exacts.",
            "lettre": "",
            "langue": langue,
        }

    # Sauvegarde auto si token dashboard fourni
    if save == "true" and token and token in _tokens:
        try:
            sb = get_supabase()
            sb.table("cases").insert({
                "type_document": result.get("type_document"),
                "resume":        result.get("resume"),
                "irregularites": result.get("irregularites"),
                "droits":        result.get("droits"),
                "delais":        result.get("delais"),
                "lettre":        result.get("lettre"),
                "langue":        result.get("langue"),
                "status":        "open",
            }).execute()
        except Exception:
            pass  # Sauvegarde silencieuse — ne bloque pas la réponse

    return result


# ── CASES CRUD ────────────────────────────────────────────────────────────────

class CasePatch(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

@app.post("/api/cases")
async def create_case(body: dict, email: str = Depends(require_auth)):
    sb = get_supabase()
    row = {k: body[k] for k in ("type_document","resume","irregularites","droits","delais","lettre","langue") if k in body}
    row["status"] = "open"
    result = sb.table("cases").insert(row).execute()
    return result.data[0]

@app.get("/api/cases")
async def list_cases(email: str = Depends(require_auth)):
    sb = get_supabase()
    result = sb.table("cases").select("*").order("created_at", desc=True).execute()
    return {"cases": result.data}

@app.get("/api/cases/{case_id}")
async def get_case(case_id: str, email: str = Depends(require_auth)):
    sb = get_supabase()
    result = sb.table("cases").select("*").eq("id", case_id).single().execute()
    if not result.data:
        raise HTTPException(404, "Dossier introuvable")
    return result.data

@app.patch("/api/cases/{case_id}")
async def patch_case(case_id: str, body: CasePatch, email: str = Depends(require_auth)):
    sb = get_supabase()
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(400, "Aucun champ à mettre à jour")
    result = sb.table("cases").update(updates).eq("id", case_id).execute()
    return result.data[0] if result.data else {"ok": True}

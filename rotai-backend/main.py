from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import json
from typing import Optional, List
import sqlite3
from passlib.context import CryptContext

app = FastAPI(title="AlgoRota AI Motoru")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATABASE AYARLARI (SQLite) ---
def init_db():
    conn = sqlite3.connect('algorota.db')
    cursor = conn.cursor()
    # Kullanıcılar tablosu
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT,
            interests TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# --- ŞİFRELEME AYARLARI (REQ.NF.06) ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# --- GEMINI AYARLARI ---
API_KEY = "AIzaSyBY8n4zZGLmrblojj5uU6DcrVccQX4DNOQ"
genai.configure(api_key=API_KEY)
uygun_modeller = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
model = genai.GenerativeModel(uygun_modeller[0])

# --- TÜRKİYE ŞEHİR VERİTABANI ---
CITIES_DB = [
    {
        "id": "istanbul",
        "name": "İstanbul",
        "region": "Marmara",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Hagia_Sophia_Mars_2013.jpg/320px-Hagia_Sophia_Mars_2013.jpg",
        "description": "Doğu ile Batı'nın buluşma noktası, tarihin her köşede yaşandığı eşsiz şehir.",
        "culture": "İstanbul, Bizans ve Osmanlı kültürünün iç içe geçtiği köklü bir medeniyete sahiptir.",
        "popular_foods": ["Balık Ekmek", "Midye Dolma", "Simit"],
        "tags": ["tarih", "kültür", "gastronomi"],
        "visit_count": 9800
    },
    {
        "id": "ankara",
        "name": "Ankara",
        "region": "İç Anadolu",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Ankara_Kales%C3%AClacak.jpg/320px-Ankara_Kales%C3%AClacak.jpg",
        "description": "Türkiye'nin başkenti, tarihi kalesi ve müzeleriyle kültür şehri.",
        "culture": "Atatürk'ün mirası ve cumhuriyet tarihi ile iç içe geçmiş modern Türkiye'nin kalbi.",
        "popular_foods": ["Ankara Tavası", "Beypazarı Kurusu"],
        "tags": ["tarih", "müze", "kültür"],
        "visit_count": 5400
    },
    {
        "id": "izmir",
        "name": "İzmir",
        "region": "Ege",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Saat_Kulesi_Konak_2012.jpg/320px-Saat_Kulesi_Konak_2012.jpg",
        "description": "Ege'nin incisi, kozmopolit yapısı ve deniz kıyısıyla yaşam dolu şehir.",
        "culture": "Özgür ruhu, deniz kültürü ve tarihi çarşılarıyla Türkiye'nin en yaşanabilir şehirlerinden biri.",
        "popular_foods": ["Boyoz", "Kumru"],
        "tags": ["deniz", "gastronomi", "kültür"],
        "visit_count": 7200
    },
    {
        "id": "cappadocia",
        "name": "Kapadokya",
        "region": "İç Anadolu",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Cappadocia_Landscape.jpg/320px-Cappadocia_Landscape.jpg",
        "description": "Peri bacaları, yeraltı şehirleri ve sıcak hava balonlarıyla eşsiz coğrafya.",
        "culture": "Hitit, Roma ve Bizans kültürlerinin izlerini taşıyan, dünyaca ünlü kaya kiliselerine ev sahipliği yapar.",
        "popular_foods": ["Testi Kebabı", "Mantı"],
        "tags": ["doğa", "tarih", "balon"],
        "visit_count": 8900
    },
    {
        "id": "antalya",
        "name": "Antalya",
        "region": "Akdeniz",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Antalya_city.jpg/320px-Antalya_city.jpg",
        "description": "Turquoise kıyılar, antik kentler ve lüks tatil olanaklarıyla Akdeniz'in gözdesi.",
        "culture": "Likya uygarlığının izlerini taşır, kaleiçi tarihi dokusuyla zamanda yolculuk hissi verir.",
        "popular_foods": ["Piyaz", "Şiş Köfte"],
        "tags": ["deniz", "tarih", "doğa"],
        "visit_count": 11200
    }
]

POPULAR_PLACES = [
    {"id": "p1", "city": "İstanbul", "name": "Ayasofya", "category": "tarih", "rating": 4.9, "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Hagia_Sophia_Mars_2013.jpg/320px-Hagia_Sophia_Mars_2013.jpg"},
    {"id": "p2", "city": "Kapadokya", "name": "Göreme Açık Hava Müzesi", "category": "tarih", "rating": 4.8, "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Cappadocia_Landscape.jpg/320px-Cappadocia_Landscape.jpg"},
]

# --- REQUEST MODELLERİ ---
class UserRegister(BaseModel):
    email: str
    password: str
    name: Optional[str] = "Gezgin"

class UserLogin(BaseModel):
    email: str
    password: str

class RouteRequest(BaseModel):
    city: str
    days: int
    interests: Optional[List[str]] = []
    budget: Optional[str] = "orta"
    pace: Optional[str] = "normal"

# --- AUTH ENDPOINT'LERİ ---

@app.post("/auth/register")
def register(user: UserRegister):
    conn = sqlite3.connect('algorota.db')
    cursor = conn.cursor()
    try:
        hashed_pw = get_password_hash(user.password)
        cursor.execute('INSERT INTO users (email, password, name) VALUES (?, ?, ?)', (user.email, hashed_pw, user.name))
        conn.commit()
        return {"status": "success", "message": "Kayıt başarılı"}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Bu e-posta adresi zaten kayıtlı")
    finally:
        conn.close()

@app.post("/auth/login")
def login(user: UserLogin):
    conn = sqlite3.connect('algorota.db')
    cursor = conn.cursor()
    cursor.execute('SELECT password, name, email FROM users WHERE email = ?', (user.email,))
    db_user = cursor.fetchone()
    conn.close()

    if db_user and verify_password(user.password, db_user[0]):
        return {
            "status": "success",
            "user": {
                "name": db_user[1],
                "email": db_user[2]
            }
        }
    raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı")

# --- GEZİ ENDPOINT'LERİ ---

@app.get("/cities")
def get_cities(search: Optional[str] = None):
    result = CITIES_DB
    if search:
        result = [c for c in result if search.lower() in c["name"].lower()]
    return {"status": "success", "cities": result}

@app.get("/cities/{city_id}")
def get_city_detail(city_id: str):
    city = next((c for c in CITIES_DB if c["id"] == city_id), None)
    if not city:
        raise HTTPException(status_code=404, detail="Şehir bulunamadı")
    return {"status": "success", "city": city}

@app.get("/popular")
def get_popular():
    sorted_cities = sorted(CITIES_DB, key=lambda x: x["visit_count"], reverse=True)[:5]
    return {"status": "success", "popular_cities": sorted_cities, "popular_places": POPULAR_PLACES}

@app.post("/generate-route")
def generate_route(req: RouteRequest):
    try:
        interests_str = ", ".join(req.interests) if req.interests else "genel"
        budget_map = {"düşük": "ekonomik", "orta": "orta bütçe", "yüksek": "premium"}
        pace_map = {"yavaş": "2-3 mekan/gün", "normal": "3-4 mekan/gün", "yoğun": "5-6 mekan/gün"}

        prompt = f"""
        Sen profesyonel bir Türkiye gezi asistanısın. {req.city} için {req.days} günlük rota planla.
        İlgi alanları: {interests_str}. Bütçe: {budget_map.get(req.budget)}. Tempo: {pace_map.get(req.pace)}.
        SADECE JSON döndür. Koordinatları (lat, lng) ekle.
        """
        response = model.generate_content(prompt)
        ai_text = response.text.strip()
        if "```json" in ai_text:
            ai_text = ai_text.split("```json")[1].split("```")[0]
        return {"status": "success", "route_plan": json.loads(ai_text)}
    except Exception as e:
        return {"status": "error", "message": str(e)}
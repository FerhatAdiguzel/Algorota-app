from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import json
import os
from dotenv import load_dotenv
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
    # Geri bildirimler tablosu (REQ.F.18)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            type TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("GEMINI_API_KEY ortam değişkeni bulunamadı. Lütfen .env dosyanızı kontrol edin.")
genai.configure(api_key=API_KEY)
model = None
try:
    uygun_modeller = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
    model = genai.GenerativeModel(uygun_modeller[0])
except Exception as e:
    # Gemini erişimi yoksa (geçersiz API anahtarı vb.) backend yine de açılsın;
    # yalnızca rota üretme özelliği bu anahtar düzeltilene kadar çalışmaz.
    print(f"[UYARI] Gemini modeli başlatılamadı: {e}. Rota üretme devre dışı, diğer özellikler çalışır.")

# --- TÜRKİYE ŞEHİR VERİTABANI (REQ.F.04, REQ.F.06, REQ.F.07, REQ.F.08) ---
CITIES_DB = [
    {
        "id": "istanbul",
        "name": "İstanbul",
        "region": "Marmara",
        "image": "https://images.unsplash.com/photo-1493087670264-2f7f5844b402?w=600",
        "description": "Doğu ile Batı'nın buluşma noktası, tarihin her köşede yaşandığı eşsiz şehir.",
        "culture": "İstanbul, Bizans ve Osmanlı kültürünün iç içe geçtiği köklü bir medeniyete sahiptir.",
        "popular_foods": [
            {"name": "Balık Ekmek", "desc": "Tarihi Eminönü teknelerinde taze pişirilen ekmek arası ızgara uskumru."},
            {"name": "Midye Dolma", "desc": "Baharatlı iç pilavla doldurulmuş, bol limon sıkılarak yenen enfes sokak lezzeti."},
            {"name": "Simit", "desc": "Pekmez ve susamla kaplanmış, çıtır çıtır geleneksel Türk halkası."}
        ],
        "places": [
            {"name": "Ayasofya-i Kebir Camii", "desc": "Tarihin en büyük mimari eserlerinden biri, köklü bir ibadethane ve müze geçmişine sahip.", "image": "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=600"},
            {"name": "Topkapı Sarayı", "desc": "Osmanlı padişahlarının yüzyıllarca ikamet ettiği, kutsal emanetlerin de sergilendiği saray.", "image": "https://images.unsplash.com/photo-1621871909102-140999c5129d?w=600"},
            {"name": "Kız Kulesi", "desc": "Boğazın ortasında yer alan, hakkında pek çok efsane barındıran büyüleyici tarihi kule.", "image": "https://images.unsplash.com/photo-1548678957-f6c7229d99c1?w=600"}
        ],
        "tags": ["tarih", "kültür", "gastronomi"],
        "visit_count": 9800
    },
    {
        "id": "ankara",
        "name": "Ankara",
        "region": "İç Anadolu",
        "image": "https://upload.wikimedia.org/wikipedia/commons/8/86/Ankara_Castle.jpg",
        "description": "Türkiye'nin başkenti, tarihi kalesi ve müzeleriyle kültür şehri.",
        "culture": "Atatürk'ün mirası ve cumhuriyet tarihi ile iç içe geçmiş modern Türkiye'nin kalbi.",
        "popular_foods": [
            {"name": "Ankara Tavası", "desc": "Kemikli arpa şehriyeli kuzu etiyle yapılan lezzetli bir yöresel fırın yemeği."},
            {"name": "Beypazarı Kurusu", "desc": "Tereyağlı ve tarçınlı, çayın yanında tüketilen uzun süre taze kalan sert bir bisküvi."}
        ],
        "places": [
            {"name": "Anıtkabir", "desc": "Mustafa Kemal Atatürk'ün ebedi istirahatgahı olan görkemli anıt mezar.", "image": "https://images.unsplash.com/photo-1627918809462-8924b10b0a88?w=600"},
            {"name": "Ankara Kalesi", "desc": "Tarihi antik çağlara dayanan, şehrin panoramasını en güzel sunan kale.", "image": "https://images.unsplash.com/photo-1606820524458-7ca9704e6c3f?w=600"},
            {"name": "Anadolu Medeniyetleri Müzesi", "desc": "Paleolitik çağdan itibaren Anadolu tarihine ışık tutan zengin müze.", "image": "https://images.unsplash.com/photo-1566121318599-5ef2b3a4f6cf?w=600"}
        ],
        "tags": ["tarih", "müze", "kültür"],
        "visit_count": 5400
    },
    {
        "id": "izmir",
        "name": "İzmir",
        "region": "Ege",
        "image": "https://images.unsplash.com/photo-1608958416738-f99bbcd34df8?w=600",
        "description": "Ege'nin incisi, kozmopolit yapısı ve deniz kıyısıyla yaşam dolu şehir.",
        "culture": "Özgür ruhu, deniz kültürü ve tarihi çarşılarıyla Türkiye'nin en yaşanabilir şehirlerinden biri.",
        "popular_foods": [
            {"name": "Boyoz", "desc": "İzmir'e has, mayasız milföy benzeri çıtır çıtır ve yağlı enfes bir hamur işi."},
            {"name": "Kumru", "desc": "Özel nohut mayalı ekmeğin içine kaşar, sucuk, salam ve sayas peyniri doldurulan sıcak sandviç."}
        ],
        "places": [
            {"name": "Tarihi Saat Kulesi", "desc": "Konak Meydanı'nda yer alan, şehrin en bilinen sembolü ve buluşma noktası.", "image": "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=600"},
            {"name": "Efes Antik Kenti", "desc": "Dünya miras listesinde yer alan, antik dünyanın en görkemli ticaret ve kültür merkezi.", "image": "https://images.unsplash.com/photo-1608958416738-f99bbcd34df8?w=600"},
            {"name": "Kemeraltı Çarşısı", "desc": "Tarihi sokakları, hanları ve dükkanlarıyla cıvıl cıvıl bir açık hava alışveriş alanı.", "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600"}
        ],
        "tags": ["deniz", "gastronomi", "kültür"],
        "visit_count": 7200
    },
    {
        "id": "cappadocia",
        "name": "Kapadokya",
        "region": "İç Anadolu",
        "image": "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?w=600",
        "description": "Peri bacaları, yeraltı şehirleri ve sıcak hava balonlarıyla eşsiz coğrafya.",
        "culture": "Hitit, Roma ve Bizans kültürlerinin izlerini taşıyan, dünyaca ünlü kaya kiliselerine ev sahipliği yapar.",
        "popular_foods": [
            {"name": "Testi Kebabı", "desc": "Toprak çömlek veya testi içine konan et ve sebzelerin ateşte yavaşça pişirilip masada kırılmasıyla sunulan kebap."},
            {"name": "Kapadokya Mantısı", "desc": "Yoğurtlu ve tereyağlı sos eşliğinde sunulan minik ve lezzetli Kayseri usulü hamur işi."}
        ],
        "places": [
            {"name": "Göreme Açık Hava Müzesi", "desc": "Kaya içine oyulmuş manastırlar, kiliseler ve eşsiz freskler barındıran vadi.", "image": "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?w=600"},
            {"name": "Derinkuyu Yeraltı Şehri", "desc": "Binlerce insanın dışarı çıkmadan yaşayabileceği devasa mühendislik harikası yeraltı sığınağı.", "image": "https://images.unsplash.com/photo-1605538032432-a9f0c8d9baac?w=600"},
            {"name": "Uçhisar Kalesi", "desc": "Kapadokya'nın en yüksek noktası olan ve peri bacalarını kuş bakışı gören doğal kaya kalesi.", "image": "https://images.unsplash.com/photo-1616038242814-a6eac7845d88?w=600"}
        ],
        "tags": ["doğa", "tarih", "balon"],
        "visit_count": 8900
    },
    {
        "id": "antalya",
        "name": "Antalya",
        "region": "Akdeniz",
        "image": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600",
        "description": "Turkuaz kıyılar, antik kentler ve lüks tatil olanaklarıyla Akdeniz'in gözdesi.",
        "culture": "Likya uygarlığının izlerini taşır, kaleiçi tarihi dokusuyla zamanda yolculuk hissi verir.",
        "popular_foods": [
            {"name": "Antalya Piyazı", "desc": "Tahinli, sirkeli ve sarımsaklı özel bir sosla harmanlanan benzersiz fasulye salatası."},
            {"name": "Şiş Köfte", "desc": "Özel baharatlarla hazırlanan kuzu etinin şişlerde közlenerek piyazla birlikte servis edildiği lezzet."}
        ],
        "places": [
            {"name": "Kaleiçi", "desc": "Dar sokakları, tarihi konakları ve Hadrian Kapısı ile şehrin otantik kalbi.", "image": "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=600"},
            {"name": "Düden Şelalesi", "desc": "Falezlerden Akdeniz'in serin sularına dökülen büyüleyici doğa harikası şelale.", "image": "https://images.unsplash.com/photo-1615569429465-9856f6c278fb?w=600"},
            {"name": "Aspendos Antik Tiyatrosu", "desc": "Günümüze kadar en iyi korunmuş akustik harikası antik Roma tiyatrosu.", "image": "https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?w=600"}
        ],
        "tags": ["deniz", "tarih", "doğa"],
        "visit_count": 11200
    }
]



POPULAR_PLACES = [
    {"id": "p1", "city": "İstanbul", "name": "Ayasofya", "category": "tarih", "rating": 4.9, "image": "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=600&auto=format&fit=crop"},
    {"id": "p2", "city": "Kapadokya", "name": "Göreme Açık Hava Müzesi", "category": "tarih", "rating": 4.8, "image": "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?w=600&auto=format&fit=crop"},
]

# --- ENGLISH TRANSLATIONS ---
CITIES_EN = {
    "istanbul": {
        "description": "The meeting point of East and West, an exquisite city where history is lived on every corner.",
        "culture": "Istanbul has a deep-rooted civilization where Byzantine and Ottoman cultures intertwine.",
        "popular_foods": [
            {"name": "Balık Ekmek", "desc": "Grilled mackerel in bread, freshly cooked on historical Eminönü boats."},
            {"name": "Midye Dolma", "desc": "Stuffed mussels with spicy rice, an exquisite street food eaten with lots of lemon."},
            {"name": "Simit", "desc": "Traditional Turkish bagel covered with molasses and sesame seeds."}
        ],
        "places": [
            {"name": "Hagia Sophia Grand Mosque", "desc": "One of history's greatest architectural works, with a deep-rooted past as a place of worship and museum."},
            {"name": "Topkapı Palace", "desc": "The palace where Ottoman sultans resided for centuries, exhibiting sacred relics."},
            {"name": "Maiden's Tower", "desc": "A fascinating historical tower in the middle of the Bosphorus, holding many legends."}
        ]
    },
    "ankara": {
        "description": "The capital of Turkey, a cultural city with its historical castle and museums.",
        "culture": "The heart of modern Turkey intertwined with Atatürk's legacy and republican history.",
        "popular_foods": [
            {"name": "Ankara Tavası", "desc": "A delicious regional oven dish made with lamb and barley noodle."},
            {"name": "Beypazarı Kurusu", "desc": "A hard biscuit made with butter and cinnamon that stays fresh for a long time."}
        ],
        "places": [
            {"name": "Anıtkabir", "desc": "The magnificent mausoleum which is the eternal resting place of Mustafa Kemal Atatürk."},
            {"name": "Ankara Castle", "desc": "The castle dating back to ancient times, offering the best panorama of the city."},
            {"name": "Museum of Anatolian Civilizations", "desc": "A rich museum shedding light on Anatolian history since the Paleolithic age."}
        ]
    },
    "izmir": {
        "description": "The pearl of the Aegean, a cosmopolitan city full of life with its coastline.",
        "culture": "One of Turkey's most livable cities with its free spirit, sea culture and historical bazaars.",
        "popular_foods": [
            {"name": "Boyoz", "desc": "A delicious crispy and oily pastry similar to puff pastry, unique to Izmir."},
            {"name": "Kumru", "desc": "Hot sandwich filled with kashar, sujuk, salami and sayas cheese inside special chickpea yeast bread."}
        ],
        "places": [
            {"name": "Historical Clock Tower", "desc": "Located in Konak Square, the most known symbol and meeting point of the city."},
            {"name": "Ephesus Ancient City", "desc": "The most magnificent trade and cultural center of the ancient world, on the world heritage list."},
            {"name": "Kemeraltı Bazaar", "desc": "A lively open-air shopping area with historical streets, inns and shops."}
        ]
    },
    "cappadocia": {
        "description": "A unique geography with fairy chimneys, underground cities and hot air balloons.",
        "culture": "Home to world-famous rock churches, carrying traces of Hittite, Roman and Byzantine cultures.",
        "popular_foods": [
            {"name": "Testi Kebab", "desc": "Kebab served by slowly cooking meat and vegetables in a clay pot over fire and breaking it at the table."},
            {"name": "Cappadocia Manti", "desc": "Tiny and delicious Kayseri style pastry served with yogurt and butter sauce."}
        ],
        "places": [
            {"name": "Göreme Open Air Museum", "desc": "A valley containing rock-cut monasteries, churches and unique frescoes."},
            {"name": "Derinkuyu Underground City", "desc": "A massive engineering marvel underground shelter where thousands could live without going out."},
            {"name": "Uçhisar Castle", "desc": "The highest point of Cappadocia, a natural rock castle with a bird's-eye view of fairy chimneys."}
        ]
    },
    "antalya": {
        "description": "The favorite of the Mediterranean with its turquoise coasts, ancient cities and luxury holiday opportunities.",
        "culture": "Carries traces of Lycian civilization, giving a feeling of time travel with its historical Kaleiçi texture.",
        "popular_foods": [
            {"name": "Antalya Piyaz", "desc": "A unique bean salad blended with a special sauce of tahini, vinegar and garlic."},
            {"name": "Şiş Köfte", "desc": "Lamb skewered and roasted with special spices, served with piyaz."}
        ],
        "places": [
            {"name": "Kaleiçi", "desc": "The authentic heart of the city with narrow streets, historical mansions and Hadrian's Gate."},
            {"name": "Düden Waterfall", "desc": "A fascinating natural wonder waterfall cascading from cliffs into the cool waters of the Mediterranean."},
            {"name": "Aspendos Ancient Theater", "desc": "The best preserved ancient Roman theater, an acoustic marvel."}
        ]
    }
}

def translate_city(city: dict, lang: str) -> dict:
    if lang != 'en' or city["id"] not in CITIES_EN:
        return city
    
    en_data = CITIES_EN[city["id"]]
    translated = city.copy()
    translated["description"] = en_data["description"]
    translated["culture"] = en_data["culture"]
    
    # Translate popular foods
    translated["popular_foods"] = []
    for orig, tr_food in zip(city["popular_foods"], en_data["popular_foods"]):
        tf = orig.copy()
        tf["name"] = tr_food["name"]
        tf["desc"] = tr_food["desc"]
        translated["popular_foods"].append(tf)
        
    # Translate places
    translated["places"] = []
    for orig, tr_place in zip(city["places"], en_data["places"]):
        tp = orig.copy()
        tp["name"] = tr_place["name"]
        tp["desc"] = tr_place["desc"]
        translated["places"].append(tp)
        
    return translated

# --- REQUEST MODELLERİ ---
class UserRegister(BaseModel):
    email: str
    password: str
    name: Optional[str] = "Gezgin"

class UserLogin(BaseModel):
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class FeedbackRequest(BaseModel):
    email: str
    feedback_type: str  # 'uygulama' veya 'rota'
    content: str

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

@app.post("/auth/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    conn = sqlite3.connect('algorota.db')
    cursor = conn.cursor()
    cursor.execute('SELECT email FROM users WHERE email = ?', (req.email,))
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        raise HTTPException(status_code=404, detail="Bu e-posta adresine ait bir hesap bulunamadı.")
    
    return {"status": "success", "message": "Şifre sıfırlama talebi gönderildi."}

@app.post("/feedback")
def submit_feedback(req: FeedbackRequest):
    if not req.content.strip():
        raise HTTPException(status_code=400, detail="Geri bildirim içeriği boş olamaz.")
    
    conn = sqlite3.connect('algorota.db')
    cursor = conn.cursor()
    try:
        cursor.execute(
            'INSERT INTO feedback (email, type, content) VALUES (?, ?, ?)',
            (req.email, req.feedback_type, req.content)
        )
        conn.commit()
        return {"status": "success", "message": "Geri bildiriminiz başarıyla iletildi."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Geri bildirim kaydedilemedi: {str(e)}")
    finally:
        conn.close()

# --- GEZİ ENDPOINT'LERİ ---

@app.get("/cities")
def get_cities(search: Optional[str] = None, lang: str = "tr"):
    result = [translate_city(c, lang) for c in CITIES_DB]
    if search:
        result = [c for c in result if search.lower() in c["name"].lower()]
    return {"status": "success", "cities": result}

@app.get("/cities/{city_id}")
def get_city_detail(city_id: str, lang: str = "tr"):
    city = next((c for c in CITIES_DB if c["id"] == city_id), None)
    if not city:
        raise HTTPException(status_code=404, detail="Şehir bulunamadı")
    return {"status": "success", "city": translate_city(city, lang)}

@app.get("/popular")
def get_popular(lang: str = "tr"):
    sorted_cities = sorted([translate_city(c, lang) for c in CITIES_DB], key=lambda x: x["visit_count"], reverse=True)[:5]
    return {"status": "success", "popular_cities": sorted_cities, "popular_places": POPULAR_PLACES}

@app.post("/generate-route")
def generate_route(req: RouteRequest, lang: str = "tr"):
    import re
    if model is None:
        raise HTTPException(status_code=503, detail="Rota üretme servisi şu anda kullanılamıyor (Gemini API anahtarı geçersiz veya eksik).")

    interests_str = ", ".join(req.interests) if req.interests else "genel"
    budget_map = {"düşük": "ekonomik", "orta": "orta bütçe", "yüksek": "premium"}
    pace_map = {"yavaş": "2-3 mekan/gün", "normal": "3-4 mekan/gün", "yoğun": "5-6 mekan/gün"}

    language_instruction = "LÜTFEN TÜM YANITINI (json içerikleri dahil) İNGİLİZCE DİLİNDE ÜRET." if lang == "en" else "Lütfen yanıtını Türkçe üret."

    prompt = f"""Sen profesyonel bir Türkiye gezi asistanısın. {req.city} için {req.days} günlük gezi rotası planla.
İlgi alanları: {interests_str}. Bütçe: {budget_map.get(req.budget, "orta bütçe")}. Tempo: {pace_map.get(req.pace, "3-4 mekan/gün")}.
Her gün için en az 3 farklı durak olsun. Her durak şu alanlara sahip olmalı:
id (benzersiz, örn: "d1"), day (örn: "1. Gün" veya "Day 1"), time (örn: "09:00"), duration (örn: "2 saat" veya "2 hours"),
title, desc, category (tarih/doğa/gastronomi/eğlence/kültür/alışveriş), lat (float), lng (float), tips.
Yanıtın SADECE JSON dizisi olsun. Kök eleman [ ile başlasın. Markdown, açıklama veya başka metin EKLEME.
{language_instruction}"""

    last_error = None
    for attempt in range(2):
        try:
            response = model.generate_content(prompt)
            ai_text = response.text.strip()

            # JSON bloğunu temizle
            if "```json" in ai_text:
                ai_text = ai_text.split("```json")[1].split("```")[0].strip()
            elif "```" in ai_text:
                ai_text = ai_text.split("```")[1].split("```")[0].strip()

            # Regex ile JSON dizisini bul
            json_match = re.search(r'\[.*\]', ai_text, re.DOTALL)
            if json_match:
                ai_text = json_match.group(0)

            parsed = json.loads(ai_text)

            # Model diziyi bir nesne içine sardıysa çöz
            if isinstance(parsed, dict):
                list_value = next((v for v in parsed.values() if isinstance(v, list)), None)
                parsed = list_value if list_value is not None else [parsed]

            # Boş dizi kontrolü
            if isinstance(parsed, list) and len(parsed) > 0:
                return {"status": "success", "route_plan": parsed}
            else:
                last_error = "Yapay zeka boş rota döndürdü."
                continue

        except Exception as e:
            error_str = str(e).lower()
            # Kota / rate-limit hatası → tekrar deneme, direkt kullanıcıya bilgi ver
            if "quota" in error_str or "rate" in error_str or "limit" in error_str or "429" in error_str or "resource" in error_str:
                return {"status": "error", "message": "Günlük yapay zeka kullanım kotası doldu. Lütfen birkaç dakika bekleyip tekrar deneyin veya yarın tekrar kullanın."}
            last_error = "Yapay zeka yanıt veremedi."
            print(f"[HATA] Deneme {attempt+1}: {e}")
            continue

    return {"status": "error", "message": f"Rota oluşturulamadı. {last_error} Lütfen tekrar deneyin."}
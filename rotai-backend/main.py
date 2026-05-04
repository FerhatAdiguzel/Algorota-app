from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
import json

# API uygulamamızı başlatıyoruz
app = FastAPI(title="AlgoRota AI Motoru")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GEMINI YAPAY ZEKA AYARLARI
# ---------------------------------------------------------
API_KEY = "AIzaSyBY8n4zZGLmrblojj5uU6DcrVccQX4DNOQ"
genai.configure(api_key=API_KEY)
# Hangi modellerin açık olduğunu Google'a sorup otomatik buluyoruz:
uygun_modeller = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
otomatik_model = uygun_modeller[0] # Listeden ilk çalışan modeli seç

model = genai.GenerativeModel(otomatik_model)
# ---------------------------------------------------------

@app.get("/")
def read_root():
    return {"message": "AlgoRota AI Motoru Başarıyla Çalışıyor!"}

@app.get("/generate-route")
def generate_route(city: str, days: int):
    try:
        # Yapay zekaya vereceğimiz çok sıkı komut (Prompt Engineering)
        prompt = f"""
        Sen profesyonel bir gezi asistanısın. Kullanıcı senden {city} şehri için {days} günlük bir gezi rotası istiyor.
        Bana SADECE geçerli bir JSON dizisi (array) döndür. Başka hiçbir açıklama, selamlama veya markdown (```json) kodu ekleme. 
        Format BİREBİR şöyle olmalı:
        [
            {{"id": "1", "day": "1. Gün", "time": "09:00", "title": "Örnek Mekan", "desc": "Örnek açıklama"}},
            {{"id": "2", "day": "1. Gün", "time": "12:00", "title": "Örnek Yemek", "desc": "Örnek açıklama"}}
        ]
        Her gün için en az 3-4 mantıklı aktivite planla.
        """

        # Gemini'ye soruyu soruyoruz ve cevabı bekliyoruz
        response = model.generate_content(prompt)
        ai_text = response.text.strip()
        
        # Bazen yapay zeka kodları ```json formatında gönderir, onu temizliyoruz
        if ai_text.startswith("```json"):
            ai_text = ai_text[7:-3]
        elif ai_text.startswith("```"):
            ai_text = ai_text[3:-3]
            
        # Gelen metni gerçek bir JSON (liste) nesnesine çeviriyoruz
        route_data = json.loads(ai_text)

        return {
            "status": "success",
            "city": city,
            "days": days,
            "route_plan": route_data
        }

    except Exception as e:
        # Bir hata olursa mobil uygulamaya hatayı bildiriyoruz
        return {
            "status": "error",
            "message": str(e)
        }
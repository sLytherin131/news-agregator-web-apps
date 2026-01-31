import os
import asyncio
import random
from groq import Groq
from dotenv import load_dotenv
from db.supabase import supabase
from typing import List, Dict

load_dotenv()

# Configure Groq
groq_api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=groq_api_key) if groq_api_key else None

# Default model for Groq
DEFAULT_MODEL = "llama-3.3-70b-versatile"

async def call_groq_with_retry(prompt: str, retries: int = 3, initial_delay: int = 2) -> str:
    """Helper to call Groq with exponential backoff for rate limits (429)."""
    if not client:
        print("❌ Groq client not configured (missing GROQ_API_KEY)")
        return ""
        
    delay = initial_delay
    for attempt in range(retries):
        try:
            # Groq SDK handles sync by default, we wrap it for async compatibility if needed
            # but here we can just call it (Groq doesn't have a native async library like Gemini yet, 
            # so we run it in a thread pool for safety in a real async app, but for now simple call)
            completion = client.chat.completions.create(
                model=DEFAULT_MODEL,
                messages=[
                    {"role": "system", "content": "Anda adalah asisten AI yang ahli dalam analisis berita di Indonesia."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                max_tokens=1024,
            )
            return completion.choices[0].message.content.strip()
        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "rate limit" in error_str.lower():
                if attempt < retries - 1:
                    wait_time = delay + random.uniform(0, 1)
                    print(f"⚠️ Groq Rate limit hit. Retrying in {wait_time:.2f}s (Attempt {attempt + 1}/{retries})")
                    await asyncio.sleep(wait_time)
                    delay *= 2
                else:
                    print(f"❌ Max retries reached for Groq: {e}")
                    raise e
            else:
                print(f"❌ Groq error: {e}")
                raise e
    return ""

async def generate_issue_title_ai(contents: List[str]) -> str:
    """Generates a concise and neutral issue title based on all news contents."""
    if not contents:
        return ""
        
    sample_text = "\n---\n".join([c[:500] for c in contents[:5]])
    
    prompt = f"""
    Buatlah berita UTAMA/JUDUL yang singkat, padat, dan netral (maksimal 9-10 kata dan minimal 7-8 kata) berdasarkan kutipan berita berikut.
    Penting: Langsung berikan judulnya saja, tanpa awalan seperti "Isu: ", "Judul: ", atau tanda kutip.

    KUTIPAN BERITA:
    {sample_text}
    """
    
    try:
        title = await call_groq_with_retry(prompt)
        # Clean up any potential leftover "Isu: " or quotes just in case
        if title:
            title = title.strip().replace('"', '')
            if title.lower().startswith("isu:"):
                title = title[4:].strip()
            if title.lower().startswith("judul:"):
                title = title[6:].strip()
        return title
    except Exception as e:
        print(f"Title generation error: {str(e)}")
        return ""

async def generate_label_summary(contents: List[str], label: str) -> str:
    """Uses Groq to summarize news contents of a specific label."""
    if not contents:
        return ""
    
    combined_text = "\n---\n".join(contents)
    prompt = f"""
    Berikut adalah kumpulan konten berita dengan label: {label.upper()}.
    
    Tugas Anda:
    Ringkaskan seluruh konten ini menjadi poin-poin utama. 
    Format: Daftar poin (tidak perlu tuliskan atau berikan tanda bullet/ -, cukup kalimatnya saja).
    Minimal buatlah 4 poin yang sangat informatif dan mendalam.
    Gunakan Bahasa Indonesia yang baku dan objektif.

    Penting: JANGAN gunakan kalimat pembuka atau penutup seperti "Berikut adalah poin-poinnya...". Langsung berikan daftar poin-poinnya saja.

    KONTEN BERITA:
    {combined_text}
    """
    
    try:
        summary = await call_groq_with_retry(prompt)
        return summary
    except Exception as e:
        print(f"Summarization error ({label}): {str(e)}")
        return ""

async def generate_bias_comparison(summaries: Dict[str, str]) -> str:
    """Groq logic to create a bias comparison based on label summaries."""
    # Build sections only for labels that have data
    sections = []
    if summaries.get('oposisi'):
        sections.append(f"RINGKASAN OPOSISI:\n{summaries['oposisi']}\n(Penjelasan: Berita yang mengarah ke Oposisi membahas [Penjelasan singkat...])")
    if summaries.get('netral'):
        sections.append(f"RINGKASAN NETRAL:\n{summaries['netral']}\n(Penjelasan: Berita yang mengarah ke netral membahas [Penjelasan singkat...])")
    if summaries.get('pro_pemerintah'):
        sections.append(f"RINGKASAN PRO-PEMERINTAH:\n{summaries['pro_pemerintah']}\n(Penjelasan: Berita yang mengarah ke Pro Pemerintah membahas [Penjelasan singkat...])")
    
    if not sections:
        return ""

    combined_input = "\n\n".join(sections)

    prompt = f"""
    Anda adalah asisten AI analis politik.
    Berikut adalah ringkasan berita dari beberapa sudut pandang mengenai satu isu yang sama:
    
    {combined_input}
    
    Tugas Anda:
    Buatlah "Bias Comparison" (Perbandingan Bias) dalam Bahasa Indonesia.
    
    Aturan Format:
    1. Untuk setiap label yang ada (Oposisi/Netral/Pro Pemerintah), buatlah analisis gaya pelaporan berita yang mendalam (40-55 kata per paragraf).
    2. Ikuti pola gaya bahasa ini untuk setiap label: 
       - Pemberitaan [Label] menekankan pada [Tema Utama], menonjolkan [Detail Spesifik], serta menggunakan istilah seperti '[Istilah]' untuk mempertegas [Risiko/Nada].
       - Media [Label] membingkai isu ini sebagai '[Frame/Slogan]', berfokus pada [Hasil Potensial] dan menegaskan [Klaim Spesifik], mencerminkan nada yang [Sifat Tone].
    3. PENTING: Pisahkan setiap bagian (antar Label, dan antara Label dengan Analisa Perbandingan) dengan **DUA BARIS BARU (double newline / \n\n)**.
    4. JANGAN gunakan nomor urut (1, 2, 3) atau tanda bullet (•). Langsung paragraf mengalir.
    5. HANYA bahas label yang benar-benar ada datanya di atas.
    6. Di bagian paling akhir, buatlah satu paragraf "Analisa perbandingannya" (30-45 kata) yang merangkum titik temu dan titik perbedaan utama antar perspektif.
    7. JANGAN tulis kata "Kesimpulan:". Gunakan kalimat pembuka seperti "Analisa perbandingannya: All perspectives agree..." (dalam Bahasa Indonesia).
    8. Setiap kalimat harus ditutup dengan tanda titik. JANGAN berikan awalan, akhiran, atau tanda kutip pada seluruh output.
    
    Output harus berupa paragraf murni, tanpa simbol daftar apa pun.
    """
    
    try:
        comparison = await call_groq_with_retry(prompt)
        return comparison
    except Exception as e:
        print(f"Comparison error: {str(e)}")
        return ""

async def process_issue_summarization(issue_id: int):
    """Orchestrates the whole summarization process for an issue."""
    # Fetch issue details first to check for existing title
    issue_res = supabase.table("issues").select("title").eq("id", issue_id).single().execute()
    current_title = issue_res.data.get("title") if issue_res.data else ""
    
    res = supabase.table("news_issues") \
        .select("news(content, label)") \
        .eq("issue_id", issue_id) \
        .execute()
    
    if not res.data:
        return None
    
    grouped_contents = {
        "oposisi": [],
        "netral": [],
        "pro_pemerintah": []
    }
    
    for entry in res.data:
        news = entry["news"]
        label = news.get("label")
        if label in grouped_contents:
            grouped_contents[label].append(news["content"])
    
    summaries = {}
    for label, contents in grouped_contents.items():
        if contents:
            summaries[label] = await generate_label_summary(contents, label)
        else:
            summaries[label] = ""
            
    summarize_all = await generate_bias_comparison(summaries)
    
    update_data = {
        "summarize_oposisi": summaries.get("oposisi"),
        "summarize_netral": summaries.get("netral"),
        "summarize_pro_pemerintah": summaries.get("pro_pemerintah"),
        "summarize_all": summarize_all,
        "timemodified": "now()"
    }
    
    # Only generate AI title if current title is empty or is the generic "Isu: ..." fallback
    # This preserves titles already generated by AI or edited by the admin.
    if not current_title or current_title.startswith("Isu: "):
        all_content_list = []
        for contents in grouped_contents.values():
            all_content_list.extend(contents)
        
        ai_title = await generate_issue_title_ai(all_content_list)
        if ai_title:
            update_data["title"] = ai_title
    
    supabase.table("issues").update(update_data).eq("id", issue_id).execute()
    
    return update_data

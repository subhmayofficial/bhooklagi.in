import os
import requests
from dotenv import load_dotenv

load_dotenv('.env.local')
url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}"
}
res = requests.get(f"{url}/rest/v1/store_settings?select=*", headers=headers)
print("status:", res.status_code)
print("text:", res.text)

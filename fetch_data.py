import urllib.request
import json

def fetch_data(url):
    try:
        print(f"Mengambil data dari {url} menggunakan Python...")
        with urllib.request.urlopen(url) as response:
            data = response.read().decode('utf-8')
            # Jika JSON, kita parse agar rapi
            try:
                parsed_data = json.loads(data)
                print("Hasil Fetching (JSON):")
                print(json.dumps(parsed_data, indent=2))
            except json.JSONDecodeError:
                print("Hasil Fetching (Teks):")
                print(data)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    url_to_fetch = "https://jsonplaceholder.typicode.com/posts/1"
    fetch_data(url_to_fetch)

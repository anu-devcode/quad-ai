import asyncio
from httpx import ASGITransport, AsyncClient
from src.api import app

async def test():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "user_id": 12345,
            "signup_time": "2026-01-01 10:00:00",
            "purchase_time": "2026-01-02 12:00:00",
            "purchase_value": 50.0,
            "device_id": "DEV6789",
            "source": "SEO",
            "browser": "Chrome",
            "sex": "M",
            "age": 30,
            "ip_address": 123456789.0,
            "user_transaction_count": 1,
            "device_transaction_count": 1
        }
        print(f"Sending payload: {payload}")
        response = await ac.post("/predict", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")

if __name__ == "__main__":
    asyncio.run(test())

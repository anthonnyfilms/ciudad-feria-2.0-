import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

categorias_iniciales = [
    {
        "id": "conciertos",
        "nombre": "Conciertos",
        "slug": "conciertos",
        "color": "#EF4444",
        "icono": "🎵",
        "orden": 1,
        "fecha_creacion": "2025-12-20T00:00:00Z"
    },
    {
        "id": "culturales",
        "nombre": "Culturales",
        "slug": "culturales",
        "color": "#F59E0B",
        "icono": "🎭",
        "orden": 2,
        "fecha_creacion": "2025-12-20T00:00:00Z"
    },
    {
        "id": "deportivos",
        "nombre": "Deportivos",
        "slug": "deportivos",
        "color": "#10B981",
        "icono": "⚽",
        "orden": 3,
        "fecha_creacion": "2025-12-20T00:00:00Z"
    }
]

async def seed_categorias():
    print("Verificando categorías existentes...")
    count = await db.categorias.count_documents({})
    
    if count > 0:
        print(f"Ya existen {count} categorías en la base de datos.")
        respuesta = input("¿Deseas mantener las categorías existentes? (s/n): ")
        if respuesta.lower() == 's':
            print("Manteniendo categorías existentes.")
            return
        else:
            await db.categorias.delete_many({})
            print("Categorías existentes eliminadas.")
    
    print("Insertando categorías iniciales...")
    result = await db.categorias.insert_many(categorias_iniciales)
    print(f"✅ {len(result.inserted_ids)} categorías insertadas exitosamente!")
    
    await db.categorias.create_index("slug", unique=True)
    await db.categorias.create_index("orden")
    print("✅ Índices creados exitosamente!")

if __name__ == "__main__":
    asyncio.run(seed_categorias())
    client.close()
    print("\n🎉 Categorías inicializadas con éxito!")
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

eventos_iniciales = [
    {
        "id": "concierto-feria-2026",
        "nombre": "Gran Concierto de la Feria",
        "descripcion": "El evento musical más esperado de San Sebastián 2026. Disfruta de los mejores artistas venezolanos en una noche inolvidable.",
        "fecha": "2026-01-20",
        "hora": "20:00",
        "ubicacion": "Plaza de Toros de San Cristóbal",
        "categoria": "conciertos",
        "precio": 50.00,
        "imagen": "https://images.unsplash.com/photo-1760965825135-e94f4e34494b?crop=entropy&cs=srgb&fm=jpg&q=85",
        "asientos_disponibles": 5000,
        "fecha_creacion": "2025-12-20T00:00:00Z"
    },
    {
        "id": "desfile-carrozas-2026",
        "nombre": "Desfile de Carrozas y Comparsas",
        "descripcion": "El tradicional desfile que llena de color y alegría las calles de San Cristóbal. Un espectáculo familiar lleno de tradición.",
        "fecha": "2026-01-18",
        "hora": "15:00",
        "ubicacion": "Avenida Principal",
        "categoria": "culturales",
        "precio": 25.00,
        "imagen": "https://images.unsplash.com/photo-1659700570209-6446cca08ad8?crop=entropy&cs=srgb&fm=jpg&q=85",
        "asientos_disponibles": 10000,
        "fecha_creacion": "2025-12-20T00:00:00Z"
    },
    {
        "id": "corrida-toros-2026",
        "nombre": "Corrida de Toros Tradicional",
        "descripcion": "La corrida de toros más importante del Táchira. Un evento que mantiene viva la tradición taurina venezolana.",
        "fecha": "2026-01-22",
        "hora": "16:00",
        "ubicacion": "Plaza de Toros Monumental",
        "categoria": "deportivos",
        "precio": 75.00,
        "imagen": "https://images.unsplash.com/photo-1750323313940-a267ef7d89fa?crop=entropy&cs=srgb&fm=jpg&q=85",
        "asientos_disponibles": 3000,
        "fecha_creacion": "2025-12-20T00:00:00Z"
    },
    {
        "id": "vuelta-tachira-2026",
        "nombre": "Vuelta Ciclística al Táchira",
        "descripcion": "La competencia ciclística más importante de la región. Disfruta de la emoción del deporte en las montañas tachirenses.",
        "fecha": "2026-01-15",
        "hora": "08:00",
        "ubicacion": "Circuito San Cristóbal",
        "categoria": "deportivos",
        "precio": 15.00,
        "imagen": "https://images.unsplash.com/photo-1750323313934-46d942e6afb7?crop=entropy&cs=srgb&fm=jpg&q=85",
        "asientos_disponibles": 2000,
        "fecha_creacion": "2025-12-20T00:00:00Z"
    },
    {
        "id": "noche-gastronomica-2026",
        "nombre": "Noche Gastronómica Tachirense",
        "descripcion": "Degusta lo mejor de la gastronomía tachirense. Platos típicos, dulces tradicionales y más en una noche especial.",
        "fecha": "2026-01-19",
        "hora": "19:00",
        "ubicacion": "Parque Central",
        "categoria": "culturales",
        "precio": 35.00,
        "imagen": "https://images.pexels.com/photos/18383620/pexels-photo-18383620.jpeg",
        "asientos_disponibles": 1500,
        "fecha_creacion": "2025-12-20T00:00:00Z"
    },
    {
        "id": "festival-fuegos-2026",
        "nombre": "Festival de Fuegos Artificiales",
        "descripcion": "Cierra la feria con el espectáculo pirotécnico más impresionante. Luces, colores y música en perfecta armonía.",
        "fecha": "2026-01-25",
        "hora": "21:00",
        "ubicacion": "Explanada del Estadio",
        "categoria": "conciertos",
        "precio": 20.00,
        "imagen": "https://images.unsplash.com/photo-1750323313940-a267ef7d89fa?crop=entropy&cs=srgb&fm=jpg&q=85",
        "asientos_disponibles": 8000,
        "fecha_creacion": "2025-12-20T00:00:00Z"
    }
]

async def seed_database():
    print("Verificando datos existentes...")
    count = await db.eventos.count_documents({})
    
    if count > 0:
        print(f"Ya existen {count} eventos en la base de datos.")
        respuesta = input("¿Deseas eliminar los datos existentes y recargar? (s/n): ")
        if respuesta.lower() == 's':
            await db.eventos.delete_many({})
            print("Datos existentes eliminados.")
        else:
            print("Operación cancelada.")
            return
    
    print("Insertando eventos iniciales...")
    result = await db.eventos.insert_many(eventos_iniciales)
    print(f"✅ {len(result.inserted_ids)} eventos insertados exitosamente!")
    
    await db.eventos.create_index("id", unique=True)
    await db.eventos.create_index("categoria")
    await db.entradas.create_index("email_comprador")
    await db.entradas.create_index("evento_id")
    print("✅ Índices creados exitosamente!")

if __name__ == "__main__":
    asyncio.run(seed_database())
    client.close()
    print("\n🎉 Base de datos inicializada con éxito!")
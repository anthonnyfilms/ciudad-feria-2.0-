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

metodos_pago_iniciales = [
    {
        "id": "transferencia",
        "nombre": "Transferencia Bancaria",
        "tipo": "banco",
        "informacion": "Banco: Banco de Venezuela\nCuenta: 0102-1234-56789\nTitular: Ciudad Feria\nRIF: J-12345678-9",
        "icono": "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
        "activo": True,
        "orden": 1
    },
    {
        "id": "pago-movil",
        "nombre": "Pago Móvil",
        "tipo": "movil",
        "informacion": "Banco: Banco de Venezuela\nTeléfono: 0424-1234567\nCédula: V-12345678",
        "icono": "https://cdn-icons-png.flaticon.com/512/4108/4108042.png",
        "activo": True,
        "orden": 2
    },
    {
        "id": "efectivo",
        "nombre": "Pago en Efectivo",
        "tipo": "efectivo",
        "informacion": "Dirección: Oficina Ciudad Feria, San Cristóbal\nHorario: Lunes a Viernes 9am-5pm",
        "icono": "https://cdn-icons-png.flaticon.com/512/3135/3135706.png",
        "activo": True,
        "orden": 3
    }
]

async def seed_metodos_pago():
    print("Verificando métodos de pago existentes...")
    count = await db.metodos_pago.count_documents({})
    
    if count > 0:
        print(f"Ya existen {count} métodos de pago en la base de datos.")
        respuesta = input("¿Deseas mantener los métodos existentes? (s/n): ")
        if respuesta.lower() == 's':
            print("Manteniendo métodos de pago existentes.")
            return
        else:
            await db.metodos_pago.delete_many({})
            print("Métodos de pago existentes eliminados.")
    
    print("Insertando métodos de pago iniciales...")
    result = await db.metodos_pago.insert_many(metodos_pago_iniciales)
    print(f"✅ {len(result.inserted_ids)} métodos de pago insertados exitosamente!")

if __name__ == "__main__":
    asyncio.run(seed_metodos_pago())
    client.close()
    print("\n🎉 Métodos de pago inicializados con éxito!")

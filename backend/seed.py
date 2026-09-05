from database import SessionLocal, engine, Base
from models import Incident, Vehicle

# Create all tables first
Base.metadata.create_all(bind=engine)

def seed_db():
    db = SessionLocal()
    
    incidents = [
        Incident(id='INC-1001', type='Landslide', severity='Critical', location='NH-13, West Kameng, Arunachal Pradesh', status='Active', timestamp='10 mins ago', description='Massive landslide blocking both lanes. Immediate rerouting of supplies required.'),
        Incident(id='INC-1002', type='Flood', severity='High', location='Dhemaji District, Assam', status='Responding', timestamp='1 hour ago', description='Brahmaputra river overflow. NH-15 submerged under 3ft of water. Evacuation ongoing.'),
        Incident(id='INC-1003', type='Blocked Road', severity='Medium', location='Shillong Bypass, Meghalaya', status='Under Investigation', timestamp='3 hours ago', description='Fallen trees due to heavy monsoon winds. Single lane currently open.'),
        Incident(id='INC-1004', type='Landslide', severity='High', location='Dimapur-Kohima Road, Nagaland', status='Active', timestamp='5 hours ago', description='Mudslide reported near Chumukedima. Risk of further soil destabilization.')
    ]
    
    vehicles = [
        Vehicle(id='TRK-9001', driver='Ramesh Singh', type='Heavy Truck', cargo='Medical Supplies', location='NH-15, Tezpur, Assam', status='In Transit', eta='2h 15m', risk='Medium', lastUpdate='5 mins ago'),
        Vehicle(id='VAN-4002', driver='Amit Das', type='Delivery Van', cargo='Food & Water', location='Guwahati Depot, Assam', status='Idle', eta='N/A', risk='Low', lastUpdate='10 mins ago'),
        Vehicle(id='TRK-9045', driver='Suresh Kumar', type='Heavy Truck', cargo='Rescue Equipment', location='Shillong Bypass, Meghalaya', status='In Transit', eta='45m', risk='High', lastUpdate='2 mins ago'),
        Vehicle(id='VAN-4122', driver='Prakash B', type='Delivery Van', cargo='Blankets & Tents', location='Dimapur, Nagaland', status='Delivering', eta='10m', risk='Medium', lastUpdate='1 min ago'),
        Vehicle(id='TRK-8833', driver='John Doe', type='Heavy Truck', cargo='Heavy Machinery', location='Silchar, Assam', status='Maintenance', eta='N/A', risk='Low', lastUpdate='1 hour ago')
    ]
    
    # Check if data already exists
    if db.query(Incident).count() == 0:
        db.add_all(incidents)
    if db.query(Vehicle).count() == 0:
        db.add_all(vehicles)
        
    db.commit()
    db.close()
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed_db()

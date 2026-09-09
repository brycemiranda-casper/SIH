import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine, Base
from models import Incident, Vehicle, District, Facility, Warehouse, Delivery, Alert, User, AuditLog

# Create all tables
Base.metadata.create_all(bind=engine)

def seed_db():
    db = SessionLocal()

    # Clear existing data to ensure full 8-state seed
    db.query(Incident).delete()
    db.query(Vehicle).delete()
    db.query(District).delete()
    db.query(Facility).delete()
    db.query(Warehouse).delete()
    db.query(Delivery).delete()
    db.query(Alert).delete()
    db.query(User).delete()
    db.query(AuditLog).delete()
    db.commit()

    districts = [
        # Assam
        District(id='DIS-ASM-01', name='Kamrup Metropolitan', state='Assam', score=92, risk_level='LOW', active_incidents=0, affected_roads=0),
        District(id='DIS-ASM-02', name='Dhemaji', state='Assam', score=42, risk_level='HIGH', active_incidents=3, affected_roads=2),
        District(id='DIS-ASM-03', name='Cachar', state='Assam', score=68, risk_level='MEDIUM', active_incidents=1, affected_roads=1),
        # Arunachal Pradesh
        District(id='DIS-ARU-01', name='West Kameng', state='Arunachal Pradesh', score=48, risk_level='HIGH', active_incidents=2, affected_roads=1),
        District(id='DIS-ARU-02', name='Tawang', state='Arunachal Pradesh', score=35, risk_level='CRITICAL', active_incidents=4, affected_roads=3),
        # Meghalaya
        District(id='DIS-MEG-01', name='East Khasi Hills', state='Meghalaya', score=74, risk_level='MEDIUM', active_incidents=1, affected_roads=1),
        District(id='DIS-MEG-02', name='West Garo Hills', state='Meghalaya', score=82, risk_level='LOW', active_incidents=0, affected_roads=0),
        # Nagaland
        District(id='DIS-NAG-01', name='Kohima', state='Nagaland', score=58, risk_level='MEDIUM', active_incidents=2, affected_roads=1),
        District(id='DIS-NAG-02', name='Dimapur', state='Nagaland', score=88, risk_level='LOW', active_incidents=0, affected_roads=0),
        # Manipur
        District(id='DIS-MAN-01', name='Imphal East', state='Manipur', score=79, risk_level='LOW', active_incidents=1, affected_roads=0),
        District(id='DIS-MAN-02', name='Churachandpur', state='Manipur', score=52, risk_level='HIGH', active_incidents=2, affected_roads=2),
        # Mizoram
        District(id='DIS-MIZ-01', name='Aizawl', state='Mizoram', score=71, risk_level='MEDIUM', active_incidents=1, affected_roads=1),
        # Tripura
        District(id='DIS-TRI-01', name='West Tripura', state='Tripura', score=85, risk_level='LOW', active_incidents=0, affected_roads=0),
        # Sikkim
        District(id='DIS-SIK-01', name='East Sikkim', state='Sikkim', score=60, risk_level='MEDIUM', active_incidents=1, affected_roads=1),
    ]

    facilities = [
        Facility(id='FAC-101', name='Gauhati Medical College & Hospital', type='Hospital', district='Kamrup Metropolitan', state='Assam', accessibility='Open', lat=26.1445, lon=91.7362),
        Facility(id='FAC-102', name='Dhemaji Civil Hospital', type='Hospital', district='Dhemaji', state='Assam', accessibility='Impaired', lat=27.4820, lon=94.5780),
        Facility(id='FAC-103', name='Tawang District Hospital', type='Hospital', district='Tawang', state='Arunachal Pradesh', accessibility='Critical', lat=27.5860, lon=91.8590),
        Facility(id='FAC-104', name='NEIGRIHMS Shillong', type='Hospital', district='East Khasi Hills', state='Meghalaya', accessibility='Open', lat=25.5788, lon=91.8933),
        Facility(id='FAC-105', name='Central Emergency Relief Camp 1', type='Relief Camp', district='Dhemaji', state='Assam', accessibility='Impaired', lat=27.4900, lon=94.5600),
    ]

    warehouses = [
        Warehouse(id='WH-01', name='Guwahati Regional Supply Depot', location='Guwahati, Assam', district='Kamrup Metropolitan', state='Assam', medicine_stock=85, food_stock=90, fuel_stock=75),
        Warehouse(id='WH-02', name='Tezpur Essential Commodities Hub', location='Tezpur, Assam', district='Sonitpur', state='Assam', medicine_stock=60, food_stock=70, fuel_stock=55),
        Warehouse(id='WH-03', name='Shillong High-Altitude Depot', location='Shillong, Meghalaya', district='East Khasi Hills', state='Meghalaya', medicine_stock=95, food_stock=80, fuel_stock=85),
        Warehouse(id='WH-04', name='Tawang Emergency Logistics Point', location='Tawang, Arunachal Pradesh', district='Tawang', state='Arunachal Pradesh', medicine_stock=18, food_stock=30, fuel_stock=25), # Low stock alert!
    ]

    deliveries = [
        Delivery(id='DEL-5001', commodity='Medical Supplies', quantity='450 kg', origin='Guwahati Depot', destination='Tawang District Hospital', priority='CRITICAL', vehicle_id='TRK-9001', status='In Transit', eta='2h 15m', created_time='Today 08:30 AM'),
        Delivery(id='DEL-5002', commodity='Food & Water Rations', quantity='1200 kg', origin='Guwahati Depot', destination='Dhemaji Relief Camp', priority='HIGH', vehicle_id='VAN-4002', status='Pending', eta='3h 45m', created_time='Today 09:15 AM'),
        Delivery(id='DEL-5003', commodity='Rescue Equipment', quantity='800 kg', origin='Shillong Depot', destination='Kohima Center', priority='HIGH', vehicle_id='TRK-9045', status='In Transit', eta='45m', created_time='Today 07:00 AM'),
        Delivery(id='DEL-5004', commodity='Blankets & Tents', quantity='350 kg', origin='Dimapur Depot', destination='Churachandpur', priority='NORMAL', vehicle_id='VAN-4122', status='Delivering', eta='10m', created_time='Today 10:00 AM'),
    ]

    vehicles = [
        Vehicle(id='TRK-9001', driver='Ramesh Singh', type='Heavy Truck', cargo='Medical Supplies', location='NH-15, Tezpur, Assam', status='In Transit', eta='2h 15m', risk='Medium', lastUpdate='5 mins ago', lat=26.65, lon=92.79, speed=48),
        Vehicle(id='VAN-4002', driver='Amit Das', type='Delivery Van', cargo='Food & Water', location='Guwahati Depot, Assam', status='Idle', eta='N/A', risk='Low', lastUpdate='10 mins ago', lat=26.14, lon=91.73, speed=0),
        Vehicle(id='TRK-9045', driver='Suresh Kumar', type='Heavy Truck', cargo='Rescue Equipment', location='Shillong Bypass, Meghalaya', status='In Transit', eta='45m', risk='High', lastUpdate='2 mins ago', lat=25.60, lon=91.90, speed=35),
        Vehicle(id='VAN-4122', driver='Prakash B', type='Delivery Van', cargo='Blankets & Tents', location='Dimapur, Nagaland', status='Delivering', eta='10m', risk='Medium', lastUpdate='1 min ago', lat=25.90, lon=93.72, speed=22),
        Vehicle(id='TRK-8833', driver='John Doe', type='Heavy Truck', cargo='Heavy Machinery', location='Silchar Depot, Assam', status='Maintenance', eta='N/A', risk='Low', lastUpdate='1 hour ago', lat=24.83, lon=92.77, speed=0),
    ]

    incidents = []

    alerts = [
        Alert(id='ALT-301', title='Critical Landslide Warning NH-13', type='Landslide', severity='CRITICAL', location='West Kameng, Arunachal Pradesh', affected_entities='TRK-9001 (Medical Supplies)', recommended_action='Approve Alternate Route via Sonitpur Bypass', timestamp='5 mins ago', confidence=94, source='NDMA CAP & Field Officer'),
        Alert(id='ALT-302', title='Monsoon Submersion Risk NH-15', type='Flood', severity='HIGH', location='Dhemaji District, Assam', affected_entities='Deliveries DEL-5002', recommended_action='Reroute via Lakhimpur Highway', timestamp='20 mins ago', confidence=88, source='IMD Weather Feed'),
        Alert(id='ALT-303', title='Low Medicine Stock Alert', type='Supply Shortage', severity='HIGH', location='Tawang Logistics Point', affected_entities='Tawang District Hospital', recommended_action='Dispatch Emergency Medicine Shipment from Hub A', timestamp='1 hour ago', confidence=90, source='Inventory AI Engine'),
    ]

    users = [
        User(id='USR-01', username='admin', role='Admin', name='Regional Command Officer'),
        User(id='USR-02', username='district_officer', role='District Officer', name='District Magistrate - Dhemaji'),
        User(id='USR-03', username='fleet_manager', role='Fleet Manager', name='NER Fleet Operations Lead'),
        User(id='USR-04', username='field_officer', role='Field Officer', name='Inspector Borah (Assam Police)'),
        User(id='USR-05', username='driver_ramesh', role='Driver', name='Ramesh Singh'),
    ]

    audit_logs = [
        AuditLog(timestamp='Today 08:30 AM', user='fleet_manager', role='Fleet Manager', action='Dispatched Vehicle', details='Dispatched TRK-9001 with Medical Supplies to Tawang'),
        AuditLog(timestamp='Today 09:10 AM', user='field_officer', role='Field Officer', action='Reported Incident', details='Reported Critical Landslide on NH-13 West Kameng'),
    ]

    db.add_all(districts)
    db.add_all(facilities)
    db.add_all(warehouses)
    db.add_all(deliveries)
    db.add_all(vehicles)
    db.add_all(incidents)
    db.add_all(alerts)
    db.add_all(users)
    db.add_all(audit_logs)

    db.commit()
    db.close()
    print("NEXUS-NER Database seeded successfully across all 8 NER states!")

if __name__ == "__main__":
    seed_db()

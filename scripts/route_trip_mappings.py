import json

with open("out/route_orientated/data5.json", "r") as json_file:
    data = json.load(json_file)

# dictionary to store the mapping between trip_id and route_id
trip_route_mapping = {}

# extract trip_id and route_id
for entry in data:
    route_id = entry['route_id']
    trips = entry['trips']
    for trip_id, trip_info in trips.items():
        trip_route_mapping[trip_id] = route_id

for trip_id, route_id in trip_route_mapping.items():
    print(f"Trip ID: {trip_id}, Route ID: {route_id}")

with open("route_trip_mappings.json", "w") as outfile:
    json.dump(trip_route_mapping, outfile, indent=4)
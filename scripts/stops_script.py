import json

with open("out/route_orientated/data5.json", "r") as file:
    data = json.load(file)

result = {}

for route_data in data:
    for trip_id, trip_info in route_data["trips"].items():
        for stop_info in trip_info["stops"]:
            stop_id = stop_info["stop_id"]
            if stop_id not in result:
                result[stop_id] = []
            result[stop_id].append({
                "route_id": route_data["route_id"],
                "trip_id": trip_info["trip_id"],
                "arrival_time": stop_info["arrival_time"],
                "departure_time": stop_info["departure_time"],
                "stop_sequence": stop_info["stop_sequence"],
                "stop_name": stop_info["stop_name"],
                "stop_lat": stop_info["stop_lat"],
                "stop_lon": stop_info["stop_lon"]
            })

with open("out/stops_data.json", "w") as outfile:
    json.dump(result, outfile, indent=4)
import json

with open("/Users/sylviaca/Desktop/passiogo/scripts/timetable.json", "r") as file:
    data = json.load(file)

routes = {}
def process():
    condensed_data = {}
    for stop_id, entries in data.items():
        route_ids = set()
        for entry in entries:
            route_ids.add(entry['route_id'])
        condensed_data[stop_id] = list(route_ids)

    with open("/Users/sylviaca/Desktop/passiogo/scripts/routes_per_stop.json", "w") as json_file:
        json.dump(condensed_data, json_file, indent=4)

if __name__=="__main__":
    process()
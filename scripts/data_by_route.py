import json

with open("/Users/sylviaca/Desktop/passiogo/scripts/out/route_orientated/data5.json", "r") as file:
    data = json.load(file)

def process():
    route_dict = {}
    for item in data:
        route_id = item["route_id"]
        del item["route_id"]
        route_dict[route_id] = item

    with open("/Users/sylviaca/Desktop/passiogo/scripts/data_by_route.json", "w") as json_file:
        json.dump(route_dict, json_file, indent=4)

if __name__=="__main__":
    process()
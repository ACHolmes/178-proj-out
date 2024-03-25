import json
from collections import deque

# with open("data_by_route.json", "r") as file:
with open("/Users/sylviaca/Desktop/passiogo/scripts/data_by_route.json", "r") as file:
    data = json.load(file)

stop_mapping = {}

# # Iterate over routes and stops
# for route_id, route_info in data.items():
#     # if (route_id == "2235"):
#     #     print('yes')
#     for trip_id, trip_info in route_info['trips'].items():
#         stops = trip_info['stops']
#         if (route_id == "2235"):
#             print(stops)
#         for i in range(len(stops) - 1):
#             current_stop = stops[i]['stop_name']
#             next_stop = stops[i + 1]['stop_name']
#             if current_stop not in stop_mapping:
#                 stop_mapping[current_stop] = set()
#             if next_stop not in stop_mapping:
#                 stop_mapping[next_stop] = set()
#             stop_mapping[current_stop].add(next_stop)
#             # stop_mapping[next_stop].add(current_stop) 

# # for stop, reachable_stops in stop_mapping.items():
#     # print(f"{stop}: {reachable_stops}")
#     # print(stop_mapping)

stop_mapping = {}


for route_id, route_info in data.items():
    for trip_id, trip_info in route_info['trips'].items():
        stops = trip_info['stops']
        for i in range(len(stops)):
            current_stop = stops[i]['stop_name']
            if current_stop not in stop_mapping:
                stop_mapping[current_stop] = set()
            for j in range(i + 1, len(stops)):
                next_stop = stops[j]['stop_name']
                stop_mapping[current_stop].add(next_stop)

for stop, reachable_stops_set in stop_mapping.items():
    stop_mapping[stop] = list(reachable_stops_set)

with open("/Users/sylviaca/Desktop/passiogo/scripts/stop_mappings.json", "w") as json_file:
        json.dump(stop_mapping, json_file, indent=4)
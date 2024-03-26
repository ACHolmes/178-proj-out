import json

with open("out/stops.json", "r") as f:
  data = json.load(f)

  as_dict = {}
  for stop in data:
    as_dict[stop["stop_id"]] = stop
  with open("out/stops_dict.json", "w") as outfile:
    json.dump(as_dict, outfile)
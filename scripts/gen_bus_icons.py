"""
This is a pretty dumb script, but I'm manually generating a svg bus icon for every color of bus route.
It seems like I have to do this because the react google maps package currently doesn't support Advanced Marker Elements
and hence the only way to modify the icon of a marker is by modifying the underlying icon it imports.
"""

import json
import os
with open("out/routes.json", "r") as route_file:
  data = json.load(route_file)
  for route in data:

    # We don't have a green route, so if somehow one of these buses is displayed, set to green to distinguish
    color = route['route_color'] if route['route_color'] else "00FF00"

    icon_file = f"out/bus_icons/{color}"
    # if (not os.path.isfile(icon_file)):
    with open(f"{icon_file}.svg", "w") as new_icon:
      new_icon.write(
        f"""<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12.06 24c6.72-.17 12.11-5.64 11.94-12.06a12 12 0 1 0 -11.94 12.06" fill="#{color}"/><path d="m18.78 10.67-.66-5.17c-.16-.93-.75-1.3-1.63-1.68a14.25 14.25 0 0 0 -4.49-.82 14.32 14.32 0 0 0 -4.5.82c-.86.37-1.45.75-1.63 1.68l-.66 5.17v7.15h1.17v1.25a1 1 0 0 0 1.91 0v-1.25h7.45v1.25a.91.91 0 0 0 .48.8 1 1 0 0 0 1 0 .88.88 0 0 0 .47-.8v-1.25h1.13zm-9.57-6.36h5.61a.42.42 0 0 1 .43.41.42.42 0 0 1 -.43.42h-5.61a.43.43 0 0 1 -.43-.42.42.42 0 0 1 .43-.41zm-2.79 6.21.58-4.09a.54.54 0 0 1 .51-.43h9.06a.56.56 0 0 1 .54.44l.54 4.09a.33.33 0 0 1 0 .14.49.49 0 0 1 -.16.37.54.54 0 0 1 -.38.15h-10.17a.56.56 0 0 1 -.38-.19.57.57 0 0 1 -.14-.38.33.33 0 0 1 0-.1zm.92 5.09a1 1 0 1 1 1-1 1 1 0 0 1 -.3.7 1 1 0 0 1 -.7.3zm9.36 0a1 1 0 1 1 1-1 1 1 0 0 1 -.3.7 1.06 1.06 0 0 1 -.72.29z" fill="#1c1e23"/></svg>"""
      )



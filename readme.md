
## Delivery Routing Solution

This is a web-based logistics optimization application. 

I have always been interested in logistics and the logic behind route optimization, so I decided that I would explore these ideas a little deeper by building a very basic delivery routing solution optimizer.

The user selects locations for the delivery depot and all delivery stops. The application then considers the dispersion of the stops and it attempts to calculate the most efficient routing solution, given the number of delivery trucks available. A visual depiction of the most efficient solution is then drawn on the map for the user to review.

The output includes the following:
* visual depiction of the user-selected delivery depot and all delivery stops
* colored-coded routing solution, corresponding to the number of trucks available
* analysis of location and distance between the depot and all stops, considering directional dispersion of the stops and total distance traveled for routing efficiency

At the moment, the logic behind this program considers the great circle distance between the user-defined points and it attempts to sequence the stops according to both bearing and distance from the delivery depot. It then attempts to find the most efficent route by comparing the total distance traveled between several different solutions, selecting the solution with the shortest distance traveled as the most efficient choice.

All of the data processing and calculation logic is written in JavaScript (no external libraries or frameworks) and it uses Leaflet JS for map interaction, with OpenStreetMap map graphics.

## Screenshot
![output screenshot](https://github.com/Runningman47/delivery-routing-solution/blob/main/screenshot1.jpg)

This screenshot shows the routing solution output. A two truck solution is displayed and the colored routes represent each truck's individual route assignment. The building icon in the center of the map is the user-selected delivery depot, and the arrows represent the user-selected stops.

## Updates
I have many ideas for further development of this application, however, I am most interested in exploring machine learning as it could apply this application's route optimization. I am slowly working through an online class in machine learning in Python and I am hoping to apply these concepts in the future development of this app.

## Licensing
The map interaction in this program was developed with Leaflet JS, the amazing open source map functionality library. It is licensed under the BSD 2-Clause License. Their license can be found in the accompanying "LICENSE" file in this repo.
    
The map graphics themselves, except for the icons, come from OpenStreetMap. OpenStreetMap is licensed under the Open Data Commons Open Database License (ODbL) by the OpenStreetMap Foundation (OSFM). Their copyright page can be found here: https://www.openstreetmap.org/copyright 

The map icons that are seen in the screenshot are from ionicons (https://ionic.io/ionicons). They are licensed under the MIT license. The MIT license can be found in the "LICENSE" file in this repo.

Copyright (c) 2023 Mike Schober


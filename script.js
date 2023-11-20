'use strict';


//---right now, the most extreme points are spliced out of the sequencedStops array for both WE and NS solutions... need to run sequences for them for them in index zero through their natural index in the closest-closest solution, storing each in its own solution array---done
//next step after 11/5/23...
//-----write logic to sequence the extreme loc and to hold all the different solutions (array to hold all solutions array or arrays, each index of the parent array would hold an array of the sequenced loc objects)---done!!!
//need to compare all the soluation arrays for total distance measurement to determine the best solution to pass-in to the solutionOne array---done!!!
//write logic to determine total distance along a given route (can use getDist(origin, destination) for each segment of each solution to get the total distance)... remember, getDist takes arrays as args ([lat, long], [lat, long]) so need to take the locObj.loc and pass it in as arg---done!!!!
//-----will likely need to create an array of total distances that correspond to the solutions parent array (index0 of distance array woudl be total distance for the solutions parent array index 0, etc.)
//write logic to compare all solutions and to draw/pass-in the solution the solutionOne map (index of the lowest number in the solutions distance array SHOULD be the best solution)---done!!!

//global variable to hold user's current position
//defaults to KC, MO
//remember... south latitudes and west longitudes are negative!!!
//this one is N and W
let userPosition = [39.099724, -94.578331];

//variable to hold current map click functionality (set depot, etc)
//depot button defaults to ON when the app loads
let mapClick = 'depot';

//variable to hold url of current map marker icon, based on which toggle button is currently selected
//defaults to depot when the app starts
let iconPath = `depot.svg`;

//variable to hold stop id value
//depot is always id zero
//this needs to be reset the when app is reset
let stopId = 0;

//variable to hold the location of the delivery depot
//array [lat, lng]
let depot;

//variable to hold array of drop-off/pick-up locations
let locs = [];


//variable to hold the number of trucks available... will be user-defined but for now just defaults to one
let trucks = 2;

//array to hold different colors for the different trucks
const clr = ['green', 'yellow', 'blue', 'red', 'purple', 'orange', 'black'];

//variable to hold array of distances (matrix of arrays)
//first array (index 0) is array of loc ids (column headings)
//second array (index 1) is array of distances from depot
//third array (index 2) is array of distances from loc[1], etc.
let distances = [];


//variables to hold the latitude and longitude tables
let latTable = [];
let longTable = [];


//variable to hold array ids for each directional sector
let nw = [];
let ne = [];
let se = [];
let sw = [];

//variable to hold best cardinal direction breakdown
//holds 
let cardBreak;



//variable to hold the sequenced array for our stops (stop objs)
let sequencedStops = [];

//variable to hold the sequence of the stop locations (holds each as [lat, long] from the objects in sequencedStops)
let sequencedLocations = [];


//variables to hold solutions
//solutionOne tol hold only the best sequence, once determined, after sequencing gthe extreme points and calculating distance
let solutionOne = new Map();

let solutionTwo = new Map();

let solutionThree = new Map();

//solution four to determine whether it makes sense to have the number of trucks that we do. defaults to yes, goes to 'N' if need less trucks 
let solutionFour = 'Y';


/////////////////////////////////////////////////////////////
//selecting dom elements

//toggle button interface
const depotButton = document.getElementById('depot');
const dropButton = document.getElementById('dropoff');
const pickupButton = document.getElementById('pickup');
const pickdropButton = document.getElementById('pickdrop');



//adding event listeners

//event listener for general click on the page
//toSelect() callback function uses event.target to get the information from the clicked element (things like id, class, tagname, etc.)
//in this case, getting classname from the buttons when they're clicked
document.addEventListener('click', toSelect);

/////////////////////////////////////////////////////////////


///////
//callback functions

//callback function to take the id from the clicked button to display our current mode in the UI and to direct the logic for map click events
//the depot button is defaulted to ON when the app loads
function toSelect(event) {
    let element = event.target

    if ((element.tagName === 'BUTTON') && (element.className === `toggle`)) {
        console.log(`${element.id} button clicked!`);

        //changes the map functionality mode variable
        mapClick = element.id;

        //changes the url for the icon based on button clicked
        iconPath = `${element.id}.svg`;

        //removes the selected button styling for all the buttons
        depotButton.classList.remove('buttonSelected');
        dropButton.classList.remove('buttonSelected');
        pickupButton.classList.remove('buttonSelected');
        pickdropButton.classList.remove('buttonSelected');

        //adds the selected button styling to the clicked button
        element.classList.add('buttonSelected')

    }
};

///////

///////

//building location class
class Loc {
    constructor(type, id, loc) {
        this.type = type;
        this.id = id;
        this.loc = loc;
        this.depotDistance;
        this.depotBearing = [];
    }

    //didnt define getters for depotDistance and depotBearing bc getters cant have parameters
    //define as function for use with forEach to assign each Loc object in the locs array values for these properties

};


///////


//function for distance from the depot and between points
//parameters are arrays [lat, long]
//objLoc is origin, point is destination
function getDist(objLoc, point) {

    //variables to hold lat/long in radians
    //lat/long one is origin, lat/long two is destination
    let latOne = objLoc[0] * (Math.PI / 180);
    let latTwo = point[0] * (Math.PI / 180);

    let longOne = objLoc[1] * (Math.PI / 180);
    let longTwo = point[1] * (Math.PI / 180);


    //for determining the distance between various points and other points and well as each point and the depot

    //using law of cosines
    //a = sin(lat1) * sin(lat2)
    //b = cos(lat1) * cos(lat2) * cos(long1 - long2)
    //c = arccos(a + b) (inverse cos) 
    //distance = radius of earth * c

    //Math.sin and Math.cos both expect angles in radians
    //to convert = degrees * (PI/180)

    //Math.acos for arccos
    //radius of earth in SM = 3963 SM
    //radius of earth in KM = 6878 KM
    //radius of earth in NM = 3440 NM

    let a = Math.sin(latOne) * Math.sin(latTwo);
    let b = Math.cos(latOne) * Math.cos(latTwo) * Math.cos(longOne - longTwo);
    let c = Math.acos(a + b);
    let distance = (3963 * c);

    //returns distance between the tweo lat/long points in SM
    //Number data type
    return distance;
};


//function for bearing from the depot and between points
//partameters are [lat, long]
//objLoc is origin, point is destination
function getBearing(objLoc, point) {

    //for determining bearing between points and other points as well as between each point and the depot

    //remember... south latitudes and west longitudes are negative!!!
    //so... higher latitude is further north, higher longitude is further east

    //variables to hold lat/long
    //lat/long one is origin, lat/long two is destination
    let latOne = objLoc[0];
    let latTwo = point[0];

    let longOne = objLoc[1];
    let longTwo = point[1];


    //variables to hold bearings
    let northSouth;
    let eastWest;

    //determining north or south
    if ((latTwo - latOne) > 0) {
        northSouth = `N`
    } else if ((latTwo - latOne) < 0) {
        northSouth = `S`
    } else {
        northSouth = 'O'
    };

    //determining east or west
    if ((longTwo - longOne) > 0) {
        eastWest = `E`
    } else if ((longTwo - longOne) < 0) {
        eastWest = `W`
    } else {
        eastWest = 'O'
    };


    //scaffolding to whats returned
    console.log(`returning: ${[northSouth, eastWest]}`);

    //returns array containing two cardinal directions from which the point is relative to the origin [N, E], etc.
    return [northSouth, eastWest];

};

//function to find the lowest number that is greater than zero in given array
//returns the lowest number in the array that's greater than zero
function findLowest(inputArray) {

    //variable to hold the lowest number
    let lowest = 0;

    //iterates through the array and keeps lowest number in the variable
    for (let v in inputArray) {
        if ((inputArray[v] > 0) && (inputArray[v] < lowest || lowest === 0)) {

            lowest = inputArray[v];
        }
    }

    console.log(`lowest is: ${lowest}`);
    return lowest;

};


//function to find the highest number that is greater than zero in given array
//returns the highest number in the array that's greater than zero
function findHighest(inputArray) {

    //variable to hold the highest number
    let highest = 0;

    //iterates through the array and keeps lowest number in the variable
    for (let v in inputArray) {
        if ((inputArray[v] > 0) && (inputArray[v] > highest || highest === 0)) {

            highest = inputArray[v];
        }
    }

    console.log(`highest is: ${highest}`);
    return highest;

};


//function to take current loc object and the array of loc objects remaining, and determine the next closest loc object and return the object so that we can add it to our sequenced stop array
//currentLoc is current loc object
//locsRemaining is the array of remaining loc objects to be sequenced
function nextClosest(currentLoc, locsRemaining) {

    //determining which row of the matrix to look at for currentLoc
    let tgt = (distances[0].indexOf(currentLoc.id)) + 1;
    console.log(`target index: ${tgt}`);

    //---------------------------------------------------
    /// logic to consider only the remaining loc distances

    //array to hold the indexes of locs in locsRemaining (indexes and ids are synomymous in the distances array... object with id 0 (depot) is also index zero in the array, etc.)
    let x = [];

    //in the row of the matrix that corresponds to the currentLoc object, pull only the distances that correspond to the remaining loc objs in locsRemaining
    for (let a in locsRemaining) {

        //pushes the indexes of the distance array that we want
        x.push(distances[0].indexOf(locsRemaining[a].id));

    };

    //array to hold only the distances that correspond to the locs remaining
    let distRemain = [];

    for (let q in x) {

        //using the indexes that ar held in x, pushes the distances for each loc remaining to the distRemaining array
        distRemain.push(distances[tgt][x[q]])

    }

    //---------------------------------------------------


    let distToNext = findLowest(distRemain);
    let nextObjId = distances[tgt].indexOf(distToNext);

    //variable to hold the next closest loc
    let next;

    for (let h in locsRemaining) {

        //for each object in locsRemaining array, looking for the object with the id that we want and returning it
        if (nextObjId === locsRemaining[h].id) {

            next = locsRemaining[h]
            console.log(`next closest is ${next}!`);

            //returns the next closest object to the current object
            return next;
        };
    };

}

//problem here... this always finds the closest loc object to the object that is given, even if it's the depot or another object that we already sequenced...fixed!!! now finds the next closest object among only the objects that are remaining!!!



//will need to add code here to find the directional extreme (north or west) in the locsleft array

//function to take an array of loc objects and find the most extreme north latitude... then return the most extreme north object
function extNorth(locarr) {

    ////remember... south latitudes and west longitudes are negative!!!
    //this one is N and W... [39.099724, -94.578331];
    //[lat, long]
    //so... we want the highest positive number in index zero of loc object loc property

    //using the findHighest(array) function to find the highest number in the array of latitudes that we take from the passed-in locarr

    //variable to hold array of latitudes
    let lats = [];

    //iterating through the passed-in locarr to create an array of all the latitudes
    for (let l in locarr) {

        //pushes the latitude for each loc object from the locarr into the lats array
        lats.push(locarr[l].loc[0]);

    };

    //scaffolding...
    console.log(`lats: ${lats}`);

    //finds the most extreme north latitude in the array of lats
    let highest = findHighest(lats);

    //finding the index of the extreme loc in the locarr... bc lats is in the same order as the objs in locarr, the index found here from lats will correspond to the correct obj in locarr 
    let highInd = lats.indexOf(highest);

    console.log(highInd);

    //returns the loc object with the most northern latitude from locarr
    console.log(`loc obj: ${locarr[highInd]}`);
    return locarr[highInd];

};


//function to take an array of loc objects and find the most extreme west longitude
function extWest(locarr) {

    ////remember... south latitudes and west longitudes are negative!!!
    //this one is N and W... [39.099724, -94.578331];
    //[lat, long]

    //so... we want the highest negative number in index one of loc object loc property

    //using the findHighest(array) function to find the lowest negative value number in the array of longitudes that we take from the passed-in locarr
    //to do this... since west longs are negative, multiplying all by -1 so that we can use findHighest(array) function to find the correct number

    //variable to hold array of longitudes
    //remember... these are opposite sign from what they actually are... west longs are now positive, east now negative!!!
    let longs = [];

    //iterating through the passed-in locarr to create an array of all the longitudes
    for (let l in locarr) {

        //pushes the longitude for each loc object from the locarr into the longs array
        longs.push((locarr[l].loc[1]) * -1);

    };

    //scaffolding...
    console.log(`longs: ${longs}`);

    //finds the most extreme west longitude in the array of longs
    let lowest = findHighest(longs);

    //finding the index of the extreme loc in the locarr... bc longs is in the same order as the objs in locarr, the index found here from longs will correspond to the correct obj in locarr 
    let highInd = longs.indexOf(lowest);

    console.log(highInd);

    //returns the loc object with the most western longitude from locarr
    console.log(`loc obj: ${locarr[highInd]}`);
    return locarr[highInd];


};

////////////////////////////////////
//beg of close-close routing abstraction... might need to delete


//function to abstract the closest-closest routing
//start = loc object from which we want to start our routing
//remain = array of loc objects that remain to be sequenced
//nums = number of objects from the passed-in remaing array that we want to sequence
//returns an array of sequenced objs and remaining objs
//return = [[sequenced objs], [remaining objs]]
//so... of what;s returned, index zero is the sequence, index one is the array of remainging objs to be sequenced later
function closeClose(start, remain, nums) {

    //variable to hold copy of remain
    let r = [...remain]

    //variable to hold start value
    let s = start;

    //setting default value for nums if nothing passed-in for it
    if (nums === undefined) {
        nums = (r.length)
    }

    //variable to hold array that will be returned
    let seq = [s];

    for (let x = 0; x < nums; x++) {
        //finds next closest object next object in the sequences
        let nextObj = nextClosest(s, r);

        //code to remove currectObj from the array of loc objects remaining
        let removeIndex = r.indexOf(nextObj);
        r.splice(removeIndex, 1);

        //scaffolding...
        console.log(`closeClose sector length: ${r.length}`);

        seq.push(nextObj);
        s = nextObj;
    }

    //commented this out bc we put start as first index in seq by default
    // if (seq[0] === undefined) {
    //     seq.push(start)
    // }

    return [seq, r];

};

//to write function for this... need currObj (loc object from which we are routing to the next closest loc obj) and locsleft (array of loc objs remaining) args...
//function would sequence closest-closest, returning an array of sequenced objs, which could then be combined with the spread operator before and after the extreme loc is added in???

//end of closeClose function... abstraction for close-close routing
////////////////////////


//function that determines total route distance
//takes array of location arrays [[lat, long], [lat, long]]
//returns the distance in SM as a number
function totalDist(arr) {

    //variable to hold the length of the array passed-in
    let l = arr.length;

    console.log(`arr length is ${l}`);

    //variable to hold the total distance
    let d = 0;

    for (let x = 0; x < (l - 1); x++) {

        //adds calculated distance to the running total (d)
        d = d + getDist(arr[x], arr[x + 1]);


        console.log(`total dist is now: ${d}`);


    }

    //returns total distance in SM as a number
    return d;

};



///////

///////
//logic to be executed after the calculate button clicked
//currently all held in this function
function getSolution(trks) {


    console.log(`total trucks: ${trks}`);

    ///////
    //matrices and tables created here

    //variable to hold the headings array for distances matrix
    let heads = [];

    //logic to add bearing data to each loc object (bearing from depot)
    for (let x in locs) {
        let bearing = getBearing(depot, locs[x].loc)

        //adding the loc id to the respective sector array
        if (bearing[0] === 'N' && bearing[1] === 'W') {
            nw.push(locs[x].id)
        } else if (bearing[0] === 'N' && bearing[1] === 'E') {
            ne.push(locs[x].id)
        } else if (bearing[0] === 'S' && bearing[1] === 'E') {
            se.push(locs[x].id)
        } else if (bearing[0] === 'S' && bearing[1] === 'W') {
            sw.push(locs[x].id)
        };

        locs[x].depotBearing = bearing;

        //creating array of loc ids in order for column headings of matrix
        heads.push(locs[x].id);

    };

    //adding the headings array to the distances matrix
    distances.push(heads);

    //creating the rest of the distances matrix
    for (let y in locs) {

        //variable to hold current index's distances for the matrix
        let indexDist = [];

        for (let u = 0; u < locs.length; u++) {

            let dist = getDist(locs[y].loc, locs[u].loc)
            indexDist.push(dist);

        }

        //pushing current index's distance array to the distances matrix
        distances.push(indexDist);

    };


    ///////
    //creating the latitude and longitude tables

    //latitude (N/S) table and longitude (W/E) table

    //pushing the id heading array as the first array (index zero) of the lat and long tables
    latTable.push(heads);
    longTable.push(heads);

    //variable to hold the arrays of latitudes and longitudes to be pushed into the table after the iteration
    let latRow = [];
    let longRow = [];

    //creating the rest of the lat and long tables
    for (let lt in locs) {

        latRow.push(locs[lt].loc[0])
        longRow.push(locs[lt].loc[1])

    };

    //pushing the completed latitude and longitude data to the tables
    latTable.push(latRow);
    longTable.push(longRow);


    //end of creating matrices and tables
    ///////

    //proof of concept for drawing lines between each point on the route
    /*
    let pts = [locs[0].loc, locs[1].loc, locs[2].loc, locs[3].loc, locs[0].loc];

    let polyline = L.polyline(pts, { color: `green` }).addTo(map);

    map.fitBounds(polyline.getBounds());
    */
    //this worked!!! polyline put line between the array of points!!!


    /////////////////////////////////////////////////////////////
    //code in this block determines sector break-up solutions, depending on the number of trucks available

    //to hold multiple solutions, will define other variables to hold other solutions (w-e, n-s, etc.)
    //---to do w-e or n-s, need to use findLowest() to find the lowest lat/long in an array of just lat or long, depending on direction (lowest lat === S, lowest long === E)

    ///start here after 9/21/23!!!!
    //need to write logic for using the number of trucks and the number of stops in each sector (for example, two trucks N/S sectors or W/E sectors), to determine directional break-up (fo example NW and NE combined, SE and SW combined) and then run directional (w-e or n-s) and distance (closest to closest) solutions for each sector
    //--started this... getSolution takes trucks as argument... if one truck, just does closest-closest for now... will prob change this later. if more than one truck, if statement handles the logic for determining the sectors and then the directional break-up and the sequences

    //code to determine the sector density of each sector and break up the sectors, depending on the number of trucks available...
    //---could use sectors numbered to correspond to the truck numbers (for ex, three trucks === three sectors (1,2,3), etc.)
    //can use findHighest function to find the largest sectors first

    //logic behind sector break-up...
    //---for one truck, sector size doesnt matter (using directional extreme, then closest)
    //---for two trucks, we want two sectors that are as equal in number of stops as possible for equivalent break-up (n/s or e/w) AND we want the biggest sector, then the rest (if NW is biggest, we want that, then the rest)
    //---for three trucks, we want the three sectors (one of which will have to be a combined sector (nw+ne, etc.)) as equal as psbl, and we want to break up by two biggest individual sectors first, then the last two
    //---for four trucks, will use the four defined sectors, but we also want to know if maybe splitting one sector between two trucks might make sense (dividing the number of stops in a sector by two and splitting them between two trucks, giving the other three sectors to the remaining two trucks)
    //---for five trucks, we will use the two directional sectors (w/e or n/s) and divide them by stops (splitting the bigger directional sectors evenly), but we also want to know if it might make sense to use the four defined sectors, breaking one of them up between two trucks. we also want to know if/when if doesnt make sense to have the fifth truck
    //---for six trucks and on, we will use the logic for five trucks

    //so, in general, we need the following sector break-up:
    //we need the total number of stops in the list so that we can proportionally allocate the stops between the trucks
    //biggest among n/s or w/e (which of these makes most sense)
    //biggest single sector among the four original sectors
    //biggest single sector, then second biggest single sector, then the last sector combined


    //array of each sector size
    let sectSizes = [nw.length, ne.length, se.length, sw.length];

    //array that corresponds to the sectorSizes array, which we can use to determine our biggest sectors
    let sectChoices = [['N', 'W'], ['N', 'E'], ['S', 'E'], ['S', 'W']];

    //vartiable to hold the total number of stops we need to make
    //minus one to get rid of the depot form the count
    let totalStops = (locs.length - 1);

    //variables to hold the total stops between the bigger, cardinal direction sectors
    let cards = [(nw.length + ne.length), (sw.length + se.length), (nw.length + sw.length), (ne.length + se.length)];

    //array that corresponds to the cards array, which we can use to determine our biggest cardinal sectors
    let cardsChoices = ['N', 'S', 'W', 'E'];

    ///////
    //dealing with the four cardinal sectors

    //finding biggest single sector among the four cardinalsectors
    let bigCard = cardsChoices[cards.indexOf(findHighest(cards))];
    console.log(`biggest single sector among the cardinal sectors is ${bigCard}`);

    //removing the biggest sector from the four so that we can find the second biggest sector
    cardsChoices.splice((cards.indexOf(findHighest(cards))), 1);
    cards.splice((cards.indexOf(findHighest(cards))), 1);


    //finding the second biggest single sector among the four cardinal sectors
    let secCard = cardsChoices[cards.indexOf(findHighest(cards))];
    console.log(`second biggest single sector among the cardinal sectors is ${secCard}`);


    //determining the proportional breakdown between the cardinal sectors (we want as close to 50/50 (as close to 1 as psbl) as psbl)

    //n/s
    let nsProp = (nw.length + ne.length) / (sw.length + se.length);
    console.log(`N/S proportion: ${nsProp}`);

    //w/e
    let weProp = (nw.length + sw.length) / (ne.length + se.length);
    console.log(`W/E proportion: ${weProp}`);

    //logic determining which cardinal direction breakdown makes most sense
    if (Math.abs((1 - nsProp)) < Math.abs((1 - weProp))) {

        cardBreak = 'NS'

    } else if (Math.abs((1 - nsProp)) < Math.abs((1 - weProp))) {

        cardBreak = 'WE'

    } else {

        //defaults to w-e, if the breakdown between the cardinal directions is the same (4/4 ns and 4/4 we, for example)
        cardBreak = 'WE'

    }


    //end of the four cardinal sector logic
    ///////

    ///////
    //dealing with the four orig sectors

    //finding biggest single sector among the four orig sectors
    let bigSect = sectChoices[sectSizes.indexOf(findHighest(sectSizes))];
    console.log(`biggest single sector among the original sectors is ${bigSect}`);

    //removing the biggest sector from the four so that we can find the second biggest sector
    sectChoices.splice((sectSizes.indexOf(findHighest(sectSizes))), 1);
    sectSizes.splice((sectSizes.indexOf(findHighest(sectSizes))), 1);



    //finding the second biggest single sector among the four orig sectors
    let secSect = sectChoices[sectSizes.indexOf(findHighest(sectSizes))];
    console.log(`second biggest single sector among the original sectors is ${secSect}`);

    //end of four sector logic
    ///////


    //cant iterate through the number of trucks bc logic isnt the same for each number of truck
    //need to use if statement

    //sector break-up determined by...
    //---number of stops in each sector
    //---the number of trucks we have available
    //---the user-selected priority for the solution (time, distance, gas/mileage cost, number of stops per truck)
    //user-selected limitations (number of stops per truck, total delivery time per truck, number of pick-up stops per truck, distance per truck)



    //end of sector break-up logic
    /////////////////////////////////////////////////////////////


    //next steps after 9/3/23...
    //working on iteration to go through the array of locs and sequence them in order, starting with closest to depot to further from depot----done!!!


    //next steps...
    //address directional logic... need to go north to south or east to west, or something like that to prevent backtracking
    //---for directional logic, need to use lat/long numbers to go in order (e-w or n-s, depending on the pattern of stops)

    ///////
    //sequencing stops in from closest stop to closest stop for one truck only...

    //using the distance matrix to sequence the stops for the solutions
    //creates an array of sequenced stops in order from first stop to last stop... automatically go back to depot after last stop

    //////////////////////////////////////////////////
    //code for each sector in our solution!!!

    //the following is for one truck... will have to sub in array of sector loc objs in place of locs if/when need to use this for sector solutions
    //the code below will need to be executed for EACH SECTOR in our solution... maybe for loop to execute it for each defined sector in each solution

    //logic for one truck
    if (trks === 1) {

        console.log(`one truck!`);

        //bc the depot is always the first item in the locs array, delete it from the locs array and start using the nextClosest function to sequence the route array
        //we always want to start with locs[0], so...

        //grabs current depot loc object first... variable holds the current loc object reference point
        let currObj = locs[0];

        //copies the locs array to create an array to hold the locs remaining... spread operator to copy it
        let locsLeft = [...locs];

        //removes the depot object from the locsLeft array
        locsLeft.splice(0, 1);
        console.log(`locsLeft starting length: ${locsLeft.length}`);

        //adding the depot as the first item in the sequence array
        sequencedStops.push(locs[0]);

        //will need to add code here to put the directional extreme (north or west) as second loc object in the sequence array
        //---thought here is that we need to use directional logic, then closest logic within each section. start at directional extreme (north or west), then go closest-closest from there


        //this code below here is the closest-closest code...
        //for loop to iterate through the code that populates the sequencedStops array
        for (let u = 0; u < (locs.length - 1); u++) {

            let nextObj = nextClosest(currObj, locsLeft);

            //code to remove currectObj from locsleft
            let removeIndex = locsLeft.indexOf(nextObj);
            locsLeft.splice(removeIndex, 1);

            console.log(`locsLeft length now: ${locsLeft.length}`);

            sequencedStops.push(nextObj);
            currObj = nextObj;

        };

        //adding the depot as the last item in the sequence array
        sequencedStops.push(locs[0]);

        //code to iterate through sequencedStops and to populate the sequencedLocations array (array that holds ONLY the location [lat, long])
        for (let l in sequencedStops) {

            sequencedLocations.push(sequencedStops[l].loc)

        };

        //now have both sequencedStops and sequencedLocations populated
        //add truck one sequence to the solutionOne map
        //first key is truck number (number data type), value is array of sequenced locations [lat, long] for printing to the UI map view
        //second key is truck number in string form, value is array of sequenced loc objects
        solutionOne.set(0, sequencedLocations).set(`truck0`, sequencedStops);


        //code abv sequences stops from closest to closest for one truck only

    } else if (trks === 2) {

        console.log(`two trucks!`);

        //logic for two trucks...

        //---for two trucks, we want two sectors that are as equal in number of stops as possible for equivalent break-up (n/s or e/w) AND we want the biggest sector, then the rest (if NW is biggest, we want that, then the rest)
        if (cardBreak === 'WE') {

            console.log(`west/east executing!`);


            //array to hold only the loc objects for the sector that we want to sequence
            let sectW = [];

            for (let q in nw) {

                //using the indexes that are held in the directional sector array (nw, ne, etc), pushes the loc objects for the needed sector to the sectLocs array
                sectW.push(locs[nw[q]])

            }

            //adding the ne sector locs to the array
            for (let q in sw) {

                //using the indexes that are held in the directional sector array (nw, ne, etc), pushes the loc objects for the needed sector to the sectLocs array
                sectW.push(locs[sw[q]])

            }

            //sectW is now the full array holding all the loc objects in the west sector that we want to sequence


            //array to hold only the loc objects for the sector that we want to sequence
            let sectE = [];

            for (let q in ne) {

                //using the indexes that are held in the directional sector array (nw, ne, etc), pushes the loc objects for the needed sector to the sectLocs array
                sectE.push(locs[ne[q]])

            }

            //adding the se sector locs to the array
            for (let q in se) {

                //using the indexes that are held in the directional sector array (nw, ne, etc), pushes the loc objects for the needed sector to the sectLocs array
                sectE.push(locs[se[q]])

            }

            //sectE is now the full array holding all the loc objects in the east sector that we want to sequence

            //can now use the code from the one truck logic to sequence these...

            //using for loop to sequence these...

            for (let u in [sectW, sectE]) {

                //resetting the values of sequencedStops and sequencedLocations
                sequencedStops = [];
                sequencedLocations = [];

                //grabs current depot loc object first... variable holds the current loc object reference point
                let currObj = locs[0];

                //copies the locs array to create an array to hold the locs remaining... spread operator to copy it
                let locsLeft = [...[sectW, sectE][u]];

                console.log(`west sector starting length: ${locsLeft.length}`);

                //commented this out to avoid including the depot in the sequencing that follows...
                //adding the depot as the first item in the sequence array
                // sequencedStops.push(locs[0]);

                //function here finds the most extreme loc and returns the associated loc object... variable here holds the extreme loc obj
                let mostNorth = extNorth(locsLeft);


                //will then let the original closest-closest code run to determine the natural closest-closest order, then will use sequencedStops.indexOf(mostWest) to determine at which index the most extreme loc sits, then will remove it from the sequence with splice as we did below for the nextOjb, then will need to run sequences with the extreme index at index zero through its natural index in the closest-closest sequence, saving each somehow... map???


                //---thought here is that we need to use directional logic with closest logic... closest-closest to find which index the extreme loc is in the sequence, then running sequences with the extreme at index zero through its natural index in the closest-closest sequence



                //this code below here is the closest-closest code...
                //for loop to iterate through the code that populates the sequencedStops array
                for (let i = 0; i < ([sectW, sectE][u].length); i++) {

                    let nextObj = nextClosest(currObj, locsLeft);

                    //code to remove currectObj from locsleft
                    let removeIndex = locsLeft.indexOf(nextObj);
                    locsLeft.splice(removeIndex, 1);

                    console.log(`sector length now: ${locsLeft.length}`);

                    sequencedStops.push(nextObj);
                    currObj = nextObj;

                };
                //to write function for this... need currObj (loc object from which we are routing to the next closest loc obj) and locsleft (array of loc objs remaining) args... also need first stop---first stop would be beginning currObj (where you want to start the closest-closest sequence)
                //function would sequence closest-closest, returning an array of sequenced objs, which could then be combined with the spread operator before and after the extreme loc is added in???

                //commented this out to avoid sequencing the depot in the sequencing that follows...
                //adding the depot as the last item in the sequence array... sequencedStops holds loc objs
                // sequencedStops.push(locs[0]);

                /*--------------------------------------------------
                ADDED CODE HERE TO SEQUENCE THE MOST EXTREME LOC
                */
                //code here adds finds the index of the most extreme north loc in the sequence, then removes it from the sequencedStops sequence with splice
                let ext = sequencedStops.indexOf(mostNorth);
                sequencedStops.splice(ext, 1);

                console.log(`ext is: ${ext}`);

                //variable to hold all the different solution sequences
                //array or arrays... each index in the parent array is an array of loc objects sequenced as a psbl solution
                let solCont = [];

                //variable to hold sequence TO the most extreme loc
                let seqOne;

                //variable to hold the sequence FROM the most extreme loc to the end of the remaining locs to be sequenced
                let seqTwo;


                /*sequencing the extreme loc, running closest-closest both before and after it*/
                for (let y = 0; y < ext; y++) {

                    //scaffolding...
                    console.log(`-------------------------`);
                    console.log(`running time number: ${y}`);

                    console.log(`seqStops:`);
                    console.log(sequencedStops);
                    //this scaffold shows that srquencedStops is empty on the second and subsequent interations through this... why???

                    //sequencing to the most extreme loc
                    seqOne = closeClose(locs[0], sequencedStops, y);
                    //returned array = [[sequenced objs], [remaining objs]]
                    //for closeClose(locs[0], sequencedStops, 0)...returned array would be [[seq === empty array], [remain === orig array]]

                    //sequencing from the extreme loc to the end
                    seqTwo = closeClose(mostNorth, seqOne[1]);

                    /*
                    //creating sequence array to push into the solution container array (solCont)...
                    let sArr = seqOne.concat(mostNorth, seqTwo, locs[0])

                    //scaffolding
                    console.log(`seq arr next:`);
                    console.log(sArr);

                    solCont.push(sArr);
                    */

                    //pushing the sequenced array into the solution container
                    solCont.push([...seqOne[0], ...seqTwo[0], locs[0]]);

                    //scaffolding...
                    console.log(`seqone follows this:`);
                    console.log(seqOne[0]);

                    console.log(`seqtwo follows this:`);
                    console.log(seqTwo[0]);

                    //scaffolding...
                    console.log(`end running time number: ${y}`);
                    console.log(`-------------------------`);


                };

                //may not need this... leaving it for now. this code block executes when the index of the most extreme point is zero (when the most extreme point (w or N) happens to also be the closest point to the depot in the closest-closest sequencing... not common)
                if (ext === 0) {

                    //sequencing to the most extreme loc
                    seqOne = closeClose(locs[0], sequencedStops, 0);
                    //returned array = [[sequenced objs], [remaining objs]]
                    //for closeClose(locs[0], sequencedStops, 0)...returned array would be [[seq === empty array], [remain === orig array]]

                    //sequencing from the extreme loc to the end
                    seqTwo = closeClose(mostNorth, seqOne[1]);

                    /*
                    //creating sequence array to push into the solution container array (solCont)...
                    let sArr = seqOne.concat(mostNorth, seqTwo, locs[0])

                    //scaffolding
                    console.log(`seq arr next:`);
                    console.log(sArr);

                    solCont.push(sArr);
                    */

                    //pushing the sequenced array into the solution container
                    solCont.push([...seqOne[0], ...seqTwo[0], locs[0]]);

                    //scaffolding...
                    console.log(`seqone follows this:`);
                    console.log(seqOne[0]);

                    console.log(`seqtwo follows this:`);
                    console.log(seqTwo[0]);

                };


                //code below was orig code for seq extreme with close-close... incorrect as discussed abv...
                /*then will need to run sequences with the extreme index at index zero through its natural index in the closest-closest sequence, saving each somehow... thinking array of solutions*/
                /*
                for (let y = 0; y < ext; y++) {

                    //variable to copy sequencedStops array so that we can reset the sequence to the orig sequencedStops array in each iteration of the for loop
                    let s = [...sequencedStops]

                    //scaffolding...
                    console.log(`copy of sequencedStops follows this`);
                    console.log(s);

                    //adding the most extreme north loc to the sequencedStops array
                    s.splice((y + 1), 0, mostNorth);

                    //scaffolding...
                    console.log(`checking length: ${s.length}`);
                    console.log(`s follows this...`);
                    console.log(s);


                    //pushes the current solution array to solCont
                    solCont.push(s);

                }
                

                */
                //scaffolding... to show the solution container in each iteration (east and west)
                console.log(`index of most extreme loc: ${ext}`);
                console.log(`index number abv should match this number: ${(solCont.length)}`);
                console.log(`solution container number ${u}: ${solCont}`);
                console.log(`solCont[0] follows this:`);
                console.log(solCont[0]);

                /*--------------------------------------------------
                END OF ADDED CODE TO SEQUENCE THE MOST EXTREME LOC
                */

                //at this point in the code, solCont is an array that holds all iterations of the extreme loc sequencing
                //need to write our function to determine total route distance, use it here, and then only print to the map the route with the shortest distance

                //variable to hold array of distances for each solution in solCont
                let distTotals = [];

                //looping over the array of routing solutions (solCont... which contains loc objects), extracting only the loc coordinates from each for use with totalDist(), then determining the total distance for each solution in solCont (adding each to array, with distance that corresponds to its matching solution in solCont)
                for (let s of solCont) {

                    //temp variable to hold [[lat, long]] coords of current solution
                    let tempCoords = [];

                    //extracting only the loc coordinates for each solution...
                    for (let pl of s) {

                        tempCoords.push(pl.loc)

                        console.log(`iteration through loc: ${pl}`);

                    };

                    console.log(`iteration through solution ${s}`);

                    console.log(`temp coords:`);
                    console.log(tempCoords);

                    distTotals.push(totalDist(tempCoords));

                };

                console.log(`completed dist totals:`);
                console.log(distTotals);

                //variable to hold index of shortest distance solution
                let short = distTotals.indexOf(findLowest(distTotals));
                //bc this corresponds the to solution's index in solCont, we should be able to plug this in as an the index of solCont to be drawn below...
                console.log(`short!`);
                console.log(short);

                console.log(`shortest solution!`);
                console.log(solCont[short]);

                //code to iterate through sequencedStops and to populate the sequencedLocations array (array that holds ONLY the location [lat, long])
                //changed this to currently only draw the first solution in the solCont sequence array. this code is changing anyway bc the routing is incorrect
                for (let l in solCont[short]) {

                    sequencedLocations.push(solCont[short][l].loc)

                };

                //now have both sequencedStops and sequencedLocations populated
                //add truck one sequence to the solutionOne map
                //first key is truck number (number data type), value is array of sequenced locations [lat, long] for printing to the UI map view
                //second key is truck number in string form (starts at zero), value is array of sequenced loc objects
                solutionOne.set(u, sequencedLocations).set(`truck${u}`, solCont[short]);
                //this needs to be solCont[short] instead ot sequencedstops!!!

                //code to add the sequence to the map
                let polyline = L.polyline(sequencedLocations, { color: clr[u] }).addTo(map);

                map.fitBounds(polyline.getBounds());


            }





        } else if (cardBreak === 'NS') {

            console.log(`north/south executing!`);

            //array to hold only the loc objects for the sector that we want to sequence
            let sectN = [];

            for (let q in nw) {

                //using the indexes that are held in the directional sector array (nw, ne, etc), pushes the loc objects for the needed sector to the sectLocs array
                sectN.push(locs[nw[q]])

            }

            //adding the ne sector locs to the array
            for (let q in ne) {

                //using the indexes that are held in the directional sector array (nw, ne, etc), pushes the loc objects for the needed sector to the sectLocs array
                sectN.push(locs[ne[q]])

            }

            //sectW is now the full array holding all the loc objects in the west sector that we want to sequence


            //array to hold only the loc objects for the sector that we want to sequence
            let sectS = [];

            for (let q in se) {

                //using the indexes that are held in the directional sector array (nw, ne, etc), pushes the loc objects for the needed sector to the sectLocs array
                sectS.push(locs[se[q]])

            }

            //adding the ne sector locs to the array
            for (let q in sw) {

                //using the indexes that are held in the directional sector array (nw, ne, etc), pushes the loc objects for the needed sector to the sectLocs array
                sectS.push(locs[sw[q]])

            }

            //sectE is now the full array holding all the loc objects in the east sector that we want to sequence

            //can now use the code from the one truck logic to sequence these...

            //using for loop to sequence these...

            for (let u in [sectN, sectS]) {

                //resetting the values of sequencedStops and sequencedLocations
                sequencedStops = [];
                sequencedLocations = [];

                //grabs current depot loc object first... variable holds the current loc object reference point
                let currObj = locs[0];

                //copies the locs array to create an array to hold the locs remaining... spread operator to copy it
                let locsLeft = [...[sectN, sectS][u]];

                console.log(`north sector starting length: ${locsLeft.length}`);

                //adding the depot as the first item in the sequence array
                // sequencedStops.push(locs[0]);


                //will need to add code here to find the directional extreme west in the locsleft array
                //function here finds the most extreme loc and returns the associated loc object... variable here holds the extreme loc obj
                let mostWest = extWest(locsLeft);

                //will then let the original closest-closest code run to determine the natural closest-closest order, then will use sequencedStops.indexOf(extremLoc) to determine at which index the most extreme loc sits, then will remove it from the sequence with splice as we did below for the nextOjb, then will need to run sequences with the extreme index at index zero through its natural index in the closest-closest sequence, saving each somehow... map???


                //---thought here is that we need to use directional logic with closest logic... closest-closest to find which index the extreme loc is in the sequence, then running sequences with the extreme at index zero through its natural index in the closest-closest sequence


                //this code below here is the closest-closest code...
                //for loop to iterate through the code that populates the sequencedStops array
                for (let i = 0; i < ([sectN, sectS][u].length); i++) {

                    let nextObj = nextClosest(currObj, locsLeft);

                    //code to remove currectObj from locsleft
                    let removeIndex = locsLeft.indexOf(nextObj);
                    locsLeft.splice(removeIndex, 1);

                    console.log(`sector length now: ${locsLeft.length}`);

                    sequencedStops.push(nextObj);
                    currObj = nextObj;

                };

                //adding the depot as the last item in the sequence array
                // sequencedStops.push(locs[0]);



                /*--------------------------------------------------
                ADDED CODE HERE TO SEQUENCE THE MOST EXTREME LOC
                */
                //code here adds finds the index of the most extreme west loc in the sequence, then removes it from the sequencedStops sequence with splice
                let ext = sequencedStops.indexOf(mostWest);
                sequencedStops.splice(ext, 1);

                console.log(`ext is: ${ext}`);

                //variable to hold all the different solution sequences
                //array or arrays... each index in the parent array is an array of loc objects sequenced as a psbl solution
                let solCont = [];

                //variable to hold sequence TO the most extreme loc
                let seqOne;

                //variable to hold the sequence FROM the most extreme loc to the end of the remaining locs to be sequenced
                let seqTwo;


                /*sequencing the extreme loc, running closest-closest both before and after it*/
                for (let y = 0; y < ext; y++) {

                    //scaffolding...
                    console.log(`-------------------------`);
                    console.log(`running time number: ${y}`);

                    console.log(`seqStops:`);
                    console.log(sequencedStops);
                    //this scaffold shows that srquencedStops is empty on the second and subsequent interations through this... why???---fixed

                    //sequencing to the most extreme loc
                    seqOne = closeClose(locs[0], sequencedStops, y);
                    //returned array = [[sequenced objs], [remaining objs]]
                    //for closeClose(locs[0], sequencedStops, 0)...returned array would be [[seq === empty array], [remain === orig array]]

                    //sequencing from the extreme loc to the end
                    seqTwo = closeClose(mostWest, seqOne[1]);


                    //pushing the sequenced array into the solution container
                    solCont.push([...seqOne[0], ...seqTwo[0], locs[0]]);
                    //need to add locs[0] to end of this... didnt do it now bc didnt want to break code somehow...

                    //scaffolding...
                    console.log(`seqone follows this:`);
                    console.log(seqOne[0]);

                    console.log(`seqtwo follows this:`);
                    console.log(seqTwo[0]);

                    //scaffolding...
                    console.log(`end running time number: ${y}`);
                    console.log(`-------------------------`);


                };

                //may not need this... leaving it for now. this code block executes when the index of the most extreme point is zero (when the most extreme point (w or N) happens to also be the closest point to the depot in the closest-closest sequencing... not common)
                if (ext === 0) {

                    //sequencing to the most extreme loc
                    seqOne = closeClose(locs[0], sequencedStops, 0);
                    //returned array = [[sequenced objs], [remaining objs]]
                    //for closeClose(locs[0], sequencedStops, 0)...returned array would be [[seq === empty array], [remain === orig array]]

                    //sequencing from the extreme loc to the end
                    seqTwo = closeClose(mostWest, seqOne[1]);


                    //pushing the sequenced array into the solution container
                    solCont.push([...seqOne[0], ...seqTwo[0], locs[0]]);

                    //scaffolding...
                    console.log(`seqone follows this:`);
                    console.log(seqOne[0]);

                    console.log(`seqtwo follows this:`);
                    console.log(seqTwo[0]);

                };




                //scaffolding... to show the solution container in each iteration (east and west)
                console.log(`index of most extreme loc: ${ext}`);
                console.log(`index number abv should match this number: ${(solCont.length)}`);
                console.log(`solution container number ${u}: ${solCont}`);
                console.log(`solCont[0] follows this:`);
                console.log(solCont[0]);

                /*--------------------------------------------------
                END OF ADDED CODE TO SEQUENCE THE MOST EXTREME LOC
                */

                //at this point in the code, solCont is an array that holds all iterations of the extreme loc sequencing
                //need to write our function to determine total route distance, use it here, and then only print to the map the route with the shortest distance

                //variable to hold array of distances for each solution in solCont
                let distTotals = [];

                //looping over the array of routing solutions (solCont... which contains loc objects), extracting only the loc coordinates from each for use with totalDist(), then determining the total distance for each solution in solCont (adding each to array, with distance that corresponds to its matching solution in solCont)
                for (let s of solCont) {

                    //temp variable to hold [[lat, long]] coords of current solution
                    let tempCoords = [];

                    //extracting only the loc coordinates for each solution...
                    for (let pl of s) {

                        tempCoords.push(pl.loc)

                        console.log(`iteration through loc: ${pl}`);

                    };

                    console.log(`iteration through solution ${s}`);

                    console.log(`temp coords:`);
                    console.log(tempCoords);

                    distTotals.push(totalDist(tempCoords));

                };

                console.log(`completed dist totals:`);
                console.log(distTotals);

                //variable to hold index of shortest distance solution
                let short = distTotals.indexOf(findLowest(distTotals));
                //bc this corresponds the to solution's index in solCont, we should be able to plug this in as an the index of solCont to be drawn below...
                console.log(`short!`);
                console.log(short);

                console.log(`shortest solution!`);
                console.log(solCont[short]);

                //code to iterate through sequencedStops and to populate the sequencedLocations array (array that holds ONLY the location [lat, long])
                //changed this to currently only draw the first solution in the solCont sequence array. this code is changing anyway bc the routing is incorrect
                for (let l in solCont[short]) {

                    sequencedLocations.push(solCont[short][l].loc)

                };

                //now have both sequencedStops and sequencedLocations populated
                //add truck one sequence to the solutionOne map
                //first key is truck number (number data type), value is array of sequenced locations [lat, long] for printing to the UI map view
                //second key is truck number in string form (starts at zero), value is array of sequenced loc objects
                solutionOne.set(u, sequencedLocations).set(`truck${u}`, solCont[short]);
                //this needs to be solCont[short] instead ot sequencedstops!!!


                //code to add the sequence to the map
                let polyline = L.polyline(sequencedLocations, { color: clr[u] }).addTo(map);

                map.fitBounds(polyline.getBounds());


            }


        }



    } else if (trks === 3) {


        //---for three trucks, we want the three sectors (one of which will have to be a combined sector (nw+ne, etc.)) as equal as psbl, and we want to break up by two biggest individual sectors first, then the last two

    } else if (trks === 4) {

        //---for four trucks, will use the four defined sectors, but we also want to know if maybe splitting one sector between two trucks might make sense (dividing the number of stops in a sector by two and splitting them between two trucks, giving the other three sectors to the remaining two trucks)


    } else if (trks >= 5) {


        //---for five trucks, we will use the two directional sectors (w/e or n/s) and divide them by stops (splitting the bigger directional sectors evenly), but we also want to know if it might make sense to use the four defined sectors, breaking one of them up between two trucks. we also want to know if/when if doesnt make sense to have the fifth truck
        //---for six trucks and on, we will use the logic for five trucks


    }

    //end of code for each sector in our solution
    /////////////////////////////////////////////////////////////
    ///////


    //start here after 9/21/23!!!

    //---need to make all of this plug and play with more trucks and user priority selections

    //---also need to define sectors (NW, NE, SE, SW) so that we can later work on solutions by sector---DONE! global vars created to hold array of loc obj ids for each loc in that sector (length prop of each array would be the number of stops in that sector)

    //for abv, need...
    //---function to iterate through sector array of loc ids and to return an array of just latitudes or just longitudes, associated with each loc id (maybe a table... like the matrix array with index zero as a heading array, then index one as the lat or long for each loc id)
    //-----or, probably what we need, is a table as described just abv, except with all of the ids and latitudes, and a seperate table as abv, except with all ids and longitudes. then could just reference these tables as we reference the distances matrix in the other solution---done!!!

    //bug... need to take the bearing data away from the depot in the getBearing function (depot needs to be [0, 0] or something... right now shows NE)---fixed!!!


    //will need to add logic here to display the best, most efficient solution that's chosen based on user preferences and the routing... for now... only displaying solution one
    //uses a for loop and the number of trks to iterate through each part of the solution that is held in the map and to diplay each as a seperate color



    //start here after 10/19/23...
    //sequencing logic for the we/ns sectors seems to be working!
    //remember, indices of the truck numbers in the solutions map are starting at zero

    //to determine best solution...
    //---for n/s, going extreme w then closest will not always give us the best solution... might cause us to pass a closer stop on the way to the extreme starting point, backtracking us to the closer point before continuing...
    //---need to write BOTH closest, then extreme west, the closest to end AND extreme west, then closest to end
    //-----instead of writing both the abv, could also write logic to sequence directionally by using differences in lat/long number values
    //-------taking the depot lat/long - the lat/long of each stop to determine which ones are closest in value, with logic to not allow backtracking (if going exteme w to e, not allowing backtracking to the west)
    //---------probably the best solution here would be to write logic to prevent backtracking (if going exteme w to e, not allowing backtracking to the west, and if going extreme n-s, not allowing backtracking to the north)
    //---(as of 10/19/23, we are just sequencing BOTH one and two truck solutions as closest-closest)
    //-----need to write logic to run multiple solutions and then determine the best one??? have the structure built (solutionOne, two and three maps as global variables)

    //as of 10/19/23, we are writing each solution to the map as they are calculated. will need to change this once we start generating multiple solutions, to only draw the solutions on the map once they are determined to be the most efficient
    //---(in the for loops within the one and two truck if statements, we are currently writing each solution to the map as the solutions are generated for each truck)


}




///////



//logic for determining which icon is used on a click event...

///////
//logic for determining which icon is used on a click event...
//depends on the current mapClick value... depot, etc.
//puts icon to show the user the type of event (depot, pickup, dropoff, pick/drop)... let theIcon = depot, etc... ()
//---if mapClick === 'depot', icon = depot, etc (if/else below)
//---if mapClick === 'pick', icon = up arrow
//---if mapClick === 'drop', icon = down arrow
//---if mapClick === 'pickdrop', icon = up/down arrows

//for stopId, need to gray-out the other buttons until depot is selected---done!

//(probably need to change L.popup to L.marker in code below)---done!

//next steps... find icons for each type of click event and save them into the project folder.---DONE
//add leaflet code to use the custom icons on click events (see "icon" in documentation)---done!
//add code to display icons/markers when the map is clicked---done!

//next...
//add code to hold the lat/long values for the depot and for each location in the global variables---done!!!
//location objects...
//type: depot, pick, drop, etc
//stopId
//location: lat/long
//getter---distance from depot (zero is depot)
//getter---bearing from depot (N, NE, S, SE, E, W, SW, NW) maybe [N, E], etc. (array with two cardinal directions relative to the depot)
//getter for three closest stopIds???? (based on matrix below)
//abv is done!

//function for calculating distance between two points is done!!!

//next... after 8/30/23...
//build bearing function that you started---done 9/3/23!
//build the logic to add the bearing data to each object (relative to the depot)---done!
//not done... not sure I need this... build logic to add depotDistance to each Loc object in the locs array
//build logic to create array matrix described below...---done!

//matrix (array of arrays) to hold distance of each stop from each other stop... depot is always stop zero
//array zero is headings for the matrix
//array one is depot and its distances from each other stop
//array two is stop one and its distances from each other stop, etc
//index zero of array one would be zero bc the depot is 0 miles from itself
//index one of array two would be zero for same reason as abv, etc.
//for each stop object (stopId), could then determine which stop(s) are the closest (least distance... smallest number(s) in array)


///////
//route logic notes...

//then, work on logic for determining the routes
//maybe start with just one truck and create logic for writing the route to the map, then add multiple trucks and write the logic for determining the optimized routes

//maybe, depending on the number of trucks, use cardinal direction sectors for the trucks (two trucks = one north and one south, or one east and one west, depending on the dispersion of stops in each cardinal direction... check for highest dispersion in reciprocal directions and use this as starting point???)
//this basically gives us four sectors (either carindal directions or the corners) unless we allow two trucks to work one sector

//build logic to come up with several solutions with different priorities and dislay to user (combining sectors, vs not, etc.)
//have program interate through multiple different solutions for each scenario and output the best one, along with option to choose different one

//as we iterate through the trucks and points in the sectors, can remove the stop object from the locs array and add them to the sector array???

//maybe use shape overlays on the map to determine which points should go to which trucks... use this as starting point for computer to iterate through solutions???
//problem... how to write logic for sequencing the points, beyond just closest point to closest point

///////



/////////////////////////////////////////////////////////////
//leaflet map init and openstreetmap tiles...

//initializing the leaflet map at KC, MO
let map = L.map('map').setView([39.099724, -94.578331], 13);

//initializing leaflet pop-ups
let popup = L.popup();

//initializing leaflet markers to show type of stop
let marker = L.marker();


//adding openstreetmap tiles
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);


//function to handle single click event on map
function onSingleClick(e) {
    // popup
    //     .setLatLng(e.latlng)
    //     .setContent("You clicked the map at " + e.latlng.toString())
    //     .openOn(map);

    //initializing leaflet icon for the map markers
    //iconPath points to correct icon for the current toggle button
    let stopIcon = L.icon({
        iconUrl: iconPath,
        iconSize: [30, 76],
        // iconAnchor: [0, 0],
        popupAnchor: [-3, -76]
    })

    //adding marker with the corresponding icon type to the map
    //in leaflet, options are contained in objects {marker options} (below)
    L.marker(e.latlng, { icon: stopIcon }).addTo(map);

    //need to add logic for saving the lat/long data in an array for use in determining our routes, etc.---done!!!
    console.log([e.latlng.lat, e.latlng.lng]);

    //e.latlng.lat --- gives just latitude
    //e.latlng.lng --- gives just longitude


    //instantiating new location object for each click
    let newLoc = new Loc(mapClick, stopId, [e.latlng.lat, e.latlng.lng]);

    //adding new Loc object to the array that holds the Loc objects
    locs.push(newLoc);
    console.log(locs);

    //increments the stopId variable to id assignments
    stopId += 1;
    console.log(`stop id: ${stopId}`);

    //if statement to run only right after depot is selected
    //disables the depot button, enables the rest, and moves toggle selection to the dropoff only button
    if (iconPath === `depot.svg` && stopId === 1) {

        depot = [e.latlng.lat, e.latlng.lng];

        //removes the selected button styling from depot button
        depotButton.classList.remove('buttonSelected');

        //disables the depot button, enables all other toggle buttons
        depotButton.disabled = true;
        dropButton.disabled = false;
        pickupButton.disabled = false;
        pickdropButton.disabled = false;

        //setting the toggle to the dropoff only button
        mapClick = `dropoff`;
        iconPath = `dropoff.svg`;

        dropButton.classList.add(`buttonSelected`);
    }

};

//map.on is leaflet method for adding event listener
map.on('click', onSingleClick)
//can also add map.off to remove event listener functionality when done with it



////////////////////////////////////////////////////////////

//geolocation api to get user position... come back to this

//callback function that returns the position
function assignPosition(position) {
    const userLat = position.coords.latitude;
    const userLong = position.coords.longitude;

    userPosition = [userLat, userLong];

    return userPosition;
};


//function to get user's current position using the geolocation api built-in to most browsers
function getCurrLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(assignPosition)
    } else {
        console.log('error!');
    }
};






/*--the map interaction in this program was developed with Leaflet JS, the amazing open source map interaction library. It is licensed as written below:
    
    BSD 2-Clause License

Copyright (c) 2010-2023, Volodymyr Agafonkin
Copyright (c) 2010-2011, CloudMade
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.*/



/*the map graphics themselves are from OpenStreetMap, the amazing open source map utility!

Their copyright notice can be found at:

https://www.openstreetmap.org/copyright

*/


/* Copyright (c) 2023 by Mike Schober */
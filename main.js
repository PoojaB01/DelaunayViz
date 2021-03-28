function init() {
    document.getElementById("board").addEventListener("click", addPoint);
    document.getElementById("run").style.pointerEvents = 'none';
    document.getElementById("addpoint").style.pointerEvents = 'none';
    console.log("Init called.");
}

window.onload = init;

numPoints = 0;
points = [];

function addPoint(event) {
    console.log("Adding point at", event.clientX, event.clientY);
    points.push(new point(event.clientX, event.clientY, numPoints));
    var pointDiv = document.createElement("div");
    pointDiv.className = "point";
    pointDiv.id = "vertex-" + numPoints++;
    pointDiv.style.left = (event.clientX - 5) + "px";
    pointDiv.style.top = (event.clientY - 5) + "px";
    document.body.append(pointDiv);
    if (step == -1) {
        document.getElementById("run").style.pointerEvents = 'auto';
        document.getElementById("run").classList.remove("disable");
    }

}

var step = -1;
var delaunay;

var wait = 1000;

var graphChoice = "none";

function radioChange() {
    graphChoice = document.querySelector('input[name="graph-selection"]:checked').value;
    modifyEdgeList(delaunay.triangleList, delaunay.s1, delaunay.s2, delaunay.s3);
}

function setWait(val) {
    wait = 5000 - val;
    console.log(wait);
}

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

function makeTriangulation() {
    document.getElementById("board").removeEventListener("click", addPoint);
    console.log("Triangulation called.");
    var board = document.getElementById("board");
    // var height = board.offsetHeight;
    // var width = board.offsetWidth;
    var height = 5000;
    var width = 5000;
    console.log(height, width);
    if (step == -1)
        delaunay = new triangulation(points, height, width);
    step = 0;

    var intv = setInterval(callStep, wait);

    function callStep() {
        if (step == points.length) {
            document.getElementById("addpoint").style.pointerEvents = 'auto';
            document.getElementById("addpoint").classList.remove("disable");
            clearInterval(intv);
        } else {
            delaunay.triangulate(step);
            step++;
        }
    }


    document.getElementById("run").style.pointerEvents = 'none';
    document.getElementById("run").classList.add("disable");
}

function addPoints() {
    document.getElementById("board").addEventListener("click", addNewPoint);
}

function addNewPoint(event) {
    addPoint(event);
    delaunay.addNewPoint(points[points.length - 1]);
    var x = [];
    var y = [];
    var i;
    for (i = 0; i < points.length; i++) {
        x.push(points[i].x);
        y.push(-points[i].y);
    }
    console.log(x);
    console.log(y);
}

function reset() {
    document.getElementById("board").removeEventListener("click", addNewPoint);
    document.getElementById("board").addEventListener("click", addPoint);
    var pointList = document.getElementsByClassName("point");
    var i;
    for (i = pointList.length - 1; i >= 0; i--) {
        pointList[i].remove();
        numPoints--;
    }
    var edgeList = document.getElementsByClassName("edge");
    for (i = edgeList.length - 1; i >= 0; i--) {
        edgeList[i].remove();
    }
    step = -1;
    console.log(points);
    points = [];
    console.log("Reset called.");
    document.getElementById("run").style.pointerEvents = 'none';
    document.getElementById("addpoint").style.pointerEvents = 'none';
    document.getElementById("run").classList.add("disable");
    document.getElementById("addpoint").classList.add("disable");
}

function drawline(point1, point2) {
    var thickness = 2;
    var color = "green";
    x1 = point1.x;
    x2 = point2.x;
    y1 = point1.y;
    y2 = point2.y;
    var length = Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));
    // center
    var cx = ((x1 + x2) / 2) - (length / 2);
    var cy = ((y1 + y2) / 2) - (thickness / 2);
    // angle
    var angle = Math.atan2((y1 - y2), (x1 - x2)) * (180 / Math.PI);
    // make hr
    var line = document.createElement("div");
    line.style.top = cy + "px";
    line.style.left = cx + "px";
    line.style.width = length + "px";
    // console.log(cx, cy, length);
    line.style.transform = "rotate(" + angle + "deg)";
    line.className = "edge";
    line.id = "edge-" + point1.id + "-" + point2.id;
    "<div style='padding:0px; margin:0px; height:" + thickness + "px; background-color:" + color + "; line-height:1px; position:absolute; left:" + cx + "px; top:" + cy + "px; width:" + length + "px; -moz-transform:rotate(" + angle + "deg); -webkit-transform:rotate(" + angle + "deg); -o-transform:rotate(" + angle + "deg); -ms-transform:rotate(" + angle + "deg); transform:rotate(" + angle + "deg);' />";
    document.body.append(line);
}



// ---------------------------------------------------

class triangulation {
    constructor(pointList, width, height) {
        this.pointList = pointList;
        this.width = width;
        this.height = height;
        this.triangleList = [];
        // Add super triangle
        this.s1 = new point(-this.width, -this.height, 1000);
        this.s2 = new point(this.width * 2 + 1, -this.height, 1001);
        this.s3 = new point(-this.width, this.height * 2 + 1, 1002);
        this.triangleList.push(new triangle(this.s1, this.s2, this.s3));
        this.convexHull = [];
    }
    addNewPoint() {
        this.triangulate(this.pointList.length - 1);
    }

    triangulate(i) {
        console.log("Triangulate", i);
        var j, k;

        var badEdges = [];
        var newTriangles = [];
        var circles = [];
        for (j = 0; j < this.triangleList.length; j++) {
            if (this.triangleList[j].contains(this.pointList[i])) {
                var triangleEdges = this.triangleList[j].getEdges();
                circles.push(this.triangleList[j].circle);
                badEdges.push(triangleEdges[0]);
                badEdges.push(triangleEdges[1]);
                badEdges.push(triangleEdges[2]);
            } else newTriangles.push(this.triangleList[j]);
        }
        console.log(badEdges);
        for (j = 0; j < badEdges.length; j++) {
            var flag = true;
            for (k = 0; k < badEdges.length; k++) {
                if (equalEdge(badEdges[j], badEdges[k]) && j != k) {
                    flag = false;
                    break;
                }
            }
            if (flag)
                newTriangles.push(new triangle(badEdges[j].start, badEdges[j].end, this.pointList[i]));
        }
        this.triangleList = [];
        for (j = 0; j < newTriangles.length; j++) {
            var flag = true;
            for (k = 0; k < newTriangles.length; k++) {
                if (equalTriangle(newTriangles[j], newTriangles[k]) && j != k) {
                    flag = false;
                    break;
                }
            }
            if (flag)
                this.triangleList.push(newTriangles[j]);
        }
        console.log(newTriangles.length);
        console.log(this.triangleList);

        setTimeout(showCircles, (wait / 10) * 3);
        setTimeout(showBadEdges, (wait / 10) * 6);
        setTimeout(callModify, (wait / 10) * 9);

        function showCircles() {
            for (j = 0; j < circles.length; j++) {
                var radius = Math.sqrt(circles[j].radius);
                var circleDiv = document.createElement("div");
                circleDiv.className = "circle";
                circleDiv.style.height = 2 * radius + "px";
                circleDiv.style.width = 2 * radius + "px";
                circleDiv.style.top = circles[j].center.y - radius + "px";
                circleDiv.style.left = circles[j].center.x - radius + "px";
                document.body.append(circleDiv);
            }
        }

        function showBadEdges() {
            for (j = 0; j < badEdges.length; j++) {
                var badedge = document.getElementById(badEdges[j].id);
                if (badedge != null) {
                    badedge.style.backgroundColor = "red";
                    badedge.style.zIndex = 2;
                }
            }
            console.log("DONE HERE");
        }

        var triangleList = this.triangleList;
        var s1 = this.s1;
        var s2 = this.s2;
        var s3 = this.s3;

        function callModify() {
            modifyEdgeList(triangleList, s1, s2, s3);
        }
    }
}

function modifyEdgeList(triangleList, s1, s2, s3) {
    console.log("HEYY")
    var edgeList = document.getElementsByClassName("edge");
    for (j = edgeList.length - 1; j >= 0; j--) {
        edgeList[j].remove();
    }
    var circleList = document.getElementsByClassName("circle");
    for (j = circleList.length - 1; j >= 0; j--) {
        circleList[j].remove();
    }
    for (j = 0; j < triangleList.length; j++) {
        if (!triangleList[j].vertex(s1) && !triangleList[j].vertex(s2) && !triangleList[j].vertex(s3) || 0)
            triangleList[j].printTriangle();
    }

    console.log("Choice: ", graphChoice);
    switch (graphChoice) {
        case "none":
            break;
        case "voronoi":
            computeVoronoi(triangleList, s1, s2, s3);
            break;
        case "convex-hull":
            computeConvexHull(triangleList, s1, s2, s3);
            break;
        default:
            break;
    }
}

function computeConvexHull(triangleList, s1, s2, s3) {
    for (j = 0; j < triangleList.length; j++) {
        if (triangleList[j].vertex(s1) || triangleList[j].vertex(s2) || triangleList[j].vertex(s3)) {
            var edges = triangleList[j].getEdges();
            for (k = 0; k < 3; k++) {
                if (!edges[k].vertex(s1) && !edges[k].vertex(s2) && !edges[k].vertex(s3)) {
                    var e = document.getElementById(edges[k].id);
                    if (e != null) {
                        e.style.backgroundColor = "green";
                        e.style.zIndex = 2;
                    }
                }
            }
        }
    }
}

function computeVoronoi(triangleList, s1, s2, s3) {
    for (j = 0; j < triangleList.length; j++) {
        if (triangleList[j].vertex(s1) || triangleList[j].vertex(s2) || triangleList[j].vertex(s3)) {
            var edges = triangleList[j].getEdges();
            for (k = 0; k < 3; k++) {
                if (!edges[k].vertex(s1) && !edges[k].vertex(s2) && !edges[k].vertex(s3)) {
                    var e = document.getElementById(edges[k].id);
                    if (e != null) {
                        e.style.backgroundColor = "green";
                        e.style.zIndex = 2;
                    }
                }
            }
        }
    }
}
// -----------------------------------------------
class point {
    constructor(x, y, id) {
        this.x = x;
        this.y = y;
        this.id = "vertex-" + id;
    }
}
// -------------------------------------------------

class triangle {
    constructor(p1, p2, p3) {
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
        this.edges = [new edge(p1, p2), new edge(p2, p3), new edge(p3, p1)];
        this.circle = new circle(p1, p2, p3);
    }
    getEdges() {
        return this.edges;
    }

    contains(point) {
        return this.circle.radius > distance(point, this.circle.center);
    }

    printTriangle() {
        this.edges[0].printEdge();
        this.edges[1].printEdge();
        this.edges[2].printEdge();
    }

    vertex(p) {
        return equalPoint(this.p1, p) || equalPoint(this.p2, p) || equalPoint(this.p3, p);
    }
}

// ----------------------------------------------------------
class edge {
    constructor(point1, point2) {
        if (point1.x > point2.x || (point1.x == point2.x && point1.y > point2.y)) {
            var p = point1;
            point1 = point2;
            point2 = p;
        }
        this.start = point1;
        this.end = point2;
        this.id = "edge-" + point1.id + "-" + point2.id;
    }

    printEdge() {
        drawline(this.start, this.end);
    }

    vertex(p) {
        return equalPoint(this.start, p) || equalPoint(this.end, p);
    }
}

// ----------------------------------------------

class circle {
    constructor(p1, p2, p3) {
        var A1 = p2.x - p1.x; // A1*x + B1*y = C1 - perpendicular bisector 1
        var B1 = p2.y - p1.y;
        var C1 = (p1.x + p2.x) / 2 * A1 + (p1.y + p2.y) / 2 * B1;

        var A2 = p3.x - p1.x; // A2*x + B2*y = C2 - perpendicular bisector 2
        var B2 = p3.y - p1.y;
        var C2 = (p1.x + p3.x) / 2 * A2 + (p1.y + p3.y) / 2 * B2;

        var det = A1 * B2 - A2 * B1;

        this.center = new point((B2 * C1 - B1 * C2) / det, (A1 * C2 - A2 * C1) / det, 0);
        this.radius = distance(this.center, p1);
    }
}

function distance(p1, p2) {
    return ((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y))
}

function equalTriangle(t1, t2) {
    return equalCircle(t1.circle, t2.circle);
}

function equalCircle(c1, c2) {
    return c1.radius == c2.radius && equalPoint(c1.center, c2.center);
}

function equalEdge(e1, e2) {
    return equalPoint(e1.start, e2.start) && equalPoint(e1.end, e2.end);
}

function equalPoint(p1, p2) {
    return p1.x == p2.x && p1.y == p2.y;
}
var d3 = d3 || {};

(function(){
    "use strict";

    var treemapDataHome = [];
    var treemapDataAway = [];

    function loadJSON(){
        d3.json("JSON/bundesliga06_17.json", function(data){
            buildTreemapJSON(data.bundesliga[10].saison_16_17);
            buildTreemap();
        });
    }

    /*
        data contains one season
    */
    function buildTreemapJSON(data){
        for(var i = 0; i < data.length; i++){
            var homeTeam = data[i]["HomeTeam"];
            var awayTeam = data[i]["AwayTeam"]
            if(!isInData(homeTeam, treemapDataHome)){
                addKeyToJSON(homeTeam, treemapDataHome);
            }
            if(!isInData(awayTeam, treemapDataAway)){
                addKeyToJSON(awayTeam, treemapDataAway);
            }
            switch(data[i]["FTR"]){
                case 'H':  
                    var index = getIndexOfTeam(homeTeam, treemapDataHome);
                    if(index != -1){
                        treemapDataHome[index].value += 1;
                    }
                    else{
                        console.log("Indexfehler" + HomeTeam);
                    }
                    break;
                case 'A':
                var index = getIndexOfTeam(awayTeam, treemapDataAway);
                if(index != -1){
                    treemapDataAway[index].value += 1;
                }
                else{
                    console.log("Indexfehler " + awayTeam);
                }
                    break;
                default: ;
            }
        }
        //console.log(treemapDataAway);
        //console.log(treemapDataHome);
    }

    function addKeyToJSON(team, array)
    {
        var obj = {"team": team, "value": 0}
        array.push(obj);
    }

    function getIndexOfTeam(team, data)
    {
        for(var i = 0; i < data.length; i++){
            if(data[i].team == team){
                return i;
            }
        }
        return -1;
    }

    function isInData(team, data){
        for(var i = 0; i < data.length; i++){
            if(data[i].team == team){
                return true;
            }
        }
        return false;
    }

    function buildTreemap()
    {
        console.log(treemapDataHome);
        var rankingObject = {"children": treemapDataHome}

        var svg = d3.select("svg"),
            width = 500.0,
            height = 600.0;

        var treemap = d3.treemap()
            .tile(d3.treemapResquarify)
            .size([width, height])
            .round(false)
            .paddingInner(1);

        var root = d3.hierarchy(rankingObject)
            .sum(function(d){
                return d.value;
            })
            .sort(function(a, b){
                return b.value - a.value;
            });

        treemap(root);
        addItemsToDOM(svg, root.children);
    }

    function addItemsToDOM(svg, data)
    {
        var gElements = svg.selectAll("g")
            .data(data)
            .enter().append("g")
            .attr("transform", function(d, i){
                return "translate(" + d.x0 + "," + d.y0 + ")";
            });

        var rectangles = svg.selectAll("g")
            .append("rect")
            .attr("height", function(d){
                return d.y1 - d.y0;
            })
            .attr("width", function(d){
                return d.x1 - d.x0;
            })
            .attr("class", "HomeStat");

        var labels = svg.selectAll("g")
            .append("text")
            .text(function(d){
                return d.data["team"];
            })
            .attr("dy", "2em")
            .attr("dx", "1em")
            .attr("width", function(d){
            return d.x1 - d.x0});
    }


    loadJSON();
}());
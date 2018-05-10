var d3 = d3 || {};

(function(){
    "use strict";

    var treemapDataHome = [];
    var treemapDataAway = [];
    var $compareAreaOneTeam = undefined;
    var $compareAreaTwoTeam = undefined;
    var saveCompareAreaObjectsInformation = [];

    var treemapHomeID = "#treemapHomeTeam";
    var treemapAwayID = "#treemapAwayTeam";

    var compareAreaElementHeight = 50;
    var singleUnitWidth = 10;
    var compareAreaWidth

    function loadJSON(){
        d3.json("JSON/bundesliga06_17.json", function(data){
            buildTreemapJSON(data.bundesliga[10].saison_16_17);
            buildTreemap(treemapDataHome, treemapHomeID);
            buildTreemap(treemapDataAway, treemapAwayID);
            setGElementsAsButtons();
        });
    }

    /*
        builds treemapDataHoem and treemapDataAway arrays by extracting from the data json
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

    /*
        adds a new team to the array
    */
    function addKeyToJSON(team, array)
    {
        var obj = {"team": team, "value": 0}
        array.push(obj);
    }

    /*
        returns the index of the team in the data array
    */
    function getIndexOfTeam(team, data)
    {
        for(var i = 0; i < data.length; i++){
            if(data[i].team == team){
                return i;
            }
        }
        return -1;
    }

    /*
        returns if the team is in the data array
    */
    function isInData(team, data){
        for(var i = 0; i < data.length; i++){
            if(data[i].team == team){
                return true;
            }
        }
        return false;
    }

    /*
        starts preparing to build a treemap
        creates a hierarchy object and nests it into a treemap object
        treemapData is either the home or away array
        svgID is the ID of the svg element in the DOM
    */
    function buildTreemap(treemapData, svgID)
    {
        //console.log(treemapData);
        var rankingObject = {"children": treemapData}

        var svg = d3.select(svgID),
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

    /*
        adds a treemap to the DOM
        svg is the svg element from the DOM where the treemap is build into
        data is the children array from the treemap object
    */
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
            });

        var labels = svg.selectAll("g")
            .append("text")
            .text(function(d){
                return d.data["team"];
            })
            .attr("dy", "1em")
            .attr("dx", "1em")
            .attr("width", function(d){
                return d.x1 - d.x0;
            });

        var numbers = svg.selectAll("g")
            .append("text")
            .text(function(d){
                return d.data["value"];
            })
            .attr("dy", "2.5em")
            .attr("dx", "2em")
            .attr("width", function(d){
                return d.x1 - d.x0;
            });
    }

    /*
        selects all g-elements in both treemaps and calls the method to set
        the button functionality
    */
    function setGElementsAsButtons()
    {
        var homeG = $(treemapHomeID).find("g");
        var awayG = $(treemapAwayID).find("g");
        setButtonFunctionality(homeG);
        setButtonFunctionality(awayG);
    }

    /*
        sets the button functionality for every element in the passed list
    */
    function setButtonFunctionality(list){
        for(var i = 0; i < list.length; i++)
        {
            list.eq(i).on('click', function(){
                dragIntoCompareArea($(this));
            });
        }
    }

    /*
        extracts information of the passed object and saves them
    */
    function saveInformation($g){
        var transform = $g.attr("transform");
        var $rect = $g.find("rect");
        var height = $rect.attr("height");
        var width = $rect.attr("width");

        saveCompareAreaObjectsInformation.push({"transform": transform, "heigth": height, "width": width})
    }

    /*
        this function is called when a element in one of the treemaps is clicked
        $g is the clicked element
        the function adds the clicked element to the compare area (if it's not full or the element already in it)
    */
    function dragIntoCompareArea($g){
        saveInformation($g);
        var value = $g[0]["__data__"].value;
        var transform = $g.attr("transform");
        var $rect = $g.find("rect");
        var height = $rect.attr("height");
        var width = $rect.attr("width");
        var newRectBounds = recalculateArea(width, height);

        if($compareAreaOneTeam == undefined || $compareAreaOneTeam[0] != $g[0]){
            if($compareAreaOneTeam == undefined && ($compareAreaTwoTeam == undefined || $compareAreaTwoTeam[0] != $g[0])){
                var gAim = d3.select("#compareTeamOne");
                gAim.attr("transform", "translate(0,0)");
                gAim.select("rect").attr("height", newRectBounds[1]).attr("width", value * singleUnitWidth);
                $compareAreaOneTeam = $g;
                addSelectedClass($g.find("rect"));
            } else if ($compareAreaTwoTeam == undefined || $compareAreaTwoTeam[0] != $g[0]) {
                if ($compareAreaTwoTeam == undefined && $compareAreaOneTeam[0] != $g[0]){
                    var gAim = d3.select("#compareTeamTwo");
                    gAim.attr("transform", "translate(0," + (compareAreaElementHeight + 10) + ")");
                    gAim.select("rect").attr("height", newRectBounds[1]).attr("width", value * singleUnitWidth);
                    $compareAreaTwoTeam = $g;
                    addSelectedClass($g.find("rect"));
                }
            } else {
                removeSelectedClass($g.find("rect"));
                removeFromCompareArea(1);
            }
        } else {
            removeSelectedClass($g.find("rect"));
            removeFromCompareArea(0);
        }
    }

    /*
        removes a rect from the compare area and clears the variable in which the team was saved
        number is 0 or 1 and indicates whether the first or the second rect should be removed
    */
    function removeFromCompareArea(number){
        var gAim;
        switch(number)
        {
            case 0:
                gAim = d3.select("#compareTeamOne");
                $compareAreaOneTeam = undefined;
                break;
            case 1:
                gAim = d3.select("#compareTeamTwo");
                $compareAreaTwoTeam = undefined;
                break;
            default:
                console.log("number error");
        }
        gAim.select("rect").attr("height", 0).attr("width", 0);
    }

    /*
        recalculates the initial area size to fit the rect it into the compare area
    */
    function recalculateArea(x, y){
        var xNew, yNew;
        var oldAreaSize = x * y;
        yNew = compareAreaElementHeight;
        xNew = oldAreaSize / yNew;

        return [xNew, yNew];
    }

    function addSelectedClass($element){
        $element.addClass("selected");
    }

    function removeSelectedClass($element){
        $element.removeClass("selected");
        console.log($element);
    }


    loadJSON();
}());
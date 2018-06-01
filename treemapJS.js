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
    var compareAreaTeamOneID = "#compareTeamOne";
    var compareAreaTeamOneNameID = "#teamOneName";
    var compareAreaTeamOneValueID = "#teamOneValue";
    var compareAreaTeamTwoID = "#compareTeamTwo";
    var compareAreaTeamTwoNameID = "#teamTwoName";
    var compareAreaTeamTwoValueID = "#teamTwoValue";

    var compareAreaElementHeight = 50;
    var singleUnitWidth = 10;

    var yPositionFirstTeamNameInCompareArea = "-6px";
    var yPositionSecondTeamNameInCompareArea = "67px";
    var yPositionFirstTeamRectInCompareArea = 30;
    var yPositionSecondTeamRectInCompareArea = compareAreaElementHeight + 40;

    var xPositionSingleCompareTeam = 35;

    var widthCompareArea = 200;

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

    function setSVGSize(svg, width, height){
        svg.attr("width", width).attr("height", height);
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

        var svg = d3.select(svgID);
        var width = (($(window).width() - widthCompareArea) / 2) * 0.9;
        var height = 600.0;

        setSVGSize(svg, width, height);

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

        var images = svg.selectAll("g")
            .append("image")
            .attr("xlink:href", function(d){
                return "img/bayern3.png";
            })
            .attr("height", function(d){
                return (d.x1 - d.x0 < d.y1 - d.y0) ? (d.y1 - d.y0) : (d.x1 - d.x0);
            })
            .attr("width", function(d){
                return (d.x1 - d.x0 > d.y1 - d.y0) ? (d.x1 - d.x0) : (d.y1 - d.y0);
            });

        var rectangles = svg.selectAll("g")
            .append("rect")
            .attr("height", function(d){
                return d.y1 - d.y0;
            })
            .attr("width", function(d){
                return d.x1 - d.x0;
            });

        /*var labels = svg.selectAll("g")
            .append("text")
            .text(function(d){
                return d.data["team"];
            })
            .attr("dy", "1em")
            .attr("dx", "1em")
            .attr("width", function(d){
                return d.x1 - d.x0;
            });*/

        var numbers = svg.selectAll("g")
            .append("text")
            .text(function(d){
                return d.data["value"];
            })
            .attr("dy", "1em")
            .attr("dx", function(d){
                return ((d.x1 - d.x0) / 2) + "px";
            })
            .attr("font-weight", "bold")
            .attr("font-size", function(d){
                return (25 + d.data["value"]) + "px";
            })
            .attr("class", "value");

        
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
        the function calls the method to add the clicked element to the compare area (if it's not full or the element already in it)
    */
    function dragIntoCompareArea($g){
        saveInformation($g);

        if($compareAreaOneTeam == undefined || $compareAreaOneTeam[0] != $g[0]){
            if($compareAreaOneTeam == undefined && ($compareAreaTwoTeam == undefined || $compareAreaTwoTeam[0] != $g[0])){
                setSingleCompareTeam($g, true, compareAreaTeamOneID, compareAreaTeamOneNameID, compareAreaTeamOneValueID, yPositionFirstTeamRectInCompareArea, yPositionFirstTeamNameInCompareArea);
            } else if ($compareAreaTwoTeam == undefined || $compareAreaTwoTeam[0] != $g[0]) {
                if ($compareAreaTwoTeam == undefined && $compareAreaOneTeam[0] != $g[0]){
                    setSingleCompareTeam($g, false, compareAreaTeamTwoID, compareAreaTeamTwoNameID, compareAreaTeamTwoValueID, yPositionSecondTeamRectInCompareArea, yPositionSecondTeamNameInCompareArea);
                }
            } else {
                removeSelectedClass($g.find("rect"));
                removeFromCompareArea(false, compareAreaTeamTwoID, compareAreaTeamTwoNameID, compareAreaTeamTwoValueID);
            }
        } else {
            removeSelectedClass($g.find("rect"));
            removeFromCompareArea(true, compareAreaTeamOneID, compareAreaTeamOneNameID, compareAreaTeamOneValueID);
        }
    }

    /*
        adds the clicked element to the compare Area
        $g is the clicked element
        isFirstTeam indicates whether it should be the first or the second team in the compareArea
        gID is the ID of the g-element in the compare area
        textNameID is the ID of the text element (in the compare area) in which the name of the specified team should be placed
        textValueID is the ID of the text element (in the compare area) in which the amount of won games of the specified team should be placed
        yPositionG is the y-position of the the specified g-element
        yPositionName is the y-position of the team's name
    */
    function setSingleCompareTeam($g, isFirstTeam, gID, textNameID, textValueID, yPositionG, yPositionName){
        var $gData = $g[0]["__data__"];
        var value = $gData.value;
        var teamName = $gData["data"].team;
        
        var gAim = d3.select(gID);
        gAim.attr("transform", "translate(" + xPositionSingleCompareTeam + "," + yPositionG + ")");
        gAim.select("rect").attr("height", compareAreaElementHeight).attr("width", value * singleUnitWidth);
        gAim.select(textNameID).text(teamName).attr("width", $gData.x1 - $gData.x0).attr("dy", yPositionName);
        gAim.select(textValueID).text(value).attr("dy", "1.6em").attr("dx", (value * singleUnitWidth + 3) + "px");
        if(isFirstTeam){
            $compareAreaOneTeam = $g;
        } else {
            $compareAreaTwoTeam = $g;
        }
        addSelectedClass($g.find("rect"));
    }

    /*
        removes a rect from the compare area and clears the variable in which the team was saved
        number is 0 or 1 and indicates whether the first or the second rect should be removed
    */
    function removeFromCompareArea(isFirstTeam, gID, textNameID, textValueID){
        var gAim;
        gAim = d3.select(gID);
        gAim.select("rect").attr("height", 0).attr("width", 0);
        gAim.select(textNameID).text("");
        gAim.select(textValueID).text("");

        if(isFirstTeam){
            $compareAreaOneTeam = undefined;
        } else {
            $compareAreaTwoTeam = undefined;
        }
    }

    /*
        recalculates the initial area size to fit the rect it into the compare area
    
    function recalculateArea(x, y){
        var xNew, yNew;
        var oldAreaSize = x * y;
        yNew = compareAreaElementHeight;
        xNew = oldAreaSize / yNew;

        return [xNew, yNew];
    }*/

    function addSelectedClass($element){
        $element.addClass("selected");
    }

    function removeSelectedClass($element){
        $element.removeClass("selected");
    }


    loadJSON();
}());
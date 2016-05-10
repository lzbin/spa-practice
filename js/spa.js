/*jslint
browser : true, continue : true,
devel : true, nomen : true, plusplus : true,
regexp : true, solppy : true, vars : true,
white : true
*/
/*global jQuery*/
// Module /spa/
// Provides chat slider capability
//
var spa = (function($){
    // Module scope variables
    // Set constants
    var configMap = {
        extended_height: 434,
        extended_title : 'Click to retract',
        retracted_height: 16,
        retracted_title: 'Click to extend',
        template_html: '<div class="spa-slider"></div>'
    },
    $chatSlider,toggleSlider,onClickSlider,initModule;

    //DOM method /toggleSlider/
    //alternates slider height
    //
    toggleSlider = function(){
        var slider_height = $chatSlider.height();

        //extend slider if fully retracted
        if(slider_height === configMap.retracted_height){
            $chatSlider
                .animate({height:configMap.extended_height})
                .attr('title',configMap.extended_title);
            return true;
        }
        //retract slider if fully extended
        else if(slider_height == configMap.extended_height){
            $chatSlider
                .animate({height:configMap.retracted_height})
                .attr('title',configMap.retracted_title);
            return true;
        }
        //do not take action if slider is in transition
        return false;
    };
    //Event handler /onClickSlider/
    //receives click event and calls toggleSlider
    //
    onClickSlider = function(){
        toggleSlider();
        return false;
    };
    //Public method /initModule
    //sets initial state and provides feature
    //
    initModule = function($container){
        spa.shell.initModule($container);
    };
    return {initModule:initModule};
})(jQuery);
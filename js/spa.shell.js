/*
*  spa.shell.js
*  Shell module for SPA
*/
/*global $,spa*/
spa.shell = (function(){
    var configMap = {
            anchor_schema_map: {
                chat : {open : true,closed : true}
            },
            main_html : '<div class="spa-shell-head">\
                            <div class="spa-shell-head-logo"></div>\
                            <div class="spa-shell-head-acct"></div>\
                            <div class="spa-shell-head-search"></div>\
                        </div>\
                        <div class="spa-shell-main">\
                            <div class="spa-shell-main-nav"></div>\
                            <div class="spa-shell-main-content"></div>\
                        </div>\
                        <div class="spa-shell-foot"></div>\
                        <div class="spa-shell-chat"></div>\
                        <div class="spa-shell-modal"></div>',
            chat_extend_time:1000,
            chat_retract_time:300,
            chat_extend_height:450,
            chat_retract_height:15,
            chat_extended_title: 'Click to retract',
            chat_retracted_title: 'Click to extend'
        },
        stateMap = {
            $container : null,
            anchor_map : {},
            is_chat_retracted : true
        },
        jqueryMap = {},
        copyAnchorMap,
        setJqueryMap,
        toggleChat,
        changeAnchorPart,
        onHashchange,
        onClickChat,
        initModule;

    // Returns copy of stored anchor map;minimizes overhead
    copyAnchorMap = function(){
        return $.extend(true,{},stateMap.anchor_map);
    };

    //Begin DOM method /setJqueryMap/
    setJqueryMap = function(){
        var $container = stateMap.$container;
        jqueryMap = {
            $container : $container,
            $chat : $container.find('.spa-shell-chat')
        }
    };
    //End DOM method /setJqueryMay/
    //Begin DOM method /toggleChat/
    //Purpose : Extends or retracts chat slider
    toggleChat = function(do_extend,callback){
        var px_chat_ht = jqueryMap.$chat.height(),
            is_open = px_chat_ht === configMap.chat_extend_height,
            is_closed = px_chat_ht === configMap.chat_retract_height,
            is_sliding = !is_open && !is_closed;
        //avoid race condition
        if(is_sliding){return false;}
        //Begin extend chat slider
        if(do_extend){
            jqueryMap.$chat.animate({height:configMap.chat_extend_height},
            configMap.chat_extend_time,
            function(){
                jqueryMap.$chat.attr('title',configMap.chat_extended_title);
                stateMap.is_chat_retracted = false;
                if(callback){callback(jqueryMap.$chat);}
            });
            return true;
        }
        //End extend chat slider
        //Begin retract chat slider
        jqueryMap.$chat.animate({height:configMap.chat_retract_height},
            configMap.chat_retract_time,
            function(){
                jqueryMap.$chat.attr('title',configMap.chat_retracted_title);
                stateMap.is_chat_retracted = true;
                if(callback){callback(jqueryMap.$chat);}
            }
        );
        return true;
        // End retract chat slider
    };
    //Begin DOM method /changeAnchorPart/
    changeAnchorPart = function(arg_map){
        var anchor_map_revise = copyAnchorMap(),
            bool_return = true,
            key_name,
            key_name_dep;
    //    Begin merge changes into anchor map
        for(key_name in arg_map){
            if(arg_map.hasOwnProperty(key_name)){
                if(key_name.indexOf('_') === 0){continue ;}
                anchor_map_revise[key_name] = arg_map[key_name];
                key_name_dep = '_'+ key_name;
                if(arg_map[key_name_dep]){
                    anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
                }else{
                    delete anchor_map_revise[key_name_dep];
                    delete anchor_map_revise['_s'+key_name_dep];
                }
            }
        }
        //  End merge changes into anchor map
        // Begin attempt to update URI;revert if not successful
        try{
            $.uriAnchor.setAnchor(anchor_map_revise);
        }catch(error){
            //replace URI with existing state
            $.uriAnchor.setAnchor(stateMap.anchor_map,null,true);
            bool_return = false;
        }
        // End attempt to update URI...
        return bool_return;
    };
    // End DOM method /changeAnchorPart/
    // Begin Event handler /onHashchange/
    onHashchange = function(event){
        var anchor_map_previous = copyAnchorMap(),
            anchor_map_proposed,
            _s_chat_previous,
            _s_chat_proposed,
            s_chat_proposed;

        //attempt to parse anchor
        try{anchor_map_proposed = $.uriAnchor.makeAnchorMap();}
        catch(error){
            $.uriAnchor.setAnchor(anchor_map_previous,null,true);
            return false;
        }
        stateMap.anchor_map = anchor_map_proposed;
        //convenience vars
        _s_chat_previous = anchor_map_previous._s_chat;
        _s_chat_proposed = anchor_map_proposed._s_chat;

        //Begin adjust chat component if changed
        if(!anchor_map_previous || _s_chat_previous !== _s_chat_proposed){
            s_chat_proposed = anchor_map_proposed.chat;
            switch (s_chat_proposed){
                case 'open':
                    toggleChat(true);
                    break;
                case 'closed':
                    toggleChat(false);
                    break;
                default :
                    toggleChat(false);
                    delete anchor_map_proposed.chat;
                    $.uriAnchor.setAnchor(anchor_map_proposed,null,true);
            }
        }

        // End adjust chat compont if changed
        return false;
    };
    //End Event handler /onHashchange/
    onClickChat = function(event){
        changeAnchorPart({chat:(stateMap.is_chat_retracted?'open':'closed')});
        return false;
    };
    //End DOM method /toggleChat/
    //--------------END MODULE SCOPE VARIABLES---------------
    //-----------------BEGIN UTILITY METHODS-----------------
    //-------------------END UTILITY METHODS-----------------
    //-------------------BEGIN DOM METHODS-------------------
    // End Public method /initModule/
    initModule = function ($container) {
        stateMap.$container = $container;
        $container.html(configMap.main_html);
        setJqueryMap();

        stateMap.is_chat_retracted = true;
        jqueryMap.$chat
            .attr('title',configMap.chat_retracted_title)
            .click(onClickChat);
        // configure uriAnchor to use out schema
        $.uriAnchor.configModule({
            schema_map: configMap.anchor_schema_map
        });
        $(window).on('hashchange',onHashchange).trigger('hashchange');
    };

    //End PUBLIC method /initModule/
    return {initModule : initModule};
    //-----------------END PUBLIC METHODS------------------
})();
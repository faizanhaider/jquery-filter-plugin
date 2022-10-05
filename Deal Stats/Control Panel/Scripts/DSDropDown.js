

; (function ($) {

    // default settings
    var DEFAULT_SETTINGS = {
        checkboxes: true, // by default show items with checkboxes
        url: null, // url to fetch data from
        categoriesUrl: null, // categories tree
        ellipseSize: 25, // Ellipse Size for text in selected item
        dropdownPosition: 'bottom', // where to show the dropdown, default is at bottom of box, Possible values are: left, right, bottom, top
        idAttributeName: 'id', // default attribute name for id
        lableAttributeName: 'label', // default attribute name for id
        extraContainer: null,
        afterSelected: null, // meth0d to execute after selection
        readonly: false,
        singlSelection: false,
        inputData: '',
        autoCompleteSelector: '',
        autoCompleteUrl: '',
        autoCompleteTableName: '',
        autoCompleteParent: '',
        selectValues: []
    };

    // exposed methods
    var methods = {
        init: function (options) {
            var settings = $.extend({}, DEFAULT_SETTINGS, options || {});

            return this.each(function () {
                $(this).data("dropdown", new $.dropdown(this, settings));

                if (settings.data && $.isArray(settings.data)) {
                    $(this).data('dropdown').fillData(settings.data);
                }
            });
        },

        getData: function () {
            return this.data("dropdown").getData();
        },

        getSelectedText: function () {
            return this.data("dropdown").getSelectedText();
        },

        getSelected: function () {
            //return this.data("dropdown") != undefined ? this.data("dropdown").getSelected() : '';
            return this.data("dropdown") && this.data("dropdown").getSelected() ? this.data("dropdown").getSelected() : '';
        },

        select: function (id) {
            return this.data("dropdown").select(id);
        },

        clear: function () {
            var dropdown = this.data("dropdown");
            if (dropdown && $.isFunction(dropdown.clear)) {
                return dropdown.clear();
            }
        }
    };


    // DS Drop Down
    $.fn.DSDropDown = function (method) {
        // Method calling and initialization logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            return methods.init.apply(this, arguments);
        }
    };

    $.dropdown = function (input, options) {

        // Initialization
        input = $(input);

        // apply css
        if (options.css) input.css(options.css);

        var dropdownButton = input.find('div.box td.button img');
        $(dropdownButton).unbind('click');

        // Control Data
        this.data = null;

        // load Data
        var ajax_params = {};
        ajax_params.url = options.url;
        ajax_params.extraContainer = options.extraContainer,
            ajax_params.type = 'POST';
        ajax_params.contentType = 'application/json; charset=utf-8;';
        ajax_params.dataType = 'json';
        ajax_params.control = input;
        ajax_params.data = options.inputData;
        ajax_params.dropdownOptions = options;
        ajax_params.success = function (response) {
            $(input).data('dropdown').data = response.d;
            renderData(response.d ? response.d : [], this.control, this.dropdownOptions);
        };

        if (options.selectValues != undefined && options.selectValues.length > 0) {
            var me = this;
            ajax_params.complete = function (response, status) {
                $.each(options.selectValues, function (index, data) {
                    selectField(data);
                });
            }
        }

        if (options.url) {
            $.ajax(ajax_params);
        }

        // toggle the visibility of drop box
        $(dropdownButton).click(function (event) {

            if (options.readonly === true) return;

            var dropdown = input.closest('div.mna_dropdown').find('div.dropdown');

            if (options.dropdownPosition && $.isFunction(options.dropdownPosition)) {

                options.dropdownPosition.call(null, dropdown, input.closest('div.mna_dropdown').find('div.box'));

            } else {
                switch (dropdown.css('display')) {
                    case 'none':
                        switch (options.dropdownPosition) {
                            case 'left':
                                dropdown.css({
                                    display: 'block'
                                });
                                break;
                            case 'top':
                                dropdown.css({
                                    top: '25px',
                                    display: 'block'
                                });
                                break;
                            case 'right':
                                dropdown.css({
                                    top: '0px',
                                    left: input.closest('div.mna_dropdown').find('div.box').outerWidth(true) + 'px',
                                    display: 'block'
                                });
                                break;
                            default:
                                dropdown.css({
                                    display: 'block'
                                });
                                break;
                        }
                        break;
                    default:
                        dropdown.css('display', 'none');
                }
            }

            event.stopPropagation();
        });

        input.click(function (event) {
            event.stopPropagation();
        });


        // selected ids

        renderData = function (data, control, dropdownOptions) {
            $(control).find('div.tree').empty();
            var html = renderRecursive(data, dropdownOptions);
            $(control).find('div.tree').html(html);

            $(control).find('div.tree img').unbind("click", imageSliderList).bind("click", imageSliderList);

            $(control).find('div.tree img').next('li').find('ul').hide();

            if (dropdownOptions.readonly === false) {
                $(control).find('div.tree input').bind('click', { options: dropdownOptions }, checkboxClicked);
                //Tweak for drop down tree slide up
            }
        };

        imageSliderList = function (event) {
            $(this).next('li').find('ul').slideToggle();
        },

            checkboxClicked = function (event) {

                // this refers to dropdown options
                var options = event.data.options;

                var text = $(this).attr('typename');
                var id = $(this).attr('id');
                var box = null;
                box = $(this).closest('.mna_dropdown').find('.token-input-list-facebook');
                if (box == undefined)
                    box = $(this).closest('.mna_dropdown').find('.tokens');

                if (options.singlSelection === true) {
                    box.empty();
                }
                //            if(!ajax_params.itemContainerSelected && !ajax_params.itemContainerSuggested) 
                //            {
                //                box = $(this).closest('.mna_dropdown').find('.tokens') ;
                //            }
                //            else if(ajax_params.itemContainerSelected)
                //            {
                //               box = $(this).closest('.mna_dropdown').find('.tokens') ;
                //               box.push(ajax_params.itemContainerSelected[0]);
                //            }
                //            else
                //            {
                //                box = $(this).closest('.mna_dropdown').find('.tokens') ;
                //               box.push(ajax_params.itemContainerSuggested[0]);
                //            }

                if ($(this).is(':checked')) {

                    if (options.singlSelection === true) {
                        $('input[id^="' + options.idPrefix + '"]').prop('checked', false);
                        $(this).prop('checked', true);
                    }

                    createToken(text, id, box, options.extraContainer, options);
                    if (options.afterSelected && $.isFunction(options.afterSelected)) {
                        options.afterSelected(true, this);
                    }
                } else {
                    if (options.singlSelection === true) {
                        $('input[id^="' + options.idPrefix + '"]').prop('checked', false);
                    }

                    unselectToken(id, $(this).attr(options.typeid));
                    if (options.afterSelected && $.isFunction(options.afterSelected)) {
                        options.afterSelected(false, this);
                    }
                }
            };

        createToken = function (text, id, box, extraBox, dropDownOpt) {
            // generate LI html for selected token
            var token = '<li title="' + text + '" class="token-input-token-facebook"><p>' + Ellipse(text, options.ellipseSize) + '</p><span class="token-input-delete-token-facebook" cbid="' + id + '">x</span></li>';

            // inject the generated LI in tokens UL
            $(box).prepend(token);
            if (extraBox) {
                $(extraBox).prepend(token);
            }

            // bind close button of token (x)
            $('span[cbid="' + id + '"]').bind('click', { options: dropDownOpt }, tokenCloseClicked);
            //$(control).find('div.tree input').bind('click', { options: dropDownOpt }, checkboxClicked);
        };

        tokenCloseClicked = function (event) {

            // this refers to dropdown options
            var options = event.data.options;

            if (options.readonly === true) return;

            unselectToken($(this).attr('cbid'));
            if (options.afterSelected && $.isFunction(options.afterSelected)) {
                options.afterSelected(false);
            }
        };

        unselectToken = function (id, selectedValue) {
            // delete the token LI
            $('span[cbid="' + id + '"]').closest('li').remove();

            // uncheck related checkbox
            $("#" + id).prop('checked', false);
        }

        renderRecursive = function (data, dropdownOptions) {

            var html = '';

            $.each(data, function (index, item) {

                var id = dropdownOptions.idPrefix + item[dropdownOptions.idAttributeName];
                var children = [];

                if (item.children && item.children.length && item.children.length > 0) {
                    var childrenHtml = renderRecursive(item.children, dropdownOptions);

                    html += '<img style="cursor: pointer; margin-left: -12px; margin-right: -4px; float: left;" src="images/expand-plus.png">\
                        <li><input typename="' + item[dropdownOptions.lableAttributeName] + '" ' + dropdownOptions.typeid + '="' + item[dropdownOptions.idAttributeName] + '" id="' + id + '" type="checkbox"><label for="' + id + '">' + item[dropdownOptions.lableAttributeName] + '</label>' + childrenHtml + '</li>';

                } else {
                    html += '<li><input typename="' + item[dropdownOptions.lableAttributeName] + '" ' + dropdownOptions.typeid + '="' + item[dropdownOptions.idAttributeName] + '" id="' + id + '" type="checkbox" /><label for="' + id + '">' + item[dropdownOptions.lableAttributeName] + '</label></li>';
                }
            });

            return '<ul>' + html + '</ul>';
        };

        selectField = function (data) {
            // get the checkbox id
            var selector = data.selector;
            var id = data.id;
            var inputData = $(data.input);
            var chb = $(inputData).find('#' + selector);

            var text = $(chb).attr('typename');
            var id = $(chb).attr('id');
            var box = $(chb).closest('.mna_dropdown').find('.token-input-list-facebook');

            createToken(text, id, box, null, options);
            $(chb).prop('checked', true);
        };

        this.getData = function () {
            return getData();
        };

        this.getSelected = function () {
            return $.map($(input).find('input:checked'), function (item) {
                return $(item).attr(options.typeid);
            });
        };

        this.getSelectedText = function () {
            return $.map($(input).find('input:checked'), function (item) {
                return $(item).attr('typename');
            });
        };

        this.select = function (id) {
            // get the checkbox id
            var filter = options.idPrefix + id;
            var chb = $(input).find('#' + filter);


            var text = $(chb).attr('typename');
            var id = $(chb).attr('id');
            var box = $(chb).closest('.mna_dropdown').find('.token-input-list-facebook');

            createToken(text, id, box, null, options);
            $(chb).prop('checked', true);
        };
        this.clear = function () {

            $.each($(input).find('input:checked'), function (index, item) {

                unselectToken($(item).attr('id'), $(item).attr(options.typeid));
            });
        }
        this.fillData = function (data) {

            this.clear();
            renderData(data, $(input), options);
        }

        getData = function () {
            return $(input).data('dropdown').data;
        };
    };

    // Utility Methods.
    // If user clicked anywhere on document except dropdown close the dropdowns.
    $('html').click(function () {
        $('div.mna_dropdown div.dropdown').css('display', 'none');
    });

}(jQuery));


// test3
